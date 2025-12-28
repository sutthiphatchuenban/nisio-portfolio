"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sun, Moon, Gamepad2, Zap, Flower2 } from "lucide-react"

const themes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "lol", label: "League of Legends", icon: Gamepad2 },
    { value: "cyberpunk", label: "Cyberpunk", icon: Zap },
    { value: "sakura", label: "Sakura", icon: Flower2 },
]

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <Button variant="ghost" size="icon" disabled>
                <Sun className="h-5 w-5" />
            </Button>
        )
    }

    const currentTheme = themes.find(t => t.value === theme) || themes[0]
    const CurrentIcon = currentTheme.icon

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <CurrentIcon className="h-5 w-5" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {themes.map((t) => (
                    <DropdownMenuItem
                        key={t.value}
                        onClick={() => setTheme(t.value)}
                        className={theme === t.value ? "bg-accent" : ""}
                    >
                        <t.icon className="mr-2 h-4 w-4" />
                        {t.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
