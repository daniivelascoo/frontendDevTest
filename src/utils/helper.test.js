import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { storageCache } from "./helper";

describe("storageCache", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-30T10:00:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should store a value in localStorage with expiry", () => {
    storageCache.set("products", [{ id: 1 }], 1000);

    const rawItem = localStorage.getItem("products");
    const parsedItem = JSON.parse(rawItem);

    expect(parsedItem.value).toEqual([{ id: 1 }]);
    expect(parsedItem.expiry).toBe(Date.now() + 1000);
  });

  it("should return null if key does not exist", () => {
    expect(storageCache.get("unknown")).toBeNull();
  });

  it("should return the value if cache has not expired", () => {
    storageCache.set("products", [{ id: 1 }], 1000);

    expect(storageCache.get("products")).toEqual([{ id: 1 }]);
  });

  it("should remove and return null if cache has expired", () => {
    storageCache.set("products", [{ id: 1 }], 1000);

    vi.advanceTimersByTime(1001);

    expect(storageCache.get("products")).toBeNull();
    expect(localStorage.getItem("products")).toBeNull();
  });

  it("should remove and return null if stored format is invalid", () => {
    localStorage.setItem("products", JSON.stringify({ value: [1, 2, 3] }));

    expect(storageCache.get("products")).toBeNull();
    expect(localStorage.getItem("products")).toBeNull();
  });

  it("should remove and return null if JSON is corrupted", () => {
    localStorage.setItem("products", "{invalid-json");

    expect(storageCache.get("products")).toBeNull();
    expect(localStorage.getItem("products")).toBeNull();
  });

  it("should remove a key", () => {
    localStorage.setItem("products", JSON.stringify({ value: [1] }));

    storageCache.remove("products");

    expect(localStorage.getItem("products")).toBeNull();
  });
});