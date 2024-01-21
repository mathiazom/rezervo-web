import { useState, useEffect } from "react";

export default function useDebounce<T>(value: T, delay: number, instantNull = false) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        if (instantNull && value == null) {
            setDebouncedValue(value);
            return;
        }
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay, instantNull]);

    return debouncedValue;
}
