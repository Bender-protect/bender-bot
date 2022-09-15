import { ApplicationCommandDataResolvable, Client, ClientEvents, Collection, TeamMemberMembershipState } from "discord.js";
import { commandOptions } from "../typings/commandType";
import { database } from "../typings/Database";
import { createConnection } from 'mysql';
import { readdirSync } from "fs";
import { Event } from "./Event";
import { configsManager } from "./ConfigsManager";
import { WhitelistManager } from "./whitelistManager";

export class BenderClient extends Client {
    #path: string = __filename.endsWith('.ts') ? 'src':'dist';
    db: database;
    commands: Collection<string, commandOptions> = new Collection();
    configsManager: configsManager;
    whitelistManager: WhitelistManager;

    constructor() {
        super({
            intents: [32767]
        });
    }
    public start() {
        const token = process.env[`${process.env.environment}Token`];
        this.login(token);
        this.loadModules();
    }
    private loadModules() {
        this.loadCommands();
        this.loadEvents();
        this.connectDb();
    }
    private setConfigsManager() {
        this.configsManager = new configsManager(this, this.db);
        this.configsManager.start();
    }
    private setWhitelistManager() {
        this.whitelistManager = new WhitelistManager(this, this.db);
        this.whitelistManager.start();
    }
    private connectDb () {
        this.db = createConnection({
            user: process.env.DBU,
            host: process.env.DBH,
            password: process.env.DBP,
            database: process.env.DB
        });

        this.db.connect((error) => {
            if (error) throw error;

            this.setConfigsManager();
        });
    }
    private loadCommands() {
        const cmds: ApplicationCommandDataResolvable[] = [];
        readdirSync(`./${this.#path}/commands`).forEach((fileName) => {
            const file: commandOptions = require(`../commands/${fileName}`).default;

            this.commands.set(file.name, file);
            cmds.push(file);
        });

        this.on('ready', () => {
            this.application.commands.set(cmds);
        });
    }
    private loadEvents() {
        readdirSync(`./${this.#path}/events`).forEach((fileName) => {
            const file: Event<keyof ClientEvents> = require(`../events/${fileName}`).default;

            this.on(file.event, file.run);
        });
    }
}