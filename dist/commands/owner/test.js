"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_akairo_1 = require("discord-akairo");
class TestCommand extends discord_akairo_1.Command {
    constructor() {
        super('test', {
            aliases: ['test'],
            category: 'owner',
            description: {
                content: 'A command to test shit',
                usage: 'test',
                examples: [
                    'test'
                ]
            }
        });
    }
    ;
    exec(message) {
        message.util.send('https://cdn.discordapp.com/attachments/693586365819912252/785998251639701514/video0.mov');
    }
}
exports.default = TestCommand;
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9vd25lci90ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbURBQXlDO0FBR3pDLE1BQXFCLFdBQVksU0FBUSx3QkFBTztJQUM1QztRQUNJLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixPQUFPLEVBQUUsQ0FBQyxNQUFNLENBQUM7WUFDakIsUUFBUSxFQUFFLE9BQU87WUFDakIsV0FBVyxFQUFFO2dCQUNULE9BQU8sRUFBRSx3QkFBd0I7Z0JBQ2pDLEtBQUssRUFBRSxNQUFNO2dCQUNiLFFBQVEsRUFBRTtvQkFDTixNQUFNO2lCQUNUO2FBQ0o7U0FDSixDQUFDLENBQUM7SUFDUCxDQUFDO0lBQUEsQ0FBQztJQUNLLElBQUksQ0FBQyxPQUFnQjtRQUN4QixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx5RkFBeUYsQ0FBQyxDQUFBO0lBQ2hILENBQUM7Q0FDSjtBQWpCRCw4QkFpQkM7QUFBQSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tbWFuZCB9IGZyb20gJ2Rpc2NvcmQtYWthaXJvJztcclxuaW1wb3J0IHsgTWVzc2FnZSB9IGZyb20gJ2Rpc2NvcmQuanMnXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUZXN0Q29tbWFuZCBleHRlbmRzIENvbW1hbmQge1xyXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHN1cGVyKCd0ZXN0Jywge1xyXG4gICAgICAgICAgICBhbGlhc2VzOiBbJ3Rlc3QnXSxcclxuICAgICAgICAgICAgY2F0ZWdvcnk6ICdvd25lcicsXHJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICBjb250ZW50OiAnQSBjb21tYW5kIHRvIHRlc3Qgc2hpdCcsXHJcbiAgICAgICAgICAgICAgICB1c2FnZTogJ3Rlc3QnLFxyXG4gICAgICAgICAgICAgICAgZXhhbXBsZXM6IFtcclxuICAgICAgICAgICAgICAgICAgICAndGVzdCdcclxuICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIHB1YmxpYyBleGVjKG1lc3NhZ2U6IE1lc3NhZ2UpIHtcclxuICAgICAgICBtZXNzYWdlLnV0aWwuc2VuZCgnaHR0cHM6Ly9jZG4uZGlzY29yZGFwcC5jb20vYXR0YWNobWVudHMvNjkzNTg2MzY1ODE5OTEyMjUyLzc4NTk5ODI1MTYzOTcwMTUxNC92aWRlbzAubW92JylcclxuICAgIH1cclxufTsiXX0=