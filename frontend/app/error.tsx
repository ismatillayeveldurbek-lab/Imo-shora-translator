"use client";

import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div
      role="alert"
      className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center"
    >
      <h1 className="text-3xl font-bold tracking-tight">Xatolik yuz berdi</h1>
      <p className="mt-4 text-muted-foreground">
        Sahifani ko‘rsatishda kutilmagan muammo yuz berdi. Iltimos, qayta urinib
        ko‘ring.
      </p>
      <Button className="mt-8" onClick={reset}>
        Qayta urinish
      </Button>
    </div>
  );
}
