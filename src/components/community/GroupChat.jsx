import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Send, MoreVertical, Loader2, MessageCircle } from 'lucide-react'
import { Button } from '../ui/Button'
import { CommunityService } from '../../services/communityService'
import { useAuth } from '../../context/AuthContext'

export const GroupChat = ({ group, onBack }) => {
    const { currentUser } = useAuth()
    const [messages, setMessages] = useState([])
    const [inputText, setInputText] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const scrollRef = useRef()

    useEffect(() => {
        if (!group) return
        setIsLoading(true)
        const unsubscribe = CommunityService.subscribeToMessages(group.id, (msgs) => {
            setMessages(msgs)
            setIsLoading(false)
        })
        return () => unsubscribe()
    }, [group])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSend = async () => {
        if (!inputText.trim()) return

        const messageData = {
            text: inputText,
            user: currentUser.name || currentUser.email,
            uid: currentUser.uid,
            avatar: currentUser.avatar
        }

        setInputText('')
        try {
            await CommunityService.sendGroupMessage(group.id, messageData)
        } catch (error) {
            console.error("Failed to send", error)
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    if (!group) return null

    return (
        <div className="flex flex-col h-full bg-slate-900/10">
            {/* Header */}
            <header className="p-4 glass border-b border-white/5 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="md:hidden p-2 -ml-2 rounded-full hover:bg-white/10 text-slate-400">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="w-10 h-10 rounded-xl bg-bible-gold/20 flex items-center justify-center text-bible-gold font-bold">
                        {group.name.charAt(0)}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{group.name}</h3>
                        <p className="text-xs text-slate-400">Community Chat</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full">
                    <MoreVertical className="w-5 h-5 text-slate-400" />
                </Button>
            </header>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4 no-scrollbar">
                {isLoading ? (
                    <div className="flex justify-center p-10"><Loader2 className="animate-spin text-bible-gold" /></div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-20 opacity-40">
                        <MessageCircle className="w-12 h-12 mx-auto mb-4" />
                        <p>No messages yet. Say hello!</p>
                    </div>
                ) : (
                    messages.map((msg, i) => {
                        const isMe = msg.uid === currentUser.uid
                        return (
                            <div key={msg.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] px-4 py-2 rounded-2xl ${isMe
                                    ? 'bg-bible-gold text-slate-900 rounded-tr-none'
                                    : 'bg-white dark:bg-white/5 text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 rounded-tl-none'
                                    }`}>
                                    {!isMe && <p className="text-[10px] font-bold text-bible-gold/80 mb-1">{msg.user}</p>}
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                    <p className="text-[9px] opacity-40 mt-1 text-right">
                                        {msg.timestamp?.seconds ? new Date(msg.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'just now'}
                                    </p>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* Input */}
            <div className="p-4 glass border-t border-white/5">
                <div className="flex items-center gap-2 bg-white/50 dark:bg-white/5 rounded-2xl p-2 border border-black/10 dark:border-white/10">
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Write a message..."
                        className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white text-sm py-2 px-2 resize-none max-h-32"
                        rows={1}
                    />
                    <Button
                        size="icon"
                        onClick={handleSend}
                        disabled={!inputText.trim()}
                        className="h-10 w-10 rounded-xl bg-bible-gold hover:bg-yellow-500 text-slate-900 transition-colors"
                    >
                        <Send className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
