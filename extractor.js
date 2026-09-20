// extractor.js — fully offline extraction. No API calls, no network, no dependencies.
// This is the safe default path: it works even if internet or an AI API key is unavailable.

function extractTasks(text) {
  if (!text || !text.trim()) return [];

  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const actionVerbs = [
    "submit", "complete", "record", "send", "finish", "prepare",
    "review", "build", "create", "polish", "fix", "update",
    "write", "schedule", "confirm", "share", "upload", "test",
    "deploy", "finalize", "draft", "notify", "present", "organize"
  ];

  const urgentWords = ["asap", "urgent", "immediately", "right away"];
  const timePattern = /\b\d{1,2}(:\d{2})?\s?(am|pm)\b/i;
  const deadlineWords = ["deadline", "due", "end of day", "eod"];
  const stripPrefixes = /^(team,|also,|when you have time,|before submitting,)\s*/i;

  const tasks = [];
  let id = 1;

  sentences.forEach((sentence) => {
    const lower = sentence.toLowerCase();
    const matchedVerb = actionVerbs.find((v) => lower.includes(v));
    if (!matchedVerb) return;

    const timeMatch = sentence.match(timePattern);
    const hasToday = lower.includes("today");
    const hasTomorrow = lower.includes("tomorrow");
    const hasDeadlineWord = deadlineWords.some((w) => lower.includes(w));
    const hasUrgentWord = urgentWords.some((w) => lower.includes(w));

    let deadline = "";
    if (timeMatch) deadline = timeMatch[0].toUpperCase();
    else if (hasToday) deadline = "Today";
    else if (hasTomorrow) deadline = "Tomorrow";
    else if (hasDeadlineWord) deadline = "See note";

    let priority;
    let reasonBits = [];

    // Priority is decided per-sentence only — a heuristic like this can't reliably
    // pull context from a different sentence, so each task sentence should carry
    // its own urgency/deadline/priority signal for this to classify correctly.
    if (hasUrgentWord || (hasToday && (timeMatch || hasDeadlineWord))) {
      priority = "URGENT";
      reasonBits.push("the text marks it urgent or due today");
    } else if (lower.includes("high priority")) {
      priority = "HIGH";
      reasonBits.push('the text explicitly says "high priority"');
    } else if (lower.includes("medium priority")) {
      priority = "MEDIUM";
      reasonBits.push('the text explicitly says "medium priority"');
    } else if (lower.includes("low priority")) {
      priority = "LOW";
      reasonBits.push('the text explicitly says "low priority"');
    } else if (timeMatch || hasDeadlineWord || hasTomorrow) {
      priority = "HIGH";
      reasonBits.push("it has a specific deadline");
    } else {
      priority = "MEDIUM";
      reasonBits.push("it's a clear action item with no urgency signal");
    }

    const title = sentence.replace(stripPrefixes, "").trim();

    tasks.push({
      id: id++,
      title: title.length > 100 ? title.slice(0, 100) + "…" : title,
      deadline,
      priority,
      reason: `Classified ${priority} because ${reasonBits.join(" and ")} (detected action word: "${matchedVerb}").`,
      matchedVerb,
      sourceSentence: sentence,
      status: "pending"
    });
  });

  return tasks;
}

function priorityRank(p) {
  return { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }[p] ?? 4;
}

// Support browser global and ES module environments
if (typeof window !== "undefined") {
  window.extractTasks = extractTasks;
  window.priorityRank = priorityRank;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { extractTasks, priorityRank };
}
