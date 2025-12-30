import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@/lib/testing/test-utils";
import { VirtualList, InfiniteScroll } from "./VirtualList";

describe("VirtualList", () => {
  const items = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
  }));

  const renderItem = (item: typeof items[0]) => (
    <div data-testid={`item-${item.id}`}>{item.name}</div>
  );

  it("renders visible items only", () => {
    render(
      <VirtualList
        items={items}
        height={400}
        itemHeight={50}
        renderItem={renderItem}
      />
    );

    const firstItem = screen.getByTestId("item-0");
    expect(firstItem).toBeInTheDocument();

    const lastItem = screen.queryByTestId("item-99");
    expect(lastItem).not.toBeInTheDocument();
  });

  it("renders correct number of items based on height", () => {
    const { container } = render(
      <VirtualList
        items={items}
        height={400}
        itemHeight={50}
        renderItem={renderItem}
      />
    );

    const renderedItems = container.querySelectorAll("[data-testid^='item-']");
    expect(renderedItems.length).toBeGreaterThan(0);
    expect(renderedItems.length).toBeLessThan(items.length);
  });

  it("calls onEndReached when scrolled to bottom", () => {
    const onEndReached = vi.fn();

    const { container } = render(
      <VirtualList
        items={items}
        height={400}
        itemHeight={50}
        renderItem={renderItem}
        onEndReached={onEndReached}
      />
    );

    const scrollContainer = container.firstChild as HTMLDivElement;

    Object.defineProperty(scrollContainer, "scrollTop", { value: 4500, writable: true });
    Object.defineProperty(scrollContainer, "scrollHeight", { value: 5000, writable: true });
    Object.defineProperty(scrollContainer, "clientHeight", { value: 400, writable: true });

    scrollContainer.dispatchEvent(new Event("scroll"));

    expect(onEndReached).toHaveBeenCalled();
  });

  it("handles empty items array", () => {
    const { container } = render(
      <VirtualList items={[]} height={400} itemHeight={50} renderItem={renderItem} />
    );

    expect(container).toBeInTheDocument();
  });
});

describe("InfiniteScroll", () => {
  beforeEach(() => {
    global.IntersectionObserver = class IntersectionObserver {
      constructor(private callback: IntersectionObserverCallback) {}
      observe() {
        this.callback(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          this
        );
      }
      disconnect() {}
      takeRecords() {
        return [];
      }
      unobserve() {}
    } as any;
  });

  it("renders children", () => {
    render(
      <InfiniteScroll
        onLoadMore={async () => {}}
        hasMore={true}
        isLoading={false}
      >
        <div data-testid="content">Content</div>
      </InfiniteScroll>
    );

    expect(screen.getByTestId("content")).toBeInTheDocument();
  });

  it("shows loader when loading", () => {
    render(
      <InfiniteScroll
        onLoadMore={async () => {}}
        hasMore={true}
        isLoading={true}
      >
        <div>Content</div>
      </InfiniteScroll>
    );

    const loader = screen.getByText((content, element) => {
      return element?.className.includes("animate-bounce") || false;
    });
    expect(loader).toBeInTheDocument();
  });

  it("shows end message when no more items", () => {
    render(
      <InfiniteScroll
        onLoadMore={async () => {}}
        hasMore={false}
        isLoading={false}
        endMessage={<div>No more items</div>}
      >
        <div>Content</div>
      </InfiniteScroll>
    );

    expect(screen.getByText("No more items")).toBeInTheDocument();
  });

  it("does not show loader when hasMore is false", () => {
    const { container } = render(
      <InfiniteScroll
        onLoadMore={async () => {}}
        hasMore={false}
        isLoading={false}
      >
        <div>Content</div>
      </InfiniteScroll>
    );

    const loader = container.querySelector(".animate-bounce");
    expect(loader).not.toBeInTheDocument();
  });
});
