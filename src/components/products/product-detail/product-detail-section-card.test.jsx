import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ProductDetailSectionCard from "./product-detail-section-card";

describe("ProductDetailSectionCard", () => {
  it("should render title and children", () => {
    render(
      <ProductDetailSectionCard title="Información">
        <p>Contenido de prueba</p>
      </ProductDetailSectionCard>
    );

    expect(screen.getByText("Información")).toBeInTheDocument();
    expect(screen.getByText("Contenido de prueba")).toBeInTheDocument();
  });
});