import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, Square, Volume2, BookOpen, ChevronDown, Loader2, X, Settings2 } from 'lucide-react'
import { Button } from '../ui/Button'
import { bibleBooks } from '../../data/bibleData'
import { getChapter } from '../../services/bibleService'

export function AudioBiblePage() {
    const [selectedBook, setSelectedBook] = useState('psa') // Psalms
    const [selectedChapter, setSelectedChapter] = useState(23)
    const [verses, setVerses] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [showChapterModal, setShowChapterModal] = useState(false)
    const [showVerseModal, setShowVerseModal] = useState(false)
    const [bgMusicVolume, setBgMusicVolume] = useState(0.2)
    const [isMusicEnabled, setIsMusicEnabled] = useState(true)
    const [currentTrack, setCurrentTrack] = useState('/silent-hymn-1.mp3')
    const bgMusicRef = useRef(null)

    const tracks = [
        { name: 'Silent Hymn I', src: '/silent-hymn-1.mp3' },
        { name: 'Silent Hymn II', src: '/silent-hymn-2.mp3' },
        { name: 'Serenity I', src: '/serenity-1.mp3' },
        { name: 'Serenity II', src: '/serenity-2.mp3' },
        { name: 'Devotional', src: '/devotional.mp3' }
    ]

    // Speech state
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [currentVerseIndex, setCurrentVerseIndex] = useState(0)
    const [selectedVoice, setSelectedVoice] = useState(null)
    const [voices, setVoices] = useState([])
    const [rate, setRate] = useState(0.9)

    const synthRef = useRef(window.speechSynthesis)
    const utteranceRef = useRef(null)

    const book = bibleBooks.find(b => b.id === selectedBook)

    // Handle Background Music Logic
    useEffect(() => {
        if (!bgMusicRef.current) return
        bgMusicRef.current.volume = bgMusicVolume
        if (isSpeaking && !isPaused && isMusicEnabled) {
            bgMusicRef.current.play().catch(e => console.log("Audio play failed", e))
        } else {
            bgMusicRef.current.pause()
        }
    }, [isSpeaking, isPaused, isMusicEnabled, bgMusicVolume, currentTrack])

    // Load available voices
    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = synthRef.current.getVoices()
            // Filter for English voices but keep all variants (US, UK, etc)
            const englishVoices = availableVoices.filter(v => v.lang.includes('en'))
            setVoices(englishVoices)

            // Try to find a default if none selected
            if (!selectedVoice && englishVoices.length > 0) {
                const preferred = englishVoices.find(v => v.name.includes('Zira') || v.name.includes('Google US English')) || englishVoices[0]
                setSelectedVoice(preferred)
            }
        }
        loadVoices()
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.onvoiceschanged = loadVoices
        }
    }, [])

    // Fetch chapter content
    useEffect(() => {
        async function fetchChapter() {
            if (!book) return
            setIsLoading(true)
            setError(null)
            try {
                const data = await getChapter(book.name, selectedChapter, 'web')
                setVerses(data.verses || [])
                setCurrentVerseIndex(0)
            } catch (err) {
                setError('Failed to load chapter')
            } finally {
                setIsLoading(false)
            }
        }
        fetchChapter()
    }, [selectedBook, selectedChapter, book])

    // Cleanup speech on unmount
    useEffect(() => {
        return () => {
            synthRef.current.cancel()
        }
    }, [])

    const speakVerse = (verseIndex) => {
        if (verseIndex >= verses.length) {
            setIsSpeaking(false)
            setCurrentVerseIndex(0)
            return
        }

        const verse = verses[verseIndex]
        const cleanText = verse.text.replace(/<[^>]*>/g, '')
        const fullText = `Verse ${verse.verse}. ${cleanText}`

        const utterance = new SpeechSynthesisUtterance(fullText)
        utterance.voice = selectedVoice
        utterance.rate = rate
        utterance.pitch = 1

        utterance.onend = () => {
            setCurrentVerseIndex(prev => prev + 1)
            setTimeout(() => speakVerse(verseIndex + 1), 100)
        }

        utterance.onerror = (event) => {
            if (event.error !== 'interrupted' && event.error !== 'canceled') {
                console.error('Speech error:', event.error)
            }
            if (event.error !== 'interrupted') setIsSpeaking(false)
        }

        utteranceRef.current = utterance
        synthRef.current.cancel()
        setTimeout(() => {
            synthRef.current.speak(utterance)
        }, 50)
    }

    const handlePlay = () => {
        setError(null)
        if (isPaused) {
            synthRef.current.resume()
            setIsPaused(false)
        } else {
            synthRef.current.cancel()
            setIsSpeaking(true)
            setIsPaused(false)
            speakVerse(currentVerseIndex)
        }
    }

    const handlePause = () => {
        synthRef.current.pause()
        setIsPaused(true)
    }

    const handleStop = () => {
        synthRef.current.cancel()
        setIsSpeaking(false)
        setIsPaused(false)
        setCurrentVerseIndex(0)
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            {/* Background Music Source */}
            <audio ref={bgMusicRef} src={currentTrack} loop />

            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-3xl md:text-4xl font-serif font-bold glow-text text-bible-gold">Audio Bible</h1>
                <p className="text-slate-400">Listen to Scripture read aloud</p>
            </div>

            {/* Controls Bar */}
            <div className="glass rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between sticky top-20 z-10 backdrop-blur-xl">

                {/* Book & Chapter Selection */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <select
                        value={selectedBook}
                        onChange={(e) => { setSelectedBook(e.target.value); setSelectedChapter(1) }}
                        className="bg-slate-900/50 text-white p-2 rounded-lg border border-white/10 focus:border-bible-gold outline-none flex-1 md:w-40"
                    >
                        {bibleBooks.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>

                    <button
                        onClick={() => setShowChapterModal(true)}
                        className="bg-slate-900/50 text-white px-4 py-2 rounded-lg border border-white/10 hover:border-bible-gold transition-colors flex items-center gap-2 min-w-[80px] justify-between"
                    >
                        <span>Ch. {selectedChapter}</span>
                        <ChevronDown className="w-4 h-4 text-bible-gold" />
                    </button>

                    {/* Verse Selector Modal Trigger */}
                    <button
                        onClick={() => setShowVerseModal(true)}
                        disabled={verses.length === 0}
                        className="bg-slate-900/50 text-white px-4 py-2 rounded-lg border border-white/10 hover:border-bible-gold transition-colors flex items-center gap-2 min-w-[90px] justify-between disabled:opacity-50"
                    >
                        <span>Vs. {verses[currentVerseIndex]?.verse || 1}</span>
                        <ChevronDown className="w-4 h-4 text-bible-gold" />
                    </button>
                </div>

                {/* Playback Controls */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleStop}
                        disabled={!isSpeaking && !isPaused}
                        className="p-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <Square className="w-5 h-5 fill-current" />
                    </button>

                    <button
                        onClick={isSpeaking && !isPaused ? handlePause : handlePlay}
                        disabled={isLoading || verses.length === 0}
                        className="w-12 h-12 bg-gradient-to-r from-bible-gold to-yellow-500 rounded-full flex items-center justify-center text-slate-900 hover:scale-105 transition-transform shadow-lg shadow-bible-gold/30 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : isSpeaking && !isPaused ? (
                            <Pause className="w-6 h-6 fill-current" />
                        ) : (
                            <Play className="w-6 h-6 fill-current ml-0.5" />
                        )}
                    </button>

                    <div className="flex items-center gap-2">
                        {/* Music Toggle */}
                        <Button
                            size="sm"
                            variant="ghost"
                            className={`p-2 transition-colors ${isMusicEnabled ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500 hover:text-slate-300'}`}
                            onClick={() => setIsMusicEnabled(!isMusicEnabled)}
                            title="Toggle Inspiration Music"
                        >
                            <Settings2 className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Settings Panel (Visible when speaking or paused) */}
            {(isSpeaking || isPaused) && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="glass rounded-xl p-4 flex flex-wrap gap-6 justify-center items-center text-sm mb-4"
                >
                    {/* Music Controls */}
                    <div className="flex items-center gap-3 bg-white/5 p-2 rounded-lg">
                        <span className="text-bible-gold font-medium">BGM:</span>
                        <select
                            value={currentTrack}
                            onChange={(e) => setCurrentTrack(e.target.value)}
                            className="bg-slate-900 border border-white/10 rounded px-2 py-1 text-xs max-w-[120px] text-white outline-none focus:border-bible-gold"
                        >
                            {tracks.map(t => (
                                <option key={t.src} value={t.src}>{t.name}</option>
                            ))}
                        </select>

                        <input
                            type="range"
                            min="0"
                            max="0.5"
                            step="0.05"
                            value={bgMusicVolume}
                            onChange={(e) => setBgMusicVolume(parseFloat(e.target.value))}
                            className="w-20 accent-emerald-500"
                            disabled={!isMusicEnabled}
                            title="Music Volume"
                        />
                    </div>

                    <div className="w-px h-6 bg-white/10 hidden md:block" />

                    {/* Voice Controls */}
                    <div className="flex items-center gap-3 bg-white/5 p-2 rounded-lg">
                        <span className="text-bible-gold font-medium">Voice:</span>
                        <select
                            value={selectedVoice?.name || ''}
                            onChange={(e) => setSelectedVoice(voices.find(v => v.name === e.target.value))}
                            className="bg-slate-900 border border-white/10 rounded px-2 py-1 text-xs max-w-[180px] text-white outline-none focus:border-bible-gold"
                        >
                            {voices.map(v => (
                                <option key={v.name} value={v.name}>{v.name.replace('Microsoft ', '').replace('Google ', '')}</option>
                            ))}
                        </select>
                    </div>

                    {/* Speed Control */}
                    <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg">
                        <span className="text-slate-400">Speed:</span>
                        <input
                            type="range"
                            min="0.5"
                            max="1.5"
                            step="0.1"
                            value={rate}
                            onChange={(e) => setRate(parseFloat(e.target.value))}
                            className="w-16 accent-bible-gold"
                        />
                        <span className="text-white w-8 text-xs">{rate}x</span>
                    </div>
                </motion.div>
            )}

            {/* Chapter Selection Modal */}
            <AnimatePresence>
                {showChapterModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        onClick={() => setShowChapterModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-serif font-bold text-bible-gold">{book?.name} Chapters</h3>
                                <button onClick={() => setShowChapterModal(false)} className="text-slate-400 hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="grid grid-cols-5 md:grid-cols-6 gap-3">
                                {book && Array.from({ length: book.chapters }, (_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => { setSelectedChapter(i + 1); setShowChapterModal(false) }}
                                        className={`p-3 rounded-xl font-medium transition-all ${selectedChapter === i + 1
                                                ? 'bg-bible-gold text-slate-900 font-bold shadow-lg shadow-bible-gold/20'
                                                : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Verse Selection Modal */}
                {showVerseModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        onClick={() => setShowVerseModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-serif font-bold text-bible-gold">{book?.name} {selectedChapter} Verses</h3>
                                <button onClick={() => setShowVerseModal(false)} className="text-slate-400 hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="grid grid-cols-5 md:grid-cols-6 gap-3">
                                {verses.map((v, i) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            setCurrentVerseIndex(i);
                                            setShowVerseModal(false);
                                            // Auto-play logic
                                            if (isSpeaking) {
                                                handleStop();
                                                setTimeout(() => {
                                                    setCurrentVerseIndex(i);
                                                    setIsSpeaking(true);
                                                    speakVerse(i);
                                                }, 100);
                                            }
                                        }}
                                        className={`p-3 rounded-xl font-medium transition-all ${currentVerseIndex === i
                                                ? 'bg-bible-gold text-slate-900 font-bold shadow-lg shadow-bible-gold/20'
                                                : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                                            }`}
                                    >
                                        {v.verse}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Verse Display */}
            <div className="glass rounded-2xl p-6 md:p-8 min-h-[50vh]">
                {isLoading ? (
                    <div className="space-y-4 animate-pulse">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-4 bg-white/5 rounded w-full"></div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4 text-lg leading-relaxed">
                        {verses.map((verse, index) => (
                            <div
                                key={verse.verse}
                                id={`verse-${index}`}
                                onClick={() => {
                                    handleStop()
                                    setTimeout(() => {
                                        setCurrentVerseIndex(index)
                                        setIsSpeaking(true)
                                        speakVerse(index)
                                    }, 50)
                                }}
                                className={`p-2 rounded-lg transition-colors cursor-pointer ${currentVerseIndex === index
                                    ? 'bg-bible-gold/10 border-l-2 border-bible-gold pl-3'
                                    : 'hover:bg-white/5 border-l-2 border-transparent pl-3'
                                    }`}
                            >
                                <span className="text-xs font-bold text-bible-gold mr-2 align-top opacity-75">{verse.verse}</span>
                                <span className={currentVerseIndex === index ? 'text-white font-medium' : 'text-slate-300'}>
                                    {verse.text.replace(/<[^>]*>/g, '')}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
