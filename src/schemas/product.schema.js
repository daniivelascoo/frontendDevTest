import { z } from "zod";

export const productSchema = z.object({
    id: z.string(),
    brand: z.string(),
    model: z.string(),
    price: z.string(),
    imgUrl: z.string(),
});

// Se valida la data y se descartan los productos SIN precio
export const productsSchema = z.array(z.any()).transform((items) =>
  items.flatMap((item) => {
    const parsed = productSchema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  })
);