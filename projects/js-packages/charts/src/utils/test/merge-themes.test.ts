import { mergeThemes } from '../merge-themes';
import type { ChartTheme } from '../../types';

describe( 'mergeThemes', () => {
	const baseTheme: ChartTheme = {
		gridStyles: {
			strokeWidth: 1,
		},
		tickLength: 4,
		seriesLineStyles: [ { strokeWidth: 1 }, { strokeWidth: 2 } ],
		leaderboardChart: {
			rowGap: 12,
			columnGap: 4,
		},
	};

	const overrideTheme: ChartTheme = {
		gridStyles: {
			strokeWidth: 2,
		},
		tickLength: 8,
		leaderboardChart: {
			rowGap: 20,
		},
	};

	it( 'should return base theme when override theme is empty', () => {
		const result = mergeThemes( baseTheme, {} );
		expect( result ).toEqual( baseTheme );
	} );

	it( 'should merge themes with local theme taking precedence for top-level properties', () => {
		const result = mergeThemes( baseTheme, overrideTheme );

		expect( result.tickLength ).toBe( 8 );
	} );

	it( 'should deeply merge nested objects with local theme taking precedence', () => {
		const result = mergeThemes( baseTheme, overrideTheme );

		expect( result.gridStyles ).toEqual( { strokeWidth: 2 } );

		expect( result.leaderboardChart ).toEqual( {
			rowGap: 20, // from local
			columnGap: 4, // from global (not overridden)
		} );
	} );

	it( 'should use global theme properties when not defined in local theme', () => {
		const partialLocalTheme: ChartTheme = {
			tickLength: 8,
		};

		const result = mergeThemes( baseTheme, partialLocalTheme );

		expect( result.tickLength ).toBe( 8 );
		expect( result.gridStyles ).toEqual( baseTheme.gridStyles );
		expect( result.leaderboardChart ).toEqual( baseTheme.leaderboardChart );
	} );

	it( 'should handle array replacement correctly', () => {
		const localWithFewerStyles: ChartTheme = {
			...overrideTheme,
			seriesLineStyles: [ { strokeWidth: 5 } ],
		};

		const result = mergeThemes( baseTheme, localWithFewerStyles );

		// Arrays should be replaced, not concatenated
		expect( result.seriesLineStyles ).toEqual( [ { strokeWidth: 5 } ] );
	} );
} );
