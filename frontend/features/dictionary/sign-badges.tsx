import { FlaskConical, Hand, Move, VideoOff } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { SignSummary } from "@/types/api";

export function SignBadges({ sign }: { sign: SignSummary }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {sign.is_test_data && (
        <Badge variant="warning">
          <FlaskConical aria-hidden="true" /> TEST ma’lumoti
        </Badge>
      )}
      {sign.category && <Badge variant="secondary">{sign.category.name}</Badge>}
      <Badge variant="outline">
        {sign.is_dynamic ? (
          <Move aria-hidden="true" />
        ) : (
          <Hand aria-hidden="true" />
        )}
        {sign.is_dynamic ? "Harakatli" : "Statik"}
      </Badge>
      {!sign.has_video && (
        <Badge variant="outline">
          <VideoOff aria-hidden="true" /> Video yo‘q
        </Badge>
      )}
    </div>
  );
}
