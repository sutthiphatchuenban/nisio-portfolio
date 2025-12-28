import { Header } from "@/components/shared/Header"
import { Footer } from "@/components/shared/Footer"

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen flex-col bg-background font-sans antialiased">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    )
}
