import { Listener } from 'discord-akairo';

export default class ReadyListener extends Listener {
    public constructor() {
        super('ready', {
            emitter: 'client',
            event: 'ready',
            category: 'client'
        });
    }

    public exec(): void {
        console.log(`Logged in to ${this.client.user.tag} (with token: ${this.client.token})`);
        console.log('All commands loaded');
        console.log('All listners and inhibitors loaded');
        console.log('-----------------------------------------------------------------------------')
    };
};