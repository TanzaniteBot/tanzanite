"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_akairo_1 = require("discord-akairo");
class ReloadCommand extends discord_akairo_1.Command {
    constructor() {
        super('reload', {
            aliases: ['reload'],
            category: 'owner',
            args: [
                {
                    id: 'type',
                    type: 'string',
                    default: 'command',
                },
                {
                    id: 'id',
                    type: 'string',
                }
            ],
            description: {
                content: 'Use the command to reload stuff in the bot',
                usage: 'reload < category | command | inhibitor | listener > <id of whatever thing you want to reload>',
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
    exec(message, { type, id }) {
        message.util.send(`Reloaded ${id} 🔁`);
    }
    ;
}
exports.default = ReloadCommand;
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVsb2FkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1hbmRzL293bmVyL3JlbG9hZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1EQUF5QztBQUd6QyxNQUFxQixhQUFjLFNBQVEsd0JBQU87SUFDOUM7UUFDSSxLQUFLLENBQUMsUUFBUSxFQUFFO1lBQ1osT0FBTyxFQUFFLENBQUMsUUFBUSxDQUFDO1lBQ25CLFFBQVEsRUFBRSxPQUFPO1lBQ2pCLElBQUksRUFBRTtnQkFDRjtvQkFDSSxFQUFFLEVBQUUsTUFBTTtvQkFDVixJQUFJLEVBQUUsUUFBUTtvQkFDZCxPQUFPLEVBQUUsU0FBUztpQkFDckI7Z0JBQ0Q7b0JBQ0ksRUFBRSxFQUFFLElBQUk7b0JBQ1IsSUFBSSxFQUFFLFFBQVE7aUJBQ2pCO2FBQ0o7WUFDRCxXQUFXLEVBQUU7Z0JBQ1QsT0FBTyxFQUFFLDRDQUE0QztnQkFDckQsS0FBSyxFQUFFLGdHQUFnRztnQkFDdkcsUUFBUSxFQUFFO29CQUNOLHFCQUFxQjtvQkFDckIsYUFBYTtpQkFDaEI7YUFDSjtZQUNELFNBQVMsRUFBRSxDQUFDO1lBQ1osUUFBUSxFQUFFLElBQUk7WUFDZCxTQUFTLEVBQUUsSUFBSTtTQUNsQixDQUFDLENBQUM7SUFDUCxDQUFDO0lBQUEsQ0FBQztJQUNLLElBQUksQ0FBQyxPQUFnQixFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBNEI7UUFDaEUsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFBO0lBQzFDLENBQUM7SUFBQSxDQUFDO0NBQ0w7QUFoQ0QsZ0NBZ0NDO0FBQUEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbW1hbmQgfSBmcm9tICdkaXNjb3JkLWFrYWlybyc7XHJcbmltcG9ydCB7IE1lc3NhZ2UgfSBmcm9tICdkaXNjb3JkLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlbG9hZENvbW1hbmQgZXh0ZW5kcyBDb21tYW5kIHtcclxuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBzdXBlcigncmVsb2FkJywge1xyXG4gICAgICAgICAgICBhbGlhc2VzOiBbJ3JlbG9hZCddLFxyXG4gICAgICAgICAgICBjYXRlZ29yeTogJ293bmVyJyxcclxuICAgICAgICAgICAgYXJnczogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlkOiAndHlwZScsXHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXHJcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDogJ2NvbW1hbmQnLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZDogJ2lkJyxcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgZGVzY3JpcHRpb246IHtcclxuICAgICAgICAgICAgICAgIGNvbnRlbnQ6ICdVc2UgdGhlIGNvbW1hbmQgdG8gcmVsb2FkIHN0dWZmIGluIHRoZSBib3QnLFxyXG4gICAgICAgICAgICAgICAgdXNhZ2U6ICdyZWxvYWQgPCBjYXRlZ29yeSB8IGNvbW1hbmQgfCBpbmhpYml0b3IgfCBsaXN0ZW5lciA+IDxpZCBvZiB3aGF0ZXZlciB0aGluZyB5b3Ugd2FudCB0byByZWxvYWQ+JyxcclxuICAgICAgICAgICAgICAgIGV4YW1wbGVzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgJ3JlbG9hZCBtb2R1bGUgb3duZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICdyZWxvYWQgcGluZydcclxuICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcmF0ZWxpbWl0OiA0LFxyXG4gICAgICAgICAgICBjb29sZG93bjogNDAwMCxcclxuICAgICAgICAgICAgb3duZXJPbmx5OiB0cnVlLFxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIHB1YmxpYyBleGVjKG1lc3NhZ2U6IE1lc3NhZ2UsIHsgdHlwZSwgaWQgfToge3R5cGU6U3RyaW5nLCBpZDpTdHJpbmd9KSB7XHJcbiAgICAgICAgbWVzc2FnZS51dGlsLnNlbmQoYFJlbG9hZGVkICR7aWR9IPCflIFgKVxyXG4gICAgfTtcclxufTsiXX0=