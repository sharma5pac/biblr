import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ChevronLeft, ChevronRight, BookOpen, Bookmark, Share2, Sparkles,
    AlertCircle, Loader2, X, Volume2, Maximize2, Minimize2,
    VolumeX, MessageSquare, Image as ImageIcon, Smartphone
} from 'lucide-react'
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

    const generateSticker = (verseNum) => {
        triggerHaptic('heavy')
        const v = verses.find(ver => ver.verse === verseNum)
        setStickerVerse({
            ref: `${book.name} ${currentChapter}:${verseNum}`,
            text: v.text.replace(/<[^>]*>/g, '')
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
                            onClick={() => { triggerHaptic('light'); setShowBookSelector(!showBookSelector) }}
                            className="flex items-center gap-2 text-lg font-serif font-bold text-bible-gold hover:text-yellow-400 transition-colors group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-bible-gold/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <BookOpen className="w-4 h-4" />
                            </div>
                            {book?.name} {currentChapter}
                            <ChevronLeft className={`w-4 h-4 transition-transform ${showBookSelector ? 'rotate-90' : '-rotate-90'}`} />
                        </button>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={toggleSanctuary}
                                className={`rounded-full ${isSanctuaryMode ? 'text-bible-gold bg-bible-gold/10' : 'text-slate-400'}`}
                            >
                                {isSanctuaryMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                <span className="hidden md:inline ml-2">{isSanctuaryMode ? 'Exit Sanctuary' : 'Sanctuary Mode'}</span>
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => { triggerHaptic('light'); setShowInterview(!showInterview) }}
                                className={`rounded-full ${showInterview ? 'text-emerald-400' : 'text-slate-400'}`}
                            >
                                <MessageSquare className="w-4 h-4" />
                            </Button>

                            <select
                                value={currentTranslation}
                                onChange={(e) => setCurrentTranslation(e.target.value)}
                                className="bg-slate-900/50 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-slate-300 focus:outline-none focus:ring-1 focus:ring-bible-gold cursor-pointer"
                            >
                                {translations.map(t => (
                                    <option key={t.id} value={t.id}>{t.id.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Sanctuary Mode Controls (Overlayed) */}
                <AnimatePresence>
                    {isSanctuaryMode && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed top-24 right-8 flex flex-col gap-4 z-50"
                        >
                            <button
                                onClick={() => setIsAmbientPlaying(!isAmbientPlaying)}
                                className="w-12 h-12 rounded-full glass flex items-center justify-center text-bible-gold border border-bible-gold/20"
                            >
                                {isAmbientPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                            </button>
                            <select
                                onChange={(e) => setAmbientTrack(e.target.value)}
                                className="bg-slate-900/80 border border-white/10 rounded-xl p-2 text-[10px] text-white outline-none"
                            >
                                <option value="monastery-rain">Monastery Rain</option>
                                <option value="bells">Cathedral Bells</option>
                                <option value="chanting">Holy Chanting</option>
                            </select>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Book Selector */}
                <AnimatePresence>
                    {showBookSelector && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="glass rounded-2xl p-6 mb-6 max-h-[60vh] overflow-y-auto no-scrollbar relative z-50"
                        >
                            {/* ... (Existing Book Selector Grid logic) ... */}
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                {bibleBooks.map(b => (
                                    <button
                                        key={b.id}
                                        onClick={() => {
                                            triggerHaptic('light')
                                            setCurrentBook(b.id)
                                            setCurrentChapter(1)
                                            setShowBookSelector(false)
                                        }}
                                        className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${b.id === currentBook ? 'bg-bible-gold text-slate-900' : 'hover:bg-white/5 text-slate-400'}`}
                                    >
                                        {b.name}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Content Area */}
                <article className={`relative transition-all duration-1000 ${isSanctuaryMode ? 'p-0 my-12' : 'glass rounded-[3rem] p-6 md:p-14 mb-8 shadow-2xl border border-white/5'}`}>
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
                        <div className={`prose prose-invert max-w-none font-serif leading-relaxed ${isSanctuaryMode ? 'text-2xl md:text-3xl space-y-12' : 'text-lg md:text-xl space-y-6'}`}>
                            {verses.map((v) => (
                                <motion.span
                                    key={v.verse}
                                    id={`verse-${v.verse}`}
                                    onClick={() => handleVerseClick(v.verse)}
                                    initial={false}
                                    className={`cursor-pointer transition-all duration-500 rounded-xl px-2 inline-block ${selectedVerse === v.verse ? 'bg-bible-gold/10 text-bible-gold shadow-[0_0_30px_rgba(234,179,8,0.1)] scale-[1.02]' : 'hover:bg-white/5 opacity-90'} ${isSanctuaryMode ? 'block mb-8 py-4 border-b border-white/5 last:border-0' : ''}`}
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

                {/* Interview Panel */}
                <AnimatePresence>
                    {showInterview && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 30 }}
                            className="fixed inset-x-0 bottom-32 md:bottom-12 max-w-lg mx-auto px-4 z-50"
                        >
                            <div className="glass-dark rounded-[2.5rem] p-6 shadow-2xl border border-emerald-500/20">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                            <MessageSquare className="w-5 h-5" />
                                        </div>
                                        <h3 className="font-bold text-white uppercase text-xs tracking-widest">Interview {book.name}</h3>
                                    </div>
                                    <button onClick={() => setShowInterview(false)} className="text-slate-500"><X className="w-4 h-4" /></button>
                                </div>
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder={`Ask ${book.name} a question...`}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white focus:border-emerald-400 outline-none"
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
                            className="fixed bottom-32 md:bottom-24 left-1/2 -translate-x-1/2 glass-dark rounded-full px-2 py-2 flex items-center gap-1 shadow-2xl border border-white/10 z-50"
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
                            <Button onClick={() => triggerHaptic('light')} variant="ghost" size="sm" className="rounded-full gap-2">
                                <Bookmark className="w-4 h-4" /> Save
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Sticker Modal */}
                <AnimatePresence>
                    {showStickerPreview && stickerVerse && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-6" onClick={() => setShowStickerPreview(false)}>
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                onClick={e => e.stopPropagation()}
                                className="w-full max-w-sm"
                            >
                                {/* THE STICKER */}
                                <div className="aspect-square relative rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 bg-slate-900 group">
                                    <div className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:scale-110 transition-transform duration-[10s]" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1510132919161-077cc203673c?auto=format&fit=crop&q=80&w=600)' }}>
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                                    </div>
                                    <div className="absolute inset-0 p-10 flex flex-col justify-center text-center">
                                        <div className="w-12 h-1 h-px bg-bible-gold/30 mx-auto mb-6" />
                                        <p className="text-xl md:text-2xl font-serif font-bold text-white leading-relaxed italic">
                                            "{stickerVerse.text}"
                                        </p>
                                        <div className="mt-8 text-bible-gold text-xs font-black uppercase tracking-widest">{stickerVerse.ref}</div>
                                        <div className="mt-2 text-white/20 text-[8px] uppercase tracking-[0.4em]">Generated by Lumina</div>
                                    </div>
                                </div>
                                <div className="mt-8 flex gap-4">
                                    <Button className="flex-1 bg-white text-slate-900 font-bold rounded-2xl h-14" onClick={() => (triggerHaptic('medium'), alert('Sticker Ready for Instagram!'))}>
                                        <Share2 className="w-5 h-5 mr-2" /> Share to WhatsApp
                                    </Button>
                                    <button onClick={() => setShowStickerPreview(false)} className="w-14 h-14 glass rounded-2xl flex items-center justify-center text-white"><X className="w-6 h-6" /></button>
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
                            className="fixed inset-x-0 bottom-20 md:bottom-4 max-w-2xl mx-auto px-4 z-50"
                        >
                            {/* ... (Existing Insight Panel logic) ... */}
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
                                    <Button onClick={() => triggerHaptic('light')} variant="ghost" className="flex-1 gap-2"><Share2 className="w-4 h-4" /> Share</Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Bottom Navigation (Local) */}
                {!isSanctuaryMode && (
                    <div className="sticky bottom-20 md:bottom-4 glass rounded-[2rem] p-4 flex justify-between items-center z-40 shadow-xl border border-white/5 mx-2 mb-10 mt-6">
                        <Button variant="ghost" onClick={goToPrevChapter} disabled={currentChapter <= 1} className="gap-2 text-slate-400">
                            <ChevronLeft className="w-5 h-5" /> Prev
                        </Button>
                        <div className="text-xs md:text-sm font-bold text-bible-gold uppercase tracking-widest bg-bible-gold/5 px-4 py-2 rounded-xl">
                            Ch. {currentChapter}
                        </div>
                        <Button variant="ghost" onClick={goToNextChapter} disabled={!book || currentChapter >= book.chapters} className="gap-2 text-slate-400">
                            Next <ChevronRight className="w-5 h-5" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
