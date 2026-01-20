import { useState, useEffect, Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'

import { Layout } from './components/layout/Layout'
import './index.css'

// Lazy Loading Components
const Hero = lazy(() => import('./components/home/Hero').then(module => ({ default: module.Hero })))
const BibleReader = lazy(() => import('./components/reader/BibleReader').then(module => ({ default: module.BibleReader })))
const AudioBiblePage = lazy(() => import('./components/audio/AudioBiblePage').then(module => ({ default: module.AudioBiblePage })))
const AIStudyPage = lazy(() => import('./components/ai/AIStudyPage').then(module => ({ default: module.AIStudyPage })))
const SettingsPage = lazy(() => import('./components/settings/SettingsPage').then(module => ({ default: module.SettingsPage })))
const BookmarksPage = lazy(() => import('./components/bookmarks/BookmarksPage').then(module => ({ default: module.BookmarksPage })))
const SearchPage = lazy(() => import('./components/search/SearchPage').then(module => ({ default: module.SearchPage })))
const Onboarding = lazy(() => import('./components/onboarding/Onboarding').then(module => ({ default: module.Onboarding })))
const PrivacyPolicy = lazy(() => import('./components/legal/PrivacyPolicy').then(module => ({ default: module.PrivacyPolicy })))
const TermsOfService = lazy(() => import('./components/legal/TermsOfService').then(module => ({ default: module.TermsOfService })))


const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <Loader2 className="w-8 h-8 text-bible-gold animate-spin" />
  </div>
)

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    // Check onboarding status
    const hasOnboarded = localStorage.getItem('lumina_onboarding_completed')
    if (!hasOnboarded) {
      setShowOnboarding(true)
    }

    // Simulate initial loading for intro
    const timer = setTimeout(() => setIsLoading(false), 2500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] bg-[#0a0f1a] flex flex-col items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col items-center"
            >
              <img
                src="/logo.png"
                alt="Lumina Bible"
                className="w-32 h-32 md:w-48 md:h-48 rounded-3xl shadow-2xl shadow-bible-gold/30 mb-8"
              />
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-3xl md:text-5xl font-serif font-bold text-bible-gold glow-text"
              >
                Lumina Bible App
              </motion.h1>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isLoading && showOnboarding && (
        <Suspense fallback={null}>
          <Onboarding onComplete={() => setShowOnboarding(false)} />
        </Suspense>
      )}

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
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
            </Routes>
          </Suspense>
        </Layout>
      </BrowserRouter>
    </>
  )
}

export default App
