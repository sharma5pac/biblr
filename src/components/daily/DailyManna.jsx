import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Play, Volume2, VolumeX, MessageCircle, Heart, Share2, Loader2, ArrowRight, Zap, CloudIcon, CloudRain, Sun, Wind, Moon, X } from 'lucide-react'
import { Button } from '../ui/Button'
import { AIService } from '../../services/aiService'

export function DailyManna() {
    const navigate = useNavigate()
    const [mood, setMood] = useState('')
    const [loading, setLoading] = useState(false)
    const [briefing, setBriefing] = useState(null)
    const [isAudioPlaying, setIsAudioPlaying] = useState(false)

    const moods = [
        { label: 'Anxious', icon: CloudRain, color: 'text-blue-400' },
        { label: 'Grateful', icon: Sun, color: 'text-yellow-400' },
        { label: 'Tired', icon: Moon, color: 'text-purple-400' },
        { label: 'Seeking', icon: Wind, color: 'text-emerald-400' },
        { label: 'Battle', icon: Zap, color: 'text-orange-400' }
    ]

    const generateBriefing = async (text = mood) => {
        if (!text) return
        setLoading(true)
        setBriefing(null)
        try {
            // If custom text is used, we treat it as a 'custom' mood request
            const isCustom = !moods.find(m => m.label === text)

            let data;
            if (isCustom) {
                // For custom input, we use the generateResponse or potentially a new specialized method
                // Assuming getHopeBriefing can handle raw text or we map it. 
                // Let's modify getHopeBriefing in service or pass a flag.
                // For now, let's assume getHopeBriefing handles the logic if we pass the text.
                data = await AIService.getHopeBriefing(text)
            } else {
                data = await AIService.getHopeBriefing(text)
            }

            setBriefing(data)
        } catch (err) {
            console.error(err)
            // Fallback content if AI fails
            setBriefing({
                tone: "Gentle Whisper",
                reference: "Psalm 23:1",
                text: "The Lord is my shepherd; I shall not want.",
                narrative: "Even when connection fails, His presence remains. Breathe deeply and know that you are held securely by the One who sustains all things.",
                prayer: "Lord, silence the noise and let me hear Your heartbeat.",
                bookId: "PSA",
                chapter: 23,
                verse: 1
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto px-4 pb-32 pt-10">
            <header className="text-center mb-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bible-gold/10 border border-bible-gold/20 text-bible-gold text-xs font-black uppercase tracking-widest mb-4"
                >
                    <Sparkles className="w-4 h-4" />
                    Daily Manna AI
                </motion.div>
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4 italic">The Hope Briefing</h1>
                <p className="text-slate-200 text-sm md:text-base max-w-md mx-auto leading-relaxed">
                    Personalized spiritual narratives woven from the Breath of Life, tailored to your soul's current season.
                </p>
            </header>

            {!briefing ? (
                <div className="space-y-8">
                    <div className="text-center">
                        <h3 className="text-lg font-serif text-white mb-6">How is your soul today?</h3>
                        <div className="flex flex-wrap justify-center gap-4">
                            {moods.map((m) => (
                                <button
                                    key={m.label}
                                    onClick={() => { setMood(m.label); generateBriefing(m.label) }}
                                    className="group flex flex-col items-center gap-3 p-6 glass rounded-[2.5rem] border border-white/5 hover:border-bible-gold/30 transition-all active:scale-90"
                                >
                                    <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${m.color} group-hover:scale-110 transition-transform`}>
                                        <m.icon className="w-6 h-6" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{m.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="relative group">
                        <textarea
                            className="w-full h-40 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 text-slate-900 dark:text-green-50 placeholder:text-slate-400 focus:border-bible-gold/50 outline-none transition-all shadow-2xl resize-none"
                            placeholder="Or tell the Spirit specifically what you're facing..."
                            value={mood}
                            onChange={(e) => setMood(e.target.value)}
                        />
                        <button
                            onClick={() => generateBriefing(mood)}
                            className="absolute bottom-6 right-6 w-12 h-12 bg-bible-gold rounded-2xl flex items-center justify-center text-slate-900 shadow-xl shadow-bible-gold/20 hover:scale-110 active:scale-95 transition-all"
                        >
                            <ArrowRight className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                >
                    {/* The Briefing Card */}
                    <div className="glass rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl relative">
                        {/* Audio Background (Mock) */}
                        <div className="absolute inset-0 bg-gradient-to-br from-bible-gold/5 to-transparent pointer-events-none" />

                        <div className="p-10 md:p-14 space-y-8 relative z-10">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-bible-gold border border-white/10">
                                        <Volume2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black text-bible-gold uppercase tracking-[0.3em]">Ambient Atmosphere</p>
                                        <p className="text-xs text-white font-bold">{briefing.tone}</p>
                                    </div>
                                </div>
                                <button onClick={() => setBriefing(null)} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <span className="text-[10px] font-black text-bible-gold/50 uppercase tracking-widest">Scripture Foundation</span>
                                    <h2 className="text-2xl font-serif font-bold text-white italic">{briefing.reference}</h2>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 italic">"{briefing.text}"</p>
                                </div>

                                <div className="space-y-4">
                                    <span className="text-[10px] font-black text-bible-gold/50 uppercase tracking-widest">Hope Narrative</span>
                                    <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-200 font-serif leading-relaxed italic">
                                        {briefing.narrative}
                                    </p>
                                </div>

                                <div className="p-6 rounded-[2rem] bg-bible-gold/5 border border-bible-gold/10 space-y-3">
                                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                                        <MessageCircle className="w-3 h-3" /> The Prayer
                                    </span>
                                    <p className="text-lg font-serif text-white italic leading-relaxed">
                                        "{briefing.prayer}"
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 pt-6">
                                <Button
                                    onClick={() => navigate(`/read?book=${briefing.bookId.toLowerCase()}&chapter=${briefing.chapter}&verse=${briefing.verse}`)}
                                    className="flex-1 h-16 bg-white text-slate-900 font-black rounded-2xl gap-3 shadow-xl hover:bg-bible-gold transition-all"
                                >
                                    <Play className="w-5 h-5 fill-current" />
                                    Start Immersion
                                </Button>
                                <button className="w-16 h-16 rounded-2xl glass-dark border border-white/10 flex items-center justify-center text-white hover:text-rose-400 active:scale-90 transition-all">
                                    <Heart className="w-6 h-6" />
                                </button>
                                <button className="w-16 h-16 rounded-2xl glass-dark border border-white/10 flex items-center justify-center text-white hover:text-bible-gold active:scale-90 transition-all">
                                    <Share2 className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {loading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xl">
                    <div className="text-center space-y-6">
                        <div className="relative">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                                className="w-32 h-32 rounded-full border-t-2 border-bible-gold border-r-2 border-transparent"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Sparkles className="w-8 h-8 text-bible-gold animate-pulse" />
                            </div>
                        </div>
                        <p className="font-serif italic text-bible-gold tracking-[0.2em] uppercase text-xs">Weaving your narrative...</p>
                    </div>
                </div>
            )}
        </div>
    )
}
