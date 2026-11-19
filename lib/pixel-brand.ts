import type { THEME_IDS } from "./theme-catalog"

export type BrandTheme = (typeof THEME_IDS)[number]

// Plate, letter stems, and staircase for the approved Pixel mark.
const palettes = {
    light: ["#fff8ed", "#211a15", "#875229"],
    dark: ["#211c19", "#fff6eb", "#f0c691"],
    lol: ["#071823", "#fff9f1", "#e8ca7d"],
    cyberpunk: ["#190826", "#fff9f1", "#ff9ade"],
    newyear: ["#101424", "#fff9f1", "#f2dba7"],
    valentine: ["#28111f", "#fff9f1", "#f6c3d1"],
    sakura: ["#2b1320", "#fff9f1", "#ffc7da"],
    songkran: ["#092c3c", "#fff9f1", "#b9e5eb"],
    botanical: ["#182d1d", "#fff9f1", "#cee1b9"],
    pride: ["#1a132b", "#fff9f1", "#e0c5ff"],
    ocean: ["#071e2c", "#fff9f1", "#b4edf0"],
    starlight: ["#12162f", "#fff9f1", "#d4d9ff"],
    harvest: ["#301d14", "#fff9f1", "#f2d2a7"],
    halloween: ["#190d1f", "#fff9f1", "#f2ad6c"],
    lantern: ["#23121c", "#fff9f1", "#f8d6a2"],
    christmas: ["#061b14", "#fff9f1", "#e5c78d"],
} satisfies Record<BrandTheme, [string, string, string]>

function isBrandTheme(theme: string): theme is BrandTheme {
    return Object.hasOwn(palettes, theme)
}

export function pixelIconUrl(theme?: string) {
    return theme && isBrandTheme(theme) && theme !== "dark"
        ? `/brand-icons/${theme}.svg`
        : "/favicon.svg"
}

export function renderPixelIcon(theme: BrandTheme) {
    const [plate, stems, staircase] = palettes[theme]
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="2" y="2" width="60" height="60" rx="9" fill="${plate}"/><path fill="${stems}" d="M11 14h9v36h-9zM44 14h9v36h-9z"/><path fill="${staircase}" d="M20 14h8v9h8v9h8v18h-8v-9h-8v-9h-8z"/></svg>`
}
