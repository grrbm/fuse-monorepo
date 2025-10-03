import type { CSSProperties } from "react";
import { ThemePalette } from "./types";

const DEFAULT_THEME_COLOR = "#047857";

const isValidHex = (value?: string | null): value is string => {
    if (!value) return false;
    return /^#?([0-9A-F]{3}){1,2}$/i.test(value.trim());
};

const normalizeHex = (hex: string): string => {
    const cleaned = hex.trim().replace(/^#/, "");
    if (cleaned.length === 3) {
        return `#${cleaned[0]}${cleaned[0]}${cleaned[1]}${cleaned[1]}${cleaned[2]}${cleaned[2]}`.toUpperCase();
    }
    return `#${cleaned.toUpperCase()}`;
};

const hexToRgb = (hex: string) => {
    const normalized = normalizeHex(hex).replace("#", "");
    const bigint = parseInt(normalized, 16);
    return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255,
    };
};

const rgbToHex = (r: number, g: number, b: number) =>
    `#${[r, g, b]
        .map((x) => {
            const clamped = Math.max(0, Math.min(255, Math.round(x)));
            const hex = clamped.toString(16);
            return hex.length === 1 ? `0${hex}` : hex;
        })
        .join("")}`.toUpperCase();

const lighten = (hex: string, amount: number) => {
    const { r, g, b } = hexToRgb(hex);
    return rgbToHex(
        r + (255 - r) * amount,
        g + (255 - g) * amount,
        b + (255 - b) * amount
    );
};

const darken = (hex: string, amount: number) => {
    const { r, g, b } = hexToRgb(hex);
    return rgbToHex(r * (1 - amount), g * (1 - amount), b * (1 - amount));
};

export const createTheme = (color?: string | null): ThemePalette => {
    const base = isValidHex(color) ? normalizeHex(color) : DEFAULT_THEME_COLOR;
    return {
        primary: base,
        primaryDark: darken(base, 0.15),
        primaryDarker: darken(base, 0.3),
        primaryLight: lighten(base, 0.65),
        primaryLighter: lighten(base, 0.85),
        text: darken(base, 0.2),
    };
};

export const buildThemeVars = (theme: ThemePalette): CSSProperties => ({
    "--q-primary": theme.primary,
    "--q-primary-dark": theme.primaryDark,
    "--q-primary-darker": theme.primaryDarker,
    "--q-primary-light": theme.primaryLight,
    "--q-primary-lighter": theme.primaryLighter,
    "--q-primary-text": theme.text,
});

export { isValidHex, normalizeHex, lighten, darken };


