export function randomElementFromArray<T>(array: Array<T>) {
    return array[Math.floor(Math.random() * array.length)];
}

export function arraysAreEqual<T>(a: Array<T>, b: Array<T>) {
    return (
        Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val === b[index])
    );
}
