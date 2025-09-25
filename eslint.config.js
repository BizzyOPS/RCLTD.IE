// ESLint flat config for ESLint 9.0+
import js from '@eslint/js';
import globals from 'globals';

export default [
    // Global ignores
    {
        ignores: ['node_modules/**', 'dist/**', '**/*.min.js']
    },
    
    // JavaScript files configuration
    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 2015,
            sourceType: 'script',
            globals: {
                ...globals.browser,
                console: 'readonly',
                document: 'readonly',
                window: 'readonly',
                navigator: 'readonly',
                fetch: 'readonly',
                ResizeObserver: 'readonly',
                matchMedia: 'readonly',
                requestAnimationFrame: 'readonly',
                cancelAnimationFrame: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly'
            }
        },
        rules: {
            ...js.configs.recommended.rules,
            'no-unused-vars': 'error',
            'no-undef': 'error',
            'eqeqeq': 'error',
            'no-console': 'warn',
            'strict': ['error', 'function']
        }
    }
];