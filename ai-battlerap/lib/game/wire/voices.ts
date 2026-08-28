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
    // Media/blogger voices post about many battles in one feed — keep these pools
    // WIDE so one handle doesn't tweet the same line about three different names.
    profile: 'analyst_measured',
    templates: {
      clean_sweep: [
        '{winner} over {loser}, 3-0. Round-by-round control, no real swing moments against. The gap was preparation.',
        'Clean 3-0 for {winner}. Won the exchange on bars AND clarity every round. Nothing to protest here.',
        '{winner} 3-0. When you take content, delivery and the crowd in all three, the card writes itself.',
        'Not a controversial 30. {winner} set the terms in round one and {loser} never adjusted. Chess, not checkers.',
      ],
      debatable: [
        '{winner} edges it 2-1. Round {round} decided it — momentum, crowd, and material all peaked at once.',
        '2-1 {winner}, but reasonable people score this differently. Round {round} is the swing everyone will argue.',
        'Scored it live: {winner} banks one and {round}, {loser} takes the middle. Thin margins all night.',
        'A true pick-em. {winner} gets the nod on output, {loser} has the room. That IS the whole debate.',
      ],
      robbery: [
        'Cards read {winner} 2-1, crowd metrics favored {loser}. Exactly the judging-criteria debate the scene refuses to settle.',
        '{loser} loses on the cards, wins the room. Until we agree what we\'re scoring, nights like this stay contested.',
        'Score performance and {loser} took it. Score pen and {winner} did. Both camps are right — that\'s the problem.',
      ],
      choke: [
        'The round {round} stall changes the whole card. You can\'t give away a round at this level and expect the other two to carry.',
        'Round {round} wasn\'t nerves so much as a hole in the prep — {loser} had nothing loaded for that exchange.',
        'One blank round at this tier is a loss. {loser} was competitive everywhere except the thirty seconds that mattered.',
      ],
    },
  },
  {
    profile: 'analyst_moments',
    templates: {
      haymaker: [
        'Round {round}. THAT is the moment everyone will be quoting from this card. {winner} built the whole round to set it up.',
        'The round {round} bar from {winner} is the clip of the week — set up two bars early, cashed it with the room standing.',
        'That round {round} sequence loops on every timeline by morning. {winner} timed it to the crowd perfectly.',
      ],
      choke: [
        'Rewatched round {round} three times. It wasn\'t nerves — the material just wasn\'t there. Prep questions.',
        'Round {round} for {loser} is the kind of quiet you can\'t un-hear. That clip follows you a while.',
      ],
      debatable: [
        '{tag} delivered. Two legit swing rounds, one all-timer moment, and a debate that won\'t die this week.',
        '{tag} had it all — a robbery argument, a viral moment, and a rematch demand before the cards were even read.',
      ],
      clean_sweep: [
        'No single flashpoint — {winner} just won every exchange by a little. Death by a thousand cuts battle.',
        'Not one highlight bar, just {winner} being cleaner in every round. Boring to clip, brutal to fight.',
      ],
    },
  },
  {
    profile: 'analyst_news',
    templates: {
      league_result: [
        'RESULT: {winner} def. {loser} ({league}). Full recap and round breakdown on the blog shortly.',
        'IT\'S OFFICIAL: {winner} takes it over {loser} at {league}. Write-up incoming.',
      ],
      debatable: [
        'RESULT: {winner} def. {loser} 2-1 ({league}). Expect discourse — crowd and cards did not fully agree.',
        'RESULT: {winner} 2-1 {loser} ({league}). Already seeing "robbery" in the replies. Buckle up.',
      ],
      clean_sweep: [
        'RESULT: {winner} def. {loser} 3-0 ({league}). One-way traffic by every measure we track.',
        'RESULT: {winner} 3-0 {loser} ({league}). No asterisks on this one.',
      ],
    },
  },
  {
    profile: 'analyst_rankings',
    templates: {
      clean_sweep: [
        'A 30 at this level moves the board. {winner} enters the tier conversation; {loser} needs a statement next out.',
        'Rankings update: {winner} climbs on a clean 30. {loser} slides, but the tape says it\'s fixable.',
      ],
      debatable: [
        'Rankings impact: minimal. A debatable 2-1 protects both stocks. The REMATCH is where the board moves.',
        'Nobody\'s stock really moves on a 2-1 this close. Book the rematch and let the sequel settle it.',
      ],
      robbery: [
        '{loser}\'s stock goes UP in a loss. Crowd had them, cards didn\'t. Bookers watch crowds, not cards.',
        'Weird night for the board: {loser} loses and gains value. That\'s what a "robbery" does to a stock.',
      ],
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
      // Kept wide on purpose: gloats are the callouts the whole scene sees, so a
      // thin pool makes two different winners tweet the exact same line. Add here,
      // don't trim.
      gloat: [
        'They know what it was tonight. Cards said what the room already knew. Next.',
        'I told everybody what was going to happen and it happened. Who\'s next on the list? {tag}',
        'Respect to {loser} for showing up. That\'s the only respect being handed out tonight.',
        'Told y\'all. Same result, different night. Line the next one up. {tag}',
        'They booked me to lose. I don\'t read scripts. {loser} found that out.',
        'Undefeated in this room and it\'s staying that way. Send somebody.',
        'Ran it back in my head — didn\'t drop a round. On to the next name.',
        'Whole building watched. Ain\'t no debate to have and {loser} knows it.',
        'That wasn\'t a battle, that was a checkup. {loser} needed the reps.',
        'They\'ll blame the room, the crowd, the cards. Never the pen. Never me.',
        'Every card, same story: I show up, they fold. Who wants it? {tag}',
        '{loser} fought a good fight. Scoreboard don\'t care about good fights.',
      ],
    },
  },
];

export const VOICE_BANK_MAP: Map<string, VoiceBank> = new Map(
  VOICE_BANKS.map((b) => [b.profile, b])
);
