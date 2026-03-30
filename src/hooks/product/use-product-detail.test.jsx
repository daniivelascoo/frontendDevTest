import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useProductDetail } from "./use-product-detail";

const {
  queryMock,
  cacheGetMock,
  cacheSetMock,
  cacheRemoveMock,
  safeParseMock,
} = vi.hoisted(() => ({
  queryMock: vi.fn(),
  cacheGetMock: vi.fn(),
  cacheSetMock: vi.fn(),
  cacheRemoveMock: vi.fn(),
  safeParseMock: vi.fn(),
}));

vi.mock("../api/use-api", () => ({
  useApi: vi.fn(() => ({
    isLoading: false,
    query: queryMock,
  })),
}));

vi.mock("../../services/actions/get-product-detail", () => ({
  getProductDetail: vi.fn(),
}));

vi.mock("../../schemas/product-detail.schema", () => ({
  productDetailSchema: {
    safeParse: safeParseMock,
  },
}));

vi.mock("../../utils/helper", () => ({
  storageCache: {
    get: cacheGetMock,
    set: cacheSetMock,
    remove: cacheRemoveMock,
  },
}));

vi.mock("../../constants/shared", () => ({
  LOCAL_STORAGE_KEY: {
    PRODUCT_DETAIL: "product-detail",
  },
}));

describe("useProductDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return null product and not query when productId is not provided", () => {
    const { result } = renderHook(() => useProductDetail());

    expect(result.current.product).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(cacheGetMock).not.toHaveBeenCalled();
    expect(queryMock).not.toHaveBeenCalled();
  });

  it("should return cached product when cache is valid", async () => {
    const cachedProduct = { id: "1", brand: "Apple" };

    cacheGetMock.mockReturnValue(cachedProduct);
    safeParseMock.mockReturnValue({
      success: true,
      data: cachedProduct,
    });

    const { result } = renderHook(() => useProductDetail("1"));

    await waitFor(() => {
      expect(result.current.product).toEqual(cachedProduct);
    });

    expect(cacheGetMock).toHaveBeenCalledWith("product-detail-1");
    expect(safeParseMock).toHaveBeenCalledWith(cachedProduct);
    expect(queryMock).not.toHaveBeenCalled();
    expect(cacheSetMock).not.toHaveBeenCalled();
  });

  it("should remove invalid cached product and fetch from api", async () => {
    const apiProduct = { id: "1", brand: "Samsung" };

    cacheGetMock.mockReturnValue({ invalid: true });
    safeParseMock
      .mockReturnValueOnce({
        success: false,
      })
      .mockReturnValueOnce({
        success: true,
        data: apiProduct,
      });

    queryMock.mockResolvedValue(apiProduct);

    const { result } = renderHook(() => useProductDetail("1"));

    await waitFor(() => {
      expect(result.current.product).toEqual(apiProduct);
    });

    expect(cacheRemoveMock).toHaveBeenCalledWith("product-detail-1");
    expect(queryMock).toHaveBeenCalledWith("1");
    expect(cacheSetMock).toHaveBeenCalledWith("product-detail-1", apiProduct);
  });

  it("should fetch and store product when cache is empty", async () => {
    const apiProduct = { id: "2", brand: "Xiaomi" };

    cacheGetMock.mockReturnValue(null);
    queryMock.mockResolvedValue(apiProduct);

    const { result } = renderHook(() => useProductDetail("2"));

    await waitFor(() => {
      expect(result.current.product).toEqual(apiProduct);
    });

    expect(cacheGetMock).toHaveBeenCalledWith("product-detail-2");
    expect(queryMock).toHaveBeenCalledWith("2");
    expect(cacheSetMock).toHaveBeenCalledWith("product-detail-2", apiProduct);
  });

  it("should keep product as null when query returns null", async () => {
    cacheGetMock.mockReturnValue(null);
    queryMock.mockResolvedValue(null);

    const { result } = renderHook(() => useProductDetail("3"));

    await waitFor(() => {
      expect(result.current.product).toBeNull();
    });

    expect(queryMock).toHaveBeenCalledWith("3");
    expect(cacheSetMock).not.toHaveBeenCalled();
  });

  it("should return null when current stored product belongs to a different productId", async () => {
    cacheGetMock.mockReturnValue(null);
    queryMock.mockResolvedValue({ id: "1", brand: "Apple" });

    const { result, rerender } = renderHook(
      ({ productId }) => useProductDetail(productId),
      {
        initialProps: { productId: "1" },
      }
    );

    await waitFor(() => {
      expect(result.current.product).toEqual({ id: "1", brand: "Apple" });
    });

    rerender({ productId: "2" });

    expect(result.current.product).toBeNull();
  });

  it("should expose loading state from useApi", async () => {
    vi.resetModules();

    const loadingQueryMock = vi.fn().mockResolvedValue(null);

    vi.doMock("../api/use-api", () => ({
      useApi: vi.fn(() => ({
        isLoading: true,
        query: loadingQueryMock,
      })),
    }));

    vi.doMock("../../services/actions/get-product-detail", () => ({
      getProductDetail: vi.fn(),
    }));

    vi.doMock("../../schemas/product-detail.schema", () => ({
      productDetailSchema: {
        safeParse: vi.fn(),
      },
    }));

    vi.doMock("../../utils/helper", () => ({
      storageCache: {
        get: vi.fn().mockReturnValue(null),
        set: vi.fn(),
        remove: vi.fn(),
      },
    }));

    vi.doMock("../../constants/shared", () => ({
      LOCAL_STORAGE_KEY: {
        PRODUCT_DETAIL: "product-detail",
      },
    }));

    const { useProductDetail: useProductDetailWithLoading } = await import(
      "./use-product-detail"
    );

    const { result } = renderHook(() => useProductDetailWithLoading("1"));

    expect(result.current.isLoading).toBe(true);
  });

  it("should not update state after unmount", async () => {
    let resolveQuery;

    cacheGetMock.mockReturnValue(null);
    queryMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveQuery = resolve;
        })
    );

    const { result, unmount } = renderHook(() => useProductDetail("10"));

    unmount();

    resolveQuery({ id: "10", brand: "Nokia" });

    await Promise.resolve();

    expect(cacheSetMock).not.toHaveBeenCalled();
    expect(result.current.product).toBeNull();
  });
});