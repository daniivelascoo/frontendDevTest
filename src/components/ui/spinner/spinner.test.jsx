import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Spinner from "./spinner";

describe("Spinner", () => {
  it("should render with default size", () => {
    const { container } = render(<Spinner />);
    const spinner = container.firstChild;

    expect(spinner).toHaveStyle({
      width: "16px",
      height: "16px",
    });
  });

  it("should render with custom size", () => {
    const { container } = render(<Spinner size={28} />);
    const spinner = container.firstChild;

    expect(spinner).toHaveStyle({
      width: "28px",
      height: "28px",
    });
  });

  it("should render with custom color and className", () => {
    const { container } = render(
      <Spinner color="border-white" className="my-spinner" />
    );
    const spinner = container.firstChild;

    expect(spinner).toHaveClass("border-white");
    expect(spinner).toHaveClass("my-spinner");
    expect(spinner).toHaveClass("animate-spin");
  });
});