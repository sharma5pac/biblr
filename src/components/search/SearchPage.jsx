import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, BookOpen, Loader2, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'
import { bibleBooks } from '../../data/bibleData'

export function SearchPage() {
    const navigate = useNavigate()
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [testament, setTestament] = useState('all')
    const [selectedBook, setSelectedBook] = useState(null)

    const handleSearch = async () => {
        if (!query.trim()) return

        setLoading(true)
        // Simulate search - in production, this would query the Bible database
        setTimeout(() => {
            const mockResults = [
                {
                    reference: 'John 3:16',
                    text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
                    book: 'jhn',
                    chapter: 3,
                    verse: 16
                },
                {
                    reference: '1 John 4:8',
                    text: 'Whoever does not love does not know God, because God is love.',
                    book: '1jn',
                    chapter: 4,
                    verse: 8
                },
                {
                    reference: 'Romans 5:8',
                    text: 'But God demonstrates his own love for us in this: While we were still sinners, Christ died for us.',
                    book: 'rom',
                    chapter: 5,
                    verse: 8
                }
            ]
            setResults(query.toLowerCase().includes('love') ? mockResults : [])
            setLoading(false)
        }, 800)
    }

    const filteredBooks = bibleBooks.filter(b => {
        const matchesTestament = testament === 'all' || b.testament === testament
        const matchesQuery = b.name.toLowerCase().includes(query.toLowerCase())
        return matchesTestament && matchesQuery
    })

    return (
        <div className="max-w-4xl mx-auto px-4 pb-24">
            {/* Header */}
            <div className="mt-20 md:mt-24 mb-6">
                <h1 className="text-3xl font-serif font-bold glow-text text-bible-gold mb-2">Search</h1>
                <p className="text-slate-400">Find any verse in the Bible</p>
            </div>

            {/* Search Box */}
            <div className="glass rounded-2xl p-6 mb-6">
                <div className="flex gap-3 mb-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Type a verse or keyword (e.g. Psalms 23)"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-bible-gold outline-none"
                        />
                    </div>
                    <Button onClick={handleSearch} disabled={loading} className="px-8 bg-bible-gold text-slate-900 font-bold">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
                    </Button>
                </div>

                {/* Testament Filter */}
                <div className="flex gap-2">
                    {['all', 'old', 'new'].map(t => (
                        <button
                            key={t}
                            onClick={() => setTestament(t)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${testament === t
                                ? 'bg-bible-gold text-slate-900 border-bible-gold'
                                : 'bg-slate-800/50 text-slate-400 hover:text-white border-transparent'
                                } border`}
                        >
                            {t === 'all' ? 'All' : t === 'old' ? 'Old Testament' : 'New Testament'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Quick Book Access */}
            {!results.length && !loading && (
                <div className="glass rounded-2xl p-6">
                    <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-bible-gold" />
                        Quick Access
                    </h2>

                    {/* Chapter Selection View */}
                    {selectedBook ? (
                        <div>
                            <div className="flex items-center gap-4 mb-4">
                                <button
                                    onClick={() => setSelectedBook(null)}
                                    className="p-1 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <ChevronRight className="w-5 h-5 text-slate-400 rotate-180" />
                                </button>
                                <h3 className="text-xl font-bold text-white">{selectedBook.name}</h3>
                            </div>
                            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                                {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map(chapter => (
                                    <button
                                        key={chapter}
                                        onClick={() => navigate(`/read?book=${selectedBook.id}&chapter=${chapter}`)}
                                        className="aspect-square glass rounded-lg flex items-center justify-center text-sm font-medium text-slate-300 hover:text-bible-gold hover:border-bible-gold/50 hover:bg-bible-gold/10 transition-all"
                                    >
                                        {chapter}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* Book List View */
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                            {filteredBooks.map(book => (
                                <button
                                    key={book.id}
                                    onClick={() => setSelectedBook(book)}
                                    className="px-3 py-2 glass rounded-lg text-sm text-slate-300 hover:text-bible-gold hover:border-bible-gold/30 hover:bg-bible-gold/5 transition-all text-left truncate"
                                >
                                    {book.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Search Results */}
            <AnimatePresence>
                {results.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-3"
                    >
                        <p className="text-slate-400 text-sm mb-4">{results.length} results found for "{query}"</p>
                        {results.map((result, idx) => (
                            <motion.div
                                key={`${result.reference}-${idx}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="glass rounded-xl p-5 hover:border-bible-gold/40 transition-all cursor-pointer group"
                                onClick={() => navigate(`/read?book=${result.book}&chapter=${result.chapter}&verse=${result.verse}`)}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-bible-gold group-hover:underline">{result.reference}</h3>
                                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-bible-gold transition-colors" />
                                </div>
                                <p className="text-slate-300 leading-relaxed text-sm md:text-base">{result.text}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {results.length === 0 && !loading && query && (
                <div className="glass rounded-2xl p-12 text-center">
                    <Search className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-300 mb-2">No results found</h3>
                    <p className="text-slate-500">Try different keywords or check your spelling</p>
                </div>
            )}
        </div>
    )
}
