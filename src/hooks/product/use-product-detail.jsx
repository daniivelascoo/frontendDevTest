import { useEffect, useState } from "react";
import { useApi } from "../api/use-api";
import { getProductDetail } from "../../services/actions/get-product-detail";
import { productDetailSchema } from "../../schemas/product-detail.schema";
import { storageCache } from "../../utils/helper";
import { LOCAL_STORAGE_KEY } from "../../constants/shared";

export const useProductDetail = (productId) => {
    const { isLoading, query } = useApi({
        fetchFunction: getProductDetail,
        schema: productDetailSchema,
    });

    const [productState, setProductState] = useState({
        productId: null,
        product: null,
    });

    useEffect(() => {
        if (!productId) return;

        const cacheKey = `${LOCAL_STORAGE_KEY.PRODUCT_DETAIL}-${productId}`;
        let isCancelled = false;

        const fetchProductDetail = async () => {
            const cachedProduct = storageCache.get(cacheKey);

            if (cachedProduct) {
                const validated = productDetailSchema.safeParse(cachedProduct);

                if (validated.success) {
                    if (!isCancelled) {
                        setProductState({
                            productId,
                            product: validated.data,
                        });
                    }

                    return;
                }

                storageCache.remove(cacheKey);
            }

            const response = await query(productId);

            if (isCancelled) return;

            if (!response) {
                setProductState({
                    productId,
                    product: null,
                });
                return;
            }

            setProductState({
                productId,
                product: response,
            });

            storageCache.set(cacheKey, response);
        };

        fetchProductDetail();

        return () => {
            isCancelled = true;
        };
    }, [productId, query]);

    return {
        product: productState.productId === productId ? productState.product : null,
        isLoading,
    };
};