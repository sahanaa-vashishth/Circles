export interface GuardianSession {
  active: boolean;
  highestLevel: 1 | 2 | 3;
  cardShown: boolean;
  safetyConfirmed: boolean;
}

export interface GuardianCheckResult {
  level: 1 | 2 | 3;
  showCard: boolean;
  session: GuardianSession;
}

/**
 * Normalises input text:
 * - lowercase
 * - straighten apostrophes
 * - expand contractions ("im" -> "i am", "dont" -> "do not", "cant" -> "cannot")
 * - strip punctuation and normalize whitespace
 */
export function normalizeText(raw: string): string {
  if (!raw) return '';

  let text = raw.toLowerCase();

  // Straighten curly / non-standard apostrophes
  text = text.replace(/[’‘`´]/g, "'");

  // Expand common contractions before punctuation removal
  text = text.replace(/\bi['’]?m\b/g, 'i am');
  text = text.replace(/\bdon['’]?t\b/g, 'do not');
  text = text.replace(/\bcan['’]?t\b/g, 'cannot');
  text = text.replace(/\bwon['’]?t\b/g, 'will not');
  text = text.replace(/\bi['’]?ve\b/g, 'i have');
  text = text.replace(/\bi['’]?d\b/g, 'i would');
  text = text.replace(/\bit['’]?s\b/g, 'it is');

  // Strip punctuation (replace non-alphanumeric with spaces)
  text = text.replace(/[^a-z0-9\s]/g, ' ');

  // Collapse multiple whitespace
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

/**
 * Strips explicit denials so they cannot trigger concern or crisis levels.
 * Negated urges are removed first so they do not trigger urge patterns.
 */
export function stripDenials(text: string): string {
  const denials = [
    /\bno urge\b/g,
    /\bnot have an urge\b/g,
    /\bdo not have an urge\b/g,
    /\bi do not want to die\b/g,
    /\bdo not want to die\b/g,
    /\bi do not feel like killing myself\b/g,
    /\bdo not feel like killing myself\b/g,
    /\bnot feel like killing myself\b/g,
    /\bi am not suicidal\b/g,
    /\bnot suicidal\b/g,
    /\bi am not thinking about suicide\b/g,
    /\bnot thinking about suicide\b/g,
    /\bdo not want to kill myself\b/g,
    /\bdo not want to hurt myself\b/g,
    /\bnot going to kill myself\b/g,
    /\bnot planning to die\b/g,
    /\bno desire to die\b/g,
  ];

  let cleaned = text;
  for (const denial of denials) {
    cleaned = cleaned.replace(denial, ' ');
  }

  return cleaned.replace(/\s+/g, ' ').trim();
}

/**
 * Detects whether the user is explicitly confirming safety.
 */
function isSafetyConfirmed(text: string): boolean {
  return /\b(yes i am safe|i am safe|am safe|im safe|safe right now|feeling safe right now|safe here)\b/.test(
    text
  );
}

/**
 * Detects historical or hypothetical mentions of suicide / self-harm.
 * These are classified as Level 1 (no card).
 */
function isHistoricalOrHypothetical(text: string): boolean {
  // Historical mentions (past events, years ago, etc.)
  const historicalPattern =
    /\b(attempted suicide|tried to kill myself|tried to die|wanted to die|was suicidal|thought about suicide|past suicide attempt|history of suicide)\b.*?\b(\d+\s+(years|months|weeks|days)\s+ago|years ago|months ago|in the past|back then|when i was|used to feel simpler)\b/;
  const historicalReversed =
    /\b(\d+\s+(years|months|weeks|days)\s+ago|in the past|back then)\b.*?\b(attempted suicide|tried to kill myself|tried to die|suicide attempt|wanted to die)\b/;

  // Educational, hypothetical, or research contexts
  const researchPattern =
    /\b(writing|reading|researching|studying|paper|essay|article|book|documentary)\b.*?\b(on|about|regarding)\s+suicide\b/;
  const hypotheticalPattern =
    /\b(hypothetical|hypothetically|in theory|what if someone|academic)\b.*?\bsuicide\b/;

  return (
    historicalPattern.test(text) ||
    historicalReversed.test(text) ||
    researchPattern.test(text) ||
    hypotheticalPattern.test(text) ||
    text.includes('things used to feel simpler')
  );
}

/**
 * Evaluates the user's text and current session to determine risk level and whether to show the card.
 */
export function guardianCheck(
  rawText: string,
  clientSession?: GuardianSession | null
): GuardianCheckResult {
  // Initialize default session if not provided
  const session: GuardianSession = {
    active: clientSession?.active ?? false,
    highestLevel: clientSession?.highestLevel ?? 1,
    cardShown: clientSession?.cardShown ?? false,
    safetyConfirmed: clientSession?.safetyConfirmed ?? false,
  };

  const normalized = normalizeText(rawText);

  // Check safety confirmation (e.g. "yes im safe")
  if (isSafetyConfirmed(normalized)) {
    session.safetyConfirmed = true;
  }

  // Strip explicit denials first, including negated urges
  const sanitized = stripDenials(normalized);

  // If text is empty or only had denials, it's Level 1
  if (!sanitized) {
    return {
      level: 1,
      showCard: false,
      session,
    };
  }

  // Level 3 (immediate): present intent plus a time, means, or plan.
  // Examples: "tonight", "today", "right now", "pills", "rope", "plan to end my life", "going to end it"
  const immediateIntentPhrases = [
    /\bplan to end my life\b/,
    /\bgoing to end it\b/,
    /\babout to end it\b/,
    /\bgoing to kill myself\b/,
    /\bplan to kill myself\b/,
    /\btaking them tonight\b/,
    /\bhave pills and i am taking them\b/,
    /\bhang myself\b/,
    /\bswallow pills\b/,
    /\boverdose\b/,
  ];

  const hasImmediateIntentPhrase = immediateIntentPhrases.some((pattern) =>
    pattern.test(sanitized)
  );

  const suicidalIntentKeywords =
    /\b(want to die|wanting to die|kill myself|killing myself|end my life|ending my life|end it all|ending it all|suicide|suicidal|take my life|taking my life|taking them|hurt myself|hurting myself|cut myself|cutting myself|urge to|have an urge|want to do it|thinking about doing it|feel like doing it)\b/;
  const timeOrMeansOrPlan =
    /\b(tonight|today|right now|this evening|in a few minutes|pills|rope|knife|razor|bridge|overdose|plan)\b/;

  const hasIntentAndTimeOrMeans =
    (suicidalIntentKeywords.test(sanitized) && timeOrMeansOrPlan.test(sanitized)) ||
    (sanitized.includes('pills') &&
      (sanitized.includes('tonight') || sanitized.includes('today')));

  const isLevel3 = hasImmediateIntentPhrase || hasIntentAndTimeOrMeans;

  // Level 2 (concern): present thoughts or urges without a time/means.
  // Urge patterns added after denial stripping and before historical check:
  // /\burge to\b/, /\bhave an urge\b/, /\bwant to do it\b/, /\bthinking about doing it\b/, /\bfeel like doing it\b/
  const urgePatterns = [
    /\burge to\b/,
    /\bhave an urge\b/,
    /\bwant to do it\b/,
    /\bthinking about doing it\b/,
    /\bfeel like doing it\b/,
  ];

  const concernPhrases = [
    ...urgePatterns,
    /\bwant to die\b/,
    /\bwanting to die\b/,
    /\bkill myself\b/,
    /\bkilling myself\b/,
    /\bdo not deserve to live\b/,
    /\bdeserve to be alive\b/,
    /\bbetter off dead\b/,
    /\bno reason to live\b/,
    /\bcannot go on living\b/,
    /\bhurt myself\b/,
    /\bhurting myself\b/,
    /\bcut myself\b/,
    /\bcutting myself\b/,
    /\bdo not deserve to be alive\b/,
    /\bwish i was dead\b/,
    /\bwish i were dead\b/,
    /\bend my life\b/,
    /\bending my life\b/,
    /\bend it all\b/,
    /\bending it all\b/,
    /\bno point in living\b/,
    /\bdo not want to live\b/,
    /\bdo not want to exist\b/,
    /\bsuicidal\b/,
  ];

  const isLevel2 = !isLevel3 && concernPhrases.some((pattern) => pattern.test(sanitized));

  // Check historical or hypothetical mentions (only if not Level 3 and not Level 2)
  if (!isLevel3 && !isLevel2 && isHistoricalOrHypothetical(sanitized)) {
    return {
      level: 1,
      showCard: false,
      session,
    };
  }

  let rawLevel: 1 | 2 | 3 = 1;
  if (isLevel3) {
    rawLevel = 3;
  } else if (isLevel2) {
    rawLevel = 2;
  }

  let showCard = false;

  if (rawLevel === 3) {
    if (!session.active) {
      session.active = true;
      session.highestLevel = 3;
      session.cardShown = true;
      session.safetyConfirmed = false;
      showCard = true;
    } else {
      // Level rose to 3, or new concern after safety confirmed
      if (session.highestLevel < 3 || session.safetyConfirmed) {
        showCard = true;
      }
      session.highestLevel = 3;
      session.cardShown = true;
      session.safetyConfirmed = false;
    }
    return {
      level: 3,
      showCard,
      session,
    };
  }

  if (rawLevel === 2) {
    if (!session.active) {
      session.active = true;
      session.highestLevel = 2;
      session.cardShown = true;
      session.safetyConfirmed = false;
      showCard = true;
    } else {
      // If safety was previously confirmed and now a new concern arrives, show card once more
      if (session.safetyConfirmed) {
        showCard = true;
        session.safetyConfirmed = false;
        session.cardShown = true;
      } else {
        showCard = false;
      }
    }
    return {
      level: 2,
      showCard,
      session,
    };
  }

  // rawLevel === 1
  // Never lower an active session because of a calm message
  return {
    level: 1,
    showCard: false,
    session,
  };
}
