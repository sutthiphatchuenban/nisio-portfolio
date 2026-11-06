import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { SettingsPreview } from "@/components/admin/SettingsPreview"

export default async function SettingsPreviewPage() {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== "ADMIN") redirect("/admin/login")
    return <SettingsPreview />
}
