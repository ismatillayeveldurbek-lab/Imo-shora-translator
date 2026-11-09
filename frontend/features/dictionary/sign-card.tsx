import Link from "next/link";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { SignBadges } from "@/features/dictionary/sign-badges";
import type { SignSummary } from "@/types/api";

export function SignCard({ sign }: { sign: SignSummary }) {
  return (
    <Link
      href={`/dictionary/${sign.id}`}
      className="group block h-full rounded-xl"
    >
      <Card className="h-full transition-colors group-hover:border-primary/40">
        <CardHeader className="gap-3">
          <div>
            <CardTitle className="text-lg">{sign.uzbek_label}</CardTitle>
            <p className="mt-0.5 font-mono text-xs tracking-wide text-muted-foreground">
              {sign.gloss}
            </p>
          </div>
          <SignBadges sign={sign} />
        </CardHeader>
      </Card>
    </Link>
  );
}
