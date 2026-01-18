// Analytics Service
// In a real app, this would connect to Google Analytics 4, Firebase Analytics, or Mixpanel

export const verifyAnalytics = () => {
    // console.log('Analytics initialized')
}

export const logEvent = (eventName, params = {}) => {
    // Log to console in development
    if (import.meta.env.DEV) {
        console.log(`[Analytics] ${eventName}`, params)
        return
    }

    // Production: Send to analytics provider
    // Example: window.gtag('event', eventName, params)
    try {
        if (window.gtag) {
            window.gtag('event', eventName, params)
        }
    } catch (e) {
        console.error('Analytics error:', e)
    }
}

export const logPageView = (pageName) => {
    logEvent('page_view', { page_title: pageName, page_location: window.location.href })
}

// Built-in events
export const AnalyticsEvents = {
    READ_CHAPTER: 'read_chapter',
    PLAY_AUDIO: 'play_audio',
    SHARE_VERSE: 'share_verse',
    SAVE_BOOKMARK: 'save_bookmark',
    USE_AI_INSIGHT: 'use_ai_insight',
    POST_PRAYER: 'post_prayer',
    JOIN_GROUP: 'join_group'
}
