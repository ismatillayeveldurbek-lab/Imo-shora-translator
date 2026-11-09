import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { readPreferences } from "@/lib/preferences";

describe("ThemeToggle", () => {
  it("cycles system → light → dark → system and persists the choice", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    expect(button).toHaveAccessibleName(/Joriy: Tizim mavzusi/);

    await user.click(button);
    expect(readPreferences().theme).toBe("light");
    expect(document.documentElement).not.toHaveClass("dark");

    await user.click(button);
    expect(readPreferences().theme).toBe("dark");
    expect(document.documentElement).toHaveClass("dark");
    expect(button).toHaveAccessibleName(/Joriy: Qorong‘i mavzu/);

    await user.click(button);
    expect(readPreferences().theme).toBe("system");
    expect(document.documentElement).not.toHaveClass("dark");
  });
});
