import { useEffect, useState } from "react";

/**
 * Hook para atrasar a atualização de um valor (debounce),
 * evitando escritas excessivas no IndexedDB a cada caractere digitado.
 */
export function useDebounce<T>(value: T, delayMs: number = 400): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delayMs);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delayMs]);

    return debouncedValue;
}
