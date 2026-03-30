import { describe, expect, it, vi } from "vitest";

const {
  createBrowserRouterMock,
  navigateMock,
  productsLayoutMock,
  searchProductsPageMock,
  productPageMock,
} = vi.hoisted(() => ({
  createBrowserRouterMock: vi.fn(() => "mock-router"),
  navigateMock: vi.fn(({ to }) => <div>{to}</div>),
  productsLayoutMock: vi.fn(() => <div>ProductsLayout</div>),
  searchProductsPageMock: vi.fn(() => <div>SearchProductsPage</div>),
  productPageMock: vi.fn(() => <div>ProductPage</div>),
}));

vi.mock("react-router", () => ({
  createBrowserRouter: createBrowserRouterMock,
  Navigate: navigateMock,
}));

vi.mock("../components/layout/products-layout", () => ({
  default: productsLayoutMock,
}));

vi.mock("../pages/search/search-products-page", () => ({
  default: searchProductsPageMock,
}));

vi.mock("../pages/product/product-page", () => ({
  default: productPageMock,
}));

describe("appRouter", () => {
  it("should create browser router with expected routes", async () => {
    await import("./app.router");

    expect(createBrowserRouterMock).toHaveBeenCalledTimes(1);

    const routes = createBrowserRouterMock.mock.calls[0][0];

    expect(routes).toHaveLength(1);
    expect(routes[0].path).toBe("/");
    expect(routes[0].children).toHaveLength(3);

    expect(routes[0].children[0].index).toBe(true);
    expect(routes[0].children[1].path).toBe("product/:productId");
    expect(routes[0].children[2].path).toBe("*");
  });
});