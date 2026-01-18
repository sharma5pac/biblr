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
    },

    async getVerseInsight(verseRef, verseText) {
        // Check if we have Gemini API
        if (API_KEY) {
            try {
                const prompt = `Provide a deep spiritual insight for ${verseRef}: "${verseText}". 
                
Include these sections:
### 📜 Historical Context
Brief background on the book and passage setting.

### 💡 Key Insights
3-4 bullet points with theological and practical insights.

### 🌿 Life Application
Personal, actionable wisdom for modern believers.

Keep it encouraging, theologically sound, and formatted in markdown.`

                const response = await fetch(`${API_URL}?key=${API_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }]
                    })
                })
                const data = await response.json()
                const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text

                if (aiText) return aiText
            } catch (e) {
                console.warn("Gemini API failed, using template", e)
            }
        }

        // Fallback: Template-based insights
        return this.simulateVerseInsight(verseRef, verseText)
    },

    simulateVerseInsight(ref, text) {
        // Parse reference CORRECTLY
        const parts = ref.split(' ')
        let bookName = parts[0]
        let chapterVerse = parts[1] || '1:1'

        // Handle multi-word books (e.g., "1 Corinthians")
        if (parts.length > 2 && /^\d/.test(parts[0])) {
            bookName = `${parts[0]} ${parts[1]}`
            chapterVerse = parts[2] || '1:1'
        }

        const [chapter] = chapterVerse.split(':').map(n => parseInt(n) || 1)

        // Book-specific insights database
        const bookData = {
            'Luke': {
                name: 'Luke',
                context: () => `Luke, the physician, wrote this Gospel to showcase Jesus' compassion for ${chapter <= 9 ? 'the outcasts and marginalized' : chapter === 15 ? 'the lost' : 'all humanity'}. ${chapter === 1 ? 'The birth narrative reveals God\'s plan' : chapter === 15 ? 'The parables of the lost emphasize God\'s seeking love' : 'Jesus ministers with divine compassion'}.`,
                insights: () => [
                    `**Divine Compassion**: ${chapter === 15 ? 'Heaven rejoices over one sinner who repents' : 'Jesus meets people in their brokenness with grace'}`,
                    `**Prayer & the Spirit**: ${chapter === 11 ? 'The model prayer teaches dependence on God' : 'Jesus models a life saturated in prayer'}`,
                    `**Joy in Salvation**: ${chapter === 1 || chapter === 2 ? 'Mary\'s Magnificat overflows with joy' : chapter === 15 ? 'There is celebration in heaven' : 'God\'s kingdom brings true joy'}`
                ],
                application: () => `Who needs to experience Christ's compassion through you today? ${chapter === 15 ? 'Remember: every lost person matters to God' : 'Ask God to give you His heart for the broken'}.`
            },
            'Matthew': {
                name: 'Matthew',
                context: () => `Matthew presents Jesus as the promised Messiah-King. ${chapter <= 7 ? 'The Sermon on the Mount reveals kingdom ethics' : chapter <= 13 ? 'Parables unveil kingdom mysteries' : chapter >= 21 ? 'The passion narrative approaches' : 'Jesus demonstrates His authority'}.`,
                insights: () => [
                    `**Fulfilled Prophecy**: Jesus fulfills ${chapter <= 2 ? 'over 300 Messianic prophecies' : 'the promises of the Old Testament'}`,
                    `**Kingdom Values**: ${chapter <= 7 ? 'The Beatitudes turn worldly wisdom upside down' : 'Christ\'s kingdom operates differently than earthly kingdoms'}`,
                    `**Cost of Discipleship**: ${chapter >= 16 ? 'Taking up your cross is non-negotiable' : 'Following Jesus demands everything'}`
                ],
                application: () => `What aspect of kingdom living challenges you most? ${chapter <= 7 ? 'Ask God to transform your values' : 'Surrender that area to Christ today'}.`
            },
            'John': {
                name: 'John',
                context: () => `John's Gospel reveals Jesus as the divine Son of God. ${chapter <= 12 ? 'The seven signs point to His deity' : chapter >= 13 ? 'Jesus prepares His disciples for His departure' : 'These testimonies call for belief'}.`,
                insights: () => [
                    `**"I AM" Declarations**: ${chapter === 6 ? 'Jesus is the Bread of Life' : chapter === 8 ? 'Jesus claims pre-existence with the Father' : 'Jesus reveals His divine nature'}`,
                    `**Eternal Life**: ${chapter === 3 ? 'Belief brings new birth from above' : 'Trusting Christ grants eternal life now'}`,
                    `**Abiding Connection**: ${chapter === 15 ? 'Apart from Christ we can do nothing' : 'Intimate relationship with Jesus is essential'}`
                ],
                application: () => `Are you abiding in Christ? ${chapter === 15 ? 'Assess your connection to the Vine today' : 'Deepen your intimacy with Jesus through His Word'}.`
            },
            'Genesis': {
                name: 'Genesis',
                context: () => `Genesis, the book of beginnings, ${chapter === 1 ? 'reveals God as Creator of all' : chapter <= 11 ? 'shows sin\'s entrance and spread' : chapter <= 25 ? 'follows Abraham\'s faith journey' : 'traces God\'s covenant through the patriarchs'}.`,
                insights: () => [
                    `**Divine Sovereignty**: ${chapter === 1 ? 'God speaks creation into existence by His word alone' : 'God controls all of history'}`,
                    `**Covenant Faithfulness**: ${chapter >= 12 ? 'God promises land, seed, and blessing' : 'God\'s promises never fail'}`,
                    `**Human Fallenness**: ${chapter === 3 ? 'Sin separates us from God' : chapter <= 11 ? 'Humanity rebels against the Creator' : 'Yet God provides redemption'}`
                ],
                application: () => `${chapter === 1 ? 'Worship the Creator today. You are made in His image' : chapter >= 12 ? 'Trust God\'s promises even when you can\'t see the outcome' : 'Confess your need for God\'s grace'}.`
            },
            'Psalms': {
                name: 'Psalms',
                context: () => `The Psalms are Israel's prayer book. ${chapter === 23 ? 'This shepherd psalm brings comfort' : chapter === 51 ? 'David\'s psalm of repentance shows the path back to God' : chapter >= 145 ? 'Praise psalms exalt God\'s greatness' : 'These songs express raw emotion to God'}.`,
                insights: () => [
                    `**Honest Prayer**: ${chapter === 22 || chapter === 13 ? 'The psalmist cries out in anguish, yet clings to hope' : 'God welcomes our authentic prayers'}`,
                    `**God's Character**: His ${chapter === 103 ? 'compassion and mercy are boundless' : 'steadfast love endures forever'}`,
                    `**Worship & Trust**: ${chapter === 23 ? 'The Lord shepherds His people' : chapter >= 145 ? 'All creation praises God' : 'We find refuge in God alone'}`
                ],
                application: () => `${chapter === 23 ? 'Rest in God as your shepherd today' : chapter === 51 ? 'Confess your sins and receive His mercy' : 'Pray this psalm as your own prayer to God'}.`
            },
            'Romans': {
                name: 'Romans',
                context: () => `Paul's theological masterpiece explains salvation. ${chapter <= 5 ? 'Justification by faith alone is established' : chapter <= 8 ? 'Life in the Spirit brings freedom' : chapter <= 11 ? 'God\'s plan for Israel unfolds' : 'Practical Christian living flows from grace'}.`,
                insights: () => [
                    `**Salvation by Faith**: ${chapter <= 5 ? 'We are justified freely by grace through faith' : 'No human effort earns salvation'}`,
                    `**Freedom in Christ**: ${chapter === 6 ? 'Dead to sin, alive to God in Christ' : chapter === 8 ? 'No condemnation for those in Christ Jesus' : 'The Spirit empowers holy living'}`,
                    `**God's Glory**: ${chapter <= 11 ? 'All of history displays God\'s wisdom and mercy' : 'We respond with worship and service'}`
                ],
                application: () => `${chapter <= 5 ? 'Rest in Christ\'s finished work, not your performance' : chapter === 8 ? 'Thank God for the security you have in Christ' : 'Let grace transform how you live today'}.`
            }
        }

        // Get book data or default
        const data = bookData[bookName] || {
            name: bookName,
            context: () => `This passage from ${bookName} reveals God's truth for His people.`,
            insights: () => [
                `**Divine Truth**: Scripture unveils timeless truth about God`,
                `**Human Need**: We see both our condition and God's provision`,
                `**Faithful Response**: This text calls us to trust and obey`
            ],
            application: () => `Meditate on how this verse applies to your life today.`
        }

        return `Here is the deeper spiritual meaning of **${ref}**:

### 📜 Historical Context
${data.context()}

### 💡 Key Insights
${data.insights().map(i => `*   ${i}`).join('\n')}

### 🌿 Life Application
${data.application()}`
    }
}
