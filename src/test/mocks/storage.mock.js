import { vi } from "vitest";

export const cacheGetMock = vi.fn();
export const cacheSetMock = vi.fn();
export const cacheRemoveMock = vi.fn();

export const storageCacheMock = {
  get: cacheGetMock,
  set: cacheSetMock,
  remove: cacheRemoveMock,
};