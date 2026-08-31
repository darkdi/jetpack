/**
 * External dependencies
 */
import { useMemo } from 'react';
import type { ChartTheme } from '@jetpack-premium-analytics/externals';
/**
 * Internal dependencies
 */
// Side-effect import: the chart colors this dashboard overrides, as catalog roles.
// CHARTS-263 removed every color field from the charts `theme` prop, so they are set
// in CSS instead — see `chart-roles.scss` for why the selector is what it is.
import './chart-roles.scss';

/**
 * The `@automattic/charts` theme plus the analytics-specific properties.
 */
export type WooChartTheme = ChartTheme & {
	leaderboardChart: ChartTheme[ 'leaderboardChart' ] & {
		barBorderRadius: string;
	};
};

export function useChartTheme(): WooChartTheme {
	return useMemo( () => {
		return {
			gridStyles: {
				strokeWidth: 1,
			},
			tickLength: 4,
			// `fontSize` is load-bearing: it must stay a plain number, since resolveFontSize()
			// rejects var() — without it visx falls back to 11 and margin/pie-label sizing break.
			svgLabelSmall: {
				fontSize: 12,
			},
			xAxisLineStyles: {
				strokeWidth: 1,
			},
			legend: {
				labelStyles: {
					fontSize: 'var(--wpds-typography-font-size-sm)',
					fontWeight: 400,
				},
				containerStyles: {
					rowGap: 'var( --wpds-dimension-padding-sm )',
					columnGap: 'var( --wpds-dimension-padding-sm )',
				},
				shapeStyles: [
					{
						transform: 'translate(0, 1px)',
					},
					{
						transform: 'translate(0, 1px)',
						strokeDasharray: '2, 2, 3, 2, 3, 2, 2',
					},
				],
			},
			leaderboardChart: {
				rowGap: 4,
				columnGap: 4,
				labelSpacing: 'xs',
				barBorderRadius: 'var(--wpds-border-radius-lg)',
			},
			lineChart: {
				lineStyles: {
					comparison: {
						strokeDasharray: '4 4',
						strokeWidth: 1.5,
						strokeLinecap: 'square' as const,
						strokeOpacity: 0.8,
						strokeDashoffset: 2,
					},
				},
			},
			seriesLineStyles: [
				{
					strokeWidth: 2,
				},
				{
					strokeDasharray: '4 4',
					strokeWidth: 1.5,
					strokeLinecap: 'square' as const,
					strokeDashoffset: 2,
				},
			],
		};
	}, [] );
}
