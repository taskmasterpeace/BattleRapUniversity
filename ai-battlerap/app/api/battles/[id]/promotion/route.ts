import { createClient } from '@supabase/supabase-js';
import { getUser } from '@/lib/db/server';
import { NextResponse } from 'next/server';

/**
 * POST /api/battles/[id]/promotion
 *
 * Executes one pre-battle promotion action (the promotion mini-game). The client
 * (PromotionClient.tsx) sends { actionType, targetScandalId } and expects back
 * { result: { success, title, crowdGain, newAuthenticity, keyQuote } }, branching
 * on result.success (full SUCCESS vs PARTIAL EFFECT).
 *
 * Design decision — the client UI advertises a SUCCESS-CHANCE ROLL, so we roll it
 * server-side using the SAME formula the client renders (so the % the player saw is
 * the % they actually get):
 *   - success  -> full crowd gain (upper end of the action's range) + full opponent
 *                 authenticity damage, both scaled by the recency (timing) multiplier.
 *   - failure  -> PARTIAL EFFECT: crowd gain heavily reduced, no opponent damage.
 * The player's OWN authenticity cost is deterministic (it's the price shown in the
 * modal, paid win or lose — the risk is in the reward, not the cost).
 *
 * Writes go through the service-role client: this touches the AI opponent's
 * authenticity and the shared battler_relationships row, both of which user-scoped
 * RLS would block. Ownership is verified manually below (matches the pattern in
 * app/api/battles/[id]/rounds/[roundNum]/content/route.ts).
 */

type ActionType =
  | 'interview'
  | 'twitter_callout'
  | 'scandal_exposure'
  | 'authenticity_attack'
  | 'angle_teaser';

type ActionConfig = {
  title: string;
  primary: string;
  pWeight: number;
  secondary: string;
  sWeight: number;
  gain: [number, number]; // crowd perception gain range
  cost: number; // player's own authenticity cost
  media: number; // 0-10
  oppDamage: number; // opponent authenticity damage on a landed hit
};

// Mirrors PROMOTION_ACTIONS in PromotionClient.tsx (crowd gain / cost / attribute
// weights) plus the opponent authenticity damage from promotionEngine's
// PROMOTION_IMPACT table. Keep these in sync with the client.
const ACTIONS: Record<ActionType, ActionConfig> = {
  interview: {
    title: 'MEDIA INTERVIEW',
    primary: 'stage_presence',
    pWeight: 0.7,
    secondary: 'crowd_control',
    sWeight: 0.3,
    gain: [5, 15],
    cost: 5,
    media: 6,
    oppDamage: 0,
  },
  twitter_callout: {
    title: 'TWITTER BEEF',
    primary: 'wordplay',
    pWeight: 0.6,
    secondary: 'creativity',
    sWeight: 0.4,
    gain: [10, 25],
    cost: 15,
    media: 8,
    oppDamage: 10,
  },
  scandal_exposure: {
    title: 'EXPOSE SCANDAL',
    primary: 'reputation',
    pWeight: 0.5,
    secondary: 'lyricism',
    sWeight: 0.5,
    gain: [15, 35],
    cost: 10,
    media: 9,
    oppDamage: 25,
  },
  authenticity_attack: {
    title: 'QUESTION CREDIBILITY',
    primary: 'creativity',
    pWeight: 0.6,
    secondary: 'stage_presence',
    sWeight: 0.4,
    gain: [8, 20],
    cost: 8,
    media: 7,
    oppDamage: 15,
  },
  angle_teaser: {
    title: 'TEASE YOUR ANGLES',
    primary: 'lyricism',
    pWeight: 0.7,
    secondary: 'flow',
    sWeight: 0.3,
    gain: [6, 18],
    cost: 3,
    media: 5,
    oppDamage: 5,
  },
};

// Media soundbites (NOT battle bars) — one lands, one flops, per action.
const KEY_QUOTES: Record<ActionType, { hit: string[]; miss: string[] }> = {
  interview: {
    hit: [
      "I said his name three times on camera. Now it's a headline.",
      'Told the blogs exactly how this ends. They ran with it.',
    ],
    miss: [
      'The interview aired at 2am. Nobody caught it.',
      "Gave 'em a soundbite and it never left the room.",
    ],
  },
  twitter_callout: {
    hit: [
      'Quote-tweeted the receipts. The timeline picked a side.',
      'One reply and their mentions turned into my promo.',
    ],
    miss: [
      "Posted it, deleted it, reposted it. The algorithm didn't care.",
      'The callout got twelve likes and a community note.',
    ],
  },
  scandal_exposure: {
    hit: [
      'Pulled the paperwork out in the open. Let the room do the math.',
      'Said the quiet part loud and the whole crowd gasped.',
    ],
    miss: [
      'Brought it up with no receipts. It slid right off.',
      "The dirt was old news — they'd already heard it.",
    ],
  },
  authenticity_attack: {
    hit: [
      "Asked one question they couldn't answer. That's all it took.",
      'Put their whole story on trial and the crowd was the jury.',
    ],
    miss: [
      'Swung at their credibility and hit air.',
      "The shot was there — it just didn't land clean.",
    ],
  },
  angle_teaser: {
    hit: [
      'Dropped one hint and the whole room started guessing.',
      'Teased the angle and watched the buzz build itself.',
    ],
    miss: [
      'Teased too much — gave the plan away for nothing.',
      'The hint fell flat; nobody bit.',
    ],
  },
};

/** Client's timing multiplier (PromotionClient.getRecencyMultiplier) — kept identical
 *  so the "TIMING MULTIPLIER" the player sees is the one actually applied. */
function recencyMultiplier(daysUntilBattle: number): number {
  if (daysUntilBattle <= 1) return 2.0;
  if (daysUntilBattle <= 3) return 1.5;
  if (daysUntilBattle <= 7) return 1.2;
  if (daysUntilBattle <= 14) return 1.0;
  return 0.7;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: battleId } = await params;

  let body: { actionType?: string; targetScandalId?: string | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const actionType = body.actionType as ActionType;
  if (!actionType || !(actionType in ACTIONS)) {
    return NextResponse.json({ error: 'Unknown promotion action.' }, { status: 400 });
  }
  const action = ACTIONS[actionType];

  // Service role: writes touch the AI opponent's authenticity and the shared
  // relationship row, which RLS scopes away from the player. Ownership verified below.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Load battle + both battlers.
  const { data: battle, error: battleError } = await supabase
    .from('battles')
    .select(
      `
      id,
      status,
      scheduled_at,
      player:battlers!battler_player_id(id, user_id, stage_name),
      opponent:battlers!battler_ai_id(id, stage_name)
    `
    )
    .eq('id', battleId)
    .single();

  if (battleError || !battle) {
    return NextResponse.json({ error: 'Battle not found' }, { status: 404 });
  }

  // Supabase types a hinted single-row join as an array — normalize to one object.
  const player = (Array.isArray(battle.player) ? battle.player[0] : battle.player) as
    | { id: string; user_id: string | null; stage_name: string }
    | null;
  const opponent = (Array.isArray(battle.opponent) ? battle.opponent[0] : battle.opponent) as
    | { id: string; stage_name: string }
    | null;

  if (!player || !opponent) {
    return NextResponse.json({ error: 'Battle is missing a battler.' }, { status: 400 });
  }

  // Ownership.
  if (player.user_id !== user.id) {
    return NextResponse.json({ error: 'Not your battle' }, { status: 403 });
  }

  // Promotion is a pre-battle phase — once the battle is on tape, it's closed.
  if (['completed', 'simulated', 'forfeit', 'declined'].includes(battle.status)) {
    return NextResponse.json(
      { error: "This battle's already settled — promotion's closed." },
      { status: 409 }
    );
  }

  // Player attributes drive the success roll (same source the client reads).
  const { data: attrs } = await supabase
    .from('battler_attributes')
    .select('writing, performance, personal')
    .eq('battler_id', player.id)
    .maybeSingle();

  const statOf = (attr: string): number => {
    const w = (attrs?.writing as Record<string, number> | null)?.[attr];
    const p = (attrs?.performance as Record<string, number> | null)?.[attr];
    const s = (attrs?.personal as Record<string, number> | null)?.[attr];
    return w ?? p ?? s ?? 5;
  };

  // Days until battle + recency multiplier (mirror the client's ceil()).
  const daysUntilBattle = Math.ceil(
    (new Date(battle.scheduled_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const recency = recencyMultiplier(daysUntilBattle);

  // Success probability — IDENTICAL formula to PromotionClient.calculateSuccessProbability
  // so the % the player saw before confirming is the % we roll against.
  const primaryStat = statOf(action.primary);
  const secondaryStat = action.secondary ? statOf(action.secondary) : 5;
  const weightedScore = primaryStat * action.pWeight + secondaryStat * (action.sWeight || 0);
  const baseProbability = 50 + (weightedScore - 5) * 8;
  const repBonus = (statOf('reputation') - 5) * 2;
  const successProb = Math.round(Math.min(95, Math.max(15, baseProbability + repBonus)));

  const success = Math.random() * 100 < successProb;

  // Crowd gain: roll within the action's range, apply timing. A failed roll still
  // lands a reduced "partial effect" (never zero, so the player sees a nudge).
  const rolledGain = randInt(action.gain[0], action.gain[1]);
  const fullGain = Math.max(1, Math.round(rolledGain * recency));
  const crowdGain = success ? fullGain : Math.max(1, Math.round(fullGain * 0.35));

  // Opponent authenticity damage — only on a landed hit, scaled by timing, and
  // amplified/nullified by a targeted scandal's verification status.
  let targetScandalId: string | null = null;
  let opponentDamage = 0;
  if (success && action.oppDamage > 0) {
    opponentDamage = Math.round(action.oppDamage * recency);

    if (actionType === 'scandal_exposure' && body.targetScandalId) {
      const { data: scandal } = await supabase
        .from('scandals')
        .select('id, battler_id, verification_status')
        .eq('id', body.targetScandalId)
        .maybeSingle();

      if (scandal && scandal.battler_id === opponent.id) {
        targetScandalId = scandal.id;
        if (scandal.verification_status === 'proven') {
          opponentDamage = Math.round(opponentDamage * 1.5); // receipts hit harder
        } else if (scandal.verification_status === 'disproven') {
          opponentDamage = 0; // exposing a debunked scandal does nothing
        }
      }
    }
  }

  // Player's own authenticity cost is deterministic (the advertised price).
  const authenticityCost = action.cost;

  // ---- Relationship upsert (ordered a<b to satisfy the CHECK constraint) ----
  const [aId, bId] =
    player.id < opponent.id ? [player.id, opponent.id] : [opponent.id, player.id];
  const playerIsA = aId === player.id;

  const { data: existingRel } = await supabase
    .from('battler_relationships')
    .select(
      'id, crowd_perception_a, crowd_perception_b, authenticity_score_a, authenticity_score_b'
    )
    .eq('battler_a_id', aId)
    .eq('battler_b_id', bId)
    .maybeSingle();

  // Current standings (defaults for a fresh, non-rivalry matchup: 50/50 · 100/100).
  const cpA = existingRel?.crowd_perception_a ?? 50;
  const cpB = existingRel?.crowd_perception_b ?? 50;
  const authA = existingRel?.authenticity_score_a ?? 100;
  const authB = existingRel?.authenticity_score_b ?? 100;

  const playerPerceptionOld = playerIsA ? cpA : cpB;
  const oppPerceptionOld = playerIsA ? cpB : cpA;
  const playerAuthOld = playerIsA ? authA : authB;
  const oppAuthOld = playerIsA ? authB : authA;

  // Player gains perception; opponent loses half of it (mirrors promotionEngine).
  const newPlayerPerception = Math.min(100, playerPerceptionOld + crowdGain);
  const newOppPerception = Math.max(0, oppPerceptionOld - Math.floor(crowdGain / 2));
  const newPlayerAuth = Math.max(0, playerAuthOld - authenticityCost);
  const newOppAuth = Math.max(0, oppAuthOld - opponentDamage);

  const perceptionAuthFields = {
    crowd_perception_a: playerIsA ? newPlayerPerception : newOppPerception,
    crowd_perception_b: playerIsA ? newOppPerception : newPlayerPerception,
    authenticity_score_a: playerIsA ? newPlayerAuth : newOppAuth,
    authenticity_score_b: playerIsA ? newOppAuth : newPlayerAuth,
  };

  if (existingRel) {
    const { error: relErr } = await supabase
      .from('battler_relationships')
      .update({ ...perceptionAuthFields, status: 'active', last_modified_at: new Date().toISOString() })
      .eq('id', existingRel.id);
    if (relErr) {
      console.error('Error updating relationship:', relErr);
      return NextResponse.json({ error: 'Failed to record promotion.' }, { status: 500 });
    }
  } else {
    const { error: relErr } = await supabase.from('battler_relationships').insert({
      battler_a_id: aId,
      battler_b_id: bId,
      origin_type: 'media',
      origin_story: `Rivalry framed in the pre-battle promotion run for ${player.stage_name} vs ${opponent.stage_name}.`,
      status: 'active',
      ...perceptionAuthFields,
    });
    if (relErr) {
      console.error('Error creating relationship:', relErr);
      return NextResponse.json({ error: 'Failed to record promotion.' }, { status: 500 });
    }
  }

  // Pick a soundbite for the outcome.
  const quotePool = success ? KEY_QUOTES[actionType].hit : KEY_QUOTES[actionType].miss;
  const keyQuote = quotePool[Math.floor(Math.random() * quotePool.length)];

  // Log the promotion event for the timeline.
  const { error: eventErr } = await supabase.from('promotion_events').insert({
    battle_id: battleId,
    battler_id: player.id,
    event_type: actionType,
    target_battler_id: opponent.id,
    target_scandal_id: targetScandalId,
    crowd_perception_delta: crowdGain,
    authenticity_damage: opponentDamage,
    media_coverage: action.media,
    title: `${action.title} · vs ${opponent.stage_name}`,
    description: success
      ? `${player.stage_name} ran a ${action.title.toLowerCase()} on ${opponent.stage_name} and the room moved.`
      : `${player.stage_name}'s ${action.title.toLowerCase()} on ${opponent.stage_name} only half-landed.`,
    key_quote: keyQuote,
    days_before_battle: daysUntilBattle,
    meta_json: { success, success_prob: successProb, authenticity_cost: authenticityCost, recency },
  });

  if (eventErr) {
    console.error('Error inserting promotion event:', eventErr);
    return NextResponse.json({ error: 'Failed to record promotion.' }, { status: 500 });
  }

  return NextResponse.json({
    result: {
      success,
      title: action.title,
      crowdGain,
      newAuthenticity: newPlayerAuth,
      keyQuote,
    },
  });
}
