import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, BookOpen, Users, Headphones, Menu, X, Sparkles, LogIn, Download, Search, Bookmark, Settings, ShieldCheck } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { AuthModal } from '../auth/AuthModal'
import { Button } from '../ui/Button'
import { OfflineIndicator } from '../ui/OfflineIndicator'
import { RatingPrompt } from '../ui/RatingPrompt'

export function Layout({ children }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [authModalOpen, setAuthModalOpen] = useState(false)
    const [deferredPrompt, setDeferredPrompt] = useState(null)
    const { user, logout } = useAuth()

    useEffect(() => {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault()
            setDeferredPrompt(e)
        })
    }, [])

    const handleInstallClick = async () => {
        if (!deferredPrompt) return
        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        if (outcome === 'accepted') {
            setDeferredPrompt(null)
        }
    }

    const navItems = [
        { to: '/', icon: Home, label: 'Home' },
        { to: '/read', icon: BookOpen, label: 'Read' },
        { to: '/audio', icon: Headphones, label: 'Audio' }
    ]

    const secondaryNavItems = [
        { to: '/search', icon: Search, label: 'Search' },
        { to: '/bookmarks', icon: Bookmark, label: 'Bookmarks' },
        { to: '/settings', icon: Settings, label: 'Settings' },
    ]

    return (
        <div className="min-h-screen text-slate-100 flex flex-col">
            <OfflineIndicator />
            <RatingPrompt />
            {/* Floating Header with Glassmorphism */}
            <header className="sticky top-0 z-50 glass-dark">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <NavLink to="/" className="flex items-center gap-3 group">
                        <img
                            src="/logo.png"
                            alt="Lumina Logo"
                            className="w-12 h-12 rounded-xl shadow-lg shadow-bible-gold/20 group-hover:scale-110 transition-transform"
                        />
                        <div>
                            <span className="text-xl font-serif font-bold text-bible-gold glow-text">Lumina</span>
                            <span className="text-xs text-slate-500 block -mt-1">Bible</span>
                        </div>
                    </NavLink>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navItems.map(item => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${isActive
                                        ? 'glass-gold text-bible-gold glow-gold'
                                        : 'text-slate-400 hover:text-slate-100 hover:glass'
                                    }`
                                }
                            >
                                <item.icon className="w-4 h-4" />
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="flex items-center gap-2">
                        {/* Secondary Nav Icons (Desktop) */}
                        <div className="hidden md:flex items-center gap-1 mr-2">
                            {secondaryNavItems.map(item => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    className={({ isActive }) =>
                                        `p-2.5 rounded-lg transition-all ${isActive
                                            ? 'bg-bible-gold/20 text-bible-gold'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }`
                                    }
                                    title={item.label}
                                >
                                    <item.icon className="w-5 h-5" />
                                </NavLink>
                            ))}
                        </div>

                        {/* Install App Button (Desktop) */}
                        {deferredPrompt && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="hidden md:flex mr-2 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                                onClick={handleInstallClick}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Install
                            </Button>
                        )}
                        {/* User Menu / Login Button */}
                        {user ? (
                            <div className="hidden md:flex items-center gap-3 pl-4 border-l border-bible-glass-border">
                                <div className="text-right">
                                    <div className="text-sm font-medium text-bible-text">{user.name}</div>
                                    <button onClick={logout} className="text-xs text-bible-text/40 hover:text-bible-gold transition-colors">Sign Out</button>
                                </div>
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-bible-text/5 flex items-center justify-center text-sm font-bold border-2 border-bible-glass-border shadow-lg">
                                    {user.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = `https://ui-avatars.com/api/?name=${user.name}&background=EAB308&color=0F172A`;
                                            }}
                                        />
                                    ) : (
                                        user.name[0]
                                    )}
                                </div>
                            </div>
                        ) : (
                            <Button
                                size="sm"
                                className="hidden md:flex hover:scale-105"
                                onClick={() => setAuthModalOpen(true)}
                            >
                                <LogIn className="w-4 h-4 mr-2" />
                                Sign In
                            </Button>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-slate-400 hover:text-slate-100 glass rounded-xl ml-2"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Nav */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.nav
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden glass-dark border-t border-white/5"
                        >
                            <div className="p-4 border-b border-white/5 mb-2">
                                {user ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-700 flex items-center justify-center text-sm font-bold border border-white/10">
                                            {user.avatar ? (
                                                <img
                                                    src={user.avatar}
                                                    alt={user.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = `https://ui-avatars.com/api/?name=${user.name}&background=EAB308&color=0F172A`;
                                                    }}
                                                />
                                            ) : (
                                                user.name[0]
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-white">{user.name}</div>
                                            <div className="text-xs text-slate-500">{user.email}</div>
                                        </div>
                                        <Button size="sm" variant="ghost" onClick={logout}>Sign Out</Button>
                                    </div>
                                ) : (
                                    <Button className="w-full glass-gold" onClick={() => { setAuthModalOpen(true); setMobileMenuOpen(false) }}>
                                        <LogIn className="w-4 h-4 mr-2" />
                                        Sign In or Join
                                    </Button>
                                )}
                            </div>

                            {navItems.map(item => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all ${isActive
                                            ? 'bg-bible-gold/10 text-bible-gold border-l-2 border-bible-gold'
                                            : 'text-slate-400 hover:bg-white/5'
                                        }`
                                    }
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.label}
                                </NavLink>
                            ))}

                            {/* Install App Button (Mobile) */}
                            {deferredPrompt && (
                                <div className="p-4 border-t border-white/5">
                                    <Button
                                        onClick={handleInstallClick}
                                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90"
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Install App
                                    </Button>
                                </div>
                            )}
                        </motion.nav>
                    )}
                </AnimatePresence>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 py-8 pb-24 md:pb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                    {children}
                </motion.div>
            </main>

            {/* Auth Modal */}
            <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

            {/* Mobile Bottom Nav - Glassmorphism */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-dark border-t border-white/10 z-50">
                <div className="flex items-center justify-around py-2 px-2">
                    {navItems.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-300 ${isActive
                                    ? 'text-bible-gold glass-gold'
                                    : 'text-slate-500 hover:text-slate-300'
                                }`
                            }
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="text-xs">{item.label}</span>
                        </NavLink>
                    ))}
                </div>
            </nav>
        </div>
    )
}
