import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ArrowLeft, BookOpen, MessageCircle, Share2, Loader2, Zap, Send, X, Bookmark, Check } from 'lucide-react'
import { Button } from '../ui/Button'
import { AIService } from '../../services/aiService'
import { BookmarkService } from '../../services/bookmarkService'

export function AIStudyPage() {
    const location = useLocation()
    const navigate = useNavigate()
    const { verseReference, verseText } = location.state || {
        verseReference: "Genesis 1:1",
        verseText: "In the beginning God created the heaven and the earth."
    }

    const [isThinking, setIsThinking] = useState(true)
    const [response, setResponse] = useState("")

    // Follow-up states
    const [showChat, setShowChat] = useState(false)
    const [chatInput, setChatInput] = useState('')
    const [chatMessages, setChatMessages] = useState([])
    const [isChatLoading, setIsChatLoading] = useState(false)
    const [showToast, setShowToast] = useState(false)
    const chatEndRef = useRef(null)

    useEffect(() => {
        async function getAnalysis() {
            setIsThinking(true)
            try {
                const insight = await AIService.getVerseInsight(verseReference, verseText)

                // Streaming effect
                let i = 0
                setIsThinking(false)
                const interval = setInterval(() => {
                    setResponse(insight.substring(0, i))
                    i += 5
                    if (i > insight.length + 5) {
                        setResponse(insight)
                        clearInterval(interval)
                    }
                }, 10)
            } catch (error) {
                setResponse("Unable to connect with Lumina AI. Please pray and try again.")
                setIsThinking(false)
            }
        }

        getAnalysis()
    }, [verseReference, verseText])

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [chatMessages])

    const handleFollowUp = async () => {
        if (!chatInput.trim()) return

        const userMsg = { role: 'user', text: chatInput }
        setChatMessages(prev => [...prev, userMsg])
        setChatInput('')
        setIsChatLoading(true)

        try {
            // Context includes the verse and the previous analysis
            const context = `Context: Verse ${verseReference}: "${verseText}". \nInitial Analysis: ${response}`
            const aiRes = await AIService.generateResponse(userMsg.text, context)

            setChatMessages(prev => [...prev, { role: 'ai', text: aiRes.text }])
        } catch (err) {
            setChatMessages(prev => [...prev, { role: 'ai', text: "Forgive me, I could not process that request. Let us focus on the Word." }])
        } finally {
            setIsChatLoading(false)
        }
    }

    const handleShare = async () => {
        const shareText = `Deep Study on ${verseReference}\n\n${response.replace(/<[^>]*>/g, '')}\n\nShared via Lumina Bible`

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Deep Study: ${verseReference}`,
                    text: shareText,
                })
            } catch (err) {
                if (err.name !== 'AbortError') {
                    navigator.clipboard.writeText(shareText)
                    alert('Study copied to clipboard!')
                }
            }
        } else {
            navigator.clipboard.writeText(shareText)
            alert('Study copied to clipboard!')
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20 pt-4 px-4 overflow-x-hidden">
            <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 text-slate-400 hover:text-white mb-2">
                <ArrowLeft className="w-4 h-4" /> Back to Reader
            </Button>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Left Column: Verse & Analysis */}
                <div className={`space-y-6 transition-all duration-500 ${showChat ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
                    {/* Selected Verse Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass border-l-4 border-bible-gold p-8 rounded-r-[2rem] shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <BookOpen className="w-24 h-24" />
                        </div>
                        <div className="flex items-center gap-3 text-bible-gold mb-4 font-black uppercase tracking-widest text-xs">
                            <div className="w-6 h-6 rounded-lg bg-bible-gold/10 flex items-center justify-center">
                                <Zap className="w-3 h-3" />
                            </div>
                            <span>{verseReference}</span>
                        </div>
                        <p className="text-2xl md:text-3xl font-serif leading-relaxed text-slate-900 dark:text-white italic">
                            "{verseText}"
                        </p>
                    </motion.div>

                    {/* AI Analysis Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-dark rounded-[3rem] p-8 md:p-12 relative overflow-hidden min-h-[400px] shadow-2xl border border-white/5"
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-bible-gold to-yellow-600 flex items-center justify-center shadow-lg shadow-bible-gold/30">
                                <Sparkles className="w-6 h-6 text-slate-900" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">Lumina Depth Analysis</h2>
                                <p className="text-[10px] text-bible-gold font-bold uppercase tracking-[0.2em] opacity-70">Gemini Powered Theology</p>
                            </div>
                        </div>

                        {isThinking ? (
                            <div className="flex flex-col items-center justify-center h-64 text-center">
                                <Loader2 className="w-12 h-12 animate-spin text-bible-gold/30 mb-6" />
                                <p className="font-serif italic text-slate-400">Consulting the ancient wisdom...</p>
                            </div>
                        ) : (
                            <div className="prose dark:prose-invert max-w-none prose-headings:text-bible-gold prose-p:text-slate-700 dark:prose-p:text-slate-200 prose-p:leading-relaxed prose-p:italic font-serif">
                                <div dangerouslySetInnerHTML={{
                                    __html: response
                                        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-bible-gold font-bold not-italic">$1</strong>')
                                        .replace(/### (.*)/g, '<h3 class="text-bible-gold font-black uppercase tracking-widest text-xs mt-8 mb-4 border-b border-white/5 pb-2">$1</h3>')
                                        .replace(/\n/g, '<br/>')
                                }} />
                            </div>
                        )}

                        {!isThinking && !showChat && (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="mt-12 pt-8 border-t border-white/5 flex flex-wrap gap-4"
                            >
                                <Button
                                    onClick={() => setShowChat(true)}
                                    className="gap-2 h-14 px-8 bg-bible-gold text-slate-900 font-black rounded-2xl shadow-xl hover:scale-105 transition-transform"
                                >
                                    <MessageCircle className="w-5 h-5" /> Ask Follow-up
                                </Button>
                                <Button
                                    onClick={() => {
                                        BookmarkService.add({
                                            type: 'insight',
                                            reference: verseReference,
                                            text: response,
                                            timestamp: Date.now()
                                        })
                                        setShowToast(true)
                                        setTimeout(() => setShowToast(false), 3000)
                                    }}
                                    className="gap-2 h-14 px-8 rounded-2xl glass border border-white/10 text-bible-gold hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    <Bookmark className="w-5 h-5" /> Save Study
                                </Button>
                                <Button onClick={handleShare} variant="ghost" className="gap-2 h-14 px-8 rounded-2xl glass border border-white/10 text-slate-400 font-bold hover:text-white transition-colors">
                                    <Share2 className="w-5 h-5" /> Share
                                </Button>
                            </motion.div>
                        )}
                    </motion.div>
                </div>

                {/* Right Column: Follow-up Chat */}
                <AnimatePresence>
                    {showChat && (
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                            className="lg:col-span-5 h-[700px] flex flex-col glass-dark rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden"
                        >
                            <header className="p-6 border-b border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-bible-gold/10 flex items-center justify-center text-bible-gold">
                                        <MessageCircle className="w-4 h-4" />
                                    </div>
                                    <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-widest">Follow-up Dialogue</h3>
                                </div>
                                <button onClick={() => setShowChat(false)} className="text-slate-500 hover:text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </header>

                            <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                                {chatMessages.length === 0 && (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                                        <Sparkles className="w-12 h-12 mb-4 text-bible-gold" />
                                        <p className="text-sm italic">"Ask, and it shall be given you; seek, and ye shall find; knock, and it shall be opened unto you."</p>
                                    </div>
                                )}
                                {chatMessages.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                            ? 'bg-bible-gold text-slate-900 rounded-tr-none font-bold'
                                            : 'bg-white dark:bg-white/5 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 rounded-tl-none italic font-serif'
                                            }`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                                {isChatLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/10">
                                            <Loader2 className="w-4 h-4 animate-spin text-bible-gold" />
                                        </div>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            <div className="p-6 border-t border-white/5">
                                <div className="flex items-center gap-2 bg-white/50 dark:bg-white/5 rounded-2xl p-2 border border-black/10 dark:border-white/10 focus-within:border-bible-gold/50 transition-colors">
                                    <input
                                        type="text"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleFollowUp()}
                                        placeholder="Ask for clarification..."
                                        className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white text-sm px-4"
                                    />
                                    <button
                                        onClick={handleFollowUp}
                                        disabled={!chatInput.trim() || isChatLoading}
                                        className="w-10 h-10 bg-bible-gold rounded-xl flex items-center justify-center text-slate-900 disabled:opacity-50"
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Toast Notification */}
                <AnimatePresence>
                    {showToast && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
                            className="fixed bottom-12 left-1/2 -translate-x-1/2 glass-dark bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl z-[60]"
                        >
                            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <Check className="w-4 h-4" />
                            </div>
                            <span className="font-bold text-sm">Study Saved to Bookmarks</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div >
    )
}


