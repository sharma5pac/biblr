import { motion } from 'framer-motion'
import { Play, Sparkles, BookOpen, Volume2, Globe, Download } from 'lucide-react'
import { Button } from '../ui/Button'
import { Link } from 'react-router-dom'

export function Hero() {
    return (
        <div className="space-y-12">
            {/* Hero Section */}
            <section className="text-center space-y-8 pt-8 md:pt-16">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-4"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-gold text-bible-gold text-sm font-medium">
                        <Sparkles className="w-4 h-4" />
                        AI-Powered Bible Study
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold font-serif text-slate-100 tracking-tight leading-tight">
                        Find Clarity in <br />
                        <span className="text-bible-gold glow-text">The Word</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Experience the Bible like never before with AI-powered insights, immersive daily audio devotionals, and a distraction-free reader.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Link to="/read">
                        <Button size="lg" className="gap-2 glow-gold">
                            <BookOpen className="w-5 h-5" />
                            Start Reading
                        </Button>
                    </Link>
                    <Link to="/audio">
                        <Button size="lg" variant="secondary" className="gap-2 glass">
                            <Play className="w-5 h-5 text-bible-gold" />
                            Listen to Devotional
                        </Button>
                    </Link>
                </motion.div>
            </section>

            {/* Feature Cards */}
            <section className="grid md:grid-cols-3 gap-6">
                {[
                    {
                        icon: Sparkles,
                        title: 'AI Study Assistant',
                        description: 'Ask questions about any verse and get instant context, cross-references, and explanations.',
                        color: 'from-yellow-500/20 to-orange-500/20',
                        iconColor: 'text-yellow-400',
                        link: '/read'
                    },
                    {
                        icon: Volume2,
                        title: 'Audio Devotionals',
                        description: 'Listen to daily devotionals and full Bible audiobooks with background playback.',
                        color: 'from-purple-500/20 to-indigo-500/20',
                        iconColor: 'text-purple-400',
                        link: '/audio'
                    },
                    {
                        icon: Globe,
                        title: 'Multi-Language',
                        description: 'Read in KJV, NIV, ESV, Spanish, French, and more - all available offline.',
                        color: 'from-blue-500/20 to-cyan-500/20',
                        iconColor: 'text-blue-400',
                        link: '/read'
                    }
                ].map((feature, i) => (
                    <Link to={feature.link} key={feature.title}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                            className="glass rounded-2xl p-6 hover:scale-105 transition-transform duration-300 cursor-pointer group h-full"
                        >
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                        </motion.div>
                    </Link>
                ))}
            </section>

            {/* Daily Devotional Card */}
            <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="glass rounded-2xl overflow-hidden"
            >
                <div className="grid md:grid-cols-2">
                    <div className="p-8 space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-sm font-medium">
                            <Play className="w-4 h-4" />
                            Today's Devotional
                        </div>
                        <h2 className="text-3xl font-serif font-bold">Walking in Wisdom</h2>
                        <p className="text-slate-400 leading-relaxed">
                            Discover how ancient wisdom from Proverbs 3 applies to your modern life.
                            A 5-minute audio study on trusting God with all your heart.
                        </p>
                        <div className="flex items-center gap-4 pt-2">
                            <Link to="/audio">
                                <Button className="gap-2">
                                    <Play className="w-4 h-4 fill-current" />
                                    Listen Now
                                </Button>
                            </Link>
                            <span className="text-sm text-slate-500">5:23 min</span>
                        </div>
                    </div>
                    <div
                        className="h-64 md:h-auto bg-cover bg-center"
                        style={{ backgroundImage: 'url(/devotional-art.png)' }}
                    />
                </div>
            </motion.section>

            {/* Stats Section */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { value: '66', label: 'Books' },
                    { value: '1,189', label: 'Chapters' },
                    { value: '6+', label: 'Languages' },
                    { value: '∞', label: 'Insights' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.6 + i * 0.1 }}
                        className="glass rounded-xl p-4 text-center"
                    >
                        <div className="text-3xl font-bold text-bible-gold glow-text">{stat.value}</div>
                        <div className="text-sm text-slate-500">{stat.label}</div>
                    </motion.div>
                ))}
            </section>
        </div>
    )
}
