import { useState, useEffect } from "react";

export default function useDebounce<T>(value: T, delay: number, instantNull = false) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        if (instantNull && value == null) {
            // TODO: setState should not be called directly an in a useEffect
            // eslint-disable-next-line react-hooks/set-state-in-effect
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
