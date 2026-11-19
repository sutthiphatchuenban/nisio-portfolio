import { renderPixelIcon } from "@/lib/pixel-brand"
import { THEME_IDS } from "@/lib/theme-catalog"

export const dynamic = "force-static"
export const dynamicParams = false

export function generateStaticParams() {
    return THEME_IDS.map(theme => ({ icon: `${theme}.svg` }))
}

export async function GET(_request: Request, { params }: { params: Promise<{ icon: string }> }) {
    const { icon } = await params
    const theme = THEME_IDS.find(id => icon === `${id}.svg`)
    if (!theme) return new Response(null, { status: 404 })

    return new Response(renderPixelIcon(theme), {
        headers: { "Content-Type": "image/svg+xml; charset=utf-8" },
    })
}
