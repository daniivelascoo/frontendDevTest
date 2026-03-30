import { useCallback, useState } from "react";
import { useApi } from "../hooks/api/use-api";
import { getProducts } from "../services/actions/get-products";
import { productsSchema } from "../schemas/product.schema";
import { LOCAL_STORAGE_KEY } from "../constants/shared";
import { filterProductsWithoutPrice } from "../utils/products";
import { storageCache } from "../utils/helper";
import { ProductsContext } from "./use-products";

const getInitialProducts = () => {
    const storedProducts = storageCache.get(LOCAL_STORAGE_KEY.PRODUCTS_LIST);

    if (!storedProducts) return [];

    const validated = productsSchema.safeParse(storedProducts);

    if (!validated.success) {
        storageCache.remove(LOCAL_STORAGE_KEY.PRODUCTS_LIST);
        return [];
    }

    return filterProductsWithoutPrice(validated.data);
};

const ProductsContextProvider = ({ children }) => {
    const [products, setProducts] = useState(getInitialProducts);
    const [cartCount, setCartCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);

    const { isLoading, query } = useApi({
        fetchFunction: getProducts,
        schema: productsSchema,
    });

    const fetchProducts = useCallback(async ({ force = false } = {}) => {
        if (!force) {
            const storedProducts = storageCache.get(LOCAL_STORAGE_KEY.PRODUCTS_LIST);

            if (storedProducts) {
                const validated = productsSchema.safeParse(storedProducts);

                if (validated.success) {
                    const filteredProducts = filterProductsWithoutPrice(validated.data);
                    setProducts(filteredProducts);
                    return filteredProducts;
                }

                storageCache.remove(LOCAL_STORAGE_KEY.PRODUCTS_LIST);
            }
        }

        const result = await query();

        if (!result) return [];

        const filteredProducts = filterProductsWithoutPrice(result);

        setProducts(filteredProducts);
        storageCache.set(LOCAL_STORAGE_KEY.PRODUCTS_LIST, filteredProducts);

        return filteredProducts;
    }, [query]);

    return (
        <ProductsContext.Provider
            value={{
                isLoading,
                products,
                fetchProducts,
                cartCount,
                setCartCount,
                currentPage,
                setCurrentPage,
            }}
        >
            {children}
        </ProductsContext.Provider>
    );
};

export default ProductsContextProvider;