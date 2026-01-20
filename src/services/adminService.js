import { db } from './firebase';
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    updateDoc,
    doc,
    serverTimestamp
} from 'firebase/firestore';

const STORE_CHURCHES = 'churches';
const STORE_ANNOUNCEMENTS = 'announcements';

export const AdminService = {
    // Church Branding & Settings
    async getChurchSettings(churchId) {
        try {
            const docRef = doc(db, STORE_CHURCHES, churchId);
            const docSnap = await getDocs(query(collection(db, STORE_CHURCHES), where("id", "==", churchId)));
            return docSnap.docs[0]?.data() || null;
        } catch (error) {
            console.error("Error fetching church settings:", error);
            return null;
        }
    },

    async updateChurchBranding(churchId, branding) {
        try {
            const churchRef = doc(db, STORE_CHURCHES, churchId);
            await updateDoc(churchRef, {
                branding,
                updatedAt: serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error("Error updating branding:", error);
            return false;
        }
    },

    // Announcements
    async postAnnouncement(churchId, announcement) {
        try {
            await addDoc(collection(db, STORE_ANNOUNCEMENTS), {
                churchId,
                ...announcement,
                timestamp: serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error("Error posting announcement:", error);
            return false;
        }
    },

    async getAnnouncements(churchId) {
        try {
            const q = query(
                collection(db, STORE_ANNOUNCEMENTS),
                where("churchId", "==", churchId),
                orderBy("timestamp", "desc")
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching announcements:", error);
            return [];
        }
    },

    // Moderation
    async moderatePrayerRequest(requestId, status) {
        try {
            const requestRef = doc(db, 'requests', requestId);
            await updateDoc(requestRef, {
                status, // 'approved', 'flagged', 'archived'
                moderatedAt: serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error("Error moderating request:", error);
            return false;
        }
    }
};
