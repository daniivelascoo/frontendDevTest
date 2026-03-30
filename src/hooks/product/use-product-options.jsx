import { useMemo, useState } from "react";

export const useProductOptions = (product) => {
    const [selectedColor, setSelectedColor] = useState("");
    const [selectedStorage, setSelectedStorage] = useState("");

    const storageOptions = useMemo(
        () => product?.options?.storages ?? [],
        [product]
    );

    const colorOptions = useMemo(
        () => product?.options?.colors ?? [],
        [product]
    );

    const defaultColor = colorOptions[0]?.code ? String(colorOptions[0].code) : "";
    const defaultStorage = storageOptions[0]?.code ? String(storageOptions[0].code) : "";

    const effectiveSelectedColor = selectedColor || defaultColor;
    const effectiveSelectedStorage = selectedStorage || defaultStorage;

    const selectedColorName = useMemo(() => {
        return (
            colorOptions.find((item) => String(item.code) === effectiveSelectedColor)?.name ||
            "Sin color"
        );
    }, [colorOptions, effectiveSelectedColor]);

    const selectedStorageName = useMemo(() => {
        return (
            storageOptions.find((item) => String(item.code) === effectiveSelectedStorage)?.name ||
            "Sin almacenamiento"
        );
    }, [storageOptions, effectiveSelectedStorage]);

    return {
        colorOptions,
        storageOptions,
        selectedColor: effectiveSelectedColor,
        selectedStorage: effectiveSelectedStorage,
        selectedColorName,
        selectedStorageName,
        setSelectedColor,
        setSelectedStorage,
    };
};