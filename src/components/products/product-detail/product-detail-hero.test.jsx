import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ProductDetailHero from "./product-detail-hero";

describe("ProductDetailHero", () => {
  const product = {
    brand: "Samsung",
    model: "Galaxy S24",
    imgUrl: "https://example.com/galaxy.jpg",
    price: "899",
  };

  const heroDetails = [
    { label: "Sistema operativo", value: "Android" },
    { label: "RAM", value: "8 GB" },
  ];

  it("should render product information", () => {
    render(<ProductDetailHero product={product} heroDetails={heroDetails} />);

    expect(screen.getByText("Samsung")).toBeInTheDocument();
    expect(screen.getByText("Galaxy S24")).toBeInTheDocument();
    expect(screen.getByText("899 €")).toBeInTheDocument();
  });

  it("should render product image with correct attributes", () => {
    render(<ProductDetailHero product={product} heroDetails={heroDetails} />);

    const image = screen.getByRole("img", { name: "Samsung Galaxy S24" });

    expect(image).toHaveAttribute("src", product.imgUrl);
    expect(image).toHaveAttribute("alt", "Samsung Galaxy S24");
  });

  it("should render hero details", () => {
    render(<ProductDetailHero product={product} heroDetails={heroDetails} />);

    expect(screen.getByText("Sistema operativo")).toBeInTheDocument();
    expect(screen.getByText("Android")).toBeInTheDocument();
    expect(screen.getByText("RAM")).toBeInTheDocument();
    expect(screen.getByText("8 GB")).toBeInTheDocument();
  });

  it("should render one card per hero detail", () => {
    render(<ProductDetailHero product={product} heroDetails={heroDetails} />);

    expect(screen.getAllByText(/Sistema operativo|RAM|Android|8 GB/).length).toBeGreaterThan(0);
  });
});