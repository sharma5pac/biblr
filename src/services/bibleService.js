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
export async function getChapter(book, chapter, translation = 'web') {
    const key = `${book}-${chapter}-${translation}`.toLowerCase()

    // Try Cache First (Offline Strategy)
    try {
        const db = await dbPromise
        const cachedData = await db.get(STORE_NAME, key)

        // If we have valid cached data, return it
        // In a real app, you might check for "staleness" here
        if (cachedData) {
            console.log('Serving from Offline Cache:', key)
            return { ...cachedData, sourcedFrom: 'cache' }
        }
    } catch (err) {
        console.error('Error reading from cache:', err)
    }

    // Fetch from Network
    try {
        // Sanitize book name for API (e.g., "1 John" -> "1+John")
        const formattedBook = book.replace(/\s+/g, '')
        const response = await fetch(`${API_BASE}/${formattedBook}+${chapter}?translation=${translation}`)
        if (!response.ok) throw new Error('Network response was not ok')

        const data = await response.json()

        // Normalize data structure
        const normalizedData = {
            reference: data.reference,
            verses: data.verses.map(v => ({
                verse: v.verse,
                text: v.text.trim()
            })),
            translation_name: data.translation_name,
            timestamp: Date.now()
        }

        // Save to Cache
        const db = await dbPromise
        await db.put(STORE_NAME, normalizedData, key)

        return { ...normalizedData, sourcedFrom: 'network' }
    } catch (err) {
        console.error('Network request failed:', err)

        // --- Fallback to Local JSON (Offline Mode) ---
        console.log("Attempting to load local offline bible...")
        try {
            // Lazy load the local JSON if not already loaded
            if (!window.localBibleData) {
                const res = await fetch('/kjv.json')
                if (!res.ok) throw new Error("Local Bible data not found")
                window.localBibleData = await res.json()
            }

            const localBookString = book.replace(/\s+/g, '').toLowerCase() // simple normalization

            // Note: The structure of the JSON depends on the source. 
            // Assuming the common format: array of books or object with book names keys.
            // We will verify the structure once downloaded. For now implementing a search.

            // ADAPTER: Adapt based on specific JSON format (usually 'books' array)
            // Let's assume the seven1m format: Array of objects { name: "Genesis", chapters: [...] }
            let foundBook = null;

            if (Array.isArray(window.localBibleData)) {
                foundBook = window.localBibleData.find(b =>
                    b.name.toLowerCase().replace(/\s+/g, '') === localBookString ||
                    b.name.toLowerCase().startsWith(localBookString)
                )
            }

            if (foundBook && foundBook.chapters && foundBook.chapters[chapter - 1]) {
                const chapterVerses = foundBook.chapters[chapter - 1]

                // Normalize to expected format
                return {
                    reference: `${foundBook.name} ${chapter}`,
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
            throw new Error('Offline and content not available.')
        }
    }
}
