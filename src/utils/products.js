export function filterProductsWithoutPrice(products) {
    return products.filter(product => product.price.trim() !== "");
};

export function getProductField(product, keys, fallback = "No disponible") {
    for (const key of keys) {
        const value = product?.[key];

        if (value !== undefined && value !== null && value !== "") {
            return value;
        }
    }

    return fallback;
};

export function formatDetailValue(value, fallback = "No disponible") {
    if (Array.isArray(value)) {
        return value.length ? value.join(", ") : fallback;
    }

    if (value === null || value === undefined || value === "") {
        return fallback;
    }

    return value;
};

export function getBreadcrumbLabel(pathname) {
    if (pathname === "/") return "Productos"
    else if (pathname.startsWith("/products/")) return "Producto"
     

    return "prueba";
}