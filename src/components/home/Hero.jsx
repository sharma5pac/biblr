import { motion, AnimatePresence } from 'framer-motion'
import { Play, Sparkles, BookOpen, Volume2, Globe, Bookmark, Star, Zap, Clock, ChevronLeft, ChevronRight, Heart, Search, Bell } from 'lucide-react'
import { Button } from '../ui/Button'
import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

// Authentic Church & Worship Focused Data
const devotionals = [
    {
        id: 1,
        title: "The Holy Sanctuary",
        subtitle: "Psalm 84:1-2",
        description: "How amiable are thy tabernacles, O Lord of hosts! My soul longeth, yea, even fainteth for the courts of the Lord.",
        time: "4m",
        art: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=1200", // Church interior cathedral
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
        art: "https://images.unsplash.com/photo-1510132919161-077cc203673c?auto=format&fit=crop&q=80&w=1200", // Candle light in church
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
        art: "https://images.unsplash.com/photo-1548625361-195fe57724a0?auto=format&fit=crop&q=80&w=1200", // Beautiful church exterior
        color: "from-blue-400 to-indigo-600",
        theme: "Prayer",
        book: "isa",
        chapter: 56
    },
    {
        id: 4,
        title: "Radiant Worship",
        subtitle: "Revelation 4:11",
        description: "Thou art worthy, O Lord, to receive glory and honour and power: for thou hast created all things.",
        time: "7m",
        art: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=1200", // Worship concert/gathering
        color: "from-emerald-400 to-green-600",
        theme: "Glory",
        book: "rev",
        chapter: 4
    },
    {
        id: 5,
        title: "The Eternal Word",
        subtitle: "Psalm 119:105",
        description: "Thy word is a lamp unto my feet, and a light unto my path.",
        time: "3m",
        art: "https://images.unsplash.com/photo-1504052434569-70ad58165d8f?auto=format&fit=crop&q=80&w=1200", // Bible in church
        color: "from-bible-gold to-yellow-700",
        theme: "Guidance",
        book: "psa",
        chapter: 119
    },
    {
        id: 6,
        title: "Pure Devotion",
        subtitle: "Psalm 27:4",
        description: "One thing have I desired of the Lord, that will I seek after; that I may dwell in the house of the Lord.",
        time: "5m",
        art: "https://images.unsplash.com/photo-1507434965515-61970f2bd7c6?auto=format&fit=crop&q=80&w=1200", // Sunlight in sanctuary
        color: "from-sky-400 to-blue-600",
        theme: "Desire",
        book: "psa",
        chapter: 27
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
        <div className="max-w-2xl mx-auto px-4 pb-24 space-y-6 pt-2">
            {/* App Header */}
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
                    <button className="w-10 h-10 rounded-full glass-dark border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                        <Search className="w-5 h-5" />
                    </button>
                    <button className="w-10 h-10 rounded-full glass-dark border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-bible-gold rounded-full border-2 border-slate-950" />
                    </button>
                </div>
            </header>

            {/* Main Interactive Card */}
            <div className="relative group cursor-pointer" onClick={nextSlide}>
                <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div
                        key={activeDeVo.id}
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 1.05, y: -10 }}
                        transition={{ duration: 0.6, ease: "anticipate" }}
                        className="relative h-[500px] rounded-[3rem] overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] border border-white/10 bg-slate-900"
                    >
                        {/* THE PICTURE - Church/Worship Focused */}
                        <motion.div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${activeDeVo.art})` }}
                            initial={{ scale: 1.2 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 10 }}
                        >
                            {/* Slightly lighter gradient to ensure pictures are visible but text remains readable */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                        </motion.div>

                        {/* Content */}
                        <div className="absolute inset-0 p-10 flex flex-col justify-end">
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
                                    <h2 className="text-4xl font-serif font-bold text-white leading-tight group-hover:text-bible-gold transition-colors">{activeDeVo.title}</h2>
                                    <p className="text-bible-gold text-xl font-serif italic">{activeDeVo.subtitle}</p>
                                </div>

                                <p className="text-slate-100 text-lg leading-relaxed font-serif italic opacity-90 line-clamp-3">
                                    "{activeDeVo.description}"
                                </p>

                                <div className="flex items-center gap-3 pt-6">
                                    <Link
                                        to={`/audio?book=${activeDeVo.book}&chapter=${activeDeVo.chapter}`}
                                        className="flex-1"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Button className="w-full h-14 bg-white text-slate-900 font-black rounded-2xl gap-3 hover:bg-bible-gold transition-all shadow-2xl active:scale-95 text-lg">
                                            <Play className="w-5 h-5 fill-current" />
                                            Listen Now
                                        </Button>
                                    </Link>
                                    <button
                                        className="w-14 h-14 rounded-2xl glass-dark border border-white/10 flex items-center justify-center text-white hover:text-rose-400 transition-all active:scale-90 shadow-xl"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Heart className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Top HUD */}
                        <div className="absolute top-10 left-10 right-10 flex justify-between items-center z-10 pointer-events-none">
                            <div className="flex gap-1.5 flex-1 max-w-[150px]">
                                {devotionals.map((item, i) => (
                                    <div
                                        key={item.id}
                                        className={`h-1 rounded-full transition-all duration-500 flex-1 ${i === currentIndex ? 'bg-bible-gold' : 'bg-white/20'}`}
                                    />
                                ))}
                            </div>
                            <span className="text-[10px] font-black text-white/50 uppercase tracking-tighter bg-black/20 px-2 py-1 rounded-full backdrop-blur-sm">Tap Screen to Discover</span>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Dashboard Quick Links */}
            <div className="grid grid-cols-2 gap-4">
                <Link to="/read" className="group h-40 relative overflow-hidden rounded-[2.5rem] border border-white/5 active:scale-95 transition-all shadow-xl">
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=400)' }}>
                        <div className="absolute inset-0 bg-slate-950/70 group-hover:bg-slate-950/60 transition-colors" />
                    </div>
                    <div className="relative h-full p-6 flex flex-col justify-between">
                        <div className="w-10 h-10 rounded-2xl glass-gold flex items-center justify-center text-bible-gold shadow-lg">
                            <Zap className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5">
                            <h3 className="font-bold text-white text-sm">Holy Insights</h3>
                            <p className="text-[10px] text-bible-gold/70 font-bold uppercase tracking-widest">Deep context</p>
                        </div>
                    </div>
                </Link>

                <Link to="/bookmarks" className="group h-40 relative overflow-hidden rounded-[2.5rem] border border-white/5 active:scale-95 transition-all shadow-xl">
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1510132919161-077cc203673c?auto=format&fit=crop&q=80&w=400)' }}>
                        <div className="absolute inset-0 bg-slate-950/70 group-hover:bg-slate-950/60 transition-colors" />
                    </div>
                    <div className="relative h-full p-6 flex flex-col justify-between">
                        <div className="w-10 h-10 rounded-2xl glass-dark flex items-center justify-center text-purple-400 shadow-lg border border-purple-500/20">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5">
                            <h3 className="font-bold text-white text-sm">Your Sanctuary</h3>
                            <p className="text-[10px] text-purple-400/70 font-bold uppercase tracking-widest">Saved Truth</p>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Bottom App Nav Bar */}
            <div className="fixed bottom-6 left-4 right-4 z-[100]">
                <div className="max-w-md mx-auto flex justify-between items-center px-6 py-4 bg-slate-950/90 backdrop-blur-2xl rounded-[2rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                    {[
                        { icon: Globe, label: 'Home', path: '/' },
                        { icon: BookOpen, label: 'Read', path: '/read' },
                        { icon: Volume2, label: 'Audio', path: '/audio' },
                        { icon: Search, label: 'Search', path: '/search' }
                    ].map((item, i) => (
                        <Link key={item.label} to={item.path} className="flex flex-col items-center gap-1 group">
                            <div className={`p-2 rounded-xl transition-all ${item.path === '/' ? 'text-bible-gold bg-bible-gold/10' : 'text-slate-500 hover:text-white'}`}>
                                <item.icon className="w-6 h-6" />
                            </div>
                            <span className={`text-[8px] font-black uppercase tracking-tighter ${item.path === '/' ? 'text-bible-gold' : 'text-slate-600'}`}>{item.label}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
