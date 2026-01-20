import { createContext, useContext, useState, useEffect } from 'react'
import { auth, googleProvider } from '../services/firebase'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Sync Firebase auth state with React state
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                // Map Firebase user object to our app's user format
                const userData = {
                    id: firebaseUser.uid,
                    name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
                    email: firebaseUser.email,
                    avatar: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${firebaseUser.displayName || 'U'}&background=EAB308&color=0F172A`,
                    createdAt: firebaseUser.metadata.creationTime,
                    role: firebaseUser.email === 'yangrikug@gmail.com' ? 'admin' : 'member'
                }
                setUser(userData)
                // We don't need to manually sync with localStorage anymore
                // as Firebase persists the session automatically
            } else {
                setUser(null)
            }
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    const loginWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider)
            return result.user
        } catch (error) {
            console.error("Google Sign-in Error:", error)
            throw error
        }
    }

    const logout = async () => {
        try {
            await signOut(auth)
        } catch (error) {
            console.error("Logout Error:", error)
        }
    }

    return (
        <AuthContext.Provider value={{ user, loginWithGoogle, logout, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
