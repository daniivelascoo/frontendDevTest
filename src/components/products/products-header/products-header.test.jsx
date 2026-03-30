import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import ProductsHeader from "./products-header";

const {
  linkMock,
  useLocationMock,
  useParamsMock,
  useProductsMock,
} = vi.hoisted(() => ({
  linkMock: vi.fn(({ to, children, ...props }) => (
    <a href={to} {...props}>
      {children}
    </a>
  )),
  useLocationMock: vi.fn(),
  useParamsMock: vi.fn(),
  useProductsMock: vi.fn(),
}));

vi.mock("react-router", () => ({
  Link: linkMock,
  useLocation: useLocationMock,
  useParams: useParamsMock,
}));

vi.mock("../../../context/use-products", () => ({
  useProducts: useProductsMock,
}));

describe("ProductsHeader", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useLocationMock.mockReturnValue({ pathname: "/" });
    useParamsMock.mockReturnValue({});
    useProductsMock.mockReturnValue({
      products: [],
      cartCount: 0,
    });
  });

  it("should render store title and home link", () => {
    render(<ProductsHeader />);

    expect(screen.getByText("Tienda de Móviles")).toBeInTheDocument();
    expect(screen.getByText("Inicio")).toBeInTheDocument();
  });

  it("should not render breadcrumb on home page", () => {
    render(<ProductsHeader />);

    expect(screen.queryByText("/")).not.toBeInTheDocument();
  });

  it("should not render breadcrumb when productId is missing", () => {
    useLocationMock.mockReturnValue({ pathname: "/product/1" });

    render(<ProductsHeader />);

    expect(screen.queryByText(/ - /)).not.toBeInTheDocument();
  });

  it("should not render breadcrumb when products list is empty", () => {
    useLocationMock.mockReturnValue({ pathname: "/product/1" });
    useParamsMock.mockReturnValue({ productId: "1" });
    useProductsMock.mockReturnValue({
      products: [],
      cartCount: 0,
    });

    render(<ProductsHeader />);

    expect(screen.queryByText("Apple - iPhone")).not.toBeInTheDocument();
  });

  it("should render breadcrumb when current product is found", () => {
    useLocationMock.mockReturnValue({ pathname: "/product/1" });
    useParamsMock.mockReturnValue({ productId: "1" });
    useProductsMock.mockReturnValue({
      products: [{ id: "1", brand: "Apple", model: "iPhone" }],
      cartCount: 0,
    });

    render(<ProductsHeader />);

    expect(screen.getByText("Apple - iPhone")).toBeInTheDocument();
  });

  it("should not render breadcrumb when product is not found", () => {
    useLocationMock.mockReturnValue({ pathname: "/product/1" });
    useParamsMock.mockReturnValue({ productId: "1" });
    useProductsMock.mockReturnValue({
      products: [{ id: "2", brand: "Samsung", model: "Galaxy" }],
      cartCount: 0,
    });

    render(<ProductsHeader />);

    expect(screen.queryByText("Samsung - Galaxy")).not.toBeInTheDocument();
  });

  it("should render cart count when cartCount is greater than zero", () => {
    useProductsMock.mockReturnValue({
      products: [],
      cartCount: 3,
    });

    render(<ProductsHeader />);

    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("should not render cart count when cartCount is zero", () => {
    useProductsMock.mockReturnValue({
      products: [],
      cartCount: 0,
    });

    render(<ProductsHeader />);

    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });
});