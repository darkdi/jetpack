<?php
/**
 * Tests for WPCom Tracking for WP Admin Page Views.
 *
 * @package automattic/jetpack-mu-wpcom
 */

namespace Automattic\Jetpack\Jetpack_Mu_Wpcom\Wpcom_Wpadmin_Page_View;

use Automattic\Jetpack\Jetpack_Mu_Wpcom;
use Brain\Monkey\Functions;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\PreserveGlobalState;
use PHPUnit\Framework\Attributes\RunInSeparateProcess;
use PHPUnit\Framework\Attributes\RunTestsInSeparateProcesses;
use PHPUnit\Framework\TestCase;

// Needed to load Class "WPCOMSH_Support_Session_Detect"
require_once Jetpack_Mu_Wpcom::PKG_DIR . '../../plugins/wpcomsh/support-session.php';
require_once Jetpack_Mu_Wpcom::PKG_DIR . 'src/features/wpcom-wpadmin-page-view/wpcom-wpadmin-page-view.php';

/**
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 */
#[RunTestsInSeparateProcesses]
#[PreserveGlobalState( false )]
class WPCOM_WPAdmin_Page_View_Test extends TestCase {
	/**
	 * Tests that the wpcom_nosara_track_admin_page_views function does not track admin page views for Automatticians.
	 *
	 * @dataProvider wpcom_nosara_track_admin_page_views_does_not_track_a11ns_provider
	 * @runInSeparateProcess
	 * @preserveGlobalState disabled
	 *
	 * @param bool      $is_wpcom         Whether the site is a WordPress.com site.
	 * @param bool|null $is_automattician Whether the user is an Automattician.
	 * @param bool|null $is_network_admin Whether the user is a network admin.
	 */
	#[DataProvider( 'wpcom_nosara_track_admin_page_views_does_not_track_a11ns_provider' )]
	#[RunInSeparateProcess]
	#[PreserveGlobalState( false )]
	public function test_wpcom_nosara_track_admin_page_views_does_not_track_a11ns(
		$is_wpcom,
		$is_automattician,
		$is_network_admin
	) {
		define( 'IS_WPCOM', $is_wpcom );
		$this->assertTrue( defined( 'IS_WPCOM' ), 'IS_WPCOM should be defined' );
		$this->assertSame( IS_WPCOM, $is_wpcom, 'IS_WPCOM should equal the provided value' );

		if ( ! defined( 'WP_NETWORK_ADMIN' ) ) {
			define( 'WP_NETWORK_ADMIN', $is_network_admin );
		}
		$this->assertTrue( defined( 'WP_NETWORK_ADMIN' ), 'WP_NETWORK_ADMIN should be defined' );
		$this->assertSame( WP_NETWORK_ADMIN, $is_network_admin, 'WP_NETWORK_ADMIN should equal the provided value' );

		Functions\stubs(
			array(
				'is_automattician' => $is_automattician,
			)
		);

		ob_start();
		wpcom_nosara_track_admin_page_views();
		$output = ob_get_clean();

		$this->assertSame( '', $output );
	}

	/**
	 * The event carries no other props, so dropping blog_id silently makes every row unattributable to a site.
	 *
	 * @runInSeparateProcess
	 * @preserveGlobalState disabled
	 */
	#[RunInSeparateProcess]
	#[PreserveGlobalState( false )]
	public function test_wpcom_track_customizer_from_frontend_sends_blog_id() {
		define( 'IS_WPCOM', true );
		define( 'WP_NETWORK_ADMIN', false );

		Functions\stubs(
			array(
				'is_automattician' => false,
			)
		);

		$GLOBALS['current_user'] = (object) array(
			'ID'         => 7,
			'user_login' => 'example',
		);

		ob_start();
		wpcom_track_customizer_from_frontend();
		$output = ob_get_clean();

		$this->assertMatchesRegularExpression(
			"/'wpcom_customize_loaded_from_frontend', \{ blog_id: '[1-9][0-9]*' \}/",
			$output
		);
	}

	/**
	 * Data provider for test_wpcom_nosara_track_admin_page_views_does_not_track_a11ns.
	 *
	 * @return array
	 */
	public static function wpcom_nosara_track_admin_page_views_does_not_track_a11ns_provider() {
		return array(
			array( true, true, null ),
			array( true, false, true ),
			array( false, null, null ),
		);
	}
}
