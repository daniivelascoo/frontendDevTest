import { renderHook, act, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useApi } from "./use-api";

const warningMock = vi.hoisted(() => vi.fn());
const errorMock = vi.hoisted(() => vi.fn());

vi.mock("sonner", () => ({
  toast: {
    warning: warningMock,
    error: errorMock,
  },
}));

vi.mock("../../constants/shared", () => ({
  TOAST_ERROR: {
    INVALID_RESPONSE_SCHEMA: "Invalid response schema",
    UNEXPECTED_ERROR: "Unexpected error",
  },
  TOAST_WARNING: {
    STATUS_KO: "Status ko",
  },
}));

describe("useApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should expose initial state correctly", () => {
    const fetchFunction = vi.fn();

    const { result } = renderHook(() =>
      useApi({
        fetchFunction,
      })
    );

    expect(result.current.isLoading).toBe(false);
    expect(typeof result.current.query).toBe("function");
  });

  it("should call fetchFunction with default empty params", async () => {
    const fetchFunction = vi.fn().mockResolvedValue({
      status: 200,
      data: { ok: true },
    });

    const { result } = renderHook(() =>
      useApi({
        fetchFunction,
      })
    );

    let response;

    await act(async () => {
      response = await result.current.query();
    });

    expect(fetchFunction).toHaveBeenCalledTimes(1);
    expect(fetchFunction).toHaveBeenCalledWith({});
    expect(response).toEqual({ ok: true });
  });

  it("should call fetchFunction with provided params", async () => {
    const fetchFunction = vi.fn().mockResolvedValue({
      status: 200,
      data: { ok: true },
    });

    const { result } = renderHook(() =>
      useApi({
        fetchFunction,
      })
    );

    const params = { id: "123" };

    await act(async () => {
      await result.current.query(params);
    });

    expect(fetchFunction).toHaveBeenCalledWith(params);
  });

  it("should set isLoading during request lifecycle", async () => {
    let resolvePromise;

    const fetchFunction = vi.fn(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        })
    );

    const { result } = renderHook(() =>
      useApi({
        fetchFunction,
      })
    );

    let promise;

    act(() => {
      promise = result.current.query({ id: "1" });
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolvePromise({
        status: 200,
        data: { ok: true },
      });

      await promise;
    });

    expect(result.current.isLoading).toBe(false);
  });

  it("should return response data when status is successful and no schema is provided", async () => {
    const fetchFunction = vi.fn().mockResolvedValue({
      status: 200,
      data: { id: "1", name: "Phone" },
    });

    const { result } = renderHook(() =>
      useApi({
        fetchFunction,
      })
    );

    let response;

    await act(async () => {
      response = await result.current.query();
    });

    expect(response).toEqual({ id: "1", name: "Phone" });
    expect(warningMock).not.toHaveBeenCalled();
    expect(errorMock).not.toHaveBeenCalled();
  });

  it("should return parsed schema data when schema validation succeeds", async () => {
    const fetchFunction = vi.fn().mockResolvedValue({
      status: 200,
      data: { raw: true },
    });

    const schema = {
      safeParse: vi.fn().mockReturnValue({
        success: true,
        data: { parsed: true },
      }),
    };

    const { result } = renderHook(() =>
      useApi({
        fetchFunction,
        schema,
      })
    );

    let response;

    await act(async () => {
      response = await result.current.query();
    });

    expect(schema.safeParse).toHaveBeenCalledWith({ raw: true });
    expect(response).toEqual({ parsed: true });
  });

  it("should show warning and return null when response status is not successful", async () => {
    const fetchFunction = vi.fn().mockResolvedValue({
      status: 404,
      data: { message: "Not found" },
    });

    const schema = {
      safeParse: vi.fn(),
    };

    const { result } = renderHook(() =>
      useApi({
        fetchFunction,
        schema,
      })
    );

    let response;

    await act(async () => {
      response = await result.current.query();
    });

    expect(response).toBeNull();
    expect(warningMock).toHaveBeenCalledWith("Status ko");
    expect(schema.safeParse).not.toHaveBeenCalled();
  });

  it("should show error and return null when schema validation fails", async () => {
    const schemaError = new Error("schema error");
    const fetchFunction = vi.fn().mockResolvedValue({
      status: 200,
      data: { invalid: true },
    });

    const schema = {
      safeParse: vi.fn().mockReturnValue({
        success: false,
        error: schemaError,
      }),
    };

    const { result } = renderHook(() =>
      useApi({
        fetchFunction,
        schema,
      })
    );

    let response;

    await act(async () => {
      response = await result.current.query();
    });

    expect(response).toBeNull();
    expect(console.error).toHaveBeenCalledWith(schemaError);
    expect(errorMock).toHaveBeenCalledWith("Invalid response schema");
  });

  it("should show unexpected error and return null when fetchFunction throws", async () => {
    const fetchError = new Error("network error");
    const fetchFunction = vi.fn().mockRejectedValue(fetchError);

    const { result } = renderHook(() =>
      useApi({
        fetchFunction,
      })
    );

    let response;

    await act(async () => {
      response = await result.current.query();
    });

    expect(response).toBeNull();
    expect(console.error).toHaveBeenCalledWith(fetchError);
    expect(errorMock).toHaveBeenCalledWith("Unexpected error");
  });

  it("should set isLoading back to false when schema validation fails", async () => {
    const fetchFunction = vi.fn().mockResolvedValue({
      status: 200,
      data: { invalid: true },
    });

    const schema = {
      safeParse: vi.fn().mockReturnValue({
        success: false,
        error: new Error("schema error"),
      }),
    };

    const { result } = renderHook(() =>
      useApi({
        fetchFunction,
        schema,
      })
    );

    await act(async () => {
      await result.current.query();
    });

    expect(result.current.isLoading).toBe(false);
  });
});