import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, MessageCircle, Heart, Plus, Send, Bell, Search, Sparkles, Loader2, X, Filter, BookOpen } from 'lucide-react'
import { Button } from '../ui/Button'
import { CommunityService } from '../../services/communityService'
import { GroupChat } from './GroupChat'

export function CommunityPage() {
    const [requests, setRequests] = useState([])
    const [groups, setGroups] = useState([])
    const [activeGroup, setActiveGroup] = useState(null)
    const [activeTab, setActiveTab] = useState('requests')
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        category: 'General',
        content: '',
        isAnonymous: false
    })

    const categories = ['General', 'Healing', 'Family', 'Guidance', 'Gratitude', 'Financial', 'Wisdom']

    // Load Data
    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setIsLoading(true)
        try {
            const [reqs, grps] = await Promise.all([
                CommunityService.getRequests(),
                CommunityService.getGroups()
            ])
            setRequests(reqs.sort((a, b) => b.timestamp - a.timestamp))
            setGroups(grps)
        } catch (error) {
            console.error("Failed to load community data", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handlePray = async (id) => {
        setRequests(requests.map(r =>
            r.id === id
                ? { ...r, hasPrayed: !r.hasPrayed, prayedCount: r.hasPrayed ? r.prayedCount - 1 : r.prayedCount + 1 }
                : r
        ))
        await CommunityService.togglePray(id)
    }

    const handlePostRequest = async () => {
        if (!formData.content.trim()) return

        // 1. Optimistic Update (Instant Feedback)
        const tempId = Date.now()
        const tempReq = {
            id: tempId,
            user: formData.isAnonymous ? 'Anonymous' : 'You',
            avatar: formData.isAnonymous ? '?' : 'Me',
            color: formData.isAnonymous ? 'bg-slate-700' : 'bg-bible-gold',
            request: formData.content,
            title: formData.title || '',
            category: formData.category || 'General',
            prayedCount: 0,
            timeAgo: 'Just now',
            hasPrayed: false,
            tags: [formData.category || 'General', 'New'],
            isAnonymous: formData.isAnonymous,
            timestamp: Date.now()
        }

        setRequests([tempReq, ...requests])
        setIsModalOpen(false)
        setFormData({ title: '', category: 'General', content: '', isAnonymous: false })

        // 2. Background Sync
        try { // No spinner needed
            const realReq = await CommunityService.addRequest(formData)
            // Update to use the real ID once confirmed
            setRequests(prev => prev.map(r => r.id === tempId ? realReq : r))
        } catch (error) {
            console.error("Failed to post", error)
            // Optionally rollback or show error toast
        }
    }

    const handleJoinGroup = async (e, id) => {
        e.stopPropagation() // Prevent opening chat when clicking Join
        setGroups(groups.map(g =>
            g.id === id
                ? { ...g, joined: !g.joined, members: g.joined ? g.members - 1 : g.members + 1 }
                : g
        ))
        await CommunityService.toggleJoinGroup(id)
    }

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-bible-gold" />
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 px-4 md:px-0 pb-24">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-serif font-bold glow-text text-bible-gold">Community</h1>
                    <p className="text-slate-400 text-sm md:text-base">Pray together, grow together</p>
                </div>
                {!activeGroup && (
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="shadow-lg shadow-bible-gold/20 glow-gold"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        New Request
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Mobile: Streak Card First */}
                {/* Hide streak on mobile if chat is active to focus on chat */}
                {!activeGroup && (
                    <div className="md:hidden">
                        <StreakCard />
                    </div>
                )}

                {/* Main Column */}
                <div className="md:col-span-2 space-y-6">
                    {activeGroup ? (
                        <GroupChat group={activeGroup} onBack={() => setActiveGroup(null)} />
                    ) : (
                        <>
                            {/* Tabs */}
                            <div className="flex gap-2 p-1 glass rounded-xl sticky top-20 z-10 backdrop-blur-xl">
                                {['requests', 'groups'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === tab
                                            ? 'bg-bible-gold text-slate-900 shadow-lg'
                                            : 'text-slate-400 hover:text-slate-200'
                                            }`}
                                    >
                                        {tab === 'requests' ? 'Prayer Wall' : 'Study Groups'}
                                    </button>
                                ))}
                            </div>

                            <AnimatePresence mode="wait">
                                {activeTab === 'requests' ? (
                                    <motion.div
                                        key="requests"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="space-y-6"
                                    >
                                        {/* Filter / Search */}
                                        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                            <button className="px-4 py-1.5 rounded-full bg-white/10 text-white text-sm whitespace-nowrap border border-white/10">All</button>
                                            {categories.slice(0, 4).map(cat => (
                                                <button key={cat} className="px-4 py-1.5 rounded-full bg-transparent text-slate-400 hover:bg-white/5 text-sm whitespace-nowrap border border-white/5">{cat}</button>
                                            ))}
                                        </div>

                                        {/* Empty State */}
                                        {requests.length === 0 && (
                                            <div className="glass rounded-2xl p-8 text-center space-y-4">
                                                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-600">
                                                    <MessageCircle className="w-8 h-8" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-slate-200">No requests yet</h3>
                                                    <p className="text-slate-400">Be the first to share a prayer request with the community.</p>
                                                </div>
                                                <Button variant="outline" onClick={() => setIsModalOpen(true)}>Create Post</Button>
                                            </div>
                                        )}

                                        {/* List */}
                                        <div className="space-y-4">
                                            {requests.map((request, i) => (
                                                <motion.div
                                                    key={request.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.1 }}
                                                    className="glass rounded-2xl p-5 hover:bg-white/5 transition-colors group border border-white/5 hover:border-white/10"
                                                >
                                                    <div className="flex items-start gap-4">
                                                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${request.color || 'bg-slate-700'} flex items-center justify-center text-white font-bold text-lg shadow-lg shrink-0`}>
                                                            {request.avatar || '?'}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <span className="font-bold text-slate-200">{request.user}</span>
                                                                    <span className="text-xs text-slate-500">• {request.timeAgo}</span>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    {request.category && (
                                                                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-bible-gold/10 text-bible-gold border border-bible-gold/20">
                                                                            {request.category}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {request.title && <h3 className="font-bold text-white mb-1">{request.title}</h3>}

                                                            <p className="text-slate-300 leading-relaxed mb-3 text-sm md:text-base">{request.request}</p>

                                                            <div className="flex items-center gap-6 pt-3 border-t border-white/5 mt-3">
                                                                <button
                                                                    onClick={() => handlePray(request.id)}
                                                                    className={`flex items-center gap-2 text-sm transition-all ${request.hasPrayed
                                                                        ? 'text-bible-gold font-medium'
                                                                        : 'text-slate-400 hover:text-slate-200 group-hover:scale-105 origin-left'
                                                                        }`}
                                                                >
                                                                    <Heart className={`w-4 h-4 ${request.hasPrayed ? 'fill-current' : ''}`} />
                                                                    {request.hasPrayed ? 'Prayed' : 'Pray'}
                                                                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${request.hasPrayed ? 'bg-bible-gold/20' : 'bg-slate-700'}`}>
                                                                        {request.prayedCount || 0}
                                                                    </span>
                                                                </button>
                                                                <button className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">
                                                                    <MessageCircle className="w-4 h-4" />
                                                                    Comment
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="groups"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-4"
                                    >
                                        <div className="grid grid-cols-1 gap-4">
                                            {groups.map((group, i) => (
                                                <motion.div
                                                    key={group.id}
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: i * 0.1 }}
                                                    onClick={() => setActiveGroup(group)}
                                                    className="glass rounded-xl p-4 flex items-center justify-between hover:bg-white/5 transition-all cursor-pointer border border-white/5 group hover:border-bible-gold/30"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-bible-gold/20 to-orange-500/20 flex items-center justify-center text-bible-gold shrink-0 group-hover:scale-110 transition-transform">
                                                            <Users className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-semibold text-slate-200 text-lg group-hover:text-bible-gold transition-colors">{group.name}</h3>
                                                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                                                <Users className="w-3 h-3" />
                                                                {group.members} members
                                                                {group.active && (
                                                                    <span className="flex items-center gap-1 text-emerald-400 ml-2">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                                        Active
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        {group.joined && <span className="text-xs text-green-400 font-medium hidden md:block">Joined</span>}
                                                        <Button
                                                            variant={group.joined ? "ghost" : "outline"}
                                                            size="sm"
                                                            onClick={(e) => handleJoinGroup(e, group.id)}
                                                            className={group.joined ? "text-slate-400 hover:text-white" : ""}
                                                        >
                                                            {group.joined ? "Leave" : "Join"}
                                                        </Button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </>
                    )}
                </div>

                {/* Sidebar - Desktop Sticky */}
                <div className="hidden md:block space-y-6">
                    {!activeGroup && <StreakCard />}

                    {/* Quick Find (Hide if Chat is active to declutter?) - Optional, keeping for now */}
                    <div className="glass rounded-2xl p-5 space-y-4">
                        <h3 className="font-medium flex items-center gap-2 text-bible-gold">
                            <Search className="w-4 h-4" />
                            Find Community
                        </h3>
                        <input
                            type="text"
                            placeholder="Search topics or groups..."
                            className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-bible-gold/50 transition-colors text-white placeholder:text-slate-600"
                        />
                        <div className="flex flex-wrap gap-2">
                            {['Healings', 'Testimonies', 'Bible Q&A', 'Local Events'].map(tag => (
                                <span key={tag} className="text-xs px-2 py-1 rounded bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer">{tag}</span>
                            ))}
                        </div>
                    </div>

                    {/* Notifications (Show recent updates) */}
                    <div className="glass rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-medium flex items-center gap-2 text-slate-200">
                                <Bell className="w-4 h-4" />
                                Recent Updates
                            </h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex gap-3 text-sm">
                                <div className="w-2 h-2 rounded-full bg-bible-gold mt-1.5 shrink-0" />
                                <p className="text-slate-400"><span className="text-white font-medium">David K.</span> joined the 'Morning Devotion' group.</p>
                            </div>
                            <div className="flex gap-3 text-sm">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                <p className="text-slate-400">New study material added: "Walk in Faith".</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Post Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative"
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <h2 className="text-xl font-serif font-bold text-white mb-6 flex items-center gap-2">
                                <span className="text-bible-gold text-2xl">+</span> New Prayer Request
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Title (Optional)</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Brief summary..."
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-bible-gold/50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-bible-gold/50"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Prayer Details</label>
                                    <textarea
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        placeholder="Share what's on your heart..."
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-bible-gold/50 min-h-[120px] resize-none"
                                    />
                                </div>

                                <div className="flex items-center gap-2 cursor-pointer" onClick={() => setFormData({ ...formData, isAnonymous: !formData.isAnonymous })}>
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.isAnonymous ? 'bg-bible-gold border-bible-gold' : 'border-slate-500'}`}>
                                        {formData.isAnonymous && <span className="text-slate-900 text-xs font-bold">✓</span>}
                                    </div>
                                    <span className="text-sm text-slate-300 select-none">Post Anonymously</span>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <Button variant="ghost" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                    <Button
                                        className="flex-1 glow-gold"
                                        disabled={!formData.content.trim() || isSubmitting}
                                        onClick={handlePostRequest}
                                    >
                                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post Request'}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

function StreakCard() {
    return (
        <div className="glass-gold rounded-2xl p-6 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-20">
                <Sparkles className="w-12 h-12 text-bible-gold" />
            </div>
            <div className="text-5xl font-bold text-bible-gold glow-text mb-1">7</div>
            <div className="text-sm font-medium text-slate-200">Day Prayer Streak 🔥</div>
            <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                "Pray without ceasing." <br /> - 1 Thessalonians 5:17
            </p>
            <Button size="sm" className="w-full mt-4 bg-bible-gold text-slate-900 hover:bg-yellow-500 border-none shadow-lg shadow-bible-gold/20">
                Check-in Today
            </Button>
        </div>
    )
}
