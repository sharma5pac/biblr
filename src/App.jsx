import { useState, useEffect, Suspense, lazy } from 'react'
// import { IntroScreen } from './components/onboarding/IntroScreen'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'

import { Layout } from './components/layout/Layout'
import './index.css'

// Lazy Loading Components
import { Hero } from './components/home/Hero'

// Lazy Loading Components
// Hero is now eager loaded for instant first paint
const BibleReader = lazy(() => import('./components/reader/BibleReader').then(module => ({ default: module.BibleReader })))
const AudioBiblePage = lazy(() => import('./components/audio/AudioBiblePage').then(module => ({ default: module.AudioBiblePage })))
const AIStudyPage = lazy(() => import('./components/ai/AIStudyPage').then(module => ({ default: module.AIStudyPage })))
const SettingsPage = lazy(() => import('./components/settings/SettingsPage').then(module => ({ default: module.SettingsPage })))
const BookmarksPage = lazy(() => import('./components/bookmarks/BookmarksPage').then(module => ({ default: module.BookmarksPage })))
const SearchPage = lazy(() => import('./components/search/SearchPage').then(module => ({ default: module.SearchPage })))
const Onboarding = lazy(() => import('./components/onboarding/Onboarding').then(module => ({ default: module.Onboarding })))
const PrivacyPolicy = lazy(() => import('./components/legal/PrivacyPolicy').then(module => ({ default: module.PrivacyPolicy })))
const TermsOfService = lazy(() => import('./components/legal/TermsOfService').then(module => ({ default: module.TermsOfService })))


const DailyManna = lazy(() => import('./components/daily/DailyManna').then(module => ({ default: module.DailyManna })))


const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <Loader2 className="w-8 h-8 text-bible-gold animate-spin" />
  </div>
)

function App() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  // Intro screen removed per user request for simpler/faster launch
  // const [showIntro, setShowIntro] = useState(true)

  useEffect(() => {
    // Check onboarding status
    const hasOnboarded = localStorage.getItem('lumina_onboarding_completed')
    if (!hasOnboarded) {
      setShowOnboarding(true)
    }
  }, [])

  return (
    <>
      <AnimatePresence>
        {/* Intro removed */}
      </AnimatePresence>

      {showOnboarding && (
        <Suspense fallback={null}>
          <Onboarding onComplete={() => setShowOnboarding(false)} />
        </Suspense>
      )}

      {/* Main App Layout */}
      {!showOnboarding && (
        <BrowserRouter>
          <Layout>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Hero />} />
                <Route path="/read" element={<BibleReader />} />
                <Route path="/audio" element={<AudioBiblePage />} />
                <Route path="/study" element={<AIStudyPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/bookmarks" element={<BookmarksPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/manna" element={<DailyManna />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
              </Routes>
            </Suspense>
          </Layout>
        </BrowserRouter>
      )}
    </>
  )
}

export default App
