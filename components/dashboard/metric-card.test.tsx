import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Radar } from "lucide-react";
import { MetricCard } from "./metric-card";

describe("MetricCard", () => {
  it("renders the label and value", () => {
    render(<MetricCard icon={Radar} label="Credits Remaining" value="8,420" tone="mint" />);
    expect(screen.getByText("Credits Remaining")).toBeTruthy();
    expect(screen.getByText("8,420")).toBeTruthy();
  });
});
