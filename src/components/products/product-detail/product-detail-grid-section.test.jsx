import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ProductDetailGridSection from "./product-detail-grid-section";

const { detailCardMock, sectionCardMock } = vi.hoisted(() => ({
  detailCardMock: vi.fn(({ label, value }) => (
    <div data-testid="detail-card">
      {label}: {value}
    </div>
  )),
  sectionCardMock: vi.fn(({ title, children }) => (
    <section data-testid="section-card">
      <h2>{title}</h2>
      {children}
    </section>
  )),
}));

vi.mock("./product-detail-card", () => ({
  default: detailCardMock,
}));

vi.mock("./product-detail-section-card", () => ({
  default: sectionCardMock,
}));

describe("ProductDetailGridSection", () => {
  it("should render title", () => {
    render(
      <ProductDetailGridSection
        title="Pantalla"
        items={[]}
      />
    );

    expect(screen.getByText("Pantalla")).toBeInTheDocument();
  });

  it("should render one detail card per item", () => {
    const items = [
      { label: "RAM", value: "8 GB", icon: null },
      { label: "CPU", value: "Snapdragon", icon: null },
    ];

    render(
      <ProductDetailGridSection
        title="Pantalla"
        items={items}
      />
    );

    expect(screen.getAllByTestId("detail-card")).toHaveLength(2);
    expect(detailCardMock).toHaveBeenCalledTimes(2);
  });

  it("should pass item props to ProductDetailCard", () => {
    const items = [{ label: "RAM", value: "8 GB", icon: "icon-ref" }];

    render(
      <ProductDetailGridSection
        title="Pantalla"
        items={items}
      />
    );

    expect(detailCardMock).toHaveBeenCalledWith(
      expect.objectContaining({
        label: "RAM",
        value: "8 GB",
        icon: "icon-ref",
      }),
      undefined
    );
  });
});