import { ChevronLeft, ChevronRight } from "lucide-react";

const range = (start, end) => {
    const length = end - start + 1;
    return Array.from({ length }, (_, idx) => idx + start);
};

const CustomPagination = ({ currentPage, totalPages, onPageChange }) => {
    const maxVisibleDots = 7;
    const halfVisible = Math.floor(maxVisibleDots / 2);

    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisibleDots - 1);

    if (endPage - startPage + 1 < maxVisibleDots) {
        startPage = Math.max(1, endPage - maxVisibleDots + 1);
    }

    const visiblePages = range(startPage, endPage);

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <ChevronLeft className="cursor-pointer h-4 w-4" />
                </button>

                <div className="flex items-center gap-1.5">
                    {startPage > 1 && (
                        <>
                            <button
                                type="button"
                                onClick={() => onPageChange(1)}
                                className="cursor-pointer group relative flex items-center justify-center h-2.5 w-2.5 rounded-full bg-gray-300 transition-all duration-200 hover:w-8 hover:h-8 hover:bg-slate-500"
                            >
                                <span className="opacity-0 text-xs text-white font-medium transition-opacity duration-200 group-hover:opacity-100">
                                    1
                                </span>
                            </button>

                            {startPage > 2 && <span className="px-1 text-gray-400">...</span>}
                        </>
                    )}

                    {visiblePages.map((page) => (
                        <button
                            key={page}
                            type="button"
                            onClick={() => onPageChange(page)}
                            className={`cursor-pointer group relative flex items-center justify-center rounded-full transition-all duration-200
                                    ${currentPage === page
                                    ? "w-8 h-8 bg-slate-700 text-white"
                                    : "h-2.5 w-2.5 bg-slate-300 hover:w-8 hover:h-8 hover:bg-slate-500"
                                }`}
                        >
                            <span
                                className={`text-xs font-medium transition-opacity duration-200
                                        ${currentPage === page
                                        ? "opacity-100"
                                        : "opacity-0 group-hover:opacity-100 text-white"
                                    }`}
                            >
                                {page}
                            </span>
                        </button>
                    ))}

                    {endPage < totalPages && (
                        <>
                            {endPage < totalPages - 1 && <span className="px-1 text-gray-400">...</span>}

                            <button
                                type="button"
                                onClick={() => onPageChange(totalPages)}
                                className="cursor-pointer group relative flex items-center justify-center h-2.5 w-2.5 rounded-full bg-slate-300 transition-all duration-200 hover:w-8 hover:h-8 hover:bg-slate-500"
                            >
                                <span className="opacity-0 text-xs text-white font-medium transition-opacity duration-200 group-hover:opacity-100">
                                    {totalPages}
                                </span>
                            </button>
                        </>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <ChevronRight className="cursor-pointer h-4 w-4" />
                </button>
            </div>

            <span className="text-xs text-gray-500">
                Página {currentPage} de {totalPages}
            </span>
        </div>
    );
}

export default CustomPagination;
