import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import BackToLink from "./back-to-link";

const { linkMock } = vi.hoisted(() => ({
  linkMock: vi.fn(({ to, children, ...props }) => (
    <a href={to} data-testid="back-link" {...props}>
      {children}
    </a>
  )),
}));

vi.mock("react-router", () => ({
  Link: linkMock,
}));

describe("BackToLink", () => {
  it("should render link with text and path", () => {
    render(<BackToLink path="/" text="Volver" />);

    expect(screen.getByTestId("back-link")).toHaveAttribute("href", "/");
    expect(screen.getByText("Volver")).toBeInTheDocument();
  });
});