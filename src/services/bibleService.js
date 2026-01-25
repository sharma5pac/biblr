import { openDB } from 'idb'

const API_BASE = 'https://bible-api.com'
const DB_NAME = 'lumina-bible-db'
const STORE_NAME = 'chapters'

// Initialize IndexedDB
const dbPromise = openDB(DB_NAME, 1, {
    upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME)
        }
    },
})

/**
 * Fetch a chapter from API or Cache
 * @param {string} book - Book (e.g., 'john')
 * @param {number} chapter - Chapter number
 * @param {string} translation - Translation ID (e.g., 'kjv', 'web')
 */
const BOOK_MAPPING = {
    'genesis': 'gn', 'exodus': 'ex', 'leviticus': 'lv', 'numbers': 'nm', 'deuteronomy': 'dt',
    'joshua': 'js', 'judges': 'jg', 'ruth': 'rt', '1samuel': '1sa', '2samuel': '2sa',
    '1kings': '1ki', '2kings': '2ki', '1chronicles': '1ch', '2chronicles': '2ch',
    'ezra': 'ez', 'nehemiah': 'ne', 'esther': 'es', 'job': 'jb', 'psalms': 'ps', 'psalm': 'ps',
    'proverbs': 'pr', 'ecclesiastes': 'ec', 'songofsolomon': 'so', 'isaiah': 'is',
    'jeremiah': 'je', 'lamentations': 'la', 'ezekiel': 'ek', 'daniel': 'da',
    'hosea': 'ho', 'joel': 'jl', 'amos': 'am', 'obadiah': 'ob', 'jonah': 'jon',
    'micah': 'mi', 'nahum': 'na', 'habakkuk': 'ha', 'zephaniah': 'ze',
    'haggai': 'hag', 'zechariah': 'za', 'malachi': 'ma',
    'matthew': 'mt', 'mark': 'mr', 'luke': 'lu', 'john': 'jh', 'acts': 'ac',
    'romans': 'ro', '1corinthians': '1co', '2corinthians': '2co', 'galatians': 'ga',
    'ephesians': 'eph', 'philippians': 'ph', 'colossians': 'col',
    '1thessalonians': '1th', '2thessalonians': '2th', '1timothy': '1ti',
    '2timothy': '2ti', 'titus': 'tit', 'philemon': 'phm', 'hebrews': 'he',
    'james': 'ja', '1peter': '1pe', '2peter': '2pe', '1john': '1jo',
    '2john': '2jo', '3john': '3jo', 'jude': 'ju', 'revelation': 're'
}

export async function getChapter(book, chapter, translation = 'web') {
    const key = `${book}-${chapter}-${translation}`.toLowerCase()

    // Try Cache First (Offline Strategy)
    try {
        const db = await dbPromise
        const cachedData = await db.get(STORE_NAME, key)

        if (cachedData) {
            console.log('Serving from Offline Cache:', key)
            return { ...cachedData, sourcedFrom: 'cache' }
        }
    } catch (err) {
        console.error('Error reading from cache:', err)
    }

    // Try Network first, but fail gracefully to offline
    try {
        const formattedBook = book.replace(/\s+/g, '')
        const response = await fetch(`${API_BASE}/${formattedBook}+${chapter}?translation=${translation}`)
        if (!response.ok) throw new Error('Network response was not ok')

        const data = await response.json()

        const normalizedData = {
            reference: data.reference,
            verses: data.verses.map(v => ({
                verse: v.verse,
                text: v.text.trim()
            })),
            translation_name: data.translation_name,
            timestamp: Date.now()
        }

        const db = await dbPromise
        await db.put(STORE_NAME, normalizedData, key)

        return { ...normalizedData, sourcedFrom: 'network' }

    } catch (err) {
        console.warn('Network failed, switching to offline mode:', err)

        // --- Fallback to Local JSON (Offline Mode) ---
        try {
            if (!window.localBibleData) {
                const res = await fetch('/kjv.json')
                if (!res.ok) throw new Error("Local Bible data not found")
                window.localBibleData = await res.json()
            }

            const cleanBook = book.toLowerCase().replace(/\s+/g, '')
            const abbrev = BOOK_MAPPING[cleanBook] || cleanBook.substring(0, 2)

            const foundBook = window.localBibleData.find(b => b.abbrev === abbrev)

            if (foundBook && foundBook.chapters && foundBook.chapters[chapter - 1]) {
                const chapterVerses = foundBook.chapters[chapter - 1]

                return {
                    reference: `${book.charAt(0).toUpperCase() + book.slice(1)} ${chapter}`,
                    verses: chapterVerses.map((text, index) => ({
                        verse: index + 1,
                        text: text
                    })),
                    translation_name: "King James Version (Offline)",
                    sourcedFrom: "local-file"
                }
            }
            throw new Error("Chapter not found in local data")

        } catch (localErr) {
            console.error("Offline fallback failed:", localErr)
            throw new Error('Offline content unavailable. Please connect to internet.')
        }
    }
}
