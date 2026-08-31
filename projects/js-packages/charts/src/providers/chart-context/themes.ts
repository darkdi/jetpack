import { ANNOTATION_POINTERS, CATALOG_POINTERS, DELTA_POINTERS } from './private/catalog-pointers';
import type { CompleteChartTheme } from '../../types';

/**
 * Default theme configuration
 */
const defaultTheme: CompleteChartTheme = {
	backgroundColor: CATALOG_POINTERS.background,
	labelBackgroundColor: CATALOG_POINTERS.labelBackground,
	labelTextColor: CATALOG_POINTERS.labelOnFill,
	colors: [ ...CATALOG_POINTERS.series ],
	gridStyles: {
		stroke: CATALOG_POINTERS.grid,
		strokeWidth: 1,
	},
	tickLength: 4,
	xTickLineStyles: {
		stroke: CATALOG_POINTERS.tick,
		strokeWidth: 1,
	},
	xAxisLineStyles: {
		stroke: CATALOG_POINTERS.axis,
		strokeWidth: 1,
	},
	legend: {
		labelStyles: {
			color: CATALOG_POINTERS.label,
		},
		containerStyles: {},
		shapeStyles: [],
	},
	seriesLineStyles: [],
	glyphs: [],
	// `fontFamily: 'inherit'` overrides visx's hardcoded default font stack
	// (`-apple-system,BlinkMacSystemFont,Roboto,Helvetica Neue,sans-serif`)
	// that `buildChartTheme` injects as an inline style on SVG `<text>`
	// elements for axis labels and ticks. Setting `inherit` lets SVG text
	// pick up the host application's font-family via normal CSS inheritance.
	svgLabelSmall: {
		fill: CATALOG_POINTERS.labelAxis,
		fontFamily: 'inherit',
	},
	svgLabelBig: { fontFamily: 'inherit' },
	annotationStyles: {
		label: { ...ANNOTATION_POINTERS.label },
		connector: { ...ANNOTATION_POINTERS.connector },
		circleSubject: { ...ANNOTATION_POINTERS.circleSubject },
	},
	geoChart: {
		featureFillColor: CATALOG_POINTERS.surfaceSecondary,
	},
	leaderboardChart: {
		rowGap: 12,
		columnGap: 4,
		labelSpacing: 'xs',
		deltaColors: [ ...DELTA_POINTERS ],
	},
	conversionFunnelChart: {
		backgroundColor: CATALOG_POINTERS.surfaceSecondary,
		positiveChangeColor: CATALOG_POINTERS.trendUp,
		negativeChangeColor: CATALOG_POINTERS.trendDown,
	},
	lineChart: {
		lineStyles: {
			comparison: {
				strokeDasharray: '4 4',
				strokeLinecap: 'square',
			},
		},
	},
	barChart: {
		barStyles: {
			comparison: {
				widthFactor: 1.5,
				opacity: 0.5,
			},
		},
	},
	sparkline: {
		margin: { top: 2, right: 2, bottom: 2, left: 2 },
		strokeWidth: 1.5,
	},
	// `primaryColor` is left unset so it falls back to the palette's `colors[0]`. The compact
	// 11px square / 2px gap is the contribution-graph rhythm, which has no WPDS dimension.
	heatmapChart: {
		compactCellGap: 2,
		compactCellSize: 11,
	},
};

export { defaultTheme };
