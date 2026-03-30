import {
    Battery,
    Bluetooth,
    Calendar,
    Camera,
    Check,
    CircleOff,
    Cpu,
    HardDrive,
    Headphones,
    MapPin,
    Monitor,
    Palette,
    Radio,
    Smartphone,
    Usb,
    Weight,
    Wifi,
} from "lucide-react";
import { formatDetailValue, getProductField } from "../../products";

export const getProductHeroDetails = (product) => {
    if (!product) return [];

    return [
        {
            label: "Precio",
            value: `${getProductField(product, ["price"], "-")} €`,
        },
        {
            label: "Sistema operativo",
            value: getProductField(product, ["os"]),
        },
        {
            label: "RAM",
            value: getProductField(product, ["ram"]),
        },
        {
            label: "Chipset",
            value: getProductField(product, ["chipset"]),
        },
    ];
};

export const getProductDetailSections = (product) => {
    if (!product) return [];

    return [
        {
            title: "Diseño y construcción",
            items: [
                {
                    label: "Dimensiones",
                    value: formatDetailValue(product.dimentions),
                    icon: Smartphone,
                },
                {
                    label: "Peso",
                    value: (product.weight && product.weight.trim() !== "") ? `${product.weight} g` : "No disponible",
                    icon: Weight,
                },
                {
                    label: "Colores",
                    value: formatDetailValue(product.colors),
                    icon: Palette,
                },
                {
                    label: "SIM",
                    value: formatDetailValue(product.sim),
                    icon: CircleOff,
                },
            ],
        },
        {
            title: "Pantalla y rendimiento",
            items: [
                {
                    label: "Pantalla",
                    value: formatDetailValue(product.displayType),
                    icon: Monitor,
                },
                {
                    label: "Resolución / tamaño",
                    value: formatDetailValue(product.displayResolution),
                    icon: Monitor,
                },
                {
                    label: "Tamaño / píxeles",
                    value: formatDetailValue(product.displaySize),
                    icon: Monitor,
                },
                {
                    label: "CPU",
                    value: formatDetailValue(product.cpu),
                    icon: Cpu,
                },
                {
                    label: "Chipset",
                    value: formatDetailValue(product.chipset),
                    icon: Cpu,
                },
                {
                    label: "GPU",
                    value: formatDetailValue(product.gpu),
                    icon: Cpu,
                },
                {
                    label: "RAM",
                    value: formatDetailValue(product.ram),
                    icon: HardDrive,
                },
                {
                    label: "Sistema operativo",
                    value: formatDetailValue(product.os),
                    icon: Smartphone,
                },
            ],
        },
        {
            title: "Memoria",
            items: [
                {
                    label: "Memoria interna",
                    value: formatDetailValue(product.internalMemory),
                    icon: HardDrive,
                },
                {
                    label: "Memoria externa",
                    value: formatDetailValue(product.externalMemory),
                    icon: HardDrive,
                },
            ],
        },
        {
            title: "Cámaras y batería",
            items: [
                {
                    label: "Cámara principal",
                    value: formatDetailValue(product.primaryCamera),
                    icon: Camera,
                },
                {
                    label: "Cámara secundaria",
                    value: formatDetailValue(product.secondaryCmera),
                    icon: Camera,
                },
                {
                    label: "Batería",
                    value: formatDetailValue(product.battery),
                    icon: Battery,
                },
                {
                    label: "Sensores",
                    value: formatDetailValue(product.sensors),
                    icon: Smartphone,
                },
            ],
        },
        {
            title: "Conectividad y multimedia",
            items: [
                {
                    label: "Tecnología de red",
                    value: formatDetailValue(product.networkTechnology),
                    icon: Wifi,
                },
                {
                    label: "Velocidad de red",
                    value: formatDetailValue(product.networkSpeed),
                    icon: Wifi,
                },
                {
                    label: "GPRS",
                    value: formatDetailValue(product.gprs),
                    icon: Wifi,
                },
                {
                    label: "EDGE",
                    value: formatDetailValue(product.edge),
                    icon: Wifi,
                },
                {
                    label: "Wi-Fi",
                    value: formatDetailValue(product.wlan),
                    icon: Wifi,
                },
                {
                    label: "Bluetooth",
                    value: formatDetailValue(product.bluetooth),
                    icon: Bluetooth,
                },
                {
                    label: "GPS",
                    value: formatDetailValue(product.gps),
                    icon: MapPin,
                },
                {
                    label: "NFC",
                    value: formatDetailValue(product.nfc),
                    icon: Smartphone,
                },
                {
                    label: "Radio",
                    value: formatDetailValue(product.radio),
                    icon: Radio,
                },
                {
                    label: "USB",
                    value: formatDetailValue(product.usb),
                    icon: Usb,
                },
                {
                    label: "Audio Jack",
                    value: formatDetailValue(product.audioJack),
                    icon: Headphones,
                },
                {
                    label: "Altavoces",
                    value: formatDetailValue(product.speaker),
                    icon: Headphones,
                },
            ],
        },
        {
            title: "Información adicional",
            items: [
                {
                    label: "Anunciado",
                    value: formatDetailValue(product.announced),
                    icon: Calendar,
                },
                {
                    label: "Estado",
                    value: formatDetailValue(product.status),
                    icon: Check,
                },
            ],
        },
    ];
};