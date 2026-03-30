import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProductsContext, useProducts } from "./use-products";

const TestComponent = () => {
  const context = useProducts();

  return (
    <div>
      <span data-testid="products-length">{context.products.length}</span>
      <span data-testid="cart-count">{context.cartCount}</span>
      <span data-testid="current-page">{context.currentPage}</span>
    </div>
  );
};

describe("useProducts", () => {
  it("should return context value when used inside provider", () => {
    const value = {
      isLoading: false,
      products: [{ id: "1" }, { id: "2" }],
      fetchProducts: async () => [],
      cartCount: 3,
      setCartCount: () => {},
      currentPage: 2,
      setCurrentPage: () => {},
    };

    render(
      <ProductsContext.Provider value={value}>
        <TestComponent />
      </ProductsContext.Provider>
    );

    expect(screen.getByTestId("products-length")).toHaveTextContent("2");
    expect(screen.getByTestId("cart-count")).toHaveTextContent("3");
    expect(screen.getByTestId("current-page")).toHaveTextContent("2");
  });

  it("should throw error when used outside provider", () => {
    expect(() => render(<TestComponent />)).toThrow(
      "useProducts must be used within a ProductsContextProvider"
    );
  });
});