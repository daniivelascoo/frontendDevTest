import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ProductCard from "./product-card";

const { linkMock } = vi.hoisted(() => ({
  linkMock: vi.fn(({ to, children, ...props }) => (
    <a href={to} data-testid="product-link" {...props}>
      {children}
    </a>
  )),
}));

vi.mock("react-router", () => ({
  Link: linkMock,
}));

describe("ProductCard", () => {
  const product = {
    id: "abc123",
    brand: "Apple",
    model: "iPhone 15",
    price: "999",
    imgUrl: "https://example.com/iphone.jpg",
  };

  it("should render product information", () => {
    render(<ProductCard product={product} />);

    expect(screen.getByText("Apple")).toBeInTheDocument();
    expect(screen.getByText("iPhone 15")).toBeInTheDocument();
    expect(screen.getByText("999 €")).toBeInTheDocument();
    expect(screen.getByText("Ver detalle →")).toBeInTheDocument();
  });

  it("should render product image with correct attributes", () => {
    render(<ProductCard product={product} />);

    const image = screen.getByRole("img", { name: "Apple iPhone 15" });

    expect(image).toHaveAttribute("src", product.imgUrl);
    expect(image).toHaveAttribute("alt", "Apple iPhone 15");
  });

  it("should render link to product detail page", () => {
    render(<ProductCard product={product} />);

    expect(screen.getByTestId("product-link")).toHaveAttribute(
      "href",
      "/product/abc123"
    );
  });
});