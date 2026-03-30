import { useContext } from "react";
import { createContext } from "react";

export const ProductsContext = createContext(null);

export const useProducts = () => {
    const context = useContext(ProductsContext);

    if (!context) {
        throw new Error("useProducts must be used within a ProductsContextProvider");
    }

    return context;
};
