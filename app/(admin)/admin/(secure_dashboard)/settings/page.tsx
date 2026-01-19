"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import axios from "axios"
import { toast } from "sonner"
import { Loader2, Save } from "lucide-react"
import { useSiteSettings } from "@/components/providers/site-settings-provider"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageUpload } from "@/components/ui/image-upload"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form"

interface SettingsFormValues {
    siteName: string
    siteDescription: string
    name: string
    title: string
    bio: string
    avatar: string
    heroImage: string
    email: string
    location: string
    resumeUrl: string
    githubUrl: string
    linkedinUrl: string
    twitterUrl: string
}

export default function AdminSettingsPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const { refetch } = useSiteSettings()

    const form = useForm<SettingsFormValues>({
        defaultValues: {
            siteName: "",
            siteDescription: "",
            name: "",
            title: "",
            bio: "",
            avatar: "",
            heroImage: "",
            email: "",
            location: "",
            resumeUrl: "",
            githubUrl: "",
            linkedinUrl: "",
            twitterUrl: "",
        },
    })

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            const res = await axios.get("/api/settings")
            form.reset({
                siteName: res.data.siteName || "",
                siteDescription: res.data.siteDescription || "",
                name: res.data.name || "",
                title: res.data.title || "",
                bio: res.data.bio || "",
                avatar: res.data.avatar || "",
                heroImage: res.data.heroImage || "",
                email: res.data.email || "",
                location: res.data.location || "",
                resumeUrl: res.data.resumeUrl || "",
                githubUrl: res.data.githubUrl || "",
                linkedinUrl: res.data.linkedinUrl || "",
                twitterUrl: res.data.twitterUrl || "",
            })
        } catch (error) {
            toast.error("Failed to load settings")
        } finally {
            setIsLoading(false)
        }
    }

    const onSubmit = async (values: SettingsFormValues) => {
        setIsSaving(true)
        try {
            await axios.put("/api/settings", values)
            await refetch()
            toast.success("Settings saved successfully")
        } catch (error) {
            toast.error("Failed to save settings")
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Site Settings</h1>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Site Branding Card - Full Width */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Site Branding</CardTitle>
                            <CardDescription>Configure your website name and description</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="siteName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Site Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="PORTX" {...field} />
                                            </FormControl>
                                            <FormDescription>Displayed in header and browser tab</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="siteDescription"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Site Description</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Personal portfolio website" {...field} />
                                            </FormControl>
                                            <FormDescription>Used for SEO meta description</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="heroImage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Hero Background Image</FormLabel>
                                        <FormControl>
                                            <ImageUpload value={field.value} onChange={field.onChange} />
                                        </FormControl>
                                        <FormDescription>Background image for the hero section on homepage</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Profile Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile</CardTitle>
                                <CardDescription>Your public profile information</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="avatar"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Avatar</FormLabel>
                                            <FormControl>
                                                <ImageUpload value={field.value} onChange={field.onChange} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John Doe" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Job Title</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Full Stack Developer" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="location"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Location</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Bangkok, Thailand" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Public Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="hello@example.com" {...field} />
                                            </FormControl>
                                            <FormDescription>Shown on the About page</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Social Links Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Social Links</CardTitle>
                                <CardDescription>Your social media profiles</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="githubUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>GitHub URL</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://github.com/username" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="linkedinUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>LinkedIn URL</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://linkedin.com/in/username" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="twitterUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Twitter URL</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://twitter.com/username" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="resumeUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Resume URL</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://..." {...field} />
                                            </FormControl>
                                            <FormDescription>Link to your resume/CV file</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Bio Card - Full Width */}
                    <Card>
                        <CardHeader>
                            <CardTitle>About Me</CardTitle>
                            <CardDescription>Tell visitors about yourself</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FormField
                                control={form.control}
                                name="bio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bio (Markdown supported)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Write about yourself, your experience, interests..."
                                                className="min-h-[200px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                            ) : (
                                <><Save className="mr-2 h-4 w-4" /> Save Settings</>
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
