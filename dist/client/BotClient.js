"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_akairo_1 = require("discord-akairo");
const path_1 = require("path");
const config_1 = require("../config");
;
;
// custom client shit
class BotClient extends discord_akairo_1.AkairoClient {
    // for bot options
    constructor(config) {
        super({
            ownerID: config.owners
        });
        // listner handler
        this.listenerHandler = new discord_akairo_1.ListenerHandler(this, {
            directory: path_1.join(__dirname, '..', 'lisneters'),
        });
        // command handler
        this.commandHandler = new discord_akairo_1.CommandHandler(this, {
            directory: path_1.join(__dirname, '..', 'commands'),
            prefix: config_1.prefix,
            allowMention: true,
            handleEdits: true,
            commandUtil: true,
            commandUtilLifetime: 3e5,
            defaultCooldown: 6e4,
            argumentDefaults: {
                prompt: {
                    modifyStart: (_, str) => `${str}\n\n Type \`cancel\` to cancel the command`,
                    modifyRetry: (_, str) => `${str}\n\n Type \`cancel\` to cancel the command`,
                    timeout: 'You took to long the command has been canelled',
                    ended: 'You exeeded the maximum amount of tries the command has been cacnelled',
                    cancel: 'The command has been cancelled',
                    retries: 3,
                    time: 3e4
                },
                otherwise: ''
            },
            ignorePermissions: config_1.owners,
            ignoreCooldown: config_1.owners,
        });
        this.config = config;
    }
    ;
    // initlizes command handlers and shit
    async _init() {
        this.commandHandler.useListenerHandler(this.listenerHandler);
        this.listenerHandler.setEmitters({
            commandHandler: this.commandHandler,
            listenerHandler: this.listenerHandler,
            process
        });
        // loads all the shit
        this.commandHandler.loadAll();
        this.listenerHandler.loadAll();
    }
    async start() {
        await this._init();
        return this.login(this.config.token);
    }
    ;
}
exports.default = BotClient;
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQm90Q2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NsaWVudC9Cb3RDbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtREFBK0U7QUFFL0UsK0JBQTRCO0FBQzVCLHNDQUFrRDtBQU9qRCxDQUFDO0FBS0QsQ0FBQztBQUVGLHFCQUFxQjtBQUNyQixNQUFxQixTQUFVLFNBQVEsNkJBQVk7SUErQi9DLGtCQUFrQjtJQUNsQixZQUFtQixNQUFrQjtRQUNqQyxLQUFLLENBQUM7WUFDRixPQUFPLEVBQUUsTUFBTSxDQUFDLE1BQU07U0FDekIsQ0FBQyxDQUFDO1FBakNQLGtCQUFrQjtRQUNYLG9CQUFlLEdBQW9CLElBQUksZ0NBQWUsQ0FBQyxJQUFJLEVBQUU7WUFDaEUsU0FBUyxFQUFFLFdBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLFdBQVcsQ0FBQztTQUNoRCxDQUFDLENBQUE7UUFDRixrQkFBa0I7UUFDWCxtQkFBYyxHQUFtQixJQUFJLCtCQUFjLENBQUMsSUFBSSxFQUFFO1lBQzdELFNBQVMsRUFBRSxXQUFJLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxVQUFVLENBQUM7WUFDNUMsTUFBTSxFQUFFLGVBQU07WUFDZCxZQUFZLEVBQUUsSUFBSTtZQUNsQixXQUFXLEVBQUUsSUFBSTtZQUNqQixXQUFXLEVBQUUsSUFBSTtZQUNqQixtQkFBbUIsRUFBRSxHQUFHO1lBQ3hCLGVBQWUsRUFBRSxHQUFHO1lBQ3BCLGdCQUFnQixFQUFFO2dCQUNkLE1BQU0sRUFBRTtvQkFDSixXQUFXLEVBQUUsQ0FBQyxDQUFVLEVBQUUsR0FBVyxFQUFVLEVBQUUsQ0FBQyxHQUFHLEdBQUcsNENBQTRDO29CQUNwRyxXQUFXLEVBQUUsQ0FBQyxDQUFVLEVBQUUsR0FBVyxFQUFVLEVBQUUsQ0FBQyxHQUFHLEdBQUcsNENBQTRDO29CQUNwRyxPQUFPLEVBQUUsZ0RBQWdEO29CQUN6RCxLQUFLLEVBQUUsd0VBQXdFO29CQUMvRSxNQUFNLEVBQUUsZ0NBQWdDO29CQUN4QyxPQUFPLEVBQUUsQ0FBQztvQkFDVixJQUFJLEVBQUUsR0FBRztpQkFDWjtnQkFDRCxTQUFTLEVBQUUsRUFBRTthQUNoQjtZQUNELGlCQUFpQixFQUFFLGVBQU07WUFDekIsY0FBYyxFQUFFLGVBQU07U0FDekIsQ0FBQyxDQUFDO1FBT0MsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7SUFDekIsQ0FBQztJQUFBLENBQUM7SUFFRixzQ0FBc0M7SUFDOUIsS0FBSyxDQUFDLEtBQUs7UUFDZixJQUFJLENBQUMsY0FBYyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUM3RCxJQUFJLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQztZQUM3QixjQUFjLEVBQUUsSUFBSSxDQUFDLGNBQWM7WUFDbkMsZUFBZSxFQUFFLElBQUksQ0FBQyxlQUFlO1lBQ3JDLE9BQU87U0FDVixDQUFDLENBQUM7UUFDSCxxQkFBcUI7UUFDckIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUM5QixJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ25DLENBQUM7SUFFTSxLQUFLLENBQUMsS0FBSztRQUNkLE1BQU0sSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ25CLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFBQSxDQUFDO0NBRUw7QUF6REQsNEJBeURDO0FBQUEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFrYWlyb0NsaWVudCwgQ29tbWFuZEhhbmRsZXIsIExpc3RlbmVySGFuZGxlciB9IGZyb20gJ2Rpc2NvcmQtYWthaXJvJztcbmltcG9ydCB7IFVzZXIsIE1lc3NhZ2UgfSBmcm9tICdkaXNjb3JkLmpzJztcbmltcG9ydCB7IGpvaW4gfSBmcm9tICdwYXRoJztcbmltcG9ydCB7IHByZWZpeCwgdG9rZW4sIG93bmVycyB9IGZyb20gJy4uL2NvbmZpZyc7XG5cbmRlY2xhcmUgbW9kdWxlICdkaXNjb3JkLWFrYWlybycge1xuICAgIGludGVyZmFjZSBBa2Fpcm9DbGllbnQge1xuICAgICAgICBjb21tYW1kSGFuZGxlcjogQ29tbWFuZEhhbmRsZXI7XG4gICAgICAgIGxpc3RlbmVySGFuZGxlcjogTGlzdGVuZXJIYW5kbGVyO1xuICAgIH1cbn07XG5cbmludGVyZmFjZSBCb3RPcHRpb25zIHtcbiAgICB0b2tlbj86IHN0cmluZ1xuICAgIG93bmVycz86IHN0cmluZyB8IHN0cmluZ1tdO1xufTtcblxuLy8gY3VzdG9tIGNsaWVudCBzaGl0XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCb3RDbGllbnQgZXh0ZW5kcyBBa2Fpcm9DbGllbnQge1xuICAgIHB1YmxpYyBjb25maWc6IEJvdE9wdGlvbnM7XG4gICAgLy8gbGlzdG5lciBoYW5kbGVyXG4gICAgcHVibGljIGxpc3RlbmVySGFuZGxlcjogTGlzdGVuZXJIYW5kbGVyID0gbmV3IExpc3RlbmVySGFuZGxlcih0aGlzLCB7XG4gICAgICAgIGRpcmVjdG9yeTogam9pbihfX2Rpcm5hbWUsICcuLicsICdsaXNuZXRlcnMnKSxcbiAgICB9KVxuICAgIC8vIGNvbW1hbmQgaGFuZGxlclxuICAgIHB1YmxpYyBjb21tYW5kSGFuZGxlcjogQ29tbWFuZEhhbmRsZXIgPSBuZXcgQ29tbWFuZEhhbmRsZXIodGhpcywge1xuICAgICAgICBkaXJlY3Rvcnk6IGpvaW4oX19kaXJuYW1lLCAnLi4nLCAnY29tbWFuZHMnKSxcbiAgICAgICAgcHJlZml4OiBwcmVmaXgsXG4gICAgICAgIGFsbG93TWVudGlvbjogdHJ1ZSxcbiAgICAgICAgaGFuZGxlRWRpdHM6IHRydWUsXG4gICAgICAgIGNvbW1hbmRVdGlsOiB0cnVlLFxuICAgICAgICBjb21tYW5kVXRpbExpZmV0aW1lOiAzZTUsXG4gICAgICAgIGRlZmF1bHRDb29sZG93bjogNmU0LFxuICAgICAgICBhcmd1bWVudERlZmF1bHRzOiB7XG4gICAgICAgICAgICBwcm9tcHQ6IHtcbiAgICAgICAgICAgICAgICBtb2RpZnlTdGFydDogKF86IE1lc3NhZ2UsIHN0cjogc3RyaW5nKTogc3RyaW5nID0+IGAke3N0cn1cXG5cXG4gVHlwZSBcXGBjYW5jZWxcXGAgdG8gY2FuY2VsIHRoZSBjb21tYW5kYCxcbiAgICAgICAgICAgICAgICBtb2RpZnlSZXRyeTogKF86IE1lc3NhZ2UsIHN0cjogc3RyaW5nKTogc3RyaW5nID0+IGAke3N0cn1cXG5cXG4gVHlwZSBcXGBjYW5jZWxcXGAgdG8gY2FuY2VsIHRoZSBjb21tYW5kYCxcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiAnWW91IHRvb2sgdG8gbG9uZyB0aGUgY29tbWFuZCBoYXMgYmVlbiBjYW5lbGxlZCcsXG4gICAgICAgICAgICAgICAgZW5kZWQ6ICdZb3UgZXhlZWRlZCB0aGUgbWF4aW11bSBhbW91bnQgb2YgdHJpZXMgdGhlIGNvbW1hbmQgaGFzIGJlZW4gY2FjbmVsbGVkJyxcbiAgICAgICAgICAgICAgICBjYW5jZWw6ICdUaGUgY29tbWFuZCBoYXMgYmVlbiBjYW5jZWxsZWQnLFxuICAgICAgICAgICAgICAgIHJldHJpZXM6IDMsXG4gICAgICAgICAgICAgICAgdGltZTogM2U0XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb3RoZXJ3aXNlOiAnJ1xuICAgICAgICB9LFxuICAgICAgICBpZ25vcmVQZXJtaXNzaW9uczogb3duZXJzLFxuICAgICAgICBpZ25vcmVDb29sZG93bjogb3duZXJzLFxuICAgIH0pO1xuXG4gICAgLy8gZm9yIGJvdCBvcHRpb25zXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKGNvbmZpZzogQm90T3B0aW9ucykge1xuICAgICAgICBzdXBlcih7XG4gICAgICAgICAgICBvd25lcklEOiBjb25maWcub3duZXJzXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICB9O1xuXG4gICAgLy8gaW5pdGxpemVzIGNvbW1hbmQgaGFuZGxlcnMgYW5kIHNoaXRcbiAgICBwcml2YXRlIGFzeW5jIF9pbml0KCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICB0aGlzLmNvbW1hbmRIYW5kbGVyLnVzZUxpc3RlbmVySGFuZGxlcih0aGlzLmxpc3RlbmVySGFuZGxlcik7XG4gICAgICAgIHRoaXMubGlzdGVuZXJIYW5kbGVyLnNldEVtaXR0ZXJzKHtcbiAgICAgICAgICAgIGNvbW1hbmRIYW5kbGVyOiB0aGlzLmNvbW1hbmRIYW5kbGVyLFxuICAgICAgICAgICAgbGlzdGVuZXJIYW5kbGVyOiB0aGlzLmxpc3RlbmVySGFuZGxlcixcbiAgICAgICAgICAgIHByb2Nlc3NcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIGxvYWRzIGFsbCB0aGUgc2hpdFxuICAgICAgICB0aGlzLmNvbW1hbmRIYW5kbGVyLmxvYWRBbGwoKTtcbiAgICAgICAgdGhpcy5saXN0ZW5lckhhbmRsZXIubG9hZEFsbCgpO1xuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyBzdGFydCgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgICAgICBhd2FpdCB0aGlzLl9pbml0KCk7XG4gICAgICAgIHJldHVybiB0aGlzLmxvZ2luKHRoaXMuY29uZmlnLnRva2VuKTtcbiAgICB9O1xuXG59OyJdfQ==