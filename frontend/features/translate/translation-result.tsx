"use client";

import { BookOpen, FlaskConical, VideoOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Callout } from "@/components/ui/callout";
import { StateMessage } from "@/components/ui/state-message";
import {
  SignSequencePlayer,
  type PlaylistItem,
} from "@/features/translate/sign-sequence-player";
import { routes } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import type { TextToSignResponse } from "@/types/api";

export function TranslationResult({ result }: { result: TextToSignResponse }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const playlist: PlaylistItem[] = result.segments.flatMap((segment, key) =>
    segment.sign?.video?.url
      ? [
          {
            key,
            label: segment.sign.uzbek_label,
            gloss: segment.sign.gloss,
            url: segment.sign.video.url,
          },
        ]
      : [],
  );
  const activeKey = playlist[activeIndex]?.key;
  const matchedWithoutPlayback = result.matched_count - playlist.length;
  const hasTestData = result.segments.some((s) => s.sign?.is_test_data);

  if (result.segments.length === 0) {
    return (
      <StateMessage icon={BookOpen} title="Tarjima qilinadigan so‘z topilmadi">
        Matnda harf yoki raqamlardan iborat so‘zlar bo‘lishi kerak.
      </StateMessage>
    );
  }

  return (
    <section aria-labelledby="result-title" className="space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="result-title" className="text-xl font-semibold tracking-tight">
          Natija
        </h2>
        <p className="text-sm text-muted-foreground">
          {result.segments.length} ta bo‘lakdan {result.matched_count} tasi
          uchun imo-ishora topildi
          {result.language_variant && ` · ${result.language_variant.name}`}
        </p>
      </div>

      <Callout title="So‘zma-so‘z lug‘at tarjimasi">
        Har bir so‘z yoki ibora alohida tasdiqlangan imo-ishoraga moslandi.
        Imo-ishora tili grammatikasi (so‘z tartibi, yuz ifodalari) qo‘llanmagan,
        shuning uchun natija to‘liq imo-ishora tilidagi gap emas.
      </Callout>

      {hasTestData && (
        <Callout tone="warning" title="Natijada test yozuvlari bor">
          Belgilangan imo-ishoralar dasturlash uchun yaratilgan sinov
          ma’lumotlari, haqiqiy imo-ishora emas.
        </Callout>
      )}

      <ol aria-label="Matn bo‘laklari" className="flex flex-wrap gap-2">
        {result.segments.map((segment, key) => {
          const playlistIndex = playlist.findIndex((item) => item.key === key);
          const isActive = key === activeKey;
          if (segment.type === "unmatched" || !segment.sign) {
            return (
              <li key={key}>
                <span
                  className="inline-flex flex-col rounded-lg border border-dashed px-3 py-1.5 text-sm"
                  title="Lug‘atda bu so‘z uchun tasdiqlangan imo-ishora yo‘q"
                >
                  <span className="text-muted-foreground line-through decoration-muted-foreground/40">
                    {segment.text}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    lug‘atda yo‘q
                  </span>
                </span>
              </li>
            );
          }
          const label = (
            <>
              <span className="font-medium">{segment.text}</span>
              <span className="flex items-center gap-1 font-mono text-xs opacity-80">
                {segment.sign.is_test_data && (
                  <FlaskConical aria-hidden="true" className="size-3" />
                )}
                {segment.sign.gloss}
                {playlistIndex === -1 && (
                  <VideoOff aria-hidden="true" className="size-3" />
                )}
              </span>
            </>
          );
          return (
            <li key={key}>
              {playlistIndex === -1 ? (
                <span
                  className="inline-flex flex-col rounded-lg border bg-card px-3 py-1.5 text-sm"
                  title="Video ijro etib bo‘lmaydi"
                >
                  {label}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveIndex(playlistIndex)}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "inline-flex flex-col items-start rounded-lg border px-3 py-1.5 text-left text-sm transition-colors",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:border-primary/40",
                  )}
                >
                  {label}
                </button>
              )}
            </li>
          );
        })}
      </ol>

      {playlist.length > 0 ? (
        <SignSequencePlayer
          items={playlist}
          activeIndex={activeIndex}
          onActiveIndexChange={setActiveIndex}
        />
      ) : result.matched_count > 0 ? (
        <StateMessage icon={VideoOff} title="Videolarni ijro etib bo‘lmaydi">
          Imo-ishoralar topildi, lekin media xosting sozlanmaganligi sababli
          videolar mavjud emas.
        </StateMessage>
      ) : (
        <StateMessage
          icon={BookOpen}
          title="Lug‘atda mos imo-ishora topilmadi"
          action={
            <Link
              href={routes.dictionary.href}
              className="text-sm font-medium text-primary underline underline-offset-4"
            >
              Lug‘atni ko‘rish
            </Link>
          }
        >
          Kiritilgan so‘zlar uchun hali tasdiqlangan imo-ishoralar yo‘q.
        </StateMessage>
      )}
      {playlist.length > 0 && matchedWithoutPlayback > 0 && (
        <p className="text-sm text-muted-foreground">
          {matchedWithoutPlayback} ta imo-ishoraning videosi ijro etilmaydi va
          ketma-ketlikka kiritilmadi.
        </p>
      )}

      {result.unmatched_words.length > 0 && (
        <div className="rounded-xl border bg-card p-5 text-sm">
          <p className="font-medium">Lug‘atda topilmagan so‘zlar</p>
          <p className="mt-1 text-muted-foreground">
            {result.unmatched_words.join(", ")}
          </p>
        </div>
      )}
    </section>
  );
}
