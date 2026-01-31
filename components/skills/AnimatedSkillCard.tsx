"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import type { Skill } from "@/types"

interface AnimatedSkillCardProps {
  skill: Skill
  index?: number
}

export default function AnimatedSkillCard({ 
  skill, 
  index = 0 
}: AnimatedSkillCardProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [animatedProficiency, setAnimatedProficiency] = useState(0)
  const cardRef = useRef<HTMLDivElement>(null)

  // Intersection Observer for scroll-triggered animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -50px 0px" }
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Animate proficiency bar when visible
  useEffect(() => {
    if (isVisible) {
      const timeout = setTimeout(() => {
        setAnimatedProficiency(skill.proficiency)
      }, index * 100)
      return () => clearTimeout(timeout)
    }
  }, [isVisible, skill.proficiency, index])

  const animationDelay = index * 0.1

  // Get proficiency color based on level
  const getProficiencyColor = (level: number) => {
    if (level >= 90) return "from-emerald-500 to-emerald-400"
    if (level >= 75) return "from-blue-500 to-blue-400"
    if (level >= 60) return "from-amber-500 to-amber-400"
    return "from-slate-500 to-slate-400"
  }

  // Get proficiency label
  const getProficiencyLabel = (level: number) => {
    if (level >= 90) return "Expert"
    if (level >= 75) return "Advanced"
    if (level >= 60) return "Intermediate"
    return "Beginner"
  }

  return (
    <div
      ref={cardRef}
      className={`transition-all duration-700 ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${animationDelay}s` }}
    >
      <Card
        className="group relative overflow-hidden cursor-default border-2 border-transparent hover:border-primary/30 transition-all duration-500"
        style={{
          transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
          boxShadow: isHovered 
            ? '0 20px 40px -15px rgba(var(--primary-rgb, 59, 130, 246), 0.3)' 
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Background Glow on Hover */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"
          style={{
            background: `radial-gradient(circle at 50% 50%, rgba(var(--primary-rgb, 59, 130, 246), 0.08) 0%, transparent 70%)`,
          }}
        />

        <CardContent className="p-5 space-y-4">
          {/* Icon and Name Row */}
          <div className="flex items-center gap-4">
            {/* Icon Container */}
            <div 
              className={`relative w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden transition-all duration-500 ${
                isHovered ? 'scale-110 rotate-3' : ''
              }`}
              style={{
                background: `linear-gradient(135deg, rgba(var(--primary-rgb, 59, 130, 246), 0.1) 0%, rgba(var(--primary-rgb, 59, 130, 246), 0.05) 100%)`,
              }}
            >
              {skill.icon ? (
                <Image
                  src={skill.icon}
                  alt={skill.name}
                  width={32}
                  height={32}
                  className="object-contain transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">
                    {skill.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              {/* Pulse Ring on Hover */}
              {isHovered && (
                <div className="absolute inset-0 rounded-xl border-2 border-primary/30 animate-ping" />
              )}
            </div>

            {/* Name and Category */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg group-hover:text-primary transition-colors duration-300 truncate">
                {skill.name}
              </h3>
              {skill.category && (
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {skill.category}
                </p>
              )}
            </div>

            {/* Proficiency Badge */}
            <div 
              className={`text-2xl font-bold bg-gradient-to-r ${getProficiencyColor(skill.proficiency)} bg-clip-text text-transparent transition-all duration-500 ${
                isHovered ? 'scale-110' : ''
              }`}
            >
              {skill.proficiency}%
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${getProficiencyColor(skill.proficiency)} transition-all duration-1000 ease-out relative`}
                style={{ 
                  width: `${animatedProficiency}%`,
                  transitionDelay: `${animationDelay}s`,
                }}
              >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]" />
              </div>
            </div>

            {/* Proficiency Label */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Proficiency</span>
              <span className={`font-medium ${
                isHovered ? 'text-primary' : ''
              } transition-colors duration-300`}>
                {getProficiencyLabel(skill.proficiency)}
              </span>
            </div>
          </div>

          {/* Floating Particles on Hover */}
          {isHovered && (
            <>
              <div className="absolute top-2 right-2 w-1 h-1 rounded-full bg-primary/60 animate-ping" />
              <div 
                className="absolute top-4 right-6 w-1.5 h-1.5 rounded-full bg-primary/40 animate-ping" 
                style={{ animationDelay: '0.2s' }}
              />
              <div 
                className="absolute top-6 right-3 w-1 h-1 rounded-full bg-primary/50 animate-ping" 
                style={{ animationDelay: '0.4s' }}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
