import { ContactForm } from "@/components/contact/ContactForm"

export default function ContactPage() {
    return (
        <div className="container max-w-2xl py-20">
            <div className="mb-10 text-center">
                <h1 className="font-heading text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1]">
                    Get in Touch
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    Have a project in mind or just want to say hi? I'd love to hear from you.
                </p>
            </div>
            <div className="rounded-xl border bg-card text-card-foreground shadow p-6 md:p-10">
                <ContactForm />
            </div>
        </div>
    )
}
