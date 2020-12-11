"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_akairo_1 = require("discord-akairo");
class ReloadCommand extends discord_akairo_1.Command {
    constructor() {
        super('botinfo', {
            aliases: ['botinfo'],
            category: 'info',
            ratelimit: 4,
            cooldown: 4000,
        });
    }
    ;
    exec(message) {
        message.util.send('im a bot');
    }
    ;
}
exports.default = ReloadCommand;
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm90aW5mby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9pbmZvL2JvdGluZm8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtREFBeUM7QUFHekMsTUFBcUIsYUFBYyxTQUFRLHdCQUFPO0lBQzlDO1FBQ0ksS0FBSyxDQUFDLFNBQVMsRUFBRTtZQUNiLE9BQU8sRUFBRSxDQUFDLFNBQVMsQ0FBQztZQUNwQixRQUFRLEVBQUUsTUFBTTtZQUNoQixTQUFTLEVBQUUsQ0FBQztZQUNaLFFBQVEsRUFBRSxJQUFJO1NBQ2pCLENBQUMsQ0FBQztJQUNQLENBQUM7SUFBQSxDQUFDO0lBQ0ssSUFBSSxDQUFDLE9BQWdCO1FBQ3hCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFBO0lBQ2pDLENBQUM7SUFBQSxDQUFDO0NBQ0w7QUFaRCxnQ0FZQztBQUFBLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21tYW5kIH0gZnJvbSAnZGlzY29yZC1ha2Fpcm8nO1xuaW1wb3J0IHsgTWVzc2FnZSB9IGZyb20gJ2Rpc2NvcmQuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZWxvYWRDb21tYW5kIGV4dGVuZHMgQ29tbWFuZCB7XG4gICAgcHVibGljIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcignYm90aW5mbycsIHtcbiAgICAgICAgICAgIGFsaWFzZXM6IFsnYm90aW5mbyddLFxuICAgICAgICAgICAgY2F0ZWdvcnk6ICdpbmZvJyxcbiAgICAgICAgICAgIHJhdGVsaW1pdDogNCxcbiAgICAgICAgICAgIGNvb2xkb3duOiA0MDAwLFxuICAgICAgICB9KTtcbiAgICB9O1xuICAgIHB1YmxpYyBleGVjKG1lc3NhZ2U6IE1lc3NhZ2UpIHtcbiAgICAgICAgbWVzc2FnZS51dGlsLnNlbmQoJ2ltIGEgYm90JylcbiAgICB9O1xufTsiXX0=