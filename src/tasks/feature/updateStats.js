import { BushTask, Stat, Time } from '#lib';
import { Client } from 'discord.js';
export default class UpdateStatsTask extends BushTask {
    constructor() {
        super('updateStats', {
            delay: 10 * 60000,
            runOnStart: true
        });
    }
    async exec() {
        const row = (await Stat.findByPk(this.client.config.environment)) ??
            (await Stat.create({ environment: this.client.config.environment }));
        row.commandsUsed = this.client.stats.commandsUsed;
        row.slashCommandsUsed = this.client.stats.slashCommandsUsed;
        await row.save();
    }
    static async init(client) {
        const temp = (await Stat.findByPk(client.config.environment)) ?? (await Stat.create({ environment: client.config.environment }));
        return { commandsUsed: temp.commandsUsed, slashCommandsUsed: temp.slashCommandsUsed };
    }
}
//# sourceMappingURL=updateStats.js.map