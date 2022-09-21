import { ApplicationCommand, ApplicationCommandDataResolvable, Client, ClientEvents, Collection, IntentsBitField, TeamMemberMembershipState } from "discord.js";
import { commandOptions } from "../typings/commandType";
import { database } from "../typings/Database";
import { createConnection } from 'mysql';
import { readdirSync } from "fs";
import { Event } from "./Event";
import { configsManager } from "./ConfigsManager";
import { WhitelistManager } from "./whitelistManager";
import { antispamDataManager } from "./antispamDataManager";
import { sanctionsManager } from "./sanctionsManager";

export class BenderClient extends Client {
    #path: string = __filename.endsWith('.ts') ? 'src':'dist';
    db: database;
    commands: Collection<string, commandOptions> = new Collection();
    configsManager: configsManager;
    whitelistManager: WhitelistManager;
    antispamDataManager: antispamDataManager;
    sanctionsManager: sanctionsManager;
    usefullCommands: ApplicationCommand[] = [];

    constructor() {
        const intents = IntentsBitField.Flags;
        super({
            intents: [ intents.GuildBans, intents.GuildMembers, intents.Guilds, intents.MessageContent, intents.GuildMessages ]
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
    private setAntispamDataManager() {
        this.antispamDataManager = new antispamDataManager(this, this.db);
        this.antispamDataManager.start();
    }
    private setSanctionsManager() {
        this.sanctionsManager = new sanctionsManager(this, this.db);
        this.sanctionsManager.start();
    }
    private setManagers() {
        this.setConfigsManager();
        this.setWhitelistManager();
        this.setAntispamDataManager();
        this.setSanctionsManager();
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

            this.setManagers();
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
            this.application.commands.set(cmds).then((cmds) => {
                this.usefullCommands = cmds.filter(x => ['help', 'set', 'sanction'].includes(x.name)).toJSON();
            });
        });
    }
    private loadEvents() {
        readdirSync(`./${this.#path}/events`).forEach((fileName) => {
            const file: Event<keyof ClientEvents> = require(`../events/${fileName}`).default;

            this.on(file.event, file.run);
        });
    }
}