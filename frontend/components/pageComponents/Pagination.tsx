'use client';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  className?: string;
};

function buildPageList(currentPage: number, totalPages: number, siblingCount: number) {
  const totalPageNumbers = siblingCount * 2 + 5;

  if (totalPages <= totalPageNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const showLeftDots = leftSiblingIndex > 2;
  const showRightDots = rightSiblingIndex < totalPages - 1;

  const firstPageIndex = 1;
  const lastPageIndex = totalPages;

  if (!showLeftDots && showRightDots) {
    const leftRange = Array.from(
      { length: 3 + siblingCount * 2 },
      (_, i) => i + 1
    );

    return [...leftRange, 'dots-right', lastPageIndex] as const;
  }

  if (showLeftDots && !showRightDots) {
    const rightRangeStart = totalPages - (3 + siblingCount * 2) + 1;
    const rightRange = Array.from(
      { length: 3 + siblingCount * 2 },
      (_, i) => rightRangeStart + i
    );

    return [firstPageIndex, 'dots-left', ...rightRange] as const;
  }

  const middleRange = Array.from(
    { length: rightSiblingIndex - leftSiblingIndex + 1 },
    (_, i) => leftSiblingIndex + i
  );

  return [firstPageIndex, 'dots-left', ...middleRange, 'dots-right', lastPageIndex] as const;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className = '',
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = buildPageList(currentPage, totalPages, siblingCount);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
  };

  return (
    <div className={`flex items-center justify-center gap-2 flex-wrap ${className}`}>
      <button
        type="button"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center justify-center rounded-xl h-10 px-4 border border-primary/15 bg-card text-text-base text-sm font-semibold hover:bg-primary/10 hover:border-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <span className="material-symbols-outlined text-[18px] mr-1">chevron_left</span>
        Prev
      </button>

      {pages.map((item, index) => {
        if (typeof item !== 'number') {
          return (
            <span
              key={`${item}-${index}`}
              className="flex items-center justify-center h-10 min-w-10 px-2 text-text-muted text-sm font-semibold"
            >
              ...
            </span>
          );
        }

        const isActive = item === currentPage;

        return (
          <button
            key={item}
            type="button"
            onClick={() => goToPage(item)}
            className={`flex items-center justify-center rounded-xl h-10 min-w-10 px-3 text-sm font-bold border transition-colors ${
              isActive
                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                : 'bg-card text-text-base border-primary/15 hover:bg-primary/10 hover:border-primary/30'
            }`}
            aria-current={isActive ? 'page' : undefined}
          >
            {item}
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center justify-center rounded-xl h-10 px-4 border border-primary/15 bg-card text-text-base text-sm font-semibold hover:bg-primary/10 hover:border-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Next
        <span className="material-symbols-outlined text-[18px] ml-1">chevron_right</span>
      </button>
    </div>
  );
}