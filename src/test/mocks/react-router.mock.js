import { vi } from "vitest";

export const linkMock = vi.fn(({ to, children, ...props }) => (
  <a href={to} {...props}>
    {children}
  </a>
));

export const useParamsMock = vi.fn();
export const useLocationMock = vi.fn();
export const outletMock = vi.fn(() => <div data-testid="outlet" />);
export const routerProviderMock = vi.fn(({ router }) => (
  <div data-testid="router-provider">{String(router)}</div>
));
export const navigateMock = vi.fn(({ to }) => <div>{to}</div>);
export const createBrowserRouterMock = vi.fn(() => "mock-router");