import { productCartBodySchema } from "../../schemas/product-cart-body.schema";
import { productsApi } from "../api/products.api"

export const addProductCart = async (body) => {
    if (!productCartBodySchema.safeParse(body).success) return { status: 400 }

    const response = await productsApi.post(`/cart`, body);

    return response;
}
