import { DateTime } from "luxon";

export function deepMerge<T extends object>(obj1: T, obj2: T): T {
    const result = { ...obj1 };

    for (const key in obj2) {
        const value1 = obj1[key];
        const value2 = obj2[key];

        if (value2 === null || value2 === undefined) {
            continue;
        }

        if (value2 instanceof DateTime) {
            result[key] = value2;
        } else if (Array.isArray(value1) && Array.isArray(value2)) {
            result[key] = [...value2] as never;
        } else if (isObject(value1) && isObject(value2)) {
            result[key] = deepMerge(value1, value2);
        } else {
            result[key] = value2;
        }
    }

    return result;
}

function isObject(item: unknown): item is object {
    return item !== null && typeof item === "object" && !Array.isArray(item);
}
