import { motion, AnimatePresence } from 'framer-motion'
import { Play, Sparkles, BookOpen, Volume2, Globe, Bookmark, Star, Zap, Clock, ChevronLeft, ChevronRight, Heart, Search, Bell, Waves, Activity } from 'lucide-react'
import { Button } from '../ui/Button'
import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

// Image Pool from public/bible-images
const bibleImages = [
    '/bible-images/alex-shute-aJeqJvAN0Bg-unsplash.jpg',
    '/bible-images/arto-marttinen-fHXP17AxOEk-unsplash.jpg',
    '/bible-images/clive-thibela-ZAq4eTAkGC4-unsplash.jpg',
    '/bible-images/davide-cantelli-H3giJcTw__w-unsplash.jpg',
    '/bible-images/edwin-andrade-6liebVeAfrY-unsplash.jpg',
    '/bible-images/hannah-busing-FF049vNP1eg-unsplash.jpg',
    '/bible-images/joann-martinez-IvKTu86Ug2Y-unsplash.jpg',
    '/bible-images/keagan-henman-5ja5Bh_l13Y-unsplash.jpg',
    '/bible-images/keagan-henman-mU85sCiU_08-unsplash.jpg',
    '/bible-images/kirby-taylor-TdGWoYby3jc-unsplash.jpg',
    '/bible-images/terren-hurst-9WPcn1i5jJ4-unsplash.jpg'
]

// Extended Verse Pool
const versePool = [
    { title: "The Holy Sanctuary", subtitle: "Psalm 84:1-2", description: "How amiable are thy tabernacles, O Lord of hosts! My soul longeth...", color: "from-amber-400 to-yellow-600", theme: "Presence", book: "psa", chapter: 84 },
    { title: "A Light in Darkness", subtitle: "Matthew 5:14", description: "Ye are the light of the world. A city that is set on a hill cannot be hid.", color: "from-orange-400 to-red-600", theme: "Truth", book: "mat", chapter: 5 },
    { title: "House of Prayer", subtitle: "Isaiah 56:7", description: "For mine house shall be called an house of prayer for all people.", color: "from-blue-400 to-indigo-600", theme: "Prayer", book: "isa", chapter: 56 },
    { title: "The Good Shepherd", subtitle: "Psalm 23:1", description: "The Lord is my shepherd; I shall not want.", color: "from-emerald-400 to-green-600", theme: "Peace", book: "psa", chapter: 23 },
    { title: "Living Water", subtitle: "John 4:14", description: "But whosoever drinketh of the water that I shall give him shall never thirst.", color: "from-cyan-400 to-blue-600", theme: "Life", book: "jhn", chapter: 4 },
    { title: "Renewed Strength", subtitle: "Isaiah 40:31", description: "But they that wait upon the Lord shall renew their strength.", color: "from-purple-400 to-pink-600", theme: "Strength", book: "isa", chapter: 40 },
    { title: "Perfect Peace", subtitle: "Isaiah 26:3", description: "Thou wilt keep him in perfect peace, whose mind is stayed on thee.", color: "from-indigo-400 to-purple-600", theme: "Trust", book: "isa", chapter: 26 },
    { title: "Fear Not", subtitle: "Isaiah 41:10", description: "Fear thou not; for I am with thee: be not dismayed; for I am thy God.", color: "from-rose-400 to-red-600", theme: "Courage", book: "isa", chapter: 41 },
    { title: "New Creation", subtitle: "2 Corinthians 5:17", description: "Therefore if any man be in Christ, he is a new creature.", color: "from-teal-400 to-emerald-600", theme: "New Life", book: "2co", chapter: 5 },
    { title: "Divine Love", subtitle: "Romans 8:38-39", description: "For I am persuaded, that neither death, nor life... shall be able to separate us from the love of God.", color: "from-pink-400 to-rose-600", theme: "Love", book: "rom", chapter: 8 },
    { title: "Faith Indwelling", subtitle: "Ephesians 3:17", description: "That Christ may dwell in your hearts by faith; that ye, being rooted and grounded in love.", color: "from-violet-400 to-purple-600", theme: "Faith", book: "eph", chapter: 3 }
]

export function Hero() {
    const navigate = useNavigate()
    const [currentIndex, setCurrentIndex] = useState(0)
    const [greeting, setGreeting] = useState('Good Morning')
    const [isAutoPlaying, setIsAutoPlaying] = useState(true)
    const [devotionals, setDevotionals] = useState([])

    // Randomize cards on mount
    useEffect(() => {
        const shuffledImages = [...bibleImages].sort(() => 0.5 - Math.random())
        const shuffledVerses = [...versePool].sort(() => 0.5 - Math.random())

        // Create cards by pairing shuffled verses with shuffled images
        const generatedDevotionals = shuffledVerses.map((verse, index) => ({
            ...verse,
            id: index,
            // Cycle through images if we have more verses than images
            art: shuffledImages[index % shuffledImages.length],
            time: `${3 + Math.floor(Math.random() * 5)}m` // Random time 3-8m
        }))

        setDevotionals(generatedDevotionals)
    }, [])

    useEffect(() => {
        const hour = new Date().getHours()
        if (hour >= 12 && hour < 17) setGreeting('Good Afternoon')
        else if (hour >= 17) setGreeting('Good Evening')

        let interval;
        if (isAutoPlaying && devotionals.length > 0) {
            interval = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % devotionals.length)
            }, 8000)
        }
        return () => clearInterval(interval)
    }, [isAutoPlaying, devotionals.length])

    const nextSlide = (e) => {
        if (e) e.stopPropagation()
        if (devotionals.length === 0) return
        setCurrentIndex((prev) => (prev + 1) % devotionals.length)
        setIsAutoPlaying(false)
        setTimeout(() => setIsAutoPlaying(true), 30000)
    }

    const activeDeVo = devotionals.length > 0 ? devotionals[currentIndex] : null

    if (!activeDeVo) return null // or a loading skeleton

    return (
        <div className="max-w-2xl mx-auto px-4 pb-28 space-y-6 pt-2">
            {/* Dynamic Island Removed */}

            {/* Header */}
            <header className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-bible-gold to-yellow-600 flex items-center justify-center shadow-lg shadow-bible-gold/30">
                        <BookOpen className="w-6 h-6 text-slate-900" />
                    </div>
                    <div>
                        <h1 className="text-xl font-serif font-bold text-white tracking-tight">{greeting}</h1>
                        <p className="text-[10px] text-white font-bold uppercase tracking-widest opacity-80">Daily Sanctuary</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link to="/search" className="w-10 h-10 rounded-full glass-dark border border-black/10 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors shadow-inner">
                        <Search className="w-5 h-5" />
                    </Link>
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
                        className="island-panel relative h-[480px] rounded-[3rem] overflow-hidden"
                    >
                        {/* Shine Effect */}
                        <div className="absolute inset-0 pointer-events-none z-20 shine-overlay mix-blend-overlay opacity-30"></div>
                        <motion.div
                            className="absolute inset-0"
                            initial={{ scale: 1.2 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 10 }}
                        >
                            <img
                                src={activeDeVo.art}
                                alt={activeDeVo.title}
                                className="w-full h-full object-cover"
                                loading="eager"
                                fetchPriority="high"
                            />
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

            {/* Voices of Faith Quotes */}
            <div className="space-y-6">
                <h2 className="text-sm font-bold text-slate-100 uppercase tracking-widest pl-2 opacity-90">Voices of Faith</h2>
                <div className="space-y-4">
                    {[
                        {
                            tag: "#SALVATION",
                            text: "God proved His love on the Cross. When Christ hung, and bled, and died, it was God saying to the world, 'I love you.'",
                            author: "Billy Graham",
                            title: "EVANGELIST",
                            initials: "BG",
                            color: "text-amber-400",
                            bg: "bg-amber-500/10",
                            border: "border-amber-500/20",
                            link: "https://billygraham.org/"
                        },
                        {
                            tag: "#PURPOSE",
                            text: "You are not an accident. You are not a mass produced product of an assembly line. You are a masterpiece deeply loved by God.",
                            author: "Tony Evans",
                            title: "PASTOR & AUTHOR",
                            initials: "TE",
                            color: "text-emerald-400",
                            bg: "bg-emerald-500/10",
                            border: "border-emerald-500/20",
                            link: "https://tonyevans.org/"
                        },
                        {
                            tag: "#FAITH",
                            text: "Faith is seeing light with your heart when all your eyes see is darkness.",
                            author: "Barbara Brown Taylor",
                            title: "THEOLOGIAN",
                            initials: "BT",
                            color: "text-blue-400",
                            bg: "bg-blue-500/10",
                            border: "border-blue-500/20",
                            link: "https://barbarabrowntaylor.com/"
                        },
                        {
                            tag: "#DESTINY",
                            text: "If you can't figure out your purpose, figure out your passion. For your passion will lead you right into your purpose.",
                            author: "T.D. Jakes",
                            title: "BISHOP",
                            initials: "TJ",
                            color: "text-rose-400",
                            bg: "bg-rose-500/10",
                            border: "border-rose-500/20",
                            link: "https://www.tdjakes.org/"
                        },
                        {
                            tag: "#GRACE",
                            text: "Grace is not opposed to effort, it is opposed to earning. Earning is an attitude. Effort is an action.",
                            author: "Dallas Willard",
                            title: "PHILOSOPHER",
                            initials: "DW",
                            color: "text-purple-400",
                            bg: "bg-purple-500/10",
                            border: "border-purple-500/20",
                            link: "https://dwillard.org/"
                        }
                    ].map((quote, i) => (
                        <div key={i} className={`p-6 rounded-[2rem] glass-dark border ${quote.border} relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500`}>
                            {/* Decorative Background */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-[4rem] -mr-8 -mt-8" />

                            {/* Header: Tag + Icon */}
                            <div className="flex justify-between items-start mb-6">
                                <span className={`px-3 py-1 rounded-full ${quote.bg} ${quote.color} text-[10px] font-black uppercase tracking-widest border ${quote.border}`}>
                                    {quote.tag}
                                </span>
                                <div className="text-slate-600">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 opacity-20">
                                        <path d="M14.017 21L14.017 18C14.017 16.896 14.321 15.925 14.927 15.086C15.533 14.248 16.486 13.562 17.785 13.028L18.667 14.654C17.765 14.981 17.155 15.349 16.837 15.759C16.519 16.168 16.36 16.632 16.36 17.149L16.36 21L14.017 21ZM5 21L5 18C5 16.896 5.304 15.925 5.909 15.086C6.515 14.248 7.468 13.562 8.767 13.028L9.649 14.654C8.747 14.981 8.136 15.349 7.818 15.759C7.501 16.168 7.342 16.632 7.342 17.149L7.342 21L5 21Z" />
                                    </svg>
                                </div>
                            </div>

                            {/* Quote Text */}
                            <p className="text-2xl font-serif text-slate-200 leading-snug mb-8 relative z-10">
                                "{quote.text}"
                            </p>

                            {/* Author Footer */}
                            <div className="flex items-center justify-between border-t border-slate-200 dark:border-white/5 pt-4">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full ${quote.bg} border ${quote.border} flex items-center justify-center`}>
                                        <span className={`text-xs font-bold ${quote.color}`}>{quote.initials}</span>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white">{quote.author}</h4>
                                        <p className={`text-[10px] font-bold uppercase tracking-wider opacity-70 ${quote.color}`}>{quote.title}</p>
                                    </div>
                                </div>
                                <a
                                    href={quote.link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Globe className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Links (Enhanced) */}
            <div className="grid grid-cols-2 gap-4">
                <Link to="/read" className="island-panel group h-40 relative overflow-hidden rounded-[2.5rem]">
                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: "url('/bible-images/alex-shute-aJeqJvAN0Bg-unsplash.jpg')" }} />
                    <div className="absolute inset-0 bg-slate-950/60 group-hover:bg-slate-950/50 transition-colors" />
                    <div className="relative h-full p-5 flex flex-col justify-between">
                        <div className="w-10 h-10 rounded-2xl glass-gold flex items-center justify-center text-bible-gold shadow-lg shadow-bible-gold/20"><Zap className="w-5 h-5" /></div>
                        <div>
                            <h3 className="font-bold text-white text-base mb-1">Visual Theology</h3>
                            <p className="text-[10px] text-slate-300 leading-tight opacity-90">Deep dive into scripture visualized.</p>
                        </div>
                    </div>
                </Link>
                <Link to="/bookmarks" className="island-panel group h-40 relative overflow-hidden rounded-[2.5rem]">
                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: "url('/bible-images/hannah-busing-FF049vNP1eg-unsplash.jpg')" }} />
                    <div className="absolute inset-0 bg-slate-950/60 group-hover:bg-slate-950/50 transition-colors" />
                    <div className="relative h-full p-5 flex flex-col justify-between">
                        <div className="w-10 h-10 rounded-2xl glass-dark border border-white/10 flex items-center justify-center text-purple-400 shadow-lg"><Sparkles className="w-5 h-5" /></div>
                        <div>
                            <h3 className="font-bold text-white text-base mb-1">Quiet Space</h3>
                            <p className="text-[10px] text-slate-300 leading-tight opacity-90">Your personal sanctuary for peace.</p>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    )
}
