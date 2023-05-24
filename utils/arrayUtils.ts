export function randomElementFromArray<T>(array: Array<T>) {
    return array[Math.floor(Math.random() * array.length)];
}

export function arraysAreEqual<T>(a: Array<T>, b: Array<T>) {
    return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((val, index) => val === b[index]);
}

export function formatNameArray(a: string[], max?: number) {
    if (a.length === 0) {
        return "";
    }
    if (a.length === 1) {
        return a[0];
    }
    if (max && a.length > max) {
        return `${a.slice(0, max - 1).join(", ")} og ${a.length - max + 1} andre`;
    }
    return `${a.slice(0, -1).join(", ")} og ${a.slice(-1)}`;
}
