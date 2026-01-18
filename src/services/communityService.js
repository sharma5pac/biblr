import { openDB } from 'idb'
import { db as firestore, auth, isFirebaseConfigured } from './firebase'
import { collection, addDoc, getDocs, updateDoc, doc, increment, query, orderBy, serverTimestamp } from 'firebase/firestore'
import { AIService } from './aiService'

const DB_NAME = 'lumina-community-db'
const DB_VERSION = 2 // Incremented to force reset of groups
const STORE_REQUESTS = 'requests'
const STORE_GROUPS = 'groups'

// In-Memory Chat Store for Demo
const MEMORY_CHATS = {}

// --- Initial Data ---

const initialRequests = [
    {
        id: 1,
        user: 'Grace M.',
        avatar: 'G',
        color: 'bg-purple-500',
        request: 'Please pray for my upcoming job interview. I/m trusting in God/s plan.',
        prayedCount: 24,
        timeAgo: '2 hours ago',
        hasPrayed: false,
        tags: ['Career', 'Anxiety'],
        timestamp: Date.now() - 7200000
    },
    {
        id: 2,
        user: 'David K.',
        avatar: 'D',
        color: 'bg-blue-500',
        request: 'Praying for healing for my mother. Thank you for your support.',
        prayedCount: 47,
        timeAgo: '5 hours ago',
        hasPrayed: true,
        tags: ['Healing', 'Family'],
        timestamp: Date.now() - 18000000
    },
]

// STRICT: Only 2 Groups, 4 Members (You + 3 Bots)
const initialGroups = [
    { id: 1, name: 'Morning Devotion Circle', members: 4, active: true, joined: false },
    { id: 2, name: 'Youth Bible Study', members: 4, active: true, joined: false },
]

const dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
        // REQUESTS STORE
        if (!db.objectStoreNames.contains(STORE_REQUESTS)) {
            const reqStore = db.createObjectStore(STORE_REQUESTS, { keyPath: 'id', autoIncrement: true })
            initialRequests.forEach(req => reqStore.add(req))
        }

        // GROUPS STORE - Reset if upgrading to ensure we remove old multiple groups
        if (db.objectStoreNames.contains(STORE_GROUPS)) {
            db.deleteObjectStore(STORE_GROUPS)
        }

        const groupStore = db.createObjectStore(STORE_GROUPS, { keyPath: 'id', autoIncrement: true })
        initialGroups.forEach(grp => groupStore.add(grp))
    },
})

// --- Service ---

export const CommunityService = {
    async getRequests() {
        if (isFirebaseConfigured()) {
            try {
                // race: try firebase, but timeout after 2s
                const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
                const firebaseCall = (async () => {
                    const q = query(collection(firestore, 'requests'), orderBy('timestamp', 'desc'))
                    const snapshot = await getDocs(q)
                    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                })()

                return await Promise.race([firebaseCall, timeout])
            } catch (e) {
                console.warn("Firebase fetch slow/failed, using local data", e)
            }
        }
        // Fallback or Local Mode
        const db = await dbPromise
        return db.getAll(STORE_REQUESTS)
    },

    async addRequest(data) {
        const content = typeof data === 'string' ? data : data.content
        const title = data.title || ''
        const category = data.category || 'General'
        const isAnonymous = data.isAnonymous || false

        const newRequest = {
            user: isAnonymous ? 'Anonymous' : 'You',
            avatar: isAnonymous ? '?' : 'Me',
            color: isAnonymous ? 'bg-slate-700' : 'bg-bible-gold',
            request: content,
            title: title,
            category: category,
            prayedCount: 0,
            timeAgo: 'Just now',
            hasPrayed: false,
            tags: [category, 'New'],
            isAnonymous,
            timestamp: Date.now()
        }

        if (isFirebaseConfigured()) {
            try {
                // race: try firebase, but timeout after 3s
                const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
                const firebaseCall = addDoc(collection(firestore, 'requests'), {
                    ...newRequest,
                    timestamp: serverTimestamp()
                })

                const docRef = await Promise.race([firebaseCall, timeout])
                return { ...newRequest, id: docRef.id }
            } catch (error) {
                console.warn("Firebase post failed/slow, falling back to offline mode", error)
                // Fallthrough to local DB
            }
        }

        const db = await dbPromise
        const id = await db.add(STORE_REQUESTS, newRequest)
        return { ...newRequest, id }
    },

    async togglePray(id) {
        if (isFirebaseConfigured()) {
            const ref = doc(firestore, 'requests', id)
            await updateDoc(ref, { prayedCount: increment(1) })
            return
        }
        const db = await dbPromise
        const request = await db.get(STORE_REQUESTS, id)
        if (request) {
            request.hasPrayed = !request.hasPrayed
            request.prayedCount = request.hasPrayed ? request.prayedCount + 1 : request.prayedCount - 1
            await db.put(STORE_REQUESTS, request)
        }
    },

    async getGroups() {
        // We'll keep groups local for now unless user wants them in DB too
        // Adding timeout just in case we move to DB later or if this call gets blocked
        const db = await dbPromise
        return db.getAll(STORE_GROUPS)
    },

    async toggleJoinGroup(id) {
        const db = await dbPromise
        const group = await db.get(STORE_GROUPS, id)
        if (group) {
            group.joined = !group.joined
            // If joined, count stays 4 (simulate bots always there). 
            // Or increment? User requested "3 bots and me". That is 4.
            // So if I join, it's 4. If I leave, maybe 3? 
            // Let's keep it fixed at 4 to represent the "Active" session count.
            group.members = 4
            await db.put(STORE_GROUPS, group)
        }
    },

    async getGroupMessages(groupId) {
        if (isFirebaseConfigured()) {
            try {
                const q = query(collection(firestore, 'groups', String(groupId), 'messages'), orderBy('timestamp', 'asc'))
                const snapshot = await getDocs(q)
                if (!snapshot.empty) return snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
            } catch (e) {
                console.warn("Chat fetch error", e)
            }
        }

        // --- 3 BOTS + 1 USER SETUP ---
        if (!MEMORY_CHATS[groupId]) {
            const now = Date.now()

            // Bot 1: Grace (Encourager)
            // Bot 2: David (Teacher)
            // Bot 3: Michael (Praise/Worship)

            if (String(groupId) === '1') { // Morning Devotion
                MEMORY_CHATS[groupId] = [
                    { id: 1, text: "Welcome to Morning Devotion! ☀️", user: "System", isMe: false, timestamp: now - 300000 },
                    { id: 2, text: "This is the day the Lord has made!", user: "Sister Grace", avatar: "G", isMe: false, timestamp: now - 250000 },
                    { id: 3, text: "Amen! Looking forward to sharing the word.", user: "Pastor David", avatar: "P", isMe: false, timestamp: now - 200000 },
                    { id: 4, text: "I'll be leading some worship songs shortly. 🎶", user: "Bro Michael", avatar: "M", isMe: false, timestamp: now - 150000 },
                ]
            } else { // Youth Bible Study
                MEMORY_CHATS[groupId] = [
                    { id: 1, text: "Welcome to Youth Bible Study 📖", user: "System", isMe: false, timestamp: now - 300000 },
                    { id: 2, text: "Hey everyone! Ready to dive deep?", user: "Pastor David", avatar: "P", isMe: false, timestamp: now - 250000 },
                    { id: 3, text: "I brought some questions about John 3:16.", user: "Sister Grace", avatar: "G", isMe: false, timestamp: now - 200000 },
                    { id: 4, text: "Let's open with a word of prayer first.", user: "Bro Michael", avatar: "M", isMe: false, timestamp: now - 150000 },
                ]
            }
        }
        return MEMORY_CHATS[groupId]
    },

    async sendGroupMessage(groupId, text) {
        const msg = {
            id: Date.now(),
            text,
            user: 'You',
            isMe: true,
            avatar: 'Me',
            timestamp: Date.now()
        }

        if (isFirebaseConfigured()) {
            await addDoc(collection(firestore, 'groups', String(groupId), 'messages'), { ...msg, timestamp: serverTimestamp() })
            this.triggerBot(groupId, text, true)
            return
        } else {
            if (!MEMORY_CHATS[groupId]) MEMORY_CHATS[groupId] = []
            MEMORY_CHATS[groupId].push(msg)
            this.triggerBot(groupId, text, false)
        }
    },

    async triggerBot(groupId, userText, useFirebase) {
        // Randomly pick ONE of the 3 bots to reply
        const bots = [
            { name: "Sister Grace", avatar: "G" },
            { name: "Pastor David", avatar: "P" },
            { name: "Bro Michael", avatar: "M" }
        ]
        const selectedBot = bots[Math.floor(Math.random() * bots.length)]

        setTimeout(async () => {
            // Get AI text (or simulate)
            const botResponse = await AIService.generateResponse(userText)

            // Override the AI's "user" with our selected Bot Personality for variety
            const botMsg = {
                id: Date.now() + 1,
                text: botResponse.text,
                user: selectedBot.name,
                isMe: false,
                avatar: selectedBot.avatar,
                timestamp: Date.now()
            }

            if (useFirebase) {
                await addDoc(collection(firestore, 'groups', String(groupId), 'messages'), { ...botMsg, timestamp: serverTimestamp() })
            } else {
                if (!MEMORY_CHATS[groupId]) MEMORY_CHATS[groupId] = []
                MEMORY_CHATS[groupId].push(botMsg)
            }
        }, 2000)
    }
}
