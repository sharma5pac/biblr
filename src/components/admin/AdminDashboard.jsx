import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutDashboard,
    Megaphone,
    ShieldCheck,
    Palette,
    Users,
    Plus,
    Check,
    X,
    AlertCircle,
    Settings,
    ChevronRight,
    Search,
    Filter
} from 'lucide-react'
import { Button } from '../ui/Button'
import { AdminService } from '../../services/adminService'
import { useAuth } from '../../context/AuthContext'

export default function AdminDashboard() {
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState('overview')
    const [announcements, setAnnouncements] = useState([])
    const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', type: 'info' })
    const [moderationQueue, setModerationQueue] = useState([])
    const [isPosting, setIsPosting] = useState(false)

    const tabs = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'announcements', label: 'Announcements', icon: Megaphone },
        { id: 'moderation', label: 'Moderation', icon: ShieldCheck },
        { id: 'branding', label: 'Branding', icon: Palette },
        { id: 'members', label: 'Members', icon: Users },
    ]

    useEffect(() => {
        // Fetch data based on churchId (mocked for now)
        const churchId = 'lumina-default'
        loadAnnouncements(churchId)
        // Mock moderation queue for demo
        setModerationQueue([
            { id: 1, user: 'John D.', content: 'Please pray for my upcoming surgery.', category: 'Healing', time: '5m ago' },
            { id: 2, user: 'Sarah W.', content: 'Giving thanks for a new job opportunity!', category: 'Gratitude', time: '12m ago' },
        ])
    }, [])

    const loadAnnouncements = async (churchId) => {
        const data = await AdminService.getAnnouncements(churchId)
        setAnnouncements(data)
    }

    const handlePostAnnouncement = async () => {
        if (!newAnnouncement.title || !newAnnouncement.content) return
        setIsPosting(true)
        const success = await AdminService.postAnnouncement('lumina-default', newAnnouncement)
        if (success) {
            setNewAnnouncement({ title: '', content: '', type: 'info' })
            loadAnnouncements('lumina-default')
        }
        setIsPosting(false)
    }

    return (
        <div className="flex flex-col md:flex-row min-h-[calc(100vh-5rem)] gap-6 p-4 md:p-8 pt-24 md:pt-32">
            {/* Sidebar Navigation */}
            <aside className="w-full md:w-64 space-y-2">
                <div className="mb-8 px-4">
                    <h1 className="text-2xl font-serif font-bold text-bible-gold glow-text">Church Admin</h1>
                    <p className="text-xs text-slate-500">Manage your congregation's app</p>
                </div>

                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id
                            ? 'glass-gold text-bible-gold glow-gold'
                            : 'text-bible-text/60 hover:text-bible-text hover:bg-bible-text/5'
                            }`}
                    >
                        <tab.icon className="w-5 h-5" />
                        {tab.label}
                    </button>
                ))}
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 space-y-6">
                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <StatsCard title="Total Members" value="1,248" change="+12% this month" icon={Users} color="text-blue-400" />
                                <StatsCard title="Prayer Requests" value="86" change="14 pending review" icon={ShieldCheck} color="text-bible-gold" />
                                <StatsCard title="Engagement" value="94%" change="+2.4% vs last week" icon={LayoutDashboard} color="text-emerald-400" />
                            </div>

                            <div className="glass rounded-3xl p-8 border border-bible-glass-border">
                                <h2 className="text-xl font-bold text-bible-text mb-6">Recent Activity</h2>
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-bible-text/5 flex items-center justify-center">
                                                    <Users className="w-5 h-5 text-bible-text/40" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-white">New member joined</div>
                                                    <div className="text-xs text-slate-500">Brother Thomas joined the Healing group</div>
                                                </div>
                                            </div>
                                            <div className="text-xs text-slate-600">2h ago</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'announcements' && (
                        <motion.div
                            key="announcements"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="glass rounded-3xl p-8 border border-white/10">
                                <h2 className="text-xl font-bold text-white mb-6">Create Announcement</h2>
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Announcement Title"
                                        value={newAnnouncement.title}
                                        onChange={e => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-bible-gold transition-colors"
                                    />
                                    <textarea
                                        placeholder="Enter announcement details..."
                                        value={newAnnouncement.content}
                                        onChange={e => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white h-32 focus:outline-none focus:border-bible-gold transition-colors resize-none"
                                    />
                                    <div className="flex items-center gap-4">
                                        <select
                                            value={newAnnouncement.type}
                                            onChange={e => setNewAnnouncement({ ...newAnnouncement, type: e.target.value })}
                                            className="bg-slate-800 text-white px-4 py-2 rounded-xl border border-white/10 outline-none"
                                        >
                                            <option value="info">Information</option>
                                            <option value="event">Event</option>
                                            <option value="urgent">Urgent</option>
                                        </select>
                                        <Button onClick={handlePostAnnouncement} disabled={isPosting} className="flex-1">
                                            {isPosting ? 'Posting...' : 'Post to Congregation'}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-white px-4">Past Announcements</h3>
                                {announcements.map(ann => (
                                    <div key={ann.id} className="glass rounded-2xl p-6 border border-white/5 flex justify-between items-start">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${ann.type === 'urgent' ? 'bg-red-500' : 'bg-bible-gold'}`} />
                                                <h4 className="font-bold text-white">{ann.title}</h4>
                                            </div>
                                            <p className="text-sm text-slate-400">{ann.content}</p>
                                        </div>
                                        <Button variant="ghost" size="sm" className="text-slate-500"><X className="w-4 h-4" /></Button>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'moderation' && (
                        <motion.div
                            key="moderation"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-white">Pending Requests</h2>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="ghost" className="text-xs text-slate-400"><Filter className="w-4 h-4 mr-2" /> All Categories</Button>
                                    <Button size="sm" variant="ghost" className="text-xs text-slate-400"><Search className="w-4 h-4 mr-2" /> Search</Button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {moderationQueue.map(item => (
                                    <div key={item.id} className="glass rounded-2xl p-6 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-bible-gold bg-bible-gold/10 px-2 py-0.5 rounded-full uppercase">{item.category}</span>
                                                <span className="text-xs text-slate-500">{item.time}</span>
                                            </div>
                                            <p className="text-slate-200">{item.content}</p>
                                            <div className="text-xs text-slate-500">Submitted by <span className="text-slate-300 font-medium">{item.user}</span></div>
                                        </div>
                                        <div className="flex gap-2 border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                                            <Button size="sm" className="flex-1 md:flex-none h-10 px-6 bg-emerald-500 hover:bg-emerald-600 text-white border-none transition-all active:scale-95">
                                                <Check className="w-4 h-4 mr-2" /> Approve
                                            </Button>
                                            <Button size="sm" variant="outline" className="flex-1 md:flex-none h-10 px-6 border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all active:scale-95">
                                                <AlertCircle className="w-4 h-4 mr-2" /> Flag
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'branding' && (
                        <motion.div
                            key="branding"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="glass rounded-3xl p-8 border border-white/10 space-y-6">
                                    <h2 className="text-xl font-bold text-white mb-2">Visual Branding</h2>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-400">Church Name</label>
                                            <input type="text" defaultValue="Lumina Bible Church" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-bible-gold" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-400">Primary Color</label>
                                            <div className="flex gap-3">
                                                {['#EAB308', '#3B82F6', '#8B5CF6', '#10B981', '#F43F5E'].map(color => (
                                                    <button key={color} className="w-10 h-10 rounded-full border-2 border-white/20 hover:scale-110 transition-transform" style={{ backgroundColor: color }} />
                                                ))}
                                                <button className="w-10 h-10 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center"><Plus className="w-5 h-5 text-slate-500" /></button>
                                            </div>
                                        </div>
                                        <Button className="w-full">Save Changes</Button>
                                    </div>
                                </div>

                                <div className="glass rounded-3xl p-8 border border-white/10">
                                    <h2 className="text-xl font-bold text-white mb-6 text-center">App Logo Preview</h2>
                                    <div className="flex flex-col items-center justify-center py-8">
                                        <div className="w-32 h-32 rounded-3xl bg-bible-gold flex items-center justify-center shadow-2xl shadow-bible-gold/20 mb-6 group cursor-pointer overflow-hidden relative">
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Palette className="text-white w-8 h-8" />
                                            </div>
                                            <LayoutDashboard className="w-16 h-16 text-slate-900" />
                                        </div>
                                        <p className="text-xs text-slate-500">Recommended size: 512x512 PNG</p>
                                        <Button variant="ghost" size="sm" className="mt-4">Change Logo</Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    )
}

function StatsCard({ title, value, change, icon: Icon, color }) {
    return (
        <div className="glass rounded-3xl p-6 border border-bible-glass-border group hover:border-bible-gold/30 transition-all duration-500">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl bg-white/5 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{title}</div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{value}</div>
            <div className="text-xs text-slate-400 flex items-center gap-1">
                <ChevronRight className="w-3 h-3" /> {change}
            </div>
        </div>
    )
}
