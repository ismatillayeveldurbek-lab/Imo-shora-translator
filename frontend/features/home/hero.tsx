import { ArrowRight, Camera, Activity } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { routes, siteConfig } from "@/lib/site-config";

export function Hero() {
  const { textToSign, signToText } = routes;
  const anyActionAvailable = textToSign.available || signToText.available;

  return (
    <section
      aria-labelledby="hero-title"
      className="relative overflow-hidden border-b"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--color-accent),transparent_60%)] opacity-70"
      />
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <p className="mb-4 inline-flex items-center rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          MVP · lug‘atga asoslangan tarjima
        </p>
        <h1
          id="hero-title"
          className="max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl"
        >
          {siteConfig.name} —{" "}
          <span className="bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
            {siteConfig.tagline}
          </span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-pretty text-muted-foreground">
          {siteConfig.description}
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          {textToSign.available && (
            <Button asChild size="lg">
              <Link href={textToSign.href}>
                Tarjimani boshlash <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          )}
          {signToText.available && (
            <Button asChild size="lg" variant="outline">
              <Link href={signToText.href}>
                <Camera aria-hidden="true" /> Imo-ishorani aniqlash
              </Link>
            </Button>
          )}
          {!anyActionAvailable && (
            <Button asChild size="lg" variant="outline">
              <a href="#tizim-holati">
                <Activity aria-hidden="true" /> Tizim holatini ko‘rish
              </a>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
