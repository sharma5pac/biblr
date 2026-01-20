import { motion, AnimatePresence } from 'framer-motion'
import { Play, Sparkles, BookOpen, Volume2, Globe, Bookmark, Star, Zap, Clock, ChevronLeft, ChevronRight, Heart, Search, Bell, Waves, Activity } from 'lucide-react'
import { Button } from '../ui/Button'
import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

const devotionals = [
    {
        id: 1,
        title: "The Holy Sanctuary",
        subtitle: "Psalm 84:1-2",
        description: "How amiable are thy tabernacles, O Lord of hosts! My soul longeth...",
        time: "4m",
        art: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=1200",
        color: "from-amber-400 to-yellow-600",
        theme: "Presence",
        book: "psa",
        chapter: 84
    },
    {
        id: 2,
        title: "A Light in Darkness",
        subtitle: "Matthew 5:14",
        description: "Ye are the light of the world. A city that is set on a hill cannot be hid.",
        time: "5m",
        art: "https://images.unsplash.com/photo-1510132919161-077cc203673c?auto=format&fit=crop&q=80&w=1200",
        color: "from-orange-400 to-red-600",
        theme: "Truth",
        book: "mat",
        chapter: 5
    },
    {
        id: 3,
        title: "House of Prayer",
        subtitle: "Isaiah 56:7",
        description: "For mine house shall be called an house of prayer for all people.",
        time: "6m",
        art: "https://images.unsplash.com/photo-1548625361-195fe57724a0?auto=format&fit=crop&q=80&w=1200",
        color: "from-blue-400 to-indigo-600",
        theme: "Prayer",
        book: "isa",
        chapter: 56
    }
]

export function Hero() {
    const navigate = useNavigate()
    const [currentIndex, setCurrentIndex] = useState(0)
    const [greeting, setGreeting] = useState('Good Morning')
    const [isAutoPlaying, setIsAutoPlaying] = useState(true)

    useEffect(() => {
        const hour = new Date().getHours()
        if (hour >= 12 && hour < 17) setGreeting('Good Afternoon')
        else if (hour >= 17) setGreeting('Good Evening')

        let interval;
        if (isAutoPlaying) {
            interval = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % devotionals.length)
            }, 8000)
        }
        return () => clearInterval(interval)
    }, [isAutoPlaying])

    const nextSlide = (e) => {
        if (e) e.stopPropagation()
        setCurrentIndex((prev) => (prev + 1) % devotionals.length)
        setIsAutoPlaying(false)
        setTimeout(() => setIsAutoPlaying(true), 30000)
    }

    const activeDeVo = devotionals[currentIndex]

    return (
        <div className="max-w-2xl mx-auto px-4 pb-40 space-y-6 pt-2">
            {/* Watch-Style Faith Pulse Widget */}
            <div className="flex justify-center -mt-4">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-dark rounded-full px-4 py-2 flex items-center gap-3 border border-bible-gold/20 shadow-lg shadow-bible-gold/5"
                >
                    <div className="relative">
                        <Activity className="w-4 h-4 text-bible-gold animate-pulse" />
                        <div className="absolute inset-0 bg-bible-gold/20 rounded-full animate-ping" />
                    </div>
                    <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">Faith Pulse: <span className="text-bible-gold">Strong</span></span>
                    <div className="w-px h-3 bg-white/10" />
                    <span className="text-[10px] text-white/40 font-bold uppercase tracking-tighter">72 BPM (Spirit)</span>
                </motion.div>
            </div>

            {/* Header */}
            <header className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-bible-gold to-yellow-600 flex items-center justify-center shadow-lg shadow-bible-gold/30">
                        <BookOpen className="w-6 h-6 text-slate-900" />
                    </div>
                    <div>
                        <h1 className="text-xl font-serif font-bold text-white tracking-tight">{greeting}</h1>
                        <p className="text-[10px] text-bible-gold font-bold uppercase tracking-widest opacity-80">Daily Sanctuary</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="w-10 h-10 rounded-full glass-dark border border-white/10 flex items-center justify-center text-slate-400 hover:text-white-80 shadow-inner">
                        <Search className="w-5 h-5" />
                    </button>
                    <button className="w-10 h-10 rounded-full glass-dark border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-bible-gold rounded-full border-2 border-slate-950" />
                    </button>
                </div>
            </header>

            {/* Daily Manna Prompt Card */}
            <Link to="/manna" className="block group relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-500/20 via-slate-900 to-slate-900 p-8 border border-emerald-500/20 active:scale-95 transition-all shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest">Daily Manna AI</h3>
                    </div>
                    <Waves className="w-5 h-5 text-emerald-500/30 animate-pulse" />
                </div>
                <h4 className="text-2xl font-serif font-bold text-white mb-2 leading-tight">Need a Hope Briefing?</h4>
                <p className="text-slate-400 text-xs leading-relaxed max-w-[80%]">Tell Lumina how you feel, and receive a personalized spiritual narrative woven for your soul.</p>
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
            </Link>

            {/* Verse Gallery */}
            <div className="relative group cursor-pointer" onClick={nextSlide}>
                <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div
                        key={activeDeVo.id}
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 1.05, y: -10 }}
                        transition={{ duration: 0.6, ease: "anticipate" }}
                        className="relative h-[440px] rounded-[3rem] overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] border border-white/10 bg-slate-900"
                    >
                        <motion.div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${activeDeVo.art})` }}
                            initial={{ scale: 1.2 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 10 }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                        </motion.div>

                        <div className="absolute inset-0 p-8 flex flex-col justify-end">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${activeDeVo.color} text-white text-[10px] font-black uppercase tracking-widest shadow-lg`}>
                                        {activeDeVo.theme}
                                    </div>
                                    <span className="text-white/70 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {activeDeVo.time}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-3xl font-serif font-bold text-white leading-tight">{activeDeVo.title}</h2>
                                    <p className="text-bible-gold text-lg font-serif italic">{activeDeVo.subtitle}</p>
                                </div>
                                <p className="text-slate-100 text-base leading-relaxed font-serif italic opacity-90 line-clamp-2">"{activeDeVo.description}"</p>
                                <div className="flex items-center gap-3 pt-4">
                                    <Link to={`/audio?book=${activeDeVo.book}&chapter=${activeDeVo.chapter}`} className="flex-1" onClick={e => e.stopPropagation()}>
                                        <Button className="w-full h-12 bg-white text-slate-900 font-bold rounded-2xl gap-2 hover:bg-bible-gold transition-all active:scale-95">
                                            <Play className="w-4 h-4 fill-current" /> Listen
                                        </Button>
                                    </Link>
                                    <button className="w-12 h-12 rounded-2xl glass-dark border border-white/10 flex items-center justify-center text-white active:scale-90 transition-all" onClick={e => e.stopPropagation()}>
                                        <Heart className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-10">
                            <div className="flex gap-1 flex-1 max-w-[120px]">
                                {devotionals.map((item, i) => (
                                    <div key={item.id} className={`h-1 rounded-full transition-all duration-500 flex-1 ${i === currentIndex ? 'bg-bible-gold' : 'bg-white/20'}`} />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 gap-4">
                <Link to="/read" className="group h-36 relative overflow-hidden rounded-[2.5rem] border border-white/5 shadow-xl">
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=400)' }} />
                    <div className="absolute inset-0 bg-slate-950/70" />
                    <div className="relative h-full p-6 flex flex-col justify-between">
                        <div className="w-8 h-8 rounded-xl glass-gold flex items-center justify-center text-bible-gold"><Zap className="w-4 h-4" /></div>
                        <h3 className="font-bold text-white text-xs">Holy Insights</h3>
                    </div>
                </Link>
                <Link to="/bookmarks" className="group h-36 relative overflow-hidden rounded-[2.5rem] border border-white/5 shadow-xl">
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1510132919161-077cc203673c?auto=format&fit=crop&q=80&w=400)' }} />
                    <div className="absolute inset-0 bg-slate-950/70" />
                    <div className="relative h-full p-6 flex flex-col justify-between">
                        <div className="w-8 h-8 rounded-xl glass-dark flex items-center justify-center text-purple-400"><Sparkles className="w-4 h-4" /></div>
                        <h3 className="font-bold text-white text-xs">Sanctuary</h3>
                    </div>
                </Link>
            </div>
        </div>
    )
}
