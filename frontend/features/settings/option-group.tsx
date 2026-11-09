"use client";

import type { LucideIcon } from "lucide-react";
import { useId } from "react";

import { cn } from "@/lib/utils";

export type Option<T extends string> = {
  value: T;
  label: string;
  description?: string;
  icon?: LucideIcon;
};

/** Native radio group (fieldset + legend): full keyboard and screen reader support for free. */
export function OptionGroup<T extends string>({
  legend,
  description,
  name,
  value,
  options,
  onChange,
}: {
  legend: string;
  description?: string;
  name: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
}) {
  const descriptionId = useId();
  return (
    <fieldset
      aria-describedby={description ? descriptionId : undefined}
      className="space-y-3"
    >
      <legend className="text-base font-semibold">{legend}</legend>
      {description && (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-3">
        {options.map((option) => {
          const Icon = option.icon;
          const checked = option.value === value;
          return (
            <label
              key={option.value}
              className={cn(
                "flex cursor-pointer gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary/40",
                "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring",
                checked && "border-primary bg-primary/5",
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                className="mt-1 size-4 accent-primary focus-visible:outline-none"
              />
              <span className="space-y-0.5">
                <span className="flex items-center gap-2 font-medium">
                  {Icon && <Icon aria-hidden="true" className="size-4" />}
                  {option.label}
                </span>
                {option.description && (
                  <span className="block text-sm text-muted-foreground">
                    {option.description}
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
