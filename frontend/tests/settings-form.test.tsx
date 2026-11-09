import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { SettingsForm } from "@/features/settings/settings-form";
import { readPreferences } from "@/lib/preferences";

describe("SettingsForm", () => {
  it("exposes each setting as a labelled radio group", () => {
    render(<SettingsForm />);
    for (const name of ["Mavzu", "Matn o‘lchami", "Animatsiya"]) {
      expect(screen.getByRole("group", { name })).toBeInTheDocument();
    }
    expect(screen.getByRole("radio", { name: /Tizim$/ })).toBeChecked();
  });

  it("applies changes immediately, announces them, and resets", async () => {
    const user = userEvent.setup();
    render(<SettingsForm />);

    await user.click(screen.getByRole("radio", { name: /Juda katta/ }));
    expect(document.documentElement.dataset.textScale).toBe("xlarge");
    expect(readPreferences().textScale).toBe("xlarge");
    expect(screen.getByRole("status")).toHaveTextContent(
      "Matn o‘lchami o‘zgartirildi.",
    );

    await user.click(screen.getByRole("radio", { name: /Kamaytirilgan/ }));
    expect(document.documentElement.dataset.motion).toBe("reduce");

    await user.click(
      screen.getByRole("button", { name: /Standart holatga qaytarish/ }),
    );
    expect(document.documentElement.dataset.textScale).toBeUndefined();
    expect(screen.getByRole("radio", { name: /Oddiy/ })).toBeChecked();
  });
});
