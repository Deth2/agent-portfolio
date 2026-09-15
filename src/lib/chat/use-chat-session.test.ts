import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useChatSession } from "./use-chat-session";

const LIMIT_EXCEEDED_MESSAGE = "Hai raggiunto il limite, scrivimi tramite i Contatti.";

describe("useChatSession", () => {
  it("forwards a question under the Question Limit to askAboutCv and appends its reply", async () => {
    const askAboutCv = vi.fn().mockResolvedValue("Ecco la risposta.");
    const { result } = renderHook(() =>
      useChatSession({
        askAboutCv,
        questionLimit: { enabled: true, threshold: 5 },
        limitExceededMessage: LIMIT_EXCEEDED_MESSAGE,
      })
    );

    await act(async () => {
      await result.current.sendQuestion("Che esperienza hai con React?");
    });

    expect(askAboutCv).toHaveBeenCalledWith("Che esperienza hai con React?", []);
    expect(result.current.messages).toEqual([
      { role: "user", content: "Che esperienza hai con React?" },
      { role: "assistant", content: "Ecco la risposta." },
    ]);
  });

  it("does not forward a question at/over the threshold, and appends the fixed Contacts message instead", async () => {
    const askAboutCv = vi.fn().mockResolvedValue("Non dovrebbe arrivare qui.");
    const { result } = renderHook(() =>
      useChatSession({
        askAboutCv,
        questionLimit: { enabled: true, threshold: 2 },
        limitExceededMessage: LIMIT_EXCEEDED_MESSAGE,
      })
    );

    await act(async () => {
      await result.current.sendQuestion("Domanda 1");
    });
    await act(async () => {
      await result.current.sendQuestion("Domanda 2");
    });
    // Threshold is 2: the first two questions go through, the third is over
    // the limit and must be intercepted before any LLM call.
    await act(async () => {
      await result.current.sendQuestion("Domanda 3");
    });

    expect(askAboutCv).toHaveBeenCalledTimes(2);
    expect(result.current.messages.at(-1)).toEqual({
      role: "assistant",
      content: LIMIT_EXCEEDED_MESSAGE,
    });
    expect(result.current.messages.at(-2)).toEqual({ role: "user", content: "Domanda 3" });
  });

  it("applies no threshold when the Question Limit is disabled, regardless of question count", async () => {
    const askAboutCv = vi.fn().mockResolvedValue("Risposta.");
    const { result } = renderHook(() =>
      useChatSession({
        askAboutCv,
        questionLimit: { enabled: false, threshold: 1 },
        limitExceededMessage: LIMIT_EXCEEDED_MESSAGE,
      })
    );

    for (let i = 0; i < 4; i++) {
      await act(async () => {
        await result.current.sendQuestion(`Domanda ${i}`);
      });
    }

    expect(askAboutCv).toHaveBeenCalledTimes(4);
    expect(
      result.current.messages.some((m) => m.content === LIMIT_EXCEEDED_MESSAGE)
    ).toBe(false);
  });

  it("passes the prior message history (not including the new question) to askAboutCv", async () => {
    const askAboutCv = vi.fn().mockResolvedValue("Seconda risposta.");
    const { result } = renderHook(() =>
      useChatSession({
        askAboutCv,
        initialMessages: [{ role: "assistant", content: "Ciao!" }],
        questionLimit: { enabled: true, threshold: 5 },
        limitExceededMessage: LIMIT_EXCEEDED_MESSAGE,
      })
    );

    await act(async () => {
      await result.current.sendQuestion("Prima domanda");
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.sendQuestion("Seconda domanda");
    });

    expect(askAboutCv).toHaveBeenNthCalledWith(2, "Seconda domanda", [
      { role: "assistant", content: "Ciao!" },
      { role: "user", content: "Prima domanda" },
      { role: "assistant", content: "Seconda risposta." },
    ]);
  });

  it("resetSession clears history back to initialMessages and lets a new question through past the old limit", async () => {
    const askAboutCv = vi.fn().mockResolvedValue("Risposta.");
    const { result } = renderHook(() =>
      useChatSession({
        askAboutCv,
        initialMessages: [{ role: "assistant", content: "Ciao!" }],
        questionLimit: { enabled: true, threshold: 1 },
        limitExceededMessage: LIMIT_EXCEEDED_MESSAGE,
      })
    );

    await act(async () => {
      await result.current.sendQuestion("Domanda 1");
    });
    await act(async () => {
      await result.current.sendQuestion("Domanda 2 oltre il limite");
    });
    expect(result.current.messages.at(-1)).toEqual({
      role: "assistant",
      content: LIMIT_EXCEEDED_MESSAGE,
    });

    act(() => {
      result.current.resetSession();
    });
    expect(result.current.messages).toEqual([{ role: "assistant", content: "Ciao!" }]);

    await act(async () => {
      await result.current.sendQuestion("Domanda dopo il reset");
    });
    expect(askAboutCv).toHaveBeenLastCalledWith("Domanda dopo il reset", [
      { role: "assistant", content: "Ciao!" },
    ]);
    expect(result.current.messages.at(-1)).toEqual({ role: "assistant", content: "Risposta." });
  });
});
