import { productsApi } from "../api/products.api"

export const getProducts = async () => {
    const response = await productsApi.get('/product');    
    
    return response;
}
