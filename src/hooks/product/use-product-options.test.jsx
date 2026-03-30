import { renderHook, act } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useProductOptions } from "./use-product-options";

describe("useProductOptions", () => {
  it("should return empty defaults when product is not provided", () => {
    const { result } = renderHook(() => useProductOptions());

    expect(result.current.colorOptions).toEqual([]);
    expect(result.current.storageOptions).toEqual([]);
    expect(result.current.selectedColor).toBe("");
    expect(result.current.selectedStorage).toBe("");
    expect(result.current.selectedColorName).toBe("Sin color");
    expect(result.current.selectedStorageName).toBe("Sin almacenamiento");
  });

  it("should return options from product", () => {
    const product = {
      options: {
        colors: [
          { code: 1, name: "Black" },
          { code: 2, name: "Blue" },
        ],
        storages: [
          { code: 64, name: "64 GB" },
          { code: 128, name: "128 GB" },
        ],
      },
    };

    const { result } = renderHook(() => useProductOptions(product));

    expect(result.current.colorOptions).toEqual(product.options.colors);
    expect(result.current.storageOptions).toEqual(product.options.storages);
  });

  it("should use first color and storage as default selection", () => {
    const product = {
      options: {
        colors: [
          { code: 1, name: "Black" },
          { code: 2, name: "Blue" },
        ],
        storages: [
          { code: 64, name: "64 GB" },
          { code: 128, name: "128 GB" },
        ],
      },
    };

    const { result } = renderHook(() => useProductOptions(product));

    expect(result.current.selectedColor).toBe("1");
    expect(result.current.selectedStorage).toBe("64");
    expect(result.current.selectedColorName).toBe("Black");
    expect(result.current.selectedStorageName).toBe("64 GB");
  });

  it("should allow updating selected color", () => {
    const product = {
      options: {
        colors: [
          { code: 1, name: "Black" },
          { code: 2, name: "Blue" },
        ],
        storages: [{ code: 64, name: "64 GB" }],
      },
    };

    const { result } = renderHook(() => useProductOptions(product));

    act(() => {
      result.current.setSelectedColor("2");
    });

    expect(result.current.selectedColor).toBe("2");
    expect(result.current.selectedColorName).toBe("Blue");
  });

  it("should allow updating selected storage", () => {
    const product = {
      options: {
        colors: [{ code: 1, name: "Black" }],
        storages: [
          { code: 64, name: "64 GB" },
          { code: 128, name: "128 GB" },
        ],
      },
    };

    const { result } = renderHook(() => useProductOptions(product));

    act(() => {
      result.current.setSelectedStorage("128");
    });

    expect(result.current.selectedStorage).toBe("128");
    expect(result.current.selectedStorageName).toBe("128 GB");
  });

  it("should fallback to default selected names when no explicit selection was made", () => {
    const product = {
      options: {
        colors: [{ code: 7, name: "Purple" }],
        storages: [{ code: 256, name: "256 GB" }],
      },
    };

    const { result } = renderHook(() => useProductOptions(product));

    expect(result.current.selectedColorName).toBe("Purple");
    expect(result.current.selectedStorageName).toBe("256 GB");
  });

  it("should return fallback names when selected codes do not match any option", () => {
    const product = {
      options: {
        colors: [{ code: 1, name: "Black" }],
        storages: [{ code: 64, name: "64 GB" }],
      },
    };

    const { result } = renderHook(() => useProductOptions(product));

    act(() => {
      result.current.setSelectedColor("999");
      result.current.setSelectedStorage("999");
    });

    expect(result.current.selectedColorName).toBe("Sin color");
    expect(result.current.selectedStorageName).toBe("Sin almacenamiento");
  });

  it("should handle missing options object", () => {
    const product = {};

    const { result } = renderHook(() => useProductOptions(product));

    expect(result.current.colorOptions).toEqual([]);
    expect(result.current.storageOptions).toEqual([]);
    expect(result.current.selectedColor).toBe("");
    expect(result.current.selectedStorage).toBe("");
  });

  it("should convert numeric option codes to string", () => {
    const product = {
      options: {
        colors: [{ code: 10, name: "Green" }],
        storages: [{ code: 512, name: "512 GB" }],
      },
    };

    const { result } = renderHook(() => useProductOptions(product));

    expect(result.current.selectedColor).toBe("10");
    expect(result.current.selectedStorage).toBe("512");
  });
});