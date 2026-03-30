import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ProductsLayout from "./products-layout";

const { outletMock, headerMock } = vi.hoisted(() => ({
  outletMock: vi.fn(() => <div data-testid="outlet">Outlet content</div>),
  headerMock: vi.fn(() => <div data-testid="products-header">Products header</div>),
}));

vi.mock("react-router", () => ({
  Outlet: outletMock,
}));

vi.mock("../products/products-header/products-header", () => ({
  default: headerMock,
}));

describe("ProductsLayout", () => {
  it("should render products header", () => {
    render(<ProductsLayout />);

    expect(screen.getByTestId("products-header")).toBeInTheDocument();
  });

  it("should render outlet", () => {
    render(<ProductsLayout />);

    expect(screen.getByTestId("outlet")).toBeInTheDocument();
    expect(screen.getByText("Outlet content")).toBeInTheDocument();
  });

  it("should render header before outlet", () => {
    render(<ProductsLayout />);

    const header = screen.getByTestId("products-header");
    const outlet = screen.getByTestId("outlet");

    expect(
      header.compareDocumentPosition(outlet) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });
});