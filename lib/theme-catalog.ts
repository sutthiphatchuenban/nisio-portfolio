export const BASE_THEMES = [
    { id: "light", label: "Light" }, { id: "dark", label: "Dark" },
    { id: "lol", label: "League of Legends" }, { id: "cyberpunk", label: "Cyberpunk" },
] as const

// Monthly visual seasons, not claims about the dates of lunar holidays.
export const FESTIVAL_THEMES = [
    { id: "newyear", label: "New Year", month: "มกราคม", motif: "sparkles" },
    { id: "valentine", label: "Valentine", month: "กุมภาพันธ์", motif: "heart" },
    { id: "sakura", label: "Sakura", month: "มีนาคม", motif: "flower" },
    { id: "songkran", label: "Songkran", month: "เมษายน", motif: "water" },
    { id: "botanical", label: "Spring Garden", month: "พฤษภาคม", motif: "leaf" },
    { id: "pride", label: "Pride", month: "มิถุนายน", motif: "rainbow" },
    { id: "ocean", label: "Summer Ocean", month: "กรกฎาคม", motif: "waves" },
    { id: "starlight", label: "Starry Night", month: "สิงหาคม", motif: "stars" },
    { id: "harvest", label: "Autumn Harvest", month: "กันยายน", motif: "wheat" },
    { id: "halloween", label: "Halloween", month: "ตุลาคม", motif: "ghost" },
    { id: "lantern", label: "Festival of Lights", month: "พฤศจิกายน", motif: "lamp" },
    { id: "christmas", label: "Christmas", month: "ธันวาคม", motif: "tree" },
] as const
export const THEME_IDS = [...BASE_THEMES, ...FESTIVAL_THEMES].map(theme => theme.id)
export function getFestivalForDate(date = new Date()) {
    const month = Number(new Intl.DateTimeFormat("en-US", { month: "numeric", timeZone: "Asia/Bangkok" }).format(date))
    return FESTIVAL_THEMES[month - 1]
}
