import { describe, expect, it } from "vitest";
import {
  filterProductsWithoutPrice,
  getProductField,
  formatDetailValue,
  getBreadcrumbLabel,
} from "./products";

describe("filterProductsWithoutPrice", () => {
  it("should filter out products without price", () => {
    const products = [
      { id: 1, price: "100" },
      { id: 2, price: "" },
      { id: 3, price: "250" },
    ];

    expect(filterProductsWithoutPrice(products)).toEqual([
      { id: 1, price: "100" },
      { id: 3, price: "250" },
    ]);
  });
});

describe("getProductField", () => {
  it("should return the first valid field", () => {
    const product = {
      os: "",
      ram: "8 GB",
      chipset: "Snapdragon",
    };

    expect(getProductField(product, ["os", "ram", "chipset"])).toBe("8 GB");
  });

  it("should return fallback if no valid field is found", () => {
    const product = {
      os: "",
      ram: null,
      chipset: undefined,
    };

    expect(getProductField(product, ["os", "ram", "chipset"])).toBe("No disponible");
  });

  it("should support custom fallback", () => {
    expect(getProductField({}, ["price"], "-")).toBe("-");
  });
});

describe("formatDetailValue", () => {
  it("should join array values with commas", () => {
    expect(formatDetailValue(["Bluetooth 5.0", "A2DP"])).toBe("Bluetooth 5.0, A2DP");
  });

  it("should return fallback for empty array", () => {
    expect(formatDetailValue([])).toBe("No disponible");
  });

  it("should return fallback for null, undefined or empty string", () => {
    expect(formatDetailValue(null)).toBe("No disponible");
    expect(formatDetailValue(undefined)).toBe("No disponible");
    expect(formatDetailValue("")).toBe("No disponible");
  });

  it("should return value if valid", () => {
    expect(formatDetailValue("AMOLED")).toBe("AMOLED");
  });
});

describe("getBreadcrumbLabel", () => {
  it('should return "Productos" for home route', () => {
    expect(getBreadcrumbLabel("/")).toBe("Productos");
  });

  it('should return "Producto" for product detail route', () => {
    expect(getBreadcrumbLabel("/products/123")).toBe("Producto");
  });

  it('should return default label for unknown routes', () => {
    expect(getBreadcrumbLabel("/other")).toBe("prueba");
  });
});