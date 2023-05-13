/* eslint-disable */

declare global {
	interface ReadonlyArray<T> {
		includes<S, R extends `${Extract<S, string>}`>(
			this: ReadonlyArray<R>,
			searchElement: S,
			fromIndex?: number
		): searchElement is R & S;
	}

	// todo: remove workaround when https://github.com/DefinitelyTyped/DefinitelyTyped/issues/60924 is resolved
	export const { fetch, FormData, Headers, Request, Response }: typeof import('undici');
}

// #region @napi-rs/canvas
// @napi-rs/canvas references a lot of dom types so I have copied them here to prevent
// incorrect dom global pollution. This is not ideal but better than having to rely
// on dom types.
declare module '@napi-rs/canvas' {
	interface CanvasGradient {
		addColorStop(offset: number, color: string): void;
	}

	var CanvasGradient: {
		prototype: CanvasGradient;
		new (): CanvasGradient;
	};

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

	interface CanvasRenderingContext2D
		extends CanvasCompositing,
			CanvasDrawPath,
			CanvasFillStrokeStyles,
			CanvasFilters,
			CanvasImageData,
			CanvasImageSmoothing,
			CanvasPath,
			CanvasPathDrawingStyles,
			CanvasRect,
			CanvasShadowStyles,
			CanvasState,
			CanvasText,
			CanvasTextDrawingStyles,
			CanvasTransform {}

	var CanvasRenderingContext2D: {
		prototype: CanvasRenderingContext2D;
		new (): CanvasRenderingContext2D;
	};

	interface CanvasCompositing {
		globalAlpha: number;
		globalCompositeOperation: GlobalCompositeOperation;
	}

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

	interface CanvasDrawPath {
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
	}

	type CanvasFillRule = 'evenodd' | 'nonzero';

	interface CanvasFillStrokeStyles {
		fillStyle: string | CanvasGradient | CanvasPattern;
		strokeStyle: string | CanvasGradient | CanvasPattern;
		createConicGradient(startAngle: number, x: number, y: number): CanvasGradient;
		createLinearGradient(x0: number, y0: number, x1: number, y1: number): CanvasGradient;
		createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): CanvasGradient;
	}

	interface CanvasPattern {
		setTransform(transform?: DOMMatrix2DInit): void;
	}

	interface CanvasFilters {
		filter: string;
	}

	interface CanvasImageData {
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
	}

	interface ImageDataSettings {
		colorSpace?: PredefinedColorSpace;
	}

	type PredefinedColorSpace = 'display-p3' | 'srgb';

	interface CanvasImageSmoothing {
		imageSmoothingEnabled: boolean;
		imageSmoothingQuality: ImageSmoothingQuality;
	}

	type ImageSmoothingQuality = 'high' | 'low' | 'medium';

	interface CanvasPath {
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
	}

	interface CanvasPathDrawingStyles {
		lineCap: CanvasLineCap;
		lineDashOffset: number;
		lineJoin: CanvasLineJoin;
		lineWidth: number;
		miterLimit: number;
		getLineDash(): number[];
		setLineDash(segments: number[]): void;
	}

	type CanvasLineCap = 'butt' | 'round' | 'square';
	type CanvasLineJoin = 'bevel' | 'miter' | 'round';

	interface CanvasRect {
		clearRect(x: number, y: number, w: number, h: number): void;
		fillRect(x: number, y: number, w: number, h: number): void;
		strokeRect(x: number, y: number, w: number, h: number): void;
	}

	interface CanvasShadowStyles {
		shadowBlur: number;
		shadowColor: string;
		shadowOffsetX: number;
		shadowOffsetY: number;
	}

	interface CanvasState {
		restore(): void;
		save(): void;
	}

	interface CanvasText {
		fillText(text: string, x: number, y: number, maxWidth?: number): void;
		measureText(text: string): TextMetrics;
		strokeText(text: string, x: number, y: number, maxWidth?: number): void;
	}

	interface TextMetrics {
		readonly actualBoundingBoxAscent: number;
		readonly actualBoundingBoxDescent: number;
		readonly actualBoundingBoxLeft: number;
		readonly actualBoundingBoxRight: number;
		readonly fontBoundingBoxAscent: number;
		readonly fontBoundingBoxDescent: number;
		readonly width: number;
	}

	var TextMetrics: {
		prototype: TextMetrics;
		new (): TextMetrics;
	};

	interface CanvasTextDrawingStyles {
		direction: CanvasDirection;
		font: string;
		fontKerning: CanvasFontKerning;
		textAlign: CanvasTextAlign;
		textBaseline: CanvasTextBaseline;
	}

	type CanvasDirection = 'inherit' | 'ltr' | 'rtl';
	type CanvasFontKerning = 'auto' | 'none' | 'normal';
	type CanvasTextAlign = 'center' | 'end' | 'left' | 'right' | 'start';
	type CanvasTextBaseline = 'alphabetic' | 'bottom' | 'hanging' | 'ideographic' | 'middle' | 'top';

	interface CanvasTransform {
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
