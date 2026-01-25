
// Dedicated Audio Service for Text-to-Speech handling
// Decouples audio logic from UI components and prepares for future API integrations (OpenAI/ElevenLabs)

class AudioService {
    constructor() {
        this.synth = window.speechSynthesis
        this.voices = []
        this.currentVoice = null
        this.defaultRate = 0.9
        this.defaultPitch = 1.0 // Sligthly lower pitch can sound more human, but let's default to standard first

        // Future extensions
        this.provider = 'native' // 'native' | 'openai' | 'elevenlabs'
        this.apiKey = null

        this.listeners = [] // Simple event system for voice loading

        if (this.synth) {
            // some browsers (Chrome) load voices asynchronously
            if (this.synth.onvoiceschanged !== undefined) {
                this.synth.onvoiceschanged = () => this.initVoices()
            }

            // Initial checks
            this.initVoices()

            // Aggressive polling for 5 seconds to catch delayed loading on mobile
            let attempts = 0
            const pollInterval = setInterval(() => {
                attempts++
                this.initVoices()
                if (this.voices.length > 0 || attempts > 20) {
                    clearInterval(pollInterval)
                }
            }, 250)
        }
    }

    /**
     * Subscribe to changes (like when voices are loaded)
     */
    subscribe(callback) {
        this.listeners.push(callback)
        // If voices are already loaded, trigger immediately
        if (this.voices.length > 0) callback(this.voices)
        return () => this.listeners = this.listeners.filter(cb => cb !== callback)
    }

    initVoices() {
        if (!this.synth) return

        const allVoices = this.synth.getVoices()
        if (allVoices.length === 0) return

        this.voices = allVoices

        // Trigger listeners
        this.listeners.forEach(cb => cb(this.voices))

        // Auto-select best voice if not already set
        if (!this.currentVoice) {
            this.currentVoice = this.findBestVoice()
        }
    }

    /**
     * Smartly selects the most "human-sounding" voice available
     * Prioritizes: Premium -> Google -> Microsoft -> Natural -> English
     */
    findBestVoice() {
        if (!this.voices.length) return null

        // 1. Prioritize specific high-quality keywords
        // Priority list for "Human-like" voices
        const priorities = [
            'Clara Online', // Specific Request
            'Clara',
            'Canada', // Often high quality
            'Premium',
            'Neural',
            'Enhanced',
            'Google US English',
            'Google UK English Female',
            'Google',
            'Microsoft Zira',
            'Samantha'
        ]

        for (const keyword of priorities) {
            // Search for keyword (case insensitive) AND ensure it's English (if possible)
            const found = this.voices.find(v =>
                v.name.toLowerCase().includes(keyword.toLowerCase()) &&
                v.lang.startsWith('en')
            )

            if (found) {
                console.log(`AudioService: Auto-selected best voice: ${found.name}`)
                return found
            }
        }

        // 2. Fallback to any English voice
        const anyEnglish = this.voices.find(v => v.lang.startsWith('en'))
        if (anyEnglish) return anyEnglish

        // 3. Fallback to default
        return this.voices.find(v => v.default) || this.voices[0]
    }

    getVoices() {
        return this.voices
    }

    setVoice(voiceName) {
        const voice = this.voices.find(v => v.name === voiceName)
        if (voice) {
            this.currentVoice = voice
        }
    }

    /**
     * Core Speak Function
     * Returns a Promise that resolves when speaking finishes
     */
    speak(text, { rate = 0.9, pitch = 0.9, volume = 1, force = true } = {}) {
        return new Promise((resolve) => {
            if (!this.synth) {
                console.warn('Speech Synthesis not supported')
                resolve() // Resolve anyway to not break app flow
                return
            }

            if (force) {
                this.cancel()
            }

            // Handle provider logic here (e.g., if (this.provider === 'openai') { ... })
            // For now, Native Web Speech API

            const utterance = new SpeechSynthesisUtterance(text)

            // Apply Settings
            if (this.currentVoice) utterance.voice = this.currentVoice
            utterance.rate = rate
            utterance.pitch = pitch
            utterance.volume = volume

            // Event Handlers
            utterance.onend = () => {
                resolve()
            }

            utterance.onerror = (e) => {
                // Cancel events (interruption) are technically errors in some browsers, 
                // but we can treat them as resolved or ignored
                console.error("TTS Error:", e)
                resolve()
            }

            this.synth.speak(utterance)
        })
    }

    pause() {
        if (this.synth && this.synth.speaking) {
            this.synth.pause()
        }
    }

    resume() {
        if (this.synth && this.synth.paused) {
            this.synth.resume()
        }
    }

    cancel() {
        if (this.synth) {
            this.synth.cancel()
        }
    }

    isSpeaking() {
        return this.synth ? this.synth.speaking : false
    }
}

export const audioService = new AudioService()
