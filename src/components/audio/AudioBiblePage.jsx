import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, Square, ChevronDown, Loader2, X, Settings2, Volume2, Music, SkipForward, SkipBack, Sparkles, BookOpen } from 'lucide-react'
import { Button } from '../ui/Button'
import { bibleBooks } from '../../data/bibleData'
import { getChapter } from '../../services/bibleService'
import { audioService } from '../../services/audioService'

export function AudioBiblePage() {
    const [selectedBook, setSelectedBook] = useState('psa') // Psalms
    const [selectedChapter, setSelectedChapter] = useState(23)
    const [verses, setVerses] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [showChapterModal, setShowChapterModal] = useState(false)
    const [bgMusicVolume, setBgMusicVolume] = useState(0.15)
    const [isMusicEnabled, setIsMusicEnabled] = useState(true)
    const [currentTrack, setCurrentTrack] = useState('/silent-hymn-1.mp3')
    const bgMusicRef = useRef(null)

    const tracks = [
        { name: 'Silent Hymn I', src: '/silent-hymn-1.mp3' },
        { name: 'Silent Hymn II', src: '/silent-hymn-2.mp3' },
        { name: 'Morning Dew', src: '/serenity-1.mp3' },
        { name: 'Holy Spirit', src: '/serenity-2.mp3' }
    ]

    // Speech state
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [currentVerseIndex, setCurrentVerseIndex] = useState(0)
    const [selectedVoice, setSelectedVoice] = useState(null)
    const [voices, setVoices] = useState([])
    const [rate, setRate] = useState(0.9)

    // Global playback safe-guard
    const playbackRef = useRef(false) // Tracks if we *intend* to be playing

    const book = bibleBooks.find(b => b.id === selectedBook)

    // Handle Background Music
    useEffect(() => {
        if (!bgMusicRef.current) return
        bgMusicRef.current.volume = bgMusicVolume
        if (isSpeaking && !isPaused && isMusicEnabled) {
            bgMusicRef.current.play().catch(() => { })
        } else {
            bgMusicRef.current.pause()
        }
    }, [isSpeaking, isPaused, isMusicEnabled, bgMusicVolume, currentTrack])

    // Load voices from Service
    useEffect(() => {
        const updateVoices = (loadedVoices) => {
            setVoices(loadedVoices)
            // Auto-select the best voice if none selected
            if (!selectedVoice) {
                const best = audioService.findBestVoice()
                setSelectedVoice(best)
            }
        }

        // Subscribe to voice changes
        const unsubscribe = audioService.subscribe(updateVoices)
        return () => unsubscribe()
    }, [selectedVoice])

    // Sync selected voice to service
    useEffect(() => {
        if (selectedVoice) {
            audioService.setVoice(selectedVoice.name)
        }
    }, [selectedVoice])

    // Fetch chapter content
    useEffect(() => {
        async function fetchChapter() {
            if (!book) return
            setIsLoading(true)
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

    const speakVerse = async (verseIndex) => {
        if (verseIndex >= verses.length || !playbackRef.current) {
            setIsSpeaking(false)
            setCurrentVerseIndex(0)
            playbackRef.current = false
            return
        }

        const verse = verses[verseIndex]
        const cleanText = verse.text.replace(/<[^>]*>/g, '')

        // Move highlighted index
        setCurrentVerseIndex(verseIndex)

        try {
            // Speak and await completion
            await audioService.speak(cleanText, {
                rate: rate,
                pitch: 0.92, // Slightly lower pitch for more authority/calmness
                voice: selectedVoice
            })

            // Recursion: Only continue if we are STILL playing and weren't stopped
            if (playbackRef.current && !isPaused) {
                speakVerse(verseIndex + 1)
            }
        } catch (e) {
            console.error("Playback error", e)
            setIsSpeaking(false)
        }
    }

    const handlePlay = () => {
        if (isPaused) {
            audioService.resume()
            setIsPaused(false)
            playbackRef.current = true // Ensure we are logically playing
        } else {
            setIsSpeaking(true)
            setIsPaused(false)
            playbackRef.current = true
            speakVerse(currentVerseIndex)
        }
    }

    const handlePause = () => {
        audioService.pause()
        setIsPaused(true)
        // playbackRef remains true because we intend to continue
    }

    const handleStop = () => {
        playbackRef.current = false // Kill the loop
        audioService.cancel()
        setIsSpeaking(false)
        setIsPaused(false)
        setCurrentVerseIndex(0)
    }

    return (
        <div className="max-w-5xl mx-auto px-4 pb-32 pt-10">
            <audio ref={bgMusicRef} src={currentTrack} loop />

            <div className="text-center mb-10">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-block px-4 py-1.5 rounded-full bg-bible-gold/10 border border-bible-gold/20 text-bible-gold text-xs font-bold uppercase tracking-widest mb-4"
                >
                    Meditative Audio Experience
                </motion.div>
                <h1 className="text-2xl md:text-5xl font-serif font-bold text-slate-900 dark:text-white mb-4">The Audio Word</h1>
                <p className="text-slate-400 max-w-lg mx-auto italic">"Faith comes by hearing, and hearing by the word of God."</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Left Column: Player UX */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Premium Player Card */}
                    <div className="glass rounded-[3rem] p-8 md:p-12 relative overflow-hidden shadow-2xl border border-white/10">
                        {/* Decorative Gradient */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-bible-gold/10 blur-[100px] -mr-32 -mt-32 rounded-full" />

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-48 h-48 md:w-64 md:h-64 rounded-[2.5rem] bg-gradient-to-br from-bible-gold to-yellow-700 p-1 mb-8 shadow-2xl transform hover:scale-105 transition-transform duration-500 group">
                                <div className="w-full h-full rounded-[2.3rem] bg-slate-900 flex flex-col items-center justify-center overflow-hidden relative">
                                    <BookOpen className="w-20 h-20 text-bible-gold/20 absolute" />
                                    <div className="text-3xl md:text-6xl font-serif font-bold text-bible-gold z-10">{selectedChapter}</div>
                                    <div className="text-xs uppercase tracking-[0.3em] text-bible-gold/60 mt-2 z-10 font-bold">{book?.name}</div>

                                    {/* Wave Animation when playing */}
                                    {isSpeaking && !isPaused && (
                                        <div className="absolute bottom-6 flex gap-1 items-end h-8">
                                            {[1, 2, 3, 4, 5, 6].map(i => (
                                                <motion.div
                                                    key={i}
                                                    animate={{ height: [8, 24, 12, 28, 10] }}
                                                    transition={{ repeat: Infinity, duration: 0.5 + i * 0.1, ease: "easeInOut" }}
                                                    className="w-1.5 bg-bible-gold/40 rounded-full"
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1 mb-10">
                                <h2 className="text-xl md:text-3xl font-serif font-bold text-slate-900 dark:text-white">{book?.name} Chapter {selectedChapter}</h2>
                                <p className="text-bible-gold/60 font-medium">Verse {currentVerseIndex + 1} of {verses.length}</p>
                            </div>

                            {/* Main Player Controls */}
                            <div className="flex items-center gap-6 md:gap-10">
                                <button onClick={() => setCurrentVerseIndex(Math.max(0, currentVerseIndex - 1))} className="p-3 text-white/40 hover:text-white transition-colors">
                                    <SkipBack className="w-8 h-8" />
                                </button>

                                <button
                                    onClick={isSpeaking && !isPaused ? handlePause : handlePlay}
                                    className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-bible-gold text-slate-900 flex items-center justify-center shadow-[0_0_50px_rgba(234,179,8,0.3)] hover:scale-110 active:scale-95 transition-all group"
                                >
                                    {isSpeaking && !isPaused ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current ml-2" />}
                                </button>

                                <button onClick={() => setCurrentVerseIndex(Math.min(verses.length - 1, currentVerseIndex + 1))} className="p-3 text-white/40 hover:text-white transition-colors">
                                    <SkipForward className="w-8 h-8" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Progress & Text View */}
                    <div className="glass rounded-3xl p-6 md:p-8 min-h-[200px] border border-white/5 bg-slate-900/40">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-bible-gold" />
                                Live Scripture
                            </h3>
                            <button onClick={handleStop} className="text-xs text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors">
                                <Square className="w-3 h-3 fill-current" /> Stop Reader
                            </button>
                        </div>

                        <div className="space-y-4">
                            {isLoading ? (
                                <div className="space-y-3 animate-pulse">
                                    <div className="h-4 bg-white/5 rounded w-full" />
                                    <div className="h-4 bg-white/5 rounded w-3/4" />
                                </div>
                            ) : (
                                <p className="text-lg md:text-xl font-serif leading-relaxed text-slate-700 dark:text-slate-300">
                                    <span className="text-bible-gold font-bold mr-2">{verses[currentVerseIndex]?.verse}</span>
                                    {verses[currentVerseIndex]?.text.replace(/<[^>]*>/g, '')}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Settings & Selection */}
                <div className="space-y-6">
                    {/* Book/Chapter Selection */}
                    <div className="glass rounded-3xl p-6 border border-white/10 space-y-4">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-bible-gold" /> Content
                        </h4>
                        <div className="space-y-3">
                            <select
                                value={selectedBook}
                                onChange={(e) => { setSelectedBook(e.target.value); setSelectedChapter(1) }}
                                className="w-full bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white focus:border-bible-gold outline-none text-sm appearance-none"
                                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23EAB308\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1rem' }}
                            >
                                {bibleBooks.map(b => (
                                    <option key={b.id} value={b.id} className="bg-slate-900">{b.name}</option>
                                ))}
                            </select>

                            <button
                                onClick={() => setShowChapterModal(true)}
                                className="w-full bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white hover:border-bible-gold transition-colors text-sm flex justify-between items-center"
                            >
                                <span>Chapter {selectedChapter}</span>
                                <ChevronDown className="w-4 h-4 text-bible-gold" />
                            </button>
                        </div>
                    </div>

                    {/* Audio Customization */}
                    <div className="glass rounded-3xl p-6 border border-white/10 space-y-6">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                            <Settings2 className="w-4 h-4 text-bible-gold" /> Customization
                        </h4>

                        {/* Voice Selection */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs text-slate-500 font-bold uppercase tracking-tighter">Narrator Voice</label>
                                <button
                                    onClick={() => audioService.initVoices()}
                                    className="text-[10px] text-bible-gold hover:text-white underline decoration-dotted"
                                >
                                    Force Refresh
                                </button>
                            </div>
                            <select
                                value={selectedVoice?.name || ''}
                                onChange={(e) => setSelectedVoice(voices.find(v => v.name === e.target.value))}
                                className="w-full bg-slate-100 dark:bg-slate-800 border border-black/10 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white focus:border-bible-gold outline-none text-xs"
                            >
                                {voices.length === 0 && <option value="">Loading Voices...</option>}
                                {voices.map(v => (
                                    <option key={v.name} value={v.name} className="bg-slate-900 text-white">{v.name.replace('Microsoft ', '').replace('Google ', '')}</option>
                                ))}
                            </select>
                        </div>

                        {/* Music Selection */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs text-slate-500 font-bold uppercase tracking-tighter">Inspiration Music</label>
                                <button
                                    onClick={() => setIsMusicEnabled(!isMusicEnabled)}
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${isMusicEnabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}
                                >
                                    {isMusicEnabled ? 'ON' : 'OFF'}
                                </button>
                            </div>
                            <select
                                value={currentTrack}
                                onChange={(e) => setCurrentTrack(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-bible-gold outline-none text-xs disabled:opacity-30"
                                disabled={!isMusicEnabled}
                            >
                                {tracks.map(t => (
                                    <option key={t.src} value={t.src} className="bg-slate-900">{t.name}</option>
                                ))}
                            </select>
                            <div className="flex items-center gap-3 px-1">
                                <Volume2 className="w-3 h-3 text-slate-500" />
                                <input
                                    type="range" min="0" max="0.5" step="0.05"
                                    value={bgMusicVolume}
                                    onChange={(e) => setBgMusicVolume(parseFloat(e.target.value))}
                                    className="flex-1 accent-bible-gold h-1"
                                    disabled={!isMusicEnabled}
                                />
                            </div>
                        </div>

                        {/* Speech Rate */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs text-slate-500 font-bold uppercase tracking-tighter">Reading Speed</label>
                                <span className="text-[10px] font-bold text-bible-gold">{rate}x</span>
                            </div>
                            <input
                                type="range" min="0.5" max="1.5" step="0.1"
                                value={rate}
                                onChange={(e) => setRate(parseFloat(e.target.value))}
                                className="w-full accent-bible-gold h-1"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Chapter Modal */}
            <AnimatePresence>
                {showChapterModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4" onClick={() => setShowChapterModal(false)}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-slate-900 border border-white/10 rounded-[2rem] p-8 w-full max-w-2xl max-h-[70vh] overflow-y-auto no-scrollbar"
                            onClick={e => e.stopPropagation()}
                        >
                            <h3 className="text-2xl font-serif font-bold text-bible-gold mb-8">Select Chapter</h3>
                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                                {book && Array.from({ length: book.chapters }, (_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => { setSelectedChapter(i + 1); setShowChapterModal(false); handleStop() }}
                                        className={`h-12 w-full rounded-xl font-bold transition-all ${selectedChapter === i + 1 ? 'bg-bible-gold text-slate-900 shadow-lg' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
