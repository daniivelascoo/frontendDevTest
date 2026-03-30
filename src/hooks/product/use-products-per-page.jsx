import { useEffect, useState } from "react";

const DEFAULT_CARD_ESTIMATED_HEIGHT = 380;
const DEFAULT_GRID_GAP = 16;
const DEFAULT_RESERVED_HEIGHT = 320;

const getColumnsByWidth = (width) => {
    if (width >= 1280) return 4;
    if (width >= 640) return 2;
    return 1;
};

const calculateProductsPerPageValue = ({
    width,
    height,
    cardEstimatedHeight,
    gridGap,
    reservedHeight,
}) => {
    const columns = getColumnsByWidth(width);
    const availableHeight = height - reservedHeight;

    const rows = Math.max(
        2,
        Math.floor((availableHeight + gridGap) / (cardEstimatedHeight + gridGap))
    );

    return Math.max(1, columns * rows);
};

export const useProductsPerPage = ({
    cardEstimatedHeight = DEFAULT_CARD_ESTIMATED_HEIGHT,
    gridGap = DEFAULT_GRID_GAP,
    reservedHeight = DEFAULT_RESERVED_HEIGHT,
} = {}) => {
    const [productsPerPage, setProductsPerPage] = useState(10);

    useEffect(() => {
        const updateProductsPerPage = () => {
            const newValue = calculateProductsPerPageValue({
                width: window.innerWidth,
                height: window.innerHeight,
                cardEstimatedHeight,
                gridGap,
                reservedHeight,
            });

            setProductsPerPage(newValue);
        };

        updateProductsPerPage();
        window.addEventListener("resize", updateProductsPerPage);

        return () => {
            window.removeEventListener("resize", updateProductsPerPage);
        };
    }, [cardEstimatedHeight, gridGap, reservedHeight]);

    return productsPerPage;
};