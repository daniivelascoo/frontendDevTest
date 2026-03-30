import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SearchBar from "./search-bar";

describe("SearchBar", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("should render default content", () => {
    render(<SearchBar onSearch={vi.fn()} />);

    expect(screen.getByText("Catálogo")).toBeInTheDocument();
    expect(screen.getByText("Listado de productos")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Busca por marca o modelo y encuentra el dispositivo que necesitas."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Buscar producto...")
    ).toBeInTheDocument();
  });

  it("should render custom placeholder", () => {
    render(<SearchBar onSearch={vi.fn()} placeholder="Busca aquí" />);

    expect(screen.getByPlaceholderText("Busca aquí")).toBeInTheDocument();
  });

  it("should apply custom className to input", () => {
    render(<SearchBar onSearch={vi.fn()} className="custom-input" />);

    expect(screen.getByRole("textbox")).toHaveClass("custom-input");
  });

  it("should not call onSearch on initial render", () => {
    const onSearch = vi.fn();

    render(<SearchBar onSearch={onSearch} />);

    expect(onSearch).not.toHaveBeenCalled();
  });

  it("should call onSearch after delay when query changes", () => {
    const onSearch = vi.fn();

    render(<SearchBar onSearch={onSearch} delay={700} />);

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "iphone" },
    });

    vi.advanceTimersByTime(699);
    expect(onSearch).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(onSearch).toHaveBeenCalledWith("iphone");
  });

  it("should clear previous timeout when query changes quickly", () => {
    const onSearch = vi.fn();

    render(<SearchBar onSearch={onSearch} delay={700} />);

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "iph" },
    });

    vi.advanceTimersByTime(300);

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "iphone" },
    });

    vi.advanceTimersByTime(699);
    expect(onSearch).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith("iphone");
  });

  it("should call onSearch immediately when Enter is pressed", () => {
    const onSearch = vi.fn();

    render(<SearchBar onSearch={onSearch} delay={700} />);

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "samsung" },
    });

    fireEvent.keyDown(screen.getByRole("textbox"), {
      key: "Enter",
      code: "Enter",
    });

    expect(onSearch).toHaveBeenCalledWith("samsung");
  });

  it("should not call onSearch on non-enter keydown", () => {
    const onSearch = vi.fn();

    render(<SearchBar onSearch={onSearch} delay={700} />);

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "samsung" },
    });

    fireEvent.keyDown(screen.getByRole("textbox"), {
      key: "a",
      code: "KeyA",
    });

    expect(onSearch).not.toHaveBeenCalled();

    vi.advanceTimersByTime(700);
    expect(onSearch).toHaveBeenCalledWith("samsung");
  });
});