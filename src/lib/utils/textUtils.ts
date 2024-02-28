export const shortenMiddleNames = (name: string): string =>
    name
        .split(/\s+/)
        .map((part, index, parts) =>
            index > 0 && index < parts.length - 1 && part.length > 1 ? `${part.charAt(0).toUpperCase()}.` : part,
        )
        .join(" ");
