export function hexWithOpacityToRgb(hex: string, opacity: number, brightness: number) {
    return hex.match(/[\da-f]{2}/gi)?.map((c) => opacity * parseInt(c, 16) + (1 - opacity) * brightness) ?? [0, 0, 0];
}

export function hexColorHash(s: string) {
    let hash = 0;
    for (let i = 0; i < s.length; i++) {
        hash = s.charCodeAt(i) + ((hash << 5) - hash);
    }
    let colour = "#";
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xff;
        colour += value.toString(16).padStart(2, "0");
    }
    return colour;
}
