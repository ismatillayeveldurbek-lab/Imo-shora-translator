import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { THEME_STORAGE_KEY } from "@/lib/theme";

describe("ThemeToggle", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  it("cycles system → light → dark → system and persists the choice", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    expect(button).toHaveAccessibleName(/Joriy: Tizim mavzusi/);

    await user.click(button);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    expect(document.documentElement).not.toHaveClass("dark");

    await user.click(button);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(document.documentElement).toHaveClass("dark");
    expect(button).toHaveAccessibleName(/Joriy: Qorong‘i mavzu/);

    await user.click(button);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("system");
    expect(document.documentElement).not.toHaveClass("dark");
  });
});
