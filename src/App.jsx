import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { Hero } from './components/home/Hero'
import { BibleReader } from './components/reader/BibleReader'
import { AudioBiblePage } from './components/audio/AudioBiblePage'
import { CommunityPage } from './components/community/CommunityPage'
import { AIStudyPage } from './components/ai/AIStudyPage'
import './index.css'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function App() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
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

      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Hero />} />
            <Route path="/read" element={<BibleReader />} />
            <Route path="/audio" element={<AudioBiblePage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/study" element={<AIStudyPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </>
  )
}

export default App
