/**
 * THE WIRE — voice profiles + template banks.
 *
 * Layer 2+3 of the post engine (spec: docs/design/THE_WIRE_SOCIAL_NETWORK.md):
 * the game state decides WHAT happened; these voices decide HOW it gets said.
 * Every account type writes differently. Templates are filled from structured
 * facts — described moments and reactions ONLY, never invented rap bars.
 *
 * Template variables: {winner} {loser} {round} {league} {tag} {crowd}
 */

export type PostAspect =
  | 'clean_sweep'      // 3-0, no debate
  | 'debatable'        // 2-1, argue about it
  | 'robbery'          // 2-1 where the loser had the crowd
  | 'choke'            // somebody froze
  | 'haymaker'         // a moment LANDED (crowd-gated)
  | 'cold_room'        // a round the crowd sat on
  | 'gloat'            // the winner's own account talking
  | 'league_result';   // official announcement

export interface VoiceBank {
  /** account.voice_profile this bank belongs to */
  profile: string;
  templates: Partial<Record<PostAspect, string[]>>;
}

export const VOICE_BANKS: VoiceBank[] = [
  {
    profile: 'fan_purist',
    templates: {
      clean_sweep: [
        'clean 30. no debate. {winner} smoked that 🚬',
        'pen won tonight. {winner} was three rounds deep in material and it showed.',
      ],
      debatable: [
        'the room had {winner} but I had {loser} 2-1. debate me',
        '2-1 either way. THIS is what the culture is about. {tag}',
      ],
      robbery: [
        '{loser} had the crowd all night and still lost the cards?? make it make sense',
        'watch it back with the sound off and tell me {winner} won. I\'ll wait.',
      ],
      choke: ['I don\'t celebrate chokes but round {round}... you cannot come back from that'],
      haymaker: ['round {round} from {winner} was DISGUSTING. that\'s going on the year-end list'],
      cold_room: ['you could hear a pin drop in {loser}\'s round {round} 🧊 rough night'],
    },
  },
  {
    profile: 'fan_hype',
    templates: {
      clean_sweep: ['{winner} is DIFFERENT. {loser} never stood a chance tonight 😤 {tag}'],
      debatable: ['{tag} was a MOVIE. run it back immediately'],
      robbery: ['THEY ROBBED {loser}. I was THERE. the building was shaking 😡'],
      haymaker: [
        'that moment in round {round} had the whole room on their feet, {winner} is HIM',
        'ROUND {round}. THE ROOM EXPLODED. {winner} is that one. {tag}',
      ],
      choke: ['somebody check on {loser} after round {round}... brutal'],
    },
  },
  {
    profile: 'fan_streets',
    templates: {
      clean_sweep: ['{winner} put hands on that boy tonight. street certified.'],
      debatable: ['{loser} was walking him down all night, cards said otherwise. block had it different'],
      haymaker: ['round {round} pressure was REAL. {winner} meant every word of that'],
      cold_room: ['{loser} lost the room in round {round} and never got it back'],
    },
  },
  {
    profile: 'fan_eyewitness',
    templates: {
      clean_sweep: ['was in the building. {winner} controlled the room from the first thirty seconds. clear as day.'],
      debatable: ['live it felt closer than the cards. section I was in had {loser} up after two.'],
      robbery: ['I watched every face in that room during round {round}. the crowd did NOT agree with those cards.'],
      cold_room: ['the silence in {loser}\'s round {round} was uncomfortable to sit through, not gonna lie'],
    },
  },
  {
    profile: 'fan_contrarian',
    templates: {
      clean_sweep: ['ngl I had it closer than the cards did 👀 {winner} took it but 30 is disrespectful to {loser}'],
      debatable: ['unpopular opinion: neither of them had a CLEAR round. weakest card of the night'],
      robbery: ['everybody crying robbery... {winner} won the rounds that mattered. crowd score isn\'t the scorecard.'],
      haymaker: ['one moment doesn\'t win a battle. y\'all overrate round {round} because the room was loud.'],
    },
  },
  {
    profile: 'fan_drama',
    templates: {
      debatable: ['word is {loser}\'s camp is HEATED about those cards... this isn\'t over 👀 {tag}'],
      robbery: ['sources telling me {loser} isn\'t taking this quietly. rematch talk already 👀'],
      choke: ['the clip of round {round} is already in every group chat. career-defining, wrong way.'],
      gloat: ['{winner} posting like THAT after the battle?? {loser} not gonna let this slide'],
    },
  },
  {
    profile: 'fan_casual',
    templates: {
      clean_sweep: ['first battle I watched in a minute. {winner} seemed way sharper, casual take 🤷'],
      debatable: ['waiting on the full tape before I give a verdict, clips don\'t tell the story'],
      haymaker: ['I don\'t follow this deep but even I felt round {round}. wow.'],
    },
  },
  {
    profile: 'rumor_anon',
    templates: {
      debatable: ['heard the judges were arguing in the back for twenty minutes before those cards came out. just saying.'],
      robbery: ['somebody who was in the room says a league official was lobbying for {winner} between rounds. allegedly.'],
      choke: ['being told {loser} was dealing with something heavy before the battle. explains round {round}. allegedly.'],
      gloat: ['{winner}\'s camp was promised something extra if they won tonight. can\'t say who told me. allegedly.'],
    },
  },
  {
    profile: 'analyst_measured',
    templates: {
      clean_sweep: ['{winner} over {loser}, 3-0. Round-by-round control, no real swing moments against. The gap was preparation.'],
      debatable: ['{winner} edges it 2-1. Round {round} decided it — momentum, crowd, and material all peaked at once.'],
      robbery: ['Cards read {winner} 2-1, crowd metrics favored {loser}. This is exactly the judging-criteria debate the scene keeps refusing to settle.'],
      choke: ['The round {round} stall changes the whole card. You can\'t give away a round at this level and expect the other two to carry.'],
    },
  },
  {
    profile: 'analyst_moments',
    templates: {
      haymaker: ['Round {round}. THAT is the moment everyone will be quoting from this card. {winner} built the whole round to set it up.'],
      choke: ['Rewatched round {round} three times. It wasn\'t nerves — the material just wasn\'t there. Prep questions.'],
      debatable: ['{tag} delivered. Two legit swing rounds, one all-timer moment, and a debate that won\'t die this week.'],
      clean_sweep: ['No single flashpoint — {winner} just won every exchange by a little. Death by a thousand cuts battle.'],
    },
  },
  {
    profile: 'analyst_news',
    templates: {
      league_result: ['RESULT: {winner} def. {loser} ({league}). Full recap and round breakdown on the blog shortly.'],
      debatable: ['RESULT: {winner} def. {loser} 2-1 ({league}). Expect discourse — crowd and cards did not fully agree.'],
      clean_sweep: ['RESULT: {winner} def. {loser} 3-0 ({league}). One-way traffic by every measure we track.'],
    },
  },
  {
    profile: 'analyst_rankings',
    templates: {
      clean_sweep: ['A 30 at this level moves the board. {winner} enters the tier conversation; {loser} needs a statement next out.'],
      debatable: ['Rankings impact: minimal. A debatable 2-1 protects both stocks. The REMATCH is where the board moves.'],
      robbery: ['{loser}\'s stock goes UP in a loss. Crowd had them, cards didn\'t. Bookers watch crowds, not cards.'],
    },
  },
  {
    profile: 'meme_clips',
    templates: {
      haymaker: ['ROUND {round}. VOLUME UP. 🎬 the room = gone. {tag}'],
      choke: ['not the round {round} pause 💀💀 {loser} said absolutely nothing for a WEEK of seconds'],
      clean_sweep: ['{loser} checking the scorecard like it owes him money 💀 {tag}'],
      cold_room: ['crowd during {loser}\'s round {round}: 🦗🦗🦗'],
    },
  },
  {
    profile: 'meme_hype',
    templates: {
      haymaker: ['REWIND THAT. RIGHT NOW. round {round} {winner} 🔥🔥🔥 {tag}'],
      debatable: ['{tag} got the group chat FIGHTING. 2-1 battles are a public health hazard'],
      clean_sweep: ['{winner} woke up and chose VIOLENCE (competitively) {tag}'],
    },
  },
  {
    profile: 'meme_roast',
    templates: {
      choke: ['round {round} was so quiet my phone flashlight turned on by itself 💀'],
      cold_room: ['{loser} performing for a room full of mannequins in round {round} 🧊'],
      clean_sweep: ['{loser} took that 30 like an invoice. payment due immediately 💀'],
    },
  },
  {
    profile: 'promoter_hustle',
    templates: {
      debatable: ['THIS is why you buy the ticket. {tag} was worth every dollar. Who wants the rematch on MY stage? 📞'],
      robbery: ['Controversy sells tickets. {loser} vs anybody at my next card — the people DEMAND it. DMs open.'],
      haymaker: ['Moments like round {round} are why this culture eats. Book performers, not records.'],
    },
  },
  {
    profile: 'promoter_money',
    templates: {
      clean_sweep: ['Quietly watching {winner}\'s numbers after tonight. The market is about to correct. 📈'],
      robbery: ['A "robbery" narrative is worth more than a clean win. {loser} just got more valuable. That\'s the business.'],
    },
  },
  {
    profile: 'scout_eye',
    templates: {
      robbery: ['Cards aside: {loser}\'s crowd control tonight was top-tier for this level. Somebody should book that.'],
      haymaker: ['Round {round} construction from {winner} — setup, misdirection, detonation. That\'s teachable tape.'],
      clean_sweep: ['{winner} showed three different gears in three rounds. That\'s what moving up looks like.'],
    },
  },
  {
    profile: 'scout_grassroots',
    templates: {
      debatable: ['Both of these two came off open mics not long ago. Look at them now. The pipeline is REAL.'],
      cold_room: ['Tough night for {loser} but rooms like that build battlers. Everybody great has a silent-round story.'],
    },
  },
  {
    profile: 'league_official',
    templates: {
      league_result: [
        'OFFICIAL RESULT — {winner} defeats {loser}. Full battle available now. Thank you to everyone in the building. {tag}',
        'RESULT: {winner} def. {loser}. Next card announcement coming this week. {league} — where it matters.',
      ],
    },
  },
  {
    profile: 'battler_ego',
    templates: {
      gloat: [
        'They know what it was tonight. Cards said what the room already knew. Next.',
        'I told everybody what was going to happen and it happened. Who\'s next on the list? {tag}',
        'Respect to {loser} for showing up. That\'s the only respect being handed out tonight.',
      ],
    },
  },
];

export const VOICE_BANK_MAP: Map<string, VoiceBank> = new Map(
  VOICE_BANKS.map((b) => [b.profile, b])
);
