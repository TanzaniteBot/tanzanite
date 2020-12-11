"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_akairo_1 = require("discord-akairo");
class ReloadCommand extends discord_akairo_1.Command {
    constructor() {
        super('reload', {
            aliases: ['reload'],
            category: 'owner',
            description: {
                content: 'Use the command to reload stuff in the bot',
                usage: 'reload < category | command | inhibitor | listener | all > <id of whatever thing you want to reload>',
                examples: [
                    'reload module owner',
                    'reload ping'
                ]
            },
            ratelimit: 4,
            cooldown: 4000,
            ownerOnly: true,
        });
    }
    ;
    *args() {
        const type = yield {
            id: 'type',
            type: ["command", "category", "inhibitor", "all"],
            prompt: {
                start: 'What would you like to reload?',
                retry: 'Invalid input. What would you like to reload?',
                time: 30000
            }
        };
        if (type != "all") {
            const id = yield {
                id: 'id',
                type: 'string',
                prompt: {
                    start: `What is the id of the ${type} you would like to reload?`,
                    retry: `Invalid input. What is the id of the ${type} you would like to reload?`,
                    time: 30000
                }
            };
            return { type, id };
        }
        else
            return { type };
    }
    exec(message, { type, id }) {
        switch (type) {
            case 'category':
                try {
                    this.handler.findCategory(id).reloadAll();
                }
                catch (e) {
                    return message.util.send(e.message);
                }
                break;
            case 'all':
                try {
                    this.handler.reloadAll();
                }
                catch (e) {
                    return message.util.send(e.message);
                }
                break;
            case 'command':
                try {
                    this.handler.reload(id);
                }
                catch (e) {
                    return message.util.send(e.message);
                }
                break;
            case 'inhibitor':
                try {
                    this.handler.inhibitorHandler.reload(id);
                }
                catch (e) {
                    return message.util.send(e.message);
                }
                break;
            default:
                return message.util.send("Wtf how did this happen");
        }
        message.util.send(`Reloaded ${(id == undefined && type == "all") ? "all" : id} 🔁`);
    }
    ;
}
exports.default = ReloadCommand;
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVsb2FkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL293bmVyL3JlbG9hZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1EQUFzRDtBQUl0RCxNQUFxQixhQUFjLFNBQVEsd0JBQU87SUFDakQ7UUFDQyxLQUFLLENBQUMsUUFBUSxFQUFFO1lBQ2YsT0FBTyxFQUFFLENBQUMsUUFBUSxDQUFDO1lBQ25CLFFBQVEsRUFBRSxPQUFPO1lBQ2pCLFdBQVcsRUFBRTtnQkFDWixPQUFPLEVBQUUsNENBQTRDO2dCQUNyRCxLQUFLLEVBQUUsc0dBQXNHO2dCQUM3RyxRQUFRLEVBQUU7b0JBQ1QscUJBQXFCO29CQUNyQixhQUFhO2lCQUNiO2FBQ0Q7WUFDRCxTQUFTLEVBQUUsQ0FBQztZQUNaLFFBQVEsRUFBRSxJQUFJO1lBQ2QsU0FBUyxFQUFFLElBQUk7U0FDZixDQUFDLENBQUM7SUFDSixDQUFDO0lBQUEsQ0FBQztJQUVGLENBQUMsSUFBSTtRQUNKLE1BQU0sSUFBSSxHQUFHLE1BQU07WUFDbEIsRUFBRSxFQUFFLE1BQU07WUFDVixJQUFJLEVBQUUsQ0FBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxLQUFLLENBQUM7WUFDakQsTUFBTSxFQUFFO2dCQUNQLEtBQUssRUFBRSxnQ0FBZ0M7Z0JBQ3ZDLEtBQUssRUFBRSwrQ0FBK0M7Z0JBQ3RELElBQUksRUFBRSxLQUFLO2FBQ1g7U0FDRCxDQUFBO1FBQ0QsSUFBSSxJQUFJLElBQUksS0FBSyxFQUFFO1lBQ2xCLE1BQU0sRUFBRSxHQUFHLE1BQU07Z0JBQ2hCLEVBQUUsRUFBRSxJQUFJO2dCQUNSLElBQUksRUFBRSxRQUFRO2dCQUNkLE1BQU0sRUFBRTtvQkFDUCxLQUFLLEVBQUUseUJBQXlCLElBQUksNEJBQTRCO29CQUNoRSxLQUFLLEVBQUUsd0NBQXdDLElBQUksNEJBQTRCO29CQUMvRSxJQUFJLEVBQUUsS0FBSztpQkFDWDthQUNELENBQUE7WUFDRCxPQUFPLEVBQUMsSUFBSSxFQUFFLEVBQUUsRUFBQyxDQUFBO1NBQ2pCOztZQUNJLE9BQU8sRUFBQyxJQUFJLEVBQUMsQ0FBQTtJQUNuQixDQUFDO0lBRU0sSUFBSSxDQUFDLE9BQWdCLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFnQztRQUN2RSxRQUFRLElBQUksRUFBRTtZQUNiLEtBQUssVUFBVTtnQkFDZCxJQUFJO29CQUNILElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDO2lCQUMxQztnQkFBQyxPQUFPLENBQUMsRUFBRTtvQkFDWCxPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztpQkFDcEM7Z0JBQ0QsTUFBTTtZQUNQLEtBQUssS0FBSztnQkFDVCxJQUFJO29CQUNILElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLENBQUE7aUJBQ3hCO2dCQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUNYLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2lCQUNwQztnQkFDRCxNQUFNO1lBQ1AsS0FBSyxTQUFTO2dCQUNiLElBQUk7b0JBQ0gsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUE7aUJBQ3ZCO2dCQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUNYLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2lCQUNwQztnQkFDRCxNQUFNO1lBQ1AsS0FBSyxXQUFXO2dCQUNmLElBQUk7b0JBQ0gsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUE7aUJBQ3hDO2dCQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUNYLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2lCQUNwQztnQkFDRCxNQUFNO1lBQ1A7Z0JBQ0MsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFBO1NBQ3BEO1FBQ0QsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsSUFBSSxTQUFTLElBQUksSUFBSSxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUE7SUFDcEYsQ0FBQztJQUFBLENBQUM7Q0FDRjtBQS9FRCxnQ0ErRUM7QUFBQSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tbWFuZCwgQWthaXJvRXJyb3IgfSBmcm9tICdkaXNjb3JkLWFrYWlybyc7XG5pbXBvcnQgeyBNZXNzYWdlIH0gZnJvbSAnZGlzY29yZC5qcyc7XG5pbXBvcnQgeyBjcmVhdGVUZXh0Q2hhbmdlUmFuZ2UgfSBmcm9tICd0eXBlc2NyaXB0JztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVsb2FkQ29tbWFuZCBleHRlbmRzIENvbW1hbmQge1xuXHRwdWJsaWMgY29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoJ3JlbG9hZCcsIHtcblx0XHRcdGFsaWFzZXM6IFsncmVsb2FkJ10sXG5cdFx0XHRjYXRlZ29yeTogJ293bmVyJyxcblx0XHRcdGRlc2NyaXB0aW9uOiB7XG5cdFx0XHRcdGNvbnRlbnQ6ICdVc2UgdGhlIGNvbW1hbmQgdG8gcmVsb2FkIHN0dWZmIGluIHRoZSBib3QnLFxuXHRcdFx0XHR1c2FnZTogJ3JlbG9hZCA8IGNhdGVnb3J5IHwgY29tbWFuZCB8IGluaGliaXRvciB8IGxpc3RlbmVyIHwgYWxsID4gPGlkIG9mIHdoYXRldmVyIHRoaW5nIHlvdSB3YW50IHRvIHJlbG9hZD4nLFxuXHRcdFx0XHRleGFtcGxlczogW1xuXHRcdFx0XHRcdCdyZWxvYWQgbW9kdWxlIG93bmVyJyxcblx0XHRcdFx0XHQncmVsb2FkIHBpbmcnXG5cdFx0XHRcdF1cblx0XHRcdH0sXG5cdFx0XHRyYXRlbGltaXQ6IDQsXG5cdFx0XHRjb29sZG93bjogNDAwMCxcblx0XHRcdG93bmVyT25seTogdHJ1ZSxcblx0XHR9KTtcblx0fTtcblxuXHQqYXJncygpIHtcblx0XHRjb25zdCB0eXBlID0geWllbGQge1xuXHRcdFx0aWQ6ICd0eXBlJyxcblx0XHRcdHR5cGU6IFtcImNvbW1hbmRcIiwgXCJjYXRlZ29yeVwiLCBcImluaGliaXRvclwiLCBcImFsbFwiXSxcblx0XHRcdHByb21wdDoge1xuXHRcdFx0XHRzdGFydDogJ1doYXQgd291bGQgeW91IGxpa2UgdG8gcmVsb2FkPycsXG5cdFx0XHRcdHJldHJ5OiAnSW52YWxpZCBpbnB1dC4gV2hhdCB3b3VsZCB5b3UgbGlrZSB0byByZWxvYWQ/Jyxcblx0XHRcdFx0dGltZTogMzAwMDBcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKHR5cGUgIT0gXCJhbGxcIikge1xuXHRcdFx0Y29uc3QgaWQgPSB5aWVsZCB7XG5cdFx0XHRcdGlkOiAnaWQnLFxuXHRcdFx0XHR0eXBlOiAnc3RyaW5nJyxcblx0XHRcdFx0cHJvbXB0OiB7XG5cdFx0XHRcdFx0c3RhcnQ6IGBXaGF0IGlzIHRoZSBpZCBvZiB0aGUgJHt0eXBlfSB5b3Ugd291bGQgbGlrZSB0byByZWxvYWQ/YCxcblx0XHRcdFx0XHRyZXRyeTogYEludmFsaWQgaW5wdXQuIFdoYXQgaXMgdGhlIGlkIG9mIHRoZSAke3R5cGV9IHlvdSB3b3VsZCBsaWtlIHRvIHJlbG9hZD9gLFxuXHRcdFx0XHRcdHRpbWU6IDMwMDAwXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiB7dHlwZSwgaWR9XG5cdFx0fVxuXHRcdGVsc2UgcmV0dXJuIHt0eXBlfVxuXHR9XG5cblx0cHVibGljIGV4ZWMobWVzc2FnZTogTWVzc2FnZSwgeyB0eXBlLCBpZCB9OiB7IHR5cGU6IHN0cmluZywgaWQ6IHN0cmluZyB9KSB7XG5cdFx0c3dpdGNoICh0eXBlKSB7XG5cdFx0XHRjYXNlICdjYXRlZ29yeSc6XG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0dGhpcy5oYW5kbGVyLmZpbmRDYXRlZ29yeShpZCkucmVsb2FkQWxsKCk7XG5cdFx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0XHRyZXR1cm4gbWVzc2FnZS51dGlsLnNlbmQoZS5tZXNzYWdlKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgJ2FsbCc6XG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0dGhpcy5oYW5kbGVyLnJlbG9hZEFsbCgpXG5cdFx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0XHRyZXR1cm4gbWVzc2FnZS51dGlsLnNlbmQoZS5tZXNzYWdlKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgJ2NvbW1hbmQnOlxuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdHRoaXMuaGFuZGxlci5yZWxvYWQoaWQpXG5cdFx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0XHRyZXR1cm4gbWVzc2FnZS51dGlsLnNlbmQoZS5tZXNzYWdlKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgJ2luaGliaXRvcic6XG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0dGhpcy5oYW5kbGVyLmluaGliaXRvckhhbmRsZXIucmVsb2FkKGlkKVxuXHRcdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG1lc3NhZ2UudXRpbC5zZW5kKGUubWVzc2FnZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gbWVzc2FnZS51dGlsLnNlbmQoXCJXdGYgaG93IGRpZCB0aGlzIGhhcHBlblwiKVxuXHRcdH1cblx0XHRtZXNzYWdlLnV0aWwuc2VuZChgUmVsb2FkZWQgJHsoaWQgPT0gdW5kZWZpbmVkICYmIHR5cGUgPT0gXCJhbGxcIikgPyBcImFsbFwiIDogaWR9IPCflIFgKVxuXHR9O1xufTsiXX0=