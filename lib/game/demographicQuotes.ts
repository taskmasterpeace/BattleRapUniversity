/**
 * MASSIVE QUOTE BANKS FOR DEMOGRAPHIC VOTING
 *
 * Each quote uses {winner} and {loser} placeholders for actual battler names.
 * Organized by demographic type and context.
 *
 * Quote categories:
 * - winBecause: Why they think the winner deserved it
 * - loseBecause: Why they think the loser lost
 * - closeWin: For tight victories
 * - dominant: For bodybags/clear 30s
 * - upset: When underdog wins
 * - disagreement: When they disagree with majority
 */

import { CrowdDemographic } from './crowdDemographics';

export interface QuoteBank {
  winBecause: string[];
  loseBecause: string[];
  closeWin: string[];
  dominant: string[];
  upset: string[];
  disagreement: string[];
}

// =====================================================
// PURISTS - Value lyricism, wordplay, schemes, pen game
// =====================================================
const PURIST_QUOTES: QuoteBank = {
  winBecause: [
    // Core pen game appreciation
    "{winner}'s pen game was on another level tonight",
    "The wordplay from {winner} was too intricate to ignore",
    "{winner} came with that pen talk, scheme of the night",
    "That multi-syllabic scheme from {winner} in round 2? Crazy",
    "{winner} outbarred {loser} - this is pen talk, not performance",
    "The writing was clear - {winner} had the better material",
    "{winner}'s flow patterns were elite level",
    "Lyricism matters and {winner} showed why",
    "{winner}'s wordplay put {loser} to sleep",
    "The technical skill difference was obvious - {winner} took it",
    "{winner} had bars, {loser} had performance",
    "Real recognize real - {winner}'s pen was too sharp",
    "{winner} schooled {loser} with that pen game",
    "Those haymakers from {winner} were written, not freestyled",
    "{winner}'s creativity was unmatched tonight",

    // Scheme appreciation
    "{winner} had back-to-back schemes that were insane",
    "The way {winner} structured those rounds? Pure pen",
    "That breakdown from {winner}? Levels above {loser}",
    "{winner}'s scheme game was operating on a different frequency",
    "Multiple entendres from {winner} all night - clear winner",
    "The setup and punch combinations from {winner} were crazy",
    "{winner} was punching through {loser}'s material",
    "Layered writing from {winner} - had to rewatch to catch everything",
    "{winner}'s pen was surgical tonight",
    "The complexity of {winner}'s bars? {loser} couldn't match that",

    // Technical appreciation
    "{winner} demonstrated why they're called a pen head",
    "Internal rhymes, multis, schemes - {winner} had it all",
    "{winner}'s vocabulary alone won this battle",
    "The technical execution from {winner} was flawless",
    "{winner} wrote circles around {loser}",
    "That was a masterclass in writing from {winner}",
    "{winner}'s bars had substance, {loser}'s had flash",
    "The pen always wins - {winner} proved that tonight",
    "{winner} came with that battle rap textbook material",
    "Flow switches, pocket changes, schemes - {winner} did everything",

    // Specific moments
    "That four-syllable scheme from {winner}? Best of the night",
    "{winner}'s opening scheme set the tone immediately",
    "The way {winner} closed round 3? Elite pen game",
    "{winner} had at least three quotables per round",
    "That callback scheme from {winner}? Incredible writing",
    "{winner}'s rebuttals showed true pen ability",
    "The personals from {winner} were written, not freestyled",
    "{winner} came with pre-written fire and it showed",
    "Every bar from {winner} was crafted perfectly",
    "{winner}'s material was too dense for {loser} to handle",

    // Comparisons
    "{winner} wrote, {loser} performed - writing wins",
    "{winner}'s pen >>> {loser}'s entire style",
    "When it comes to bars, {winner} clearly took this",
    "{winner} proved pen game matters most",
    "The lyrical gap between {winner} and {loser} was obvious",
    "Substance over style - {winner} understood that",
    "{winner} came to battle, {loser} came to perform",
    "The bars don't lie - {winner} won",
    "{winner}'s writing was championship level",
    "{loser} needed more pen to compete with {winner}",
  ],

  loseBecause: [
    // Lack of substance
    "{loser} had empty calories - all performance, no bars",
    "Where were the schemes? {loser} came light",
    "{loser}'s material was surface level at best",
    "No wordplay, no depth - {loser} disappointed the pen heads",
    "{loser} relied too much on crowd reaction, not enough writing",
    "The bars weren't there for {loser}",
    "{loser} was entertaining but not lyrical",
    "Gun bars don't impress real lyricists - {loser} learned that tonight",
    "{loser} couldn't match {winner}'s pen",
    "You can't beat substance with style - {loser} tried",

    // Technical failures
    "{loser}'s rhyme schemes were basic",
    "Single syllable punches from {loser} - not enough",
    "{loser}'s material lacked depth",
    "Predictable rhymes from {loser} all night",
    "{loser} forgot this is a writing competition",
    "The technical gap exposed {loser}",
    "{loser} needs to work on the pen",
    "Too many filler bars from {loser}",
    "{loser} was reaching with those punches",
    "No setups, weak punches - {loser} was outclassed",

    // Style criticism
    "{loser} was all performance, no substance",
    "{loser} can yell all they want - still lost on bars",
    "Energy doesn't replace writing - {loser} found out",
    "{loser} was entertaining but didn't win",
    "Stage presence doesn't count for real ones - {loser} lost",
    "{loser} thought volume meant victory",
    "Being loud isn't the same as being lyrical - {loser}",
    "{loser} played to the crowd, not the pen heads",
    "{loser}'s style can't hide weak writing",
    "{loser} relied too much on their persona",

    // Specific failures
    "{loser}'s rounds fell flat after the first punch",
    "{loser} ran out of material midway through",
    "{loser}'s setup-to-punch ratio was terrible",
    "{loser} recycled bars we've heard before",
    "{loser}'s personals were weak and generic",
    "{loser} had no memorable quotables",
    "{loser}'s closing bars were underwhelming",
    "{loser} peaked early and faded",
    "{loser}'s rebuttals showed poor preparation",
    "{loser} couldn't adapt to {winner}'s style",
  ],

  closeWin: [
    "Slight edge to {winner} on the writing",
    "Both pens were sharp but {winner} edged it",
    "Could've gone either way but {winner}'s bars were cleaner",
    "Pen game was close but {winner} had that one scheme",
    "{winner} by a hair on pure lyrical ability",
    "Close but {winner}'s wordplay was slightly better",
    "Had to rewatch - {winner} edges it on pen",
    "Razor thin but {winner}'s writing was tighter",
    "Could debate this all day but {winner}'s pen was cleaner",
    "Slight edge to {winner} - better scheme work",
    "Both were lyrical but {winner} had more moments",
    "{winner} barely edged {loser} on substance",
    "Close battle but {winner}'s bars hit harder",
    "Technical edge to {winner}",
    "{winner} by a nose on pure writing",
    "Debatable but I'm giving it to {winner}'s pen",
    "Both showed up but {winner} was slightly sharper",
    "{winner}'s quotables just barely outweighed {loser}'s",
    "Could rewatch this 10 times - still give {winner} the edge",
    "{winner} edged it in the details",
  ],

  dominant: [
    "{winner} schooled {loser} - wasn't even close",
    "Body bag. {winner}'s pen was levels above",
    "{winner} made {loser} look amateur",
    "Clear 30 - {winner} outbarred {loser} every round",
    "{winner} put on a clinic",
    "That was a pen game masterclass from {winner}",
    "{loser} got washed - {winner} dominated",
    "{winner} exposed {loser}'s lack of pen game",
    "30 piece. {winner} was too lyrical",
    "{winner} showed {loser} what real writing looks like",
    "Bodied. {winner}'s pen was unmatched",
    "{winner} ran through {loser} with superior material",
    "Clear winner - {winner} was on another level",
    "{loser} got cooked by {winner}'s pen",
    "{winner} gave {loser} a writing lesson",
    "3-0 - {winner} dominated on every lyrical metric",
    "{winner} showed the gap in pen ability",
    "{loser} wasn't ready for {winner}'s bars",
    "Bodybag - {winner} was leagues above",
    "Total domination from {winner}'s pen",
  ],

  upset: [
    "Didn't expect {winner} to out-write {loser} like that",
    "{winner} came prepared - surprised everyone",
    "{winner}'s pen has improved significantly",
    "Nobody saw {winner} outbarring {loser}",
    "{winner} stepped up their pen game tonight",
    "Upset of the night - {winner}'s writing was next level",
    "{winner} proved doubters wrong with that pen",
    "Didn't know {winner} could write like that",
    "{winner} showed hidden pen ability",
    "{loser} got caught sleeping on {winner}'s bars",
  ],

  disagreement: [
    "The room is wrong - {loser}'s pen was better",
    "I don't care what they say - {loser} won on bars",
    "Crowd reaction doesn't equal pen game - {loser} won",
    "The real pen heads know {loser} took this",
    "Popularity contest - {loser} had better writing",
    "The masses got it wrong - {loser}'s bars were superior",
    "{winner} won the room, {loser} won the battle",
    "If we're judging bars only, {loser} took it",
    "Entertainment shouldn't beat lyricism - {loser} was robbed",
    "This is why battle rap is dying - {loser} clearly won on pen",
  ],
};

// =====================================================
// STREET FANS - Value authenticity, realness, lived experience
// =====================================================
const STREET_FAN_QUOTES: QuoteBank = {
  winBecause: [
    // Authenticity appreciation
    "{winner} was talking that real talk",
    "You could feel the authenticity from {winner}",
    "{winner} lived every bar - can't fake that",
    "That angle {winner} used? Too personal to recover from",
    "{winner} brought the realness, {loser} brought the gimmicks",
    "{winner} was street certified tonight",
    "Real recognize real - {winner} took it",
    "{winner}'s bars had weight behind them",
    "That's lived experience from {winner} - you can't write that",
    "{winner} talked that talk and meant it",
    "Authenticity won - {winner} had it, {loser} didn't",
    "{winner} checked {loser} with them personals",
    "The streets know who won - {winner} all day",
    "{winner} came from that mud",
    "{winner} had that hunger - could feel it",

    // Street credibility
    "{winner}'s street cred spoke volumes",
    "You can tell {winner} lived them bars",
    "{winner} wasn't performing - that was real",
    "The authenticity from {winner} was undeniable",
    "{winner} came with that real talk",
    "{winner} spoke facts, {loser} spoke fiction",
    "That's street knowledge from {winner}",
    "{winner} had that rawness you can't fake",
    "{winner}'s angles hit different because they're real",
    "{winner} came from the trenches and it showed",

    // Specific moments
    "{winner}'s personals exposed {loser}'s cap",
    "That life check from {winner}? {loser} couldn't respond",
    "{winner} brought out the receipts",
    "The streets vouched for {winner}'s story",
    "{winner}'s round 2 angle was too personal",
    "{winner} put {loser}'s whole life on display",
    "The exposure game from {winner} was crazy",
    "{winner} did the research - that was real info",
    "{winner}'s dirt on {loser} was legitimate",
    "{winner} came with facts, not fiction",

    // Character assessment
    "{winner} showed heart tonight",
    "{winner} stood on business",
    "You could tell {winner} believed every bar",
    "{winner} had conviction - {loser} was just rapping",
    "{winner}'s energy was genuine",
    "No cap in {winner}'s bars",
    "{winner} kept it a thousand",
    "Real ones rock with {winner}",
    "{winner} showed what authenticity looks like",
    "The realest won - that was {winner}",

    // Comparisons
    "{winner} is about that life, {loser} raps about it",
    "{winner} lived it, {loser} learned it",
    "Street cred matters - {winner} had it",
    "{winner}'s lived experience > {loser}'s written bars",
    "Can't fake what {winner} brought tonight",
    "{winner} was speaking their truth",
    "The real ones in the room know {winner} won",
    "{winner} brought that genuine energy",
    "Authenticity beats performance - {winner} proved it",
    "{winner} came with substance from the streets",
  ],

  loseBecause: [
    // Lack of authenticity
    "{loser} was rapping, {winner} was talking that talk",
    "All wordplay, no substance from {loser}",
    "{loser} can't relate - where's the realness?",
    "Pop culture references? This is battle rap - {loser} missed",
    "{loser} was too cute with it - needed more aggression",
    "{loser} sounded like a writer, not a battler",
    "Corny bars from {loser} - the streets don't rock with that",
    "{loser} tried to be clever instead of real",
    "You could tell {loser} ain't lived them bars",
    "Fake tough from {loser} - the real ones know",

    // Character criticism
    "{loser} was capping the whole battle",
    "{loser}'s persona is fake - {winner} exposed it",
    "{loser} talks tough but doesn't live it",
    "All image, no substance from {loser}",
    "{loser} was performing, not being real",
    "{loser}'s story doesn't add up",
    "The streets see through {loser}'s act",
    "{loser} was cosplaying as a street rapper",
    "{loser}'s angles were generic and fake",
    "{loser} needs to keep it real next time",

    // Specific failures
    "{loser} got exposed for the fraud they are",
    "{loser}'s background got fact-checked",
    "{loser} couldn't respond to them real accusations",
    "{loser}'s rebuttals were weak when it got personal",
    "{loser} crumbled under real talk",
    "{loser} tried to deflect when the truth came out",
    "{loser}'s story fell apart under scrutiny",
    "{loser} got caught in multiple lies tonight",
    "{loser}'s hood credibility got destroyed",
    "{loser} was exposed as an actor",

    // Style criticism
    "{loser} was too polished - where's the grit?",
    "{loser}'s bars were too commercial",
    "{loser} came with industry bars, not street bars",
    "Too clean from {loser} - needed more rawness",
    "{loser} needs to touch grass",
    "{loser} raps like they read about the streets",
    "{loser}'s delivery lacked conviction",
    "{loser} was too comfortable - where's the hunger?",
    "{loser} came with written bars, not lived experience",
    "{loser} was performing for cameras, not battling",
  ],

  closeWin: [
    "{winner} was more authentic - slight edge",
    "Both had realness but {winner} edged it",
    "Streets gave it to {winner} - barely",
    "Authenticity edge to {winner}",
    "Close but {winner}'s angles felt more real",
    "Slight edge to {winner} on the personal stuff",
    "Both kept it real but {winner} was realer",
    "{winner} barely edged it on street cred",
    "Could go either way but {winner}'s lived experience",
    "Close battle - {winner} edges it on authenticity",
    "The personal angles from {winner} gave them the edge",
    "{winner} by a hair on realness",
    "Streets would give this to {winner}",
    "Slight advantage to {winner} on the real talk",
    "Close but {winner}'s authenticity won out",
  ],

  dominant: [
    "{winner} checked {loser}'s whole career",
    "Body. {loser} got exposed as not real",
    "{winner} had {loser} shook the whole battle",
    "Clear 30 - {winner} was too real for {loser}",
    "{winner} exposed {loser} completely",
    "Bodied - {loser}'s fake persona got destroyed",
    "{winner} put {loser}'s whole life on display",
    "Character assassination from {winner} - bodybag",
    "{loser} got reality checked by {winner}",
    "{winner} fact-checked {loser} into a 30",
    "Complete exposure - {winner} dominated",
    "{loser} got their street cred revoked by {winner}",
    "{winner} made {loser} look like an actor",
    "30 - {loser} got fact-checked every round",
    "Bodybag - {winner}'s real talk was devastating",
  ],

  upset: [
    "Didn't know {winner} was real like that",
    "{winner} came correct - surprised everybody",
    "{winner} had angles nobody expected",
    "The streets underestimated {winner}",
    "{winner} exposed {loser} when nobody expected it",
    "Didn't see {winner} having that info",
    "{winner} did their homework - street smart",
    "The research from {winner} was unexpected",
    "{winner} caught {loser} completely off guard",
    "Nobody knew {winner} had that realness",
  ],

  disagreement: [
    "The room got it wrong - {loser} was realer",
    "{loser} had better street angles",
    "Bars don't mean nothing if they ain't real - {loser} won",
    "The real ones know {loser} took this",
    "{winner} won on performance, {loser} won on substance",
    "This crowd wouldn't know real if it hit them - {loser} won",
    "{loser}'s authenticity should've won this",
    "The room went with entertainment over realness",
    "{loser} was speaking facts that went over heads",
    "Popularity doesn't equal realness - {loser} won",
  ],
};

// =====================================================
// COMEDY FANS - Value entertainment, nameflips, humor
// =====================================================
const COMEDY_FAN_QUOTES: QuoteBank = {
  winBecause: [
    // Entertainment value
    "{winner} had the room dying - comedy wins",
    "Entertainment factor off the charts from {winner}",
    "{winner}'s name flips were crazy",
    "Best crowd reactions of the night for {winner}",
    "{winner} made it fun - that's what battle rap should be",
    "That joke from {winner} in round 2? Classic",
    "{winner} was entertaining start to finish",
    "The punches from {winner} hit different - timing was perfect",
    "{winner} had better crowd control",
    "Fun bars > boring bars - {winner} understood the assignment",
    "{winner} brought the energy and entertainment",
    "People gonna be quoting {winner}'s bars for weeks",
    "{winner} made {loser} look boring",
    "That nameflip from {winner}? Hall of fame material",
    "{winner} knows how to work a room",

    // Specific comedy moments
    "{winner}'s name flip had me screaming",
    "That callback joke from {winner}? Genius",
    "{winner}'s timing was impeccable",
    "The delivery on {winner}'s punches was perfect",
    "{winner} had quotables for days",
    "That crowd reaction to {winner}'s flip was everything",
    "{winner} created multiple viral moments",
    "The room exploded for {winner} multiple times",
    "{winner}'s punchlines were hilarious",
    "Comedy timing from {winner} was elite",

    // Crowd engagement
    "{winner} controlled the crowd's energy",
    "The room was hanging on {winner}'s every word",
    "{winner} knew how to milk every reaction",
    "{winner}'s pauses were perfect for impact",
    "The crowd loved every moment from {winner}",
    "{winner} made battle rap fun again",
    "{winner}'s energy was infectious",
    "People were literally falling over laughing at {winner}",
    "{winner} gave the crowd what they wanted",
    "The entertainment value from {winner} was unmatched",

    // Memorable moments
    "{winner} created at least three meme-worthy moments",
    "That bar from {winner} is gonna be clipped everywhere",
    "{winner}'s rounds were highlight reel material",
    "People are gonna remember {winner}'s performance for years",
    "{winner} understood this is entertainment first",
    "Quotable machine - that's what {winner} was tonight",
    "{winner} had the whole venue rocking",
    "The replay value on {winner}'s material is insane",
    "{winner} made this battle worth watching",
    "Everyone left talking about {winner}'s moments",

    // Comparisons
    "{winner} was fun, {loser} was boring",
    "{winner} gets it - this is entertainment",
    "You're supposed to enjoy battle rap - {winner} made that possible",
    "{winner} brought the show, {loser} brought a recital",
    "Entertainment beats technical any day - {winner} proved it",
    "{winner} was memorable, {loser} was forgettable",
    "Ask anyone who won the crowd - {winner} every time",
    "{winner} gave us moments, {loser} gave us bars",
    "The fun factor from {winner} was undeniable",
    "{winner} made us laugh, {loser} made us yawn",
  ],

  loseBecause: [
    // Lack of entertainment
    "Too serious from {loser} - it's supposed to be fun",
    "Nobody was laughing at {loser}'s bars",
    "Boring. {loser} put me to sleep",
    "All that depth and nobody's entertained - {loser} lost",
    "{loser} couldn't connect with the crowd",
    "{loser} was rapping to themselves",
    "No entertainment value from {loser}",
    "{loser} forgot this is supposed to be fun",
    "Crickets for {loser}'s material",
    "{loser} was technically good but nobody cared",

    // Crowd disconnect
    "{loser} couldn't work the crowd",
    "The room didn't rock with {loser}",
    "{loser}'s energy was flat",
    "No crowd engagement from {loser}",
    "{loser} was rapping to the wall",
    "The audience checked out during {loser}'s rounds",
    "{loser} couldn't keep the crowd interested",
    "Phones came out during {loser}'s rounds",
    "{loser} lost the room multiple times",
    "The energy dropped every time {loser} started",

    // Delivery failures
    "{loser}'s timing was off all night",
    "{loser} stumbled through their punches",
    "No rhythm to {loser}'s delivery",
    "{loser}'s pauses killed their momentum",
    "The execution from {loser} was poor",
    "{loser} couldn't land their punches right",
    "Awkward delivery from {loser} killed the bars",
    "{loser}'s flow was uncomfortable to watch",
    "The material was there but {loser} couldn't deliver",
    "{loser} needs to work on comedic timing",

    // Specific failures
    "{loser}'s nameflips fell flat",
    "{loser} tried to be funny but wasn't",
    "Forced comedy from {loser} - cringe",
    "{loser}'s jokes didn't land",
    "The crowd wasn't feeling {loser}'s material",
    "{loser}'s punches were predictable",
    "No surprise factor in {loser}'s bars",
    "{loser}'s callbacks were weak",
    "The creativity wasn't there from {loser}",
    "{loser} played it too safe",
  ],

  closeWin: [
    "{winner} got more crowd reactions - slight edge",
    "Both were entertaining but {winner} edged it",
    "Laughs gave it to {winner}",
    "{winner} had better comedic timing",
    "Close but {winner}'s moments were bigger",
    "Slight entertainment edge to {winner}",
    "Both were fun but {winner} was funnier",
    "{winner} barely edged it on crowd reactions",
    "Could go either way but {winner} had the moments",
    "Close battle - {winner}'s entertainment value edges it",
    "The quotables from {winner} give them the edge",
    "{winner} by a hair on entertainment",
    "Crowd gave it to {winner}",
    "Slight advantage to {winner} on the fun factor",
    "Close but {winner}'s energy was slightly better",
  ],

  dominant: [
    "{winner} was hilarious - {loser} couldn't keep up",
    "Body bag. {winner} had the room in tears",
    "{winner} put on a show - {loser} was boring",
    "Clear 30 for entertainment - {winner} ran away with it",
    "{winner} made {loser} look like an amateur",
    "Comedy bodybag - {loser} couldn't compete",
    "{winner}'s entertainment level was too high",
    "Clear winner - {winner} had all the moments",
    "{loser} got outclassed in entertainment value",
    "30 - {winner} was on another entertainment level",
    "{winner} dominated the crowd reactions",
    "{loser} got bodied by {winner}'s personality",
    "{winner}'s charisma was overwhelming",
    "Bodybag - {winner} made this fun, {loser} didn't",
    "{winner} showed what entertainment looks like",
  ],

  upset: [
    "Didn't expect {winner} to be that funny",
    "{winner} surprised everyone with the comedy",
    "Nobody knew {winner} could entertain like that",
    "{winner} came out of nowhere with those moments",
    "The crowd reactions for {winner} were unexpected",
    "{winner} stepped up their entertainment game",
    "Didn't see {winner} winning the crowd like that",
    "{winner} brought a whole new energy",
    "Entertainment upset - {winner} shocked everyone",
    "{winner}'s personality came through tonight",
  ],

  disagreement: [
    "The room overrated {winner}'s comedy",
    "{loser} was actually more entertaining",
    "Just because {loser} was serious doesn't mean they lost",
    "Battle rap isn't just comedy - {loser} had better bars",
    "The crowd went with cheap laughs - {loser} had substance",
    "Entertainment shouldn't trump skill - {loser} was better",
    "{winner} was funny but {loser} was actually battling",
    "Comedy shouldn't win over real bars - {loser} won",
    "The room was easily entertained - {loser} had more skill",
    "{loser}'s bars were better than {winner}'s jokes",
  ],
};

// =====================================================
// AGGRESSION FANS - Value energy, intensity, killer instinct
// =====================================================
const AGGRESSION_FAN_QUOTES: QuoteBank = {
  winBecause: [
    // Energy appreciation
    "{winner}'s energy was unmatched",
    "That aggression from {winner} won the room",
    "{winner} came with that killer instinct",
    "You could feel the intensity from {winner}",
    "{winner} was in {loser}'s face the whole battle",
    "{winner} brought that dawg energy",
    "Passion and aggression - {winner} had both",
    "{winner} wanted it more",
    "That energy shift when {winner} started round 2? Crazy",
    "{winner} was hungry - could see it",
    "{winner} controlled the room with presence",
    "Battle rap needs that fire - {winner} brought it",
    "{winner} was locked in from bar one",
    "The aggression from {winner} was undeniable",
    "{winner} had that look in their eye",

    // Intensity moments
    "{winner} was snarling through those bars",
    "The tension {winner} created was crazy",
    "{winner} made {loser} uncomfortable",
    "{winner}'s presence was intimidating",
    "You could feel {winner}'s intensity through the screen",
    "{winner} had {loser} on their heels",
    "The aggression level from {winner} was elite",
    "{winner} came to fight, not perform",
    "{winner} was channeling something different tonight",
    "That competitive fire from {winner} was real",

    // Specific moments
    "{winner} got in {loser}'s face during round 1",
    "That stare down from {winner}? {loser} looked away",
    "{winner}'s body language dominated the stage",
    "The way {winner} delivered that haymaker? Aggressive perfection",
    "{winner} didn't let up for a single bar",
    "{winner}'s rounds had no filler - all aggression",
    "The intensity from {winner}'s first bar set the tone",
    "{winner} brought that main event energy",
    "{winner} treated every round like it was life or death",
    "The hunger from {winner} was palpable",

    // Comparisons
    "{winner} came to battle, {loser} came to rap",
    "{winner}'s intensity > {loser}'s everything",
    "{winner} fought, {loser} performed",
    "Aggression matters and {winner} proved it",
    "{winner} had that dawg in them, {loser} didn't",
    "{winner} was a competitor tonight",
    "You don't out-aggression {winner}",
    "{winner}'s energy carried them to victory",
    "The fight was in {winner}, not {loser}",
    "{winner} showed what wanting it looks like",

    // Outcome emphasis
    "{winner} intimidated {loser} into mistakes",
    "{winner}'s aggression affected {loser}'s delivery",
    "{loser} couldn't match {winner}'s energy",
    "{winner} imposed their will on this battle",
    "The room felt {winner}'s energy",
    "{winner} won the psychological battle",
    "{winner}'s presence alone won rounds",
    "{winner} controlled the battle with intensity",
    "{winner} made this a street fight",
    "{winner}'s aggression was championship level",
  ],

  loseBecause: [
    // Lack of energy
    "No energy from {loser} - battle rap needs passion",
    "{loser} was flat - where was the aggression?",
    "Smooth flow put me to sleep - {loser} needed more fire",
    "{loser} looked like they didn't want to be there",
    "Zero intensity from {loser}",
    "{loser} was too calm - needs more hunger",
    "{loser} let {winner} control the energy",
    "Battle rap is competition - {loser} forgot that",
    "{loser} was going through the motions",
    "Where was the passion from {loser}?",

    // Weak presence
    "{loser}'s stage presence was lacking",
    "{loser} looked timid up there",
    "No fire in {loser}'s eyes",
    "{loser} was passive the whole battle",
    "The competitive edge wasn't there from {loser}",
    "{loser} seemed scared of {winner}",
    "{loser}'s body language was weak",
    "No conviction in {loser}'s delivery",
    "{loser} backed down when {winner} got aggressive",
    "{loser} couldn't handle the pressure",

    // Specific failures
    "{loser} flinched when {winner} got close",
    "{loser}'s energy dropped throughout the battle",
    "{loser} couldn't maintain intensity",
    "The aggression faded from {loser} quickly",
    "{loser} tried to match {winner}'s energy but failed",
    "{loser} looked defeated before it ended",
    "{loser}'s rounds had no urgency",
    "The killer instinct wasn't there from {loser}",
    "{loser} treated this like a rap recital",
    "{loser} didn't come to compete",

    // Style criticism
    "{loser} was too polished for a battle",
    "{loser} needs to find their dawg",
    "Too reserved from {loser}",
    "{loser} was performing for cameras, not fighting",
    "{loser}'s laid back approach doesn't work in battles",
    "{loser} needs to learn what competition is",
    "Battle rap isn't a poetry slam - {loser} forgot that",
    "{loser} came with recital energy",
    "No edge to {loser}'s material",
    "{loser} was technically good but had no fight",
  ],

  closeWin: [
    "{winner} had slightly more energy",
    "Both were aggressive but {winner} edged it",
    "Intensity gave it to {winner}",
    "{winner} wanted it more - slight edge",
    "Close but {winner}'s aggression tipped it",
    "Slight energy edge to {winner}",
    "Both brought fight but {winner} was hungrier",
    "{winner} barely edged it on intensity",
    "Could go either way but {winner}'s energy",
    "Close battle - {winner}'s aggression gives them the edge",
    "The fire from {winner} gives them the slight advantage",
    "{winner} by a hair on pure competition",
    "Both were locked in but {winner} was more intense",
    "Slight advantage to {winner} on the aggression",
    "Close but {winner}'s dawg mentality won out",
  ],

  dominant: [
    "{winner} had {loser} shook - body",
    "{winner} dominated - {loser} had no answer",
    "Clear 30 - {winner}'s aggression was overwhelming",
    "{winner} controlled every moment",
    "Bodybag - {loser} got bullied",
    "{winner}'s intensity was too much for {loser}",
    "{winner} made {loser} look scared",
    "Total domination - {winner}'s energy was unmatched",
    "{loser} got their soul snatched by {winner}",
    "30 - {winner} imposed their will completely",
    "{winner} broke {loser}'s spirit",
    "Clear winner - {winner} outcompeted {loser}",
    "{winner} made {loser} quit mentally",
    "Bodied by pure aggression - {winner} wins easily",
    "{winner} showed what wanting it looks like",
  ],

  upset: [
    "{winner} came with unexpected fire",
    "That energy from {winner} surprised everyone",
    "Nobody knew {winner} had that dawg in them",
    "{winner} showed a new level of intensity",
    "The aggression from {winner} came out of nowhere",
    "{winner} was a different battler tonight",
    "Didn't expect {winner} to come that aggressive",
    "{winner} brought main event energy as an underdog",
    "The fire from {winner} shocked everyone",
    "{winner} competed like their life depended on it",
  ],

  disagreement: [
    "Aggression shouldn't beat bars - {loser} won",
    "{loser}'s calmer approach was actually better",
    "Being loud doesn't mean you won - {loser} had better material",
    "{winner}'s aggression wasn't backed by bars",
    "Energy doesn't replace skill - {loser} won",
    "The room overrated {winner}'s intensity",
    "{loser}'s smooth style was actually superior",
    "Aggression is a distraction - {loser} had substance",
    "{winner} was yelling but {loser} was rapping",
    "The crowd confused energy for victory - {loser} won",
  ],
};

// =====================================================
// PERFORMANCE FANS - Value stage presence, charisma, showmanship
// =====================================================
const PERFORMANCE_FAN_QUOTES: QuoteBank = {
  winBecause: [
    // Stage presence
    "{winner}'s stage presence was undeniable",
    "The showmanship from {winner} won the night",
    "{winner} commanded the room from start to finish",
    "Charisma levels were crazy from {winner}",
    "{winner} knew how to work the stage",
    "{winner} put on a performance - not just rapping",
    "That delivery from {winner}? Perfect execution",
    "{winner} had the crowd in their palm",
    "Stage craft at its finest from {winner}",
    "{winner} was a star tonight",
    "Performance matters and {winner} showed why",
    "{winner}'s presence was undeniable",
    "The way {winner} delivered those bars? Elite",
    "{winner} made every bar land",
    "{winner} was theatrical in the best way",

    // Delivery excellence
    "{winner}'s delivery was impeccable",
    "The flow switches from {winner} were crazy",
    "{winner}'s cadence changes kept everyone engaged",
    "Perfect execution from {winner} all night",
    "{winner} knew exactly how to deliver each bar",
    "The performance level from {winner} was elite",
    "{winner}'s voice control was masterful",
    "Every pause, every emphasis - {winner} nailed it",
    "{winner}'s delivery elevated their material",
    "The performative elements from {winner} were next level",

    // Crowd control
    "{winner} worked the crowd perfectly",
    "The way {winner} interacted with the audience? Elite",
    "{winner} knew when to pause for effect",
    "{winner}'s crowd engagement was unmatched",
    "The room was in {winner}'s hands",
    "{winner} controlled the energy all night",
    "Masterful crowd manipulation from {winner}",
    "{winner} made the venue feel alive",
    "The atmosphere when {winner} performed was electric",
    "{winner} created moments with their performance",

    // Specific moments
    "{winner}'s gestures added so much to the bars",
    "That dramatic pause from {winner}? Perfect timing",
    "{winner}'s facial expressions sold every line",
    "The way {winner} moved on stage was professional",
    "{winner}'s voice projection was incredible",
    "The buildup to {winner}'s punches was theatrical",
    "{winner} treated each round like a show",
    "The presentation from {winner} was A+",
    "{winner}'s physical presence dominated",
    "Every movement from {winner} was intentional",

    // Comparisons
    "{winner} performed, {loser} recited",
    "{winner}'s stagecraft > {loser}'s material",
    "{winner} understood it's a show",
    "{winner} brought performance, {loser} brought bars",
    "Delivery matters and {winner} proved it",
    "{winner} made it an event",
    "{winner}'s performance elevated everything",
    "{winner} knew how to make bars land",
    "{winner} was captivating, {loser} was not",
    "{winner} is a performer, {loser} is a rapper",
  ],

  loseBecause: [
    // Lack of presence
    "No presence from {loser} - just stood there rapping",
    "Great bars but terrible delivery from {loser}",
    "{loser} needs to work on the stage show",
    "Zero charisma from {loser}",
    "{loser} was rapping at the floor",
    "{loser} couldn't command the room",
    "Performance was lacking from {loser}",
    "{loser} had good material but bad delivery",
    "Stage presence matters - {loser} had none",
    "{loser} was forgettable despite the bars",

    // Delivery issues
    "{loser}'s delivery killed their material",
    "Monotone throughout from {loser}",
    "No variation in {loser}'s delivery",
    "{loser}'s flow was awkward",
    "The execution wasn't there from {loser}",
    "{loser} stumbled through good bars",
    "Poor cadence from {loser}",
    "{loser}'s timing was off",
    "The performance didn't match {loser}'s writing",
    "{loser} needs delivery coaching",

    // Crowd disconnect
    "{loser} couldn't connect with the crowd",
    "No audience engagement from {loser}",
    "{loser} was in their own world",
    "The crowd checked out during {loser}'s rounds",
    "{loser} didn't know how to work the room",
    "Energy never transferred from {loser} to the crowd",
    "{loser} was performing for themselves",
    "No showmanship from {loser}",
    "{loser} couldn't hold attention",
    "{loser}'s stage presence was amateur",

    // Specific failures
    "{loser}'s body language was weak",
    "No eye contact from {loser}",
    "{loser} seemed uncomfortable on stage",
    "The presentation from {loser} was poor",
    "{loser}'s energy didn't translate",
    "No confidence in {loser}'s delivery",
    "{loser} rushed through their material",
    "The nerves showed from {loser}",
    "{loser}'s stage fright affected their performance",
    "{loser} didn't command respect on stage",
  ],

  closeWin: [
    "{winner} had slightly better stage presence",
    "Delivery edge to {winner}",
    "Both performed well but {winner} edged it",
    "{winner}'s charisma gave them the edge",
    "Close but {winner}'s performance tips it",
    "Slight presentation edge to {winner}",
    "Both had presence but {winner} was slightly better",
    "{winner} barely edged it on performance",
    "Could go either way but {winner}'s delivery",
    "Close battle - {winner}'s showmanship gives them the edge",
    "The stage presence from {winner} gives them the slight win",
    "{winner} by a hair on performance quality",
    "Both were entertaining but {winner} performed better",
    "Slight advantage to {winner} on the delivery",
    "Close but {winner}'s presentation won out",
  ],

  dominant: [
    "{winner} put on a show - {loser} just rapped",
    "Clear 30 - {winner}'s performance was elite",
    "{winner} owned that stage - body",
    "Performance gap was too big - {winner} dominated",
    "Bodybag - {loser} couldn't match {winner}'s presence",
    "{winner}'s showmanship was overwhelming",
    "{winner} made {loser} look amateur on stage",
    "Total domination - {winner}'s performance was unmatched",
    "{loser} got outperformed completely",
    "30 - {winner} was on another entertainment level",
    "{winner}'s stage craft was too elite",
    "Clear winner - {winner} put on a clinic",
    "{winner} made {loser} invisible on stage",
    "Bodied by pure performance - {winner} wins easily",
    "{winner} showed what main event presence looks like",
  ],

  upset: [
    "{winner}'s stage presence surprised everyone",
    "Didn't expect {winner} to command the room like that",
    "The performance from {winner} came out of nowhere",
    "{winner} showed a new level of showmanship",
    "Nobody knew {winner} could perform like that",
    "{winner} stepped up their stage game",
    "Didn't see {winner} having that presence",
    "{winner} brought main event performance as an underdog",
    "The delivery from {winner} shocked everyone",
    "{winner} evolved their performance tonight",
  ],

  disagreement: [
    "Performance shouldn't beat pen - {loser} won on bars",
    "{loser}'s calmer style was actually superior",
    "Being theatrical doesn't mean you won - {loser} had better material",
    "{winner}'s performance was flash without substance",
    "Delivery doesn't replace writing - {loser} won",
    "The room overrated {winner}'s showmanship",
    "{loser}'s subtle approach was actually better",
    "Performance is a distraction - {loser} had substance",
    "{winner} was all show and no go",
    "The crowd confused performance for victory - {loser} won",
  ],
};

// =====================================================
// EXPORT COMBINED QUOTE BANKS
// =====================================================

export const DEMOGRAPHIC_QUOTES: Record<CrowdDemographic, QuoteBank> = {
  purists: PURIST_QUOTES,
  street_fans: STREET_FAN_QUOTES,
  comedy_fans: COMEDY_FAN_QUOTES,
  aggression_fans: AGGRESSION_FAN_QUOTES,
  performance_fans: PERFORMANCE_FAN_QUOTES,
};

/**
 * Get a random quote for a demographic based on context
 */
export function getRandomQuote(
  demographic: CrowdDemographic,
  context: keyof QuoteBank,
  winnerName: string,
  loserName: string
): string {
  const bank = DEMOGRAPHIC_QUOTES[demographic][context];
  const template = bank[Math.floor(Math.random() * bank.length)];
  return template
    .replace(/{winner}/g, winnerName)
    .replace(/{loser}/g, loserName);
}

/**
 * Get multiple unique quotes for variety
 */
export function getMultipleQuotes(
  demographic: CrowdDemographic,
  context: keyof QuoteBank,
  count: number,
  winnerName: string,
  loserName: string
): string[] {
  const bank = DEMOGRAPHIC_QUOTES[demographic][context];
  const shuffled = [...bank].sort(() => Math.random() - 0.5);
  return shuffled
    .slice(0, Math.min(count, bank.length))
    .map(template =>
      template
        .replace(/{winner}/g, winnerName)
        .replace(/{loser}/g, loserName)
    );
}

// =====================================================
// STATISTICS
// =====================================================

export function getQuoteBankStats(): Record<CrowdDemographic, Record<keyof QuoteBank, number>> {
  const stats: any = {};
  for (const [demographic, bank] of Object.entries(DEMOGRAPHIC_QUOTES)) {
    stats[demographic] = {
      winBecause: bank.winBecause.length,
      loseBecause: bank.loseBecause.length,
      closeWin: bank.closeWin.length,
      dominant: bank.dominant.length,
      upset: bank.upset.length,
      disagreement: bank.disagreement.length,
    };
  }
  return stats;
}
