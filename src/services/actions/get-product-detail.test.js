import { describe, expect, it, vi, beforeEach } from "vitest";
import { getProductDetail } from "./get-product-detail";
import { productsApi } from "../api/products.api";

vi.mock("../api/products.api", () => ({
  productsApi: {
    get: vi.fn(),
  },
}));

describe("getProductDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call productsApi.get with product id", async () => {
    productsApi.get.mockResolvedValue({ data: {} });

    await getProductDetail("abc123");

    expect(productsApi.get).toHaveBeenCalledTimes(1);
    expect(productsApi.get).toHaveBeenCalledWith("/product/abc123");
  });

  it("should return the api response", async () => {
    const response = {
      data: { id: "abc123", brand: "Samsung" },
      status: 200,
    };

    productsApi.get.mockResolvedValue(response);

    const result = await getProductDetail("abc123");

    expect(result).toBe(response);
  });
});