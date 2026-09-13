// Question Limit configuration (ADR-0002). Read from env vars at build
// time — this is a client-side check, so both vars must be NEXT_PUBLIC_ to
// reach the browser bundle. Defaults to enabled, threshold 5, so the
// free-tier LLM quota is protected from day one with no extra setup.

export type QuestionLimitConfig = {
  enabled: boolean;
  threshold: number;
};

const DEFAULT_THRESHOLD = 5;

export function getQuestionLimitConfig(): QuestionLimitConfig {
  const enabled = process.env.NEXT_PUBLIC_QUESTION_LIMIT_ENABLED !== "false";
  const rawThreshold = Number(process.env.NEXT_PUBLIC_QUESTION_LIMIT_THRESHOLD);
  const threshold =
    Number.isFinite(rawThreshold) && rawThreshold > 0 ? rawThreshold : DEFAULT_THRESHOLD;

  return { enabled, threshold };
}
