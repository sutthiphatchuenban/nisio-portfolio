"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useSiteSettings } from "@/components/providers/site-settings-provider"
import { ArrowRight, ChevronDown } from "lucide-react"

// Typing Text Component
function TypingText({ 
  texts, 
  className 
}: { 
  texts: string[]
  className?: string 
}) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [currentText, setCurrentText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const text = texts[currentTextIndex]
    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          setCurrentText(text.slice(0, currentText.length + 1))
          if (currentText === text) {
            setTimeout(() => setIsDeleting(true), 2000)
          }
        } else {
          setCurrentText(text.slice(0, currentText.length - 1))
          if (currentText === "") {
            setIsDeleting(false)
            setCurrentTextIndex((prev) => (prev + 1) % texts.length)
          }
        }
      },
      isDeleting ? 50 : 100
    )

    return () => clearTimeout(timeout)
  }, [currentText, isDeleting, currentTextIndex, texts])

  return (
    <span className={className}>
      {currentText}
      <span className="inline-block w-[3px] h-[1em] bg-primary ml-1 animate-pulse" />
    </span>
  )
}

// Main Hero Component
export default function AnimatedHero() {
  const { settings } = useSiteSettings()
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollY, setScrollY] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })

  // Handle scroll for parallax effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    
    setIsVisible(true)
    
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Mouse tracking for spotlight
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setMousePosition({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      })
    }
  }, [])

  // Calculate parallax values
  const parallaxY = scrollY * 0.3
  const opacity = Math.max(0, 1 - scrollY / 400)
  const scale = Math.max(0.9, 1 - scrollY / 2000)

  const typingTexts = [
    "Full Stack Developer",
    "UI/UX Designer",
    "Creative Problem Solver",
    "Open Source Enthusiast",
  ]

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ 
        opacity,
        transform: `scale(${scale})`,
      }}
      onMouseMove={handleMouseMove}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000"
        style={{
          backgroundImage: `url('${settings?.heroImage || '/hero_bg.jpg'}')`,
          transform: `scale(1.1) translateY(${scrollY * 0.05}px)`,
        }}
      />
      
      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-background/60" />
      
      {/* Subtle Mouse Spotlight */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(var(--primary-rgb, 59, 130, 246), 0.08) 0%, transparent 50%)`,
        }}
      />

      {/* Hero Content */}
      <div 
        className="relative z-10 container flex flex-col items-center gap-6 text-center px-4"
        style={{ transform: `translateY(${parallaxY}px)` }}
      >
        {/* Main Heading */}
        <div
          className={`max-w-4xl space-y-2 transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-primary font-medium tracking-wider uppercase text-sm mb-4">
            Welcome to my portfolio
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
            Building Digital
            <br />
            <span className="hero-gradient">Experiences</span>
            <br />
            That Matter
          </h1>
        </div>

        {/* Typing Subtitle */}
        <p
          className={`text-xl sm:text-2xl h-8 transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <TypingText 
            texts={typingTexts}
            className="text-primary font-medium"
          />
        </p>

        {/* Description */}
        <p
          className={`max-w-xl text-muted-foreground text-lg leading-relaxed transition-all duration-1000 delay-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}
        >
          {settings?.bio || "I craft modern web applications with precision, creativity, and attention to detail. Let's create something amazing together."}
        </p>

        {/* CTA Buttons */}
        <div
          className={`flex flex-col sm:flex-row gap-4 mt-4 transition-all duration-1000 delay-900 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}
        >
          <Link href="/projects">
            <Button 
              size="lg" 
              className="group rounded-full px-8 py-6 text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/25"
            >
              View Projects
              <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/contact">
            <Button 
              variant="outline" 
              size="lg" 
              className="rounded-full px-8 py-6 text-lg font-semibold transition-all duration-300 hover:scale-105"
            >
              Get in Touch
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div
          className={`grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-border/30 w-full max-w-lg transition-all duration-1000 delay-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}
        >
          {[
            { value: "5+", label: "Years Experience" },
            { value: "50+", label: "Projects Done" },
            { value: "100%", label: "Satisfaction" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer transition-all duration-1000 delay-1200 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={() => {
          window.scrollTo({ top: window.innerHeight, behavior: "smooth" })
        }}
      >
        <span className="text-xs text-muted-foreground uppercase tracking-wider">Scroll</span>
        <div className="animate-bounce">
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>
    </section>
  )
}
