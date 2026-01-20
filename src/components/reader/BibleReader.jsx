import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, BookOpen, Bookmark, Share2, Sparkles, AlertCircle, Loader2, X } from 'lucide-react'
import { Button } from '../ui/Button'
import { bibleBooks, translations } from '../../data/bibleData'
import { getChapter } from '../../services/bibleService'
import { AIService } from '../../services/aiService'
import { addBookmark } from '../bookmarks/BookmarksPage'

export function BibleReader() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const urlBook = searchParams.get('book')
    const urlChapter = parseInt(searchParams.get('chapter')) || 1
    const urlVerse = parseInt(searchParams.get('verse'))

    const [currentBook, setCurrentBook] = useState(urlBook || 'jhn')
    const [currentChapter, setCurrentChapter] = useState(urlChapter)
    const [verses, setVerses] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [selectedVerse, setSelectedVerse] = useState(urlVerse || null)
    const [showBookSelector, setShowBookSelector] = useState(false)
    const [currentTranslation, setCurrentTranslation] = useState('web')
    const [fontSize, setFontSize] = useState('lg')

    const scrollRef = useRef(null)
    const verseRefs = useRef({})

    // AI Insights state
    const [insightVerse, setInsightVerse] = useState(null)
    const [insightText, setInsightText] = useState('')
    const [insightLoading, setInsightLoading] = useState(false)

    const book = bibleBooks.find(b => b.id === currentBook)

    useEffect(() => {
        if (urlBook && urlBook !== currentBook) setCurrentBook(urlBook)
        if (urlChapter && urlChapter !== currentChapter) setCurrentChapter(urlChapter)
        if (urlVerse) setSelectedVerse(urlVerse)
    }, [urlBook, urlChapter, urlVerse])

    useEffect(() => {
        async function fetchContent() {
            setLoading(true)
            setError(null)
            try {
                const data = await getChapter(book.name, currentChapter, currentTranslation)
                setVerses(data.verses)

                // If we have a selected verse, scroll to it after content loads
                if (selectedVerse) {
                    setTimeout(() => {
                        const element = document.getElementById(`verse-${selectedVerse}`)
                        if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
                        }
                    }, 500)
                }
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
            setSelectedVerse(null)
            setInsightVerse(null)
        }
    }

    const goToNextChapter = () => {
        if (book && currentChapter < book.chapters) {
            setCurrentChapter(c => c + 1)
            setSelectedVerse(null)
            setInsightVerse(null)
        }
    }

    const handleSaveVerse = async () => {
        if (!selectedVerse) return
        const verseObj = verses.find(v => v.verse === selectedVerse)
        await addBookmark({
            reference: `${book.name} ${currentChapter}:${selectedVerse}`,
            text: verseObj.text.replace(/<[^>]*>/g, ''),
            type: 'verse'
        })
        alert('Verse saved to Bookmarks!')
        setSelectedVerse(null)
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
        const verseRef = `${book.name} ${currentChapter}:${insightVerse || selectedVerse}`
        const verseText = verses.find(v => v.verse === (insightVerse || selectedVerse))?.text.replace(/<[^>]*>/g, '')

        const shareData = {
            title: verseRef,
            text: insightText ? `"${verseText}"\n\nInsight: ${insightText}` : `"${verseText}"`,
            url: window.location.href
        }

        try {
            if (navigator.share) {
                await navigator.share(shareData)
            } else {
                await navigator.clipboard.writeText(`${shareData.title}\n\n${shareData.text}`)
                alert('Copied to clipboard!')
            }
        } catch (error) {
            if (error.name !== 'AbortError') console.error('Share failed:', error)
        }
    }

    const handleSaveInsight = async () => {
        await addBookmark({
            reference: `${book.name} ${currentChapter}:${insightVerse}`,
            text: verses.find(v => v.verse === insightVerse)?.text.replace(/<[^>]*>/g, ''),
            insight: insightText,
            type: 'insight'
        })
        alert('Insight saved to Bookmarks!')
    }

    return (
        <div className="max-w-4xl mx-auto px-4">
            {/* Top Navigation */}
            <div className="sticky top-20 z-40 glass rounded-2xl px-4 py-3 mb-6 mt-4">
                <div className="flex items-center justify-between gap-4">
                    <button
                        onClick={() => setShowBookSelector(!showBookSelector)}
                        className="flex items-center gap-2 text-lg font-serif font-bold text-bible-gold hover:text-yellow-400 transition-colors group"
                    >
                        <div className="w-8 h-8 rounded-lg bg-bible-gold/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <BookOpen className="w-4 h-4" />
                        </div>
                        {book?.name} {currentChapter}
                        <ChevronLeft className={`w-4 h-4 transition-transform ${showBookSelector ? 'rotate-90' : '-rotate-90'}`} />
                    </button>

                    <div className="flex items-center gap-2">
                        <select
                            value={currentTranslation}
                            onChange={(e) => setCurrentTranslation(e.target.value)}
                            className="bg-slate-900/50 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-bible-gold/50 cursor-pointer"
                        >
                            <option value="web">WEB</option>
                            {translations.filter(t => t.id !== 'web').map(t => (
                                <option key={t.id} value={t.id}>{t.id.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Book Selector */}
            <AnimatePresence>
                {showBookSelector && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="glass rounded-2xl p-6 mb-6 max-h-[60vh] overflow-y-auto z-50 relative"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-bible-gold font-bold mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-bible-gold" />
                                    Old Testament
                                </h3>
                                <div className="grid grid-cols-3 gap-2">
                                    {bibleBooks.filter(b => b.testament === 'old').map(b => (
                                        <button
                                            key={b.id}
                                            onClick={() => { setCurrentBook(b.id); setCurrentChapter(1); setShowBookSelector(false) }}
                                            className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${b.id === currentBook ? 'bg-bible-gold text-slate-900' : 'hover:bg-white/5 text-slate-400'}`}
                                        >
                                            {b.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-emerald-400 font-bold mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                    New Testament
                                </h3>
                                <div className="grid grid-cols-3 gap-2">
                                    {bibleBooks.filter(b => b.testament === 'new').map(b => (
                                        <button
                                            key={b.id}
                                            onClick={() => { setCurrentBook(b.id); setCurrentChapter(1); setShowBookSelector(false) }}
                                            className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${b.id === currentBook ? 'bg-bible-gold text-slate-900' : 'hover:bg-white/5 text-slate-400'}`}
                                        >
                                            {b.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Content Area */}
            <article className="glass rounded-3xl p-6 md:p-10 mb-8 min-h-[500px] relative shadow-2xl">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-20 text-bible-gold">
                        <Loader2 className="w-12 h-12 animate-spin mb-4" />
                        <p className="font-serif italic">Opening the scroll...</p>
                    </div>
                ) : error ? (
                    <div className="text-center p-20 text-red-400">
                        <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>{error}</p>
                        <Button onClick={() => window.location.reload()} variant="ghost" className="mt-4">Try Again</Button>
                    </div>
                ) : (
                    <div className={`prose prose-invert max-w-none font-serif leading-relaxed text-${fontSize}`}>
                        {verses.map((v) => (
                            <motion.span
                                key={v.verse}
                                id={`verse-${v.verse}`}
                                onClick={() => setSelectedVerse(selectedVerse === v.verse ? null : v.verse)}
                                className={`cursor-pointer transition-all duration-300 rounded px-1 inline-block ${selectedVerse === v.verse ? 'bg-bible-gold/25 text-bible-gold shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'hover:bg-white/5'}`}
                            >
                                <sup className="text-[10px] text-bible-gold/50 mr-1 font-sans font-bold">{v.verse}</sup>
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
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-32 md:bottom-24 left-1/2 -translate-x-1/2 glass-dark rounded-full px-2 py-2 flex items-center gap-1 shadow-2xl border border-white/10 z-50"
                    >
                        <Button onClick={handleSaveVerse} variant="ghost" size="sm" className="rounded-full gap-2 hover:text-bible-gold transition-colors">
                            <Bookmark className="w-4 h-4" /> Save
                        </Button>
                        <div className="w-px h-6 bg-white/10" />
                        <Button onClick={handleShare} variant="ghost" size="sm" className="rounded-full gap-2 transition-colors">
                            <Share2 className="w-4 h-4" /> Share
                        </Button>
                        <div className="w-px h-6 bg-white/10" />
                        <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full gap-2 text-bible-gold font-bold transition-all"
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
                        <div className="glass-dark rounded-3xl shadow-2xl overflow-hidden border border-white/20">
                            <div className="flex items-center justify-between p-5 border-b border-white/10 bg-gradient-to-r from-bible-gold/10 to-transparent">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-bible-gold flex items-center justify-center">
                                        <Sparkles className="w-5 h-5 text-slate-900" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">Verse Insight</h3>
                                        <p className="text-xs text-bible-gold/60">{book.name} {currentChapter}:{insightVerse}</p>
                                    </div>
                                </div>
                                <button onClick={() => setInsightVerse(null)} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6 max-h-[50vh] overflow-y-auto text-slate-200 leading-relaxed text-sm md:text-base">
                                {insightLoading ? (
                                    <div className="space-y-4 animate-pulse">
                                        <div className="h-4 bg-white/10 rounded w-3/4" />
                                        <div className="h-4 bg-white/10 rounded w-full" />
                                        <div className="h-4 bg-white/10 rounded w-5/6" />
                                    </div>
                                ) : (
                                    <div className="prose prose-invert prose-sm max-w-none">
                                        {insightText.split('\n').map((line, i) => (
                                            <p key={i} className="mb-2" dangerouslySetInnerHTML={{
                                                __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-bible-gold">$1</strong>')
                                            }} />
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="p-4 border-t border-white/10 flex gap-2">
                                <Button onClick={handleSaveInsight} variant="ghost" className="flex-1 gap-2"><Bookmark className="w-4 h-4" /> Save</Button>
                                <Button onClick={handleShare} variant="ghost" className="flex-1 gap-2"><Share2 className="w-4 h-4" /> Share</Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Controls */}
            <div className="sticky bottom-20 md:bottom-4 glass rounded-2xl p-3 flex justify-between items-center z-40 shadow-xl border border-white/5">
                <Button variant="ghost" onClick={goToPrevChapter} disabled={currentChapter <= 1} className="gap-2">
                    <ChevronLeft className="w-5 h-5" /> Prev
                </Button>
                <div className="text-xs md:text-sm font-bold text-bible-gold/60 uppercase tracking-widest">
                    Chapter {currentChapter}
                </div>
                <Button variant="ghost" onClick={goToNextChapter} disabled={!book || currentChapter >= book.chapters} className="gap-2">
                    Next <ChevronRight className="w-5 h-5" />
                </Button>
            </div>
        </div>
    )
}
