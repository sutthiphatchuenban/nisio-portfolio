// Public SearXNG instances are independent services; search queries are sent to them.
const instances = ["https://search.lumy.live", "https://etsi.me"]

export async function searchWeb(query: string) {
    for (const instance of instances) {
        try {
            const url = new URL("/search", instance)
            url.searchParams.set("q", query)
            url.searchParams.set("format", "json")
            const response = await fetch(url, {headers:{Accept:"application/json", "User-Agent":"nisio-admin-agent/1.0"}, redirect:"error", signal:AbortSignal.timeout(6000)})
            if (!response.ok) continue
            const data = await response.json()
            if (!Array.isArray(data.results)) continue
            const results = data.results.flatMap((item: {title?:unknown;url?:unknown;content?:unknown}) => {
                if (typeof item.url !== "string" || typeof item.title !== "string") return []
                try { if (!["https:", "http:"].includes(new URL(item.url).protocol)) return [] } catch { return [] }
                return [{title:item.title.slice(0,300), url:item.url.slice(0,2048), description:typeof item.content === "string" ? item.content.slice(0,1000) : ""}]
            }).slice(0, 5)
            if (results.length) return {results}
        } catch { /* Try the next instance. */ }
    }
    throw new Error("Free web search is temporarily unavailable. Please try again later.")
}
