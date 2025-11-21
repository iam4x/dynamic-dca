export const afterDecimals = (num: number | string) => {
  if (Number.isInteger(num)) return 0;

  const str = num?.toString?.();

  if (str?.includes?.("e")) {
    const [, exponent] = str.split("e");
    return Math.abs(Number(exponent));
  }

  return str?.split?.(".")?.[1]?.length || 0;
};

export const adjust = (value: number, step: number | string) => {
  const multiplier = 1 / Number(step);
  const adjusted = Math.round(value * multiplier) / multiplier;
  const decimals = afterDecimals(step);
  return Math.round(adjusted * 10 ** decimals) / 10 ** decimals;
};
