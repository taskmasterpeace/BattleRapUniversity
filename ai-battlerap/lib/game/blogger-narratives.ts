/**
 * Blogger Narratives - Non-LLM Article Body Generation
 *
 * Generates battle recap article bodies using templates and battle data
 * without requiring an LLM call. Used as fallback or for simpler recaps.
 */

export interface BattlePerformanceData {
  battlerName: string;
  crowdAverage: number;
  haymakers: number;
  chokes: number;
  stumbles: number;
  roundsWon: number;
  isWinner: boolean;
}

export interface BattleNarrativeInput {
  bloggerId: string;
  winner: BattlePerformanceData;
  loser: BattlePerformanceData;
  decision: 'bodybag_30' | 'clear_30' | 'clear_21' | 'edge' | 'classic' | 'comeback';
  isUpset: boolean;
  leagueName: string;
}

// Decision type descriptions
const DECISION_DESCRIPTIONS: Record<string, { short: string; detailed: string }> = {
  bodybag_30: {
    short: '3-0 dominant victory',
    detailed: 'completely dominated every round, leaving no room for debate'
  },
  clear_30: {
    short: '3-0 clear win',
    detailed: 'took all three rounds with a convincing performance'
  },
  clear_21: {
    short: '2-1 clear decision',
    detailed: 'edged out two rounds in what was a competitive battle'
  },
  edge: {
    short: '2-1 edge',
    detailed: 'narrowly took the battle in a close 2-1 decision'
  },
  classic: {
    short: '2-1 classic',
    detailed: 'emerged victorious in a battle that will be talked about for years'
  },
  comeback: {
    short: 'comeback victory',
    detailed: 'pulled off an incredible comeback after a rocky start'
  }
};

// Performance descriptors
function getPerformanceDescriptor(crowdAverage: number): string {
  if (crowdAverage >= 90) return 'electric';
  if (crowdAverage >= 80) return 'excellent';
  if (crowdAverage >= 70) return 'strong';
  if (crowdAverage >= 60) return 'solid';
  if (crowdAverage >= 50) return 'mixed';
  if (crowdAverage >= 40) return 'underwhelming';
  return 'disappointing';
}

function getHaymakerDescription(count: number): string {
  if (count >= 3) return `delivered ${count} haymaker moments that had the crowd going crazy`;
  if (count === 2) return 'had a couple of standout moments that landed hard';
  if (count === 1) return 'landed one memorable haymaker';
  return 'kept it steady without any major haymaker moments';
}

function getChokeDescription(chokes: number, stumbles: number): string {
  if (chokes > 0 && stumbles > 0) {
    return `struggled with ${chokes} choke${chokes > 1 ? 's' : ''} and ${stumbles} stumble${stumbles > 1 ? 's' : ''}`;
  }
  if (chokes > 0) {
    return `had ${chokes} devastating choke${chokes > 1 ? 's' : ''} that derailed their performance`;
  }
  if (stumbles > 0) {
    return `had ${stumbles} stumble${stumbles > 1 ? 's' : ''} but managed to recover`;
  }
  return 'delivered a clean performance with no major mistakes';
}

/**
 * Generate a narrative article body without LLM
 */
export function generateNarrativeArticleBody(input: BattleNarrativeInput): string {
  const { winner, loser, decision, isUpset, leagueName } = input;

  const decisionInfo = DECISION_DESCRIPTIONS[decision] || DECISION_DESCRIPTIONS.clear_21;
  const winnerPerformance = getPerformanceDescriptor(winner.crowdAverage);
  const loserPerformance = getPerformanceDescriptor(loser.crowdAverage);

  const paragraphs: string[] = [];

  // Opening paragraph
  if (isUpset) {
    paragraphs.push(
      `In a shocking turn of events at ${leagueName}, **${winner.battlerName}** pulled off the upset of the night against **${loser.battlerName}**, securing a ${decisionInfo.short}. The underdog ${decisionInfo.detailed}, proving that on any given night, anything can happen in battle rap.`
    );
  } else {
    paragraphs.push(
      `**${winner.battlerName}** defeated **${loser.battlerName}** in a ${decisionInfo.short} at ${leagueName}. ${winner.battlerName} ${decisionInfo.detailed}, earning the well-deserved victory.`
    );
  }

  // Winner breakdown
  const winnerHaymakers = getHaymakerDescription(winner.haymakers);
  const winnerMistakes = getChokeDescription(winner.chokes, winner.stumbles);
  paragraphs.push(
    `${winner.battlerName} came with ${winnerPerformance} energy throughout the battle. They ${winnerHaymakers}. On the execution side, ${winner.battlerName} ${winnerMistakes}.`
  );

  // Loser breakdown
  const loserHaymakers = getHaymakerDescription(loser.haymakers);
  const loserMistakes = getChokeDescription(loser.chokes, loser.stumbles);
  paragraphs.push(
    `${loser.battlerName} had a ${loserPerformance} showing. They ${loserHaymakers}. However, ${loser.battlerName} ${loserMistakes}.`
  );

  // Round breakdown
  if (decision === 'bodybag_30' || decision === 'clear_30') {
    paragraphs.push(
      `The rounds told the story clearly. ${winner.battlerName} won all three rounds (${winner.roundsWon}-${loser.roundsWon}), never giving ${loser.battlerName} a chance to build momentum. This was a dominant performance from start to finish.`
    );
  } else if (decision === 'classic') {
    paragraphs.push(
      `This battle was neck and neck throughout. Both battlers brought their A-game, making it one of those rare classics where either battler could have gotten the nod. ${winner.battlerName} took it ${winner.roundsWon}-${loser.roundsWon}, but expect this to be debated for a long time.`
    );
  } else if (decision === 'comeback') {
    paragraphs.push(
      `What started rough for ${winner.battlerName} turned into a masterclass in resilience. After losing early, they dug deep and rallied back to take the battle ${winner.roundsWon}-${loser.roundsWon}. This is the kind of heart that separates good battlers from great ones.`
    );
  } else {
    paragraphs.push(
      `The final tally came in at ${winner.roundsWon}-${loser.roundsWon} in favor of ${winner.battlerName}. While ${loser.battlerName} had their moments, it wasn't enough to overcome their opponent's overall performance.`
    );
  }

  // Closing
  if (isUpset) {
    paragraphs.push(
      `This upset will shake up the rankings and put ${winner.battlerName} on notice as a serious threat. Meanwhile, ${loser.battlerName} will need to regroup after this unexpected loss.`
    );
  } else if (decision === 'bodybag_30') {
    paragraphs.push(
      `This was a statement victory for ${winner.battlerName}. The kind of dominant performance that sends a message to the entire league.`
    );
  } else {
    paragraphs.push(
      `A solid win for ${winner.battlerName} that adds to their resume. Both battlers showed why they belong on this stage.`
    );
  }

  return paragraphs.join('\n\n');
}
