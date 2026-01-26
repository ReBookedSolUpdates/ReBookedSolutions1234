export interface ModerationResult {
  is_flagged: boolean;
  reason: string | null;
  severity: "low" | "medium" | "high" | null;
}

// Patterns that indicate requests for sensitive data or policy violations
const POLICY_VIOLATIONS = [
  // Banking/financial info
  /\b(bank|account|credit|debit|card|pin|cvv|routing|swift|iban|password|ssn|tax id|credit score)\b/i,
  // Personal user data
  /\b(user data|private|personal information|student id|address|phone number|email address)\b/i,
  // Security/hacking
  /\b(hack|crack|bypass|exploit|vulnerability|security breach|sql injection|xss|malware|virus)\b/i,
  // System access
  /\b(system access|database|admin panel|backend|server|api key|secret|token|authentication bypass)\b/i,
  // Illegal activities
  /\b(stolen|piracy|illegal|fraud|money laundering|drug)\b/i,
];

// Patterns for abusive language
const ABUSIVE_PATTERNS = [
  /\b(kill|murder|harm|hate|racist|sexist|discriminate)\b/i,
  /\b(abuse|assault|rape|sexual)\b/i,
  /fuck|shit|damn|crap/i,
];

// Patterns that indicate legal threats
const LEGAL_THREATS = [
  /\b(sue|lawsuit|lawyer|attorney|legal action|court|damages)\b/i,
  /\b(liability|liable|responsible|fault)\b/i,
];

export function moderateContent(content: string): ModerationResult {
  if (!content || content.trim().length === 0) {
    return { is_flagged: false, reason: null, severity: null };
  }

  const lowerContent = content.toLowerCase();
  let severity: "low" | "medium" | "high" = "low";
  let flagReason: string | null = null;

  // Check for policy violations (high severity)
  for (const pattern of POLICY_VIOLATIONS) {
    if (pattern.test(content)) {
      return {
        is_flagged: true,
        reason: "Your message appears to contain requests for sensitive information. For security, we cannot assist with this.",
        severity: "high",
      };
    }
  }

  // Check for abusive language (high severity)
  for (const pattern of ABUSIVE_PATTERNS) {
    if (pattern.test(content)) {
      return {
        is_flagged: true,
        reason: "Your message contains inappropriate language. Please keep the conversation respectful.",
        severity: "high",
      };
    }
  }

  // Check for legal threats (high severity)
  for (const pattern of LEGAL_THREATS) {
    if (pattern.test(content)) {
      return {
        is_flagged: true,
        reason: "Your message contains legal threats. Please contact our support team directly for legal matters.",
        severity: "high",
      };
    }
  }

  // Check for excessive length (potential spam or abuse)
  if (content.length > 5000) {
    return {
      is_flagged: true,
      reason: "Your message is too long. Please keep your messages concise.",
      severity: "medium",
    };
  }

  // Check for repeated characters (spam)
  if (/(.)\1{9,}/.test(content)) {
    return {
      is_flagged: true,
      reason: "Your message appears to contain spam. Please write a proper question.",
      severity: "medium",
    };
  }

  return { is_flagged: false, reason: null, severity: null };
}

export function shouldFlagResponse(responseContent: string): ModerationResult {
  // Responses are generally safer as they come from OpenAI with our system prompt
  // But we still check for any catastrophic failures
  if (!responseContent || responseContent.trim().length === 0) {
    return {
      is_flagged: true,
      reason: "No response generated",
      severity: "high",
    };
  }

  // Check for obvious API errors in response
  if (
    responseContent.includes("Error") ||
    responseContent.includes("error") ||
    responseContent.includes("failed")
  ) {
    // Don't flag - these might be legitimate error messages we want to convey
    return { is_flagged: false, reason: null, severity: null };
  }

  return { is_flagged: false, reason: null, severity: null };
}
