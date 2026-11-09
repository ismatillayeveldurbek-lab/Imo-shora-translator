"use client";

import { AlertTriangle, ArrowLeft, SearchX } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { StateMessage } from "@/components/ui/state-message";
import { SignBadges } from "@/features/dictionary/sign-badges";
import { SignVideoPlayer } from "@/features/dictionary/sign-video-player";
import { useSign } from "@/hooks/use-dictionary";
import { routes } from "@/lib/site-config";
import { ApiError } from "@/services/api-client";

function formatDate(iso: string): string {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
}

export function SignDetailSkeleton() {
  return (
    <div
      aria-label="Yuklanmoqda"
      className="grid gap-8 lg:grid-cols-[1.4fr_1fr]"
    >
      <div className="aspect-video animate-pulse rounded-xl bg-muted" />
      <div className="space-y-4">
        <div className="h-9 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
        <div className="h-24 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

export function SignDetailView({ id }: { id: string }) {
  const sign = useSign(id);
  const back = (
    <Button asChild variant="ghost" className="-ml-3">
      <Link href={routes.dictionary.href}>
        <ArrowLeft aria-hidden="true" /> Lug‘atga qaytish
      </Link>
    </Button>
  );

  if (sign.isPending) return <SignDetailSkeleton />;

  if (sign.isError) {
    const notFound =
      sign.error instanceof ApiError &&
      (sign.error.status === 404 || sign.error.status === 422);
    return notFound ? (
      <StateMessage icon={SearchX} title="Imo-ishora topilmadi" action={back}>
        Bu yozuv mavjud emas yoki hali mutaxassislar tomonidan tasdiqlanmagan.
      </StateMessage>
    ) : (
      <StateMessage
        role="alert"
        icon={AlertTriangle}
        title="Ma’lumotni yuklab bo‘lmadi"
        action={
          <Button variant="outline" onClick={() => void sign.refetch()}>
            Qayta urinish
          </Button>
        }
      >
        {sign.error instanceof ApiError
          ? sign.error.message
          : "Noma’lum xatolik."}
      </StateMessage>
    );
  }

  const data = sign.data;
  const video = data.videos[0];

  return (
    <article aria-labelledby="sign-title" className="space-y-6">
      {back}
      {data.is_test_data && (
        <Callout tone="warning" title="Bu test yozuvi">
          Dasturlash uchun yaratilgan sinov ma’lumoti. Haqiqiy imo-ishora emas.
        </Callout>
      )}
      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <SignVideoPlayer
            src={video?.url ?? null}
            label={data.uzbek_label}
            unavailableMessage={
              video
                ? undefined
                : "Bu imo-ishora uchun tasdiqlangan video hali qo‘shilmagan."
            }
          />
        </div>
        <div className="space-y-6">
          <header className="space-y-2">
            <h1 id="sign-title" className="text-3xl font-bold tracking-tight">
              {data.uzbek_label}
            </h1>
            <p className="font-mono text-sm tracking-wide text-muted-foreground">
              Gloss: {data.gloss}
            </p>
            <SignBadges sign={data} />
          </header>
          {data.description && (
            <p className="leading-7 text-pretty">{data.description}</p>
          )}
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 rounded-xl border bg-card p-5 text-sm">
            <dt className="text-muted-foreground">Til varianti</dt>
            <dd>{data.language_variant.name}</dd>
            <dt className="text-muted-foreground">Toifa</dt>
            <dd>{data.category?.name ?? "—"}</dd>
            <dt className="text-muted-foreground">Turi</dt>
            <dd>
              {data.is_dynamic ? "Harakatli imo-ishora" : "Statik imo-ishora"}
            </dd>
            <dt className="text-muted-foreground">Holati</dt>
            <dd>
              {data.is_test_data
                ? "Test ma’lumoti"
                : data.verification_status === "verified"
                  ? "Mutaxassis tomonidan tasdiqlangan"
                  : data.verification_status}
            </dd>
            <dt className="text-muted-foreground">Yangilangan</dt>
            <dd>{formatDate(data.updated_at)}</dd>
          </dl>
        </div>
      </div>
    </article>
  );
}
