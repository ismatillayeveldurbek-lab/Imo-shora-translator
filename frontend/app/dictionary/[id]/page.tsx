import type { Metadata } from "next";
import { Suspense } from "react";

import {
  SignDetailSkeleton,
  SignDetailView,
} from "@/features/dictionary/sign-detail-view";

export const metadata: Metadata = {
  title: "Imo-ishora",
};

export default function SignDetailPage({
  params,
}: PageProps<"/dictionary/[id]">) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* params are runtime data under Cache Components: resolve inside Suspense. */}
      <Suspense fallback={<SignDetailSkeleton />}>
        {params.then(({ id }) => (
          <SignDetailView id={id} />
        ))}
      </Suspense>
    </div>
  );
}
