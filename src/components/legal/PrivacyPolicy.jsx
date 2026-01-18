
export function PrivacyPolicy() {
    return (
        <div className="max-w-3xl mx-auto px-4 py-8 pb-24 text-slate-300">
            <h1 className="text-3xl font-serif font-bold text-bible-gold mb-6">Privacy Policy</h1>
            <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>

            <section className="mb-8">
                <h2 className="text-xl font-bold text-white mb-3">1. Introduction</h2>
                <p>Welcome to Lumina Bible. We respect your privacy and are committed to protecting your personal data.</p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-bold text-white mb-3">2. Data We Collect</h2>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Usage Data:</strong> Information about how you use our app, such as verses read and features used.</li>
                    <li><strong>Device Data:</strong> Basic information about your device and internet connection.</li>
                    <li><strong>User Content:</strong> Prayer requests and community posts you choose to share.</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-bold text-white mb-3">3. How We Use Your Data</h2>
                <p>We use your data to:</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li>Provide and maintain the Service.</li>
                    <li>Monitor the usage of the Service to improve user experience.</li>
                    <li>Detect, prevent and address technical issues.</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-bold text-white mb-3">4. Content AI</h2>
                <p>Our AI features use third-party services (Google Gemini) to generate content. No personal identifiable information is shared with these services in a way that links back to you.</p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-bold text-white mb-3">5. Contact Us</h2>
                <p>If you have any questions about this Privacy Policy, please contact us at support@luminabible.com.</p>
            </section>
        </div>
    )
}
