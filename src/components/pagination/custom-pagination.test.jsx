import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CustomPagination from "./custom-pagination";

describe("CustomPagination", () => {
  it("should render current page text", () => {
    render(
      <CustomPagination
        currentPage={3}
        totalPages={10}
        onPageChange={vi.fn()}
      />
    );

    expect(screen.getByText("Página 3 de 10")).toBeInTheDocument();
  });

  it("should disable previous button on first page", () => {
    render(
      <CustomPagination
        currentPage={1}
        totalPages={5}
        onPageChange={vi.fn()}
      />
    );

    const buttons = screen.getAllByRole("button");
    expect(buttons[0]).toBeDisabled();
  });

  it("should disable next button on last page", () => {
    render(
      <CustomPagination
        currentPage={5}
        totalPages={5}
        onPageChange={vi.fn()}
      />
    );

    const buttons = screen.getAllByRole("button");
    expect(buttons[buttons.length - 1]).toBeDisabled();
  });

  it("should call onPageChange with previous page", () => {
    const onPageChange = vi.fn();

    render(
      <CustomPagination
        currentPage={3}
        totalPages={5}
        onPageChange={onPageChange}
      />
    );

    fireEvent.click(screen.getAllByRole("button")[0]);

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("should call onPageChange with next page", () => {
    const onPageChange = vi.fn();

    render(
      <CustomPagination
        currentPage={3}
        totalPages={5}
        onPageChange={onPageChange}
      />
    );

    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[buttons.length - 1]);

    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it("should call onPageChange when clicking a visible page", () => {
    const onPageChange = vi.fn();

    render(
      <CustomPagination
        currentPage={3}
        totalPages={5}
        onPageChange={onPageChange}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "4" }));

    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it("should render ellipsis when there are hidden pages", () => {
    render(
      <CustomPagination
        currentPage={5}
        totalPages={12}
        onPageChange={vi.fn()}
      />
    );

    expect(screen.getAllByText("...").length).toBeGreaterThan(0);
  });

  it("should render first and last shortcut buttons when needed", () => {
    render(
      <CustomPagination
        currentPage={5}
        totalPages={12}
        onPageChange={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "12" })).toBeInTheDocument();
  });

  it("should call onPageChange when clicking first page shortcut", () => {
    const onPageChange = vi.fn();

    render(
      <CustomPagination
        currentPage={5}
        totalPages={12}
        onPageChange={onPageChange}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "1" }));

    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("should call onPageChange when clicking last page shortcut", () => {
    const onPageChange = vi.fn();

    render(
      <CustomPagination
        currentPage={5}
        totalPages={12}
        onPageChange={onPageChange}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "12" }));

    expect(onPageChange).toHaveBeenCalledWith(12);
  });
});
