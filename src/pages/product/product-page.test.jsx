import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProductPage from "./product-page";

const {
  useParamsMock,
  useApiMock,
  useProductDetailMock,
  useProductOptionsMock,
  useProductsMock,
  getProductHeroDetailsMock,
  getProductDetailSectionsMock,
  productDetailHeroMock,
  productDetailGridSectionMock,
  productPurchasePanelMock,
  productPageStateMock,
  backToLinkMock,
} = vi.hoisted(() => ({
  useParamsMock: vi.fn(),
  useApiMock: vi.fn(),
  useProductDetailMock: vi.fn(),
  useProductOptionsMock: vi.fn(),
  useProductsMock: vi.fn(),
  getProductHeroDetailsMock: vi.fn(),
  getProductDetailSectionsMock: vi.fn(),
  productDetailHeroMock: vi.fn(({ product, heroDetails }) => (
    <div data-testid="product-detail-hero">
      {product.model} - {heroDetails.length}
    </div>
  )),
  productDetailGridSectionMock: vi.fn(({ title, items }) => (
    <div data-testid="product-detail-grid-section">
      {title} - {items.length}
    </div>
  )),
  productPurchasePanelMock: vi.fn((props) => (
    <div data-testid="product-purchase-panel">
      <button onClick={props.onAddToCart}>mock-add-to-cart</button>
      <button onClick={() => props.onStorageChange("256")}>mock-storage-change</button>
      <button onClick={() => props.onColorChange("2")}>mock-color-change</button>
      <span>{props.selectedStorageName}</span>
      <span>{props.selectedColorName}</span>
      <span>{String(props.addingProduct)}</span>
    </div>
  )),
  productPageStateMock: vi.fn(({ title, description, showSpinner }) => (
    <div data-testid="product-page-state">
      <span>{title}</span>
      <span>{description}</span>
      <span>{String(showSpinner)}</span>
    </div>
  )),
  backToLinkMock: vi.fn(({ path, text }) => (
    <a href={path} data-testid="back-link">
      {text}
    </a>
  )),
}));

vi.mock("react-router", () => ({
  useParams: useParamsMock,
}));

vi.mock("../../hooks/api/use-api", () => ({
  useApi: useApiMock,
}));

vi.mock("../../hooks/product/use-product-detail", () => ({
  useProductDetail: useProductDetailMock,
}));

vi.mock("../../hooks/product/use-product-options", () => ({
  useProductOptions: useProductOptionsMock,
}));

vi.mock("../../context/use-products", () => ({
  useProducts: useProductsMock,
}));

vi.mock("../../utils/mapper/product/product-detail.mapper", () => ({
  getProductHeroDetails: getProductHeroDetailsMock,
  getProductDetailSections: getProductDetailSectionsMock,
}));

vi.mock("../../services/actions/add-product-cart", () => ({
  addProductCart: vi.fn(),
}));

vi.mock("../../components/products/product-detail/product-detail-hero", () => ({
  default: productDetailHeroMock,
}));

vi.mock("../../components/products/product-detail/product-detail-grid-section", () => ({
  default: productDetailGridSectionMock,
}));

vi.mock("../../components/products/product-detail/product-purchase-panel", () => ({
  default: productPurchasePanelMock,
}));

vi.mock("../../components/products/product-detail/product-page-state", () => ({
  default: productPageStateMock,
}));

vi.mock("../../components/ui/back-to-link/back-to-link", () => ({
  default: backToLinkMock,
}));

describe("ProductPage", () => {
  const queryMock = vi.fn();
  const setCartCountMock = vi.fn();

  const product = {
    id: "1",
    brand: "Apple",
    model: "iPhone 15",
    imgUrl: "https://example.com/iphone.jpg",
    price: "999",
  };

  const optionsHookValue = {
    colorOptions: [{ code: 1, name: "Black" }],
    storageOptions: [{ code: 128, name: "128 GB" }],
    selectedColor: "1",
    selectedStorage: "128",
    selectedColorName: "Black",
    selectedStorageName: "128 GB",
    setSelectedColor: vi.fn(),
    setSelectedStorage: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    useParamsMock.mockReturnValue({ productId: "1" });

    useApiMock.mockReturnValue({
      isLoading: false,
      query: queryMock,
    });

    useProductDetailMock.mockReturnValue({
      product,
      isLoading: false,
    });

    useProductOptionsMock.mockReturnValue(optionsHookValue);

    useProductsMock.mockReturnValue({
      setCartCount: setCartCountMock,
    });

    getProductHeroDetailsMock.mockReturnValue([
      { label: "RAM", value: "8 GB" },
      { label: "OS", value: "iOS" },
    ]);

    getProductDetailSectionsMock.mockReturnValue([
      { title: "Diseño", items: [{ label: "Peso", value: "200 g" }] },
      { title: "Pantalla", items: [{ label: "Tamaño", value: "6.1" }] },
    ]);

    queryMock.mockResolvedValue({ count: 3 });
  });

  it("should render ProductPageState when product is not available", () => {
    useProductDetailMock.mockReturnValue({
      product: null,
      isLoading: true,
    });

    render(<ProductPage />);

    expect(screen.getByTestId("product-page-state")).toBeInTheDocument();
    expect(screen.getByText("Producto no encontrado")).toBeInTheDocument();
    expect(
      screen.getByText("No hemos podido localizar este producto.")
    ).toBeInTheDocument();
    expect(screen.getByText("true")).toBeInTheDocument();
  });

  it("should render back link when product exists", () => {
    render(<ProductPage />);

    expect(screen.getByTestId("back-link")).toHaveAttribute("href", "/");
    expect(screen.getByText("Volver a productos")).toBeInTheDocument();
  });

  it("should call useProductDetail with productId from params", () => {
    render(<ProductPage />);

    expect(useProductDetailMock).toHaveBeenCalledWith("1");
  });

  it("should call useProductOptions with product", () => {
    render(<ProductPage />);

    expect(useProductOptionsMock).toHaveBeenCalledWith(product);
  });

  it("should compute hero details and sections from product", () => {
    render(<ProductPage />);

    expect(getProductHeroDetailsMock).toHaveBeenCalledWith(product);
    expect(getProductDetailSectionsMock).toHaveBeenCalledWith(product);
  });

  it("should render hero component", () => {
    render(<ProductPage />);

    expect(screen.getByTestId("product-detail-hero")).toBeInTheDocument();
    expect(productDetailHeroMock).toHaveBeenCalledWith(
      expect.objectContaining({
        product,
        heroDetails: [
          { label: "RAM", value: "8 GB" },
          { label: "OS", value: "iOS" },
        ],
      }),
      undefined
    );
  });

  it("should render purchase panel with hook values", () => {
    render(<ProductPage />);

    expect(screen.getByTestId("product-purchase-panel")).toBeInTheDocument();
    expect(productPurchasePanelMock).toHaveBeenCalledWith(
      expect.objectContaining({
        storageOptions: optionsHookValue.storageOptions,
        colorOptions: optionsHookValue.colorOptions,
        selectedStorage: "128",
        selectedColor: "1",
        selectedStorageName: "128 GB",
        selectedColorName: "Black",
        onStorageChange: optionsHookValue.setSelectedStorage,
        onColorChange: optionsHookValue.setSelectedColor,
        addingProduct: false,
      }),
      undefined
    );
  });

  it("should render one grid section per section item", () => {
    render(<ProductPage />);

    expect(screen.getAllByTestId("product-detail-grid-section")).toHaveLength(2);
  });

  it("should pass section props to ProductDetailGridSection", () => {
    render(<ProductPage />);

    expect(productDetailGridSectionMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        title: "Diseño",
        items: [{ label: "Peso", value: "200 g" }],
      }),
      undefined
    );

    expect(productDetailGridSectionMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        title: "Pantalla",
        items: [{ label: "Tamaño", value: "6.1" }],
      }),
      undefined
    );
  });

  it("should call add-to-cart query with transformed payload", async () => {
    render(<ProductPage />);

    fireEvent.click(screen.getByText("mock-add-to-cart"));

    await waitFor(() => {
      expect(queryMock).toHaveBeenCalledWith({
        id: "1",
        colorCode: 1,
        storageCode: 128,
      });
    });
  });

  it("should update cart count after add-to-cart request", async () => {
    render(<ProductPage />);

    fireEvent.click(screen.getByText("mock-add-to-cart"));

    await waitFor(() => {
      expect(setCartCountMock).toHaveBeenCalledWith(3);
    });
  });

  it("should pass addingProduct state to purchase panel", () => {
    useApiMock.mockReturnValue({
      isLoading: true,
      query: queryMock,
    });

    render(<ProductPage />);

    expect(productPurchasePanelMock).toHaveBeenCalledWith(
      expect.objectContaining({
        addingProduct: true,
      }),
      undefined
    );
  });
});