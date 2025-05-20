type OklchColor = {
    l: number;
    c: number;
    h: number;
};

export const originalDefaultSetting: ColorSetting = {
    baseColor: { l: 0.79, c: 0.1741, h: 155.38 },
    factor: 1.2,
    colorNum: 9,
    colorName: "green",
    outputMode: "string",
    fallbackOutputMode: "string",
    minL: 5,
    maxL: 98,
    showColorValue: false,
    lightnessMode: "sigmoid",
    centerL: 67,
};

export const defaultSetting: ColorSetting = { ...originalDefaultSetting };

export type ColorSetting = {
    baseColor: OklchColor;
    factor: number;
    colorNum: number;
    colorName: string;
    outputMode: string;
    fallbackOutputMode: string;
    minL: number;
    maxL: number;
    showColorValue: boolean;
    lightnessMode: "gamma" | "sigmoid";
    centerL: number;
};

export type DecodedSettings = {
    colorSettings: ColorSetting[];
    defaultSetting: ColorSetting;
};

// Helper --------------------------------------------------------------------
const isNumber = (v: unknown): v is number => typeof v === "number";
const isString = (v: unknown): v is string => typeof v === "string";
const isObject = (v: unknown): v is Record<string, unknown> =>
    typeof v === "object" && v !== null;

const isOklchColor = (v: unknown): v is OklchColor =>
    isObject(v) &&
    isNumber(v.l) &&
    isNumber(v.c) &&
    isNumber(v.h);

const isColorSetting = (v: unknown): v is ColorSetting =>
    isObject(v) &&
    isOklchColor(v.baseColor) &&
    isNumber(v.factor) &&
    isNumber(v.colorNum) &&
    isString(v.colorName) &&
    isString(v.outputMode) &&
    isString(v.fallbackOutputMode) &&
    isNumber(v.minL) &&
    isNumber(v.maxL) &&
    typeof v.showColorValue === "boolean" &&
    (v.lightnessMode === "gamma" || v.lightnessMode === "sigmoid") &&
    isNumber(v.centerL);

export const isDecodedSettings = (a: unknown): a is DecodedSettings =>
    isObject(a) &&
    Array.isArray(a.colorSettings) &&
    a.colorSettings.every(isColorSetting) &&
    isColorSetting(a.defaultSetting);

export const setDefaultSetting = (setting: ColorSetting) => {
    defaultSetting.baseColor = setting.baseColor;
    defaultSetting.factor = setting.factor;
    defaultSetting.colorNum = setting.colorNum;
    defaultSetting.colorName = setting.colorName;
    defaultSetting.outputMode = setting.outputMode;
    defaultSetting.fallbackOutputMode = setting.fallbackOutputMode;
    defaultSetting.minL = setting.minL;
    defaultSetting.maxL = setting.maxL;
    defaultSetting.showColorValue = setting.showColorValue;
    defaultSetting.lightnessMode = setting.lightnessMode;
    defaultSetting.centerL = setting.centerL;
}