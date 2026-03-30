import { describe, expect, it } from "vitest";
import {
  getProductHeroDetails,
  getProductDetailSections,
} from "./product-detail.mapper";

describe("getProductHeroDetails", () => {
  it("should return an empty array if product is not provided", () => {
    expect(getProductHeroDetails(null)).toEqual([]);
    expect(getProductHeroDetails(undefined)).toEqual([]);
  });

  it("should return hero details with product values", () => {
    const product = {
      price: "299",
      os: "Android 14",
      ram: "8 GB",
      chipset: "Snapdragon 8 Gen 2",
    };

    expect(getProductHeroDetails(product)).toEqual([
      { label: "Precio", value: "299 €" },
      { label: "Sistema operativo", value: "Android 14" },
      { label: "RAM", value: "8 GB" },
      { label: "Chipset", value: "Snapdragon 8 Gen 2" },
    ]);
  });

  it("should use fallback values when fields are missing", () => {
    const product = {};

    expect(getProductHeroDetails(product)).toEqual([
      { label: "Precio", value: "- €" },
      { label: "Sistema operativo", value: "No disponible" },
      { label: "RAM", value: "No disponible" },
      { label: "Chipset", value: "No disponible" },
    ]);
  });
});

describe("getProductDetailSections", () => {
  it("should return an empty array if product is not provided", () => {
    expect(getProductDetailSections(null)).toEqual([]);
    expect(getProductDetailSections(undefined)).toEqual([]);
  });

  it("should return all detail sections", () => {
    const product = {
      dimentions: "146 x 70 x 8 mm",
      weight: "180",
      colors: ["Black", "Blue"],
      sim: ["Dual SIM"],
      displayType: "AMOLED",
      displayResolution: "2400x1080",
      displaySize: "6.7 inches",
      cpu: "Octa-core",
      chipset: "Snapdragon",
      gpu: "Adreno",
      ram: "8 GB",
      os: "Android",
      internalMemory: "256 GB",
      externalMemory: "microSD",
      primaryCamera: "50 MP",
      secondaryCmera: "12 MP",
      battery: "5000 mAh",
      sensors: ["Fingerprint", "Gyroscope"],
      networkTechnology: "GSM / LTE / 5G",
      networkSpeed: "5G",
      gprs: "Yes",
      edge: "Yes",
      wlan: "Wi-Fi 6",
      bluetooth: "5.3",
      gps: "Yes",
      nfc: "Yes",
      radio: "No",
      usb: "USB-C",
      audioJack: "No",
      speaker: "Stereo",
      announced: "2025",
      status: "Available",
    };

    const result = getProductDetailSections(product);

    expect(result).toHaveLength(6);
    expect(result[0].title).toBe("Diseño y construcción");
    expect(result[1].title).toBe("Pantalla y rendimiento");
    expect(result[2].title).toBe("Memoria");
    expect(result[3].title).toBe("Cámaras y batería");
    expect(result[4].title).toBe("Conectividad y multimedia");
    expect(result[5].title).toBe("Información adicional");
  });

  it("should format array values as comma separated strings", () => {
    const product = {
      colors: ["Black", "Blue"],
      sim: ["Single SIM", "eSIM"],
    };

    const result = getProductDetailSections(product);
    const designSection = result[0];

    expect(designSection.items.find((item) => item.label === "Colores").value).toBe("Black, Blue");
    expect(designSection.items.find((item) => item.label === "SIM").value).toBe("Single SIM, eSIM");
  });

  it("should append grams to weight when weight is present", () => {
    const product = {
      weight: "180",
    };

    const result = getProductDetailSections(product);
    const designSection = result[0];
    const weightItem = designSection.items.find((item) => item.label === "Peso");

    expect(weightItem.value).toBe("180 g");
  });

  it("should return fallback for weight when empty", () => {
    const product = {
      weight: "",
    };

    const result = getProductDetailSections(product);
    const designSection = result[0];
    const weightItem = designSection.items.find((item) => item.label === "Peso");

    expect(weightItem.value).toBe("No disponible");
  });

  it("should include icons in every item", () => {
    const result = getProductDetailSections({});
    const items = result.flatMap((section) => section.items);

    items.forEach((item) => {
      expect(item.icon).toBeDefined();
    });
  });

  it("should return fallback values when product fields are missing", () => {
    const result = getProductDetailSections({});
    const allItems = result.flatMap((section) => section.items);

    expect(allItems.find((item) => item.label === "Dimensiones").value).toBe("No disponible");
    expect(allItems.find((item) => item.label === "Pantalla").value).toBe("No disponible");
    expect(allItems.find((item) => item.label === "Batería").value).toBe("No disponible");
    expect(allItems.find((item) => item.label === "Estado").value).toBe("No disponible");
  });
});