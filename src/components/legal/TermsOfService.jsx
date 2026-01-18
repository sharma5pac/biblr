
export function TermsOfService() {
    return (
        <div className="max-w-3xl mx-auto px-4 py-8 pb-24 text-slate-300">
            <h1 className="text-3xl font-serif font-bold text-bible-gold mb-6">Terms of Service</h1>
            <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>

            <section className="mb-8">
                <h2 className="text-xl font-bold text-white mb-3">1. Agreement to Terms</h2>
                <p>By accessing or using the Lumina Bible application, you agree to be bound by these Terms of Service.</p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-bold text-white mb-3">2. Intellectual Property</h2>
                <p>The Service and its original content, features, and functionality are and will remain the exclusive property of Lumina Bible and its licensors.</p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-bold text-white mb-3">3. User Conduct</h2>
                <p>You agree not to use the application for any unlawful purpose or in any way that interrupts, damages, or impairs the service.</p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-bold text-white mb-3">4. AI Content Disclaimer</h2>
                <p>AI-generated insights are for educational and spiritual enrichment purposes. While we strive for accuracy, users should verify content with standard biblical resources.</p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-bold text-white mb-3">5. Changes to Terms</h2>
                <p>We reserve the right to modify or replace these Terms at any time. Your continued use of the Service after any such changes constitutes your acceptance of the new Terms.</p>
            </section>
        </div>
    )
}
