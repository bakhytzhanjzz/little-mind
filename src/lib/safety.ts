/**
 * Phrases in a child's note that mean an adult should step in today.
 * A keyword list, not a classifier: it will miss things and occasionally
 * over-match. It only decides when to show fixed, human-written guidance.
 * Covers English plus common Russian and Kazakh phrasings.
 */
const CONCERN = [
  /\b(kill(ing)?|hurt(ing)?|cut(ting)?|harm(ing)?) my ?self\b/i,
  /\bsuicid/i,
  /\bself[- ]?harm/i,
  /\b(want to|wanna|going to|gonna) die\b/i,
  /\bwish i (was|were) dead\b/i,
  /\bdon'?t want to (live|be alive|exist|be here)( anymore)?\b/i,
  /\bend (it all|my life)\b/i,
  /убить себя|убью себя|покончить с собой|суицид|не хочу жить|хочу умереть|порезать себя|режу себя/i,
  /өзімді өлтір|өлгім келеді|өмір сүргім келмейді/i,
];

export function needsAdultAttention(note: string | null | undefined): boolean {
  return Boolean(note) && CONCERN.some((re) => re.test(note!));
}
