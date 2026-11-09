"use client";

import { AlertTriangle, VideoOff } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { NativeSelect } from "@/components/ui/native-select";

export const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25] as const;

/**
 * Plays a single validated sign video. Sign videos carry no speech audio, so
 * the text equivalent (label + gloss) is rendered next to the player instead
 * of captions.
 */
export function SignVideoPlayer({
  src,
  label,
  unavailableMessage = "Video hozircha ijro etilmaydi: media xosting sozlanmagan.",
}: {
  src: string | null;
  label: string;
  /** Shown instead of the player when `src` is null. */
  unavailableMessage?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [rate, setRate] = useState<number>(1);
  const [loop, setLoop] = useState(true);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const rateId = useId();
  const loopId = useId();

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = rate;
  }, [rate, src]);

  if (!src) {
    return (
      <div className="flex aspect-video flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/50 p-6 text-center text-sm text-muted-foreground">
        <VideoOff aria-hidden="true" className="size-6" />
        {unavailableMessage}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {failedSrc === src ? (
        <div
          role="alert"
          className="flex aspect-video flex-col items-center justify-center gap-2 rounded-xl border bg-muted/50 p-6 text-center text-sm text-muted-foreground"
        >
          <AlertTriangle aria-hidden="true" className="size-6 text-warning" />
          Videoni yuklab bo‘lmadi. Internet aloqasini tekshirib, sahifani
          yangilang.
        </div>
      ) : (
        <video
          ref={videoRef}
          key={src}
          src={src}
          controls
          playsInline
          muted
          loop={loop}
          preload="metadata"
          aria-label={`“${label}” imo-ishorasi videosi`}
          onLoadedMetadata={(event) => {
            event.currentTarget.playbackRate = rate;
          }}
          onError={() => setFailedSrc(src)}
          className="aspect-video w-full rounded-xl border bg-black object-contain"
        />
      )}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
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
        <div className="flex items-center gap-2">
          <input
            id={loopId}
            type="checkbox"
            checked={loop}
            onChange={(event) => setLoop(event.target.checked)}
            className="size-4 accent-primary"
          />
          <label htmlFor={loopId}>Takrorlash</label>
        </div>
      </div>
    </div>
  );
}
