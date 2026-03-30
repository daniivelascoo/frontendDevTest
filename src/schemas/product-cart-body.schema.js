import { z } from "zod";

export const productCartBodySchema = z.object({
    id: z.string(),
    colorCode: z.number(),
    storageCode: z.number(),
});
