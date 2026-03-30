import { z } from "zod";

const productOptionSchema = z.object({
    code: z.number(),
    name: z.string(),
});

const productOptionsSchema = z.object({
    colors: z.array(productOptionSchema),
    storages: z.array(productOptionSchema),
});

/**
 * La API no es consistente:
 * algunos campos vienen como string ("Yes")
 * y otros como array (["A", "B"]).
 *
 * Como no tenemos control sobre esto ni garantía de consistencia,
 * decidimos normalizar SIEMPRE a array para simplificar la UI.
 *
 * Así evitamos condicionales tipo:
 *   if (Array.isArray(...))
 *
 * Y siempre trabajamos con:
 *   ["valor1", "valor2"]
 */
const toArray = z
    .union([z.string(), z.array(z.string())])
    .transform((val) => (Array.isArray(val) ? val : [val]));

export const productDetailSchema = z.object({
    id: z.string(),
    brand: z.string(),
    model: z.string(),
    price: z.string(),
    imgUrl: z.string(),

    networkTechnology: toArray,
    networkSpeed: toArray,
    gprs: toArray,
    edge: toArray,
    announced: toArray,
    status: toArray,
    dimentions: toArray,
    weight: z.string(),
    sim: toArray,

    displayType: toArray,
    displayResolution: toArray,
    displaySize: toArray,

    os: toArray,
    cpu: toArray,
    chipset: toArray,
    gpu: toArray,

    externalMemory: toArray,
    internalMemory: z.array(z.string()),
    ram: toArray,

    primaryCamera: toArray,
    secondaryCmera: toArray,

    speaker: toArray,
    audioJack: toArray,
    wlan: toArray,
    bluetooth: toArray,
    gps: toArray,
    nfc: toArray,
    radio: toArray,
    usb: toArray,
    sensors: toArray,
    battery: toArray,

    colors: z.array(z.string()),
    options: productOptionsSchema,
});