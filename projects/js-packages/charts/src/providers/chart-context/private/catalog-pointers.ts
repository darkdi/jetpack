import { SERIES_PALETTE_POINTERS } from './series-palette';

/*
 * The chart colors JS has to hand to something, as the `var()` chain carrying each one's catalog
 * role.
 *
 * These are not defaults, they are the delivery mechanism for colors that cannot reach an element
 * through a stylesheet — an SVG attribute visx or our own JSX writes, or a custom property fed to a
 * `color-mix`. A painted color is still never *resolved*: the chain lands on the element and
 * resolves there, which is what lets an override on a chart's own class apply, keeps a theme change
 * live with no re-render, and leaves nothing to resolve during SSR. The terminal literal is the last
 * resort for SSR and jsdom, where `getComputedStyle` answers nothing.
 *
 * A color an ordinary element can take from a stylesheet does not belong here — it belongs in that
 * component's `.module.scss`, referencing the role bare. Every entry below should be one JS is
 * forced to carry.
 *
 * Internal by design. A consumer moves a color by setting the role in CSS, so there is no theme
 * field for one of these to disagree with.
 */
export const CATALOG_POINTERS = {
	background: 'var(--a8c-charts-color-background, #fff)',
	labelBackground: 'var(--a8c-charts-color-label-background, transparent)',
	labelOnFill: 'var(--a8c-charts-color-label-on-fill, #FFFFFF)',
	labelAxis: 'var(--a8c-charts-color-label-axis, #1e1e1e)',
	grid: 'var(--a8c-charts-color-grid, #dbdbdb)',
	// One pair per axis. The y axis carries labels only unless a consumer asks for more, so its
	// pair resolves to `none` rather than to a color.
	axisX: 'var(--a8c-charts-color-axis-x, #dbdbdb)',
	tickX: 'var(--a8c-charts-color-tick-x, #dbdbdb)',
	axisY: 'var(--a8c-charts-color-axis-y, none)',
	tickY: 'var(--a8c-charts-color-tick-y, none)',
	annotation: 'var(--a8c-charts-color-annotation, #1e1e1e)',
	surface: 'var(--a8c-charts-color-surface, #fff)',
	surfaceSecondary: 'var(--a8c-charts-color-surface-secondary, #f4f4f4)',
	// Only for `ConversionFunnelChart`'s `renderMainMetric`, which hands a consumer's own markup
	// something to paint with. Its default markup takes these from the stylesheet, as the leaderboard
	// deltas do.
	trendUp: 'var(--a8c-charts-color-trend-up, #008030)',
	trendDown: 'var(--a8c-charts-color-trend-down, #cc1818)',
	series: SERIES_PALETTE_POINTERS,
} as const;

/**
 * The annotation parts visx paints, in the shape `@visx/annotation` takes.
 *
 * `radius` rides along because it is the base every annotation starts from, and this is what the
 * theme and the per-datum styles merge on top of.
 */
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
