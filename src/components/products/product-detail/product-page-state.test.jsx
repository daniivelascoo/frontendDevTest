import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ProductPageState from "./product-page-state";

const { backToLinkMock, spinnerMock } = vi.hoisted(() => ({
  backToLinkMock: vi.fn(({ path, text }) => (
    <a href={path} data-testid="back-link">
      {text}
    </a>
  )),
  spinnerMock: vi.fn(({ size }) => <div data-testid="spinner">{size}</div>),
}));

vi.mock("../../ui/back-to-link/back-to-link", () => ({
  default: backToLinkMock,
}));

vi.mock("../../ui/spinner/spinner", () => ({
  default: spinnerMock,
}));

describe("ProductPageState", () => {
  it("should render title and description when showSpinner is false", () => {
    render(
      <ProductPageState
        title="Producto no encontrado"
        description="No hemos podido cargar este producto"
      />
    );

    expect(screen.getByText("Producto no encontrado")).toBeInTheDocument();
    expect(
      screen.getByText("No hemos podido cargar este producto")
    ).toBeInTheDocument();
    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
  });

  it("should render back link", () => {
    render(
      <ProductPageState
        title="Título"
        description="Descripción"
      />
    );

    expect(screen.getByTestId("back-link")).toHaveAttribute("href", "/");
    expect(screen.getByText("Volver a productos")).toBeInTheDocument();
  });

  it("should render spinner when showSpinner is true", () => {
    render(
      <ProductPageState
        title="Título"
        description="Descripción"
        showSpinner
      />
    );

    expect(screen.getByTestId("spinner")).toBeInTheDocument();
    expect(screen.queryByText("Título")).not.toBeInTheDocument();
    expect(screen.queryByText("Descripción")).not.toBeInTheDocument();
  });

  it("should pass size 28 to spinner", () => {
    render(
      <ProductPageState
        title="Título"
        description="Descripción"
        showSpinner
      />
    );

    expect(screen.getByTestId("spinner")).toHaveTextContent("28");
  });
});