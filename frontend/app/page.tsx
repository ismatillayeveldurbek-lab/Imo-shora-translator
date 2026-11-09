import { FeatureGrid } from "@/features/home/feature-grid";
import { Hero } from "@/features/home/hero";
import { LimitationsNotice } from "@/features/home/limitations-notice";
import { SystemStatus } from "@/features/home/system-status";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeatureGrid />
      <LimitationsNotice />
      <SystemStatus />
    </>
  );
}
