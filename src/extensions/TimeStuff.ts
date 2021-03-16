import moment from 'moment';

export class TimeStuff {
	time: string;
	amount: string;

	public constructor(time: string, amount: string) {
		this.time = time;
		this.amount = amount;
	}

	public aaa(): boolean {
		const a = moment(this.time);
		const b = moment(Date.now());
		if (a.isBefore(b.subtract(this.amount))) {
			return true;
		} else {
			return false;
		}
	}
}
