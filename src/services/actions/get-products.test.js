import { describe, expect, it, vi, beforeEach } from "vitest";
import { getProducts } from "./get-products";
import { productsApi } from "../api/products.api";

vi.mock("../api/products.api", () => ({
  productsApi: {
    get: vi.fn(),
  },
}));

describe("getProducts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call productsApi.get with /product", async () => {
    productsApi.get.mockResolvedValue({ data: [] });

    await getProducts();

    expect(productsApi.get).toHaveBeenCalledTimes(1);
    expect(productsApi.get).toHaveBeenCalledWith("/product");
  });

  it("should return the api response", async () => {
    const response = {
      data: [{ id: "1", brand: "Apple" }],
      status: 200,
    };

    productsApi.get.mockResolvedValue(response);

    const result = await getProducts();

    expect(result).toBe(response);
  });
});