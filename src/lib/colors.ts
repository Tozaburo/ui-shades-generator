import { converter, formatHex, formatRgb, formatHsl, parse, inGamut, clampChroma } from "culori";
import type OklchColor from "./OklchColor";

const toOk = converter("oklch");
const toRgb = converter("rgb");
const toHsl = converter("hsl");
const withinSrgb = inGamut("rgb"); // predicate

export const fallbackBasic = (basic: OklchColor, inSrgb: string, outSrgb: string): string => {
    const { l = 0, c = 0, h = 0 } = basic;
    const ok = { mode: "oklch" as const, l: l > 1 ? l / 100 : l, c, h };

    let rgb = toRgb(ok);

    if (withinSrgb(rgb)) {
        const basicColor = { l, c, h };
        switch (inSrgb) {
            case "hex":
                return basicToHex(basicColor);
            case "hsl":
                return basicToHsl(basicColor);
            case "rgb":
                return basicToRgb(basicColor);
            case "string":
                return basicToString(basicColor);
            // case "basic":
            //     return basicColor;
            default:
                throw new Error("Unsupported color format.");
        }
    }

    const basicResult = clampChroma(ok, "oklch" as const, "rgb" as const);

    switch (outSrgb) {
        case "hex":
            return basicToHex(basicResult);
        case "hsl":
            return basicToHsl(basicResult);
        case "rgb":
            return basicToRgb(basicResult);
        case "string":
            return basicToString(basicResult);
        // case "basic":
        //     return basicResult;
        default:
            throw new Error("Unsupported color format.");
    }
};

// Basic → {l: 0, c: 0, h: 0}
// String → "oklch(0 0 0)""
// rgb → "rgb(0, 0, 0)"
// hsl → "hsl(0, 0%, 0%)"
// hex → "#000000"

export const toBasic = (value: string | OklchColor) => {
    if (typeof value === "string") {
        const parsed = parse(value);
        if (!parsed) throw new Error("Invalid color string.");
        const { l = 0, c = 0, h = 0 } = toOk(parsed);
        return { l: Math.round(l * 100) / 100, c: Math.round(c * 10000) / 10000, h: Math.round(h * 100) / 100 };
    }
    if (
        value &&
        typeof value === "object" &&
        "l" in value &&
        "c" in value &&
        "h" in value
    ) {
        return { l: Math.round(value.l * 100) / 100, c: Math.round(value.c * 10000) / 10000, h: Math.round(value.h * 100) / 100 };
    }
    throw new Error("Unsupported input type.");
};

export const basicToString = ({ l, c, h }: { l: number; c: number; h: number }) =>
    `oklch(${Math.round(l * 100) / 100} ${Math.round(c * 10000) / 10000} ${Math.round(h * 100) / 100})`;
export const basicToHex = (b: OklchColor) =>
    formatHex(toRgb({ mode: "oklch" as const, ...b }));
export const basicToRgb = (b: OklchColor) =>
    formatRgb(toRgb({ mode: "oklch" as const, ...b }));
export const basicToHsl = (b: OklchColor) =>
    formatHsl(toHsl({ mode: "oklch" as const, ...b }));

const isValidHex = (value: string): boolean => {
    const color = parse(value);
    return Boolean(color && value.toLowerCase() === formatHex(color));
};

const isValidRgb = (value: string): boolean => {
    const parsed = parse(value);
    return Boolean(parsed && value.toLowerCase() === formatRgb(parsed));
};

const isValidHsl = (value: string): boolean => {
    const color = parse(value);
    return Boolean(color && value.toLowerCase() === formatHsl(color));
};

const isValidOklch = (value: string): boolean => {
    const oklchRegex =
        /^oklch\(\d*(\.\d+)?%?\s+\d*(\.\d+)?%?\s+\d*(\.\d+)?(deg)?\)$/i;
    return oklchRegex.test(value) && parse(value) !== undefined;
};

export const isValidColor = (
    value: string,
    baseColorInputMode: string,
): boolean => {
    switch (baseColorInputMode) {
        case "hex":
            return isValidHex(value);
        case "rgb":
            return isValidRgb(value);
        case "hsl":
            return isValidHsl(value);
        case "oklch":
            return isValidOklch(value);
        default:
            return false;
    }
};