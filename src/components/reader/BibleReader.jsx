import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ChevronLeft, ChevronRight, BookOpen, Bookmark, Share2, Sparkles,
    AlertCircle, Loader2, X, Volume2, Maximize2, Minimize2,
    VolumeX, MessageSquare, Image as ImageIcon, Smartphone, Zap
} from 'lucide-react'
import { Button } from '../ui/Button'
import { bibleBooks, translations } from '../../data/bibleData'
import { getChapter } from '../../services/bibleService'
import { AIService } from '../../services/aiService'
import { BookmarkService } from '../../services/bookmarkService'
import { Check, PenTool } from 'lucide-react'

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
    const [selectionStage, setSelectionStage] = useState('books') // 'books' | 'chapters'
    const [tempSelectedBook, setTempSelectedBook] = useState(null)
    const [currentTranslation, setCurrentTranslation] = useState('web')

    // Sanctuary Mode States
    const [isSanctuaryMode, setIsSanctuaryMode] = useState(false)
    const [isAmbientPlaying, setIsAmbientPlaying] = useState(false)
    const [ambientTrack, setAmbientTrack] = useState('monastery-rain')
    const audioRef = useRef(null)

    // Conversational Theology States
    const [showInterview, setShowInterview] = useState(false)
    const [interviewQuestion, setInterviewQuestion] = useState('')
    const [interviewResponse, setInterviewResponse] = useState('')
    const [interviewLoading, setInterviewLoading] = useState(false)

    // Sticker State
    const [showStickerPreview, setShowStickerPreview] = useState(false)
    const [stickerVerse, setStickerVerse] = useState(null)

    const [insightVerse, setInsightVerse] = useState(null)
    const [insightText, setInsightText] = useState('')
    const [insightLoading, setInsightLoading] = useState(false)

    // Highlight & Save States
    const [highlights, setHighlights] = useState([])
    const [showToast, setShowToast] = useState(false)

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

                // Load Highlights
                const chapterHighlights = await BookmarkService.getChapterHighlights(currentBook, currentChapter)
                setHighlights(chapterHighlights.map(h => h.verse))

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

    // Haptic Feedback
    const triggerHaptic = (type = 'light') => {
        if (window.navigator.vibrate) {
            if (type === 'light') window.navigator.vibrate(10)
            else if (type === 'medium') window.navigator.vibrate(25)
            else if (type === 'heavy') window.navigator.vibrate([20, 10, 20])
        }
    }

    const handleVerseClick = (verseNum) => {
        triggerHaptic('light')
        setSelectedVerse(selectedVerse === verseNum ? null : verseNum)
    }

    const goToPrevChapter = () => {
        triggerHaptic('medium')
        if (currentChapter > 1) {
            setCurrentChapter(c => c - 1)
            setSelectedVerse(null)
            setInsightVerse(null)
        }
    }

    const goToNextChapter = () => {
        triggerHaptic('medium')
        if (book && currentChapter < book.chapters) {
            setCurrentChapter(c => c + 1)
            setSelectedVerse(null)
            setInsightVerse(null)
        }
    }

    const handleGetInsight = async (verseNumber) => {
        triggerHaptic('medium')
        const verseObj = verses.find(v => v.verse === verseNumber)
        if (!verseObj) return

        const verseRef = `${book.name} ${currentChapter}:${verseNumber}`
        setInsightVerse(verseNumber)
        setInsightLoading(true)
        setSelectedVerse(null)

        try {
            const insight = await AIService.getVerseInsight(verseRef, verseObj.text)
            setInsightText(insight)
        } catch (error) {
            setInsightText("Unable to load insight. Please try again.")
        } finally {
            setInsightLoading(false)
        }
    }

    const handleInterview = async () => {
        if (!interviewQuestion.trim()) return
        triggerHaptic('medium')
        setInterviewLoading(true)
        setInterviewResponse('')
        try {
            const response = await AIService.interviewBook(book.name, currentChapter, interviewQuestion)
            setInterviewResponse(response)
        } catch (err) {
            setInterviewResponse("The Holy Spirit has much to teach, but I am having trouble connecting right now.")
        } finally {
            setInterviewLoading(false)
        }
    }

    // Church/Worship Themed Backgrounds
    const stickerImages = [
        "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=600", // Woman praying
        "https://images.unsplash.com/photo-1510380198696-fa8a6929831a?auto=format&fit=crop&q=80&w=600", // Worship hands
        "https://images.unsplash.com/photo-1478147427282-58a87a120781?auto=format&fit=crop&q=80&w=600", // Church interior
        "https://images.unsplash.com/photo-1543615694-5259163200dc?auto=format&fit=crop&q=80&w=600", // Cross silhouette
        "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&q=80&w=600", // Group worship
        "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=600", // Hands raised
    ]

    const generateSticker = (verseNum) => {
        triggerHaptic('heavy')
        const v = verses.find(ver => ver.verse === verseNum)
        const randomImage = stickerImages[Math.floor(Math.random() * stickerImages.length)]

        setStickerVerse({
            ref: `${book.name} ${currentChapter}:${verseNum}`,
            text: v.text.replace(/<[^>]*>/g, ''),
            image: randomImage
        })
        setShowStickerPreview(true)
        setSelectedVerse(null)
    }

    const toggleSanctuary = () => {
        triggerHaptic('medium')
        setIsSanctuaryMode(!isSanctuaryMode)
        if (!isSanctuaryMode) {
            setIsAmbientPlaying(true)
        } else {
            setIsAmbientPlaying(false)
        }
    }

    const handleSave = async (verseNum) => {
        triggerHaptic('medium')
        const v = verses.find(ver => ver.verse === verseNum)
        await BookmarkService.add({
            reference: `${book.name} ${currentChapter}:${verseNum}`,
            text: v.text.replace(/<[^>]*>/g, ''),
            bookId: currentBook,
            chapter: currentChapter,
            verse: verseNum,
            type: 'verse'
        })
        setShowToast(true)
        setSelectedVerse(null)
        setTimeout(() => setShowToast(false), 3000)
    }

    const handleHighlight = async (verseNum) => {
        triggerHaptic('medium')
        const isHighlighted = highlights.includes(verseNum)
        const v = verses.find(ver => ver.verse === verseNum)

        if (isHighlighted) {
            await BookmarkService.deleteHighlight(`${book.name} ${currentChapter}:${verseNum}`)
            setHighlights(prev => prev.filter(h => h !== verseNum))
        } else {
            await BookmarkService.add({
                reference: `${book.name} ${currentChapter}:${verseNum}`,
                text: v.text.replace(/<[^>]*>/g, ''),
                bookId: currentBook,
                chapter: currentChapter,
                verse: verseNum,
                type: 'highlight'
            })
            setHighlights(prev => [...prev, verseNum])
        }
        setSelectedVerse(null)
    }

    const handleShare = async () => {
        triggerHaptic('medium')
        const shareText = `Insight on ${book.name} ${currentChapter}:${insightVerse}\n\n${insightText.replace(/<[^>]*>/g, '')}\n\nShared via Lumina Bible`

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Insight: ${book.name} ${currentChapter}:${insightVerse}`,
                    text: shareText,
                })
            } catch (err) {
                // Share cancelled or failed, fallback
                if (err.name !== 'AbortError') {
                    navigator.clipboard.writeText(shareText)
                    alert('Insight copied to clipboard!')
                }
            }
        } else {
            navigator.clipboard.writeText(shareText)
            alert('Insight copied to clipboard!')
        }
    }

    return (
        <div className={`transition-all duration-1000 ${isSanctuaryMode ? 'bg-slate-950 text-slate-100' : ''}`}>
            {/* Ambient Audio (Mocked URLS) */}
            <audio
                ref={audioRef}
                src={ambientTrack === 'monastery-rain' ? '/ambient-rain.mp3' : '/ambient-bells.mp3'}
                loop
                autoPlay={isAmbientPlaying}
            />

            <div className="max-w-4xl mx-auto px-4 min-h-screen">
                {/* Top Toolbar */}
                <div className={`sticky top-20 z-40 glass rounded-2xl px-4 py-3 mb-6 mt-4 transition-all ${isSanctuaryMode ? 'opacity-20 hover:opacity-100 border-white/5' : ''}`}>
                    <div className="flex items-center justify-between gap-4">
                        <button
                            onClick={() => {
                                triggerHaptic('light')
                                setShowBookSelector(!showBookSelector)
                                if (!showBookSelector) {
                                    setSelectionStage('books')
                                    setTempSelectedBook(null)
                                }
                            }}
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
                                className="bg-white/50 dark:bg-slate-900/50 border border-black/10 dark:border-white/10 rounded-lg px-2 py-1 text-[10px] text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-bible-gold cursor-pointer"
                            >
                                {translations.map(t => (
                                    <option key={t.id} value={t.id}>{t.id.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Sanctuary Mode Controls Removed */}

                {/* Content Area */}
                <article className={`relative transition-all duration-1000 ${isSanctuaryMode ? 'p-0 my-12' : 'glass rounded-[3rem] p-6 md:p-14 mb-8 shadow-2xl border border-black/5 dark:border-white/5'}`}>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-20 text-bible-gold">
                            <Loader2 className="w-12 h-12 animate-spin mb-4" />
                            <p className="font-serif italic opacity-50 tracking-widest uppercase text-xs">Illuminating the Word...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center p-20 text-red-400">
                            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
                            <p>{error}</p>
                            <Button onClick={() => window.location.reload()} variant="ghost" className="mt-4">Try Again</Button>
                        </div>
                    ) : (
                        <div className={`prose dark:prose-invert max-w-none font-serif leading-relaxed ${isSanctuaryMode ? 'text-2xl md:text-3xl space-y-12 text-slate-100' : 'text-lg md:text-xl space-y-6 text-slate-100 dark:text-slate-100'}`}>
                            {verses.map((v) => (
                                <motion.span
                                    key={v.verse}
                                    id={`verse-${v.verse}`}
                                    onClick={() => handleVerseClick(v.verse)}
                                    initial={false}
                                    className={`cursor-pointer transition-all duration-500 rounded-xl px-2 inline-block ${selectedVerse === v.verse ? 'bg-bible-gold/10 text-bible-gold shadow-[0_0_30px_rgba(234,179,8,0.1)] scale-[1.02]' : 'hover:bg-white/5 opacity-90'} ${highlights.includes(v.verse) ? 'bg-yellow-500/10 decoration-yellow-500/30 underline decoration-2 underline-offset-4' : ''} ${isSanctuaryMode ? 'block mb-8 py-4 border-b border-white/5 last:border-0' : ''}`}
                                >
                                    <sup className="text-[10px] text-bible-gold/60 mr-2 font-sans font-black uppercase tracking-tighter">{v.verse}</sup>
                                    <span
                                        dangerouslySetInnerHTML={{ __html: v.text }}
                                        className={`${isSanctuaryMode && selectedVerse === v.verse ? 'font-bold glow-gold-text' : ''}`}
                                    />
                                </motion.span>
                            ))}
                        </div>
                    )}
                </article>

                {/* Book & Chapter Selector Modal */}
                <AnimatePresence>
                    {showBookSelector && (
                        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex flex-col">
                            {/* Modal Header */}
                            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-950/50">
                                <div className="flex items-center gap-4">
                                    {selectionStage === 'chapters' && (
                                        <button
                                            onClick={() => setSelectionStage('books')}
                                            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                        >
                                            <ChevronLeft className="w-6 h-6" />
                                        </button>
                                    )}
                                    <div>
                                        <h2 className="text-xl font-serif font-bold text-white">
                                            {selectionStage === 'books' ? 'Select Book' : tempSelectedBook?.name}
                                        </h2>
                                        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">
                                            {selectionStage === 'books' ? 'Old & New Testament' : 'Select Chapter'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowBookSelector(false)}
                                    className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                                <motion.div
                                    key={selectionStage}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {selectionStage === 'books' ? (
                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 max-w-6xl mx-auto">
                                            {bibleBooks.map(b => (
                                                <button
                                                    key={b.id}
                                                    onClick={() => {
                                                        triggerHaptic('light')
                                                        setTempSelectedBook(b)
                                                        setSelectionStage('chapters')
                                                    }}
                                                    className={`p-4 rounded-2xl text-left border transition-all group ${b.id === currentBook
                                                        ? 'bg-bible-gold text-slate-900 border-bible-gold'
                                                        : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:border-white/20'
                                                        }`}
                                                >
                                                    <div className="text-lg font-serif font-bold mb-1">{b.name}</div>
                                                    <div className={`text-xs uppercase tracking-widest font-bold ${b.id === currentBook ? 'text-slate-800/60' : 'text-slate-600 group-hover:text-slate-500'}`}>
                                                        {b.chapters} Chapters
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="max-w-4xl mx-auto">
                                            <div className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-3">
                                                {Array.from({ length: tempSelectedBook?.chapters || 0 }, (_, i) => i + 1).map(chapter => (
                                                    <button
                                                        key={chapter}
                                                        onClick={() => {
                                                            triggerHaptic('medium')
                                                            setCurrentBook(tempSelectedBook.id)
                                                            setCurrentChapter(chapter)
                                                            setShowBookSelector(false)
                                                            setSelectionStage('books')
                                                        }}
                                                        className={`aspect-square flex items-center justify-center rounded-2xl text-lg font-bold transition-all ${tempSelectedBook.id === currentBook && chapter === currentChapter
                                                            ? 'bg-bible-gold text-slate-900 shadow-lg shadow-bible-gold/20 scale-110'
                                                            : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:scale-105 border border-white/5'
                                                            }`}
                                                    >
                                                        {chapter}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Interview Panel */}
                <AnimatePresence>
                    {showInterview && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 30 }}
                            className="fixed inset-x-0 bottom-32 md:bottom-12 max-w-lg mx-auto px-4 z-50"
                        >
                            <div className="glass-dark rounded-[2.5rem] p-6 shadow-2xl border border-emerald-500/20 bg-white/50 dark:bg-transparent">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                            <MessageSquare className="w-5 h-5" />
                                        </div>
                                        <h3 className="font-bold text-slate-900 dark:text-white uppercase text-xs tracking-widest">Interview {book.name}</h3>
                                    </div>
                                    <button onClick={() => setShowInterview(false)} className="text-slate-500"><X className="w-4 h-4" /></button>
                                </div>
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder={`Ask ${book.name} a question...`}
                                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-4 text-sm text-slate-900 dark:text-white focus:border-emerald-400 outline-none"
                                        value={interviewQuestion}
                                        onChange={(e) => setInterviewQuestion(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleInterview()}
                                    />
                                    {interviewLoading && <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-emerald-400" /></div>}
                                    {interviewResponse && (
                                        <motion.div
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                            className="bg-emerald-500/5 rounded-2xl p-4 text-xs text-slate-300 leading-relaxed italic"
                                        >
                                            {interviewResponse}
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Verse Action Panel */}
                <AnimatePresence>
                    {selectedVerse && !showInterview && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="fixed bottom-32 md:bottom-24 left-1/2 -translate-x-1/2 glass-dark rounded-full px-2 py-2 flex items-center gap-1 shadow-2xl border border-white/10 z-50 max-w-[90vw] overflow-x-auto no-scrollbar whitespace-nowrap"
                        >
                            <Button onClick={() => generateSticker(selectedVerse)} variant="ghost" size="sm" className="rounded-full gap-2 hover:text-bible-gold">
                                <ImageIcon className="w-4 h-4" /> Sticker
                            </Button>
                            <div className="w-px h-6 bg-white/10" />
                            <Button
                                variant="ghost" size="sm" className="rounded-full gap-2 text-bible-gold font-bold transition-all"
                                onClick={() => handleGetInsight(selectedVerse)}
                            >
                                <Sparkles className="w-4 h-4" /> Quick Insight
                            </Button>
                            <div className="w-px h-6 bg-white/10" />
                            <Button
                                variant="ghost" size="sm" className="rounded-full gap-2 text-emerald-400"
                                onClick={() => {
                                    const v = verses.find(ver => ver.verse === selectedVerse);
                                    navigate('/study', {
                                        state: {
                                            verseReference: `${book.name} ${currentChapter}:${selectedVerse}`,
                                            verseText: v.text.replace(/<[^>]*>/g, '')
                                        }
                                    })
                                }}
                            >
                                <Zap className="w-4 h-4" /> Deep Study
                            </Button>
                            <div className="w-px h-6 bg-white/10" />
                            <Button onClick={() => handleHighlight(selectedVerse)} variant="ghost" size="sm" className={`rounded-full gap-2 ${highlights.includes(selectedVerse) ? 'text-yellow-400' : ''}`}>
                                <PenTool className="w-4 h-4" /> Highlight
                            </Button>
                            <div className="w-px h-6 bg-white/10" />
                            <Button onClick={() => handleSave(selectedVerse)} variant="ghost" size="sm" className="rounded-full gap-2">
                                <Bookmark className="w-4 h-4" /> Save
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Sticker Modal */}
                <AnimatePresence>
                    {showStickerPreview && stickerVerse && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6" onClick={() => setShowStickerPreview(false)}>
                            {/* Backdrop with Blur and Gradient */}
                            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-3xl">
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50" />
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-bible-gold/30 to-transparent" />
                            </div>

                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                onClick={e => e.stopPropagation()}
                                className="w-full max-w-sm relative z-10"
                            >
                                {/* THE STICKER */}
                                <div className="aspect-square relative rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 bg-slate-900 group ring-4 ring-black/20">
                                    <div className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:scale-110 transition-transform duration-[10s]" style={{ backgroundImage: `url(${stickerVerse.image})` }}>
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                                    </div>
                                    <div className="absolute inset-0 p-10 flex flex-col justify-center text-center">
                                        <div className="w-12 h-1 h-px bg-bible-gold/50 mx-auto mb-8" />
                                        <p className="text-xl md:text-2xl font-serif font-bold text-white leading-relaxed italic drop-shadow-lg">
                                            "{stickerVerse.text}"
                                        </p>
                                        <div className="mt-8 text-bible-gold text-xs font-black uppercase tracking-widest drop-shadow-md">{stickerVerse.ref}</div>
                                        <div className="mt-2 text-white/30 text-[8px] uppercase tracking-[0.4em]">Generated by Lumina</div>
                                    </div>
                                </div>

                                <div className="mt-8 flex gap-4">
                                    <Button
                                        className="flex-1 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold rounded-2xl h-14 shadow-lg shadow-[#25D366]/20 transition-all hover:scale-105"
                                        onClick={() => {
                                            triggerHaptic('medium')
                                            const text = `Check out this verse from Lumina: "${stickerVerse.text}" - ${stickerVerse.ref}`
                                            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
                                        }}
                                    >
                                        <Share2 className="w-5 h-5 mr-2" /> Share to WhatsApp
                                    </Button>
                                    <button
                                        onClick={() => setShowStickerPreview(false)}
                                        className="w-14 h-14 glass-dark border border-white/10 rounded-2xl flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* AI Insight Panel */}
                <AnimatePresence>
                    {insightVerse && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className="fixed inset-x-0 bottom-20 md:bottom-32 max-w-2xl mx-auto px-4 z-50"
                        >
                            <div className="glass-dark rounded-[2rem] shadow-2xl overflow-hidden border border-white/10 ring-1 ring-white/5">
                                <div className="flex items-center justify-between p-6 pb-2">
                                    <div>
                                        <h3 className="font-serif font-bold text-slate-900 dark:text-white text-xl">Verse Insight</h3>
                                        <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">{book.name} {currentChapter}:{insightVerse}</p>
                                    </div>
                                    <button onClick={() => setInsightVerse(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="p-6 pt-4 max-h-[50vh] overflow-y-auto text-slate-300 leading-relaxed text-sm md:text-base">
                                    {insightLoading ? (
                                        <div className="space-y-4 animate-pulse">
                                            <div className="h-4 bg-white/5 rounded w-3/4" />
                                            <div className="h-4 bg-white/5 rounded w-full" />
                                            <div className="h-4 bg-white/5 rounded w-5/6" />
                                        </div>
                                    ) : (
                                        <div className="prose dark:prose-invert prose-sm max-w-none text-slate-700 dark:text-slate-300">
                                            {insightText.split('\n').map((line, i) => (
                                                <p key={i} className="mb-3 last:mb-0" dangerouslySetInnerHTML={{
                                                    __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 dark:text-white font-bold">$1</strong>')
                                                        .replace(/### (.*)/g, '<span class="block text-bible-gold text-xs font-black uppercase tracking-widest mt-6 mb-2 border-b border-white/5 pb-1">$1</span>')
                                                }} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 border-t border-white/5 bg-black/20 flex gap-2">
                                    <Button onClick={handleShare} variant="ghost" className="flex-1 gap-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl">
                                        <Share2 className="w-4 h-4" /> Share Insight
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Bottom Navigation Removed */}
                {/* Save Toast */}
                <AnimatePresence>
                    {showToast && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
                            className="fixed bottom-32 left-1/2 -translate-x-1/2 glass-dark bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl z-[60]"
                        >
                            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <Check className="w-4 h-4" />
                            </div>
                            <span className="font-bold text-sm">Saved to Bookmarks</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
