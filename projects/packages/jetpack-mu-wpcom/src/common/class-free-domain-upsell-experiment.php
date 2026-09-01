<?php
/**
 * Resolves the calypso_omnibar_free_domain_upsell_20260825 experiment variation server-side.
 *
 * @package automattic/jetpack-mu-wpcom
 */

namespace Automattic\Jetpack\Jetpack_Mu_Wpcom;

use Automattic\Jetpack\Status\Host;

/**
 * Reads the omnibar free-domain upsell variation for the current user.
 *
 * The experiment moves the "Free domain with an annual plan" upsell from the
 * wp-admin sidebar notice (control; the free_to_paid_plan and
 * monthly_to_annual_plan messages) to a persistent "Free domain" chip in the
 * admin bar / omnibar (treatment). It only targets Simple sites, so there is
 * no Atomic path.
 *
 * The chip is rendered from one node definition: wp-admin renders it directly,
 * and the omnibar renders it from the site admin-bar REST endpoint. Both paths
 * run `admin_bar_menu`, and reaching either one means the chip is about to be
 * shown, so the variation comes from the assigning ExPlat read. The result is
 * transient-cached per user for an hour.
 */
class Free_Domain_Upsell_Experiment {

	const EXPERIMENT_NAME = 'calypso_omnibar_free_domain_upsell_test';

	/**
	 * Which sidebar JITM the current user/site would qualify for, or null.
	 *
	 * Mirrors the conditions of the two sidebar JITMs the chip is tested against,
	 * which share the "Free domain with an annual plan" message and CTA:
	 * - `free_to_paid_plan`: Free plan, Simple, admin, not a domain-only site, no
	 *   mapped primary domain.
	 * - `monthly_to_annual_plan`: any monthly plan, Simple, admin, no mapped
	 *   primary domain.
	 * Matches the Calypso-side predicate for the same chip.
	 *
	 * @return string|null 'free_to_paid_plan', 'monthly_to_annual_plan', or null.
	 */
	public static function get_upsell_source() {
		if ( ! is_user_logged_in() || ! current_user_can( 'manage_options' ) ) {
			return null;
		}

		if ( ! ( new Host() )->is_wpcom_simple() ) {
			return null;
		}

		if ( (bool) get_option( 'wpcom_is_staging_site' ) ) {
			return null;
		}

		// No mapped primary domain: a Simple site with a mapped domain serves from
		// its custom domain, so the `.wordpress.com` host check covers the rule.
		$host = wp_parse_url( home_url(), PHP_URL_HOST );
		if ( ! is_string( $host ) || ! str_ends_with( $host, '.wordpress.com' ) ) {
			return null;
		}

		$current_plan = self::get_current_plan();
		if ( ! is_array( $current_plan ) ) {
			return null;
		}

		if ( ! empty( $current_plan['is_free'] ) && empty( get_option( 'options' )['is_domain_only'] ) ) {
			return 'free_to_paid_plan';
		}

		if ( str_ends_with( (string) ( $current_plan['product_slug'] ?? '' ), '-monthly' ) ) {
			return 'monthly_to_annual_plan';
		}

		return null;
	}

	/**
	 * Whether the current user/site is eligible for the omnibar free-domain upsell.
	 *
	 * @return bool
	 */
	public static function is_eligible() {
		return null !== self::get_upsell_source();
	}

	/**
	 * Whether the winning sidebar notice should be suppressed for this user.
	 *
	 * Only the two messages the experiment moves into the admin bar are ever
	 * suppressed, only for eligible users (so nobody loses the notice without
	 * getting the chip), and only in the treatment.
	 *
	 * @param string $notice_id The id of the winning sidebar notice.
	 * @return bool
	 */
	public static function should_suppress_sidebar_notice( $notice_id ) {
		if ( ! in_array( $notice_id, array( 'free_to_paid_plan', 'monthly_to_annual_plan' ), true ) ) {
			return false;
		}

		if ( ! self::is_eligible() ) {
			return false;
		}

		return 'treatment' === self::get_variation();
	}

	/**
	 * The current plan data for this blog, or null when unavailable.
	 *
	 * @return array|null
	 */
	private static function get_current_plan() {
		/**
		 * Overrides the plan data used for chip eligibility (testing / manual QA).
		 *
		 * @param array|null $plan The plan data (needs `is_free` and `product_slug`), or null to read from the store.
		 */
		$override = apply_filters( 'wpcom_free_domain_upsell_current_plan', null );
		if ( null !== $override ) {
			return is_array( $override ) ? $override : null;
		}

		if ( ! class_exists( '\WPCOM_Store_API' ) ) {
			return null;
		}

		$plan = \WPCOM_Store_API::get_current_plan( get_current_blog_id() );

		return is_array( $plan ) ? $plan : null;
	}

	/**
	 * The current user's variation: 'control' or 'treatment'.
	 *
	 * @return string
	 */
	public static function get_variation() {
		/**
		 * Overrides the resolved variation (testing / manual QA). Return 'treatment' or 'control', or null to use ExPlat.
		 *
		 * @param string|null $override The forced variation, or null.
		 */
		$override = apply_filters( 'wpcom_free_domain_upsell_variation', null );
		if ( null !== $override ) {
			return self::normalize( $override );
		}

		$user_id = get_current_user_id();
		if ( ! $user_id ) {
			return 'control';
		}

		$cache_key = 'free-domain-upsell-variation-' . $user_id;
		$cached    = get_transient( $cache_key );
		if ( false !== $cached ) {
			return (string) $cached;
		}

		$raw = self::fetch_variation();

		// A user ExPlat declined to assign reads as null. Don't cache that, so a
		// later render can still enroll them.
		if ( null === $raw ) {
			return 'control';
		}

		$variation = self::normalize( $raw );
		set_transient( $cache_key, $variation, HOUR_IN_SECONDS );

		return $variation;
	}

	/**
	 * Fetch the raw variation name from ExPlat, or null.
	 *
	 * @return string|null
	 */
	private static function fetch_variation() {
		if ( ! ( new Host() )->is_wpcom_simple() ) {
			return null;
		}

		if ( function_exists( '\ExPlat\assign_current_user' ) ) {
			// The \ExPlat\ helpers live in wpcom, outside this monorepo, so Phan can't see them.
			// @phan-suppress-next-line PhanUndeclaredFunction
			return \ExPlat\assign_current_user( self::EXPERIMENT_NAME );
		}

		return null;
	}

	/**
	 * Map any variation onto a known value; unknown/null becomes 'control'.
	 *
	 * @param string|null $variation The raw variation name.
	 * @return string
	 */
	private static function normalize( $variation ) {
		return 'treatment' === $variation ? 'treatment' : 'control';
	}
}
