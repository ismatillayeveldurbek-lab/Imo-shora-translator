"use client";

import { AlertTriangle, BookOpen, Search, SearchX } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { StateMessage } from "@/components/ui/state-message";
import { SignCard } from "@/features/dictionary/sign-card";
import { useCategories, useSigns } from "@/hooks/use-dictionary";
import { isUzbekLetter, UZBEK_ALPHABET } from "@/lib/uzbek-alphabet";
import { cn } from "@/lib/utils";
import { ApiError } from "@/services/api-client";

const SEARCH_DEBOUNCE_MS = 300;

type Filters = { q: string; category: string; letter: string; page: number };
type FilterPatch = Partial<Record<keyof Filters, string | number | null>>;

function readFilters(params: URLSearchParams): Filters {
  const letter = params.get("letter");
  const page = Number.parseInt(params.get("page") ?? "1", 10);
  return {
    q: params.get("q") ?? "",
    category: params.get("category") ?? "",
    letter: isUzbekLetter(letter) ? letter : "",
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

export function DictionaryBrowser() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const filters = readFilters(new URLSearchParams(searchParams.toString()));
  const hasFilters = Boolean(filters.q || filters.category || filters.letter);

  const searchId = useId();
  const categoryId = useId();

  // Local draft of the search box; re-synced when the URL changes (e.g. Back).
  const [draft, setDraft] = useState(filters.q);
  const [syncedQ, setSyncedQ] = useState(filters.q);
  if (syncedQ !== filters.q) {
    setSyncedQ(filters.q);
    setDraft(filters.q);
  }

  function hrefWith(patch: FilterPatch): string {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === "" || (key === "page" && value === 1))
        next.delete(key);
      else next.set(key, String(value));
    }
    const query = next.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  function replaceFilters(patch: FilterPatch) {
    router.replace(hrefWith(patch), { scroll: false });
  }

  useEffect(() => {
    const trimmed = draft.trim();
    if (trimmed === filters.q) return;
    const timer = setTimeout(
      () =>
        router.replace(hrefWith({ q: trimmed, page: null }), { scroll: false }),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
    // hrefWith/router are derived from the URL, which is already a dependency via filters.q.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, filters.q]);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    replaceFilters({ q: draft.trim(), page: null });
  }

  const signs = useSigns({
    q: filters.q,
    category: filters.category,
    letter: filters.letter,
    page: filters.page,
  });
  const categories = useCategories();

  return (
    <div className="space-y-8">
      <form
        role="search"
        onSubmit={onSubmit}
        className="grid gap-4 md:grid-cols-[1fr_260px]"
      >
        <div className="space-y-1.5">
          <label htmlFor={searchId} className="text-sm font-medium">
            Qidirish
          </label>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id={searchId}
              type="search"
              value={draft}
              maxLength={100}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="So‘z yoki gloss, masalan: salom"
              className="pl-9"
              autoComplete="off"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label htmlFor={categoryId} className="text-sm font-medium">
            Toifa
          </label>
          <NativeSelect
            id={categoryId}
            value={filters.category}
            disabled={categories.isError}
            onChange={(event) =>
              replaceFilters({ category: event.target.value, page: null })
            }
          >
            <option value="">Barcha toifalar</option>
            {categories.data?.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name} ({category.sign_count})
              </option>
            ))}
            {filters.category &&
              categories.data &&
              !categories.data.some((c) => c.slug === filters.category) && (
                <option value={filters.category}>{filters.category}</option>
              )}
          </NativeSelect>
        </div>
      </form>

      <nav aria-label="Alifbo bo‘yicha ko‘rish">
        <ul className="flex flex-wrap gap-1.5">
          {[{ key: "", label: "Hammasi" }, ...UZBEK_ALPHABET].map(
            ({ key, label }) => {
              const active = filters.letter === key;
              return (
                <li key={key || "all"}>
                  <Link
                    href={hrefWith({ letter: key, page: null })}
                    scroll={false}
                    aria-current={active ? "true" : undefined}
                    aria-label={key ? `${label} harfi` : undefined}
                    className={cn(
                      "inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-2.5 text-sm font-medium transition-colors",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "bg-card hover:bg-muted",
                    )}
                  >
                    {label}
                  </Link>
                </li>
              );
            },
          )}
        </ul>
      </nav>

      <section aria-labelledby="results-title" aria-busy={signs.isFetching}>
        <h2 id="results-title" className="sr-only">
          Natijalar
        </h2>
        <p
          role="status"
          aria-live="polite"
          className="mb-4 text-sm text-muted-foreground"
        >
          {signs.isSuccess && `${signs.data.total} ta imo-ishora topildi`}
        </p>

        {signs.isPending ? (
          <ul
            aria-label="Yuklanmoqda"
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {Array.from({ length: 6 }, (_, i) => (
              <li
                key={i}
                className="h-32 animate-pulse rounded-xl border bg-muted/60"
              />
            ))}
          </ul>
        ) : signs.isError ? (
          <StateMessage
            role="alert"
            icon={AlertTriangle}
            title="Lug‘atni yuklab bo‘lmadi"
            action={
              <Button variant="outline" onClick={() => void signs.refetch()}>
                Qayta urinish
              </Button>
            }
          >
            {signs.error instanceof ApiError
              ? signs.error.message
              : "Noma’lum xatolik."}
          </StateMessage>
        ) : signs.data.total === 0 ? (
          hasFilters ? (
            <StateMessage
              icon={SearchX}
              title="Hech narsa topilmadi"
              action={
                <Button asChild variant="outline">
                  <Link href={pathname} scroll={false}>
                    Filtrlarni tozalash
                  </Link>
                </Button>
              }
            >
              Boshqa so‘z bilan qidirib ko‘ring yoki filtrlarni olib tashlang.
            </StateMessage>
          ) : (
            <StateMessage icon={BookOpen} title="Lug‘at hozircha bo‘sh">
              Imo-ishoralar mutaxassislar tomonidan tasdiqlangan va videolari
              tekshirilgandan so‘ng shu yerda paydo bo‘ladi.
            </StateMessage>
          )
        ) : (
          <>
            <ul
              className={cn(
                "grid gap-4 transition-opacity sm:grid-cols-2 lg:grid-cols-3",
                signs.isPlaceholderData && "opacity-60",
              )}
            >
              {signs.data.items.map((sign) => (
                <li key={sign.id}>
                  <SignCard sign={sign} />
                </li>
              ))}
            </ul>
            <Pagination
              page={signs.data.page}
              totalPages={signs.data.total_pages}
              hrefFor={(page) => hrefWith({ page })}
            />
          </>
        )}
      </section>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  hrefFor,
}: {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
}) {
  if (totalPages <= 1) return null;
  const linkClass =
    "inline-flex h-10 items-center rounded-lg border bg-card px-4 text-sm font-medium hover:bg-muted";
  const disabledClass =
    "inline-flex h-10 items-center rounded-lg border px-4 text-sm text-muted-foreground opacity-50";
  return (
    <nav
      aria-label="Sahifalar"
      className="mt-8 flex items-center justify-between gap-4"
    >
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={linkClass} rel="prev">
          ← Oldingi
        </Link>
      ) : (
        <span aria-disabled="true" className={disabledClass}>
          ← Oldingi
        </span>
      )}
      <p className="text-sm text-muted-foreground">
        {page} / {totalPages}-sahifa
      </p>
      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} className={linkClass} rel="next">
          Keyingi →
        </Link>
      ) : (
        <span aria-disabled="true" className={disabledClass}>
          Keyingi →
        </span>
      )}
    </nav>
  );
}
