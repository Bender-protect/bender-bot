declare global {
    namespace NodeJS {
        interface ProcessEnv {
            token: string;
            db: string;
            dbU: string;
            dbP: string;
            dbH: string;
        }
    }
};

export {};