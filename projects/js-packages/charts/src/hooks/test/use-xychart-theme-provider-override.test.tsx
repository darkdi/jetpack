import { renderHook } from '@testing-library/react';
import { GlobalChartsProvider } from '../../providers/chart-context/global-charts-provider';
import { ChartScopeContext } from '../../providers/chart-scope';
import { useXYChartTheme } from '../use-xychart-theme';
import type { ReactNode } from 'react';

// The catalog declares its roles on the provider's own wrapper, and the JS-resolved colors are read at the chart's scope element rather than the wrapper. That is what lets an override set further in — on a chart's own class, say — reach a color that has to be resolved, and not just the painted ones.
describe( 'useXYChartTheme resolves at the chart scope element', () => {
	it( 'an override set inside the provider tree beats the catalog default', () => {
		const nestedOverride = document.createElement( 'div' );
		nestedOverride.style.setProperty( '--a8c-charts-color-background', '#00ff00' );
		document.body.appendChild( nestedOverride );

		const wrapper = ( { children }: { children: ReactNode } ) => (
			<GlobalChartsProvider>
				<ChartScopeContext.Provider value={ nestedOverride }>
					{ children }
				</ChartScopeContext.Provider>
			</GlobalChartsProvider>
		);

		const { result } = renderHook( () => useXYChartTheme( [] ), { wrapper } );

		expect( result.current.backgroundColor ).toBe( '#00ff00' );

		document.body.removeChild( nestedOverride );
	} );
} );
