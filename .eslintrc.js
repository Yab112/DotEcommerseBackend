module.exports = {
    root: true,
    env: {
        node: true,
        es2022: true,
    },
    extends: [
        'airbnb-base', // Base Airbnb rules for JavaScript
        'plugin:@typescript-eslint/recommended', // TypeScript recommended rules
        'plugin:@typescript-eslint/recommended-requiring-type-checking', // TypeScript rules requiring type information
        'plugin:import/recommended', // Import plugin for module resolution
        'plugin:import/typescript', // TypeScript support for imports
        'plugin:prettier/recommended', // Prettier integration
        'plugin:express/recommended', // Express-specific linting rules (requires eslint-plugin-express)
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json', // Required for type-checking rules
        tsconfigRootDir: new URL('.', import.meta.url).pathname,
    },
    plugins: ['@typescript-eslint', 'import', 'prettier', 'express'], // Added express plugin
    rules: {
        // Prettier integration
        'prettier/prettier': 'error',

        // Import rules
        'import/extensions': [
            'error',
            'ignorePackages',
            {
                js: 'never',
                ts: 'never',
            },
        ],
        'import/prefer-default-export': 'off',
        'import/order': [
            'error',
            {
                'newlines-between': 'always',
                groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
            },
        ],

        // TypeScript-specific rules
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }], // Allow inferred types in simple cases
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/consistent-type-imports': 'error',
        '@typescript-eslint/no-floating-promises': 'error', // Ensure async functions handle promises
        '@typescript-eslint/await-thenable': 'error', // Enforce proper await usage

        // Express-specific rules
        'express/no-async-in-middleware': 'error', // Warn against async middleware without proper error handling
        'express/no-unhandled-promises': 'error', // Ensure promises in Express routes are handled

        // General JavaScript/Node.js rules
        'class-methods-use-this': 'off', // Allow utility methods in classes
        'no-underscore-dangle': 'off', // Common in Express for private fields
        'no-param-reassign': [
            'error',
            {
                props: true,
                ignorePropertyModificationsFor: ['acc', 'e', 'req', 'res', 'next'], // Allow Express middleware modifications
            },
        ],
        'no-console': ['warn', { allow: ['warn', 'error'] }], // Useful for backend logging
        'no-plusplus': 'off',
        'strict': 'error',
        'no-shadow': 'error',
        'no-var': 'error',
        'prefer-const': 'error',
        'prefer-template': 'error',
        'eqeqeq': ['error', 'always'],
        'no-multi-assign': 'error',
        'no-unused-expressions': 'error',

        // Relax some Airbnb rules for Express
        'consistent-return': 'off', // Express middleware often has varied return patterns
        'no-use-before-define': 'off', // TypeScript handles hoisting issues
        '@typescript-eslint/no-use-before-define': ['error', { functions: false, classes: false }], // Adjusted for TS
    },
    settings: {
        'import/resolver': {
            typescript: {
                alwaysTryTypes: true, // Resolve TypeScript paths using tsconfig
            },
            node: {
                extensions: ['.js', '.ts'], // Support both JS and TS files
            },
        },
    },
};