import { BushTask } from '#lib';
import { Client } from 'discord.js';
export default class UpdateStatsTask extends BushTask {
    constructor();
    exec(): Promise<void>;
    static init(client: Client): Promise<{
        commandsUsed: bigint;
        slashCommandsUsed: bigint;
    }>;
}
