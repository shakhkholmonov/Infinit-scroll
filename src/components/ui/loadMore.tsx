"use client";
import * as React from "react";

type loadMoreAction<T extends string | number = any> = T extends number
  ? (offset: T) => Promise<readonly [React.JSX.Element, number | null]>
  : T extends string
  ? (offset: T) => Promise<readonly [React.JSX.Element, string | null]>
  : any;

const LoadMore = <T extends string | number = any>({
  children,
  initialOffset,
  loadMoreAction,
}: React.PropsWithChildren<{
  initialOffset: T;
  loadMoreAction: loadMoreAction<T>;
}>) => {
  const ref = React.useRef<HTMLButtonElement>(null);
  const [loadMoreNodes, setLoadMoreNodes] = React.useState<React.JSX.Element[]>([]);

  const [disabled, setDisabled] = React.useState(false);
  const currentOffsetRef = React.useRef<number | string | undefined>(initialOffset);
  const [scrollLoad, setScrollLoad] = React.useState(true);
  const [loading, setLoading] = React.useState(false);

  const loadMore = React.useCallback(
    async (abortController?: AbortController) => {
      setLoading(true);

      // @ts-expect-error
      loadMoreAction(currentOffsetRef.current)
        .then(([node, next]) => {
          if (abortController?.signal.aborted) return;

          setLoadMoreNodes((prev) => [...prev, node]);
          if (next === null) {
            currentOffsetRef.current ??= undefined;
            setDisabled(true);
            return;
          }

          currentOffsetRef.current = next;
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    },
    [loadMoreAction]
  );

  React.useEffect(() => {
    const signal = new AbortController();

    const element = ref.current;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && element?.disabled === false) {
        loadMore(signal);
      }
    });

    if (element && scrollLoad) {
      observer.observe(element);
    }

    return () => {
      signal.abort();
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [loadMore, scrollLoad]);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-12 relative">
        {children}
        {loadMoreNodes}
      </div>
      <button ref={ref} disabled={disabled || loading} onClick={() => loadMore()}>
        {loading ? "Loading..." : "Load More"}
      </button>
    </>
  );
};

export default LoadMore;
