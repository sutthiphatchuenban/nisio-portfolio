"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import {
    Users,
    Eye,
    MessageSquare,
    Layout,
    TrendingUp,
    Clock,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react"
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from "recharts"
import { format } from "date-fns"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface DashboardData {
    stats: {
        totalVisits: number
        uniqueVisitors: number
        avgSessionDuration: number
        bounceRate: number
        projectCount: number
        unreadMessages: number
    }
    topPages: { path: string; views: number }[]
    recentMessages: any[]
    recentProjects: any[]
    dailyStats: { date: string; views: number }[]
}

export default function AdminDashboard() {
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get("/api/analytics/overview")
                setData(res.data)
            } catch (error) {
                console.error("Failed to fetch dashboard data", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading Dashboard...</div>
    }

    if (!data) return <div>Failed to load data</div>

    const statsCards = [
        {
            title: "Total Views",
            value: data.stats.totalVisits.toLocaleString(),
            icon: Eye,
            desc: "All time page views",
            trend: "+12%", // Mock trend
            trendUp: true
        },
        {
            title: "Unique Visitors",
            value: data.stats.uniqueVisitors.toLocaleString(),
            icon: Users,
            desc: "Distinct users",
            trend: "+5%",
            trendUp: true
        },
        {
            title: "New Messages",
            value: data.stats.unreadMessages,
            icon: MessageSquare,
            desc: "Unread contacts",
            trend: data.stats.unreadMessages > 0 ? "Action needed" : "All clear",
            trendUp: data.stats.unreadMessages === 0
        },
        {
            title: "Total Projects",
            value: data.stats.projectCount,
            icon: Layout,
            desc: "Portfolio items",
            trend: "Active",
            trendUp: true
        }
    ]

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
                <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="hidden sm:flex">Last 30 Days</Badge>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statsCards.map((stat, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground flex items-center mt-1">
                                {stat.trendUp ? (
                                    <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                                ) : (
                                    <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
                                )}
                                <span className={stat.trendUp ? "text-green-500" : "text-red-500"}>
                                    {stat.trend}
                                </span>
                                <span className="ml-1 text-muted-foreground opacity-70">
                                    {stat.desc}
                                </span>
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Charts Area */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Traffic Chart (Col span 4) */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Traffic Overview</CardTitle>
                        <CardDescription>
                            Daily page views for the past 30 days.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px] w-full" style={{ minHeight: 300, minWidth: 0 }}>
                            <ResponsiveContainer width="100%" height={300} minWidth={200}>
                                <AreaChart data={data.dailyStats}>
                                    <defs>
                                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="date"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(str) => {
                                            const date = new Date(str);
                                            return `${date.getDate()}/${date.getMonth() + 1}`;
                                        }}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value}`}
                                    />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="views"
                                        stroke="#8884d8"
                                        fillOpacity={1}
                                        fill="url(#colorViews)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Top Pages & Recent Messages (Col span 3) */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Messages</CardTitle>
                        <CardDescription>
                            Latest inquiries from your contact form.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[300px] pr-4">
                            <div className="space-y-4">
                                {data.recentMessages.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-8">No messages yet.</p>
                                ) : (
                                    data.recentMessages.map((msg, i) => (
                                        <div key={i} className="flex items-start space-x-4 border-b pb-4 last:border-0">
                                            <Avatar className="h-9 w-9">
                                                <AvatarFallback>{msg.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium leading-none">{msg.name}</p>
                                                <p className="text-xs text-muted-foreground">{msg.email}</p>
                                                <p className="text-sm text-foreground/80 mt-1 line-clamp-2">
                                                    {msg.message}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground pt-1">
                                                    {format(new Date(msg.createdAt), 'PPpp')}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Row: Top Pages & Projects */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Top Pages</CardTitle>
                        <CardDescription>Most visited pages on your portfolio.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px] w-full" style={{ minHeight: 250, minWidth: 0 }}>
                            <ResponsiveContainer width="100%" height={250} minWidth={200}>
                                <BarChart data={data.topPages} layout="vertical" margin={{ left: 20 }}>
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="path"
                                        type="category"
                                        width={100}
                                        tick={{ fontSize: 12 }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Bar dataKey="views" fill="#adfa1d" radius={[0, 4, 4, 0]} barSize={20} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Projects Updates</CardTitle>
                        <CardDescription>
                            Latest changes to your content.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {data.recentProjects.map(p => (
                                <div key={p.id} className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="font-medium text-sm">{p.title}</p>
                                        <p className="text-xs text-muted-foreground">Updated: {format(new Date(p.updatedAt), 'MMM d, h:mm a')}</p>
                                    </div>
                                    <Badge variant={p.status === 'published' ? 'default' : 'secondary'}>
                                        {p.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
