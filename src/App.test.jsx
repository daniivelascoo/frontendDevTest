import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import App from "./App";

const {
  routerProviderMock,
  toasterMock,
  productsContextProviderMock,
} = vi.hoisted(() => ({
  routerProviderMock: vi.fn(({ router }) => (
    <div data-testid="router-provider">{String(router)}</div>
  )),
  toasterMock: vi.fn(({ position, richColors }) => (
    <div data-testid="toaster">
      {position}-{String(richColors)}
    </div>
  )),
  productsContextProviderMock: vi.fn(({ children }) => (
    <div data-testid="products-context-provider">{children}</div>
  )),
}));

vi.mock("react-router", () => ({
  RouterProvider: routerProviderMock,
}));

vi.mock("sonner", () => ({
  Toaster: toasterMock,
}));

vi.mock("./routes/app.router", () => ({
  appRouter: "mock-app-router",
}));

vi.mock("./context/products-context-provider", () => ({
  default: productsContextProviderMock,
}));

describe("App", () => {
  it("should render ProductsContextProvider", () => {
    render(<App />);

    expect(screen.getByTestId("products-context-provider")).toBeInTheDocument();
  });

  it("should render Toaster with expected props", () => {
    render(<App />);

    expect(screen.getByTestId("toaster")).toHaveTextContent(
      "bottom-right-true"
    );
    expect(toasterMock).toHaveBeenCalledWith(
      expect.objectContaining({
        position: "bottom-right",
        richColors: true,
      }),
      undefined
    );
  });

  it("should render RouterProvider with appRouter", () => {
    render(<App />);

    expect(screen.getByTestId("router-provider")).toHaveTextContent(
      "mock-app-router"
    );
    expect(routerProviderMock).toHaveBeenCalledWith(
      expect.objectContaining({
        router: "mock-app-router",
      }),
      undefined
    );
  });
});