export function hexWithOpacityToRgb(
  hex: string,
  opacity: number,
  brightness: number
) {
  return (
    hex
      .match(/[\da-f]{2}/gi)
      ?.map((c) => opacity * parseInt(c, 16) + (1 - opacity) * brightness) ?? [
      0, 0, 0,
    ]
  );
}
