import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { DatePicker } from "./date-picker";

describe("DatePicker", () => {
  it("displays the selected date as DD/MM/YYYY", () => {
    render(<DatePicker value="2026-03-15" onChange={() => {}} />);
    expect(screen.getByRole("button", { name: /choose date/i })).toHaveTextContent("15/03/2026");
  });

  it("shows the DD/MM/YYYY placeholder when empty", () => {
    render(<DatePicker value="" onChange={() => {}} />);
    expect(screen.getByRole("button", { name: /choose date/i })).toHaveTextContent("DD/MM/YYYY");
  });

  it("emits the selected day in storage format (YYYY-MM-DD)", () => {
    const onChange = vi.fn();
    render(<DatePicker value="" onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: /choose date/i }));
    fireEvent.click(screen.getByText("15"));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toMatch(/^\d{4}-\d{2}-15$/);
  });
});
