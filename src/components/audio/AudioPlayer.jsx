import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Download, Clock, CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '../ui/Button'

// Try local file first, fallback to a public domain audio
// Using Internet Archive's public domain audio
const AUDIO_SOURCE = '/devotional.mp3'
const FALLBACK_AUDIO = 'https://ia800905.us.archive.org/19/items/FREE_background_music_dridge/Drama%20-%20No%20Copyright%20Music.mp3'

const devotionals = [
    {
        id: 1,
        title: 'Gospel of Matthew (Ch 1-2)',
        book: 'Matthew 1-2',
        duration: 372,
        date: 'Today',
        description: 'The genealogy and birth of Jesus Christ, the Son of David.',
        src: AUDIO_SOURCE,
        downloaded: false,
    },
    {
        id: 2,
        title: 'Psalm 23 (Dramatic Reading)',
        book: 'Psalm 23',
        duration: 180,
        date: 'Yesterday',
        description: 'The Lord is my Shepherd; I shall not want.',
        src: AUDIO_SOURCE,
        downloaded: false,
    }
]

function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function AudioPlayer() {
    // Move devotionals to state to track download status dynamically
    const [devotionalList, setDevotionalList] = useState(devotionals)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentDevotional, setCurrentDevotional] = useState(devotionalList[0])
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolume] = useState(0.8)
    const [isMuted, setIsMuted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    const audioRef = useRef(new Audio(currentDevotional.src))
    const progressRef = useRef(null)

    // ... (useEffect for audio Init is same, just depends on currentDevotional) ... 
    // Initialization & Source Change
    useEffect(() => {
        // Cleanup previous audio if needed
        audioRef.current.pause()
        audioRef.current = new Audio(currentDevotional.src)
        audioRef.current.volume = volume
        setIsLoading(true)
        setIsPlaying(false)
        setCurrentTime(0)
        setError(null)

        const audio = audioRef.current

        const setAudioData = () => {
            setDuration(audio.duration)
            setIsLoading(false)
        }

        const setAudioTime = () => setCurrentTime(audio.currentTime)
        const handleEnded = () => setIsPlaying(false)
        const handleError = (e) => {
            console.error("Audio Load Error:", e)
            // Try fallback audio source
            if (audio.src !== FALLBACK_AUDIO) {
                console.log("Trying fallback audio source...")
                audio.src = FALLBACK_AUDIO
                audio.load()
            } else {
                setIsLoading(false)
                setError("Unable to load audio. Please check your connection.")
            }
        }

        // Events
        audio.addEventListener('loadeddata', setAudioData)
        audio.addEventListener('timeupdate', setAudioTime)
        audio.addEventListener('ended', handleEnded)
        audio.addEventListener('error', handleError)

        return () => {
            audio.removeEventListener('loadeddata', setAudioData)
            audio.removeEventListener('timeupdate', setAudioTime)
            audio.removeEventListener('ended', handleEnded)
            audio.removeEventListener('error', handleError)
            audio.pause()
        }
    }, [currentDevotional])

    // ... (Play/Pause, Volume, Progress Click, Toggle Play remain same) ...
    // Play/Pause Control
    useEffect(() => {
        if (isPlaying) {
            audioRef.current.play().catch(e => console.error("Playback failed", e))
        } else {
            audioRef.current.pause()
        }
    }, [isPlaying])

    // Volume Control
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume
        }
    }, [volume, isMuted])

    const handleProgressClick = (e) => {
        const rect = progressRef.current.getBoundingClientRect()
        const percent = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1)
        const newTime = percent * duration
        audioRef.current.currentTime = newTime
        setCurrentTime(newTime)
    }

    const togglePlay = () => {
        setIsPlaying(!isPlaying)
    }

    // Offline Audio Optimization
    const toggleDownload = async (devotional) => {
        if ('caches' in window) {
            try {
                const cache = await caches.open('audio-cache')
                if (devotional.downloaded) {
                    await cache.delete(devotional.src)
                    // Update state
                    setDevotionalList(prev => prev.map(d =>
                        d.id === devotional.id ? { ...d, downloaded: false } : d
                    ))
                } else {
                    await cache.add(devotional.src)
                    // Update state
                    setDevotionalList(prev => prev.map(d =>
                        d.id === devotional.id ? { ...d, downloaded: true } : d
                    ))
                    // Also update current devotional if it matches
                    if (currentDevotional.id === devotional.id) {
                        setCurrentDevotional(prev => ({ ...prev, downloaded: true }))
                    }
                }
            } catch (err) {
                console.error("Cache failed", err)
                alert("Could not download audio. Check connection.")
            }
        } else {
            alert("Offline downloads not supported in this browser.")
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-serif font-bold glow-text text-bible-gold">Daily Audio Devotionals</h1>
                <p className="text-slate-400">Listen and grow in your faith journey</p>
            </div>

            {/* Now Playing Card - Glass */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-6 md:p-8 relative overflow-hidden"
            >
                {/* Background glow */}
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-bible-gold/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl" />

                <div className="relative flex flex-col md:flex-row gap-6 items-center">
                    {/* Album Art */}
                    <div
                        className={`w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden shrink-0 glow-gold ${isPlaying ? 'animate-float' : ''}`}
                        style={{ backgroundImage: 'url(/devotional-art.png)', backgroundSize: 'cover' }}
                    />

                    <div className="flex-1 text-center md:text-left space-y-4 w-full">
                        <div>
                            <p className="text-sm text-bible-gold font-medium">{currentDevotional.book}</p>
                            <h2 className="text-2xl md:text-3xl font-serif font-bold">{currentDevotional.title}</h2>
                            <p className="text-slate-400 mt-1 text-sm">{currentDevotional.description}</p>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <div
                                ref={progressRef}
                                onClick={handleProgressClick}
                                className="h-2 bg-white/10 rounded-full overflow-hidden cursor-pointer group"
                            >
                                <motion.div
                                    className="h-full bg-gradient-to-r from-bible-gold to-yellow-500 rounded-full relative"
                                    style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                                >
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" />
                                </motion.div>
                            </div>
                            <div className="flex justify-between text-xs text-slate-500">
                                <span>{formatTime(currentTime)}</span>
                                <span>{formatTime(duration || currentDevotional.duration)}</span>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-center md:justify-start gap-4">
                            <button className="p-2 text-slate-400 hover:text-slate-100 transition-colors hover:scale-110">
                                <SkipBack className="w-6 h-6" />
                            </button>

                            <button
                                onClick={togglePlay}
                                disabled={isLoading}
                                className="w-14 h-14 bg-gradient-to-r from-bible-gold to-yellow-500 rounded-full flex items-center justify-center text-slate-900 hover:scale-105 transition-transform shadow-lg shadow-bible-gold/30 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : isPlaying ? (
                                    <Pause className="w-6 h-6" />
                                ) : (
                                    <Play className="w-6 h-6 ml-1" />
                                )}
                            </button>

                            <button className="p-2 text-slate-400 hover:text-slate-100 transition-colors hover:scale-110">
                                <SkipForward className="w-6 h-6" />
                            </button>

                            {/* Volume */}
                            <div className="hidden md:flex items-center gap-2 ml-4">
                                <button
                                    onClick={() => setIsMuted(!isMuted)}
                                    className="p-2 text-slate-400 hover:text-slate-100 transition-colors"
                                >
                                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                </button>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={isMuted ? 0 : volume}
                                    onChange={(e) => { setVolume(parseFloat(e.target.value)); setIsMuted(false) }}
                                    className="w-20 accent-bible-gold h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Devotional List */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-300">Recent Devotionals</h3>
                <div className="space-y-3">
                    {devotionalList.map((devotional, i) => (
                        <motion.button
                            key={devotional.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            onClick={() => { if (currentDevotional.id !== devotional.id) setCurrentDevotional(devotional) }}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 text-left group ${currentDevotional.id === devotional.id
                                ? 'glass-gold'
                                : 'glass hover:scale-[1.02]'
                                }`}
                        >
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 transition-colors ${currentDevotional.id === devotional.id ? 'bg-bible-gold text-slate-900' : 'glass-dark group-hover:bg-bible-gold/20'
                                }`}>
                                {currentDevotional.id === devotional.id && isPlaying ? (
                                    <div className="flex gap-0.5">
                                        <span className="w-1 h-4 bg-current rounded-full animate-pulse" />
                                        <span className="w-1 h-3 bg-current rounded-full animate-pulse delay-75" />
                                        <span className="w-1 h-5 bg-current rounded-full animate-pulse delay-150" />
                                    </div>
                                ) : (
                                    <Play className="w-5 h-5" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate">{devotional.title}</h4>
                                <p className="text-sm text-slate-500">{devotional.book}</p>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-500">
                                <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    ~{Math.round(devotional.duration / 60)}m
                                </span>
                                {devotional.downloaded ? (
                                    <CheckCircle className="w-4 h-4 text-green-500" title="Downloaded" />
                                ) : (
                                    <Download
                                        className="w-4 h-4 hover:text-white cursor-pointer"
                                        title="Download for offline"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleDownload(devotional);
                                        }}
                                    />
                                )}
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>
        </div>
    )
}
