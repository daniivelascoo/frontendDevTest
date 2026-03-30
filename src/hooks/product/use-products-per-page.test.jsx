import { renderHook, act, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useProductsPerPage } from "./use-products-per-page";

const setWindowSize = ({ width, height }) => {
    Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: width,
    });

    Object.defineProperty(window, "innerHeight", {
        writable: true,
        configurable: true,
        value: height,
    });
};

describe("useProductsPerPage", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should calculate products per page for mobile width", async () => {
        setWindowSize({ width: 500, height: 1200 });

        const { result } = renderHook(() => useProductsPerPage());

        await waitFor(() => {
            expect(result.current).toBe(2);
        });
    });

    it("should calculate products per page for tablet width", async () => {
        setWindowSize({ width: 800, height: 1200 });

        const { result } = renderHook(() => useProductsPerPage());

        await waitFor(() => {
            expect(result.current).toBe(4);
        });
    });

    it("should calculate products per page for desktop width", async () => {
        setWindowSize({ width: 1400, height: 1200 });

        const { result } = renderHook(() => useProductsPerPage());

        await waitFor(() => {
            expect(result.current).toBe(8);
        });
    });

    it("should use custom sizing values", async () => {
        setWindowSize({ width: 1400, height: 1600 });

        const { result } = renderHook(() =>
            useProductsPerPage({
                cardEstimatedHeight: 300,
                gridGap: 20,
                reservedHeight: 200,
            })
        );

        await waitFor(() => {
            expect(result.current).toBe(16);
        });
    });

    it("should keep a minimum of 2 rows", async () => {
        setWindowSize({ width: 500, height: 400 });

        const { result } = renderHook(() => useProductsPerPage());

        await waitFor(() => {
            expect(result.current).toBe(2);
        });
    });

    it("should update value on window resize", async () => {
        setWindowSize({ width: 500, height: 1200 });

        const { result } = renderHook(() => useProductsPerPage());

        await waitFor(() => {
            expect(result.current).toBe(2);
        });

        act(() => {
            setWindowSize({ width: 1400, height: 1200 });
            window.dispatchEvent(new Event("resize"));
        });

        await waitFor(() => {
            expect(result.current).toBe(8);
        });
    });

    it("should register resize listener on mount and remove it on unmount", () => {
        const addEventListenerSpy = vi.spyOn(window, "addEventListener");
        const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

        setWindowSize({ width: 800, height: 1200 });

        const { unmount } = renderHook(() => useProductsPerPage());

        expect(addEventListenerSpy).toHaveBeenCalledWith(
            "resize",
            expect.any(Function)
        );

        const resizeHandler = addEventListenerSpy.mock.calls.find(
            ([eventName]) => eventName === "resize"
        )?.[1];

        unmount();

        expect(removeEventListenerSpy).toHaveBeenCalledWith("resize", resizeHandler);
    });

    it("should recalculate when custom dependencies change", async () => {
        setWindowSize({ width: 1400, height: 1600 });

        const { result, rerender } = renderHook(
            (props) => useProductsPerPage(props),
            {
                initialProps: {
                    cardEstimatedHeight: 380,
                    gridGap: 16,
                    reservedHeight: 320,
                },
            }
        );

        await waitFor(() => {
            expect(result.current).toBe(12);
        });

        rerender({
            cardEstimatedHeight: 500,
            gridGap: 16,
            reservedHeight: 320,
        });

        await waitFor(() => {
            expect(result.current).toBe(8);
        });
    });
});