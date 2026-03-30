import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ProductPurchasePanel from "./product-purchase-panel";

const { sectionCardMock, spinnerMock } = vi.hoisted(() => ({
  sectionCardMock: vi.fn(({ title, children }) => (
    <section data-testid="section-card">
      <h2>{title}</h2>
      {children}
    </section>
  )),
  spinnerMock: vi.fn(() => <div data-testid="spinner" />),
}));

vi.mock("./product-detail-section-card", () => ({
  default: sectionCardMock,
}));

vi.mock("../../ui/spinner/spinner", () => ({
  default: spinnerMock,
}));

describe("ProductPurchasePanel", () => {
  const baseProps = {
    storageOptions: [
      { code: 64, name: "64 GB" },
      { code: 128, name: "128 GB" },
    ],
    colorOptions: [
      { code: 1, name: "Black" },
      { code: 2, name: "Blue" },
    ],
    selectedStorage: "64",
    selectedColor: "1",
    selectedStorageName: "64 GB",
    selectedColorName: "Black",
    onStorageChange: vi.fn(),
    onColorChange: vi.fn(),
    onAddToCart: vi.fn(),
    addingProduct: false,
  };

  it("should render section title", () => {
    render(<ProductPurchasePanel {...baseProps} />);

    expect(screen.getByText("Configuración y compra")).toBeInTheDocument();
  });

  it("should render storage and color options", () => {
    render(<ProductPurchasePanel {...baseProps} />);

    expect(screen.getByText("64 GB")).toBeInTheDocument();
    expect(screen.getByText("128 GB")).toBeInTheDocument();
    expect(screen.getByText("Black")).toBeInTheDocument();
    expect(screen.getByText("Blue")).toBeInTheDocument();
  });

  it("should call onStorageChange with string code", () => {
    const onStorageChange = vi.fn();

    render(
      <ProductPurchasePanel
        {...baseProps}
        onStorageChange={onStorageChange}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "128 GB" }));

    expect(onStorageChange).toHaveBeenCalledWith("128");
  });

  it("should call onColorChange with string code", () => {
    const onColorChange = vi.fn();

    render(
      <ProductPurchasePanel
        {...baseProps}
        onColorChange={onColorChange}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Blue" }));

    expect(onColorChange).toHaveBeenCalledWith("2");
  });

  it("should render current selection text", () => {
    render(<ProductPurchasePanel {...baseProps} />);

    expect(screen.getByText(/Selección actual:/)).toBeInTheDocument();
    expect(screen.getByText(/64 GB · Black/)).toBeInTheDocument();
  });

  it("should call onAddToCart when add button is clicked", () => {
    const onAddToCart = vi.fn();

    render(
      <ProductPurchasePanel
        {...baseProps}
        onAddToCart={onAddToCart}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Añadir al carrito" }));

    expect(onAddToCart).toHaveBeenCalledTimes(1);
  });

  it("should disable add button and render spinner when addingProduct is true", () => {
    render(
      <ProductPurchasePanel
        {...baseProps}
        addingProduct
      />
    );

    const buttons = screen.getAllByRole("button");
    const addButton = buttons[buttons.length - 1];

    expect(addButton).toBeDisabled();
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
    expect(screen.queryByText("Añadir al carrito")).not.toBeInTheDocument();
  });
});