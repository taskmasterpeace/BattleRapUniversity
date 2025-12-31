import type { SecretType } from '@/components/ui/secret-badge'
import type { DiscoveryMethod } from './secrets'

// Storyline structure for secrets
export interface SecretStoryline {
  id: string
  secretType: SecretType
  title: string
  description: string
  discoveryMethod: DiscoveryMethod

  // How the player discovers this
  discoveryText: string

  // Media headline if bloggers report on it
  mediaHeadline?: string

  // Severity modifier (some storylines are worse than others)
  severityModifier: number // -1 to +1 (multiplier adjustment)

  // Tags for filtering/categorization
  tags: string[]
}

// ========== SNITCH STORYLINES ==========
const SNITCH_STORYLINES: SecretStoryline[] = [
  {
    id: 'snitch-01',
    secretType: 'snitch',
    title: 'The Paperwork',
    description: 'Court documents surface showing they testified against a former associate in a federal case.',
    discoveryMethod: 'research',
    discoveryText: 'Your research uncovers court records. The paperwork is real - they took the stand.',
    mediaHeadline: 'PAPERWORK SURFACES: [BATTLER] Named as Cooperating Witness in Federal Case',
    severityModifier: 0.2,
    tags: ['federal', 'paperwork', 'testimony'],
  },
  {
    id: 'snitch-02',
    secretType: 'snitch',
    title: 'The Recording',
    description: 'Audio leaks of them giving information to police during an interrogation.',
    discoveryMethod: 'blogger',
    discoveryText: 'A blogger drops an audio clip. You can hear them giving up names to detectives.',
    mediaHeadline: 'LEAKED AUDIO: [BATTLER] Heard Cooperating With Police in Interrogation Tape',
    severityModifier: 0.3,
    tags: ['audio', 'police', 'interrogation'],
  },
  {
    id: 'snitch-03',
    secretType: 'snitch',
    title: 'The Setup',
    description: 'Word on the street is they set up a deal that got their homie locked up.',
    discoveryMethod: 'crew',
    discoveryText: 'Someone from your crew knows someone who was there. They say [OPPONENT] set the whole thing up.',
    mediaHeadline: null, // Street knowledge, not media
    severityModifier: 0,
    tags: ['setup', 'street', 'homie'],
  },
  {
    id: 'snitch-04',
    secretType: 'snitch',
    title: 'The Plea Deal',
    description: 'They got an unusually light sentence for serious charges - the math ain\'t mathing.',
    discoveryMethod: 'research',
    discoveryText: 'You dig into their case. Armed robbery, but walked with probation? They definitely talked.',
    mediaHeadline: 'SUSPICIOUS: [BATTLER]\'s Light Sentence Raises Questions About Cooperation',
    severityModifier: -0.1, // Circumstantial, less impact
    tags: ['plea', 'sentence', 'cooperation'],
  },
  {
    id: 'snitch-05',
    secretType: 'snitch',
    title: 'The Victim Statement',
    description: 'Someone they allegedly snitched on goes public about what happened.',
    discoveryMethod: 'social_media',
    discoveryText: 'The person who got locked up just posted receipts on IG. Screenshots of everything.',
    mediaHeadline: '[VICTIM] Exposes [BATTLER]: "He Told On Me To Save Himself"',
    severityModifier: 0.1,
    tags: ['victim', 'social_media', 'receipts'],
  },
]

// ========== FAKE GANGSTER STORYLINES ==========
const FAKE_GANGSTER_STORYLINES: SecretStoryline[] = [
  {
    id: 'fake-gang-01',
    secretType: 'fake-gangster',
    title: 'The Yearbook Photo',
    description: 'Old photos surface showing them living a completely different life than they rap about.',
    discoveryMethod: 'social_media',
    discoveryText: 'Someone from their old school posted yearbook photos. Polo shirts, honor roll, chess club.',
    mediaHeadline: 'EXPOSED: [BATTLER]\'s Suburban Past Contradicts Street Image',
    severityModifier: 0.2,
    tags: ['photos', 'suburban', 'past'],
  },
  {
    id: 'fake-gang-02',
    secretType: 'fake-gangster',
    title: 'The Job History',
    description: 'Before rap, they had a regular 9-to-5 that contradicts their street persona.',
    discoveryMethod: 'research',
    discoveryText: 'LinkedIn never lies. They were an assistant manager at Best Buy for 3 years.',
    mediaHeadline: 'CORPORATE PAST: [BATTLER] Worked Retail Before "Street" Career',
    severityModifier: 0,
    tags: ['job', 'career', 'linkedin'],
  },
  {
    id: 'fake-gang-03',
    secretType: 'fake-gangster',
    title: 'The Real OGs Speak',
    description: 'Actual members of the set they claim say they don\'t know them.',
    discoveryMethod: 'crew',
    discoveryText: 'Your homie knows real ones from that block. They never heard of [OPPONENT].',
    mediaHeadline: 'DISAVOWED: Real [SET] Members Say [BATTLER] "Not One of Us"',
    severityModifier: 0.3,
    tags: ['gang', 'verification', 'disavowed'],
  },
  {
    id: 'fake-gang-04',
    secretType: 'fake-gangster',
    title: 'The Address Check',
    description: 'They claim a hood but actually grew up in a gated community.',
    discoveryMethod: 'research',
    discoveryText: 'Property records don\'t lie. Their family owned a house in [NICE SUBURB].',
    mediaHeadline: 'WRONG ADDRESS: [BATTLER] Claims [HOOD] But Grew Up in [SUBURB]',
    severityModifier: 0.1,
    tags: ['address', 'suburb', 'lies'],
  },
  {
    id: 'fake-gang-05',
    secretType: 'fake-gangster',
    title: 'The Music Video Location',
    description: 'The "hood" in their videos is actually a rented location or borrowed block.',
    discoveryMethod: 'blogger',
    discoveryText: 'A blogger exposed it - that block in their video? They had to pay to film there.',
    mediaHeadline: 'RENTED REALNESS: [BATTLER]\'s "Hood" Music Videos Shot on Borrowed Blocks',
    severityModifier: -0.1,
    tags: ['video', 'fake', 'rented'],
  },
]

// ========== GHOSTWRITER STORYLINES ==========
const GHOSTWRITER_STORYLINES: SecretStoryline[] = [
  {
    id: 'ghost-01',
    secretType: 'ghostwriter',
    title: 'The Reference Track',
    description: 'A reference track leaks with someone else\'s voice rapping the exact bars they used.',
    discoveryMethod: 'blogger',
    discoveryText: 'A blogger just dropped a reference track. That\'s not [OPPONENT]\'s voice - but those are his bars.',
    mediaHeadline: 'LEAKED: Reference Track Proves [BATTLER] Didn\'t Write Their Own Bars',
    severityModifier: 0.3,
    tags: ['reference', 'audio', 'proof'],
  },
  {
    id: 'ghost-02',
    secretType: 'ghostwriter',
    title: 'The Writer Speaks',
    description: 'Their actual ghostwriter comes forward seeking credit.',
    discoveryMethod: 'social_media',
    discoveryText: 'Someone just posted on Twitter claiming they wrote [OPPONENT]\'s last 3 battles. With receipts.',
    mediaHeadline: 'GHOSTWRITER EXPOSED: "[WRITER] Claims Credit for [BATTLER]\'s Best Rounds"',
    severityModifier: 0.2,
    tags: ['writer', 'credit', 'claim'],
  },
  {
    id: 'ghost-03',
    secretType: 'ghostwriter',
    title: 'The Recycled Bars',
    description: 'Their bars match another battler\'s old freestyle word-for-word.',
    discoveryMethod: 'research',
    discoveryText: 'You found it. Those exact bars were spit by [OTHER BATTLER] in 2019. Stolen.',
    mediaHeadline: 'CAUGHT: [BATTLER] Used [OTHER BATTLER]\'s Bars Word-for-Word',
    severityModifier: 0.1,
    tags: ['stolen', 'recycled', 'copied'],
  },
  {
    id: 'ghost-04',
    secretType: 'ghostwriter',
    title: 'The Payment Trail',
    description: 'Financial records show payments to known ghostwriters.',
    discoveryMethod: 'research',
    discoveryText: 'You traced payments from [OPPONENT] to a known writer. Multiple transactions.',
    mediaHeadline: 'FOLLOW THE MONEY: [BATTLER] Paid Thousands to Ghostwriters',
    severityModifier: 0,
    tags: ['payment', 'money', 'trail'],
  },
  {
    id: 'ghost-05',
    secretType: 'ghostwriter',
    title: 'The Style Switch',
    description: 'Their writing style completely changed after linking with a new camp.',
    discoveryMethod: 'crew',
    discoveryText: 'Word is when they switched crews, their whole style changed. The new camp writes for them.',
    mediaHeadline: null, // Speculation, not confirmed
    severityModifier: -0.2,
    tags: ['style', 'crew', 'change'],
  },
]

// ========== STOLEN BARS STORYLINES ==========
const STOLEN_BARS_STORYLINES: SecretStoryline[] = [
  {
    id: 'stolen-01',
    secretType: 'stolen-bars',
    title: 'The Side-by-Side',
    description: 'Someone posts a video showing their bars next to the original source.',
    discoveryMethod: 'social_media',
    discoveryText: 'It\'s going viral. A side-by-side comparison showing [OPPONENT] stole bars from [ARTIST].',
    mediaHeadline: 'VIRAL VIDEO: [BATTLER]\'s Plagiarism Exposed in Side-by-Side Comparison',
    severityModifier: 0.2,
    tags: ['video', 'comparison', 'viral'],
  },
  {
    id: 'stolen-02',
    secretType: 'stolen-bars',
    title: 'The Original Artist',
    description: 'The original writer of the bars calls them out publicly.',
    discoveryMethod: 'blogger',
    discoveryText: 'The original artist just went live about it. They\'re heated [OPPONENT] used their bars.',
    mediaHeadline: '[ORIGINAL ARTIST] Accuses [BATTLER] of Stealing Their Lyrics',
    severityModifier: 0.1,
    tags: ['callout', 'original', 'artist'],
  },
  {
    id: 'stolen-03',
    secretType: 'stolen-bars',
    title: 'The Old Footage',
    description: 'Someone finds old battle footage where they used those same bars against someone else.',
    discoveryMethod: 'research',
    discoveryText: 'You dug up an old battle from 5 years ago. They used the SAME bars against a different opponent.',
    mediaHeadline: 'RECYCLED ROUNDS: [BATTLER] Reusing Bars From Previous Battles',
    severityModifier: -0.1, // Less severe than straight theft
    tags: ['recycled', 'old', 'footage'],
  },
  {
    id: 'stolen-04',
    secretType: 'stolen-bars',
    title: 'The Writing Room Leak',
    description: 'Someone from their writing sessions exposes that bars came from another writer.',
    discoveryMethod: 'crew',
    discoveryText: 'Someone who was in the room says those bars weren\'t [OPPONENT]\'s. They came from another writer.',
    mediaHeadline: null,
    severityModifier: 0,
    tags: ['leak', 'writing', 'session'],
  },
  {
    id: 'stolen-05',
    secretType: 'stolen-bars',
    title: 'The Song Match',
    description: 'Their battle bars match a underground song that came out years before.',
    discoveryMethod: 'research',
    discoveryText: 'Those "original" bars? They\'re from an underground track from 2017. Word for word.',
    mediaHeadline: '[BATTLER]\'s "Fire" Bars Traced Back to Obscure 2017 Song',
    severityModifier: 0.1,
    tags: ['song', 'match', 'underground'],
  },
]

// ========== BABY MAMA DRAMA STORYLINES ==========
const BABY_MAMA_STORYLINES: SecretStoryline[] = [
  {
    id: 'babymama-01',
    secretType: 'baby-mama-drama',
    title: 'The Child Support Case',
    description: 'They\'re being taken to court for unpaid child support.',
    discoveryMethod: 'research',
    discoveryText: 'Court records show [OPPONENT] owes over $20K in back child support. Case is active.',
    mediaHeadline: '[BATTLER] Facing Court Action Over Unpaid Child Support',
    severityModifier: 0.1,
    tags: ['child_support', 'court', 'money'],
  },
  {
    id: 'babymama-02',
    secretType: 'baby-mama-drama',
    title: 'The Baby Mama Speaks',
    description: 'Their ex goes public with accusations of being a deadbeat.',
    discoveryMethod: 'social_media',
    discoveryText: 'The baby mama just aired everything out on IG Live. Says he hasn\'t seen the kids in months.',
    mediaHeadline: '[BATTLER]\'s Ex Exposes Him as Absent Father on Social Media',
    severityModifier: 0.2,
    tags: ['social_media', 'deadbeat', 'absent'],
  },
  {
    id: 'babymama-03',
    secretType: 'baby-mama-drama',
    title: 'The DNA Test',
    description: 'Drama around whether they\'re actually the father.',
    discoveryMethod: 'blogger',
    discoveryText: 'Word is there\'s a DNA test situation. The results are... complicated.',
    mediaHeadline: 'PATERNITY DRAMA: [BATTLER] Caught Up in DNA Test Controversy',
    severityModifier: 0,
    tags: ['dna', 'paternity', 'drama'],
  },
  {
    id: 'babymama-04',
    secretType: 'baby-mama-drama',
    title: 'The Side Baby',
    description: 'A secret child no one knew about comes to light.',
    discoveryMethod: 'blogger',
    discoveryText: 'Turns out [OPPONENT] has another kid nobody knew about. Different city, different mom.',
    mediaHeadline: 'SECRET FAMILY: [BATTLER] Has Hidden Child in [CITY]',
    severityModifier: 0.1,
    tags: ['secret', 'hidden', 'family'],
  },
  {
    id: 'babymama-05',
    secretType: 'baby-mama-drama',
    title: 'The Cheating Scandal',
    description: 'Caught cheating while their partner was pregnant.',
    discoveryMethod: 'social_media',
    discoveryText: 'Screenshots leaked. [OPPONENT] was in DMs with another woman while his girl was pregnant.',
    mediaHeadline: '[BATTLER] Caught Cheating During Partner\'s Pregnancy',
    severityModifier: 0.2,
    tags: ['cheating', 'pregnant', 'screenshots'],
  },
]

// ========== GOT PRESSED STORYLINES ==========
const PRESSED_STORYLINES: SecretStoryline[] = [
  {
    id: 'pressed-01',
    secretType: 'pressed',
    title: 'The Video Evidence',
    description: 'Footage surfaces of them getting confronted and backing down.',
    discoveryMethod: 'social_media',
    discoveryText: 'A video just dropped. [OPPONENT] got confronted at [LOCATION] and did nothing.',
    mediaHeadline: 'CAUGHT ON CAMERA: [BATTLER] Backs Down From Confrontation',
    severityModifier: 0.3,
    tags: ['video', 'confrontation', 'backed_down'],
  },
  {
    id: 'pressed-02',
    secretType: 'pressed',
    title: 'The Stolen Chain',
    description: 'Someone took their chain and they never got it back.',
    discoveryMethod: 'crew',
    discoveryText: 'Word on the street - [OPPONENT] got his chain snatched at [EVENT] and never pressed about it.',
    mediaHeadline: '[BATTLER]\'s Chain Reportedly Stolen - No Retaliation',
    severityModifier: 0.2,
    tags: ['chain', 'robbery', 'no_response'],
  },
  {
    id: 'pressed-03',
    secretType: 'pressed',
    title: 'The Public Humiliation',
    description: 'They got punked at a public event in front of everyone.',
    discoveryMethod: 'blogger',
    discoveryText: 'Everyone at [EVENT] saw it. [OPPONENT] got punked by [PERSON] and just walked away.',
    mediaHeadline: 'EMBARRASSING: [BATTLER] Humiliated at [EVENT], Does Nothing',
    severityModifier: 0.2,
    tags: ['public', 'humiliation', 'event'],
  },
  {
    id: 'pressed-04',
    secretType: 'pressed',
    title: 'The After-Battle Incident',
    description: 'Something went down after a battle and they didn\'t respond.',
    discoveryMethod: 'crew',
    discoveryText: 'After their battle with [OPPONENT2], something happened backstage. They didn\'t do nothing.',
    mediaHeadline: null, // Backstage, no media
    severityModifier: 0.1,
    tags: ['backstage', 'after_battle', 'incident'],
  },
  {
    id: 'pressed-05',
    secretType: 'pressed',
    title: 'The Hood Violation',
    description: 'They got violated in their own hood and had to move.',
    discoveryMethod: 'crew',
    discoveryText: 'Real ones from their block say [OPPONENT] got ran out. Had to relocate.',
    mediaHeadline: '[BATTLER] Reportedly Forced to Leave Home Neighborhood',
    severityModifier: 0.3,
    tags: ['hood', 'relocated', 'ran_out'],
  },
]

// ========== FILED CHARGES STORYLINES ==========
const CHARGES_FILED_STORYLINES: SecretStoryline[] = [
  {
    id: 'charges-01',
    secretType: 'charges-filed',
    title: 'The Police Report',
    description: 'They filed an actual police report after a street altercation.',
    discoveryMethod: 'research',
    discoveryText: 'You found the police report. [OPPONENT] filed charges against [PERSON] after that incident.',
    mediaHeadline: 'POLICE REPORT: [BATTLER] Filed Charges After Street Incident',
    severityModifier: 0.2,
    tags: ['police_report', 'charges', 'street'],
  },
  {
    id: 'charges-02',
    secretType: 'charges-filed',
    title: 'The Testimony',
    description: 'They testified in court against someone from a beef.',
    discoveryMethod: 'blogger',
    discoveryText: 'Court records show [OPPONENT] took the stand. Testified against the person who pressed them.',
    mediaHeadline: '[BATTLER] Testified in Court Against Street Rival',
    severityModifier: 0.3,
    tags: ['testimony', 'court', 'rival'],
  },
  {
    id: 'charges-03',
    secretType: 'charges-filed',
    title: 'The Restraining Order',
    description: 'They got a restraining order against someone from the scene.',
    discoveryMethod: 'research',
    discoveryText: 'A restraining order was filed. [OPPONENT] went to the courts for protection.',
    mediaHeadline: '[BATTLER] Obtained Restraining Order Against [PERSON]',
    severityModifier: 0.1,
    tags: ['restraining_order', 'protection', 'courts'],
  },
  {
    id: 'charges-04',
    secretType: 'charges-filed',
    title: 'The Lawsuit',
    description: 'They sued someone over an assault instead of handling it in the streets.',
    discoveryMethod: 'blogger',
    discoveryText: 'Instead of handling it, [OPPONENT] filed a civil lawsuit for the assault.',
    mediaHeadline: '[BATTLER] Sues Over Assault Instead of Street Justice',
    severityModifier: 0,
    tags: ['lawsuit', 'civil', 'assault'],
  },
  {
    id: 'charges-05',
    secretType: 'charges-filed',
    title: 'The 911 Call',
    description: 'Audio of them calling 911 during a confrontation surfaces.',
    discoveryMethod: 'social_media',
    discoveryText: 'The 911 audio leaked. That\'s [OPPONENT]\'s voice calling the police mid-situation.',
    mediaHeadline: 'LEAKED: [BATTLER]\'s 911 Call During Street Confrontation',
    severityModifier: 0.3,
    tags: ['911', 'audio', 'leaked'],
  },
]

// ========== SUBSTANCE ABUSE STORYLINES ==========
const SUBSTANCE_ABUSE_STORYLINES: SecretStoryline[] = [
  {
    id: 'substance-01',
    secretType: 'substance-abuse',
    title: 'The Public Incident',
    description: 'They were visibly impaired at a recent event.',
    discoveryMethod: 'blogger',
    discoveryText: 'People are talking about how [OPPONENT] was clearly not sober at [EVENT].',
    mediaHeadline: 'CONCERNING: [BATTLER] Appeared Impaired at Recent Event',
    severityModifier: 0,
    tags: ['public', 'event', 'impaired'],
  },
  {
    id: 'substance-02',
    secretType: 'substance-abuse',
    title: 'The Rehab Stint',
    description: 'They quietly went to rehab but it got leaked.',
    discoveryMethod: 'crew',
    discoveryText: 'Word is [OPPONENT] was in rehab for a month. Tried to keep it quiet.',
    mediaHeadline: '[BATTLER] Reportedly Completed Rehab Program',
    severityModifier: -0.2, // Getting help is less damaging
    tags: ['rehab', 'recovery', 'private'],
  },
  {
    id: 'substance-03',
    secretType: 'substance-abuse',
    title: 'The Battle Performance',
    description: 'Their performance in a recent battle showed clear signs of substance issues.',
    discoveryMethod: 'blogger',
    discoveryText: 'Everyone watching that battle knew something was off. [OPPONENT] was clearly not right.',
    mediaHeadline: 'BATTLE ANALYSIS: Was [BATTLER] Under the Influence During [BATTLE]?',
    severityModifier: 0.1,
    tags: ['battle', 'performance', 'visible'],
  },
  {
    id: 'substance-04',
    secretType: 'substance-abuse',
    title: 'The Social Media Slip',
    description: 'They posted something while clearly intoxicated, then deleted it.',
    discoveryMethod: 'social_media',
    discoveryText: 'Screenshots saved before they deleted. [OPPONENT] was clearly messed up in that video.',
    mediaHeadline: '[BATTLER] Deletes Concerning Video, But Screenshots Remain',
    severityModifier: 0,
    tags: ['social_media', 'deleted', 'screenshots'],
  },
  {
    id: 'substance-05',
    secretType: 'substance-abuse',
    title: 'The Health Scare',
    description: 'They had a health episode related to substance use.',
    discoveryMethod: 'life_event',
    discoveryText: 'Word got out that [OPPONENT] had a health scare. Had to be hospitalized.',
    mediaHeadline: '[BATTLER] Hospitalized - Sources Cite Substance-Related Health Issues',
    severityModifier: 0.2,
    tags: ['health', 'hospitalized', 'serious'],
  },
]

// ========== ADDICTION STORYLINES ==========
const ADDICTION_STORYLINES: SecretStoryline[] = [
  {
    id: 'addiction-01',
    secretType: 'addiction',
    title: 'The Intervention',
    description: 'Their family staged an intervention that got leaked.',
    discoveryMethod: 'life_event',
    discoveryText: 'Someone close to [OPPONENT] says their family tried to intervene. It\'s serious.',
    mediaHeadline: null, // Too personal for media
    severityModifier: 0.1,
    tags: ['family', 'intervention', 'serious'],
  },
  {
    id: 'addiction-02',
    secretType: 'addiction',
    title: 'The Money Problems',
    description: 'Their addiction is causing financial issues - can\'t pay for battles.',
    discoveryMethod: 'crew',
    discoveryText: 'Word is [OPPONENT] has been asking people for money. Their habit is expensive.',
    mediaHeadline: null,
    severityModifier: 0,
    tags: ['money', 'financial', 'struggling'],
  },
  {
    id: 'addiction-03',
    secretType: 'addiction',
    title: 'The Cancelled Appearances',
    description: 'They\'ve been cancelling appearances, and the real reason is their addiction.',
    discoveryMethod: 'blogger',
    discoveryText: 'All those cancelled events? Sources say it\'s because [OPPONENT] can\'t stay clean.',
    mediaHeadline: 'PATTERN EMERGES: [BATTLER]\'s Cancelled Appearances Linked to Personal Issues',
    severityModifier: 0.1,
    tags: ['cancelled', 'unreliable', 'pattern'],
  },
  {
    id: 'addiction-04',
    secretType: 'addiction',
    title: 'The Friend\'s Testimony',
    description: 'A former close friend speaks on their addiction struggles.',
    discoveryMethod: 'blogger',
    discoveryText: 'Someone who used to be close with [OPPONENT] is speaking out. Says it\'s been going on for years.',
    mediaHeadline: 'Former Friend Speaks Out About [BATTLER]\'s Long-Term Struggles',
    severityModifier: 0,
    tags: ['friend', 'testimony', 'years'],
  },
  {
    id: 'addiction-05',
    secretType: 'addiction',
    title: 'The Recovery Relapse',
    description: 'They were doing better but recently relapsed.',
    discoveryMethod: 'life_event',
    discoveryText: 'After months of being clean, [OPPONENT] fell back into old habits.',
    mediaHeadline: null, // Too sensitive
    severityModifier: 0.2,
    tags: ['relapse', 'recovery', 'setback'],
  },
]

// ========== CREW BEEF STORYLINES ==========
const CREW_BEEF_STORYLINES: SecretStoryline[] = [
  {
    id: 'crewbeef-01',
    secretType: 'crew-beef',
    title: 'The Public Fallout',
    description: 'They had a public disagreement with their crew on social media.',
    discoveryMethod: 'social_media',
    discoveryText: '[OPPONENT] and [CREW MEMBER] were going back and forth on Twitter. Shit got ugly.',
    mediaHeadline: '[BATTLER] and [CREW] Exchange Words Online - Tensions Rising',
    severityModifier: 0,
    tags: ['public', 'twitter', 'argument'],
  },
  {
    id: 'crewbeef-02',
    secretType: 'crew-beef',
    title: 'The Money Dispute',
    description: 'There\'s tension over money within the crew.',
    discoveryMethod: 'crew',
    discoveryText: 'Word is [OPPONENT] owes people in their camp money. Things are tense.',
    mediaHeadline: null,
    severityModifier: 0.1,
    tags: ['money', 'dispute', 'camp'],
  },
  {
    id: 'crewbeef-03',
    secretType: 'crew-beef',
    title: 'The Event Absence',
    description: 'Their crew didn\'t show up to support them at a big battle.',
    discoveryMethod: 'blogger',
    discoveryText: 'Notice how none of [OPPONENT]\'s crew was at their last battle? There\'s a reason.',
    mediaHeadline: '[CREW] Notably Absent From [BATTLER]\'s Recent Performance',
    severityModifier: -0.1,
    tags: ['absent', 'no_support', 'battle'],
  },
  {
    id: 'crewbeef-04',
    secretType: 'crew-beef',
    title: 'The Former Member',
    description: 'A former crew member is speaking on what really happened.',
    discoveryMethod: 'blogger',
    discoveryText: 'Someone who left [OPPONENT]\'s camp is talking. Says there\'s way more to the story.',
    mediaHeadline: 'Ex-Member Speaks: Inside the [CREW] Drama',
    severityModifier: 0.1,
    tags: ['former_member', 'expose', 'inside'],
  },
  {
    id: 'crewbeef-05',
    secretType: 'crew-beef',
    title: 'The Creative Differences',
    description: 'They\'re beefing with their crew over the direction of their career.',
    discoveryMethod: 'crew',
    discoveryText: '[OPPONENT] wants to go solo but their crew ain\'t having it. Tensions high.',
    mediaHeadline: null,
    severityModifier: -0.1, // Less serious
    tags: ['creative', 'solo', 'direction'],
  },
]

// ========== NO SHOW STORYLINES ==========
const NO_SHOW_STORYLINES: SecretStoryline[] = [
  {
    id: 'noshow-01',
    secretType: 'no-show',
    title: 'The Last Minute Cancel',
    description: 'They cancelled a battle the day before it was supposed to happen.',
    discoveryMethod: 'blogger',
    discoveryText: 'Remember when [OPPONENT] cancelled on [BATTLER2] last minute? Everyone remembers.',
    mediaHeadline: '[BATTLER] Cancels Battle Hours Before Event, Leaves Opponent Stranded',
    severityModifier: 0.1,
    tags: ['cancel', 'last_minute', 'unreliable'],
  },
  {
    id: 'noshow-02',
    secretType: 'no-show',
    title: 'The Pattern',
    description: 'They have a history of ducking tough opponents.',
    discoveryMethod: 'research',
    discoveryText: 'Looking at their battle history - they\'ve ducked [OPPONENT2], [OPPONENT3], and [OPPONENT4].',
    mediaHeadline: 'ANALYSIS: [BATTLER]\'s Pattern of Avoiding Top-Tier Competition',
    severityModifier: 0.2,
    tags: ['pattern', 'ducking', 'top_tier'],
  },
  {
    id: 'noshow-03',
    secretType: 'no-show',
    title: 'The Excuse',
    description: 'Their excuse for missing a battle was proven false.',
    discoveryMethod: 'social_media',
    discoveryText: 'They said they were sick, but someone posted them at a party that same night.',
    mediaHeadline: '[BATTLER]\'s "Illness" Excuse Contradicted by Social Media Posts',
    severityModifier: 0.2,
    tags: ['excuse', 'lie', 'caught'],
  },
  {
    id: 'noshow-04',
    secretType: 'no-show',
    title: 'The League Ban',
    description: 'A league banned them for no-showing too many times.',
    discoveryMethod: 'blogger',
    discoveryText: '[LEAGUE] won\'t book [OPPONENT] anymore. Too many no-shows.',
    mediaHeadline: '[BATTLER] Blacklisted by [LEAGUE] Over Repeated No-Shows',
    severityModifier: 0.1,
    tags: ['banned', 'league', 'blacklist'],
  },
  {
    id: 'noshow-05',
    secretType: 'no-show',
    title: 'The Scared Theory',
    description: 'Word is they no-showed because they were intimidated by the opponent.',
    discoveryMethod: 'crew',
    discoveryText: 'People saying [OPPONENT] ducked that battle because they were scared of [BATTLER2].',
    mediaHeadline: null, // Speculation
    severityModifier: 0.2,
    tags: ['scared', 'intimidated', 'ducked'],
  },
]

// ========== BROKE STORYLINES ==========
const BROKE_STORYLINES: SecretStoryline[] = [
  {
    id: 'broke-01',
    secretType: 'broke',
    title: 'The Eviction',
    description: 'They got evicted from their apartment.',
    discoveryMethod: 'crew',
    discoveryText: 'Word is [OPPONENT] got evicted. Had to move back with family.',
    mediaHeadline: null, // Too personal
    severityModifier: 0.1,
    tags: ['eviction', 'housing', 'family'],
  },
  {
    id: 'broke-02',
    secretType: 'broke',
    title: 'The Car Repo',
    description: 'Their car got repossessed.',
    discoveryMethod: 'social_media',
    discoveryText: 'Someone spotted [OPPONENT]\'s car getting towed. Repo man came through.',
    mediaHeadline: null,
    severityModifier: 0,
    tags: ['repo', 'car', 'financial'],
  },
  {
    id: 'broke-03',
    secretType: 'broke',
    title: 'The Battle Loans',
    description: 'They\'ve been borrowing money from other battlers.',
    discoveryMethod: 'crew',
    discoveryText: '[OPPONENT] been asking everybody for loans. Multiple people in the scene.',
    mediaHeadline: null,
    severityModifier: 0.1,
    tags: ['loans', 'borrowing', 'battlers'],
  },
  {
    id: 'broke-04',
    secretType: 'broke',
    title: 'The Fake Flex',
    description: 'Their social media flex is all rented/borrowed.',
    discoveryMethod: 'blogger',
    discoveryText: 'That watch in their posts? Rented. The car? Borrowed. The chain? Fake.',
    mediaHeadline: '[BATTLER]\'s Social Media Flex Exposed as Rented Props',
    severityModifier: 0,
    tags: ['flex', 'rented', 'fake'],
  },
  {
    id: 'broke-05',
    secretType: 'broke',
    title: 'The Tax Problems',
    description: 'They\'re in trouble with the IRS.',
    discoveryMethod: 'research',
    discoveryText: 'Tax liens filed against [OPPONENT]. They owe the government money.',
    mediaHeadline: '[BATTLER] Facing Tax Issues - Liens Filed',
    severityModifier: 0.2,
    tags: ['taxes', 'irs', 'liens'],
  },
]

// ========== SHADY DEAL STORYLINES ==========
const SHADY_DEAL_STORYLINES: SecretStoryline[] = [
  {
    id: 'shady-01',
    secretType: 'shady-deal',
    title: 'The Fixed Battle',
    description: 'They allegedly took money to throw a battle.',
    discoveryMethod: 'crew',
    discoveryText: 'Word is [OPPONENT] got paid to lose that battle against [BATTLER2].',
    mediaHeadline: 'MATCH FIXING?: Allegations Surface About [BATTLER] vs [BATTLER2]',
    severityModifier: 0.3,
    tags: ['fixed', 'paid', 'throw'],
  },
  {
    id: 'shady-02',
    secretType: 'shady-deal',
    title: 'The Scam',
    description: 'They scammed fans or other battlers.',
    discoveryMethod: 'social_media',
    discoveryText: 'People saying [OPPONENT] took money for verses and never delivered.',
    mediaHeadline: 'SCAM ALERT: [BATTLER] Accused of Taking Money, Not Delivering',
    severityModifier: 0.2,
    tags: ['scam', 'money', 'fans'],
  },
  {
    id: 'shady-03',
    secretType: 'shady-deal',
    title: 'The League Deal',
    description: 'They\'re getting special treatment from a league for suspicious reasons.',
    discoveryMethod: 'blogger',
    discoveryText: 'Why does [OPPONENT] always get booked by [LEAGUE]? Blogger says there\'s a deal.',
    mediaHeadline: 'FAVORITISM?: Questions About [BATTLER]\'s Relationship With [LEAGUE]',
    severityModifier: 0,
    tags: ['league', 'favoritism', 'deal'],
  },
  {
    id: 'shady-04',
    secretType: 'shady-deal',
    title: 'The Blackmail',
    description: 'They allegedly blackmailed someone in the scene.',
    discoveryMethod: 'crew',
    discoveryText: 'Someone says [OPPONENT] threatened to expose them unless they did something.',
    mediaHeadline: null, // Too serious for media to run without proof
    severityModifier: 0.2,
    tags: ['blackmail', 'threat', 'expose'],
  },
  {
    id: 'shady-05',
    secretType: 'shady-deal',
    title: 'The Stolen Music',
    description: 'They\'re profiting from music they don\'t have rights to.',
    discoveryMethod: 'blogger',
    discoveryText: '[OPPONENT] is making money off tracks they don\'t own. Original artist is mad.',
    mediaHeadline: '[BATTLER] Accused of Profiting From Stolen Music',
    severityModifier: 0.1,
    tags: ['music', 'stolen', 'profit'],
  },
]

// ========== MENTAL HEALTH STORYLINES ==========
const MENTAL_HEALTH_STORYLINES: SecretStoryline[] = [
  {
    id: 'mental-01',
    secretType: 'mental-health',
    title: 'The Breakdown',
    description: 'They had a public breakdown that got recorded.',
    discoveryMethod: 'social_media',
    discoveryText: 'That video of [OPPONENT] at [EVENT]... they were clearly going through something.',
    mediaHeadline: null, // Media won't run this
    severityModifier: 0.1,
    tags: ['breakdown', 'public', 'video'],
  },
  {
    id: 'mental-02',
    secretType: 'mental-health',
    title: 'The Hospitalization',
    description: 'They were hospitalized for mental health reasons.',
    discoveryMethod: 'life_event',
    discoveryText: 'Close sources say [OPPONENT] was in a facility for a while. Getting help.',
    mediaHeadline: null,
    severityModifier: -0.1, // Getting help is less negative
    tags: ['hospital', 'facility', 'help'],
  },
  {
    id: 'mental-03',
    secretType: 'mental-health',
    title: 'The Medication',
    description: 'Word leaked about their medication situation.',
    discoveryMethod: 'crew',
    discoveryText: 'Someone close says [OPPONENT] is on medication for their mental health.',
    mediaHeadline: null,
    severityModifier: 0,
    tags: ['medication', 'treatment', 'private'],
  },
  {
    id: 'mental-04',
    secretType: 'mental-health',
    title: 'The Social Media Posts',
    description: 'They\'ve been posting concerning things on social media.',
    discoveryMethod: 'social_media',
    discoveryText: 'Have you seen [OPPONENT]\'s recent posts? People are worried.',
    mediaHeadline: null,
    severityModifier: 0,
    tags: ['posts', 'concerning', 'worried'],
  },
  {
    id: 'mental-05',
    secretType: 'mental-health',
    title: 'The Time Off',
    description: 'The real reason they took time off from battling.',
    discoveryMethod: 'blogger',
    discoveryText: 'That hiatus [OPPONENT] took? Blogger says it was to work on their mental health.',
    mediaHeadline: '[BATTLER]\'s Hiatus: Sources Say Mental Health Was the Reason',
    severityModifier: -0.2,
    tags: ['hiatus', 'time_off', 'recovery'],
  },
]

// ========== EXPORT ALL STORYLINES ==========
export const ALL_SECRET_STORYLINES: SecretStoryline[] = [
  ...SNITCH_STORYLINES,
  ...FAKE_GANGSTER_STORYLINES,
  ...GHOSTWRITER_STORYLINES,
  ...STOLEN_BARS_STORYLINES,
  ...BABY_MAMA_STORYLINES,
  ...PRESSED_STORYLINES,
  ...CHARGES_FILED_STORYLINES,
  ...SUBSTANCE_ABUSE_STORYLINES,
  ...ADDICTION_STORYLINES,
  ...CREW_BEEF_STORYLINES,
  ...NO_SHOW_STORYLINES,
  ...BROKE_STORYLINES,
  ...SHADY_DEAL_STORYLINES,
  ...MENTAL_HEALTH_STORYLINES,
]

// Helper to get storylines by secret type
export function getStorylinesForSecret(secretType: SecretType): SecretStoryline[] {
  return ALL_SECRET_STORYLINES.filter(s => s.secretType === secretType)
}

// Helper to get random storyline for a secret type
export function getRandomStoryline(secretType: SecretType): SecretStoryline | null {
  const storylines = getStorylinesForSecret(secretType)
  if (storylines.length === 0) return null
  return storylines[Math.floor(Math.random() * storylines.length)]
}

// Helper to get storylines by discovery method
export function getStorylinesbyDiscoveryMethod(method: DiscoveryMethod): SecretStoryline[] {
  return ALL_SECRET_STORYLINES.filter(s => s.discoveryMethod === method)
}

// Total count
export const STORYLINE_COUNT = ALL_SECRET_STORYLINES.length
