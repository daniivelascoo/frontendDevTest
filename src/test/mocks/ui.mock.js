import { vi } from "vitest";

export const spinnerMock = vi.fn(({ size }) => (
  <div data-testid="spinner">{size}</div>
));

export const backToLinkMock = vi.fn(({ path, text, ...props }) => (
  <a href={path} data-testid="back-link" {...props}>
    {text}
  </a>
));

export const sectionCardMock = vi.fn(({ title, children }) => (
  <section data-testid="section-card">
    <h2>{title}</h2>
    {children}
  </section>
));