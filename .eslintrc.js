export default {
    root: true,
    env: {
        node: true,
        es2022: true,
    },
    extends: [
        'airbnb-base',
        'plugin:@typescript-eslint/recommended',
        'plugin:import/recommended',
        'plugin:import/typescript',
        'plugin:prettier/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
        tsconfigRootDir: new URL('.', import.meta.url).pathname,
    },
    plugins: ['@typescript-eslint', 'import', 'prettier'],
    rules: {
        'prettier/prettier': 'error',
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
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        'class-methods-use-this': 'off',
        'no-underscore-dangle': 'off',
        'no-console': ['warn', { allow: ['warn', 'error'] }],
        'no-plusplus': 'off',
    },
    settings: {
        'import/resolver': {
            typescript: {
                alwaysTryTypes: true,
            },
        },
    },
};
