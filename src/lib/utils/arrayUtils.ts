import { UserNameWithIsSelf } from "@/types/config";

export function randomElementFromArray<T>(array: T[]) {
    return array[Math.floor(Math.random() * array.length)];
}

export function formatNameArray(a: string[], max?: number, plusSelf = false) {
    if (a.length === 0) {
        return plusSelf ? "Du" : "";
    }
    if (a.length === 1) {
        return `${plusSelf ? "Du og " : ""}${a[0]}`;
    }
    if (max && a.length > max) {
        return `${plusSelf ? "Du, " : ""}${a.slice(0, max - 1).join(", ")} og ${a.length - max + 1} andre`;
    }
    return `${plusSelf ? "Du, " : ""}${a.slice(0, -1).join(", ")} og ${a.slice(-1)}`;
}

export function userNameWithIsSelfComparator(a: UserNameWithIsSelf, b: UserNameWithIsSelf) {
    return a.isSelf ? -1 : b.isSelf ? 1 : a.userName.localeCompare(b.userName);
}

export type NonEmptyArray<T> = [T, ...T[]];

export function isNonEmptyArray<T>(arr: T[]): arr is NonEmptyArray<T> {
    return arr.length > 0;
}

export function updateValueSelection<T>(selectedValues: T[], value: T, isSelected: boolean): T[] {
    return isSelected
        ? selectedValues.includes(value)
            ? selectedValues
            : [...selectedValues, value]
        : selectedValues.filter((c) => c != value);
}
