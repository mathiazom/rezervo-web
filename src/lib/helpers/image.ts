export function shimmerPlaceholder(w: number, h: number): `data:image/${string}` {
    return `data:image/svg+xml;base64,${toBase64(shimmer(w, h))}`;
}

function shimmer(w: number, h: number) {
    return `
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#33333322" offset="20%" />
      <stop stop-color="#22222222" offset="50%" />
      <stop stop-color="#33333322" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#33333322" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>
`;
}

function toBase64(str: string) {
    return typeof window === "undefined" ? Buffer.from(str).toString("base64") : window.btoa(str);
}
