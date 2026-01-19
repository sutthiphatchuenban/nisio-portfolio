"use client"

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function AnalyticsTracker() {
    const pathname = usePathname()

    useEffect(() => {
        const trackPageView = async () => {
            if (!pathname || pathname.startsWith('/admin')) return

            try {
                const sessionId = sessionStorage.getItem('sessionId') || generateSessionId()
                sessionStorage.setItem('sessionId', sessionId)

                const referrer = document.referrer || null

                await fetch('/api/analytics/track', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        pagePath: pathname,
                        pageTitle: document.title,
                        referrer,
                        sessionId,
                        duration: 0, // Will be updated on unload if needed
                    }),
                })
            } catch (error) {
                console.error('Analytics tracking failed:', error)
            }
        }

        trackPageView()
    }, [pathname])

    return null
}

function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}