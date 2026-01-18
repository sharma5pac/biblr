import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, BookOpen, Bookmark, Share2, Sparkles, AlertCircle, Loader2, X } from 'lucide-react'
import { Button } from '../ui/Button'
import { bibleBooks, translations } from '../../data/bibleData'
import { getChapter } from '../../services/bibleService'
import { AIService } from '../../services/aiService'
import { addBookmark } from '../bookmarks/BookmarksPage'

export function BibleReader() {
    const navigate = useNavigate()
    const [currentBook, setCurrentBook] = useState('jhn')
    const [currentChapter, setCurrentChapter] = useState(3)
    const [verses, setVerses] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [selectedVerse, setSelectedVerse] = useState(null)
    const [showBookSelector, setShowBookSelector] = useState(false)
    const [currentTranslation, setCurrentTranslation] = useState('web')
    const [fontSize, setFontSize] = useState('lg')

    // AI Insights state
    const [insightVerse, setInsightVerse] = useState(null)
    const [insightText, setInsightText] = useState('')
    const [insightLoading, setInsightLoading] = useState(false)

    const book = bibleBooks.find(b => b.id === currentBook)

    useEffect(() => {
        async function fetchContent() {
            setLoading(true)
            setError(null)
            try {
                const data = await getChapter(book.name, currentChapter, currentTranslation)
                setVerses(data.verses)
            } catch (err) {
                setError('Failed to load content. Please check your connection.')
            } finally {
                setLoading(false)
            }
        }

        if (book) {
            fetchContent()
        }
    }, [currentBook, currentChapter, currentTranslation, book])

    const goToPrevChapter = () => {
        if (currentChapter > 1) {
            setCurrentChapter(c => c - 1)
            setInsightVerse(null) // Close insight when changing chapters
        }
    }

    const goToNextChapter = () => {
        if (book && currentChapter < book.chapters) {
            setCurrentChapter(c => c + 1)
            setInsightVerse(null)
        }
    }

    const handleGetInsight = async (verseNumber) => {
        const verseObj = verses.find(v => v.verse === verseNumber)
        if (!verseObj) return

        const verseRef = `${book.name} ${currentChapter}:${verseNumber}`
        setInsightVerse(verseNumber)
        setInsightLoading(true)
        setSelectedVerse(null) // Close action panel

        try {
            const insight = await AIService.getVerseInsight(verseRef, verseObj.text)
            setInsightText(insight)
        } catch (error) {
            console.error("Failed to fetch insight", error)
            setInsightText("Unable to load insight. Please try again.")
        } finally {
            setInsightLoading(false)
        }
    }

    const handleShare = async () => {
        const shareData = {
            title: `${book.name} ${currentChapter}:${insightVerse}`,
            text: `"${verses.find(v => v.verse === insightVerse)?.text}"\n\n${insightText}`,
            url: window.location.href
        }

        try {
            if (navigator.share) {
                await navigator.share(shareData)
            } else {
                // Fallback: copy to clipboard
                await navigator.clipboard.writeText(`${shareData.title}\n\n${shareData.text}`)
                alert('Insight copied to clipboard!')
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Share failed:', error)
            }
        }
    }

    const handleSaveInsight = async () => {
        await addBookmark({
            reference: `${book.name} ${currentChapter}:${insightVerse}`,
            text: verses.find(v => v.verse === insightVerse)?.text,
            insight: insightText,
            type: 'insight'
        })
        alert('Insight saved to Bookmarks!')
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Top Navigation - Glassmorphism */}
            <div className="sticky top-16 z-40 glass-dark rounded-xl -mx-2 px-4 py-3 mb-6">
                <div className="flex items-center justify-between gap-4">
                    <button
                        onClick={() => setShowBookSelector(!showBookSelector)}
                        className="flex items-center gap-2 text-lg font-serif font-bold text-bible-gold hover:text-yellow-400 transition-colors group"
                    >
                        <div className="w-8 h-8 rounded-lg glass-gold flex items-center justify-center group-hover:scale-110 transition-transform">
                            <BookOpen className="w-4 h-4" />
                        </div>
                        {book?.name} {currentChapter}
                    </button>

                    <div className="flex items-center gap-2">
                        <select
                            value={currentTranslation}
                            onChange={(e) => setCurrentTranslation(e.target.value)}
                            className="glass rounded-lg px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-bible-gold/50 cursor-pointer bg-slate-900"
                        >
                            <option value="web">WEB (Public Domain)</option>
                            {translations.filter(t => t.id !== 'web').map(t => (
                                <option key={t.id} value={t.id}>{t.id.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Book Selector Dropdown */}
            <AnimatePresence>
                {showBookSelector && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="glass rounded-2xl p-4 my-4 max-h-80 overflow-y-auto"
                    >
                        <div className="mb-3 text-sm text-slate-400 font-medium">Old Testament</div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mb-4">
                            {bibleBooks.filter(b => b.testament === 'old').map(b => (
                                <button
                                    key={b.id}
                                    onClick={() => { setCurrentBook(b.id); setCurrentChapter(1); setShowBookSelector(false) }}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${b.id === currentBook
                                        ? 'bg-bible-gold text-slate-900 glow-gold'
                                        : 'glass text-slate-300 hover:text-white'
                                        }`}
                                >
                                    {b.name}
                                </button>
                            ))}
                        </div>
                        <div className="mb-3 text-sm text-slate-400 font-medium">New Testament</div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                            {bibleBooks.filter(b => b.testament === 'new').map(b => (
                                <button
                                    key={b.id}
                                    onClick={() => { setCurrentBook(b.id); setCurrentChapter(1); setShowBookSelector(false) }}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${b.id === currentBook
                                        ? 'bg-bible-gold text-slate-900 glow-gold'
                                        : 'glass text-slate-300 hover:text-white'
                                        }`}
                                >
                                    {b.name}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Verse Content */}
            <article className="glass rounded-2xl p-6 md:p-8 mb-6 min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-bible-gold">
                        <Loader2 className="w-10 h-10 animate-spin mb-4" />
                        <p className="text-sm font-medium">Loading Scripture...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-64 text-red-400">
                        <AlertCircle className="w-10 h-10 mb-4 opacity-50" />
                        <p>{error}</p>
                        <Button variant="ghost" size="sm" onClick={() => window.location.reload()} className="mt-4">
                            Retry
                        </Button>
                    </div>
                ) : (
                    <div className={`prose prose-invert max-w-none font-serif leading-relaxed text-${fontSize}`}>
                        {verses.map((v, i) => (
                            <motion.span
                                key={v.verse}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.01 }}
                                onClick={() => setSelectedVerse(selectedVerse === v.verse ? null : v.verse)}
                                className={`cursor-pointer transition-all duration-300 rounded-lg inline-block ${selectedVerse === v.verse
                                    ? 'bg-bible-gold/20 text-bible-gold px-1 -mx-1'
                                    : 'hover:bg-white/5'
                                    }`}
                            >
                                <sup className="text-xs text-bible-gold/60 mr-1 font-sans">{v.verse}</sup>
                                <span dangerouslySetInnerHTML={{ __html: v.text }}></span>{' '}
                            </motion.span>
                        ))}
                    </div>
                )}
            </article>

            {/* Verse Action Panel */}
            <AnimatePresence>
                {selectedVerse && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="fixed bottom-32 md:bottom-24 left-1/2 -translate-x-1/2 glass-dark rounded-full px-2 py-2 flex items-center gap-1 shadow-xl z-50"
                    >
                        <Button variant="ghost" size="sm" className="rounded-full gap-1.5">
                            <Bookmark className="w-4 h-4" /> Save
                        </Button>
                        <div className="w-px h-6 bg-white/10" />
                        <Button variant="ghost" size="sm" className="rounded-full gap-1.5">
                            <Share2 className="w-4 h-4" /> Share
                        </Button>
                        <div className="w-px h-6 bg-white/10" />
                        <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full gap-1.5 text-bible-gold"
                            onClick={() => handleGetInsight(selectedVerse)}
                        >
                            <Sparkles className="w-4 h-4" /> Insight
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* AI Insight Panel */}
            <AnimatePresence>
                {insightVerse && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed inset-x-0 bottom-20 md:bottom-4 max-w-2xl mx-auto px-4 z-50"
                    >
                        <div className="glass-dark rounded-2xl shadow-2xl overflow-hidden border border-white/10">
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-bible-gold to-yellow-600 flex items-center justify-center shadow-lg shadow-bible-gold/20">
                                        <Sparkles className="w-5 h-5 text-slate-900" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-sm">Lumina AI Assistant</h3>
                                        <p className="text-xs text-slate-400">{book.name} {currentChapter}:{insightVerse}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setInsightVerse(null)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-5 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                {insightLoading ? (
                                    <div className="space-y-3 animate-pulse">
                                        <div className="h-4 bg-white/10 rounded w-3/4" />
                                        <div className="h-4 bg-white/10 rounded w-1/2" />
                                        <div className="h-4 bg-white/10 rounded w-5/6" />
                                        <div className="h-4 bg-white/10 rounded w-2/3" />
                                    </div>
                                ) : (
                                    <div className="prose prose-invert prose-sm max-w-none">
                                        {insightText.split('\n').map((line, i) => {
                                            // Render markdown-style headers
                                            if (line.startsWith('### ')) {
                                                return <h3 key={i} className="text-bible-gold font-bold mb-2 mt-4 flex items-center gap-2">{line.replace('### ', '')}</h3>
                                            }
                                            // Render bullet points
                                            if (line.trim().startsWith('*')) {
                                                return <li key={i} className="text-slate-300 leading-relaxed ml-4">{line.replace(/^\*\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>
                                            }
                                            // Regular text
                                            if (line.trim()) {
                                                return <p key={i} className="text-slate-300 leading-relaxed mb-2" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
                                            }
                                            return <br key={i} />
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Footer Actions */}
                            {!insightLoading && (
                                <div className="p-4 border-t border-white/5 flex gap-3">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="flex-1 gap-2"
                                        onClick={handleShare}
                                    >
                                        <Share2 className="w-4 h-4" /> Share
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="flex-1 gap-2"
                                        onClick={handleSaveInsight}
                                    >
                                        <Bookmark className="w-4 h-4" /> Save
                                    </Button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Navigation */}
            <div className="sticky bottom-20 md:bottom-4 glass-dark rounded-xl px-4 py-3">
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={goToPrevChapter}
                        disabled={currentChapter <= 1}
                        className="gap-1"
                    >
                        <ChevronLeft className="w-5 h-5" /> Prev
                    </Button>

                    <div className="flex items-center gap-1 overflow-x-auto max-w-[200px] md:max-w-none">
                        <span className="text-sm text-slate-400">
                            Chapter {currentChapter} of {book?.chapters}
                        </span>
                    </div>

                    <Button
                        variant="ghost"
                        onClick={goToNextChapter}
                        disabled={!book || currentChapter >= book.chapters}
                        className="gap-1"
                    >
                        Next <ChevronRight className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
