declare global {
    namespace NodeJS {
        interface ProcessEnv {
            debugToken: string,
            productionToken: string,
            developpementToken: string,
            DB: string,
            DBU: string, // Database user
            DBH: string, // Database hoster
            DBP: string, // Database password
            environment: 'debug' | 'production' | 'developpement'
        }
    }
};

export {};