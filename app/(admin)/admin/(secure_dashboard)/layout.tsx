import { AdminSidebar } from "@/components/admin/Sidebar"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { AdminTopbar } from "@/components/admin/AdminTopbar"

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
        <div className="admin-workspace flex min-h-screen w-full flex-col bg-muted/20 lg:flex-row">
            <AdminSidebar />
            <div className="flex min-w-0 flex-1 flex-col">
                <AdminTopbar />
                <main className="admin-content min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
                    <div className="mx-auto w-full max-w-[1440px]">{children}</div>
                </main>
            </div>
        </div>
    )
}
