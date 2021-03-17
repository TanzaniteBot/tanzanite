export class ChannelNotFoundError extends Error {
	constructor(id: string) {
		super(`Could not find channel with id ${id}`);
		this.name = 'ChannelNotFoundError';
	}
}

export class ChannelWrongTypeError extends Error {
	constructor(id: string, type: unknown) {
		super(`Channel with id ${id} is not type ${type}`);
		this.name = 'ChannelWrongTypeError';
	}
}
