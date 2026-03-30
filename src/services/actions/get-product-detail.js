import { productsApi } from "../api/products.api"

export const getProductDetail = async (productId) => {
    const response = await productsApi.get(`/product/${productId}`);

    return response;
}
