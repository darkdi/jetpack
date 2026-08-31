import { SERIES_PALETTE_POINTERS } from './series-palette';

/*
 * Every chart color, as the `var()` chain that carries its catalog role to the element that paints
 * it.
 *
 * These are not defaults, they are the delivery mechanism. A painted color is never resolved: the
 * chain reaches the SVG presentation attribute or inline style and resolves there, which is what
 * lets an override on a chart's own class apply, keeps a theme change live with no re-render, and
 * leaves nothing to resolve during SSR. The terminal literal is the last resort for SSR and jsdom,
 * where `getComputedStyle` answers nothing.
 *
 * Internal by design. A consumer moves a color by setting the role in CSS, so there is no theme
 * field for one of these to disagree with.
 */
export const CATALOG_POINTERS = {
	background: 'var(--a8c-charts-color-background, #fff)',
	labelBackground: 'var(--a8c-charts-color-label-background, transparent)',
	labelOnFill: 'var(--a8c-charts-color-label-on-fill, #FFFFFF)',
	label: 'var(--a8c-charts-color-label, #1e1e1e)',
	labelAxis: 'var(--a8c-charts-color-label-axis, #1e1e1e)',
	grid: 'var(--a8c-charts-color-grid, #dbdbdb)',
	axis: 'var(--a8c-charts-color-axis, #dbdbdb)',
	tick: 'var(--a8c-charts-color-tick, #dbdbdb)',
	annotation: 'var(--a8c-charts-color-annotation, #1e1e1e)',
	surface: 'var(--a8c-charts-color-surface, #fff)',
	surfaceSecondary: 'var(--a8c-charts-color-surface-secondary, #f4f4f4)',
	trendUp: 'var(--a8c-charts-color-trend-up, #008030)',
	trendDown: 'var(--a8c-charts-color-trend-down, #cc1818)',
	trendNeutral: 'var(--a8c-charts-color-trend-neutral, #707070)',
	series: SERIES_PALETTE_POINTERS,
} as const;

/** The annotation parts visx paints, in the shape `@visx/annotation` takes. */
export const ANNOTATION_POINTERS = {
	label: {
		anchorLineStroke: CATALOG_POINTERS.annotation,
		backgroundFill: CATALOG_POINTERS.surface,
	},
	connector: {
		stroke: CATALOG_POINTERS.annotation,
	},
	circleSubject: {
		stroke: 'transparent',
		fill: CATALOG_POINTERS.annotation,
		radius: 5,
	},
} as const;

/** The delta indicator colors, in the [negative, neutral, positive] order the leaderboard reads. */
export const DELTA_POINTERS: [ string, string, string ] = [
	CATALOG_POINTERS.trendDown,
	CATALOG_POINTERS.trendNeutral,
	CATALOG_POINTERS.trendUp,
];
