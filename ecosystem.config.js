module.exports = {
    apps: [
        {
            name: 'samosir-verse',
            script: 'npm',
            args: 'start',
            env: {
                NODE_ENV: 'production',
                PORT: 3000,
            },
        },
    ],
};
