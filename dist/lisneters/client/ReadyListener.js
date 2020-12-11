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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVhZHlMaXN0ZW5lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saXNuZXRlcnMvY2xpZW50L1JlYWR5TGlzdGVuZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtREFBMEM7QUFFMUMsTUFBcUIsYUFBYyxTQUFRLHlCQUFRO0lBQy9DO1FBQ0ksS0FBSyxDQUFDLE9BQU8sRUFBRTtZQUNYLE9BQU8sRUFBRSxRQUFRO1lBQ2pCLEtBQUssRUFBRSxPQUFPO1lBQ2QsUUFBUSxFQUFFLFFBQVE7U0FDckIsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLElBQUk7UUFDUCxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLGlCQUFpQixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDdkYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBQ25DLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0NBQW9DLENBQUMsQ0FBQztRQUNsRCxPQUFPLENBQUMsR0FBRyxDQUFDLCtFQUErRSxDQUFDLENBQUE7SUFDaEcsQ0FBQztJQUFBLENBQUM7Q0FDTDtBQWZELGdDQWVDO0FBQUEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IExpc3RlbmVyIH0gZnJvbSAnZGlzY29yZC1ha2Fpcm8nO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZWFkeUxpc3RlbmVyIGV4dGVuZHMgTGlzdGVuZXIge1xuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoJ3JlYWR5Jywge1xuICAgICAgICAgICAgZW1pdHRlcjogJ2NsaWVudCcsXG4gICAgICAgICAgICBldmVudDogJ3JlYWR5JyxcbiAgICAgICAgICAgIGNhdGVnb3J5OiAnY2xpZW50J1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZXhlYygpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5sb2coYExvZ2dlZCBpbiB0byAke3RoaXMuY2xpZW50LnVzZXIudGFnfSAod2l0aCB0b2tlbjogJHt0aGlzLmNsaWVudC50b2tlbn0pYCk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdBbGwgY29tbWFuZHMgbG9hZGVkJyk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdBbGwgbGlzdG5lcnMgYW5kIGluaGliaXRvcnMgbG9hZGVkJyk7XG4gICAgICAgIGNvbnNvbGUubG9nKCctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLScpXG4gICAgfTtcbn07Il19