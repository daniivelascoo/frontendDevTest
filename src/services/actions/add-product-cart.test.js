import { describe, expect, it, vi, beforeEach } from "vitest";
import { addProductCart } from "./add-product-cart";
import { productsApi } from "../api/products.api";
import { productCartBodySchema } from "../../schemas/product-cart-body.schema";

vi.mock("../api/products.api", () => ({
  productsApi: {
    post: vi.fn(),
  },
}));

vi.mock("../../schemas/product-cart-body.schema", () => ({
  productCartBodySchema: {
    safeParse: vi.fn(),
  },
}));

describe("addProductCart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return status 400 when body is invalid", async () => {
    productCartBodySchema.safeParse.mockReturnValue({ success: false });

    const body = { invalid: true };
    const result = await addProductCart(body);

    expect(productCartBodySchema.safeParse).toHaveBeenCalledWith(body);
    expect(productsApi.post).not.toHaveBeenCalled();
    expect(result).toEqual({ status: 400 });
  });

  it("should call productsApi.post when body is valid", async () => {
    productCartBodySchema.safeParse.mockReturnValue({ success: true });
    productsApi.post.mockResolvedValue({ data: { ok: true }, status: 200 });

    const body = {
      id: "1",
      colorCode: "black",
      storageCode: "128",
    };

    await addProductCart(body);

    expect(productCartBodySchema.safeParse).toHaveBeenCalledWith(body);
    expect(productsApi.post).toHaveBeenCalledTimes(1);
    expect(productsApi.post).toHaveBeenCalledWith("/cart", body);
  });

  it("should return the api response when body is valid", async () => {
    productCartBodySchema.safeParse.mockReturnValue({ success: true });

    const response = {
      data: { count: 3 },
      status: 200,
    };

    productsApi.post.mockResolvedValue(response);

    const body = {
      id: "1",
      colorCode: "black",
      storageCode: "128",
    };

    const result = await addProductCart(body);

    expect(result).toBe(response);
  });
});