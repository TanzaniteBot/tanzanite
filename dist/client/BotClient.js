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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQm90Q2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NsaWVudC9Cb3RDbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtREFBK0U7QUFFL0UsK0JBQTRCO0FBQzVCLHNDQUFrRDtBQU9qRCxDQUFDO0FBS0QsQ0FBQztBQUVGLHFCQUFxQjtBQUNyQixNQUFxQixTQUFVLFNBQVEsNkJBQVk7SUErQi9DLGtCQUFrQjtJQUNsQixZQUFtQixNQUFrQjtRQUNqQyxLQUFLLENBQUM7WUFDRixPQUFPLEVBQUUsTUFBTSxDQUFDLE1BQU07U0FDekIsQ0FBQyxDQUFDO1FBakNQLGtCQUFrQjtRQUNYLG9CQUFlLEdBQW9CLElBQUksZ0NBQWUsQ0FBQyxJQUFJLEVBQUU7WUFDaEUsU0FBUyxFQUFFLFdBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLFdBQVcsQ0FBQztTQUNoRCxDQUFDLENBQUE7UUFDRixrQkFBa0I7UUFDWCxtQkFBYyxHQUFtQixJQUFJLCtCQUFjLENBQUMsSUFBSSxFQUFFO1lBQzdELFNBQVMsRUFBRSxXQUFJLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxVQUFVLENBQUM7WUFDNUMsTUFBTSxFQUFFLGVBQU07WUFDZCxZQUFZLEVBQUUsSUFBSTtZQUNsQixXQUFXLEVBQUUsSUFBSTtZQUNqQixXQUFXLEVBQUUsSUFBSTtZQUNqQixtQkFBbUIsRUFBRSxHQUFHO1lBQ3hCLGVBQWUsRUFBRSxHQUFHO1lBQ3BCLGdCQUFnQixFQUFFO2dCQUNkLE1BQU0sRUFBRTtvQkFDSixXQUFXLEVBQUUsQ0FBQyxDQUFVLEVBQUUsR0FBVyxFQUFVLEVBQUUsQ0FBQyxHQUFHLEdBQUcsNENBQTRDO29CQUNwRyxXQUFXLEVBQUUsQ0FBQyxDQUFVLEVBQUUsR0FBVyxFQUFVLEVBQUUsQ0FBQyxHQUFHLEdBQUcsNENBQTRDO29CQUNwRyxPQUFPLEVBQUUsZ0RBQWdEO29CQUN6RCxLQUFLLEVBQUUsd0VBQXdFO29CQUMvRSxNQUFNLEVBQUUsZ0NBQWdDO29CQUN4QyxPQUFPLEVBQUUsQ0FBQztvQkFDVixJQUFJLEVBQUUsR0FBRztpQkFDWjtnQkFDRCxTQUFTLEVBQUUsRUFBRTthQUNoQjtZQUNELGlCQUFpQixFQUFFLGVBQU07WUFDekIsY0FBYyxFQUFFLGVBQU07U0FDekIsQ0FBQyxDQUFDO1FBT0MsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7SUFDekIsQ0FBQztJQUFBLENBQUM7SUFFRixzQ0FBc0M7SUFDOUIsS0FBSyxDQUFDLEtBQUs7UUFDZixJQUFJLENBQUMsY0FBYyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUM3RCxJQUFJLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQztZQUM3QixjQUFjLEVBQUUsSUFBSSxDQUFDLGNBQWM7WUFDbkMsZUFBZSxFQUFFLElBQUksQ0FBQyxlQUFlO1lBQ3JDLE9BQU87U0FDVixDQUFDLENBQUM7UUFDSCxxQkFBcUI7UUFDckIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUM5QixJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ25DLENBQUM7SUFFTSxLQUFLLENBQUMsS0FBSztRQUNkLE1BQU0sSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ25CLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFBQSxDQUFDO0NBRUw7QUF6REQsNEJBeURDO0FBQUEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFrYWlyb0NsaWVudCwgQ29tbWFuZEhhbmRsZXIsIExpc3RlbmVySGFuZGxlciB9IGZyb20gJ2Rpc2NvcmQtYWthaXJvJztcclxuaW1wb3J0IHsgVXNlciwgTWVzc2FnZSB9IGZyb20gJ2Rpc2NvcmQuanMnO1xyXG5pbXBvcnQgeyBqb2luIH0gZnJvbSAncGF0aCc7XHJcbmltcG9ydCB7IHByZWZpeCwgdG9rZW4sIG93bmVycyB9IGZyb20gJy4uL2NvbmZpZyc7XHJcblxyXG5kZWNsYXJlIG1vZHVsZSAnZGlzY29yZC1ha2Fpcm8nIHtcclxuICAgIGludGVyZmFjZSBBa2Fpcm9DbGllbnQge1xyXG4gICAgICAgIGNvbW1hbWRIYW5kbGVyOiBDb21tYW5kSGFuZGxlcjtcclxuICAgICAgICBsaXN0ZW5lckhhbmRsZXI6IExpc3RlbmVySGFuZGxlcjtcclxuICAgIH1cclxufTtcclxuXHJcbmludGVyZmFjZSBCb3RPcHRpb25zIHtcclxuICAgIHRva2VuPzogc3RyaW5nXHJcbiAgICBvd25lcnM/OiBzdHJpbmcgfCBzdHJpbmdbXTtcclxufTtcclxuXHJcbi8vIGN1c3RvbSBjbGllbnQgc2hpdFxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCb3RDbGllbnQgZXh0ZW5kcyBBa2Fpcm9DbGllbnQge1xyXG4gICAgcHVibGljIGNvbmZpZzogQm90T3B0aW9ucztcclxuICAgIC8vIGxpc3RuZXIgaGFuZGxlclxyXG4gICAgcHVibGljIGxpc3RlbmVySGFuZGxlcjogTGlzdGVuZXJIYW5kbGVyID0gbmV3IExpc3RlbmVySGFuZGxlcih0aGlzLCB7XHJcbiAgICAgICAgZGlyZWN0b3J5OiBqb2luKF9fZGlybmFtZSwgJy4uJywgJ2xpc25ldGVycycpLFxyXG4gICAgfSlcclxuICAgIC8vIGNvbW1hbmQgaGFuZGxlclxyXG4gICAgcHVibGljIGNvbW1hbmRIYW5kbGVyOiBDb21tYW5kSGFuZGxlciA9IG5ldyBDb21tYW5kSGFuZGxlcih0aGlzLCB7XHJcbiAgICAgICAgZGlyZWN0b3J5OiBqb2luKF9fZGlybmFtZSwgJy4uJywgJ2NvbW1hbmRzJyksXHJcbiAgICAgICAgcHJlZml4OiBwcmVmaXgsXHJcbiAgICAgICAgYWxsb3dNZW50aW9uOiB0cnVlLFxyXG4gICAgICAgIGhhbmRsZUVkaXRzOiB0cnVlLFxyXG4gICAgICAgIGNvbW1hbmRVdGlsOiB0cnVlLFxyXG4gICAgICAgIGNvbW1hbmRVdGlsTGlmZXRpbWU6IDNlNSxcclxuICAgICAgICBkZWZhdWx0Q29vbGRvd246IDZlNCxcclxuICAgICAgICBhcmd1bWVudERlZmF1bHRzOiB7XHJcbiAgICAgICAgICAgIHByb21wdDoge1xyXG4gICAgICAgICAgICAgICAgbW9kaWZ5U3RhcnQ6IChfOiBNZXNzYWdlLCBzdHI6IHN0cmluZyk6IHN0cmluZyA9PiBgJHtzdHJ9XFxuXFxuIFR5cGUgXFxgY2FuY2VsXFxgIHRvIGNhbmNlbCB0aGUgY29tbWFuZGAsXHJcbiAgICAgICAgICAgICAgICBtb2RpZnlSZXRyeTogKF86IE1lc3NhZ2UsIHN0cjogc3RyaW5nKTogc3RyaW5nID0+IGAke3N0cn1cXG5cXG4gVHlwZSBcXGBjYW5jZWxcXGAgdG8gY2FuY2VsIHRoZSBjb21tYW5kYCxcclxuICAgICAgICAgICAgICAgIHRpbWVvdXQ6ICdZb3UgdG9vayB0byBsb25nIHRoZSBjb21tYW5kIGhhcyBiZWVuIGNhbmVsbGVkJyxcclxuICAgICAgICAgICAgICAgIGVuZGVkOiAnWW91IGV4ZWVkZWQgdGhlIG1heGltdW0gYW1vdW50IG9mIHRyaWVzIHRoZSBjb21tYW5kIGhhcyBiZWVuIGNhY25lbGxlZCcsXHJcbiAgICAgICAgICAgICAgICBjYW5jZWw6ICdUaGUgY29tbWFuZCBoYXMgYmVlbiBjYW5jZWxsZWQnLFxyXG4gICAgICAgICAgICAgICAgcmV0cmllczogMyxcclxuICAgICAgICAgICAgICAgIHRpbWU6IDNlNFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvdGhlcndpc2U6ICcnXHJcbiAgICAgICAgfSxcclxuICAgICAgICBpZ25vcmVQZXJtaXNzaW9uczogb3duZXJzLFxyXG4gICAgICAgIGlnbm9yZUNvb2xkb3duOiBvd25lcnMsXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBmb3IgYm90IG9wdGlvbnNcclxuICAgIHB1YmxpYyBjb25zdHJ1Y3Rvcihjb25maWc6IEJvdE9wdGlvbnMpIHtcclxuICAgICAgICBzdXBlcih7XHJcbiAgICAgICAgICAgIG93bmVySUQ6IGNvbmZpZy5vd25lcnNcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcclxuICAgIH07XHJcblxyXG4gICAgLy8gaW5pdGxpemVzIGNvbW1hbmQgaGFuZGxlcnMgYW5kIHNoaXRcclxuICAgIHByaXZhdGUgYXN5bmMgX2luaXQoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgdGhpcy5jb21tYW5kSGFuZGxlci51c2VMaXN0ZW5lckhhbmRsZXIodGhpcy5saXN0ZW5lckhhbmRsZXIpO1xyXG4gICAgICAgIHRoaXMubGlzdGVuZXJIYW5kbGVyLnNldEVtaXR0ZXJzKHtcclxuICAgICAgICAgICAgY29tbWFuZEhhbmRsZXI6IHRoaXMuY29tbWFuZEhhbmRsZXIsXHJcbiAgICAgICAgICAgIGxpc3RlbmVySGFuZGxlcjogdGhpcy5saXN0ZW5lckhhbmRsZXIsXHJcbiAgICAgICAgICAgIHByb2Nlc3NcclxuICAgICAgICB9KTtcclxuICAgICAgICAvLyBsb2FkcyBhbGwgdGhlIHNoaXRcclxuICAgICAgICB0aGlzLmNvbW1hbmRIYW5kbGVyLmxvYWRBbGwoKTtcclxuICAgICAgICB0aGlzLmxpc3RlbmVySGFuZGxlci5sb2FkQWxsKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFzeW5jIHN0YXJ0KCk6IFByb21pc2U8c3RyaW5nPiB7XHJcbiAgICAgICAgYXdhaXQgdGhpcy5faW5pdCgpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmxvZ2luKHRoaXMuY29uZmlnLnRva2VuKTtcclxuICAgIH07XHJcblxyXG59OyJdfQ==