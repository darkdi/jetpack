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

		// The palette is the one place a pointer has to be resolved: visx builds its `colorScale` from this array and uses it as the default stroke for a series rendered without an explicit one, so an unresolved entry paints nothing rather than degrading. Slots past the first have no catalog default and resolve to nothing until a consumer sets them; those are dropped so the scale compacts instead of repeating a color.
		const paletteColors = [ ...seriesColors, ...CATALOG_POINTERS.series ]
			.map( color => resolveColor( color ) )
			.filter( ( color ): color is string => Boolean( color ) && ! color.includes( 'var(' ) );

		// The tooltip is painted in a portal outside the scope, and visx concatenates this color into a `box-shadow` where a chain cannot take a suffix; see TOKENS.md#the-svg-bridge. Passing it explicitly leaves `svgLabelSmall.fill`, which visx derives it from, a chain for the SVG tick labels.
		const htmlLabelColor = resolveColor( CATALOG_POINTERS.labelAxis );

		// Every painted color reaches visx as its catalog pointer, and that is the whole mechanism: visx writes each one onto the element it paints — an inline style for the grid, a presentation attribute elsewhere — and a `var()` chain resolves there natively. So the role is read at the painted element rather than snapshot at the provider wrapper, which is what makes an override on a chart's own class work, keeps a theme change live without a re-render, and leaves nothing to resolve during SSR. Resolving one here would freeze it instead.
		//
		// Both axes are painted from their own roles. The y pair resolves to `none` unless a consumer declares it, which is what leaves the y axis carrying labels only.
		//
		// `gridColor` and `gridColorDark` are visx's fallbacks for whichever of those four it is not given, so supplying all four leaves them reaching nothing. They stay because the config type requires them.
		return buildChartTheme( {
			...theme,
			gridColor: '',
			gridColorDark: '',
			colors: paletteColors,
			backgroundColor: resolveColor( CATALOG_POINTERS.background ),
			htmlLabel: htmlLabelColor ? { color: htmlLabelColor } : undefined,
			gridStyles: { ...theme.gridStyles, stroke: CATALOG_POINTERS.grid },
			xAxisLineStyles: { ...theme.xAxisLineStyles, stroke: CATALOG_POINTERS.axis },
			xTickLineStyles: { ...theme.xTickLineStyles, stroke: CATALOG_POINTERS.tick },
			yAxisLineStyles: { stroke: CATALOG_POINTERS.axisY },
			yTickLineStyles: { stroke: CATALOG_POINTERS.tickY },
			svgLabelSmall: { ...theme.svgLabelSmall, fill: CATALOG_POINTERS.labelAxis },
		} );
	}, [ theme, seriesColorKey, scopeElement ] );
};
