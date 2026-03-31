import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProductListPage from "./product-list-page";

const {
  useProductsPerPageMock,
  useProductsMock,
  productCardMock,
  customPaginationMock,
  searchBarMock,
  spinnerMock,
} = vi.hoisted(() => ({
  useProductsPerPageMock: vi.fn(),
  useProductsMock: vi.fn(),
  productCardMock: vi.fn(({ product }) => (
    <div data-testid="product-card">{product.brand} {product.model}</div>
  )),
  customPaginationMock: vi.fn(({ currentPage, totalPages, onPageChange }) => (
    <div data-testid="custom-pagination">
      <span>current:{currentPage}</span>
      <span>total:{totalPages}</span>
      <button onClick={() => onPageChange(2)}>go-page-2</button>
    </div>
  )),
  searchBarMock: vi.fn(({ onSearch, placeholder }) => (
    <div data-testid="search-bar">
      <span>{placeholder}</span>
      <button onClick={() => onSearch("apple")}>search-apple</button>
      <button onClick={() => onSearch("samsung")}>search-samsung</button>
      <button onClick={() => onSearch("unknown")}>search-unknown</button>
      <button onClick={() => onSearch("")}>clear-search</button>
    </div>
  )),
  spinnerMock: vi.fn(({ size }) => <div data-testid="spinner">{size}</div>),
}));

vi.mock("../../hooks/product/use-products-per-page", () => ({
  useProductsPerPage: useProductsPerPageMock,
}));

vi.mock("../../context/use-products", () => ({
  useProducts: useProductsMock,
}));

vi.mock("../../components/products/product-card/product-card", () => ({
  default: productCardMock,
}));

vi.mock("../../components/pagination/custom-pagination", () => ({
  default: customPaginationMock,
}));

vi.mock("../../components/search/search-bar", () => ({
  default: searchBarMock,
}));

vi.mock("../../components/ui/spinner/spinner", () => ({
  default: spinnerMock,
}));

describe("ProductListPage", () => {
  const fetchProductsMock = vi.fn();
  const setCurrentPageMock = vi.fn();

  const products = [
    { id: "1", brand: "Apple", model: "iPhone 15" },
    { id: "2", brand: "Samsung", model: "Galaxy S24" },
    { id: "3", brand: "Xiaomi", model: "Redmi Note" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    useProductsPerPageMock.mockReturnValue(2);

    useProductsMock.mockReturnValue({
      products,
      isLoading: false,
      fetchProducts: fetchProductsMock,
      currentPage: 1,
      setCurrentPage: setCurrentPageMock,
    });
  });

  it("should call fetchProducts on mount", () => {
    render(<ProductListPage />);

    expect(fetchProductsMock).toHaveBeenCalledTimes(1);
  });

  it("should render SearchBar with expected placeholder", () => {
    render(<ProductListPage />);

    expect(screen.getByTestId("search-bar")).toBeInTheDocument();
    expect(screen.getByText("Buscar producto...")).toBeInTheDocument();
  });

  it("should call useProductsPerPage with expected config", () => {
    render(<ProductListPage />);

    expect(useProductsPerPageMock).toHaveBeenCalledWith({
      cardEstimatedHeight: 380,
      gridGap: 16,
      reservedHeight: 320,
    });
  });

  it("should render loading state when isLoading is true", () => {
    useProductsMock.mockReturnValue({
      products: [],
      isLoading: true,
      fetchProducts: fetchProductsMock,
      currentPage: 1,
      setCurrentPage: setCurrentPageMock,
    });

    render(<ProductListPage />);

    expect(screen.getByTestId("spinner")).toBeInTheDocument();
    expect(screen.getByText("Cargando productos...")).toBeInTheDocument();
    expect(
      screen.getByText("Estamos preparando el catálogo para ti")
    ).toBeInTheDocument();
  });

  it("should render paginated products", () => {
    render(<ProductListPage />);

    expect(screen.getAllByTestId("product-card")).toHaveLength(2);
    expect(screen.getByText("Apple iPhone 15")).toBeInTheDocument();
    expect(screen.getByText("Samsung Galaxy S24")).toBeInTheDocument();
  });

  it("should render results summary", () => {
    render(<ProductListPage />);

    expect(screen.getByText("Resultados")).toBeInTheDocument();
    expect(screen.getByText(/Mostrando/)).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("should render pagination when total pages is greater than 1", () => {
    render(<ProductListPage />);

    expect(screen.getByTestId("custom-pagination")).toBeInTheDocument();
    expect(customPaginationMock).toHaveBeenCalledWith(
      expect.objectContaining({
        currentPage: 1,
        totalPages: 2,
        onPageChange: setCurrentPageMock,
      }),
      undefined
    );
  });

  it("should not render pagination when total pages is 1", () => {
    useProductsMock.mockReturnValue({
      products: [{ id: "1", brand: "Apple", model: "iPhone 15" }],
      isLoading: false,
      fetchProducts: fetchProductsMock,
      currentPage: 1,
      setCurrentPage: setCurrentPageMock,
    });

    render(<ProductListPage />);

    expect(screen.queryByTestId("custom-pagination")).not.toBeInTheDocument();
  });

  it("should filter products by search query using brand", async () => {
    render(<ProductListPage />);

    fireEvent.click(screen.getByText("search-apple"));

    await waitFor(() => {
      expect(screen.getAllByTestId("product-card")).toHaveLength(1);
    });

    expect(screen.getByText("Apple iPhone 15")).toBeInTheDocument();
    expect(screen.queryByText("Samsung Galaxy S24")).not.toBeInTheDocument();
    expect(screen.getByText("Búsqueda: apple")).toBeInTheDocument();
  });

  it("should filter products by search query using model", async () => {
    render(<ProductListPage />);

    fireEvent.click(screen.getByText("search-samsung"));

    await waitFor(() => {
      expect(screen.getAllByTestId("product-card")).toHaveLength(1);
    });

    expect(screen.getByText("Samsung Galaxy S24")).toBeInTheDocument();
    expect(screen.getByText("Búsqueda: samsung")).toBeInTheDocument();
  });

  it("should reset current page to 1 when search changes", async () => {
    render(<ProductListPage />);

    fireEvent.click(screen.getByText("search-apple"));

    await waitFor(() => {
      expect(setCurrentPageMock).toHaveBeenCalledWith(1);
    });
  });

  it("should show empty state when no products match search", async () => {
    render(<ProductListPage />);

    fireEvent.click(screen.getByText("search-unknown"));

    await waitFor(() => {
      expect(
        screen.getByText("No hemos encontrado productos")
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText("Prueba con otra marca o modelo para ver más resultados.")
    ).toBeInTheDocument();
  });

  it("should hide search badge when search is empty", async () => {
    render(<ProductListPage />);

    fireEvent.click(screen.getByText("search-apple"));

    await waitFor(() => {
      expect(screen.getByText("Búsqueda: apple")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("clear-search"));

    await waitFor(() => {
      expect(screen.queryByText(/Búsqueda:/)).not.toBeInTheDocument();
    });
  });

  it("should use safeCurrentPage when currentPage is greater than totalPages", () => {
    useProductsMock.mockReturnValue({
      products,
      isLoading: false,
      fetchProducts: fetchProductsMock,
      currentPage: 99,
      setCurrentPage: setCurrentPageMock,
    });

    render(<ProductListPage />);

    expect(customPaginationMock).toHaveBeenCalledWith(
      expect.objectContaining({
        currentPage: 2,
        totalPages: 2,
      }),
      undefined
    );
  });

  it("should use safeCurrentPage as 1 when there are no results", async () => {
    render(<ProductListPage />);

    fireEvent.click(screen.getByText("search-unknown"));

    await waitFor(() => {
      expect(screen.getByText("No hemos encontrado productos")).toBeInTheDocument();
    });

    expect(screen.queryByTestId("custom-pagination")).not.toBeInTheDocument();
  });
});