import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * Shows a list in batches, extending it as the user reaches the end.
 *
 * The API returns all 100 products at once and accepts no paging parameters, so
 * nothing is loaded here: it only decides how many of the items already in
 * memory get rendered. That avoids mounting 100 cards — and their 100 images —
 * on the first paint.
 *
 * `loadMore` is exposed alongside the sentinel because infinite scroll on its
 * own excludes keyboard users: without a real control to focus, there is no way
 * to request the next batch. The page mounts both.
 *
 * @template T
 * @param {T[]} items Full list, already filtered.
 * @param {object} [options]
 * @param {number} [options.pageSize] Items per batch.
 * @param {string} [options.resetKey] When it changes, the list goes back to the first batch.
 * @param {number} [options.initialCount] Items visible on mount.
 * @param {number} [options.delayMs] Pause before showing the next batch.
 * @returns {{
 *   visibleItems: T[],
 *   visibleCount: number,
 *   totalCount: number,
 *   hasMore: boolean,
 *   isLoadingMore: boolean,
 *   loadMore: () => void,
 *   sentinelRef: import('react').RefObject<HTMLElement>
 * }}
 */
export function useInfiniteScroll(
  items,
  { pageSize = 12, resetKey = '', initialCount, delayMs = 700 } = {}
) {
  const totalCount = items.length;

  // Not clamped against `totalCount`: on mount the list is still empty because
  // the data has not arrived, so clamping here would always reduce the restored
  // position to a single batch. The real clamping is done by the `slice`, which
  // never returns more items than exist.
  const [visibleCount, setVisibleCount] = useState(() =>
    Math.max(initialCount ?? pageSize, pageSize)
  );

  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const sentinelRef = useRef(null);
  const isFirstRender = useRef(true);
  const timeoutRef = useRef(null);

  // The state is mirrored in a ref so `loadMore` does not change identity when
  // the load starts. If it did, the observer effect would resubscribe mid-pause
  // and fire another batch.
  const isLoadingRef = useRef(false);

  const cancelPending = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    isLoadingRef.current = false;
  }, []);

  // When the search term changes the list is a different one: staying on the
  // fifth batch of a list that now has three items would make no sense.
  useEffect(() => {
    // Not on the first render: it would overwrite the `initialCount` the page
    // uses to restore the position when coming back from a product detail page.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // An in-flight batch belongs to the previous list; appending it now would
    // extend results that are no longer the ones the user is looking at.
    cancelPending();
    setIsLoadingMore(false);
    setVisibleCount(pageSize);
  }, [resetKey, pageSize, cancelPending]);

  // On unmount, the pending timer must not try to update state.
  useEffect(() => cancelPending, [cancelPending]);

  const hasMore = visibleCount < totalCount;

  /**
   * Extends the list after a deliberate pause.
   *
   * The products are already in memory, so technically they could appear
   * instantly. The pause exists for the user: without it, the new batch pops in
   * all at once and nothing indicates that a load happened. With it, the
   * indicator becomes visible and the list's growth makes sense.
   */
  const loadMore = useCallback(() => {
    // The observer can fire several times in a row while the pause lasts;
    // without this guard, several batches would be chained at once.
    if (isLoadingRef.current) return;

    isLoadingRef.current = true;
    setIsLoadingMore(true);

    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      isLoadingRef.current = false;
      setIsLoadingMore(false);
      setVisibleCount((current) => Math.min(current + pageSize, totalCount));
    }, delayMs);
  }, [pageSize, totalCount, delayMs]);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    // With no sentinel, nothing more to show, or no browser support, the
    // "load more" button is still available.
    if (!sentinel || !hasMore || typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) loadMore();
      },
      // Half a screen of lead time, so the next batch is ready before the user
      // reaches the empty space.
      { rootMargin: '50% 0px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  const visibleItems = useMemo(() => items.slice(0, visibleCount), [items, visibleCount]);

  return {
    visibleItems,
    visibleCount: visibleItems.length,
    totalCount,
    hasMore,
    isLoadingMore,
    loadMore,
    sentinelRef,
  };
}
