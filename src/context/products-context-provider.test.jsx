import { act, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProductsContextProvider from "./products-context-provider";
import { useProducts } from "./use-products";

const {
  useApiMock,
  cacheGetMock,
  cacheSetMock,
  cacheRemoveMock,
  safeParseMock,
  filterProductsWithoutPriceMock,
} = vi.hoisted(() => ({
  useApiMock: vi.fn(),
  cacheGetMock: vi.fn(),
  cacheSetMock: vi.fn(),
  cacheRemoveMock: vi.fn(),
  safeParseMock: vi.fn(),
  filterProductsWithoutPriceMock: vi.fn(),
}));

vi.mock("../hooks/api/use-api", () => ({
  useApi: useApiMock,
}));

vi.mock("../services/actions/get-products", () => ({
  getProducts: vi.fn(),
}));

vi.mock("../schemas/product.schema", () => ({
  productsSchema: {
    safeParse: safeParseMock,
  },
}));

vi.mock("../constants/shared", () => ({
  LOCAL_STORAGE_KEY: {
    PRODUCTS_LIST: "products-list",
  },
}));

vi.mock("../utils/products", () => ({
  filterProductsWithoutPrice: filterProductsWithoutPriceMock,
}));

vi.mock("../utils/helper", () => ({
  storageCache: {
    get: cacheGetMock,
    set: cacheSetMock,
    remove: cacheRemoveMock,
  },
}));

const Consumer = () => {
  const {
    isLoading,
    products,
    fetchProducts,
    cartCount,
    setCartCount,
    currentPage,
    setCurrentPage,
  } = useProducts();

  return (
    <div>
      <div data-testid="loading">{String(isLoading)}</div>
      <div data-testid="products">{JSON.stringify(products)}</div>
      <div data-testid="cart-count">{cartCount}</div>
      <div data-testid="current-page">{currentPage}</div>

      <button onClick={() => fetchProducts()}>fetch-products</button>
      <button onClick={() => fetchProducts({ force: true })}>force-fetch-products</button>
      <button onClick={() => setCartCount((prev) => prev + 1)}>increment-cart</button>
      <button onClick={() => setCurrentPage(5)}>set-page</button>
    </div>
  );
};

describe("ProductsContextProvider", () => {
  const queryMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    useApiMock.mockReturnValue({
      isLoading: false,
      query: queryMock,
    });

    cacheGetMock.mockReturnValue(null);
    safeParseMock.mockReturnValue({
      success: true,
      data: [],
    });
    filterProductsWithoutPriceMock.mockImplementation((products) => products);
    queryMock.mockResolvedValue([]);
  });

  it("should initialize with empty products when cache is empty", () => {
    render(
      <ProductsContextProvider>
        <Consumer />
      </ProductsContextProvider>
    );

    expect(screen.getByTestId("products")).toHaveTextContent("[]");
    expect(screen.getByTestId("cart-count")).toHaveTextContent("0");
    expect(screen.getByTestId("current-page")).toHaveTextContent("1");
    expect(screen.getByTestId("loading")).toHaveTextContent("false");
  });

  it("should initialize products from valid cache", () => {
    const cachedProducts = [
      { id: "1", price: "100" },
      { id: "2", price: "200" },
    ];

    const filteredProducts = [{ id: "1", price: "100" }];

    cacheGetMock.mockReturnValue(cachedProducts);
    safeParseMock.mockReturnValue({
      success: true,
      data: cachedProducts,
    });
    filterProductsWithoutPriceMock.mockReturnValue(filteredProducts);

    render(
      <ProductsContextProvider>
        <Consumer />
      </ProductsContextProvider>
    );

    expect(cacheGetMock).toHaveBeenCalledWith("products-list");
    expect(safeParseMock).toHaveBeenCalledWith(cachedProducts);
    expect(filterProductsWithoutPriceMock).toHaveBeenCalledWith(cachedProducts);
    expect(screen.getByTestId("products")).toHaveTextContent(
      JSON.stringify(filteredProducts)
    );
  });

  it("should remove cache and initialize with empty products when cached data is invalid", () => {
    const cachedProducts = [{ id: "1" }];

    cacheGetMock.mockReturnValue(cachedProducts);
    safeParseMock.mockReturnValue({
      success: false,
    });

    render(
      <ProductsContextProvider>
        <Consumer />
      </ProductsContextProvider>
    );

    expect(cacheRemoveMock).toHaveBeenCalledWith("products-list");
    expect(screen.getByTestId("products")).toHaveTextContent("[]");
  });

  it("should fetch products from valid cache when fetchProducts is called without force", async () => {
    const cachedProducts = [
      { id: "1", price: "100" },
      { id: "2", price: "200" },
    ];
    const filteredProducts = [{ id: "1", price: "100" }];

    cacheGetMock
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(cachedProducts);

    safeParseMock.mockReturnValue({
      success: true,
      data: cachedProducts,
    });
    filterProductsWithoutPriceMock.mockReturnValue(filteredProducts);

    render(
      <ProductsContextProvider>
        <Consumer />
      </ProductsContextProvider>
    );

    await act(async () => {
      screen.getByText("fetch-products").click();
    });

    expect(queryMock).not.toHaveBeenCalled();
    expect(screen.getByTestId("products")).toHaveTextContent(
      JSON.stringify(filteredProducts)
    );
  });

  it("should remove invalid cache and fetch products from api", async () => {
    const invalidCachedProducts = [{ id: "1" }];
    const apiProducts = [
      { id: "3", price: "300" },
      { id: "4", price: "" },
    ];
    const filteredProducts = [{ id: "3", price: "300" }];

    cacheGetMock
      .mockReturnValueOnce(invalidCachedProducts)
      .mockReturnValueOnce(invalidCachedProducts);

    safeParseMock.mockReturnValue({
      success: false,
    });

    queryMock.mockResolvedValue(apiProducts);
    filterProductsWithoutPriceMock.mockReturnValue(filteredProducts);

    render(
      <ProductsContextProvider>
        <Consumer />
      </ProductsContextProvider>
    );

    await act(async () => {
      screen.getByText("fetch-products").click();
    });

    expect(cacheRemoveMock).toHaveBeenCalledWith("products-list");
    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(filterProductsWithoutPriceMock).toHaveBeenCalledWith(apiProducts);
    expect(cacheSetMock).toHaveBeenCalledWith("products-list", filteredProducts);
    expect(screen.getByTestId("products")).toHaveTextContent(
      JSON.stringify(filteredProducts)
    );
  });

  it("should fetch products from api when force is true", async () => {
    const cachedProducts = [{ id: "1", price: "100" }];
    const apiProducts = [{ id: "2", price: "200" }];
    const filteredProducts = [{ id: "2", price: "200" }];

    cacheGetMock.mockReturnValue(cachedProducts);
    safeParseMock.mockReturnValue({
      success: true,
      data: cachedProducts,
    });
    queryMock.mockResolvedValue(apiProducts);
    filterProductsWithoutPriceMock.mockReturnValue(filteredProducts);

    render(
      <ProductsContextProvider>
        <Consumer />
      </ProductsContextProvider>
    );

    await act(async () => {
      screen.getByText("force-fetch-products").click();
    });

    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(filterProductsWithoutPriceMock).toHaveBeenCalledWith(apiProducts);
    expect(cacheSetMock).toHaveBeenCalledWith("products-list", filteredProducts);
    expect(screen.getByTestId("products")).toHaveTextContent(
      JSON.stringify(filteredProducts)
    );
  });

  it("should return empty array and not update cache when query returns null", async () => {
    queryMock.mockResolvedValue(null);

    render(
      <ProductsContextProvider>
        <Consumer />
      </ProductsContextProvider>
    );

    await act(async () => {
      screen.getByText("force-fetch-products").click();
    });

    expect(cacheSetMock).not.toHaveBeenCalled();
    expect(screen.getByTestId("products")).toHaveTextContent("[]");
  });

  it("should update cartCount through setCartCount", async () => {
    render(
      <ProductsContextProvider>
        <Consumer />
      </ProductsContextProvider>
    );

    expect(screen.getByTestId("cart-count")).toHaveTextContent("0");

    await act(async () => {
      screen.getByText("increment-cart").click();
    });

    expect(screen.getByTestId("cart-count")).toHaveTextContent("1");
  });

  it("should update currentPage through setCurrentPage", async () => {
    render(
      <ProductsContextProvider>
        <Consumer />
      </ProductsContextProvider>
    );

    expect(screen.getByTestId("current-page")).toHaveTextContent("1");

    await act(async () => {
      screen.getByText("set-page").click();
    });

    expect(screen.getByTestId("current-page")).toHaveTextContent("5");
  });

  it("should expose isLoading from useApi", () => {
    useApiMock.mockReturnValue({
      isLoading: true,
      query: queryMock,
    });

    render(
      <ProductsContextProvider>
        <Consumer />
      </ProductsContextProvider>
    );

    expect(screen.getByTestId("loading")).toHaveTextContent("true");
  });

  it("should return filtered products from fetchProducts", async () => {
    const apiProducts = [
      { id: "1", price: "100" },
      { id: "2", price: "" },
    ];
    const filteredProducts = [{ id: "1", price: "100" }];

    queryMock.mockResolvedValue(apiProducts);
    filterProductsWithoutPriceMock.mockReturnValue(filteredProducts);

    let fetchResult;

    const ResultConsumer = () => {
      const { fetchProducts } = useProducts();

      return (
        <button
          onClick={async () => {
            fetchResult = await fetchProducts({ force: true });
          }}
        >
          run-fetch
        </button>
      );
    };

    render(
      <ProductsContextProvider>
        <ResultConsumer />
      </ProductsContextProvider>
    );

    await act(async () => {
      screen.getByText("run-fetch").click();
    });

    await waitFor(() => {
      expect(fetchResult).toEqual(filteredProducts);
    });
  });

  it("should return cached filtered products from fetchProducts when cache is valid", async () => {
    const cachedProducts = [
      { id: "1", price: "100" },
      { id: "2", price: "" },
    ];
    const filteredProducts = [{ id: "1", price: "100" }];

    cacheGetMock
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(cachedProducts);

    safeParseMock.mockReturnValue({
      success: true,
      data: cachedProducts,
    });
    filterProductsWithoutPriceMock.mockReturnValue(filteredProducts);

    let fetchResult;

    const ResultConsumer = () => {
      const { fetchProducts } = useProducts();

      return (
        <button
          onClick={async () => {
            fetchResult = await fetchProducts();
          }}
        >
          run-fetch
        </button>
      );
    };

    render(
      <ProductsContextProvider>
        <ResultConsumer />
      </ProductsContextProvider>
    );

    await act(async () => {
      screen.getByText("run-fetch").click();
    });

    await waitFor(() => {
      expect(fetchResult).toEqual(filteredProducts);
    });
  });
});