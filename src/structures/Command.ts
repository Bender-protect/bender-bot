import { commandOptions } from "../typings/commandType";

export class Command {
    constructor(commandOptions: commandOptions) {
        Object.assign(this, commandOptions);
    };
};