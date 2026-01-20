import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, MessageCircle, Heart, Plus, Send, Bell, Search, Sparkles, Loader2, X, ChevronRight, Hash, Bookmark } from 'lucide-react'
import { Button } from '../ui/Button'
import { CommunityService } from '../../services/communityService'
import { GroupChat } from './GroupChat'
import { useAuth } from '../../context/AuthContext'
import { LogIn } from 'lucide-react'

export function CommunityPage() {
    const { user, loginWithGoogle, loading: authLoading } = useAuth()
    const [groups, setGroups] = useState([])
    const [activeGroupId, setActiveGroupId] = useState('prayer-wall')
    const [isLoading, setIsLoading] = useState(true)
    const [isGroupsLoading, setIsGroupsLoading] = useState(true)

    // Load Groups
    useEffect(() => {
        if (!user) return

        setIsGroupsLoading(true)
        const unsubscribe = CommunityService.subscribeToGroups((grps) => {
            const allGroups = [
                { id: 'prayer-wall', name: 'Global Prayer Wall', lastMessage: 'Share your prayer and let others pray for you.', isSpecial: true },
                ...grps
            ]
            setGroups(allGroups)
            setIsGroupsLoading(false)
            setIsLoading(false)
        })

        return () => unsubscribe()
    }, [user])

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-bible-gold" />
            </div>
        )
    }

    if (!user) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center p-6 pt-24">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass max-w-md w-full p-10 rounded-[2.5rem] text-center space-y-8 border border-white/10 shadow-2xl"
                >
                    <div className="w-24 h-24 bg-bible-gold/20 rounded-full flex items-center justify-center mx-auto ring-8 ring-bible-gold/5">
                        <Users className="w-12 h-12 text-bible-gold" />
                    </div>
                    <div className="space-y-3">
                        <h1 className="text-4xl font-serif font-bold text-white">Lumina Social</h1>
                        <p className="text-slate-400 text-lg">Connect, pray, and grow with your church community in real-time.</p>
                    </div>
                    <Button
                        onClick={loginWithGoogle}
                        className="w-full h-14 bg-bible-gold text-slate-900 hover:bg-yellow-500 flex items-center justify-center gap-3 font-bold text-xl rounded-2xl transition-all shadow-xl shadow-bible-gold/20 active:scale-95"
                    >
                        <LogIn className="w-6 h-6" />
                        Join Community
                    </Button>
                </motion.div>
            </div>
        )
    }

    const handleCreateGroup = async () => {
        const name = prompt("Enter a name for your new study group:")
        if (name && name.trim()) {
            try {
                const id = await CommunityService.createGroup(name.trim())
                setActiveGroupId(id)
            } catch (e) {
                console.error("Failed to create group", e)
            }
        }
    }

    const activeGroup = groups.find(g => g.id === activeGroupId)

    return (
        <div className="flex h-[calc(100vh-6rem)] md:h-[800px] mt-20 md:mt-24 mb-10 overflow-hidden glass rounded-[2.5rem] border border-white/10 shadow-2xl">
            {/* Sidebar - Groups List */}
            <aside className={`w-full md:w-80 flex flex-col border-r border-white/5 bg-slate-900/30 backdrop-blur-xl ${activeGroupId && 'hidden md:flex'}`}>
                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-serif font-bold text-bible-gold glow-text">Discussions</h2>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="rounded-full bg-white/5 hover:bg-white/10"
                            onClick={handleCreateGroup}
                        >
                            <Plus className="w-5 h-5" />
                        </Button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Find groups..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-bible-gold/50 transition-colors"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-3 pb-6 space-y-2 no-scrollbar">
                    {isGroupsLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="w-6 h-6 animate-spin text-bible-gold/50" />
                        </div>
                    ) : (
                        groups.map(group => (
                            <button
                                key={group.id}
                                onClick={() => setActiveGroupId(group.id)}
                                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border ${activeGroupId === group.id
                                    ? 'glass-gold border-bible-gold/30 shadow-lg'
                                    : 'border-transparent hover:bg-white/5 hover:border-white/10'
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-md ${group.isSpecial ? 'bg-bible-gold/20 text-bible-gold' : 'bg-slate-700 text-slate-300'
                                    }`}>
                                    {group.isSpecial ? <Heart className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                    <h3 className={`font-semibold truncate ${activeGroupId === group.id ? 'text-bible-gold' : 'text-slate-200'}`}>
                                        {group.name}
                                    </h3>
                                    <p className="text-xs text-slate-500 truncate mt-0.5">
                                        {group.lastMessage || 'No messages yet'}
                                    </p>
                                </div>
                                <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${activeGroupId === group.id ? 'text-bible-gold translate-x-1' : 'text-slate-600'}`} />
                            </button>
                        ))
                    )}
                </div>

                {/* Bottom User Area */}
                <div className="p-4 border-t border-white/5 bg-black/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-bible-gold/30">
                            <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}`} alt={user?.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{user?.name || user?.email}</p>
                            <p className="text-[10px] text-emerald-400 font-medium">Online</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className={`flex-1 flex flex-col min-w-0 h-full relative ${!activeGroupId && 'hidden md:flex'}`}>
                {activeGroupId ? (
                    <GroupChat
                        key={activeGroupId}
                        group={activeGroup}
                        onBack={() => setActiveGroupId(null)}
                    />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                            <MessageCircle className="w-10 h-10 text-slate-700" />
                        </div>
                        <div className="max-w-md">
                            <h2 className="text-xl font-serif font-bold text-white mb-2">Community Chat</h2>
                            <p className="text-slate-400 text-sm">Select a group from the sidebar to start communicating.</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
