import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@/lib/testing/test-utils";
import { Pagination, usePagination, PaginationInfo } from "./Pagination";

describe("Pagination", () => {
  it("renders page numbers", () => {
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />
    );

    expect(screen.getByLabelText("Page 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Page 2")).toBeInTheDocument();
    expect(screen.getByLabelText("Page 5")).toBeInTheDocument();
  });

  it("calls onPageChange when page is clicked", () => {
    const onPageChange = vi.fn();

    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />
    );

    const page2Button = screen.getByLabelText("Page 2");
    fireEvent.click(page2Button);

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("disables previous button on first page", () => {
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />
    );

    const prevButton = screen.getByLabelText("Previous page");
    expect(prevButton).toBeDisabled();
  });

  it("disables next button on last page", () => {
    render(
      <Pagination currentPage={5} totalPages={5} onPageChange={() => {}} />
    );

    const nextButton = screen.getByLabelText("Next page");
    expect(nextButton).toBeDisabled();
  });

  it("shows ellipsis for large page counts", () => {
    render(
      <Pagination currentPage={1} totalPages={20} onPageChange={() => {}} />
    );

    const ellipsis = screen.getByText((content, element) => {
      return element?.querySelector("svg.lucide-more-horizontal") !== null;
    });
    expect(ellipsis).toBeInTheDocument();
  });

  it("highlights current page", () => {
    render(
      <Pagination currentPage={3} totalPages={5} onPageChange={() => {}} />
    );

    const currentPageButton = screen.getByLabelText("Page 3");
    expect(currentPageButton).toHaveAttribute("aria-current", "page");
  });

  it("shows first/last buttons when enabled", () => {
    render(
      <Pagination
        currentPage={3}
        totalPages={10}
        onPageChange={() => {}}
        showFirstLast={true}
      />
    );

    expect(screen.getByLabelText("First page")).toBeInTheDocument();
    expect(screen.getByLabelText("Last page")).toBeInTheDocument();
  });
});

describe("PaginationInfo", () => {
  it("displays correct range information", () => {
    render(
      <PaginationInfo currentPage={1} pageSize={20} totalItems={100} />
    );

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("displays correct range for last page", () => {
    render(
      <PaginationInfo currentPage={5} pageSize={20} totalItems={95} />
    );

    expect(screen.getByText("81")).toBeInTheDocument();
    expect(screen.getByText("95")).toBeInTheDocument();
  });
});

describe("usePagination", () => {
  it("returns correct initial values", () => {
    const items = Array.from({ length: 100 }, (_, i) => i);
    let result: ReturnType<typeof usePagination<number>>;

    function TestComponent() {
      result = usePagination({ items, initialPageSize: 20 });
      return null;
    }

    render(<TestComponent />);

    expect(result!.currentPage).toBe(1);
    expect(result!.pageSize).toBe(20);
    expect(result!.totalPages).toBe(5);
    expect(result!.totalItems).toBe(100);
    expect(result!.paginatedItems).toHaveLength(20);
  });

  it("paginates items correctly", () => {
    const items = Array.from({ length: 100 }, (_, i) => i);
    let result: ReturnType<typeof usePagination<number>>;

    function TestComponent() {
      result = usePagination({ items, initialPageSize: 10, initialPage: 2 });
      return null;
    }

    render(<TestComponent />);

    expect(result!.paginatedItems[0]).toBe(10);
    expect(result!.paginatedItems[9]).toBe(19);
  });

  it("provides navigation functions", () => {
    const items = Array.from({ length: 100 }, (_, i) => i);
    let result: ReturnType<typeof usePagination<number>>;

    function TestComponent() {
      result = usePagination({ items, initialPageSize: 20 });
      return null;
    }

    render(<TestComponent />);

    expect(result!.hasNextPage).toBe(true);
    expect(result!.hasPreviousPage).toBe(false);
  });
});
