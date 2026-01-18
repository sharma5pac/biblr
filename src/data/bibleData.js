// Sample Bible data - In production this would come from an API/database
export const bibleBooks = [
    { id: 'gen', name: 'Genesis', chapters: 50, testament: 'old' },
    { id: 'exo', name: 'Exodus', chapters: 40, testament: 'old' },
    { id: 'lev', name: 'Leviticus', chapters: 27, testament: 'old' },
    { id: 'num', name: 'Numbers', chapters: 36, testament: 'old' },
    { id: 'deu', name: 'Deuteronomy', chapters: 34, testament: 'old' },
    { id: 'jos', name: 'Joshua', chapters: 24, testament: 'old' },
    { id: 'jdg', name: 'Judges', chapters: 21, testament: 'old' },
    { id: 'rut', name: 'Ruth', chapters: 4, testament: 'old' },
    { id: 'psa', name: 'Psalm', chapters: 150, testament: 'old' },
    { id: 'pro', name: 'Proverbs', chapters: 31, testament: 'old' },
    { id: 'isa', name: 'Isaiah', chapters: 66, testament: 'old' },
    { id: 'mat', name: 'Matthew', chapters: 28, testament: 'new' },
    { id: 'mrk', name: 'Mark', chapters: 16, testament: 'new' },
    { id: 'luk', name: 'Luke', chapters: 24, testament: 'new' },
    { id: 'jhn', name: 'John', chapters: 21, testament: 'new' },
    { id: 'act', name: 'Acts', chapters: 28, testament: 'new' },
    { id: 'rom', name: 'Romans', chapters: 16, testament: 'new' },
    { id: '1co', name: '1 Corinthians', chapters: 16, testament: 'new' },
    { id: '2co', name: '2 Corinthians', chapters: 13, testament: 'new' },
    { id: 'gal', name: 'Galatians', chapters: 6, testament: 'new' },
    { id: 'eph', name: 'Ephesians', chapters: 6, testament: 'new' },
    { id: 'php', name: 'Philippians', chapters: 4, testament: 'new' },
    { id: 'col', name: 'Colossians', chapters: 4, testament: 'new' },
    { id: 'rev', name: 'Revelation', chapters: 22, testament: 'new' },
]

// Sample verses for John 3 (famous chapter)
export const sampleVerses = {
    'jhn-3': [
        { verse: 1, text: "Now there was a Pharisee named Nicodemus, a leader of the Jews." },
        { verse: 2, text: "He came to Jesus by night and said to him, 'Rabbi, we know that you are a teacher who has come from God, for no one can do these signs that you do unless God is with that person.'" },
        { verse: 3, text: "Jesus answered him, 'Very truly, I tell you, no one can see the kingdom of God without being born from above.'" },
        { verse: 4, text: "Nicodemus said to him, 'How can anyone be born after having grown old? Can one enter a second time into the mother's womb and be born?'" },
        { verse: 5, text: "Jesus answered, 'Very truly, I tell you, no one can enter the kingdom of God without being born of water and Spirit.'" },
        { verse: 6, text: "'What is born of the flesh is flesh, and what is born of the Spirit is spirit.'" },
        { verse: 7, text: "'Do not be astonished that I said to you, \"You must be born from above.\"'" },
        { verse: 8, text: "'The wind blows where it chooses, and you hear the sound of it, but you do not know where it comes from or where it goes. So it is with everyone who is born of the Spirit.'" },
        { verse: 9, text: "Nicodemus said to him, 'How can these things be?'" },
        { verse: 10, text: "Jesus answered him, 'Are you the teacher of Israel, and yet you do not understand these things?'" },
        { verse: 11, text: "'Very truly, I tell you, we speak of what we know and testify to what we have seen, yet you do not receive our testimony.'" },
        { verse: 12, text: "'If I have told you about earthly things and you do not believe, how can you believe if I tell you about heavenly things?'" },
        { verse: 13, text: "'No one has ascended into heaven except the one who descended from heaven, the Son of Man.'" },
        { verse: 14, text: "'And just as Moses lifted up the serpent in the wilderness, so must the Son of Man be lifted up,'" },
        { verse: 15, text: "'that whoever believes in him may have eternal life.'" },
        { verse: 16, text: "'For God so loved the world that he gave his only Son, so that everyone who believes in him may not perish but may have eternal life.'" },
        { verse: 17, text: "'Indeed, God did not send the Son into the world to condemn the world but in order that the world might be saved through him.'" },
        { verse: 18, text: "'Those who believe in him are not condemned, but those who do not believe are condemned already because they have not believed in the name of the only Son of God.'" },
        { verse: 19, text: "'And this is the judgment, that the light has come into the world, and people loved darkness rather than light because their deeds were evil.'" },
        { verse: 20, text: "'For all who do evil hate the light and do not come to the light, so that their deeds may not be exposed.'" },
        { verse: 21, text: "'But those who do what is true come to the light, so that it may be clearly seen that their deeds have been done in God.'" },
    ]
}

export const translations = [
    { id: 'kjv', name: 'King James Version', language: 'en' },
    { id: 'niv', name: 'New International Version', language: 'en' },
    { id: 'esv', name: 'English Standard Version', language: 'en' },
    { id: 'rvr', name: 'Reina Valera', language: 'es' },
    { id: 'lsg', name: 'Louis Segond', language: 'fr' },
    { id: 'swh', name: 'Swahili Union Version', language: 'sw' },
]
