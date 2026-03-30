import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

const SearchBar = ({
    placeholder = "Buscar producto...",
    delay = 700,
    onSearch,
    className = "",
}) => {
    const [query, setQuery] = useState("");
    const timeoutRef = useRef(null);
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        timeoutRef.current = setTimeout(() => {
            onSearch(query);
        }, delay);

        return () => clearTimeout(timeoutRef.current);
    }, [query, delay, onSearch]);

    const handleChange = (event) => {
        setQuery(event.target.value);
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            clearTimeout(timeoutRef.current);
            onSearch(query);
        }
    };

    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
                        Catálogo
                    </p>
                    <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                        Listado de productos
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                        Busca por marca o modelo y encuentra el dispositivo que necesitas.
                    </p>
                </div>

                <div className="relative w-full md:max-w-md">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                        type="text"
                        value={query}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        className={`pl-11 ${className}`}
                    />
                </div>
            </div>
        </div>
    );
};

export default SearchBar;