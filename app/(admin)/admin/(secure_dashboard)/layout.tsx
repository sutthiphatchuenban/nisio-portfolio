import { AdminSidebar } from "@/components/admin/Sidebar"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
        redirect('/admin/login')
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40 md:flex-row">
            <AdminSidebar />
            <div className="flex flex-col flex-1 sm:gap-4 sm:py-4">
                <main className="p-4 sm:px-6 sm:py-0 md:gap-8 flex-1">
                    {children}
                </main>
            </div>
        </div>
    )
}
