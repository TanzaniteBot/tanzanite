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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm90aW5mby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9pbmZvL2JvdGluZm8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtREFBeUM7QUFHekMsTUFBcUIsYUFBYyxTQUFRLHdCQUFPO0lBQzlDO1FBQ0ksS0FBSyxDQUFDLFNBQVMsRUFBRTtZQUNiLE9BQU8sRUFBRSxDQUFDLFNBQVMsQ0FBQztZQUNwQixRQUFRLEVBQUUsTUFBTTtZQUNoQixTQUFTLEVBQUUsQ0FBQztZQUNaLFFBQVEsRUFBRSxJQUFJO1NBQ2pCLENBQUMsQ0FBQztJQUNQLENBQUM7SUFBQSxDQUFDO0lBQ0ssSUFBSSxDQUFDLE9BQWdCO1FBQ3hCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFBO0lBQ2pDLENBQUM7SUFBQSxDQUFDO0NBQ0w7QUFaRCxnQ0FZQztBQUFBLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21tYW5kIH0gZnJvbSAnZGlzY29yZC1ha2Fpcm8nO1xyXG5pbXBvcnQgeyBNZXNzYWdlIH0gZnJvbSAnZGlzY29yZC5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZWxvYWRDb21tYW5kIGV4dGVuZHMgQ29tbWFuZCB7XHJcbiAgICBwdWJsaWMgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgc3VwZXIoJ2JvdGluZm8nLCB7XHJcbiAgICAgICAgICAgIGFsaWFzZXM6IFsnYm90aW5mbyddLFxyXG4gICAgICAgICAgICBjYXRlZ29yeTogJ2luZm8nLFxyXG4gICAgICAgICAgICByYXRlbGltaXQ6IDQsXHJcbiAgICAgICAgICAgIGNvb2xkb3duOiA0MDAwLFxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIHB1YmxpYyBleGVjKG1lc3NhZ2U6IE1lc3NhZ2UpIHtcclxuICAgICAgICBtZXNzYWdlLnV0aWwuc2VuZCgnaW0gYSBib3QnKVxyXG4gICAgfTtcclxufTsiXX0=