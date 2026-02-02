/**
 * Content Validator Module
 * 
 * Enforces content rules silently - no user-facing disclaimers.
 * Returns admin-friendly error messages for blocked content.
 */

// Disallowed content patterns (case-insensitive)
const DISALLOWED_PATTERNS = [
  // Medical procedures
  /\b(inject(?:ion|ing|ed)?|syringe|needle|vaccination|vaccine|blood\s*draw)\b/i,
  /\b(surgery|surgical|operate|operating|operation)\b/i,
  /\b(medical\s*procedure|clinical\s*trial)\b/i,
  
  // Deliberate infection / self-harm
  /\b(infect(?:ing|ed)?|deliberately\s*infect|spread\s*(?:disease|virus|infection))\b/i,
  /\b(self[- ]?harm|cut(?:ting)?\s*(?:yourself|myself)|suicide|kill\s*(?:yourself|myself))\b/i,
  /\b(hurt\s*(?:yourself|myself)|injure\s*(?:yourself|myself))\b/i,
  
  // Ignoring medical advice
  /\b(ignore\s*(?:doctor|medical|physician)|stop\s*(?:taking\s*)?medication)\b/i,
  /\b(refuse\s*treatment|reject\s*medical)\b/i,
  
  // Illegal actions
  /\b(steal(?:ing)?|theft|rob(?:bing|bery)?|murder(?:ing)?|assault(?:ing)?)\b/i,
  /\b(drug\s*(?:deal(?:ing)?|traffick(?:ing)?)|illegal\s*drug)\b/i,
  /\b(break(?:ing)?\s*(?:into|in)|trespass(?:ing)?|vandal(?:ize|ism|izing)?)\b/i,
  /\b(fraud|embezzle|launder(?:ing)?|bribe(?:ry)?)\b/i,
  
  // Violence
  /\b(kill(?:ing)?|murder(?:ing)?|stab(?:bing)?|shoot(?:ing)?)\b/i,
  /\b(attack(?:ing)?|beat(?:ing)?|punch(?:ing)?|kick(?:ing)?)\s+(?:someone|person|people)\b/i,
];

// Additional phrase-level checks
const DISALLOWED_PHRASES = [
  'take matters into your own hands',
  'teach them a lesson',
  'make them pay',
  'get revenge',
  'punish them',
];

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates scenario text against content rules.
 * Returns validation result with admin-friendly error messages.
 */
export function validateScenarioContent(text: string): ValidationResult {
  const errors: string[] = [];
  const normalizedText = text.toLowerCase().trim();

  // Check against pattern rules
  for (const pattern of DISALLOWED_PATTERNS) {
    if (pattern.test(text)) {
      const category = getCategoryFromPattern(pattern);
      errors.push(`Content contains disallowed ${category} reference`);
    }
  }

  // Check against phrase rules
  for (const phrase of DISALLOWED_PHRASES) {
    if (normalizedText.includes(phrase)) {
      errors.push(`Content contains disallowed phrase: "${phrase}"`);
    }
  }

  // Check for empty or too short content
  if (normalizedText.length < 10) {
    errors.push('Scenario text must be at least 10 characters');
  }

  // Check for excessively long content
  if (text.length > 500) {
    errors.push('Scenario text must be 500 characters or less');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates reveal slide content (less restrictive than scenarios)
 */
export function validateSlideContent(data: {
  title: string;
  body?: string;
  quote?: string;
}): ValidationResult {
  const errors: string[] = [];

  if (!data.title || data.title.trim().length < 3) {
    errors.push('Slide title must be at least 3 characters');
  }

  if (data.title && data.title.length > 100) {
    errors.push('Slide title must be 100 characters or less');
  }

  if (data.body && data.body.length > 2000) {
    errors.push('Slide body must be 2000 characters or less');
  }

  if (data.quote && data.quote.length > 500) {
    errors.push('Quote must be 500 characters or less');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Batch validate multiple scenarios
 */
export function validateScenarios(scenarios: { id: string; text: string }[]): Map<string, ValidationResult> {
  const results = new Map<string, ValidationResult>();
  
  for (const scenario of scenarios) {
    results.set(scenario.id, validateScenarioContent(scenario.text));
  }
  
  return results;
}

// Helper to categorize blocked content for error messages
function getCategoryFromPattern(pattern: RegExp): string {
  const patternStr = pattern.source.toLowerCase();
  
  if (patternStr.includes('inject') || patternStr.includes('surg') || patternStr.includes('medical')) {
    return 'medical procedure';
  }
  if (patternStr.includes('infect') || patternStr.includes('harm') || patternStr.includes('suicide')) {
    return 'harmful content';
  }
  if (patternStr.includes('ignore') || patternStr.includes('refuse')) {
    return 'medical advice';
  }
  if (patternStr.includes('steal') || patternStr.includes('drug') || patternStr.includes('fraud')) {
    return 'illegal activity';
  }
  if (patternStr.includes('kill') || patternStr.includes('attack') || patternStr.includes('beat')) {
    return 'violent content';
  }
  
  return 'restricted content';
}

/**
 * Sanitize text for safe display (basic XSS prevention)
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
