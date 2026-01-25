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

export const BookmarkService = {
    async getAll() {
        const db = await dbPromise
        return db.getAll(STORE_NAME)
    },

    async add(item) {
        const db = await dbPromise
        return db.add(STORE_NAME, {
            ...item,
            timestamp: Date.now()
        })
    },

    async delete(id) {
        const db = await dbPromise
        return db.delete(STORE_NAME, id)
    },

    async getChapterHighlights(bookId, chapter) {
        const db = await dbPromise
        const all = await db.getAll(STORE_NAME)
        // Filter in memory for now (simple enough for this scale)
        // Check for type 'highlight' and matching book/chapter
        return all.filter(item =>
            item.type === 'highlight' &&
            item.bookId === bookId &&
            parseInt(item.chapter) === parseInt(chapter)
        )
    },

    async deleteHighlight(verseRef) {
        const db = await dbPromise
        const all = await db.getAll(STORE_NAME)
        const item = all.find(i => i.type === 'highlight' && i.reference === verseRef)
        if (item) {
            await db.delete(STORE_NAME, item.id)
        }
    }
}
