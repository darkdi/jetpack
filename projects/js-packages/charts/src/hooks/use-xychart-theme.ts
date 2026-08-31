import { buildChartTheme } from '@visx/xychart';
import { useMemo } from 'react';
import { useGlobalChartsTheme } from '../providers';
import { CATALOG_POINTERS } from '../providers/chart-context/private/catalog-pointers';
import { useChartScopeElement } from '../providers/chart-scope';
import { createCssVariableResolver } from '../utils';
import type { SeriesData } from '../types';

export const useXYChartTheme = ( data: SeriesData[] ) => {
	const theme = useGlobalChartsTheme();
	const scopeElement = useChartScopeElement();

	// The only thing the theme takes from `data` is the series strokes, so key the memo on those rather than on the array's identity. A caller passing an inline literal — `<LineChart data={ [ … ] } />`, which the stories and several consumers do — otherwise rebuilds the whole theme on every render. Serialized rather than joined: a stroke can be `rgba(0, 0, 0, 0.5)` or `var(--brand, #fff)`, and any separator that reads naturally inside a color cannot round-trip.
	const seriesColorKey = JSON.stringify(
		( data ?? [] )
			.map( series => series.options?.stroke )
			.filter( ( color ): color is string => Boolean( color ) )
	);

	return useMemo( () => {
		// Only what is read as a string is resolved here — the palette and `backgroundColor` — plus `htmlLabel.color` below, which is painted outside the scope. Resolving against the chart's own scope element, never :root, is what reads an override set inside the provider tree.
		//
		// One resolver per theme build, so all three share a single getComputedStyle call.
		const resolve = createCssVariableResolver( scopeElement );
		const resolveColor = ( value?: string ): string | undefined =>
			value ? resolve( value ) ?? value : value;

		const seriesColors: string[] = JSON.parse( seriesColorKey );

		// visx uses this array as the default stroke for a series with none of its own, so an unresolved entry paints nothing. Slots past the first resolve to nothing until a consumer sets them, and are dropped so the scale compacts rather than repeating a color.
		const paletteColors = [ ...seriesColors, ...CATALOG_POINTERS.series ]
			.map( color => resolveColor( color ) )
			.filter( ( color ): color is string => Boolean( color ) && ! color.includes( 'var(' ) );

		// The tooltip is painted in a portal outside the scope, and visx concatenates this color into a `box-shadow` where a chain cannot take a suffix; see TOKENS.md#the-svg-bridge. Passing it explicitly leaves `svgLabelSmall.fill`, which visx derives it from, a chain for the SVG tick labels.
		const htmlLabelColor = resolveColor( CATALOG_POINTERS.labelAxis );

		// `gridColor` and `gridColorDark` are visx's fallbacks for whichever of the four axis and grid style objects it is not given. All four are supplied, so the pair reaches nothing; it stays because the config type requires it.
		return buildChartTheme( {
			...theme,
			gridColor: '',
			gridColorDark: '',
			colors: paletteColors,
			backgroundColor: resolveColor( CATALOG_POINTERS.background ),
			htmlLabel: htmlLabelColor ? { color: htmlLabelColor } : undefined,
			gridStyles: { ...theme.gridStyles, stroke: CATALOG_POINTERS.grid },
			xAxisLineStyles: { ...theme.xAxisLineStyles, stroke: CATALOG_POINTERS.axisX },
			xTickLineStyles: { ...theme.xTickLineStyles, stroke: CATALOG_POINTERS.tickX },
			yAxisLineStyles: { stroke: CATALOG_POINTERS.axisY },
			yTickLineStyles: { stroke: CATALOG_POINTERS.tickY },
			svgLabelSmall: { ...theme.svgLabelSmall, fill: CATALOG_POINTERS.labelAxis },
		} );
	}, [ theme, seriesColorKey, scopeElement ] );
};
