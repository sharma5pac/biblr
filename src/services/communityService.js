import { openDB } from 'idb'
import { db as firestore, auth, isFirebaseConfigured } from './firebase'
import { collection, addDoc, getDocs, updateDoc, doc, increment, query, orderBy, serverTimestamp, onSnapshot, setDoc } from 'firebase/firestore'
import { AIService } from './aiService'

const DB_NAME = 'lumina-community-db'
const DB_VERSION = 2
const STORE_REQUESTS = 'requests'
const STORE_GROUPS = 'groups'

const MEMORY_CHATS = {}

const dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_REQUESTS)) {
            db.createObjectStore(STORE_REQUESTS, { keyPath: 'id', autoIncrement: true })
        }
        if (!db.objectStoreNames.contains(STORE_GROUPS)) {
            db.createObjectStore(STORE_GROUPS, { keyPath: 'id', autoIncrement: true })
        }
    },
})

export const CommunityService = {
    // --- Prayer Requests ---
    async getRequests() {
        if (isFirebaseConfigured()) {
            try {
                const q = query(collection(firestore, 'requests'), orderBy('timestamp', 'desc'))
                const snapshot = await getDocs(q)
                return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            } catch (e) { console.warn(e) }
        }
        const db = await dbPromise
        return db.getAll(STORE_REQUESTS)
    },

    async addRequest(data) {
        const newRequest = {
            ...data,
            prayedCount: 0,
            timestamp: Date.now()
        }
        if (isFirebaseConfigured()) {
            const docRef = await addDoc(collection(firestore, 'requests'), { ...newRequest, timestamp: serverTimestamp() })
            return { ...newRequest, id: docRef.id }
        }
        const db = await dbPromise
        const id = await db.add(STORE_REQUESTS, newRequest)
        return { ...newRequest, id }
    },

    // --- Social / Chat Groups ---
    async getGroups() {
        if (isFirebaseConfigured()) {
            try {
                const snapshot = await getDocs(collection(firestore, 'groups'))
                return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            } catch (e) { }
        }
        const db = await dbPromise
        return db.getAll(STORE_GROUPS)
    },

    subscribeToGroups(callback) {
        if (!isFirebaseConfigured()) return () => { }
        const q = query(collection(firestore, 'groups'), orderBy('name', 'asc'))
        return onSnapshot(q, (snapshot) => {
            const groups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            callback(groups)
        })
    },

    subscribeToMessages(groupId, callback) {
        if (!isFirebaseConfigured()) {
            // Simulated local updates
            const interval = setInterval(() => {
                callback(MEMORY_CHATS[groupId] || [])
            }, 1000)
            return () => clearInterval(interval)
        }
        const q = query(collection(firestore, 'groups', String(groupId), 'messages'), orderBy('timestamp', 'asc'))
        return onSnapshot(q, (snapshot) => {
            const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            callback(messages)
        })
    },

    async createGroup(name) {
        if (!isFirebaseConfigured()) {
            const db = await dbPromise
            const id = await db.add(STORE_GROUPS, { name, members: 1 })
            return id
        }
        const docRef = await addDoc(collection(firestore, 'groups'), {
            name,
            members: 1,
            lastMessage: 'Group created',
            lastMessageTime: serverTimestamp(),
            createdAt: serverTimestamp()
        })
        return docRef.id
    },

    async sendGroupMessage(groupId, messageData) {
        const msg = {
            ...messageData,
            timestamp: Date.now()
        }

        if (isFirebaseConfigured()) {
            await addDoc(collection(firestore, 'groups', String(groupId), 'messages'), {
                ...msg,
                timestamp: serverTimestamp()
            })

            const groupRef = doc(firestore, 'groups', String(groupId))
            await setDoc(groupRef, {
                lastMessage: msg.text,
                lastMessageTime: serverTimestamp(),
                ...(groupId === 'prayer-wall' ? { name: 'Global Prayer Wall' } : {})
            }, { merge: true })
        } else {
            if (!MEMORY_CHATS[groupId]) MEMORY_CHATS[groupId] = []
            MEMORY_CHATS[groupId].push({ ...msg, id: Date.now() })
        }
    }
}
