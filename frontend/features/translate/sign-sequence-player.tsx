"use client";

import {
  AlertTriangle,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { PLAYBACK_RATES } from "@/features/dictionary/sign-video-player";

export type PlaylistItem = {
  /** Stable key (segment index) shared with the segment chips. */
  key: number;
  label: string;
  gloss: string;
  url: string;
};

/**
 * Plays sign videos one after another. Nothing starts automatically: the
 * user presses Play. When a video ends the next one starts; after the last
 * one playback stops. The current sign is always shown as text.
 */
export function SignSequencePlayer({
  items,
  activeIndex,
  onActiveIndexChange,
}: {
  items: PlaylistItem[];
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [finished, setFinished] = useState(false);
  const [rate, setRate] = useState(1);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const rateId = useId();

  const index = Math.min(activeIndex, items.length - 1);
  const current = items[index];

  // Keep the element in sync with the desired state.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = rate;
    if (playing) {
      void video.play().catch(() => setPlaying(false));
    } else {
      video.pause();
    }
  }, [playing, index, rate, current?.url]);

  if (!current) return null;

  function goTo(next: number, keepPlaying = playing) {
    setFinished(false);
    setFailedUrl(null);
    onActiveIndexChange(next);
    setPlaying(keepPlaying);
    if (next === index && videoRef.current) videoRef.current.currentTime = 0;
  }

  function onEnded() {
    if (index < items.length - 1) {
      goTo(index + 1, true);
    } else {
      setPlaying(false);
      setFinished(true);
    }
  }

  function togglePlay() {
    if (finished) {
      goTo(0, true);
      return;
    }
    setPlaying((value) => !value);
  }

  const failed = failedUrl === current.url;

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-xl border bg-black">
        {failed ? (
          <div
            role="alert"
            className="flex aspect-video flex-col items-center justify-center gap-2 bg-muted p-6 text-center text-sm text-muted-foreground"
          >
            <AlertTriangle aria-hidden="true" className="size-6 text-warning" />
            “{current.label}” videosini yuklab bo‘lmadi.
          </div>
        ) : (
          <video
            ref={videoRef}
            src={current.url}
            muted
            playsInline
            preload="auto"
            aria-label={`“${current.label}” imo-ishorasi videosi`}
            onEnded={onEnded}
            onError={() => {
              setFailedUrl(current.url);
              setPlaying(false);
            }}
            className="aspect-video w-full object-contain"
          />
        )}
      </div>

      {/* Text equivalent of what is being shown. */}
      <div
        aria-live="polite"
        className="flex flex-wrap items-baseline justify-between gap-2"
      >
        <p className="text-2xl font-semibold tracking-tight">{current.label}</p>
        <p className="text-sm text-muted-foreground">
          <span className="font-mono">{current.gloss}</span> · {index + 1} /{" "}
          {items.length}
          {finished && " · tugadi"}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
          aria-label="Oldingi imo-ishora"
        >
          <SkipBack aria-hidden="true" />
        </Button>
        <Button onClick={togglePlay} className="min-w-32">
          {playing ? (
            <>
              <Pause aria-hidden="true" /> Pauza
            </>
          ) : finished ? (
            <>
              <RotateCcw aria-hidden="true" /> Qayta ijro
            </>
          ) : (
            <>
              <Play aria-hidden="true" /> Ijro etish
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => goTo(index + 1)}
          disabled={index === items.length - 1}
          aria-label="Keyingi imo-ishora"
        >
          <SkipForward aria-hidden="true" />
        </Button>
        <Button
          variant="ghost"
          onClick={() => goTo(0, true)}
          aria-label="Boshidan qayta ijro etish"
        >
          <RotateCcw aria-hidden="true" /> Boshidan
        </Button>
        <div className="ml-auto flex items-center gap-2 text-sm">
          <label htmlFor={rateId} className="font-medium">
            Tezlik
          </label>
          <NativeSelect
            id={rateId}
            value={rate}
            onChange={(event) => setRate(Number(event.target.value))}
            className="h-9 w-24"
          >
            {PLAYBACK_RATES.map((value) => (
              <option key={value} value={value}>
                {value}×
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>
    </div>
  );
}
