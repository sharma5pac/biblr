import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bookmark, Heart, Sparkles, Search, Filter, Trash2, Share2, BookOpen } from 'lucide-react'
import { Button } from '../ui/Button'
import { openDB } from 'idb'

const DB_NAME = 'lumina-bookmarks-db'
const STORE_NAME = 'bookmarks'

const dbPromise = openDB(DB_NAME, 1, {
    upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
        }
    }
})

export function BookmarksPage() {
    const [bookmarks, setBookmarks] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [filterCategory, setFilterCategory] = useState('all')

    useEffect(() => {
        loadBookmarks()
    }, [])

    const loadBookmarks = async () => {
        const db = await dbPromise
        const all = await db.getAll(STORE_NAME)
        setBookmarks(all.sort((a, b) => b.timestamp - a.timestamp))
    }

    const deleteBookmark = async (id) => {
        const db = await dbPromise
        await db.delete(STORE_NAME, id)
        loadBookmarks()
    }

    const categories = ['all', 'verses', 'insights', 'notes']
    const filteredBookmarks = bookmarks.filter(b => {
        const matchesSearch = b.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.reference?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = filterCategory === 'all' || b.type === filterCategory
        return matchesSearch && matchesCategory
    })

    return (
        <div className="max-w-4xl mx-auto px-4 pb-24">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-serif font-bold glow-text text-bible-gold mb-2">Bookmarks</h1>
                <p className="text-slate-400">Your saved verses and insights</p>
            </div>

            {/* Search & Filter */}
            <div className="glass rounded-2xl p-4 mb-6">
                <div className="flex gap-3 mb-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search bookmarks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-bible-gold outline-none"
                        />
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilterCategory(cat)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${filterCategory === cat
                                    ? 'bg-bible-gold text-slate-900'
                                    : 'bg-slate-800/50 text-slate-400 hover:text-white'
                                }`}
                        >
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bookmarks List */}
            {filteredBookmarks.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center">
                    <Bookmark className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-300 mb-2">
                        {searchQuery || filterCategory !== 'all' ? 'No bookmarks found' : 'No bookmarks yet'}
                    </h3>
                    <p className="text-slate-500 mb-6">
                        {searchQuery || filterCategory !== 'all'
                            ? 'Try adjusting your search or filters'
                            : 'Start saving verses and insights as you read'}
                    </p>
                    {!searchQuery && filterCategory === 'all' && (
                        <Button onClick={() => window.location.href = '/read'}>
                            <BookOpen className="w-4 h-4" /> Start Reading
                        </Button>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {filteredBookmarks.map((bookmark, idx) => (
                            <motion.div
                                key={bookmark.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ delay: idx * 0.05 }}
                                className="glass rounded-2xl p-5 hover:border-bible-gold/30 transition-all"
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${bookmark.type === 'insight' ? 'bg-gradient-to-br from-bible-gold to-yellow-600' :
                                            bookmark.type === 'note' ? 'bg-blue-500' : 'bg-purple-500'
                                        }`}>
                                        {bookmark.type === 'insight' ? <Sparkles className="w-5 h-5 text-slate-900" /> :
                                            bookmark.type === 'note' ? <BookOpen className="w-5 h-5 text-white" /> :
                                                <Heart className="w-5 h-5 text-white" />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-bible-gold mb-1">{bookmark.reference}</h3>
                                        <p className="text-slate-300 text-sm mb-3 line-clamp-2">{bookmark.text}</p>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <span>{new Date(bookmark.timestamp).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <span className="capitalize">{bookmark.type || 'verse'}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                if (navigator.share) {
                                                    navigator.share({
                                                        title: bookmark.reference,
                                                        text: bookmark.text
                                                    })
                                                }
                                            }}
                                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                            title="Share"
                                        >
                                            <Share2 className="w-4 h-4 text-slate-400" />
                                        </button>
                                        <button
                                            onClick={() => deleteBookmark(bookmark.id)}
                                            className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-400" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    )
}

// Export helper function to add bookmarks from other components
export async function addBookmark(bookmark) {
    const db = await dbPromise
    await db.add(STORE_NAME, {
        ...bookmark,
        timestamp: Date.now()
    })
}
