"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { 
    Sparkles, Code2, Laptop, Smartphone, Play, 
    Terminal, Copy, Check, AlertCircle, Eye, 
    Layers, Zap, RefreshCw, Lock, ExternalLink, Brain
} from "lucide-react"

const templates = [
    {
        id: "Modern SaaS",
        name: "SaaS Landing",
        desc: "Sleek dark theme with gradients and modern animations.",
        icon: Zap,
        color: "from-blue-500 to-indigo-600"
    },
    {
        id: "Cyberpunk Retro",
        name: "Cyberpunk Grid",
        desc: "Neon highlights, scanlines, and futuristic design.",
        icon: Terminal,
        color: "from-pink-500 to-purple-600"
    },
    {
        id: "Glassmorphism",
        name: "Glassmorphism",
        desc: "Frosty panels, vivid backgrounds, premium feel.",
        icon: Layers,
        color: "from-emerald-500 to-teal-600"
    },
    {
        id: "Minimalist Blog",
        name: "Clean Developer",
        desc: "Minimal aesthetic, high readability, neat grids.",
        icon: Code2,
        color: "from-amber-500 to-orange-600"
    }
]

const models = [
    {
        id: "qwen/qwen3.5-122b-a10b",
        name: "Qwen 3.5 122B (Default)",
        desc: "Highly capable multi-lingual model by Alibaba."
    },
    {
        id: "openai/gpt-oss-120b",
        name: "GPT-OSS 120B",
        desc: "Open source alignment model optimized for coding."
    }
]

export default function LabPage() {
    const [prompt, setPrompt] = useState("")
    const [selectedTemplate, setSelectedTemplate] = useState("Modern SaaS")
    const [html, setHtml] = useState("")
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)
    const [deviceMode, setDeviceMode] = useState<"desktop" | "mobile">("desktop")
    const [activeTab, setActiveTab] = useState<"preview" | "code">("preview")
    const [remaining, setRemaining] = useState<number | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [selectedModel, setSelectedModel] = useState("qwen/qwen3.5-122b-a10b")

    // Load remaining attempts limit status
    useEffect(() => {
        fetch("/api/lab/status")
            .then(res => res.json())
            .then(data => {
                if (data.remaining !== undefined) {
                    setRemaining(data.remaining)
                }
            })
            .catch(err => console.error("Failed to load status:", err))
    }, [])


    const handleGenerate = async () => {
        if (!prompt.trim() || loading || (remaining !== null && remaining <= 0)) return

        setLoading(true)
        setError(null)
        setHtml("")


        try {
            const res = await fetch("/api/lab/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt, template: selectedTemplate, model: selectedModel })
            })

            const data = await res.json()
            if (res.ok && data.html) {
                setHtml(data.html)
                setActiveTab("preview")
                // Refetch remaining count to stay sync
                const statusRes = await fetch("/api/lab/status")
                const statusData = await statusRes.json()
                if (statusData.remaining !== undefined) {
                    setRemaining(statusData.remaining)
                }
            } else {
                const detailedError = data.details ? `${data.error}: ${data.details}${data.cause ? ` (Cause: ${data.cause})` : ''}` : null
                setError(detailedError || data.error || "Failed to generate page. Please check API Key or try again.")
            }
        } catch (err) {
            setError("Network error. Failed to generate page.")
        } finally {
            setLoading(false)
        }
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(html)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleOpenNewTab = () => {
        if (!html) return
        const blob = new Blob([html], { type: "text/html" })
        const url = URL.createObjectURL(blob)
        window.open(url, "_blank")
    }

    return (
        <section className="py-16 md:py-20">
            <div className="container">
                {/* Page Header */}
                <div className="max-w-2xl mb-12">
                    <div className="flex items-center gap-2 text-primary mb-3">
                        <Sparkles className="w-5 h-5" />
                        <span className="text-xs font-semibold uppercase tracking-widest">Experimental Lab</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
                        AI Web Sandbox
                    </h1>
                    <p className="text-muted-foreground leading-relaxed">
                        Type a prompt, pick a design style, and watch the AI model build a fully working, responsive web page live. 
                        You have <span className="font-bold text-foreground">{remaining === null ? "..." : remaining}</span> generation{remaining !== 1 ? "s" : ""} remaining.
                    </p>
                </div>

                {/* Workspace */}
                <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">
                    
                    {/* ── Left Sidebar ── */}
                    <div className="space-y-5">
                        {/* Model Selector */}
                        <div className="rounded-xl border bg-card p-4 space-y-3">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Brain className="w-3.5 h-3.5" /> Choose AI Model
                            </h2>
                            <div className="space-y-2">
                                {models.map((m) => {
                                    const isSelected = selectedModel === m.id
                                    return (
                                        <button
                                            key={m.id}
                                            onClick={() => setSelectedModel(m.id)}
                                            className={`w-full flex flex-col text-left p-3 rounded-lg border transition-all duration-200 ${
                                                isSelected 
                                                    ? "border-primary bg-primary/5 ring-1 ring-primary/30" 
                                                    : "border-border/60 hover:border-primary/40 bg-background"
                                            }`}
                                        >
                                            <span className="text-xs font-bold leading-tight">{m.name}</span>
                                            <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
                                                {m.desc}
                                            </p>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Template Picker */}
                        <div className="rounded-xl border bg-card p-4 space-y-3">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Layers className="w-3.5 h-3.5" /> Choose Style
                            </h2>
                            <div className="grid grid-cols-2 gap-2">
                                {templates.map((tpl) => {
                                    const Icon = tpl.icon
                                    const isSelected = selectedTemplate === tpl.id
                                    return (
                                        <button
                                            key={tpl.id}
                                            onClick={() => setSelectedTemplate(tpl.id)}
                                            className={`flex flex-col text-left p-3 rounded-lg border transition-all duration-200 ${
                                                isSelected 
                                                    ? "border-primary bg-primary/5 ring-1 ring-primary/30" 
                                                    : "border-border/60 hover:border-primary/40 bg-background"
                                            }`}
                                        >
                                            <div className={`p-1.5 rounded-md bg-gradient-to-br ${tpl.color} text-white w-fit mb-1.5`}>
                                                <Icon className="w-3.5 h-3.5" />
                                            </div>
                                            <span className="text-xs font-bold leading-tight">{tpl.name}</span>
                                            <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug line-clamp-2">
                                                {tpl.desc}
                                            </p>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Prompt */}
                        <div className="rounded-xl border bg-card p-4 space-y-3">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Code2 className="w-3.5 h-3.5" /> Describe Your Website
                            </h2>
                            <Textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="e.g. A photographer portfolio with dark mode, image gallery modal, and filter buttons..."
                                rows={4}
                                disabled={loading || (remaining !== null && remaining <= 0)}
                                className="resize-none text-sm"
                            />
                            
                            {remaining !== null && remaining <= 0 && (
                                <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 p-2.5 rounded-lg font-medium">
                                    <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                                    You've used all 3 sandbox generations.
                                </div>
                            )}

                            <Button
                                onClick={handleGenerate}
                                disabled={loading || !prompt.trim() || (remaining !== null && remaining <= 0)}
                                className="w-full h-10 text-xs uppercase font-semibold tracking-wider"
                            >
                                {loading ? (
                                    <>
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin mr-2" />
                                        Assembling...
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-3.5 h-3.5 fill-current mr-2" />
                                        Run AI Generation
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* ── Right Preview Panel ── */}
                    <div className="space-y-3">
                        {/* Toolbar */}
                        <div className="flex items-center justify-between rounded-xl border bg-card/80 backdrop-blur px-3 py-2">
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setActiveTab("preview")}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                                        activeTab === "preview" 
                                            ? "bg-primary text-primary-foreground" 
                                            : "text-muted-foreground hover:bg-muted"
                                    }`}
                                >
                                    <Eye className="w-3.5 h-3.5" /> Preview
                                </button>
                                <button
                                    onClick={() => setActiveTab("code")}
                                    disabled={!html}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-30 ${
                                        activeTab === "code" 
                                            ? "bg-primary text-primary-foreground" 
                                            : "text-muted-foreground hover:bg-muted"
                                    }`}
                                >
                                    <Code2 className="w-3.5 h-3.5" /> Code
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                {activeTab === "preview" && (
                                    <div className="hidden sm:flex items-center gap-0.5 border rounded-lg p-0.5 bg-muted/30">
                                        <button
                                            onClick={() => setDeviceMode("desktop")}
                                            className={`p-1.5 rounded-md transition-colors ${
                                                deviceMode === "desktop" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"
                                            }`}
                                        >
                                            <Laptop className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => setDeviceMode("mobile")}
                                            className={`p-1.5 rounded-md transition-colors ${
                                                deviceMode === "mobile" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"
                                            }`}
                                        >
                                            <Smartphone className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                )}
                                {html && (
                                    <>
                                        <Button size="sm" variant="outline" onClick={handleCopy} className="h-7 text-xs gap-1.5">
                                            {copied 
                                                ? <><Check className="w-3 h-3 text-green-500" /> Copied</> 
                                                : <><Copy className="w-3 h-3" /> Copy</>
                                            }
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={handleOpenNewTab} className="h-7 text-xs gap-1.5">
                                            <ExternalLink className="w-3 h-3" /> Open Full
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Preview Area */}
                        <div className="rounded-xl border overflow-hidden bg-card/30 relative" style={{ minHeight: 520 }}>
                            {/* Loading Terminal */}
                            {loading && (
                                <div className="absolute inset-0 z-20 bg-background/80 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center space-y-4">
                                    <div className="relative flex items-center justify-center">
                                        <div className="absolute w-12 h-12 border-4 border-primary/20 rounded-full animate-pulse" />
                                        <div className="w-12 h-12 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
                                        <Sparkles className="absolute w-5 h-5 text-primary animate-pulse" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-base font-extrabold tracking-tight">Assembling Website...</h3>
                                        <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                                            The AI is compiling HTML and styling with Tailwind. This may take up to 30 seconds...
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Error */}
                            {error && !loading && (
                                <div className="flex flex-col items-center justify-center p-10 text-center space-y-3" style={{ minHeight: 520 }}>
                                    <div className="p-3 bg-destructive/10 text-destructive rounded-full">
                                        <AlertCircle className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-base font-bold">Assembly Error</h3>
                                    <p className="text-sm text-muted-foreground max-w-md">{error}</p>
                                </div>
                            )}

                            {/* Empty State */}
                            {!html && !loading && !error && (
                                <div className="flex flex-col items-center justify-center p-10 text-center space-y-3" style={{ minHeight: 520 }}>
                                    <div className="p-3 border rounded-2xl bg-background shadow-sm">
                                        <Sparkles className="w-7 h-7 text-primary" />
                                    </div>
                                    <h3 className="text-base font-extrabold">Workbench Empty</h3>
                                    <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                                        Choose a template, write a prompt, and hit Generate to see your page appear here.
                                    </p>
                                </div>
                            )}

                            {/* Preview iframe */}
                            {html && !loading && !error && activeTab === "preview" && (
                                <div className="flex justify-center p-3 bg-muted/20" style={{ minHeight: 520 }}>
                                    <div 
                                        className={`border bg-white rounded-lg overflow-hidden shadow-xl flex flex-col transition-all duration-300 ${
                                            deviceMode === "mobile" ? "w-[375px]" : "w-full"
                                        }`}
                                        style={{ height: deviceMode === "mobile" ? 667 : 500 }}
                                    >
                                        {/* Browser chrome */}
                                        <div className="bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 border-b flex items-center gap-1.5 shrink-0">
                                            <div className="w-2 h-2 rounded-full bg-red-400" />
                                            <div className="w-2 h-2 rounded-full bg-amber-400" />
                                            <div className="w-2 h-2 rounded-full bg-green-400" />
                                            <span className="text-[10px] text-zinc-400 ml-2 truncate">
                                                sandbox.local/{selectedTemplate.toLowerCase().replace(/\s+/g, "-")}
                                            </span>
                                        </div>
                                        <iframe
                                            srcDoc={html}
                                            sandbox="allow-scripts"
                                            className="flex-1 w-full border-none bg-white"
                                            title="AI Web Preview"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Source code */}
                            {html && !loading && !error && activeTab === "code" && (
                                <div className="overflow-auto p-5 bg-zinc-950 font-mono text-xs text-zinc-300" style={{ maxHeight: 520 }}>
                                    <pre className="whitespace-pre-wrap break-all">
                                        <code>{html}</code>
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
