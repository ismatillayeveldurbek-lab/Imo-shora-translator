import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { MobileNav } from "@/components/layout/mobile-nav";

describe("MobileNav", () => {
  it("toggles a labelled panel with aria-expanded and closes on Escape", async () => {
    const user = userEvent.setup();
    render(<MobileNav />);
    const toggle = screen.getByRole("button", { name: "Menyuni ochish" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    const nav = screen.getByRole("navigation", { name: "Mobil navigatsiya" });
    expect(nav).toBeVisible();
    expect(screen.getByRole("link", { name: "Bosh sahifa" })).toHaveAttribute(
      "aria-current",
      "page",
    );

    await user.keyboard("{Escape}");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveFocus();
  });

  it("closes after choosing a link", async () => {
    const user = userEvent.setup();
    render(<MobileNav />);
    await user.click(screen.getByRole("button", { name: "Menyuni ochish" }));
    await user.click(screen.getByRole("link", { name: "Biz haqimizda" }));
    expect(
      screen.getByRole("button", { name: "Menyuni ochish" }),
    ).toHaveAttribute("aria-expanded", "false");
  });
});
