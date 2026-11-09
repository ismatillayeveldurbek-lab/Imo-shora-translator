import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <p className="text-sm font-medium text-primary">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">
        Sahifa topilmadi
      </h1>
      <p className="mt-4 text-muted-foreground">
        Siz qidirgan sahifa mavjud emas yoki hali ishga tushirilmagan.
      </p>
      <Button asChild className="mt-8">
        <Link href="/">Bosh sahifaga qaytish</Link>
      </Button>
    </div>
  );
}
