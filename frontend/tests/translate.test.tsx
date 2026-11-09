import { fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TextTranslateForm } from "@/features/translate/text-translate-form";
import type { Segment, TextToSignResponse } from "@/types/api";

import { jsonResponse, renderWithQuery, stubFetch } from "./helpers";

function signSegment(
  text: string,
  gloss: string,
  url: string | null,
  start = 0,
): Segment {
  return {
    type: "sign",
    text,
    normalized: text.toLowerCase(),
    start,
    end: start + text.length,
    sign: {
      id: crypto.randomUUID(),
      gloss,
      uzbek_label: text.toLowerCase(),
      is_test_data: false,
      video: { url, duration_ms: 1000, video_format: "mp4" },
    },
  };
}

function response(segments: Segment[]): TextToSignResponse {
  const matched = segments.filter((s) => s.type === "sign").length;
  return {
    method: "dictionary_lookup",
    input_text: segments.map((s) => s.text).join(" "),
    language_variant: { code: "v", name: "Variant" },
    segments,
    matched_count: matched,
    unmatched_count: segments.length - matched,
    unmatched_words: segments
      .filter((s) => s.type === "unmatched")
      .map((s) => s.normalized),
  };
}

const unmatched: Segment = {
  type: "unmatched",
  text: "Qalaysan",
  normalized: "qalaysan",
  start: 0,
  end: 8,
  sign: null,
};

beforeEach(() => {
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
});

async function submit(text: string) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("O‘zbekcha matn"), text);
  await user.click(screen.getByRole("button", { name: "Tarjima qilish" }));
  return user;
}

describe("TextTranslateForm", () => {
  it("validates input before calling the API", async () => {
    const fetchMock = stubFetch({});
    renderWithQuery(<TextTranslateForm />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Tarjima qilish" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Tarjima qilish uchun matn kiriting.",
    );
    expect(screen.getByLabelText("O‘zbekcha matn")).toHaveAttribute(
      "aria-invalid",
      "true",
    );

    fireEvent.change(screen.getByLabelText("O‘zbekcha matn"), {
      target: { value: "a".repeat(501) },
    });
    await user.click(screen.getByRole("button", { name: "Tarjima qilish" }));
    expect(
      await screen.findByText("Matn 500 belgidan oshmasligi kerak."),
    ).toBeInTheDocument();
    expect(screen.getByText("501 / 500")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends the text and shows matched and unmatched segments", async () => {
    const fetchMock = stubFetch({
      "/api/translate/text-to-sign": () =>
        jsonResponse(
          response([
            signSegment("Salom", "SALOM", "https://cdn.test/salom.mp4"),
            unmatched,
          ]),
        ),
    });
    renderWithQuery(<TextTranslateForm />);
    await submit("Salom Qalaysan");

    expect(
      await screen.findByText(/2 ta bo‘lakdan 1 tasi/),
    ).toBeInTheDocument();
    const [, init] = fetchMock.mock.calls[0]!;
    expect(JSON.parse(String((init as RequestInit).body))).toEqual({
      text: "Salom Qalaysan",
    });

    const chips = within(screen.getByRole("list", { name: "Matn bo‘laklari" }));
    expect(chips.getByRole("button", { name: /^Salom/ })).toHaveAttribute(
      "aria-current",
      "true",
    );
    expect(chips.getByText("lug‘atda yo‘q")).toBeInTheDocument();
    expect(
      screen.getByText("So‘zma-so‘z lug‘at tarjimasi"),
    ).toBeInTheDocument();
    expect(screen.getByText("qalaysan")).toBeInTheDocument();
  });

  it("asks for a language variant when the server requires one", async () => {
    let calls = 0;
    const fetchMock = stubFetch({
      "/api/translate/text-to-sign": () =>
        ++calls === 1
          ? jsonResponse(
              {
                error: {
                  code: "variant_required",
                  message: "x",
                  details: { available: ["uz-a", "uz-b"] },
                },
              },
              422,
            )
          : jsonResponse(
              response([
                signSegment("Salom", "SALOM", "https://cdn.test/s.mp4"),
              ]),
            ),
    });
    renderWithQuery(<TextTranslateForm />);
    const user = await submit("Salom");

    expect(
      await screen.findByText(/Iltimos, birini tanlang/),
    ).toBeInTheDocument();
    await user.selectOptions(
      screen.getByLabelText("Imo-ishora tili varianti"),
      "uz-b",
    );
    await user.click(screen.getByRole("button", { name: "Tarjima qilish" }));
    expect(
      await screen.findByText(/1 ta bo‘lakdan 1 tasi/),
    ).toBeInTheDocument();
    const [, init] = fetchMock.mock.calls[1]!;
    expect(JSON.parse(String((init as RequestInit).body))).toEqual({
      text: "Salom",
      variant: "uz-b",
    });
  });

  it("explains when signs were found but media hosting is not configured", async () => {
    stubFetch({
      "/api/translate/text-to-sign": () =>
        jsonResponse(response([signSegment("Salom", "SALOM", null)])),
    });
    renderWithQuery(<TextTranslateForm />);
    await submit("Salom");
    expect(
      await screen.findByText("Videolarni ijro etib bo‘lmaydi"),
    ).toBeInTheDocument();
  });
});

describe("SignSequencePlayer (via result)", () => {
  async function renderSequence() {
    stubFetch({
      "/api/translate/text-to-sign": () =>
        jsonResponse(
          response([
            signSegment("Salom", "SALOM", "https://cdn.test/1.mp4"),
            unmatched,
            signSegment("Rahmat", "RAHMAT", "https://cdn.test/2.mp4"),
          ]),
        ),
    });
    renderWithQuery(<TextTranslateForm />);
    const user = await submit("Salom Qalaysan Rahmat");
    await screen.findByText("1 / 2", { exact: false });
    return user;
  }

  const video = () =>
    screen.getByLabelText(/imo-ishorasi videosi/) as HTMLVideoElement;

  it("does not autoplay and advances through the sequence on ended", async () => {
    const user = await renderSequence();
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
    expect(video()).toHaveAttribute("src", "https://cdn.test/1.mp4");

    await user.click(screen.getByRole("button", { name: "Ijro etish" }));
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalled();

    fireEvent.ended(video());
    expect(await screen.findByText(/2 \/ 2/)).toBeInTheDocument();
    expect(video()).toHaveAttribute("src", "https://cdn.test/2.mp4");

    fireEvent.ended(video());
    expect(
      await screen.findByRole("button", { name: "Qayta ijro" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/tugadi/)).toBeInTheDocument();
  });

  it("supports next/previous, chip selection and playback speed", async () => {
    const user = await renderSequence();
    const previous = screen.getByRole("button", { name: "Oldingi imo-ishora" });
    expect(previous).toBeDisabled();

    await user.click(
      screen.getByRole("button", { name: "Keyingi imo-ishora" }),
    );
    expect(video()).toHaveAttribute("src", "https://cdn.test/2.mp4");
    expect(
      screen.getByRole("button", { name: "Keyingi imo-ishora" }),
    ).toBeDisabled();

    await user.click(screen.getByRole("button", { name: /^Salom/ }));
    expect(video()).toHaveAttribute("src", "https://cdn.test/1.mp4");

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Tezlik" }),
      "0.5",
    );
    expect(video().playbackRate).toBe(0.5);
  });

  it("shows an error for a video that fails to load", async () => {
    await renderSequence();
    fireEvent.error(video());
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "“salom” videosini yuklab bo‘lmadi.",
    );
  });
});
