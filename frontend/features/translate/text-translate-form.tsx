"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AlertTriangle, Eraser, Languages, Loader2 } from "lucide-react";
import { useId, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { StateMessage } from "@/components/ui/state-message";
import { TranslationResult } from "@/features/translate/translation-result";
import { cn } from "@/lib/utils";
import { ApiError } from "@/services/api-client";
import { translateTextToSign } from "@/services/translate";
import { MAX_TRANSLATION_TEXT_LENGTH } from "@/types/api";

const formSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "Tarjima qilish uchun matn kiriting.")
    .max(
      MAX_TRANSLATION_TEXT_LENGTH,
      `Matn ${MAX_TRANSLATION_TEXT_LENGTH} belgidan oshmasligi kerak.`,
    ),
  variant: z.string().optional(),
});
type FormValues = z.infer<typeof formSchema>;

function availableVariants(error: unknown): string[] {
  if (!(error instanceof ApiError) || error.code !== "variant_required")
    return [];
  const details = error.details as { available?: unknown } | undefined;
  return Array.isArray(details?.available) ? details.available.map(String) : [];
}

export function TextTranslateForm() {
  const textId = useId();
  const hintId = useId();
  const errorId = useId();
  const variantId = useId();
  const [variantChoices, setVariantChoices] = useState<string[]>([]);
  const [resultVersion, setResultVersion] = useState(0);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { text: "", variant: "" },
  });
  const textLength = useWatch({ control: form.control, name: "text" }).length;
  const textError = form.formState.errors.text?.message;

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      translateTextToSign(values.text, values.variant || undefined),
    onSuccess: () => setResultVersion((v) => v + 1),
    onError: (error) => {
      const choices = availableVariants(error);
      if (choices.length > 0) setVariantChoices(choices);
    },
  });

  const onSubmit = form.handleSubmit((values) => mutation.mutate(values));

  return (
    <div className="space-y-10">
      <form
        onSubmit={onSubmit}
        noValidate
        className="space-y-4"
        aria-describedby={hintId}
      >
        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-4">
            <label htmlFor={textId} className="font-medium">
              O‘zbekcha matn
            </label>
            <span
              className={cn(
                "text-xs tabular-nums text-muted-foreground",
                textLength > MAX_TRANSLATION_TEXT_LENGTH &&
                  "font-medium text-destructive",
              )}
            >
              {textLength} / {MAX_TRANSLATION_TEXT_LENGTH}
            </span>
          </div>
          <textarea
            id={textId}
            rows={4}
            placeholder="Masalan: Salom, rahmat!"
            aria-invalid={textError ? true : undefined}
            aria-describedby={cn(hintId, textError && errorId)}
            className="w-full resize-y rounded-lg border border-input bg-card px-3 py-2 text-base placeholder:text-muted-foreground aria-invalid:border-destructive"
            {...form.register("text")}
          />
          <p id={hintId} className="text-sm text-muted-foreground">
            Lotin yozuvida yozing. Har bir so‘z tasdiqlangan lug‘atdan
            qidiriladi; matn saqlanmaydi.
          </p>
          {textError && (
            <p
              id={errorId}
              role="alert"
              className="text-sm font-medium text-destructive"
            >
              {textError}
            </p>
          )}
        </div>

        {variantChoices.length > 0 && (
          <div className="max-w-sm space-y-1.5">
            <label htmlFor={variantId} className="text-sm font-medium">
              Imo-ishora tili varianti
            </label>
            <NativeSelect id={variantId} {...form.register("variant")}>
              <option value="">Tanlang…</option>
              {variantChoices.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </NativeSelect>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" size="lg" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <Loader2 aria-hidden="true" className="animate-spin" />
            ) : (
              <Languages aria-hidden="true" />
            )}
            {mutation.isPending ? "Tarjima qilinmoqda…" : "Tarjima qilish"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => {
              form.reset({ text: "", variant: form.getValues("variant") });
              mutation.reset();
            }}
          >
            <Eraser aria-hidden="true" /> Tozalash
          </Button>
        </div>
      </form>

      <div aria-live="polite">
        {mutation.isError ? (
          <StateMessage
            role="alert"
            icon={AlertTriangle}
            title="Tarjima bajarilmadi"
          >
            {mutation.error instanceof ApiError
              ? mutation.error.message
              : "Noma’lum xatolik."}
          </StateMessage>
        ) : mutation.isSuccess ? (
          <TranslationResult key={resultVersion} result={mutation.data} />
        ) : null}
      </div>
    </div>
  );
}
