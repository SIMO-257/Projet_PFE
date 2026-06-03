import { createSlice } from '@reduxjs/toolkit';

const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('app_theme');
    return savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'dark';
};

const getInitialLanguage = () => {
    const savedLang = localStorage.getItem('app_lang');
    return savedLang || 'fr';
};

const initialState = {
    theme: getInitialTheme(),
    language: getInitialLanguage(),
};

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        setTheme: (state, action) => {
            const nextTheme = action.payload === 'light' ? 'light' : 'dark';
            state.theme = nextTheme;
            localStorage.setItem('app_theme', nextTheme);
        },
        setLanguage: (state, action) => {
            state.language = action.payload;
            localStorage.setItem('app_lang', action.payload);
        },
        toggleTheme: (state) => {
            const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
            state.theme = nextTheme;
            localStorage.setItem('app_theme', nextTheme);
        },
    },
});

export const { setTheme, setLanguage, toggleTheme } = settingsSlice.actions;
export default settingsSlice.reducer;
