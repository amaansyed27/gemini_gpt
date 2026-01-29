import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const THEMES = {
    DARK: 'dark',
    LIGHT: 'light',
    PAPER: 'paper',
    LIQUID: 'liquid'
};

// Get initial theme from localStorage
const getInitialTheme = () => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('gpt-theme');
        if (saved && Object.values(THEMES).includes(saved)) {
            return saved;
        }
    }
    return THEMES.DARK;
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(getInitialTheme);

    useEffect(() => {
        // Remove old themes
        document.documentElement.classList.remove(...Object.values(THEMES));
        // Add new theme
        document.documentElement.classList.add(theme);

        // Persist to local storage
        localStorage.setItem('gpt-theme', theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);

