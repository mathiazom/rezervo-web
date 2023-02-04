export function randomElementFromArray<T>(array: Array<T>) {
    return array[Math.floor(Math.random() * array.length)]
}