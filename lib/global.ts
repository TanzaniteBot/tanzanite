/* eslint-disable */

declare global {
	interface ReadonlyArray<T> {
		includes<S, R extends `${Extract<S, string>}`>(
			this: ReadonlyArray<R>,
			searchElement: S,
			fromIndex?: number
		): searchElement is R & S;
	}
}

// #region @napi-rs/canvas
// @napi-rs/canvas references a lot of dom types so I have copied them here to prevent
// incorrect dom global pollution. This is not ideal but better than having to rely
// on dom types.
declare module '@napi-rs/canvas' {
	type GlobalCompositeOperation =
		| 'color'
		| 'color-burn'
		| 'color-dodge'
		| 'copy'
		| 'darken'
		| 'destination-atop'
		| 'destination-in'
		| 'destination-out'
		| 'destination-over'
		| 'difference'
		| 'exclusion'
		| 'hard-light'
		| 'hue'
		| 'lighten'
		| 'lighter'
		| 'luminosity'
		| 'multiply'
		| 'overlay'
		| 'saturation'
		| 'screen'
		| 'soft-light'
		| 'source-atop'
		| 'source-in'
		| 'source-out'
		| 'source-over'
		| 'xor';
	type CanvasFillRule = 'evenodd' | 'nonzero';
	type PredefinedColorSpace = 'display-p3' | 'srgb';
	type ImageSmoothingQuality = 'high' | 'low' | 'medium';
	type CanvasLineCap = 'butt' | 'round' | 'square';
	type CanvasLineJoin = 'bevel' | 'miter' | 'round';
	type CanvasDirection = 'inherit' | 'ltr' | 'rtl';
	type CanvasFontKerning = 'auto' | 'none' | 'normal';
	type CanvasTextAlign = 'center' | 'end' | 'left' | 'right' | 'start';
	type CanvasTextBaseline = 'alphabetic' | 'bottom' | 'hanging' | 'ideographic' | 'middle' | 'top';

	class CanvasGradient {
		addColorStop(offset: number, color: string): void;
	}

	class TextMetrics {
		readonly actualBoundingBoxAscent: number;
		readonly actualBoundingBoxDescent: number;
		readonly actualBoundingBoxLeft: number;
		readonly actualBoundingBoxRight: number;
		readonly fontBoundingBoxAscent: number;
		readonly fontBoundingBoxDescent: number;
		readonly width: number;
	}

	interface DOMMatrix2DInit {
		m11?: number;
		m12?: number;
		m21?: number;
		m22?: number;
		m41?: number;
		m42?: number;
	}

	interface DOMMatrixInit extends DOMMatrix2DInit {
		is2D?: boolean;
		m13?: number;
		m14?: number;
		m23?: number;
		m24?: number;
		m31?: number;
		m32?: number;
		m33?: number;
		m34?: number;
		m43?: number;
		m44?: number;
	}

	interface DOMPointInit {
		w?: number;
		x?: number;
		y?: number;
		z?: number;
	}

	interface DOMRectInit {
		height?: number;
		width?: number;
		x?: number;
		y?: number;
	}

	interface CanvasPattern {
		setTransform(transform?: DOMMatrix2DInit): void;
	}

	interface ImageDataSettings {
		colorSpace?: PredefinedColorSpace;
	}

	class CanvasRenderingContext2D {
		// CanvasCompositing
		globalAlpha: number;
		globalCompositeOperation: GlobalCompositeOperation;

		// CanvasDrawPath
		beginPath(): void;
		clip(fillRule?: CanvasFillRule): void;
		clip(path: Path2D, fillRule?: CanvasFillRule): void;
		fill(fillRule?: CanvasFillRule): void;
		fill(path: Path2D, fillRule?: CanvasFillRule): void;
		isPointInPath(x: number, y: number, fillRule?: CanvasFillRule): boolean;
		isPointInPath(path: Path2D, x: number, y: number, fillRule?: CanvasFillRule): boolean;
		isPointInStroke(x: number, y: number): boolean;
		isPointInStroke(path: Path2D, x: number, y: number): boolean;
		stroke(): void;
		stroke(path: Path2D): void;

		// CanvasFillStrokeStyles
		fillStyle: string | CanvasGradient | CanvasPattern;
		strokeStyle: string | CanvasGradient | CanvasPattern;
		createConicGradient(startAngle: number, x: number, y: number): CanvasGradient;
		createLinearGradient(x0: number, y0: number, x1: number, y1: number): CanvasGradient;
		createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): CanvasGradient;

		// CanvasFilters
		filter: string;

		// CanvasImageData
		createImageData(sw: number, sh: number, settings?: ImageDataSettings): ImageData;
		createImageData(imagedata: ImageData): ImageData;
		getImageData(sx: number, sy: number, sw: number, sh: number, settings?: ImageDataSettings): ImageData;
		putImageData(imagedata: ImageData, dx: number, dy: number): void;
		putImageData(
			imagedata: ImageData,
			dx: number,
			dy: number,
			dirtyX: number,
			dirtyY: number,
			dirtyWidth: number,
			dirtyHeight: number
		): void;

		// CanvasImageSmoothing
		imageSmoothingEnabled: boolean;
		imageSmoothingQuality: ImageSmoothingQuality;

		// CanvasPath
		arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void;
		arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void;
		bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;
		closePath(): void;
		ellipse(
			x: number,
			y: number,
			radiusX: number,
			radiusY: number,
			rotation: number,
			startAngle: number,
			endAngle: number,
			counterclockwise?: boolean
		): void;
		lineTo(x: number, y: number): void;
		moveTo(x: number, y: number): void;
		quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;
		rect(x: number, y: number, w: number, h: number): void;
		roundRect(x: number, y: number, w: number, h: number, radii?: number | DOMPointInit | (number | DOMPointInit)[]): void;

		// CanvasPathDrawingStyles
		lineCap: CanvasLineCap;
		lineDashOffset: number;
		lineJoin: CanvasLineJoin;
		lineWidth: number;
		miterLimit: number;
		getLineDash(): number[];
		setLineDash(segments: number[]): void;

		// CanvasRect
		clearRect(x: number, y: number, w: number, h: number): void;
		fillRect(x: number, y: number, w: number, h: number): void;
		strokeRect(x: number, y: number, w: number, h: number): void;

		// CanvasShadowStyles
		shadowBlur: number;
		shadowColor: string;
		shadowOffsetX: number;
		shadowOffsetY: number;

		// CanvasState
		restore(): void;
		save(): void;

		// CanvasText
		fillText(text: string, x: number, y: number, maxWidth?: number): void;
		measureText(text: string): TextMetrics;
		strokeText(text: string, x: number, y: number, maxWidth?: number): void;

		// CanvasTextDrawingStyles
		direction: CanvasDirection;
		font: string;
		fontKerning: CanvasFontKerning;
		textAlign: CanvasTextAlign;
		textBaseline: CanvasTextBaseline;

		// CanvasTransform
		resetTransform(): void;
		rotate(angle: number): void;
		scale(x: number, y: number): void;
		setTransform(a: number, b: number, c: number, d: number, e: number, f: number): void;
		setTransform(transform?: DOMMatrix2DInit): void;
		transform(a: number, b: number, c: number, d: number, e: number, f: number): void;
		translate(x: number, y: number): void;
	}
}
// #endregion

export {};
