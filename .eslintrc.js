module.exports = {
    root: true,
    env: {
        node: true,
        es2022: true,
    },
    extends: [
        'airbnb-base',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:import/recommended',
        'plugin:import/typescript',
        'plugin:prettier/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
    },
    plugins: ['@typescript-eslint', 'import', 'prettier'],
    rules: {
        'prettier/prettier': 'error', // Enforce Prettier formatting
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // Warn on unused vars
        '@typescript-eslint/no-explicit-any': 'warn', // Warn on `any` usage
        'no-console': 'off', // Allow console statements
        'no-shadow': 'error', // Prevent variable shadowing
        'no-var': 'error', // Enforce const/let
        'prefer-const': 'error', // Prefer const
        'eqeqeq': ['error', 'always'], // Enforce strict equality
        'import/prefer-default-export': 'off', // Disable default export preference
        'class-methods-use-this': 'off', // Allow methods without `this`
        'no-underscore-dangle': ['error', { allow: ['_id'] }], // Allow `_id` for MongoDB
        '@typescript-eslint/no-floating-promises': 'off', // Disable for now
        '@typescript-eslint/no-misused-promises': 'off', // Disable for middleware
        'no-return-await': 'error', // Keep to catch redundant awaits
        '@typescript-eslint/unbound-method': 'off', // Disable for Express routes
        'no-lonely-if': 'off', // Allow simple if-else
        '@typescript-eslint/require-await': 'off', // Allow async without await
        'func-names': 'off', // Allow anonymous functions
        'import/no-named-as-default': 'off', // Allow named default imports
        'consistent-return': 'off', // Allow flexible returns
        'import/extensions': ['error', 'ignorePackages', { ts: 'never' }],
    },
    settings: {
        'import/resolver': {
            typescript: {
                alwaysTryTypes: true,
            },
            node: {
                extensions: ['.js', '.ts'],
            },
        },
    },
};
