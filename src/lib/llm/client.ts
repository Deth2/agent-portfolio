// Server-only LLM provider configuration. All model access goes through
// askAboutCv() in ./chat, which reads this config — the rest of the app
// depends on neither this file nor the provider (ADR-0003). Swapping
// providers (Groq in production, a local Ollama instance in development) is
// purely a matter of these three env vars, never a code change.

export type LlmConfig = {
  baseUrl: string;
  apiKey: string;
  model: string;
};

const DEFAULT_BASE_URL = "https://api.groq.com/openai/v1";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

export function getLlmConfig(): LlmConfig {
  return {
    baseUrl: process.env.LLM_BASE_URL?.trim() || DEFAULT_BASE_URL,
    apiKey: process.env.LLM_API_KEY?.trim() ?? "",
    model: process.env.LLM_MODEL?.trim() || DEFAULT_MODEL,
  };
}
