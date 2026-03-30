import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ProductDetailCard from "./product-detail-card";

const MockIcon = (props) => <svg data-testid="mock-icon" {...props} />;

describe("ProductDetailCard", () => {
  it("should render label and value", () => {
    render(
      <ProductDetailCard
        label="RAM"
        value="8 GB"
      />
    );

    expect(screen.getByText("RAM")).toBeInTheDocument();
    expect(screen.getByText("8 GB")).toBeInTheDocument();
  });

  it('should render fallback when value is empty', () => {
    render(
      <ProductDetailCard
        label="RAM"
        value=""
      />
    );

    expect(screen.getByText("No disponible")).toBeInTheDocument();
  });

  it("should render icon when provided", () => {
    render(
      <ProductDetailCard
        label="RAM"
        value="8 GB"
        icon={MockIcon}
      />
    );

    expect(screen.getByTestId("mock-icon")).toBeInTheDocument();
  });

  it("should not render icon when not provided", () => {
    render(
      <ProductDetailCard
        label="RAM"
        value="8 GB"
      />
    );

    expect(screen.queryByTestId("mock-icon")).not.toBeInTheDocument();
  });
});