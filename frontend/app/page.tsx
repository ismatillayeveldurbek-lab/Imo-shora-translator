import { AccessibilitySection } from "@/features/home/accessibility-section";
import { Faq } from "@/features/home/faq";
import { FeatureGrid } from "@/features/home/feature-grid";
import { Hero } from "@/features/home/hero";
import { HowItWorksSummary } from "@/features/home/how-it-works-summary";
import { LimitationsNotice } from "@/features/home/limitations-notice";
import { SystemStatus } from "@/features/home/system-status";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeatureGrid />
      <HowItWorksSummary />
      <AccessibilitySection />
      <Faq />
      <LimitationsNotice />
      <SystemStatus />
    </>
  );
}
