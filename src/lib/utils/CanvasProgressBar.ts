// I just copy pasted this code from stackoverflow don't yell at me if there is issues for it
export class CanvasProgressBar {
	private x: number;
	private y: number;
	private w: number;
	private h: number;
	private color: string;
	private percentage: number;
	private p: number;
	private ctx: CanvasRenderingContext2D;

	constructor(
		ctx: CanvasRenderingContext2D,
		dimension: { x: number; y: number; width: number; height: number },
		color: string,
		percentage: number
	) {
		({ x: this.x, y: this.y, width: this.w, height: this.h } = dimension);
		this.color = color;
		this.percentage = percentage;
		this.p;
		this.ctx = ctx;
	}

	draw(): void {
		// -----------------
		this.p = this.percentage * this.w;
		if (this.p <= this.h) {
			this.ctx.beginPath();
			this.ctx.arc(
				this.h / 2 + this.x,
				this.h / 2 + this.y,
				this.h / 2,
				Math.PI - Math.acos((this.h - this.p) / this.h),
				Math.PI + Math.acos((this.h - this.p) / this.h)
			);
			this.ctx.save();
			this.ctx.scale(-1, 1);
			this.ctx.arc(
				this.h / 2 - this.p - this.x,
				this.h / 2 + this.y,
				this.h / 2,
				Math.PI - Math.acos((this.h - this.p) / this.h),
				Math.PI + Math.acos((this.h - this.p) / this.h)
			);
			this.ctx.restore();
			this.ctx.closePath();
		} else {
			this.ctx.beginPath();
			this.ctx.arc(this.h / 2 + this.x, this.h / 2 + this.y, this.h / 2, Math.PI / 2, (3 / 2) * Math.PI);
			this.ctx.lineTo(this.p - this.h + this.x, 0 + this.y);
			this.ctx.arc(this.p - this.h / 2 + this.x, this.h / 2 + this.y, this.h / 2, (3 / 2) * Math.PI, Math.PI / 2);
			this.ctx.lineTo(this.h / 2 + this.x, this.h + this.y);
			this.ctx.closePath();
		}
		this.ctx.fillStyle = this.color;
		this.ctx.fill();
	}

	// showWholeProgressBar(){
	//   this.ctx.beginPath();
	//   this.ctx.arc(this.h / 2 + this.x, this.h / 2 + this.y, this.h / 2, Math.PI / 2, 3 / 2 * Math.PI);
	//   this.ctx.lineTo(this.w - this.h + this.x, 0 + this.y);
	//   this.ctx.arc(this.w - this.h / 2 + this.x, this.h / 2 + this.y, this.h / 2, 3 / 2 *Math.PI, Math.PI / 2);
	//   this.ctx.lineTo(this.h / 2 + this.x, this.h + this.y);
	//   this.ctx.strokeStyle = '#000000';
	//   this.ctx.stroke();
	//   this.ctx.closePath();
	// }

	get PPercentage(): number {
		return this.percentage * 100;
	}

	set PPercentage(x: number) {
		this.percentage = x / 100;
	}
}
