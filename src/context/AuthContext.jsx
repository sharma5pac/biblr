import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check local storage for existing session
        const storedUser = localStorage.getItem('lumina_user')
        if (storedUser) {
            setUser(JSON.parse(storedUser))
        }
        setLoading(false)
    }, [])

    const login = async (email, password) => {
        // Mock login delay
        await new Promise(resolve => setTimeout(resolve, 800))

        // Create mock user
        const mockUser = {
            id: 'usr_' + Math.random().toString(36).substr(2, 9),
            name: email.split('@')[0],
            email: email,
            avatar: email[0].toUpperCase(),
            createdAt: new Date().toISOString()
        }

        setUser(mockUser)
        localStorage.setItem('lumina_user', JSON.stringify(mockUser))
        return mockUser
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem('lumina_user')
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
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
