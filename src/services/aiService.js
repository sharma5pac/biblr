// Basic AI Service using Google Gemini (or Simulation Fallback)

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'

// Simulation Data for Fallback
const BOT_PERSONAS = {
    'Grace': {
        role: 'Encourager',
        keywords: ['pray', 'anxious', 'scared', 'worry', 'help', 'sick', 'pain', 'sad'],
        templates: [
            "I am standing in faith with you. 'For God has not given us a spirit of fear, but of power and of love and of a sound mind.' (2 Timothy 1:7) 🙏",
            "Sending prayers your way! Remember that the Lord is close to the brokenhearted.",
            "Amen. May the peace of God, which transcends all understanding, guard your heart and your mind in Christ Jesus.",
            "Stay strong. You are never alone in this battle.",
            "I'm lifting this up to the Father right now. He hears you!",
        ]
    },
    'David': {
        role: 'Teacher',
        keywords: ['why', 'meaning', 'context', 'understand', 'verse', 'history', 'study'],
        templates: [
            "That's a profound thought. The scriptures often remind us that wisdom comes from seeking His face.",
            "Consider James 1:5 - 'If any of you lacks wisdom, you should ask God.' We are here to study together.",
            "In the original Greek, the word used there implies a continuous action. It's fascinating how deep the Word goes.",
            "Great insight! It reminds me of the Beatitudes. Blessed are those who hunger and thirst for righteousness.",
        ]
    }
}

export const AIService = {
    async generateResponse(userMessage, context = '') {
        if (API_KEY) {
            return await this.callGemini(userMessage, context)
        } else {
            return await this.simulateResponse(userMessage)
        }
    },

    async simulateResponse(message) {
        // Simulate network delay
        await new Promise(r => setTimeout(r, 1500))

        const lowerMsg = message.toLowerCase()

        // Decide which bot responds
        let selectedBot = 'Grace' // Default
        if (BOT_PERSONAS['David'].keywords.some(k => lowerMsg.includes(k))) {
            selectedBot = 'David'
        }

        // Pick a relevant response
        const persona = BOT_PERSONAS[selectedBot]
        const randomIdx = Math.floor(Math.random() * persona.templates.length)

        return {
            text: persona.templates[randomIdx],
            user: selectedBot === 'Grace' ? 'Sister Grace' : 'Pastor David',
            avatar: selectedBot === 'Grace' ? 'G' : 'P'
        }
    },

    async callGemini(message, context) {
        try {
            const prompt = `
            You are a helpful Christian study assistant in a group chat. 
            Context: ${context}
            User said: "${message}"
            
            Respond briefly (under 40 words) with encouragement or biblical insight.
            Act as a wise, kind community member.
            `

            const response = await fetch(`${API_URL}?key=${API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            })

            const data = await response.json()
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "God bless you."

            return {
                text: text,
                user: 'Lumina Bot',
                avatar: 'AI'
            }

        } catch (error) {
            console.error("AI Error", error)
            return this.simulateResponse(message)
        }
    }
}
