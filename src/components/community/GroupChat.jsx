import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Send, MoreVertical, Users, Loader2 } from 'lucide-react'
import { Button } from '../ui/Button'
import { CommunityService } from '../../services/communityService'

export function GroupChat({ group, onBack }) {
    const [messages, setMessages] = useState([])
    const [inputText, setInputText] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const messagesEndRef = useRef(null)

    useEffect(() => {
        loadMessages()
        // Poll for new messages every 5s if strictly local/demo (in real app, use Firestore onSnapshot)
        const interval = setInterval(loadMessages, 5000)
        return () => clearInterval(interval)
    }, [group.id])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const loadMessages = async () => {
        try {
            const msgs = await CommunityService.getGroupMessages(group.id)
            setMessages(msgs || [])
        } catch (error) {
            console.error("Failed to load messages", error)
        } finally {
            setIsLoading(false)
        }
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const handleSend = async () => {
        if (!inputText.trim()) return

        // Optimistic update
        const tempMsg = {
            id: Date.now(),
            text: inputText,
            user: 'You',
            isMe: true,
            timestamp: Date.now(),
            avatar: 'Me'
        }
        setMessages([...messages, tempMsg])
        setInputText('')

        try {
            await CommunityService.sendGroupMessage(group.id, tempMsg.text)
            // Reload to ensure sync
            loadMessages()
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

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="flex flex-col h-[80vh] md:h-[600px] bg-slate-900/50 glass border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative"
        >
            {/* Chat Header */}
            <div className="p-4 glass border-b border-white/5 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="p-2 -ml-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-bible-gold to-yellow-600 flex items-center justify-center text-slate-900 font-bold shadow-lg shadow-bible-gold/20">
                            {group.name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-100 text-sm md:text-base leading-tight">{group.name}</h3>
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                {group.members} members online
                            </div>
                        </div>
                    </div>
                </div>
                <button className="text-slate-400 hover:text-white p-2">
                    <MoreVertical className="w-5 h-5" />
                </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {isLoading ? (
                    <div className="flex justify-center p-10">
                        <Loader2 className="w-8 h-8 animate-spin text-bible-gold" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-10 space-y-4 opacity-50">
                        <div className="w-16 h-16 rounded-full bg-white/5 mx-auto flex items-center justify-center">
                            <Users className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-slate-400 text-sm">Welcome to the group! <br />Start the conversation with a blessing.</p>
                    </div>
                ) : (
                    messages.map((msg, i) => {
                        const isMe = msg.isMe || msg.user === 'You'
                        const showAvatar = i === 0 || messages[i - 1].user !== msg.user

                        return (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}
                            >
                                {showAvatar ? (
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-lg mt-1 
                                        ${isMe ? 'bg-bible-gold text-slate-900' : 'bg-slate-700 text-white'}`}
                                    >
                                        {msg.avatar?.[0] || msg.user[0]}
                                    </div>
                                ) : (
                                    <div className="w-8" />
                                )}

                                <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                                    {showAvatar && !isMe && <span className="text-[10px] text-slate-400 ml-1 mb-1">{msg.user}</span>}
                                    <div
                                        className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
                                        ${isMe
                                                ? 'bg-bible-gold text-slate-900 rounded-tr-sm'
                                                : 'bg-white/10 text-slate-200 rounded-tl-sm border border-white/5'
                                            }`}
                                    >
                                        {msg.text}
                                    </div>
                                    <span className="text-[10px] text-slate-500 mt-1 px-1">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </motion.div>
                        )
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 glass border-t border-white/5">
                <div className="flex items-end gap-3 max-w-2xl mx-auto">
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-1 flex items-center focus-within:ring-2 focus-within:ring-bible-gold/50 transition-all">
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..."
                            className="w-full bg-transparent border-none text-white placeholder:text-slate-500 text-sm focus:ring-0 max-h-24 py-2.5 px-3 resize-none focus:outline-none"
                            rows={1}
                            style={{ minHeight: '44px' }}
                        />
                    </div>
                    <Button
                        size="icon"
                        className={`rounded-full shrink-0 shadow-lg shadow-bible-gold/20 transition-all ${inputText.trim() ? 'bg-bible-gold text-slate-900' : 'bg-white/10 text-slate-500'}`}
                        disabled={!inputText.trim()}
                        onClick={handleSend}
                    >
                        <Send className="w-5 h-5 ml-0.5" />
                    </Button>
                </div>
            </div>
        </motion.div>
    )
}
