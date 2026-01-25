import { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('lumina_settings');
        // Force theme to dark even if saved otherwise
        const parsed = saved ? JSON.parse(saved) : {};
        return {
            theme: 'dark', // Enforce dark
            fontSize: parsed.fontSize || 'small',
            autoPlay: parsed.autoPlay ?? true,
            notifications: parsed.notifications ?? true
        };
    });

    useEffect(() => {
        localStorage.setItem('lumina_settings', JSON.stringify(settings));

        // Enforce dark mode
        const root = window.document.documentElement;
        root.classList.add('dark');
        root.style.colorScheme = 'dark';

        // Apply Font Size
        const fontSizes = {
            small: '12px',
            medium: '15px',
            large: '18px',
            'extra large': '20px'
        };
        root.style.setProperty('--app-font-size', fontSizes[settings.fontSize] || '16px');

    }, [settings]);

    const updateSetting = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const clearSettingsCache = async () => {
        // Clear local storage settings specifically
        localStorage.removeItem('lumina_settings');
        // Clear all caches if possible
        if ('caches' in window) {
            const names = await caches.keys();
            await Promise.all(names.map(name => caches.delete(name)));
        }
        // Reset to defaults
        setSettings({
            theme: 'dark',
            fontSize: 'medium',
            autoPlay: true,
            notifications: true
        });
        window.location.reload();
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSetting, clearSettingsCache }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
