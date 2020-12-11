"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_akairo_1 = require("discord-akairo");
class ReadyListener extends discord_akairo_1.Listener {
    constructor() {
        super('ready', {
            emitter: 'client',
            event: 'ready',
            category: 'client'
        });
    }
    exec() {
        console.log(`Logged in to ${this.client.user.tag} (with token: ${this.client.token})`);
        console.log('All commands loaded');
        console.log('All listners and inhibitors loaded');
        console.log('-----------------------------------------------------------------------------');
    }
    ;
}
exports.default = ReadyListener;
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVhZHlMaXN0ZW5lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saXNuZXRlcnMvY2xpZW50L1JlYWR5TGlzdGVuZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtREFBMEM7QUFFMUMsTUFBcUIsYUFBYyxTQUFRLHlCQUFRO0lBQy9DO1FBQ0ksS0FBSyxDQUFDLE9BQU8sRUFBRTtZQUNYLE9BQU8sRUFBRSxRQUFRO1lBQ2pCLEtBQUssRUFBRSxPQUFPO1lBQ2QsUUFBUSxFQUFFLFFBQVE7U0FDckIsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLElBQUk7UUFDUCxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLGlCQUFpQixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDdkYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBQ25DLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0NBQW9DLENBQUMsQ0FBQztRQUNsRCxPQUFPLENBQUMsR0FBRyxDQUFDLCtFQUErRSxDQUFDLENBQUE7SUFDaEcsQ0FBQztJQUFBLENBQUM7Q0FDTDtBQWZELGdDQWVDO0FBQUEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IExpc3RlbmVyIH0gZnJvbSAnZGlzY29yZC1ha2Fpcm8nO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVhZHlMaXN0ZW5lciBleHRlbmRzIExpc3RlbmVyIHtcclxuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBzdXBlcigncmVhZHknLCB7XHJcbiAgICAgICAgICAgIGVtaXR0ZXI6ICdjbGllbnQnLFxyXG4gICAgICAgICAgICBldmVudDogJ3JlYWR5JyxcclxuICAgICAgICAgICAgY2F0ZWdvcnk6ICdjbGllbnQnXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGV4ZWMoKTogdm9pZCB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYExvZ2dlZCBpbiB0byAke3RoaXMuY2xpZW50LnVzZXIudGFnfSAod2l0aCB0b2tlbjogJHt0aGlzLmNsaWVudC50b2tlbn0pYCk7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ0FsbCBjb21tYW5kcyBsb2FkZWQnKTtcclxuICAgICAgICBjb25zb2xlLmxvZygnQWxsIGxpc3RuZXJzIGFuZCBpbmhpYml0b3JzIGxvYWRlZCcpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLScpXHJcbiAgICB9O1xyXG59OyJdfQ==