import { beforeEach, describe, expect, it, vi } from "vitest";

const createMock = vi.fn();

vi.mock("axios", () => ({
  default: {
    create: createMock,
  },
}));

describe("productsApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createMock.mockReturnValue({});

    vi.stubEnv("VITE_API_URL", "https://example.com");
  });

  it("should create axios instance with the expected baseURL", async () => {
    await import("./products.api");

    expect(createMock).toHaveBeenCalledTimes(1);
    expect(createMock).toHaveBeenCalledWith({
      baseURL: "https://example.com/api",
    });
  });
});