declare global {
    namespace NodeJS {
        interface ProcessEnv {
            debugToken: string;
            productionToken: string;
            developpementToken: string;
            DB: string; // Database name
            DBU: string; // Database user
            DBH: string; // Database hoster
            DBP: string; // Database password
            environment: 'debug' | 'production' | 'developpement';
            webhook: string;
            support: string;
            github: string;
        }
    }
};

export {};