const config = {
    schema: 'https://meeovi.com/graphql',
    documents: ['src/client/**/*.graphql'],
    ignoreNoDocuments: true,
    generates: {
        'src/client/sdk.ts': {
            plugins: [
                'typescript',
                'typescript-operations',
                'typescript-graphql-request',
            ],
            config: {
                rawRequest: false,
            },
        },
    },
};
export default config;
