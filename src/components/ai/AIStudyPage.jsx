import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, ArrowLeft, BookOpen, MessageCircle, Lightbulb, Share2 } from 'lucide-react'
import { Button } from '../ui/Button'

export function AIStudyPage() {
    const location = useLocation()
    const navigate = useNavigate()
    const { verseReference, verseText } = location.state || {
        verseReference: "Genesis 1:1",
        verseText: "In the beginning God created the heaven and the earth." // Fallback
    }

    const [isThinking, setIsThinking] = useState(true)
    const [response, setResponse] = useState("")

    // Simulated AI Streaming Effect
    useEffect(() => {
        const fullResponse = `Here is the deeper spiritual meaning of **${verseReference}**:

### 📜 Historical Context
This verse establishes the foundational truth of the Bible: God is pre-existent and the uncaused Cause of everything. Written by Moses, it challenged the ancient Near Eastern creation myths that featured warring gods and chaos.

### 💡 Key Insights
*   **"In the beginning"**: Time itself is a creation of God.
*   **"God (Elohim)"**: The plural form suggests the majesty (or Trinity) of God acting in unity.
*   **"Created (Bara)"**: A verb used only of God, meaning to create something out of nothing (*ex nihilo*).

### 🌿 Life Application
Because God created the heavens and the earth, He has authority over every detail of your life. When you feel "without form and void" like the early earth, remember that the same Spirit is ready to hover over your chaos and bring forth light and order.`

        let i = 0
        setIsThinking(true)
        setResponse("")

        const timer = setTimeout(() => {
            setIsThinking(false)
            const interval = setInterval(() => {
                setResponse(fullResponse.substring(0, i))
                i++
                if (i > fullResponse.length) clearInterval(interval)
            }, 10) // Typing speed
            return () => clearInterval(interval)
        }, 1500) // Thinking delay

        return () => clearTimeout(timer)
    }, [verseReference])

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 text-slate-400 hover:text-white">
                <ArrowLeft className="w-4 h-4" /> Back to Reader
            </Button>

            {/* Selected Verse Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass border-l-4 border-bible-gold p-6 rounded-r-xl"
            >
                <div className="flex items-center gap-2 text-bible-gold mb-2 font-medium">
                    <BookOpen className="w-4 h-4" />
                    <span>{verseReference}</span>
                </div>
                <p className="text-xl md:text-2xl font-serif leading-relaxed text-white">
                    "{verseText}"
                </p>
            </motion.div>

            {/* AI Analysis Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-dark rounded-2xl p-6 md:p-8 relative overflow-hidden min-h-[400px]"
            >
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-bible-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-bible-gold to-yellow-600 flex items-center justify-center shadow-lg shadow-bible-gold/20">
                        <Sparkles className="w-5 h-5 text-slate-900" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Lumina AI Assistant</h2>
                        <p className="text-xs text-slate-400">Theological & Contextual Analysis</p>
                    </div>
                </div>

                {isThinking ? (
                    <div className="space-y-4 animate-pulse">
                        <div className="h-4 bg-white/10 rounded w-3/4" />
                        <div className="h-4 bg-white/10 rounded w-1/2" />
                        <div className="h-4 bg-white/10 rounded w-5/6" />
                    </div>
                ) : (
                    <div className="prose prose-invert max-w-none prose-headings:text-bible-gold prose-p:text-slate-300 prose-p:leading-relaxed">
                        <div dangerouslySetInnerHTML={{ __html: response.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    </div>
                )}

                {!isThinking && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-8 pt-6 border-t border-white/10 flex gap-4"
                    >
                        <Button className="gap-2 glass-gold">
                            <MessageCircle className="w-4 h-4" /> Ask Follow-up
                        </Button>
                        <Button variant="ghost" className="gap-2">
                            <Share2 className="w-4 h-4" /> Share Insight
                        </Button>
                    </motion.div>
                )}
            </motion.div>
        </div>
    )
}
