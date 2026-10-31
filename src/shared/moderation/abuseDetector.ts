/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ModerationResult {
  isAbusive: boolean;
  reason?: string;
}

export const ABUSE_WARNING_TITLE = "Let's keep Circles a safe space 💜";

export const ABUSE_WARNING_MESSAGE =
  "Some of the words in your message may be hurtful or abusive towards others. We want everyone to feel respected, supported and comfortable sharing here.\n\nPlease review your wording and edit your message before posting.";

/**
 * Normalizes text for moderation:
 * - Lowercases
 * - Converts common leetspeak substitutions
 * - Handles spaced-out or punctuation-interspersed letters
 */
function normalizeForModeration(raw: string): string {
  let text = raw.toLowerCase();

  // Straighten quotes
  text = text.replace(/[’‘`´]/g, "'");

  // Common leetspeak substitutions
  const leetMap: Record<string, string> = {
    '@': 'a',
    '4': 'a',
    '8': 'b',
    '3': 'e',
    '1': 'i',
    '!': 'i',
    '|': 'i',
    '0': 'o',
    '5': 's',
    '$': 's',
    '7': 't',
    '+': 't',
  };

  let deobfuscated = '';
  for (const ch of text) {
    deobfuscated += leetMap[ch] || ch;
  }

  return deobfuscated;
}

/**
 * Strips punctuation and collapses spaces to check for hidden spaced-out words
 * like "b i t c h" or "s-l-u-t"
 */
function collapseSpacedWords(text: string): string {
  // Replace non-alphanumeric with empty string for pure letter sequences
  return text.replace(/[^a-z0-9]/gi, '');
}

/**
 * Evaluates whether a given text contains abusive, insulting, degrading,
 * harassing, or bullying language directed at someone, while carefully preserving:
 * - Harmless emotional expressions (e.g., "I had a shitty day", "damn exams")
 * - Distressed self-talk (e.g., "I feel like a loser", "I feel like nobody likes me")
 * - Respectful disagreements (e.g., "I disagree with your advice")
 */
export function checkAbusiveContent(rawText: string): ModerationResult {
  if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
    return { isAbusive: false };
  }

  const normalized = normalizeForModeration(rawText);
  const cleanWordTokens = normalized.replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const collapsed = collapseSpacedWords(normalized);

  // 1. Unconditional Slurs & Severe Degrading Words
  // Words that are universally abusive/degrading in any community context
  const severeSlurs = [
    /\bslut(s)?\b/i,
    /\bwhore(s)?\b/i,
    /\bcunt(s)?\b/i,
    /\bskank(s)?\b/i,
    /\bretard(ed|s)?\b/i,
    /\bnigg(er|a|ers|as)\b/i,
    /\bfag(got|gots)?\b/i,
    /\btranny\b/i,
  ];

  for (const pattern of severeSlurs) {
    if (pattern.test(cleanWordTokens)) {
      return { isAbusive: true, reason: ABUSE_WARNING_MESSAGE };
    }
  }

  // Also check collapsed version for spaced/leetspeak slurs (e.g., "s.l.u.t", "c.u.n.t", "w.h.o.r.e")
  const collapsedSlurPatterns = [
    /s+l+u+t+/i,
    /w+h+o+r+e+/i,
    /c+u+n+t+/i,
    /s+k+a+n+k+/i,
    /r+e+t+a+r+d+/i,
    /n+i+g+g+[ea]r?/i,
    /f+a+g+g?o?t?/i,
  ];

  for (const pattern of collapsedSlurPatterns) {
    if (pattern.test(collapsed)) {
      return { isAbusive: true, reason: ABUSE_WARNING_MESSAGE };
    }
  }

  // 2. Targeted Harassment, Hostility & Attacks
  // Targeted suicide incitement, threats, or severe personal attacks
  const targetedHarassment = [
    /\b(kys|kill yourself|go die|drink bleach|drop dead)\b/i,
    /\b(no one|nobody|no-one|no1)\s+(likes|loves|cares about|wants)\s+you\b/i,
    /\b(everyone|everybody)\s+(hates|despises)\s+you\b/i,
    /\b(fuck|f\*\*k|f\*ck)\s+(you|u|urself|yourself|off)\b/i,
    /\b(screw|hate)\s+(you|u)\b/i,
    /\b(die|burn)\s+in\s+hell\b/i,
    /\bget\s+a\s+life\b/i,
    /\bshut\s+(the\s+fuck\s+up|up|tfu)\b/i,
    /\byou\s+are\s+(a\s+)?(piece of shit|pos|waste of (breath|space|life)|disgusting|pathetic|worthless|ugly|trash|garbage)\b/i,
    /\bu\s+are\s+(a\s+)?(piece of shit|pos|waste of (breath|space|life)|disgusting|pathetic|worthless|ugly|trash|garbage)\b/i,
    /\byou're\s+(a\s+)?(piece of shit|pos|waste of (breath|space|life)|disgusting|pathetic|worthless|ugly|trash|garbage)\b/i,
    /\byoure\s+(a\s+)?(piece of shit|pos|waste of (breath|space|life)|disgusting|pathetic|worthless|ugly|trash|garbage)\b/i,
  ];

  for (const pattern of targetedHarassment) {
    if (pattern.test(cleanWordTokens)) {
      return { isAbusive: true, reason: ABUSE_WARNING_MESSAGE };
    }
  }

  // 3. Contextual Insults (e.g., "bitch", "loser", "idiot", "moron", "stupid", "dumb", "clown", "pathetic", "worthless")
  // Check if directed at someone: e.g. "you are a loser", "you're so pathetic", "she is an idiot"
  // Contrast with self-directed: "I feel like a loser" (allowed!), "My day is a bitch" (allowed!)
  const targetedInsultPattern =
    /\b(you\s+(are|r)|you're|youre|u\s+(are|r)|ur|she\s+is|he\s+is|they\s+are)\s+(a\s+|an\s+|so\s+|such\s+a\s+|really\s+|totally\s+|completely\s+|just\s+(a\s+)?)?(loser|idiot|bitch|moron|dumbass|asshole|bastard|creep|freak|fatso|ugly|clown|stupid|worthless|pathetic|disgusting|trash|garbage|hopeless)\b/i;

  if (targetedInsultPattern.test(cleanWordTokens)) {
    return { isAbusive: true, reason: ABUSE_WARNING_MESSAGE };
  }

  // Direct address insult: "bitch", "loser", "shut up idiot", "stfu loser", "hey moron"
  const directAddressInsult =
    /\b(hey|listen|stfu|shut\s+up)?\s*(you\s+)?(bitch|loser|idiot|moron|dumbass|asshole|bastard)\b/i;

  // If text starts with or is just an insult, e.g. "Loser.", "Bitch.", "You loser.", "Pathetic."
  const startsWithInsult =
    /^(you\s+)?(bitch|loser|idiot|moron|dumbass|asshole|bastard|slut|whore|pathetic|disgusting|worthless)[\s.!,?]*$/i;
  if (startsWithInsult.test(cleanWordTokens)) {
    return { isAbusive: true, reason: ABUSE_WARNING_MESSAGE };
  }

  // Spaced-out variants of "bitch" (e.g., "b i t c h", "b-i-t-c-h")
  if (/b+i+t+c+h+/i.test(collapsed)) {
    // Check if not self-distress
    const isSelfDirected = /\b(i feel|i am|im|feeling like a bitch|anxiety is a bitch|life is a bitch)\b/i.test(
      cleanWordTokens
    );
    if (!isSelfDirected) {
      return { isAbusive: true, reason: ABUSE_WARNING_MESSAGE };
    }
  }

  // Spaced-out variants of "loser" directed at someone (e.g., "u l o s e r", "you are a l0ser")
  if (/l+o+s+e+r+/i.test(collapsed)) {
    const isSelfDirected = /\b(i am|im|i feel|feeling like|myself|i'm)\s+(a\s+)?loser\b/i.test(
      cleanWordTokens
    );
    const isTargeted = /\b(you|u|ur|they|he|she)\b/i.test(cleanWordTokens);
    if (isTargeted && !isSelfDirected) {
      return { isAbusive: true, reason: ABUSE_WARNING_MESSAGE };
    }
  }

  return { isAbusive: false };
}
