"use client";

import {
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  RefreshCw,
  XCircle,
} from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useHealth, useModelsStatus } from "@/hooks/use-system-status";
import { ApiError } from "@/services/api-client";
import type { CapabilityName, CapabilityState } from "@/types/api";

type Tone = "success" | "warning" | "destructive" | "outline";

const CAPABILITY_LABELS: Record<CapabilityName, string> = {
  sign_recognition: "Imo-ishorani aniqlash modeli",
  speech_recognition: "O‘zbek nutqini aniqlash (ASR)",
};

const CAPABILITY_STATES: Record<
  CapabilityState,
  { label: string; tone: Tone; hint: string }
> = {
  ready: {
    label: "Tayyor",
    tone: "success",
    hint: "Model yuklangan va ishlamoqda.",
  },
  unavailable: {
    label: "Mavjud emas",
    tone: "warning",
    hint: "Model ro‘yxatga olingan, lekin hozircha ishlatib bo‘lmaydi.",
  },
  not_configured: {
    label: "Sozlanmagan",
    tone: "outline",
    hint: "O‘qitilgan model hali ulanmagan. Bu funksiya o‘chirilgan.",
  },
};

const TONE_ICON = {
  success: CheckCircle2,
  warning: AlertTriangle,
  destructive: XCircle,
  outline: CircleDashed,
} as const;

function StatusRow({
  label,
  tone,
  state,
  hint,
}: {
  label: string;
  tone: Tone;
  state: string;
  hint?: ReactNode;
}) {
  const Icon = TONE_ICON[tone];
  return (
    <li className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium">{label}</p>
        {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
      </div>
      <Badge variant={tone} className="self-start sm:self-auto">
        <Icon aria-hidden="true" />
        {state}
      </Badge>
    </li>
  );
}

function errorMessage(error: Error): string {
  return error instanceof ApiError
    ? error.message
    : "Noma’lum xatolik yuz berdi.";
}

export function SystemStatus() {
  const health = useHealth();
  const models = useModelsStatus();
  const loading = health.isPending || models.isPending;
  const refreshing = health.isFetching || models.isFetching;

  const refetchAll = () => {
    void health.refetch();
    void models.refetch();
  };

  return (
    <section
      id="tizim-holati"
      aria-labelledby="status-title"
      className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-20 sm:px-6"
    >
      <Card>
        <CardHeader className="sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <CardTitle id="status-title" className="text-xl">
              Tizim holati
            </CardTitle>
            <CardDescription>
              Server, ma’lumotlar bazasi va sun’iy intellekt modellarining
              haqiqiy holati.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refetchAll}
            disabled={refreshing}
          >
            <RefreshCw
              aria-hidden="true"
              className={refreshing ? "animate-spin" : undefined}
            />
            Yangilash
          </Button>
        </CardHeader>
        <CardContent>
          <div aria-live="polite" aria-busy={loading}>
            {loading ? (
              <ul aria-label="Holat yuklanmoqda" className="divide-y">
                {[0, 1, 2, 3].map((i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between py-3"
                  >
                    <span className="h-4 w-48 animate-pulse rounded bg-muted" />
                    <span className="h-5 w-20 animate-pulse rounded-full bg-muted" />
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="divide-y">
                {health.isError ? (
                  <StatusRow
                    label="Backend API"
                    tone="destructive"
                    state="Ulanmadi"
                    hint={errorMessage(health.error)}
                  />
                ) : (
                  <>
                    <StatusRow
                      label="Backend API"
                      tone="success"
                      state="Ishlamoqda"
                      hint={`Versiya ${health.data.version} · ${health.data.environment}`}
                    />
                    <StatusRow
                      label="Ma’lumotlar bazasi"
                      tone={
                        health.data.database === "ok"
                          ? "success"
                          : "destructive"
                      }
                      state={
                        health.data.database === "ok"
                          ? "Ulangan"
                          : "Mavjud emas"
                      }
                    />
                  </>
                )}
                {models.isError ? (
                  <StatusRow
                    label="Sun’iy intellekt modellari"
                    tone="destructive"
                    state="Noma’lum"
                    hint={errorMessage(models.error)}
                  />
                ) : (
                  models.data.capabilities.map((capability) => {
                    const state = CAPABILITY_STATES[capability.status];
                    return (
                      <StatusRow
                        key={capability.capability}
                        label={CAPABILITY_LABELS[capability.capability]}
                        tone={state.tone}
                        state={state.label}
                        hint={state.hint}
                      />
                    );
                  })
                )}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
