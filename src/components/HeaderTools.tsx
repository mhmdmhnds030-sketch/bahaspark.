import { useState, useEffect } from 'react';
import { Moon, Sun, Clock } from 'lucide-react';

export function HeaderTools() {
    const [darkMode, setDarkMode] = useState<boolean>(() => {
        return localStorage.getItem('studypulse_theme') === 'dark';
    });
    const [now, setNow] = useState<Date>(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('studypulse_theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('studypulse_theme', 'light');
        }
    }, [darkMode]);

    const timeString = now.toLocaleTimeString('ar-EG', {
        hour: '2-digit',
        minute: '2-digit',
    });

    const dateString = now.toLocaleDateString('ar-EG', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
    });

    return (
        <div className="header-tools">
            <div className="live-clock" title="التوقيت الحالي">
                <Clock size={16} />
                <span>{dateString}</span>
                <strong>{timeString}</strong>
            </div>

            <button
                type="button"
                className="theme-toggle-btn"
                onClick={() => setDarkMode(!darkMode)}
                title={darkMode ? 'التبديل للوضع النهاري' : 'التبديل للوضع الليلي'}
            >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
        </div>
    );
}
