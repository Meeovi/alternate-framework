DROP VIEW "pgsodium"."decrypted_key";--> statement-breakpoint
DROP VIEW "vault"."decrypted_secrets";--> statement-breakpoint
DROP VIEW "pgsodium"."mask_columns";--> statement-breakpoint
DROP VIEW "pgsodium"."masking_rule";--> statement-breakpoint
DROP VIEW "extensions"."pg_stat_statements";--> statement-breakpoint
DROP VIEW "extensions"."pg_stat_statements_info";--> statement-breakpoint
DROP VIEW "pgsodium"."valid_key";--> statement-breakpoint
DROP POLICY "Users can see their own newsfeed" ON "feeds";--> statement-breakpoint
DROP POLICY "Allow listening for broadcasts for authenticated users only" ON "realtime"."messages";--> statement-breakpoint
DROP POLICY "Allow listening for broadcasts from a specific channel" ON "realtime"."messages";--> statement-breakpoint
DROP POLICY "Allow listening for presences from a specific channel" ON "realtime"."messages";--> statement-breakpoint
DROP POLICY "Allow listening for presences on all channels for authenticated" ON "realtime"."messages";--> statement-breakpoint
DROP POLICY "Allow pushing broadcasts for authenticated users only" ON "realtime"."messages";--> statement-breakpoint
DROP POLICY "Allow pushing broadcasts to specific channel" ON "realtime"."messages";--> statement-breakpoint
DROP POLICY "Publish presence to a specific channel" ON "realtime"."messages";--> statement-breakpoint
ALTER TABLE "about_departments_articles" DROP CONSTRAINT "about_departments_articles_articles_id_articles_id_fkey";--> statement-breakpoint
ALTER TABLE "about_departments_pages" DROP CONSTRAINT "about_departments_pages_pages_id_pages_id_fkey";--> statement-breakpoint
ALTER TABLE "about_departments_platform" DROP CONSTRAINT "about_departments_platform_platform_id_platform_id_fkey";--> statement-breakpoint
ALTER TABLE "address_cart" DROP CONSTRAINT "address_cart_address_id_address_id_fkey";--> statement-breakpoint
ALTER TABLE "address_cart" DROP CONSTRAINT "address_cart_cart_id_cart_id_fkey";--> statement-breakpoint
ALTER TABLE "address_cities" DROP CONSTRAINT "address_cities_address_id_address_id_fkey";--> statement-breakpoint
ALTER TABLE "address_cities" DROP CONSTRAINT "address_cities_cities_id_cities_id_fkey";--> statement-breakpoint
ALTER TABLE "address_countries" DROP CONSTRAINT "address_countries_address_id_address_id_fkey";--> statement-breakpoint
ALTER TABLE "address_countries" DROP CONSTRAINT "address_countries_countries_id_countries_id_fkey";--> statement-breakpoint
ALTER TABLE "address_directus_users" DROP CONSTRAINT "address_directus_users_address_id_address_id_fkey";--> statement-breakpoint
ALTER TABLE "articles_categories" DROP CONSTRAINT "articles_categories_articles_id_articles_id_fkey";--> statement-breakpoint
ALTER TABLE "articles_categories" DROP CONSTRAINT "articles_categories_categories_id_categories_id_fkey";--> statement-breakpoint
ALTER TABLE "articles_comments" DROP CONSTRAINT "articles_comments_articles_id_articles_id_fkey";--> statement-breakpoint
ALTER TABLE "articles_comments" DROP CONSTRAINT "articles_comments_comments_id_comments_id_fkey";--> statement-breakpoint
ALTER TABLE "articles_departments" DROP CONSTRAINT "articles_departments_articles_id_articles_id_fkey";--> statement-breakpoint
ALTER TABLE "articles_departments" DROP CONSTRAINT "articles_departments_departments_id_departments_id_fkey";--> statement-breakpoint
ALTER TABLE "attributes_product_types" DROP CONSTRAINT "attributes_product_types_attributes_id_attributes_id_fkey";--> statement-breakpoint
ALTER TABLE "attributes_product_types" DROP CONSTRAINT "attributes_product_types_product_types_id_product_types_id_fkey";--> statement-breakpoint
ALTER TABLE "attributes_products" DROP CONSTRAINT "attributes_products_attributes_id_attributes_id_fkey";--> statement-breakpoint
ALTER TABLE "bids" DROP CONSTRAINT "bids_lot_id_auction_lots_id_fkey";--> statement-breakpoint
ALTER TABLE "block_button" DROP CONSTRAINT "block_button_button_group_block_button_group_id_fkey";--> statement-breakpoint
ALTER TABLE "block_columns_rows" DROP CONSTRAINT "block_columns_rows_block_columns_block_columns_id_fkey";--> statement-breakpoint
ALTER TABLE "block_columns_rows" DROP CONSTRAINT "block_columns_rows_button_group_block_button_group_id_fkey";--> statement-breakpoint
ALTER TABLE "block_cta" DROP CONSTRAINT "block_cta_button_group_block_button_group_id_fkey";--> statement-breakpoint
ALTER TABLE "block_form" DROP CONSTRAINT "block_form_form_forms_id_fkey";--> statement-breakpoint
ALTER TABLE "block_gallery_files" DROP CONSTRAINT "block_gallery_files_block_gallery_id_block_gallery_id_fkey";--> statement-breakpoint
ALTER TABLE "block_hero" DROP CONSTRAINT "block_hero_button_group_block_button_group_id_fkey";--> statement-breakpoint
ALTER TABLE "block_logocloud_logos" DROP CONSTRAINT "block_logocloud_logos_mW3gzfjp0vnD_fkey";--> statement-breakpoint
ALTER TABLE "block_step_items" DROP CONSTRAINT "block_step_items_block_steps_block_steps_id_fkey";--> statement-breakpoint
ALTER TABLE "block_step_items" DROP CONSTRAINT "block_step_items_button_group_block_button_group_id_fkey";--> statement-breakpoint
ALTER TABLE "block_testimonial_slider_items" DROP CONSTRAINT "block_testimonial_slider_items_rg33SM5dK3zj_fkey";--> statement-breakpoint
ALTER TABLE "block_testimonial_slider_items" DROP CONSTRAINT "block_testimonial_slider_items_NhaxxTdSum8i_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."blog" DROP CONSTRAINT "blog_image_directus_files_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."blog" DROP CONSTRAINT "blog_file_directus_files_id_fkey";--> statement-breakpoint
ALTER TABLE "brands_categories" DROP CONSTRAINT "brands_categories_brands_id_brands_id_fkey";--> statement-breakpoint
ALTER TABLE "brands_categories" DROP CONSTRAINT "brands_categories_categories_id_categories_id_fkey";--> statement-breakpoint
ALTER TABLE "brands_departments" DROP CONSTRAINT "brands_departments_brands_id_brands_id_fkey";--> statement-breakpoint
ALTER TABLE "brands_departments" DROP CONSTRAINT "brands_departments_departments_id_departments_id_fkey";--> statement-breakpoint
ALTER TABLE "brands_manufacturer" DROP CONSTRAINT "brands_manufacturer_brands_id_brands_id_fkey";--> statement-breakpoint
ALTER TABLE "brands_manufacturer" DROP CONSTRAINT "brands_manufacturer_manufacturer_id_manufacturer_id_fkey";--> statement-breakpoint
ALTER TABLE "brands_products" DROP CONSTRAINT "brands_products_brands_id_brands_id_fkey";--> statement-breakpoint
ALTER TABLE "brands_shorts" DROP CONSTRAINT "brands_shorts_brands_id_brands_id_fkey";--> statement-breakpoint
ALTER TABLE "brands_shorts" DROP CONSTRAINT "brands_shorts_shorts_id_shorts_id_fkey";--> statement-breakpoint
ALTER TABLE "calendar_comments" DROP CONSTRAINT "calendar_comments_calendar_id_calendar_id_fkey";--> statement-breakpoint
ALTER TABLE "calendar_comments" DROP CONSTRAINT "calendar_comments_comments_id_comments_id_fkey";--> statement-breakpoint
ALTER TABLE "calendar_directus_users" DROP CONSTRAINT "calendar_directus_users_calendar_id_calendar_id_fkey";--> statement-breakpoint
ALTER TABLE "calendar_events" DROP CONSTRAINT "calendar_events_calendar_id_calendar_id_fkey";--> statement-breakpoint
ALTER TABLE "calendar_events" DROP CONSTRAINT "calendar_events_events_id_events_id_fkey";--> statement-breakpoint
ALTER TABLE "calendar_integrations" DROP CONSTRAINT "calendar_integrations_calendar_id_calendar_id_fkey";--> statement-breakpoint
ALTER TABLE "calendar_integrations" DROP CONSTRAINT "calendar_integrations_integrations_id_integrations_id_fkey";--> statement-breakpoint
ALTER TABLE "calendar_lists" DROP CONSTRAINT "calendar_lists_calendar_id_calendar_id_fkey";--> statement-breakpoint
ALTER TABLE "calendar_lists" DROP CONSTRAINT "calendar_lists_lists_id_lists_id_fkey";--> statement-breakpoint
ALTER TABLE "cart_cart_items" DROP CONSTRAINT "cart_cart_items_cart_id_cart_id_fkey";--> statement-breakpoint
ALTER TABLE "cart_cart_items" DROP CONSTRAINT "cart_cart_items_cart_items_id_cart_items_id_fkey";--> statement-breakpoint
ALTER TABLE "cart_items" DROP CONSTRAINT "cart_items_cart_cart_id_fkey";--> statement-breakpoint
ALTER TABLE "cart_products" DROP CONSTRAINT "cart_products_cart_id_cart_id_fkey";--> statement-breakpoint
ALTER TABLE "categories" DROP CONSTRAINT "categories_seo_seo_id_fkey";--> statement-breakpoint
ALTER TABLE "categories_departments" DROP CONSTRAINT "categories_departments_categories_id_categories_id_fkey";--> statement-breakpoint
ALTER TABLE "categories_departments" DROP CONSTRAINT "categories_departments_departments_id_departments_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."categories" DROP CONSTRAINT "categories_image_directus_files_id_fkey";--> statement-breakpoint
ALTER TABLE "categories_postgresstores" DROP CONSTRAINT "categories_postgresstores_categories_id_categories_id_fkey";--> statement-breakpoint
ALTER TABLE "categories_postgresstores" DROP CONSTRAINT "categories_postgresstores_3l9g4CzQ4wKW_fkey";--> statement-breakpoint
ALTER TABLE "categories_shorts" DROP CONSTRAINT "categories_shorts_categories_id_categories_id_fkey";--> statement-breakpoint
ALTER TABLE "categories_shorts" DROP CONSTRAINT "categories_shorts_shorts_id_shorts_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."categories_tags" DROP CONSTRAINT "categories_tags_categories_id_categories_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."categories_tags" DROP CONSTRAINT "categories_tags_tags_id_tags_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."characters_abilities" DROP CONSTRAINT "characters_abilities_characters_id_characters_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."characters_abilities" DROP CONSTRAINT "characters_abilities_abilities_id_abilities_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."characters_characters" DROP CONSTRAINT "characters_characters_characters_id_characters_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."characters_characters" DROP CONSTRAINT "characters_characters_related_characters_id_characters_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."characters" DROP CONSTRAINT "characters_image_directus_files_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."characters_tags" DROP CONSTRAINT "characters_tags_characters_id_characters_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."characters_tags" DROP CONSTRAINT "characters_tags_tags_id_tags_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."characters_videos" DROP CONSTRAINT "characters_videos_characters_id_characters_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."characters_videos" DROP CONSTRAINT "characters_videos_videos_id_videos_id_fkey";--> statement-breakpoint
ALTER TABLE "chart_entries" DROP CONSTRAINT "chart_entries_chart_id_charts_id_fkey";--> statement-breakpoint
ALTER TABLE "charts_departments" DROP CONSTRAINT "charts_departments_charts_id_charts_id_fkey";--> statement-breakpoint
ALTER TABLE "charts_departments" DROP CONSTRAINT "charts_departments_departments_id_departments_id_fkey";--> statement-breakpoint
ALTER TABLE "charts_products" DROP CONSTRAINT "charts_products_charts_id_charts_id_fkey";--> statement-breakpoint
ALTER TABLE "charts_radios" DROP CONSTRAINT "charts_radios_charts_id_charts_id_fkey";--> statement-breakpoint
ALTER TABLE "charts_radios" DROP CONSTRAINT "charts_radios_radios_id_radios_id_fkey";--> statement-breakpoint
ALTER TABLE "circles_posts" DROP CONSTRAINT "circles_posts_posts_id_posts_id_fkey";--> statement-breakpoint
ALTER TABLE "cities_countries" DROP CONSTRAINT "cities_countries_cities_id_cities_id_fkey";--> statement-breakpoint
ALTER TABLE "cities_states" DROP CONSTRAINT "cities_states_cities_id_cities_id_fkey";--> statement-breakpoint
ALTER TABLE "collections_brands" DROP CONSTRAINT "collections_brands_collections_id_collections_id_fkey";--> statement-breakpoint
ALTER TABLE "collections_brands" DROP CONSTRAINT "collections_brands_brands_id_brands_id_fkey";--> statement-breakpoint
ALTER TABLE "collections_products" DROP CONSTRAINT "collections_products_collections_id_collections_id_fkey";--> statement-breakpoint
ALTER TABLE "collections_spaces" DROP CONSTRAINT "collections_spaces_collections_id_collections_id_fkey";--> statement-breakpoint
ALTER TABLE "collections_spaces" DROP CONSTRAINT "collections_spaces_spaces_id_spaces_id_fkey";--> statement-breakpoint
ALTER TABLE "comments_directus_users" DROP CONSTRAINT "comments_directus_users_comment_id_comments_id_fkey";--> statement-breakpoint
ALTER TABLE "comments_products" DROP CONSTRAINT "comments_products_comments_id_comments_id_fkey";--> statement-breakpoint
ALTER TABLE "comments_reactions" DROP CONSTRAINT "comments_reactions_comments_id_comments_id_fkey";--> statement-breakpoint
ALTER TABLE "comments_reactions" DROP CONSTRAINT "comments_reactions_reactions_id_reactions_id_fkey";--> statement-breakpoint
ALTER TABLE "comments_shorts" DROP CONSTRAINT "comments_shorts_comments_id_comments_id_fkey";--> statement-breakpoint
ALTER TABLE "comments_shorts" DROP CONSTRAINT "comments_shorts_shorts_id_shorts_id_fkey";--> statement-breakpoint
ALTER TABLE "connections_directus_users" DROP CONSTRAINT "connections_directus_users_connections_id_connections_id_fkey";--> statement-breakpoint
ALTER TABLE "countries_currency" DROP CONSTRAINT "countries_currency_countries_id_countries_id_fkey";--> statement-breakpoint
ALTER TABLE "countries_currency" DROP CONSTRAINT "countries_currency_currency_id_currency_id_fkey";--> statement-breakpoint
ALTER TABLE "countries_timezones" DROP CONSTRAINT "countries_timezones_countries_id_countries_id_fkey";--> statement-breakpoint
ALTER TABLE "countries_timezones" DROP CONSTRAINT "countries_timezones_timezones_id_timezones_id_fkey";--> statement-breakpoint
ALTER TABLE "cross_sell_products_products" DROP CONSTRAINT "cross_sell_products_products_A7YSorc3eNbd_fkey";--> statement-breakpoint
ALTER TABLE "currency_departments" DROP CONSTRAINT "currency_departments_currency_id_currency_id_fkey";--> statement-breakpoint
ALTER TABLE "currency_departments" DROP CONSTRAINT "currency_departments_departments_id_departments_id_fkey";--> statement-breakpoint
ALTER TABLE "departments_categories" DROP CONSTRAINT "departments_categories_departments_id_departments_id_fkey";--> statement-breakpoint
ALTER TABLE "departments_categories" DROP CONSTRAINT "departments_categories_categories_id_categories_id_fkey";--> statement-breakpoint
ALTER TABLE "departments_collections" DROP CONSTRAINT "departments_collections_departments_id_departments_id_fkey";--> statement-breakpoint
ALTER TABLE "departments_collections" DROP CONSTRAINT "departments_collections_collections_id_collections_id_fkey";--> statement-breakpoint
ALTER TABLE "departments_products" DROP CONSTRAINT "departments_products_departments_id_departments_id_fkey";--> statement-breakpoint
ALTER TABLE "departments_shorts" DROP CONSTRAINT "departments_shorts_departments_id_departments_id_fkey";--> statement-breakpoint
ALTER TABLE "departments_shorts" DROP CONSTRAINT "departments_shorts_shorts_id_shorts_id_fkey";--> statement-breakpoint
ALTER TABLE "departments_showcases" DROP CONSTRAINT "departments_showcases_departments_id_departments_id_fkey";--> statement-breakpoint
ALTER TABLE "departments_showcases" DROP CONSTRAINT "departments_showcases_showcases_id_showcases_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."dictionary" DROP CONSTRAINT "dictionary_image_directus_files_id_fkey";--> statement-breakpoint
ALTER TABLE "directus_access" DROP CONSTRAINT "directus_access_policy_directus_policies_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."directus_access" DROP CONSTRAINT "directus_access_role_directus_roles_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."directus_access" DROP CONSTRAINT "directus_access_user_directus_users_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."directus_access" DROP CONSTRAINT "directus_access_policy_directus_policies_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."directus_comments" DROP CONSTRAINT "directus_comments_user_created_directus_users_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."directus_comments" DROP CONSTRAINT "directus_comments_user_updated_directus_users_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."directus_dashboards" DROP CONSTRAINT "directus_dashboards_user_created_directus_users_id_fkey";--> statement-breakpoint
ALTER TABLE "directus_deployment_projects" DROP CONSTRAINT "directus_deployment_projects_8QUPYveJbNr9_fkey";--> statement-breakpoint
ALTER TABLE "directus_deployment_runs" DROP CONSTRAINT "directus_deployment_runs_VnZbhN5ZqrA1_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."directus_files" DROP CONSTRAINT "directus_files_folder_directus_folders_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."directus_files" DROP CONSTRAINT "directus_files_uploaded_by_directus_users_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."directus_files" DROP CONSTRAINT "directus_files_modified_by_directus_users_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."directus_flows" DROP CONSTRAINT "directus_flows_user_created_directus_users_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."directus_notifications" DROP CONSTRAINT "directus_notifications_recipient_directus_users_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."directus_notifications" DROP CONSTRAINT "directus_notifications_sender_directus_users_id_fkey";--> statement-breakpoint
ALTER TABLE "directus_oauth_codes" DROP CONSTRAINT "directus_oauth_codes_SrsNFQb6ZnkJ_fkey";--> statement-breakpoint
ALTER TABLE "directus_oauth_consents" DROP CONSTRAINT "directus_oauth_consents_CklsRkOoIROs_fkey";--> statement-breakpoint
ALTER TABLE "directus_oauth_tokens" DROP CONSTRAINT "directus_oauth_tokens_LvTpqdxY752D_fkey";--> statement-breakpoint
ALTER TABLE "directus_operations" DROP CONSTRAINT "directus_operations_flow_directus_flows_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."directus_operations" DROP CONSTRAINT "directus_operations_flow_directus_flows_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."directus_operations" DROP CONSTRAINT "directus_operations_user_created_directus_users_id_fkey";--> statement-breakpoint
ALTER TABLE "directus_panels" DROP CONSTRAINT "directus_panels_dashboard_directus_dashboards_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."directus_panels" DROP CONSTRAINT "directus_panels_dashboard_directus_dashboards_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."directus_panels" DROP CONSTRAINT "directus_panels_user_created_directus_users_id_fkey";--> statement-breakpoint
ALTER TABLE "directus_permissions" DROP CONSTRAINT "directus_permissions_policy_directus_policies_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."directus_permissions" DROP CONSTRAINT "directus_permissions_policy_directus_policies_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."directus_presets" DROP CONSTRAINT "directus_presets_user_directus_users_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."directus_presets" DROP CONSTRAINT "directus_presets_role_directus_roles_id_fkey";--> statement-breakpoint
ALTER TABLE "directus_revisions" DROP CONSTRAINT "directus_revisions_activity_directus_activity_id_fkey";--> statement-breakpoint
ALTER TABLE "directus_revisions" DROP CONSTRAINT "directus_revisions_version_directus_versions_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."directus_revisions" DROP CONSTRAINT "directus_revisions_activity_directus_activity_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."directus_revisions" DROP CONSTRAINT "directus_revisions_version_directus_versions_id_fkey";--> statement-breakpoint
ALTER TABLE "directus_sessions" DROP CONSTRAINT "directus_sessions_share_directus_shares_id_fkey";--> statement-breakpoint
ALTER TABLE "directus_sessions" DROP CONSTRAINT "directus_sessions_HYk7XEz2Fptg_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."directus_sessions" DROP CONSTRAINT "directus_sessions_user_directus_users_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."directus_sessions" DROP CONSTRAINT "directus_sessions_share_directus_shares_id_fkey";--> statement-breakpoint
ALTER TABLE "directus_shares" DROP CONSTRAINT "directus_shares_collection_directus_collections_collection_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."directus_shares" DROP CONSTRAINT "directus_shares_collection_directus_collections_collection_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."directus_shares" DROP CONSTRAINT "directus_shares_role_directus_roles_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."directus_shares" DROP CONSTRAINT "directus_shares_user_created_directus_users_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."directus_users" DROP CONSTRAINT "directus_users_role_directus_roles_id_fkey";--> statement-breakpoint
ALTER TABLE "directus_versions" DROP CONSTRAINT "directus_versions_Qt8na0mYx2Gn_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."directus_versions" DROP CONSTRAINT "directus_versions_Qt8na0mYx2Gn_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."directus_versions" DROP CONSTRAINT "directus_versions_user_created_directus_users_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."directus_versions" DROP CONSTRAINT "directus_versions_user_updated_directus_users_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."directus_webhooks" DROP CONSTRAINT "directus_webhooks_migrated_flow_directus_flows_id_fkey";--> statement-breakpoint
ALTER TABLE "emoji_reactions" DROP CONSTRAINT "emoji_reactions_user_id_users_id_fkey";--> statement-breakpoint
ALTER TABLE "events_cities" DROP CONSTRAINT "events_cities_events_id_events_id_fkey";--> statement-breakpoint
ALTER TABLE "events_cities" DROP CONSTRAINT "events_cities_cities_id_cities_id_fkey";--> statement-breakpoint
ALTER TABLE "events_countries" DROP CONSTRAINT "events_countries_events_id_events_id_fkey";--> statement-breakpoint
ALTER TABLE "events_countries" DROP CONSTRAINT "events_countries_countries_id_countries_id_fkey";--> statement-breakpoint
ALTER TABLE "events_coupons" DROP CONSTRAINT "events_coupons_events_id_events_id_fkey";--> statement-breakpoint
ALTER TABLE "events_directus_users" DROP CONSTRAINT "events_directus_users_events_id_events_id_fkey";--> statement-breakpoint
ALTER TABLE "events_files" DROP CONSTRAINT "events_files_events_id_events_id_fkey";--> statement-breakpoint
ALTER TABLE "events_invoices" DROP CONSTRAINT "events_invoices_events_id_events_id_fkey";--> statement-breakpoint
ALTER TABLE "events_invoices" DROP CONSTRAINT "events_invoices_invoices_id_invoices_id_fkey";--> statement-breakpoint
ALTER TABLE "events_lists" DROP CONSTRAINT "events_lists_events_id_events_id_fkey";--> statement-breakpoint
ALTER TABLE "events_lists" DROP CONSTRAINT "events_lists_lists_id_lists_id_fkey";--> statement-breakpoint
ALTER TABLE "events_posts" DROP CONSTRAINT "events_posts_events_id_events_id_fkey";--> statement-breakpoint
ALTER TABLE "events_posts" DROP CONSTRAINT "events_posts_posts_id_posts_id_fkey";--> statement-breakpoint
ALTER TABLE "events_products" DROP CONSTRAINT "events_products_events_id_events_id_fkey";--> statement-breakpoint
ALTER TABLE "events_states" DROP CONSTRAINT "events_states_events_id_events_id_fkey";--> statement-breakpoint
ALTER TABLE "events_states" DROP CONSTRAINT "events_states_states_id_states_id_fkey";--> statement-breakpoint
ALTER TABLE "faqs_directus_users" DROP CONSTRAINT "faqs_directus_users_faqs_id_faqs_id_fkey";--> statement-breakpoint
ALTER TABLE "faqs_files" DROP CONSTRAINT "faqs_files_faqs_id_faqs_id_fkey";--> statement-breakpoint
ALTER TABLE "faqs_products" DROP CONSTRAINT "faqs_products_faqs_id_faqs_id_fkey";--> statement-breakpoint
ALTER TABLE "federated_spaces_spaces" DROP CONSTRAINT "federated_spaces_spaces_lXKAAcGVjdrK_fkey";--> statement-breakpoint
ALTER TABLE "federated_spaces_spaces" DROP CONSTRAINT "federated_spaces_spaces_spaces_id_spaces_id_fkey";--> statement-breakpoint
ALTER TABLE "feeds" DROP CONSTRAINT "feeds_shop_shops_id_fkey";--> statement-breakpoint
ALTER TABLE "feeds_posts" DROP CONSTRAINT "feeds_posts_feed_id_feeds_id_fkey";--> statement-breakpoint
ALTER TABLE "feeds_posts" DROP CONSTRAINT "feeds_posts_post_id_posts_id_fkey";--> statement-breakpoint
ALTER TABLE "finance_index_articles" DROP CONSTRAINT "finance_index_articles_finance_index_id_finance_index_id_fkey";--> statement-breakpoint
ALTER TABLE "finance_index_articles" DROP CONSTRAINT "finance_index_articles_articles_id_articles_id_fkey";--> statement-breakpoint
ALTER TABLE "finance_index_currency" DROP CONSTRAINT "finance_index_currency_finance_index_id_finance_index_id_fkey";--> statement-breakpoint
ALTER TABLE "finance_index_currency" DROP CONSTRAINT "finance_index_currency_currency_id_currency_id_fkey";--> statement-breakpoint
ALTER TABLE "finance_index_region" DROP CONSTRAINT "finance_index_region_finance_index_id_finance_index_id_fkey";--> statement-breakpoint
ALTER TABLE "finance_index_region" DROP CONSTRAINT "finance_index_region_region_id_region_id_fkey";--> statement-breakpoint
ALTER TABLE "friend_requests_address" DROP CONSTRAINT "friend_requests_address_yTDxbq3VlQky_fkey";--> statement-breakpoint
ALTER TABLE "friend_requests_address" DROP CONSTRAINT "friend_requests_address_address_id_address_id_fkey";--> statement-breakpoint
ALTER TABLE "friend_requests_profiles" DROP CONSTRAINT "friend_requests_profiles_ahcQn6PpnU5i_fkey";--> statement-breakpoint
ALTER TABLE "friend_requests_profiles" DROP CONSTRAINT "friend_requests_profiles_profiles_id_profiles_id_fkey";--> statement-breakpoint
ALTER TABLE "friend_suggestions_profiles" DROP CONSTRAINT "friend_suggestions_profiles_k9QNyX76E17f_fkey";--> statement-breakpoint
ALTER TABLE "friend_suggestions_profiles" DROP CONSTRAINT "friend_suggestions_profiles_profiles_id_profiles_id_fkey";--> statement-breakpoint
ALTER TABLE "gamification" DROP CONSTRAINT "gamification_user_profile_user_profile_id_fkey";--> statement-breakpoint
ALTER TABLE "gamification_directus_users" DROP CONSTRAINT "gamification_directus_users_J4J4eWweYJ1C_fkey";--> statement-breakpoint
ALTER TABLE "gamification_events" DROP CONSTRAINT "gamification_events_gamification_id_gamification_id_fkey";--> statement-breakpoint
ALTER TABLE "gamification_events" DROP CONSTRAINT "gamification_events_events_id_events_id_fkey";--> statement-breakpoint
ALTER TABLE "gamification_notifications" DROP CONSTRAINT "gamification_notifications_gamification_id_gamification_id_fkey";--> statement-breakpoint
ALTER TABLE "gamification_notifications" DROP CONSTRAINT "gamification_notifications_nv6VgbmjWDso_fkey";--> statement-breakpoint
ALTER TABLE "gamification_products" DROP CONSTRAINT "gamification_products_gamification_id_gamification_id_fkey";--> statement-breakpoint
ALTER TABLE "gamification_videos" DROP CONSTRAINT "gamification_videos_gamification_id_gamification_id_fkey";--> statement-breakpoint
ALTER TABLE "gamification_videos" DROP CONSTRAINT "gamification_videos_videos_id_videos_id_fkey";--> statement-breakpoint
ALTER TABLE "geo_regions_cities" DROP CONSTRAINT "geo_regions_cities_geo_regions_id_geo_regions_id_fkey";--> statement-breakpoint
ALTER TABLE "geo_regions_cities" DROP CONSTRAINT "geo_regions_cities_cities_id_cities_id_fkey";--> statement-breakpoint
ALTER TABLE "geo_regions_countries" DROP CONSTRAINT "geo_regions_countries_geo_regions_id_geo_regions_id_fkey";--> statement-breakpoint
ALTER TABLE "geo_regions_countries" DROP CONSTRAINT "geo_regions_countries_countries_id_countries_id_fkey";--> statement-breakpoint
ALTER TABLE "geo_regions_states" DROP CONSTRAINT "geo_regions_states_geo_regions_id_geo_regions_id_fkey";--> statement-breakpoint
ALTER TABLE "geo_regions_states" DROP CONSTRAINT "geo_regions_states_states_id_states_id_fkey";--> statement-breakpoint
ALTER TABLE "hdb_catalog"."hdb_cron_event_invocation_logs" DROP CONSTRAINT "hdb_cron_event_invocation_logs_event_id_hdb_cron_events_id_fkey";--> statement-breakpoint
ALTER TABLE "hdb_catalog"."hdb_scheduled_event_invocation_logs" DROP CONSTRAINT "hdb_scheduled_event_invocation_logs_zJP8RUHvmkjq_fkey";--> statement-breakpoint
ALTER TABLE "help_articles" DROP CONSTRAINT "help_articles_help_collection_help_collections_id_fkey";--> statement-breakpoint
ALTER TABLE "auth"."identities" DROP CONSTRAINT "identities_user_id_users_id_fkey";--> statement-breakpoint
ALTER TABLE "inbox" DROP CONSTRAINT "inbox_form_forms_id_fkey";--> statement-breakpoint
ALTER TABLE "inbox" DROP CONSTRAINT "inbox_project_os_projects_id_fkey";--> statement-breakpoint
ALTER TABLE "inbox" DROP CONSTRAINT "inbox_task_os_tasks_id_fkey";--> statement-breakpoint
ALTER TABLE "incentives_currency" DROP CONSTRAINT "incentives_currency_incentives_id_incentives_id_fkey";--> statement-breakpoint
ALTER TABLE "incentives_currency" DROP CONSTRAINT "incentives_currency_currency_id_currency_id_fkey";--> statement-breakpoint
ALTER TABLE "incentives_orders" DROP CONSTRAINT "incentives_orders_incentives_id_incentives_id_fkey";--> statement-breakpoint
ALTER TABLE "incentives_orders" DROP CONSTRAINT "incentives_orders_orders_id_orders_id_fkey";--> statement-breakpoint
ALTER TABLE "incentives_products" DROP CONSTRAINT "incentives_products_incentives_id_incentives_id_fkey";--> statement-breakpoint
ALTER TABLE "integrations_attributes" DROP CONSTRAINT "integrations_attributes_integrations_id_integrations_id_fkey";--> statement-breakpoint
ALTER TABLE "integrations_attributes" DROP CONSTRAINT "integrations_attributes_attributes_id_attributes_id_fkey";--> statement-breakpoint
ALTER TABLE "integrations_categories" DROP CONSTRAINT "integrations_categories_integrations_id_integrations_id_fkey";--> statement-breakpoint
ALTER TABLE "integrations_categories" DROP CONSTRAINT "integrations_categories_categories_id_categories_id_fkey";--> statement-breakpoint
ALTER TABLE "integrations_departments" DROP CONSTRAINT "integrations_departments_integrations_id_integrations_id_fkey";--> statement-breakpoint
ALTER TABLE "integrations_departments" DROP CONSTRAINT "integrations_departments_departments_id_departments_id_fkey";--> statement-breakpoint
ALTER TABLE "integrations_files" DROP CONSTRAINT "integrations_files_integrations_id_integrations_id_fkey";--> statement-breakpoint
ALTER TABLE "integrations_platform" DROP CONSTRAINT "integrations_platform_integrations_id_integrations_id_fkey";--> statement-breakpoint
ALTER TABLE "integrations_platform" DROP CONSTRAINT "integrations_platform_platform_id_platform_id_fkey";--> statement-breakpoint
ALTER TABLE "integrations_product_types" DROP CONSTRAINT "integrations_product_types_integrations_id_integrations_id_fkey";--> statement-breakpoint
ALTER TABLE "integrations_product_types" DROP CONSTRAINT "integrations_product_types_GtdXEJcPDYeN_fkey";--> statement-breakpoint
ALTER TABLE "integrations_ratings" DROP CONSTRAINT "integrations_ratings_integrations_id_integrations_id_fkey";--> statement-breakpoint
ALTER TABLE "integrations_ratings" DROP CONSTRAINT "integrations_ratings_ratings_id_ratings_id_fkey";--> statement-breakpoint
ALTER TABLE "integrations_report" DROP CONSTRAINT "integrations_report_integrations_id_integrations_id_fkey";--> statement-breakpoint
ALTER TABLE "integrations_report" DROP CONSTRAINT "integrations_report_report_id_report_id_fkey";--> statement-breakpoint
ALTER TABLE "integrations_spaces" DROP CONSTRAINT "integrations_spaces_integrations_id_integrations_id_fkey";--> statement-breakpoint
ALTER TABLE "integrations_spaces" DROP CONSTRAINT "integrations_spaces_spaces_id_spaces_id_fkey";--> statement-breakpoint
ALTER TABLE "integrations_tags" DROP CONSTRAINT "integrations_tags_integrations_id_integrations_id_fkey";--> statement-breakpoint
ALTER TABLE "integrations_tags" DROP CONSTRAINT "integrations_tags_tags_id_tags_id_fkey";--> statement-breakpoint
ALTER TABLE "invoices_address" DROP CONSTRAINT "invoices_address_invoice_id_invoices_id_fkey";--> statement-breakpoint
ALTER TABLE "invoices_address" DROP CONSTRAINT "invoices_address_address_id_address_id_fkey";--> statement-breakpoint
ALTER TABLE "invoices_orders" DROP CONSTRAINT "invoices_orders_invoice_id_invoices_id_fkey";--> statement-breakpoint
ALTER TABLE "invoices_orders" DROP CONSTRAINT "invoices_orders_order_id_orders_id_fkey";--> statement-breakpoint
ALTER TABLE "invoices_shipping_address" DROP CONSTRAINT "invoices_shipping_address_invoice_id_invoices_id_fkey";--> statement-breakpoint
ALTER TABLE "invoices_shipping_address" DROP CONSTRAINT "invoices_shipping_address_j3ckk8O82r1K_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."items_abilities" DROP CONSTRAINT "items_abilities_items_id_items_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."items_abilities" DROP CONSTRAINT "items_abilities_abilities_id_abilities_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."items_characters" DROP CONSTRAINT "items_characters_items_id_items_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."items_characters" DROP CONSTRAINT "items_characters_characters_id_characters_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."items" DROP CONSTRAINT "items_image_directus_files_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."items_videos" DROP CONSTRAINT "items_videos_items_id_items_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."items_videos" DROP CONSTRAINT "items_videos_videos_id_videos_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."levels_characters" DROP CONSTRAINT "levels_characters_levels_id_levels_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."levels_characters" DROP CONSTRAINT "levels_characters_characters_id_characters_id_fkey";--> statement-breakpoint
ALTER TABLE "list_items" DROP CONSTRAINT "list_items_list_id_lists_id_fkey";--> statement-breakpoint
ALTER TABLE "list_items" DROP CONSTRAINT "list_items_post_id_posts_id_fkey";--> statement-breakpoint
ALTER TABLE "list_items_directus_users" DROP CONSTRAINT "list_items_directus_users_list_items_id_list_items_id_fkey";--> statement-breakpoint
ALTER TABLE "list_items_products" DROP CONSTRAINT "list_items_products_list_items_id_list_items_id_fkey";--> statement-breakpoint
ALTER TABLE "list_products_lists" DROP CONSTRAINT "list_products_lists_list_products_id_list_products_id_fkey";--> statement-breakpoint
ALTER TABLE "list_products_lists" DROP CONSTRAINT "list_products_lists_lists_id_lists_id_fkey";--> statement-breakpoint
ALTER TABLE "lists_categories" DROP CONSTRAINT "lists_categories_lists_id_lists_id_fkey";--> statement-breakpoint
ALTER TABLE "lists_categories" DROP CONSTRAINT "lists_categories_categories_id_categories_id_fkey";--> statement-breakpoint
ALTER TABLE "lists_departments" DROP CONSTRAINT "lists_departments_lists_id_lists_id_fkey";--> statement-breakpoint
ALTER TABLE "lists_departments" DROP CONSTRAINT "lists_departments_departments_id_departments_id_fkey";--> statement-breakpoint
ALTER TABLE "lists_directus_users" DROP CONSTRAINT "lists_directus_users_list_id_lists_id_fkey";--> statement-breakpoint
ALTER TABLE "lists_files" DROP CONSTRAINT "lists_files_lists_id_lists_id_fkey";--> statement-breakpoint
ALTER TABLE "lists_products" DROP CONSTRAINT "lists_products_lists_id_lists_id_fkey";--> statement-breakpoint
ALTER TABLE "lists_shorts" DROP CONSTRAINT "lists_shorts_lists_id_lists_id_fkey";--> statement-breakpoint
ALTER TABLE "lists_shorts" DROP CONSTRAINT "lists_shorts_shorts_id_shorts_id_fkey";--> statement-breakpoint
ALTER TABLE "lists_template_directus_users" DROP CONSTRAINT "lists_template_directus_users_CMeamjbF0cL3_fkey";--> statement-breakpoint
ALTER TABLE "lists_template_list_items" DROP CONSTRAINT "lists_template_list_items_j2Dbcs7DJtKy_fkey";--> statement-breakpoint
ALTER TABLE "lists_template_list_items" DROP CONSTRAINT "lists_template_list_items_list_items_id_list_items_id_fkey";--> statement-breakpoint
ALTER TABLE "lists_template_tags" DROP CONSTRAINT "lists_template_tags_lists_template_id_lists_template_id_fkey";--> statement-breakpoint
ALTER TABLE "lists_template_tags" DROP CONSTRAINT "lists_template_tags_tags_id_tags_id_fkey";--> statement-breakpoint
ALTER TABLE "lists_templates" DROP CONSTRAINT "lists_templates_lists_id_lists_id_fkey";--> statement-breakpoint
ALTER TABLE "lists_templates" DROP CONSTRAINT "lists_templates_templates_id_templates_id_fkey";--> statement-breakpoint
ALTER TABLE "lists_type_categories" DROP CONSTRAINT "lists_type_categories_lists_type_id_lists_type_id_fkey";--> statement-breakpoint
ALTER TABLE "lists_type_categories" DROP CONSTRAINT "lists_type_categories_categories_id_categories_id_fkey";--> statement-breakpoint
ALTER TABLE "lists_type_lists" DROP CONSTRAINT "lists_type_lists_lists_type_id_lists_type_id_fkey";--> statement-breakpoint
ALTER TABLE "lists_type_lists" DROP CONSTRAINT "lists_type_lists_lists_id_lists_id_fkey";--> statement-breakpoint
ALTER TABLE "manufacturer_countries" DROP CONSTRAINT "manufacturer_countries_manufacturer_id_manufacturer_id_fkey";--> statement-breakpoint
ALTER TABLE "manufacturer_countries" DROP CONSTRAINT "manufacturer_countries_countries_id_countries_id_fkey";--> statement-breakpoint
ALTER TABLE "media" DROP CONSTRAINT "media_profile_id_profiles_id_fkey";--> statement-breakpoint
ALTER TABLE "media_files" DROP CONSTRAINT "media_files_media_id_media_id_fkey";--> statement-breakpoint
ALTER TABLE "media_folders" DROP CONSTRAINT "media_folders_parent_folder_media_id_fkey";--> statement-breakpoint
ALTER TABLE "media_folders_directus_users" DROP CONSTRAINT "media_folders_directus_users_7DuSaL4fmUGp_fkey";--> statement-breakpoint
ALTER TABLE "member_groups_events" DROP CONSTRAINT "member_groups_events_events_id_events_id_fkey";--> statement-breakpoint
ALTER TABLE "member_groups_polls" DROP CONSTRAINT "member_groups_polls_polls_id_polls_id_fkey";--> statement-breakpoint
ALTER TABLE "member_groups_posts" DROP CONSTRAINT "member_groups_posts_posts_id_posts_id_fkey";--> statement-breakpoint
ALTER TABLE "messages" DROP CONSTRAINT "messages_conversation_conversations_id_fkey";--> statement-breakpoint
ALTER TABLE "auth"."mfa_amr_claims" DROP CONSTRAINT "mfa_amr_claims_session_id_sessions_id_fkey";--> statement-breakpoint
ALTER TABLE "auth"."mfa_challenges" DROP CONSTRAINT "mfa_challenges_factor_id_mfa_factors_id_fkey";--> statement-breakpoint
ALTER TABLE "auth"."mfa_factors" DROP CONSTRAINT "mfa_factors_user_id_users_id_fkey";--> statement-breakpoint
ALTER TABLE "moments_products" DROP CONSTRAINT "moments_products_moments_id_moments_id_fkey";--> statement-breakpoint
ALTER TABLE "moments_spaces" DROP CONSTRAINT "moments_spaces_moments_id_moments_id_fkey";--> statement-breakpoint
ALTER TABLE "moments_spaces" DROP CONSTRAINT "moments_spaces_spaces_id_spaces_id_fkey";--> statement-breakpoint
ALTER TABLE "musicchart_departments" DROP CONSTRAINT "musicchart_departments_departments_id_departments_id_fkey";--> statement-breakpoint
ALTER TABLE "navigation_pages" DROP CONSTRAINT "navigation_pages_navigation_id_navigation_id_fkey";--> statement-breakpoint
ALTER TABLE "navigation_pages" DROP CONSTRAINT "navigation_pages_pages_id_pages_id_fkey";--> statement-breakpoint
ALTER TABLE "navigation_websites" DROP CONSTRAINT "navigation_websites_navigation_id_navigation_id_fkey";--> statement-breakpoint
ALTER TABLE "navigation_websites" DROP CONSTRAINT "navigation_websites_websites_id_websites_id_fkey";--> statement-breakpoint
ALTER TABLE "auth"."oauth_authorizations" DROP CONSTRAINT "oauth_authorizations_user_id_users_id_fkey";--> statement-breakpoint
ALTER TABLE "auth"."oauth_consents" DROP CONSTRAINT "oauth_consents_user_id_users_id_fkey";--> statement-breakpoint
ALTER TABLE "storage"."objects" DROP CONSTRAINT "objects_bucket_id_buckets_id_fkey";--> statement-breakpoint
ALTER TABLE "auth"."one_time_tokens" DROP CONSTRAINT "one_time_tokens_user_id_users_id_fkey";--> statement-breakpoint
ALTER TABLE "order_items_orders" DROP CONSTRAINT "order_items_orders_order_items_id_order_items_id_fkey";--> statement-breakpoint
ALTER TABLE "order_items_orders" DROP CONSTRAINT "order_items_orders_orders_id_orders_id_fkey";--> statement-breakpoint
ALTER TABLE "order_items_products" DROP CONSTRAINT "order_items_products_order_items_id_order_items_id_fkey";--> statement-breakpoint
ALTER TABLE "orders_products" DROP CONSTRAINT "orders_products_orders_id_orders_id_fkey";--> statement-breakpoint
ALTER TABLE "organization_members" DROP CONSTRAINT "organization_members_user_id_directus_users_id_fkey";--> statement-breakpoint
ALTER TABLE "organizations_contacts" DROP CONSTRAINT "organizations_contacts_contacts_id_contacts_id_fkey";--> statement-breakpoint
ALTER TABLE "os_activities" DROP CONSTRAINT "os_activities_deal_os_deals_id_fkey";--> statement-breakpoint
ALTER TABLE "os_activity_contacts" DROP CONSTRAINT "os_activity_contacts_os_activities_id_os_activities_id_fkey";--> statement-breakpoint
ALTER TABLE "os_activity_contacts" DROP CONSTRAINT "os_activity_contacts_contacts_id_contacts_id_fkey";--> statement-breakpoint
ALTER TABLE "os_deal_contacts" DROP CONSTRAINT "os_deal_contacts_os_deals_id_os_deals_id_fkey";--> statement-breakpoint
ALTER TABLE "os_deal_contacts" DROP CONSTRAINT "os_deal_contacts_contacts_id_contacts_id_fkey";--> statement-breakpoint
ALTER TABLE "os_deals" DROP CONSTRAINT "os_deals_deal_stage_os_deal_stages_id_fkey";--> statement-breakpoint
ALTER TABLE "os_expenses" DROP CONSTRAINT "os_expenses_project_os_projects_id_fkey";--> statement-breakpoint
ALTER TABLE "os_expenses" DROP CONSTRAINT "os_expenses_invoice_item_os_invoice_items_id_fkey";--> statement-breakpoint
ALTER TABLE "os_invoice_items" DROP CONSTRAINT "os_invoice_items_invoice_os_invoices_id_fkey";--> statement-breakpoint
ALTER TABLE "os_invoice_items" DROP CONSTRAINT "os_invoice_items_tax_rate_os_tax_rates_id_fkey";--> statement-breakpoint
ALTER TABLE "os_invoice_items" DROP CONSTRAINT "os_invoice_items_billable_expense_os_expenses_id_fkey";--> statement-breakpoint
ALTER TABLE "os_invoice_items" DROP CONSTRAINT "os_invoice_items_item_os_items_id_fkey";--> statement-breakpoint
ALTER TABLE "os_invoices" DROP CONSTRAINT "os_invoices_contact_contacts_id_fkey";--> statement-breakpoint
ALTER TABLE "os_invoices" DROP CONSTRAINT "os_invoices_project_os_projects_id_fkey";--> statement-breakpoint
ALTER TABLE "os_items" DROP CONSTRAINT "os_items_default_tax_rate_os_tax_rates_id_fkey";--> statement-breakpoint
ALTER TABLE "os_payments" DROP CONSTRAINT "os_payments_contact_contacts_id_fkey";--> statement-breakpoint
ALTER TABLE "os_payments" DROP CONSTRAINT "os_payments_invoice_os_invoices_id_fkey";--> statement-breakpoint
ALTER TABLE "os_project_contacts" DROP CONSTRAINT "os_project_contacts_os_projects_id_os_projects_id_fkey";--> statement-breakpoint
ALTER TABLE "os_project_contacts" DROP CONSTRAINT "os_project_contacts_contacts_id_contacts_id_fkey";--> statement-breakpoint
ALTER TABLE "os_project_updates" DROP CONSTRAINT "os_project_updates_project_os_projects_id_fkey";--> statement-breakpoint
ALTER TABLE "os_proposal_approvals" DROP CONSTRAINT "os_proposal_approvals_proposal_os_proposals_id_fkey";--> statement-breakpoint
ALTER TABLE "os_proposal_approvals" DROP CONSTRAINT "os_proposal_approvals_contact_contacts_id_fkey";--> statement-breakpoint
ALTER TABLE "os_proposal_blocks" DROP CONSTRAINT "os_proposal_blocks_os_proposals_id_os_proposals_id_fkey";--> statement-breakpoint
ALTER TABLE "os_proposal_contacts" DROP CONSTRAINT "os_proposal_contacts_os_proposals_id_os_proposals_id_fkey";--> statement-breakpoint
ALTER TABLE "os_proposal_contacts" DROP CONSTRAINT "os_proposal_contacts_contacts_id_contacts_id_fkey";--> statement-breakpoint
ALTER TABLE "os_proposals" DROP CONSTRAINT "os_proposals_deal_os_deals_id_fkey";--> statement-breakpoint
ALTER TABLE "os_task_files" DROP CONSTRAINT "os_task_files_os_tasks_id_os_tasks_id_fkey";--> statement-breakpoint
ALTER TABLE "os_tasks" DROP CONSTRAINT "os_tasks_project_os_projects_id_fkey";--> statement-breakpoint
ALTER TABLE "os_tasks" DROP CONSTRAINT "os_tasks_form_forms_id_fkey";--> statement-breakpoint
ALTER TABLE "outlets_categories" DROP CONSTRAINT "outlets_categories_outlets_id_outlets_id_fkey";--> statement-breakpoint
ALTER TABLE "outlets_categories" DROP CONSTRAINT "outlets_categories_categories_id_categories_id_fkey";--> statement-breakpoint
ALTER TABLE "outlets_shorts" DROP CONSTRAINT "outlets_shorts_outlets_id_outlets_id_fkey";--> statement-breakpoint
ALTER TABLE "outlets_shorts" DROP CONSTRAINT "outlets_shorts_shorts_id_shorts_id_fkey";--> statement-breakpoint
ALTER TABLE "page_blocks_files" DROP CONSTRAINT "page_blocks_files_page_blocks_id_page_blocks_id_fkey";--> statement-breakpoint
ALTER TABLE "pages" DROP CONSTRAINT "pages_seo_seo_id_fkey";--> statement-breakpoint
ALTER TABLE "pages_blog" DROP CONSTRAINT "pages_blog_seo_seo_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."pages" DROP CONSTRAINT "pages_image_directus_files_id_fkey";--> statement-breakpoint
ALTER TABLE "pages_projects" DROP CONSTRAINT "pages_projects_seo_seo_id_fkey";--> statement-breakpoint
ALTER TABLE "payments_countries" DROP CONSTRAINT "payments_countries_payment_id_payments_id_fkey";--> statement-breakpoint
ALTER TABLE "payments_countries" DROP CONSTRAINT "payments_countries_country_id_countries_id_fkey";--> statement-breakpoint
ALTER TABLE "payments_currency" DROP CONSTRAINT "payments_currency_payments_id_payments_id_fkey";--> statement-breakpoint
ALTER TABLE "payments_currency" DROP CONSTRAINT "payments_currency_currency_id_currency_id_fkey";--> statement-breakpoint
ALTER TABLE "payments_directus_users" DROP CONSTRAINT "payments_directus_users_payments_id_payments_id_fkey";--> statement-breakpoint
ALTER TABLE "payments_orders" DROP CONSTRAINT "payments_orders_payments_id_payments_id_fkey";--> statement-breakpoint
ALTER TABLE "payments_orders" DROP CONSTRAINT "payments_orders_orders_id_orders_id_fkey";--> statement-breakpoint
ALTER TABLE "pickup_locations_city" DROP CONSTRAINT "pickup_locations_city_7oFLpGaOTAVn_fkey";--> statement-breakpoint
ALTER TABLE "pickup_locations_country" DROP CONSTRAINT "pickup_locations_country_51qU7Ea417QY_fkey";--> statement-breakpoint
ALTER TABLE "pickup_locations_state" DROP CONSTRAINT "pickup_locations_state_XtcA0QrbIBtr_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."places_characters" DROP CONSTRAINT "places_characters_places_id_places_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."places_characters" DROP CONSTRAINT "places_characters_characters_id_characters_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."places" DROP CONSTRAINT "places_image_directus_files_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."places_items" DROP CONSTRAINT "places_items_places_id_places_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."places_items" DROP CONSTRAINT "places_items_items_id_items_id_fkey";--> statement-breakpoint
ALTER TABLE "platform_articles" DROP CONSTRAINT "platform_articles_platform_id_platform_id_fkey";--> statement-breakpoint
ALTER TABLE "platform_articles" DROP CONSTRAINT "platform_articles_articles_id_articles_id_fkey";--> statement-breakpoint
ALTER TABLE "platform_categories" DROP CONSTRAINT "platform_categories_platform_id_platform_id_fkey";--> statement-breakpoint
ALTER TABLE "platform_categories" DROP CONSTRAINT "platform_categories_categories_id_categories_id_fkey";--> statement-breakpoint
ALTER TABLE "platform_lists" DROP CONSTRAINT "platform_lists_platform_id_platform_id_fkey";--> statement-breakpoint
ALTER TABLE "platform_lists" DROP CONSTRAINT "platform_lists_lists_id_lists_id_fkey";--> statement-breakpoint
ALTER TABLE "platform_navigation" DROP CONSTRAINT "platform_navigation_platform_id_platform_id_fkey";--> statement-breakpoint
ALTER TABLE "platform_navigation" DROP CONSTRAINT "platform_navigation_navigation_id_navigation_id_fkey";--> statement-breakpoint
ALTER TABLE "platform_page_blocks" DROP CONSTRAINT "platform_page_blocks_platform_id_platform_id_fkey";--> statement-breakpoint
ALTER TABLE "platform_page_blocks" DROP CONSTRAINT "platform_page_blocks_page_blocks_id_page_blocks_id_fkey";--> statement-breakpoint
ALTER TABLE "platform_pages" DROP CONSTRAINT "platform_pages_platform_id_platform_id_fkey";--> statement-breakpoint
ALTER TABLE "platform_pages" DROP CONSTRAINT "platform_pages_pages_id_pages_id_fkey";--> statement-breakpoint
ALTER TABLE "platform_products" DROP CONSTRAINT "platform_products_platform_id_platform_id_fkey";--> statement-breakpoint
ALTER TABLE "polls_spaces" DROP CONSTRAINT "polls_spaces_polls_id_polls_id_fkey";--> statement-breakpoint
ALTER TABLE "polls_spaces" DROP CONSTRAINT "polls_spaces_spaces_id_spaces_id_fkey";--> statement-breakpoint
ALTER TABLE "postgresstores_collections" DROP CONSTRAINT "postgresstores_collections_P5X7xz2VkqyH_fkey";--> statement-breakpoint
ALTER TABLE "postgresstores_collections" DROP CONSTRAINT "postgresstores_collections_collections_id_collections_id_fkey";--> statement-breakpoint
ALTER TABLE "postgresstores_products" DROP CONSTRAINT "postgresstores_products_3eVdtUBksZ7u_fkey";--> statement-breakpoint
ALTER TABLE "postgresstores_websites" DROP CONSTRAINT "postgresstores_websites_bdgqgLHgpdR0_fkey";--> statement-breakpoint
ALTER TABLE "postgresstores_websites" DROP CONSTRAINT "postgresstores_websites_websites_id_websites_id_fkey";--> statement-breakpoint
ALTER TABLE "posts" DROP CONSTRAINT "posts_seo_seo_id_fkey";--> statement-breakpoint
ALTER TABLE "posts_departments" DROP CONSTRAINT "posts_departments_posts_id_posts_id_fkey";--> statement-breakpoint
ALTER TABLE "posts_departments" DROP CONSTRAINT "posts_departments_departments_id_departments_id_fkey";--> statement-breakpoint
ALTER TABLE "posts_polls" DROP CONSTRAINT "posts_polls_posts_id_posts_id_fkey";--> statement-breakpoint
ALTER TABLE "posts_polls" DROP CONSTRAINT "posts_polls_polls_id_polls_id_fkey";--> statement-breakpoint
ALTER TABLE "product_attributes" DROP CONSTRAINT "product_attributes_attribute_id_attributes_id_fkey";--> statement-breakpoint
ALTER TABLE "product_types_products" DROP CONSTRAINT "product_types_products_product_types_id_product_types_id_fkey";--> statement-breakpoint
ALTER TABLE "products_attributes" DROP CONSTRAINT "products_attributes_attributes_id_attributes_id_fkey";--> statement-breakpoint
ALTER TABLE "products_categories" DROP CONSTRAINT "products_categories_categories_id_categories_id_fkey";--> statement-breakpoint
ALTER TABLE "products_currency" DROP CONSTRAINT "products_currency_currency_id_currency_id_fkey";--> statement-breakpoint
ALTER TABLE "products_departments" DROP CONSTRAINT "products_departments_departments_id_departments_id_fkey";--> statement-breakpoint
ALTER TABLE "products_manufacturer" DROP CONSTRAINT "products_manufacturer_manufacturer_id_manufacturer_id_fkey";--> statement-breakpoint
ALTER TABLE "products_spaces" DROP CONSTRAINT "products_spaces_spaces_id_spaces_id_fkey";--> statement-breakpoint
ALTER TABLE "products_tags" DROP CONSTRAINT "products_tags_tags_id_tags_id_fkey";--> statement-breakpoint
ALTER TABLE "products_websites" DROP CONSTRAINT "products_websites_websites_id_websites_id_fkey";--> statement-breakpoint
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_id_users_id_fkey";--> statement-breakpoint
ALTER TABLE "profiles_cities" DROP CONSTRAINT "profiles_cities_profiles_id_profiles_id_fkey";--> statement-breakpoint
ALTER TABLE "profiles_cities" DROP CONSTRAINT "profiles_cities_cities_id_cities_id_fkey";--> statement-breakpoint
ALTER TABLE "profiles_countries" DROP CONSTRAINT "profiles_countries_profiles_id_profiles_id_fkey";--> statement-breakpoint
ALTER TABLE "profiles_countries" DROP CONSTRAINT "profiles_countries_countries_id_countries_id_fkey";--> statement-breakpoint
ALTER TABLE "profiles_followers" DROP CONSTRAINT "profiles_followers_profiles_id_profiles_id_fkey";--> statement-breakpoint
ALTER TABLE "profiles_followers" DROP CONSTRAINT "profiles_followers_followers_id_followers_id_fkey";--> statement-breakpoint
ALTER TABLE "profiles_states" DROP CONSTRAINT "profiles_states_profiles_id_profiles_id_fkey";--> statement-breakpoint
ALTER TABLE "profiles_states" DROP CONSTRAINT "profiles_states_states_id_states_id_fkey";--> statement-breakpoint
ALTER TABLE "project_board_comments" DROP CONSTRAINT "project_board_comments_project_board_id_project_board_id_fkey";--> statement-breakpoint
ALTER TABLE "project_board_comments" DROP CONSTRAINT "project_board_comments_comments_id_comments_id_fkey";--> statement-breakpoint
ALTER TABLE "project_board_directus_users" DROP CONSTRAINT "project_board_directus_users_qJD0Zkg2tzzP_fkey";--> statement-breakpoint
ALTER TABLE "project_board_files" DROP CONSTRAINT "project_board_files_project_board_id_project_board_id_fkey";--> statement-breakpoint
ALTER TABLE "project_board_projects" DROP CONSTRAINT "project_board_projects_project_board_id_project_board_id_fkey";--> statement-breakpoint
ALTER TABLE "project_board_projects" DROP CONSTRAINT "project_board_projects_projects_id_projects_id_fkey";--> statement-breakpoint
ALTER TABLE "projects_calendar" DROP CONSTRAINT "projects_calendar_projects_id_projects_id_fkey";--> statement-breakpoint
ALTER TABLE "projects_calendar" DROP CONSTRAINT "projects_calendar_calendar_id_calendar_id_fkey";--> statement-breakpoint
ALTER TABLE "projects_comments" DROP CONSTRAINT "projects_comments_projects_id_projects_id_fkey";--> statement-breakpoint
ALTER TABLE "projects_comments" DROP CONSTRAINT "projects_comments_comments_id_comments_id_fkey";--> statement-breakpoint
ALTER TABLE "projects_directus_users" DROP CONSTRAINT "projects_directus_users_projects_id_projects_id_fkey";--> statement-breakpoint
ALTER TABLE "projects_files" DROP CONSTRAINT "projects_files_projects_id_projects_id_fkey";--> statement-breakpoint
ALTER TABLE "projects_integrations" DROP CONSTRAINT "projects_integrations_projects_id_projects_id_fkey";--> statement-breakpoint
ALTER TABLE "projects_integrations" DROP CONSTRAINT "projects_integrations_integrations_id_integrations_id_fkey";--> statement-breakpoint
ALTER TABLE "projects_lists" DROP CONSTRAINT "projects_lists_projects_id_projects_id_fkey";--> statement-breakpoint
ALTER TABLE "projects_lists" DROP CONSTRAINT "projects_lists_lists_id_lists_id_fkey";--> statement-breakpoint
ALTER TABLE "projects_products" DROP CONSTRAINT "projects_products_projects_id_projects_id_fkey";--> statement-breakpoint
ALTER TABLE "projects_project_timeline" DROP CONSTRAINT "projects_project_timeline_projects_id_projects_id_fkey";--> statement-breakpoint
ALTER TABLE "projects_project_timeline" DROP CONSTRAINT "projects_project_timeline_yzWChdyyOYaU_fkey";--> statement-breakpoint
ALTER TABLE "projects_region" DROP CONSTRAINT "projects_region_projects_id_projects_id_fkey";--> statement-breakpoint
ALTER TABLE "projects_region" DROP CONSTRAINT "projects_region_region_id_region_id_fkey";--> statement-breakpoint
ALTER TABLE "radios_categories" DROP CONSTRAINT "radios_categories_radios_id_radios_id_fkey";--> statement-breakpoint
ALTER TABLE "radios_categories" DROP CONSTRAINT "radios_categories_categories_id_categories_id_fkey";--> statement-breakpoint
ALTER TABLE "radios_departments" DROP CONSTRAINT "radios_departments_radios_id_radios_id_fkey";--> statement-breakpoint
ALTER TABLE "radios_departments" DROP CONSTRAINT "radios_departments_departments_id_departments_id_fkey";--> statement-breakpoint
ALTER TABLE "radios_musicchart" DROP CONSTRAINT "radios_musicchart_radios_id_radios_id_fkey";--> statement-breakpoint
ALTER TABLE "ratings_products" DROP CONSTRAINT "ratings_products_ratings_id_ratings_id_fkey";--> statement-breakpoint
ALTER TABLE "reactions" DROP CONSTRAINT "reactions_posts_posts_id_fkey";--> statement-breakpoint
ALTER TABLE "reactions" DROP CONSTRAINT "reactions_list_id_lists_id_fkey";--> statement-breakpoint
ALTER TABLE "reactions" DROP CONSTRAINT "reactions_space_id_spaces_id_fkey";--> statement-breakpoint
ALTER TABLE "reactions" DROP CONSTRAINT "reactions_video_id_videos_id_fkey";--> statement-breakpoint
ALTER TABLE "reactions_comments" DROP CONSTRAINT "reactions_comments_reactions_id_reactions_id_fkey";--> statement-breakpoint
ALTER TABLE "reactions_comments" DROP CONSTRAINT "reactions_comments_comments_id_comments_id_fkey";--> statement-breakpoint
ALTER TABLE "reactions_directus_users" DROP CONSTRAINT "reactions_directus_users_reaction_id_reactions_id_fkey";--> statement-breakpoint
ALTER TABLE "reactions_lists" DROP CONSTRAINT "reactions_lists_reactions_id_reactions_id_fkey";--> statement-breakpoint
ALTER TABLE "reactions_lists" DROP CONSTRAINT "reactions_lists_lists_id_lists_id_fkey";--> statement-breakpoint
ALTER TABLE "reactions_posts" DROP CONSTRAINT "reactions_posts_reactions_id_reactions_id_fkey";--> statement-breakpoint
ALTER TABLE "reactions_posts" DROP CONSTRAINT "reactions_posts_posts_id_posts_id_fkey";--> statement-breakpoint
ALTER TABLE "reactions_shorts" DROP CONSTRAINT "reactions_shorts_reactions_id_reactions_id_fkey";--> statement-breakpoint
ALTER TABLE "reactions_shorts" DROP CONSTRAINT "reactions_shorts_shorts_id_shorts_id_fkey";--> statement-breakpoint
ALTER TABLE "auth"."refresh_tokens" DROP CONSTRAINT "refresh_tokens_session_id_sessions_id_fkey";--> statement-breakpoint
ALTER TABLE "region_address" DROP CONSTRAINT "region_address_region_id_region_id_fkey";--> statement-breakpoint
ALTER TABLE "region_address" DROP CONSTRAINT "region_address_address_id_address_id_fkey";--> statement-breakpoint
ALTER TABLE "region_countries" DROP CONSTRAINT "region_countries_region_id_region_id_fkey";--> statement-breakpoint
ALTER TABLE "region_countries" DROP CONSTRAINT "region_countries_countries_id_countries_id_fkey";--> statement-breakpoint
ALTER TABLE "region_shipping_address" DROP CONSTRAINT "region_shipping_address_region_id_region_id_fkey";--> statement-breakpoint
ALTER TABLE "region_shipping_address" DROP CONSTRAINT "region_shipping_address_pO9cUZLGlqYg_fkey";--> statement-breakpoint
ALTER TABLE "related_products_products" DROP CONSTRAINT "related_products_products_E2YPqw2AF9sX_fkey";--> statement-breakpoint
ALTER TABLE "report_comments" DROP CONSTRAINT "report_comments_report_id_report_id_fkey";--> statement-breakpoint
ALTER TABLE "report_comments" DROP CONSTRAINT "report_comments_comments_id_comments_id_fkey";--> statement-breakpoint
ALTER TABLE "report_directus_users" DROP CONSTRAINT "report_directus_users_report_id_report_id_fkey";--> statement-breakpoint
ALTER TABLE "report_faqs" DROP CONSTRAINT "report_faqs_report_id_report_id_fkey";--> statement-breakpoint
ALTER TABLE "report_faqs" DROP CONSTRAINT "report_faqs_faqs_id_faqs_id_fkey";--> statement-breakpoint
ALTER TABLE "report_posts" DROP CONSTRAINT "report_posts_report_id_report_id_fkey";--> statement-breakpoint
ALTER TABLE "report_posts" DROP CONSTRAINT "report_posts_posts_id_posts_id_fkey";--> statement-breakpoint
ALTER TABLE "report_products" DROP CONSTRAINT "report_products_report_id_report_id_fkey";--> statement-breakpoint
ALTER TABLE "report_spaces" DROP CONSTRAINT "report_spaces_report_id_report_id_fkey";--> statement-breakpoint
ALTER TABLE "report_spaces" DROP CONSTRAINT "report_spaces_spaces_id_spaces_id_fkey";--> statement-breakpoint
ALTER TABLE "returns_orders" DROP CONSTRAINT "returns_orders_returns_id_returns_id_fkey";--> statement-breakpoint
ALTER TABLE "returns_orders" DROP CONSTRAINT "returns_orders_orders_id_orders_id_fkey";--> statement-breakpoint
ALTER TABLE "returns_products" DROP CONSTRAINT "returns_products_returns_id_returns_id_fkey";--> statement-breakpoint
ALTER TABLE "storage"."s3_multipart_uploads" DROP CONSTRAINT "s3_multipart_uploads_bucket_id_buckets_id_fkey";--> statement-breakpoint
ALTER TABLE "storage"."s3_multipart_uploads_parts" DROP CONSTRAINT "s3_multipart_uploads_parts_kgbyqUQsy1fg_fkey";--> statement-breakpoint
ALTER TABLE "storage"."s3_multipart_uploads_parts" DROP CONSTRAINT "s3_multipart_uploads_parts_bucket_id_buckets_id_fkey";--> statement-breakpoint
ALTER TABLE "auth"."saml_providers" DROP CONSTRAINT "saml_providers_sso_provider_id_sso_providers_id_fkey";--> statement-breakpoint
ALTER TABLE "auth"."saml_relay_states" DROP CONSTRAINT "saml_relay_states_sso_provider_id_sso_providers_id_fkey";--> statement-breakpoint
ALTER TABLE "auth"."saml_relay_states" DROP CONSTRAINT "saml_relay_states_flow_state_id_flow_state_id_fkey";--> statement-breakpoint
ALTER TABLE "seasons" DROP CONSTRAINT "seasons_name_videos_id_fkey";--> statement-breakpoint
ALTER TABLE "seasons_videos" DROP CONSTRAINT "seasons_videos_seasons_id_seasons_id_fkey";--> statement-breakpoint
ALTER TABLE "seasons_videos" DROP CONSTRAINT "seasons_videos_videos_id_videos_id_fkey";--> statement-breakpoint
ALTER TABLE "auth"."sessions" DROP CONSTRAINT "sessions_user_id_users_id_fkey";--> statement-breakpoint
ALTER TABLE "shipment" DROP CONSTRAINT "shipment_order_orders_id_fkey";--> statement-breakpoint
ALTER TABLE "shipment_address" DROP CONSTRAINT "shipment_address_shipment_id_shipment_id_fkey";--> statement-breakpoint
ALTER TABLE "shipment_address" DROP CONSTRAINT "shipment_address_address_id_address_id_fkey";--> statement-breakpoint
ALTER TABLE "shipment_comments" DROP CONSTRAINT "shipment_comments_parent_id_shipment_id_fkey";--> statement-breakpoint
ALTER TABLE "shipment_products" DROP CONSTRAINT "shipment_products_shipment_id_shipment_id_fkey";--> statement-breakpoint
ALTER TABLE "shipment_tracking" DROP CONSTRAINT "shipment_tracking_parent_id_shipment_id_fkey";--> statement-breakpoint
ALTER TABLE "shipping_addresses_cities" DROP CONSTRAINT "shipping_addresses_cities_EauvN0dE4vs1_fkey";--> statement-breakpoint
ALTER TABLE "shipping_addresses_cities" DROP CONSTRAINT "shipping_addresses_cities_cities_id_cities_id_fkey";--> statement-breakpoint
ALTER TABLE "shipping_addresses_countries" DROP CONSTRAINT "shipping_addresses_countries_AbmkwxuW9muk_fkey";--> statement-breakpoint
ALTER TABLE "shipping_addresses_countries" DROP CONSTRAINT "shipping_addresses_countries_countries_id_countries_id_fkey";--> statement-breakpoint
ALTER TABLE "shipping_addresses_directus_users" DROP CONSTRAINT "shipping_addresses_directus_users_PKTkJ01lVq80_fkey";--> statement-breakpoint
ALTER TABLE "shipping_addresses_orders" DROP CONSTRAINT "shipping_addresses_orders_DMyGzeMTrHsP_fkey";--> statement-breakpoint
ALTER TABLE "shipping_addresses_orders" DROP CONSTRAINT "shipping_addresses_orders_orders_id_orders_id_fkey";--> statement-breakpoint
ALTER TABLE "shipping_addresses_states" DROP CONSTRAINT "shipping_addresses_states_aYicxg2jwgew_fkey";--> statement-breakpoint
ALTER TABLE "shipping_addresses_states" DROP CONSTRAINT "shipping_addresses_states_states_id_states_id_fkey";--> statement-breakpoint
ALTER TABLE "shop_type_shops" DROP CONSTRAINT "shop_type_shops_shop_type_id_shop_type_id_fkey";--> statement-breakpoint
ALTER TABLE "shop_type_shops" DROP CONSTRAINT "shop_type_shops_shops_id_shops_id_fkey";--> statement-breakpoint
ALTER TABLE "shops_agreements" DROP CONSTRAINT "shops_agreements_shops_id_shops_id_fkey";--> statement-breakpoint
ALTER TABLE "shops_categories" DROP CONSTRAINT "shops_categories_shops_id_shops_id_fkey";--> statement-breakpoint
ALTER TABLE "shops_categories" DROP CONSTRAINT "shops_categories_categories_id_categories_id_fkey";--> statement-breakpoint
ALTER TABLE "shops_comments" DROP CONSTRAINT "shops_comments_shops_id_shops_id_fkey";--> statement-breakpoint
ALTER TABLE "shops_comments" DROP CONSTRAINT "shops_comments_comments_id_comments_id_fkey";--> statement-breakpoint
ALTER TABLE "shops_countries" DROP CONSTRAINT "shops_countries_shops_id_shops_id_fkey";--> statement-breakpoint
ALTER TABLE "shops_countries" DROP CONSTRAINT "shops_countries_countries_id_countries_id_fkey";--> statement-breakpoint
ALTER TABLE "shops_departments" DROP CONSTRAINT "shops_departments_shops_id_shops_id_fkey";--> statement-breakpoint
ALTER TABLE "shops_departments" DROP CONSTRAINT "shops_departments_departments_id_departments_id_fkey";--> statement-breakpoint
ALTER TABLE "shops_directus_users" DROP CONSTRAINT "shops_directus_users_shops_id_shops_id_fkey";--> statement-breakpoint
ALTER TABLE "shops_files" DROP CONSTRAINT "shops_files_shops_id_shops_id_fkey";--> statement-breakpoint
ALTER TABLE "shops_products" DROP CONSTRAINT "shops_products_shops_id_shops_id_fkey";--> statement-breakpoint
ALTER TABLE "shops_showcases" DROP CONSTRAINT "shops_showcases_shops_id_shops_id_fkey";--> statement-breakpoint
ALTER TABLE "shops_showcases" DROP CONSTRAINT "shops_showcases_showcases_id_showcases_id_fkey";--> statement-breakpoint
ALTER TABLE "shorts_directus_users" DROP CONSTRAINT "shorts_directus_users_shorts_id_shorts_id_fkey";--> statement-breakpoint
ALTER TABLE "shorts_files" DROP CONSTRAINT "shorts_files_shorts_id_shorts_id_fkey";--> statement-breakpoint
ALTER TABLE "shorts_products" DROP CONSTRAINT "shorts_products_shorts_id_shorts_id_fkey";--> statement-breakpoint
ALTER TABLE "shorts_spaces" DROP CONSTRAINT "shorts_spaces_shorts_id_shorts_id_fkey";--> statement-breakpoint
ALTER TABLE "shorts_spaces" DROP CONSTRAINT "shorts_spaces_spaces_id_spaces_id_fkey";--> statement-breakpoint
ALTER TABLE "showcases_products" DROP CONSTRAINT "showcases_products_showcases_id_showcases_id_fkey";--> statement-breakpoint
ALTER TABLE "showcases_shops" DROP CONSTRAINT "showcases_shops_showcases_id_showcases_id_fkey";--> statement-breakpoint
ALTER TABLE "showcases_shops" DROP CONSTRAINT "showcases_shops_shops_id_shops_id_fkey";--> statement-breakpoint
ALTER TABLE "showcases_spaces" DROP CONSTRAINT "showcases_spaces_showcases_id_showcases_id_fkey";--> statement-breakpoint
ALTER TABLE "showcases_spaces" DROP CONSTRAINT "showcases_spaces_spaces_id_spaces_id_fkey";--> statement-breakpoint
ALTER TABLE "site_preference_categories" DROP CONSTRAINT "site_preference_categories_categories_id_categories_id_fkey";--> statement-breakpoint
ALTER TABLE "site_preference_countries" DROP CONSTRAINT "site_preference_countries_countries_id_countries_id_fkey";--> statement-breakpoint
ALTER TABLE "site_preference_departments" DROP CONSTRAINT "site_preference_departments_departments_id_departments_id_fkey";--> statement-breakpoint
ALTER TABLE "spaces_articles" DROP CONSTRAINT "spaces_articles_spaces_id_spaces_id_fkey";--> statement-breakpoint
ALTER TABLE "spaces_articles" DROP CONSTRAINT "spaces_articles_articles_id_articles_id_fkey";--> statement-breakpoint
ALTER TABLE "spaces_cities" DROP CONSTRAINT "spaces_cities_spaces_id_spaces_id_fkey";--> statement-breakpoint
ALTER TABLE "spaces_cities" DROP CONSTRAINT "spaces_cities_cities_id_cities_id_fkey";--> statement-breakpoint
ALTER TABLE "spaces_countries" DROP CONSTRAINT "spaces_countries_spaces_id_spaces_id_fkey";--> statement-breakpoint
ALTER TABLE "spaces_countries" DROP CONSTRAINT "spaces_countries_countries_id_countries_id_fkey";--> statement-breakpoint
ALTER TABLE "spaces_departments" DROP CONSTRAINT "spaces_departments_spaces_id_spaces_id_fkey";--> statement-breakpoint
ALTER TABLE "spaces_departments" DROP CONSTRAINT "spaces_departments_departments_id_departments_id_fkey";--> statement-breakpoint
ALTER TABLE "spaces_directus_users" DROP CONSTRAINT "spaces_directus_users_spaces_id_spaces_id_fkey";--> statement-breakpoint
ALTER TABLE "spaces_files" DROP CONSTRAINT "spaces_files_spaces_id_spaces_id_fkey";--> statement-breakpoint
ALTER TABLE "spaces_lists" DROP CONSTRAINT "spaces_lists_spaces_id_spaces_id_fkey";--> statement-breakpoint
ALTER TABLE "spaces_lists" DROP CONSTRAINT "spaces_lists_lists_id_lists_id_fkey";--> statement-breakpoint
ALTER TABLE "spaces_live_rooms" DROP CONSTRAINT "spaces_live_rooms_spaces_id_spaces_id_fkey";--> statement-breakpoint
ALTER TABLE "spaces_pages" DROP CONSTRAINT "spaces_pages_spaces_id_spaces_id_fkey";--> statement-breakpoint
ALTER TABLE "spaces_pages" DROP CONSTRAINT "spaces_pages_pages_id_pages_id_fkey";--> statement-breakpoint
ALTER TABLE "spaces_posts" DROP CONSTRAINT "spaces_posts_spaces_id_spaces_id_fkey";--> statement-breakpoint
ALTER TABLE "spaces_posts" DROP CONSTRAINT "spaces_posts_posts_id_posts_id_fkey";--> statement-breakpoint
ALTER TABLE "spaces_shop_type" DROP CONSTRAINT "spaces_shop_type_spaces_id_spaces_id_fkey";--> statement-breakpoint
ALTER TABLE "spaces_shop_type" DROP CONSTRAINT "spaces_shop_type_shop_type_id_shop_type_id_fkey";--> statement-breakpoint
ALTER TABLE "spaces_space_types" DROP CONSTRAINT "spaces_space_types_spaces_id_spaces_id_fkey";--> statement-breakpoint
ALTER TABLE "spaces_space_types" DROP CONSTRAINT "spaces_space_types_space_types_id_space_types_id_fkey";--> statement-breakpoint
ALTER TABLE "spaces_states" DROP CONSTRAINT "spaces_states_spaces_id_spaces_id_fkey";--> statement-breakpoint
ALTER TABLE "spaces_states" DROP CONSTRAINT "spaces_states_states_id_states_id_fkey";--> statement-breakpoint
ALTER TABLE "spaces_tags" DROP CONSTRAINT "spaces_tags_spaces_id_spaces_id_fkey";--> statement-breakpoint
ALTER TABLE "spaces_tags" DROP CONSTRAINT "spaces_tags_tags_id_tags_id_fkey";--> statement-breakpoint
ALTER TABLE "spaces_templates" DROP CONSTRAINT "spaces_templates_spaces_id_spaces_id_fkey";--> statement-breakpoint
ALTER TABLE "spaces_templates" DROP CONSTRAINT "spaces_templates_templates_id_templates_id_fkey";--> statement-breakpoint
ALTER TABLE "auth"."sso_domains" DROP CONSTRAINT "sso_domains_sso_provider_id_sso_providers_id_fkey";--> statement-breakpoint
ALTER TABLE "states_cities" DROP CONSTRAINT "states_cities_states_id_states_id_fkey";--> statement-breakpoint
ALTER TABLE "states_cities" DROP CONSTRAINT "states_cities_cities_id_cities_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."stories_characters" DROP CONSTRAINT "stories_characters_stories_id_stories_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."stories_characters" DROP CONSTRAINT "stories_characters_characters_id_characters_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."stories" DROP CONSTRAINT "stories_user_created_directus_users_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."stories" DROP CONSTRAINT "stories_user_updated_directus_users_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."stories" DROP CONSTRAINT "stories_image_directus_files_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."stories_tags" DROP CONSTRAINT "stories_tags_stories_id_stories_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."stories_tags" DROP CONSTRAINT "stories_tags_tags_id_tags_id_fkey";--> statement-breakpoint
ALTER TABLE "streams" DROP CONSTRAINT "streams_stream_id_videos_id_fkey";--> statement-breakpoint
ALTER TABLE "streams_ratings" DROP CONSTRAINT "streams_ratings_streams_id_streams_id_fkey";--> statement-breakpoint
ALTER TABLE "streams_ratings" DROP CONSTRAINT "streams_ratings_ratings_id_ratings_id_fkey";--> statement-breakpoint
ALTER TABLE "tags_articles" DROP CONSTRAINT "tags_articles_tags_id_tags_id_fkey";--> statement-breakpoint
ALTER TABLE "tags_articles" DROP CONSTRAINT "tags_articles_articles_id_articles_id_fkey";--> statement-breakpoint
ALTER TABLE "tags_categories" DROP CONSTRAINT "tags_categories_tags_id_tags_id_fkey";--> statement-breakpoint
ALTER TABLE "tags_categories" DROP CONSTRAINT "tags_categories_categories_id_categories_id_fkey";--> statement-breakpoint
ALTER TABLE "tags_departments" DROP CONSTRAINT "tags_departments_tags_id_tags_id_fkey";--> statement-breakpoint
ALTER TABLE "tags_departments" DROP CONSTRAINT "tags_departments_departments_id_departments_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."tags" DROP CONSTRAINT "tags_image_directus_files_id_fkey";--> statement-breakpoint
ALTER TABLE "tags_posts" DROP CONSTRAINT "tags_posts_tags_id_tags_id_fkey";--> statement-breakpoint
ALTER TABLE "tags_posts" DROP CONSTRAINT "tags_posts_posts_id_posts_id_fkey";--> statement-breakpoint
ALTER TABLE "tags_products" DROP CONSTRAINT "tags_products_tags_id_tags_id_fkey";--> statement-breakpoint
ALTER TABLE "tags_shorts" DROP CONSTRAINT "tags_shorts_tags_id_tags_id_fkey";--> statement-breakpoint
ALTER TABLE "tags_shorts" DROP CONSTRAINT "tags_shorts_shorts_id_shorts_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."tags_videos" DROP CONSTRAINT "tags_videos_tags_id_tags_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."tags_videos" DROP CONSTRAINT "tags_videos_videos_id_videos_id_fkey";--> statement-breakpoint
ALTER TABLE "taxes_countries" DROP CONSTRAINT "taxes_countries_taxes_id_taxes_id_fkey";--> statement-breakpoint
ALTER TABLE "taxes_countries" DROP CONSTRAINT "taxes_countries_countries_id_countries_id_fkey";--> statement-breakpoint
ALTER TABLE "taxes_states" DROP CONSTRAINT "taxes_states_taxes_id_taxes_id_fkey";--> statement-breakpoint
ALTER TABLE "taxes_states" DROP CONSTRAINT "taxes_states_states_id_states_id_fkey";--> statement-breakpoint
ALTER TABLE "templates_space_types" DROP CONSTRAINT "templates_space_types_templates_id_templates_id_fkey";--> statement-breakpoint
ALTER TABLE "templates_space_types" DROP CONSTRAINT "templates_space_types_space_types_id_space_types_id_fkey";--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_order_orders_id_fkey";--> statement-breakpoint
ALTER TABLE "transactions_currency" DROP CONSTRAINT "transactions_currency_transactions_id_transactions_id_fkey";--> statement-breakpoint
ALTER TABLE "transactions_currency" DROP CONSTRAINT "transactions_currency_currency_id_currency_id_fkey";--> statement-breakpoint
ALTER TABLE "translations_postgresstores" DROP CONSTRAINT "translations_postgresstores_I0ZQRzK0tYpu_fkey";--> statement-breakpoint
ALTER TABLE "translations_postgresstores" DROP CONSTRAINT "translations_postgresstores_neoYqOSD5rkG_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."types_characters" DROP CONSTRAINT "types_characters_types_id_types_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."types_characters" DROP CONSTRAINT "types_characters_characters_id_characters_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."types" DROP CONSTRAINT "types_image_directus_files_id_fkey";--> statement-breakpoint
ALTER TABLE "user_friends_posts" DROP CONSTRAINT "user_friends_posts_user_friends_id_user_friends_id_fkey";--> statement-breakpoint
ALTER TABLE "user_friends_posts" DROP CONSTRAINT "user_friends_posts_posts_id_posts_id_fkey";--> statement-breakpoint
ALTER TABLE "storage"."vector_indexes" DROP CONSTRAINT "vector_indexes_bucket_id_buckets_vectors_id_fkey";--> statement-breakpoint
ALTER TABLE "vibez_product_map" DROP CONSTRAINT "vibez_product_map_clip_id_vibez_clips_id_fkey";--> statement-breakpoint
ALTER TABLE "videos" DROP CONSTRAINT "videos_ratings_ratings_id_fkey";--> statement-breakpoint
ALTER TABLE "videos" DROP CONSTRAINT "videos_distributor_attributes_id_fkey";--> statement-breakpoint
ALTER TABLE "videos_categories" DROP CONSTRAINT "videos_categories_videos_id_videos_id_fkey";--> statement-breakpoint
ALTER TABLE "videos_categories" DROP CONSTRAINT "videos_categories_categories_id_categories_id_fkey";--> statement-breakpoint
ALTER TABLE "videos_comments" DROP CONSTRAINT "videos_comments_videos_id_videos_id_fkey";--> statement-breakpoint
ALTER TABLE "videos_comments" DROP CONSTRAINT "videos_comments_comments_id_comments_id_fkey";--> statement-breakpoint
ALTER TABLE "videos_departments" DROP CONSTRAINT "videos_departments_videos_id_videos_id_fkey";--> statement-breakpoint
ALTER TABLE "videos_departments" DROP CONSTRAINT "videos_departments_departments_id_departments_id_fkey";--> statement-breakpoint
ALTER TABLE "enovels"."videos" DROP CONSTRAINT "videos_file_directus_files_id_fkey";--> statement-breakpoint
ALTER TABLE "videos_manufacturer" DROP CONSTRAINT "videos_manufacturer_videos_id_videos_id_fkey";--> statement-breakpoint
ALTER TABLE "videos_manufacturer" DROP CONSTRAINT "videos_manufacturer_manufacturer_id_manufacturer_id_fkey";--> statement-breakpoint
ALTER TABLE "videos_product_types" DROP CONSTRAINT "videos_product_types_videos_id_videos_id_fkey";--> statement-breakpoint
ALTER TABLE "videos_product_types" DROP CONSTRAINT "videos_product_types_product_types_id_product_types_id_fkey";--> statement-breakpoint
ALTER TABLE "videos_products" DROP CONSTRAINT "videos_products_videos_id_videos_id_fkey";--> statement-breakpoint
ALTER TABLE "videos_tags" DROP CONSTRAINT "videos_tags_videos_id_videos_id_fkey";--> statement-breakpoint
ALTER TABLE "videos_tags" DROP CONSTRAINT "videos_tags_tags_id_tags_id_fkey";--> statement-breakpoint
ALTER TABLE "auth"."webauthn_challenges" DROP CONSTRAINT "webauthn_challenges_user_id_users_id_fkey";--> statement-breakpoint
ALTER TABLE "auth"."webauthn_credentials" DROP CONSTRAINT "webauthn_credentials_user_id_users_id_fkey";--> statement-breakpoint
DROP TABLE "enovels"."abilities";--> statement-breakpoint
DROP TABLE "about_departments_articles";--> statement-breakpoint
DROP TABLE "about_departments_pages";--> statement-breakpoint
DROP TABLE "about_departments_platform";--> statement-breakpoint
DROP TABLE "address";--> statement-breakpoint
DROP TABLE "address_cart";--> statement-breakpoint
DROP TABLE "address_cities";--> statement-breakpoint
DROP TABLE "address_countries";--> statement-breakpoint
DROP TABLE "address_directus_users";--> statement-breakpoint
DROP TABLE "advertising";--> statement-breakpoint
DROP TABLE "advertising_files";--> statement-breakpoint
DROP TABLE "agreements";--> statement-breakpoint
DROP TABLE "agreements_directus_users";--> statement-breakpoint
DROP TABLE "agreements_products";--> statement-breakpoint
DROP TABLE "ai_prompts";--> statement-breakpoint
DROP TABLE "announcements";--> statement-breakpoint
DROP TABLE "applications";--> statement-breakpoint
DROP TABLE "articles";--> statement-breakpoint
DROP TABLE "articles_categories";--> statement-breakpoint
DROP TABLE "articles_comments";--> statement-breakpoint
DROP TABLE "articles_departments";--> statement-breakpoint
DROP TABLE "attributes";--> statement-breakpoint
DROP TABLE "attributes_product_types";--> statement-breakpoint
DROP TABLE "attributes_products";--> statement-breakpoint
DROP TABLE "auction_lots";--> statement-breakpoint
DROP TABLE "bids";--> statement-breakpoint
DROP TABLE "block_button";--> statement-breakpoint
DROP TABLE "block_button_group";--> statement-breakpoint
DROP TABLE "block_columns";--> statement-breakpoint
DROP TABLE "block_columns_rows";--> statement-breakpoint
DROP TABLE "block_cta";--> statement-breakpoint
DROP TABLE "block_divider";--> statement-breakpoint
DROP TABLE "block_faqs";--> statement-breakpoint
DROP TABLE "block_form";--> statement-breakpoint
DROP TABLE "block_gallery";--> statement-breakpoint
DROP TABLE "block_gallery_files";--> statement-breakpoint
DROP TABLE "block_hero";--> statement-breakpoint
DROP TABLE "block_html";--> statement-breakpoint
DROP TABLE "block_logocloud";--> statement-breakpoint
DROP TABLE "block_logocloud_logos";--> statement-breakpoint
DROP TABLE "block_quote";--> statement-breakpoint
DROP TABLE "block_richtext";--> statement-breakpoint
DROP TABLE "block_step_items";--> statement-breakpoint
DROP TABLE "block_steps";--> statement-breakpoint
DROP TABLE "block_team";--> statement-breakpoint
DROP TABLE "block_testimonial_slider_items";--> statement-breakpoint
DROP TABLE "block_testimonials";--> statement-breakpoint
DROP TABLE "block_video";--> statement-breakpoint
DROP TABLE "enovels"."blog";--> statement-breakpoint
DROP TABLE "brands";--> statement-breakpoint
DROP TABLE "brands_categories";--> statement-breakpoint
DROP TABLE "brands_departments";--> statement-breakpoint
DROP TABLE "brands_manufacturer";--> statement-breakpoint
DROP TABLE "brands_products";--> statement-breakpoint
DROP TABLE "brands_shorts";--> statement-breakpoint
DROP TABLE "storage"."buckets_analytics";--> statement-breakpoint
DROP TABLE "storage"."buckets";--> statement-breakpoint
DROP TABLE "storage"."buckets_vectors";--> statement-breakpoint
DROP TABLE "buyagain";--> statement-breakpoint
DROP TABLE "calendar";--> statement-breakpoint
DROP TABLE "calendar_comments";--> statement-breakpoint
DROP TABLE "calendar_directus_users";--> statement-breakpoint
DROP TABLE "calendar_events";--> statement-breakpoint
DROP TABLE "calendar_integrations";--> statement-breakpoint
DROP TABLE "calendar_lists";--> statement-breakpoint
DROP TABLE "careers";--> statement-breakpoint
DROP TABLE "cart";--> statement-breakpoint
DROP TABLE "cart_cart_items";--> statement-breakpoint
DROP TABLE "cart_items";--> statement-breakpoint
DROP TABLE "cart_products";--> statement-breakpoint
DROP TABLE "categories";--> statement-breakpoint
DROP TABLE "categories_departments";--> statement-breakpoint
DROP TABLE "enovels"."categories";--> statement-breakpoint
DROP TABLE "categories_postgresstores";--> statement-breakpoint
DROP TABLE "categories_shorts";--> statement-breakpoint
DROP TABLE "enovels"."categories_tags";--> statement-breakpoint
DROP TABLE "enovels"."characters_abilities";--> statement-breakpoint
DROP TABLE "enovels"."characters_characters";--> statement-breakpoint
DROP TABLE "enovels"."characters";--> statement-breakpoint
DROP TABLE "enovels"."characters_tags";--> statement-breakpoint
DROP TABLE "enovels"."characters_videos";--> statement-breakpoint
DROP TABLE "chart_entries";--> statement-breakpoint
DROP TABLE "charts";--> statement-breakpoint
DROP TABLE "charts_departments";--> statement-breakpoint
DROP TABLE "charts_products";--> statement-breakpoint
DROP TABLE "charts_radios";--> statement-breakpoint
DROP TABLE "chat";--> statement-breakpoint
DROP TABLE "circles_directus_users";--> statement-breakpoint
DROP TABLE "circles_posts";--> statement-breakpoint
DROP TABLE "circles_products";--> statement-breakpoint
DROP TABLE "cities";--> statement-breakpoint
DROP TABLE "cities_countries";--> statement-breakpoint
DROP TABLE "cities_states";--> statement-breakpoint
DROP TABLE "collections";--> statement-breakpoint
DROP TABLE "collections_brands";--> statement-breakpoint
DROP TABLE "collections_products";--> statement-breakpoint
DROP TABLE "collections_spaces";--> statement-breakpoint
DROP TABLE "colors";--> statement-breakpoint
DROP TABLE "comments";--> statement-breakpoint
DROP TABLE "comments_directus_users";--> statement-breakpoint
DROP TABLE "comments_products";--> statement-breakpoint
DROP TABLE "comments_reactions";--> statement-breakpoint
DROP TABLE "comments_shorts";--> statement-breakpoint
DROP TABLE "connections";--> statement-breakpoint
DROP TABLE "connections_directus_users";--> statement-breakpoint
DROP TABLE "contacts";--> statement-breakpoint
DROP TABLE "conversations";--> statement-breakpoint
DROP TABLE "countries";--> statement-breakpoint
DROP TABLE "countries_currency";--> statement-breakpoint
DROP TABLE "countries_timezones";--> statement-breakpoint
DROP TABLE "coupons_products";--> statement-breakpoint
DROP TABLE "credit_memos";--> statement-breakpoint
DROP TABLE "cross_sell_products";--> statement-breakpoint
DROP TABLE "cross_sell_products_products";--> statement-breakpoint
DROP TABLE "currencies_countries";--> statement-breakpoint
DROP TABLE "currency";--> statement-breakpoint
DROP TABLE "currency_departments";--> statement-breakpoint
DROP TABLE "auth"."custom_oauth_providers";--> statement-breakpoint
DROP TABLE "department_channels";--> statement-breakpoint
DROP TABLE "departments";--> statement-breakpoint
DROP TABLE "departments_categories";--> statement-breakpoint
DROP TABLE "departments_collections";--> statement-breakpoint
DROP TABLE "departments_products";--> statement-breakpoint
DROP TABLE "departments_shorts";--> statement-breakpoint
DROP TABLE "departments_showcases";--> statement-breakpoint
DROP TABLE "enovels"."dictionary";--> statement-breakpoint
DROP TABLE "digiboard";--> statement-breakpoint
DROP TABLE "digiboard_directus_users";--> statement-breakpoint
DROP TABLE "directus_access";--> statement-breakpoint
DROP TABLE "enovels"."directus_access";--> statement-breakpoint
DROP TABLE "directus_activity";--> statement-breakpoint
DROP TABLE "enovels"."directus_activity";--> statement-breakpoint
DROP TABLE "directus_collections";--> statement-breakpoint
DROP TABLE "enovels"."directus_collections";--> statement-breakpoint
DROP TABLE "directus_comments";--> statement-breakpoint
DROP TABLE "enovels"."directus_comments";--> statement-breakpoint
DROP TABLE "directus_dashboards";--> statement-breakpoint
DROP TABLE "enovels"."directus_dashboards";--> statement-breakpoint
DROP TABLE "directus_deployment_projects";--> statement-breakpoint
DROP TABLE "directus_deployment_runs";--> statement-breakpoint
DROP TABLE "directus_deployments";--> statement-breakpoint
DROP TABLE "directus_extensions";--> statement-breakpoint
DROP TABLE "enovels"."directus_extensions";--> statement-breakpoint
DROP TABLE "directus_fields";--> statement-breakpoint
DROP TABLE "enovels"."directus_fields";--> statement-breakpoint
DROP TABLE "enovels"."directus_files";--> statement-breakpoint
DROP TABLE "directus_flows";--> statement-breakpoint
DROP TABLE "enovels"."directus_flows";--> statement-breakpoint
DROP TABLE "enovels"."directus_folders";--> statement-breakpoint
DROP TABLE "directus_migrations";--> statement-breakpoint
DROP TABLE "enovels"."directus_migrations";--> statement-breakpoint
DROP TABLE "directus_notifications";--> statement-breakpoint
DROP TABLE "enovels"."directus_notifications";--> statement-breakpoint
DROP TABLE "directus_oauth_clients";--> statement-breakpoint
DROP TABLE "directus_oauth_codes";--> statement-breakpoint
DROP TABLE "directus_oauth_consents";--> statement-breakpoint
DROP TABLE "directus_oauth_tokens";--> statement-breakpoint
DROP TABLE "directus_operations";--> statement-breakpoint
DROP TABLE "enovels"."directus_operations";--> statement-breakpoint
DROP TABLE "directus_panels";--> statement-breakpoint
DROP TABLE "enovels"."directus_panels";--> statement-breakpoint
DROP TABLE "directus_permissions";--> statement-breakpoint
DROP TABLE "enovels"."directus_permissions";--> statement-breakpoint
DROP TABLE "directus_policies";--> statement-breakpoint
DROP TABLE "enovels"."directus_policies";--> statement-breakpoint
DROP TABLE "directus_presets";--> statement-breakpoint
DROP TABLE "enovels"."directus_presets";--> statement-breakpoint
DROP TABLE "directus_relations";--> statement-breakpoint
DROP TABLE "enovels"."directus_relations";--> statement-breakpoint
DROP TABLE "directus_revisions";--> statement-breakpoint
DROP TABLE "enovels"."directus_revisions";--> statement-breakpoint
DROP TABLE "enovels"."directus_roles";--> statement-breakpoint
DROP TABLE "directus_sessions";--> statement-breakpoint
DROP TABLE "enovels"."directus_sessions";--> statement-breakpoint
DROP TABLE "directus_settings";--> statement-breakpoint
DROP TABLE "directus_shares";--> statement-breakpoint
DROP TABLE "enovels"."directus_shares";--> statement-breakpoint
DROP TABLE "directus_translations";--> statement-breakpoint
DROP TABLE "enovels"."directus_translations";--> statement-breakpoint
DROP TABLE "enovels"."directus_users";--> statement-breakpoint
DROP TABLE "directus_versions";--> statement-breakpoint
DROP TABLE "enovels"."directus_versions";--> statement-breakpoint
DROP TABLE "enovels"."directus_webhooks";--> statement-breakpoint
DROP TABLE "emoji_reactions";--> statement-breakpoint
DROP TABLE "engagement_signals";--> statement-breakpoint
DROP TABLE "events";--> statement-breakpoint
DROP TABLE "events_cities";--> statement-breakpoint
DROP TABLE "events_countries";--> statement-breakpoint
DROP TABLE "events_coupons";--> statement-breakpoint
DROP TABLE "events_directus_users";--> statement-breakpoint
DROP TABLE "events_files";--> statement-breakpoint
DROP TABLE "events_invoices";--> statement-breakpoint
DROP TABLE "events_lists";--> statement-breakpoint
DROP TABLE "events_posts";--> statement-breakpoint
DROP TABLE "events_products";--> statement-breakpoint
DROP TABLE "events_states";--> statement-breakpoint
DROP TABLE "faqs";--> statement-breakpoint
DROP TABLE "faqs_directus_users";--> statement-breakpoint
DROP TABLE "faqs_files";--> statement-breakpoint
DROP TABLE "faqs_products";--> statement-breakpoint
DROP TABLE "federated_spaces";--> statement-breakpoint
DROP TABLE "federated_spaces_spaces";--> statement-breakpoint
DROP TABLE "feeds";--> statement-breakpoint
DROP TABLE "feeds_posts";--> statement-breakpoint
DROP TABLE "finance_index";--> statement-breakpoint
DROP TABLE "finance_index_articles";--> statement-breakpoint
DROP TABLE "finance_index_currency";--> statement-breakpoint
DROP TABLE "finance_index_region";--> statement-breakpoint
DROP TABLE "auth"."flow_state";--> statement-breakpoint
DROP TABLE "followers";--> statement-breakpoint
DROP TABLE "forms";--> statement-breakpoint
DROP TABLE "friend_requests";--> statement-breakpoint
DROP TABLE "friend_requests_address";--> statement-breakpoint
DROP TABLE "friend_requests_profiles";--> statement-breakpoint
DROP TABLE "friend_suggestions";--> statement-breakpoint
DROP TABLE "friend_suggestions_profiles";--> statement-breakpoint
DROP TABLE "gamification";--> statement-breakpoint
DROP TABLE "gamification_directus_users";--> statement-breakpoint
DROP TABLE "gamification_events";--> statement-breakpoint
DROP TABLE "gamification_notifications";--> statement-breakpoint
DROP TABLE "gamification_products";--> statement-breakpoint
DROP TABLE "gamification_videos";--> statement-breakpoint
DROP TABLE "geo_regions";--> statement-breakpoint
DROP TABLE "geo_regions_cities";--> statement-breakpoint
DROP TABLE "geo_regions_countries";--> statement-breakpoint
DROP TABLE "geo_regions_states";--> statement-breakpoint
DROP TABLE "globals";--> statement-breakpoint
DROP TABLE "hdb_catalog"."hdb_action_log";--> statement-breakpoint
DROP TABLE "hdb_catalog"."hdb_cron_event_invocation_logs";--> statement-breakpoint
DROP TABLE "hdb_catalog"."hdb_cron_events";--> statement-breakpoint
DROP TABLE "hdb_catalog"."hdb_metadata";--> statement-breakpoint
DROP TABLE "hdb_catalog"."hdb_scheduled_event_invocation_logs";--> statement-breakpoint
DROP TABLE "hdb_catalog"."hdb_scheduled_events";--> statement-breakpoint
DROP TABLE "hdb_catalog"."hdb_schema_notifications";--> statement-breakpoint
DROP TABLE "hdb_catalog"."hdb_version";--> statement-breakpoint
DROP TABLE "help_articles";--> statement-breakpoint
DROP TABLE "help_collections";--> statement-breakpoint
DROP TABLE "help_feedback";--> statement-breakpoint
DROP TABLE "supabase_functions"."hooks";--> statement-breakpoint
DROP TABLE "net"."http_request_queue";--> statement-breakpoint
DROP TABLE "net"."_http_response";--> statement-breakpoint
DROP TABLE "auth"."identities";--> statement-breakpoint
DROP TABLE "inbox";--> statement-breakpoint
DROP TABLE "incentives";--> statement-breakpoint
DROP TABLE "incentives_currency";--> statement-breakpoint
DROP TABLE "incentives_orders";--> statement-breakpoint
DROP TABLE "incentives_products";--> statement-breakpoint
DROP TABLE "auth"."instances";--> statement-breakpoint
DROP TABLE "integrations";--> statement-breakpoint
DROP TABLE "integrations_attributes";--> statement-breakpoint
DROP TABLE "integrations_categories";--> statement-breakpoint
DROP TABLE "integrations_departments";--> statement-breakpoint
DROP TABLE "integrations_files";--> statement-breakpoint
DROP TABLE "integrations_platform";--> statement-breakpoint
DROP TABLE "integrations_product_types";--> statement-breakpoint
DROP TABLE "integrations_ratings";--> statement-breakpoint
DROP TABLE "integrations_report";--> statement-breakpoint
DROP TABLE "integrations_spaces";--> statement-breakpoint
DROP TABLE "integrations_tags";--> statement-breakpoint
DROP TABLE "inventory_lots";--> statement-breakpoint
DROP TABLE "invoices";--> statement-breakpoint
DROP TABLE "invoices_address";--> statement-breakpoint
DROP TABLE "invoices_orders";--> statement-breakpoint
DROP TABLE "invoices_shipping_address";--> statement-breakpoint
DROP TABLE "invoices_transactions";--> statement-breakpoint
DROP TABLE "enovels"."items_abilities";--> statement-breakpoint
DROP TABLE "enovels"."items_characters";--> statement-breakpoint
DROP TABLE "enovels"."items";--> statement-breakpoint
DROP TABLE "enovels"."items_videos";--> statement-breakpoint
DROP TABLE "pgsodium"."key";--> statement-breakpoint
DROP TABLE "enovels"."levels_characters";--> statement-breakpoint
DROP TABLE "enovels"."levels";--> statement-breakpoint
DROP TABLE "list_items";--> statement-breakpoint
DROP TABLE "list_items_directus_users";--> statement-breakpoint
DROP TABLE "list_items_products";--> statement-breakpoint
DROP TABLE "list_products";--> statement-breakpoint
DROP TABLE "list_products_lists";--> statement-breakpoint
DROP TABLE "lists";--> statement-breakpoint
DROP TABLE "lists_categories";--> statement-breakpoint
DROP TABLE "lists_departments";--> statement-breakpoint
DROP TABLE "lists_directus_users";--> statement-breakpoint
DROP TABLE "lists_files";--> statement-breakpoint
DROP TABLE "lists_products";--> statement-breakpoint
DROP TABLE "lists_shorts";--> statement-breakpoint
DROP TABLE "lists_template";--> statement-breakpoint
DROP TABLE "lists_template_directus_users";--> statement-breakpoint
DROP TABLE "lists_template_list_items";--> statement-breakpoint
DROP TABLE "lists_template_tags";--> statement-breakpoint
DROP TABLE "lists_templates";--> statement-breakpoint
DROP TABLE "lists_type";--> statement-breakpoint
DROP TABLE "lists_type_categories";--> statement-breakpoint
DROP TABLE "lists_type_lists";--> statement-breakpoint
DROP TABLE "manufacturer";--> statement-breakpoint
DROP TABLE "manufacturer_countries";--> statement-breakpoint
DROP TABLE "media";--> statement-breakpoint
DROP TABLE "media_files";--> statement-breakpoint
DROP TABLE "media_folders";--> statement-breakpoint
DROP TABLE "media_folders_directus_users";--> statement-breakpoint
DROP TABLE "meeovistores";--> statement-breakpoint
DROP TABLE "meilisearch_settings";--> statement-breakpoint
DROP TABLE "member_groups_events";--> statement-breakpoint
DROP TABLE "member_groups_polls";--> statement-breakpoint
DROP TABLE "member_groups_posts";--> statement-breakpoint
DROP TABLE "member_groups_products";--> statement-breakpoint
DROP TABLE "member_groups_space_members";--> statement-breakpoint
DROP TABLE "merch_recipes";--> statement-breakpoint
DROP TABLE "messages";--> statement-breakpoint
DROP TABLE "realtime"."messages_2025_02_07";--> statement-breakpoint
DROP TABLE "realtime"."messages_2025_02_08";--> statement-breakpoint
DROP TABLE "realtime"."messages_2025_02_09";--> statement-breakpoint
DROP TABLE "realtime"."messages_2025_02_10";--> statement-breakpoint
DROP TABLE "realtime"."messages_2025_02_11";--> statement-breakpoint
DROP TABLE "realtime"."messages";--> statement-breakpoint
DROP TABLE "pgmq"."meta";--> statement-breakpoint
DROP TABLE "auth"."mfa_amr_claims";--> statement-breakpoint
DROP TABLE "auth"."mfa_challenges";--> statement-breakpoint
DROP TABLE "auth"."mfa_factors";--> statement-breakpoint
DROP TABLE "meevendure"."migrations";--> statement-breakpoint
DROP TABLE "storage"."migrations";--> statement-breakpoint
DROP TABLE "supabase_functions"."migrations";--> statement-breakpoint
DROP TABLE "moments";--> statement-breakpoint
DROP TABLE "moments_products";--> statement-breakpoint
DROP TABLE "moments_spaces";--> statement-breakpoint
DROP TABLE "musicchart";--> statement-breakpoint
DROP TABLE "musicchart_departments";--> statement-breakpoint
DROP TABLE "navigation";--> statement-breakpoint
DROP TABLE "enovels"."navigation";--> statement-breakpoint
DROP TABLE "navigation_pages";--> statement-breakpoint
DROP TABLE "navigation_websites";--> statement-breakpoint
DROP TABLE "newsletters";--> statement-breakpoint
DROP TABLE "notifications";--> statement-breakpoint
DROP TABLE "auth"."oauth_authorizations";--> statement-breakpoint
DROP TABLE "auth"."oauth_client_states";--> statement-breakpoint
DROP TABLE "auth"."oauth_consents";--> statement-breakpoint
DROP TABLE "storage"."objects";--> statement-breakpoint
DROP TABLE "auth"."one_time_tokens";--> statement-breakpoint
DROP TABLE "order_items";--> statement-breakpoint
DROP TABLE "order_items_orders";--> statement-breakpoint
DROP TABLE "order_items_products";--> statement-breakpoint
DROP TABLE "orders";--> statement-breakpoint
DROP TABLE "orders_products";--> statement-breakpoint
DROP TABLE "organization_addresses";--> statement-breakpoint
DROP TABLE "organization_members";--> statement-breakpoint
DROP TABLE "organizations_contacts";--> statement-breakpoint
DROP TABLE "os_activities";--> statement-breakpoint
DROP TABLE "os_activity_contacts";--> statement-breakpoint
DROP TABLE "os_deal_contacts";--> statement-breakpoint
DROP TABLE "os_deal_stages";--> statement-breakpoint
DROP TABLE "os_deals";--> statement-breakpoint
DROP TABLE "os_email_templates";--> statement-breakpoint
DROP TABLE "os_expenses";--> statement-breakpoint
DROP TABLE "os_invoice_items";--> statement-breakpoint
DROP TABLE "os_invoices";--> statement-breakpoint
DROP TABLE "os_items";--> statement-breakpoint
DROP TABLE "os_payments";--> statement-breakpoint
DROP TABLE "os_project_contacts";--> statement-breakpoint
DROP TABLE "os_project_templates";--> statement-breakpoint
DROP TABLE "os_project_updates";--> statement-breakpoint
DROP TABLE "os_projects";--> statement-breakpoint
DROP TABLE "os_proposal_approvals";--> statement-breakpoint
DROP TABLE "os_proposal_blocks";--> statement-breakpoint
DROP TABLE "os_proposal_contacts";--> statement-breakpoint
DROP TABLE "os_proposals";--> statement-breakpoint
DROP TABLE "os_settings";--> statement-breakpoint
DROP TABLE "os_task_files";--> statement-breakpoint
DROP TABLE "os_tasks";--> statement-breakpoint
DROP TABLE "os_tax_rates";--> statement-breakpoint
DROP TABLE "outlets";--> statement-breakpoint
DROP TABLE "outlets_categories";--> statement-breakpoint
DROP TABLE "outlets_shorts";--> statement-breakpoint
DROP TABLE "page_blocks";--> statement-breakpoint
DROP TABLE "page_blocks_files";--> statement-breakpoint
DROP TABLE "pages";--> statement-breakpoint
DROP TABLE "pages_blog";--> statement-breakpoint
DROP TABLE "enovels"."pages";--> statement-breakpoint
DROP TABLE "pages_projects";--> statement-breakpoint
DROP TABLE "payments";--> statement-breakpoint
DROP TABLE "payments_countries";--> statement-breakpoint
DROP TABLE "payments_currency";--> statement-breakpoint
DROP TABLE "payments_directus_users";--> statement-breakpoint
DROP TABLE "payments_orders";--> statement-breakpoint
DROP TABLE "pickup_locations";--> statement-breakpoint
DROP TABLE "pickup_locations_city";--> statement-breakpoint
DROP TABLE "pickup_locations_country";--> statement-breakpoint
DROP TABLE "pickup_locations_state";--> statement-breakpoint
DROP TABLE "enovels"."places_characters";--> statement-breakpoint
DROP TABLE "enovels"."places";--> statement-breakpoint
DROP TABLE "enovels"."places_items";--> statement-breakpoint
DROP TABLE "platform";--> statement-breakpoint
DROP TABLE "platform_articles";--> statement-breakpoint
DROP TABLE "platform_categories";--> statement-breakpoint
DROP TABLE "platform_lists";--> statement-breakpoint
DROP TABLE "platform_navigation";--> statement-breakpoint
DROP TABLE "platform_page_blocks";--> statement-breakpoint
DROP TABLE "platform_pages";--> statement-breakpoint
DROP TABLE "platform_products";--> statement-breakpoint
DROP TABLE "polls";--> statement-breakpoint
DROP TABLE "polls_spaces";--> statement-breakpoint
DROP TABLE "post_gallery_items";--> statement-breakpoint
DROP TABLE "postgresstores";--> statement-breakpoint
DROP TABLE "postgresstores_collections";--> statement-breakpoint
DROP TABLE "postgresstores_products";--> statement-breakpoint
DROP TABLE "postgresstores_websites";--> statement-breakpoint
DROP TABLE "posts";--> statement-breakpoint
DROP TABLE "posts_departments";--> statement-breakpoint
DROP TABLE "posts_polls";--> statement-breakpoint
DROP TABLE "product_attributes";--> statement-breakpoint
DROP TABLE "product_types";--> statement-breakpoint
DROP TABLE "product_types_products";--> statement-breakpoint
DROP TABLE "products_attributes";--> statement-breakpoint
DROP TABLE "products_categories";--> statement-breakpoint
DROP TABLE "products_countries";--> statement-breakpoint
DROP TABLE "products_currency";--> statement-breakpoint
DROP TABLE "products_departments";--> statement-breakpoint
DROP TABLE "products_directus_users";--> statement-breakpoint
DROP TABLE "products_manufacturer";--> statement-breakpoint
DROP TABLE "products_product_designer";--> statement-breakpoint
DROP TABLE "products_spaces";--> statement-breakpoint
DROP TABLE "products_tags";--> statement-breakpoint
DROP TABLE "products_websites";--> statement-breakpoint
DROP TABLE "profiles";--> statement-breakpoint
DROP TABLE "profiles_cities";--> statement-breakpoint
DROP TABLE "profiles_countries";--> statement-breakpoint
DROP TABLE "profiles_followers";--> statement-breakpoint
DROP TABLE "profiles_states";--> statement-breakpoint
DROP TABLE "project_board";--> statement-breakpoint
DROP TABLE "project_board_comments";--> statement-breakpoint
DROP TABLE "project_board_directus_users";--> statement-breakpoint
DROP TABLE "project_board_files";--> statement-breakpoint
DROP TABLE "project_board_projects";--> statement-breakpoint
DROP TABLE "project_timeline";--> statement-breakpoint
DROP TABLE "projects";--> statement-breakpoint
DROP TABLE "projects_calendar";--> statement-breakpoint
DROP TABLE "projects_comments";--> statement-breakpoint
DROP TABLE "projects_directus_users";--> statement-breakpoint
DROP TABLE "projects_files";--> statement-breakpoint
DROP TABLE "projects_integrations";--> statement-breakpoint
DROP TABLE "projects_lists";--> statement-breakpoint
DROP TABLE "projects_products";--> statement-breakpoint
DROP TABLE "projects_project_timeline";--> statement-breakpoint
DROP TABLE "projects_region";--> statement-breakpoint
DROP TABLE "radios";--> statement-breakpoint
DROP TABLE "radios_categories";--> statement-breakpoint
DROP TABLE "radios_departments";--> statement-breakpoint
DROP TABLE "radios_musicchart";--> statement-breakpoint
DROP TABLE "ratings";--> statement-breakpoint
DROP TABLE "ratings_products";--> statement-breakpoint
DROP TABLE "reactions";--> statement-breakpoint
DROP TABLE "reactions_comments";--> statement-breakpoint
DROP TABLE "reactions_directus_users";--> statement-breakpoint
DROP TABLE "reactions_lists";--> statement-breakpoint
DROP TABLE "reactions_posts";--> statement-breakpoint
DROP TABLE "reactions_shorts";--> statement-breakpoint
DROP TABLE "redirects";--> statement-breakpoint
DROP TABLE "auth"."refresh_tokens";--> statement-breakpoint
DROP TABLE "region";--> statement-breakpoint
DROP TABLE "region_address";--> statement-breakpoint
DROP TABLE "region_countries";--> statement-breakpoint
DROP TABLE "region_shipping_address";--> statement-breakpoint
DROP TABLE "related_products";--> statement-breakpoint
DROP TABLE "related_products_products";--> statement-breakpoint
DROP TABLE "report";--> statement-breakpoint
DROP TABLE "report_comments";--> statement-breakpoint
DROP TABLE "report_directus_users";--> statement-breakpoint
DROP TABLE "report_faqs";--> statement-breakpoint
DROP TABLE "report_posts";--> statement-breakpoint
DROP TABLE "report_products";--> statement-breakpoint
DROP TABLE "report_spaces";--> statement-breakpoint
DROP TABLE "returns";--> statement-breakpoint
DROP TABLE "returns_orders";--> statement-breakpoint
DROP TABLE "returns_products";--> statement-breakpoint
DROP TABLE "reviews_products";--> statement-breakpoint
DROP TABLE "storage"."s3_multipart_uploads";--> statement-breakpoint
DROP TABLE "storage"."s3_multipart_uploads_parts";--> statement-breakpoint
DROP TABLE "auth"."saml_providers";--> statement-breakpoint
DROP TABLE "auth"."saml_relay_states";--> statement-breakpoint
DROP TABLE "auth"."schema_migrations";--> statement-breakpoint
DROP TABLE "realtime"."schema_migrations";--> statement-breakpoint
DROP TABLE "seasons";--> statement-breakpoint
DROP TABLE "seasons_videos";--> statement-breakpoint
DROP TABLE "vault"."secrets";--> statement-breakpoint
DROP TABLE "seo";--> statement-breakpoint
DROP TABLE "auth"."sessions";--> statement-breakpoint
DROP TABLE "shipment";--> statement-breakpoint
DROP TABLE "shipment_address";--> statement-breakpoint
DROP TABLE "shipment_comments";--> statement-breakpoint
DROP TABLE "shipment_products";--> statement-breakpoint
DROP TABLE "shipment_tracking";--> statement-breakpoint
DROP TABLE "shipping_address";--> statement-breakpoint
DROP TABLE "shipping_addresses";--> statement-breakpoint
DROP TABLE "shipping_addresses_cities";--> statement-breakpoint
DROP TABLE "shipping_addresses_countries";--> statement-breakpoint
DROP TABLE "shipping_addresses_directus_users";--> statement-breakpoint
DROP TABLE "shipping_addresses_orders";--> statement-breakpoint
DROP TABLE "shipping_addresses_states";--> statement-breakpoint
DROP TABLE "shop_type";--> statement-breakpoint
DROP TABLE "shop_type_shops";--> statement-breakpoint
DROP TABLE "shops";--> statement-breakpoint
DROP TABLE "shops_agreements";--> statement-breakpoint
DROP TABLE "shops_categories";--> statement-breakpoint
DROP TABLE "shops_comments";--> statement-breakpoint
DROP TABLE "shops_countries";--> statement-breakpoint
DROP TABLE "shops_departments";--> statement-breakpoint
DROP TABLE "shops_directus_users";--> statement-breakpoint
DROP TABLE "shops_files";--> statement-breakpoint
DROP TABLE "shops_products";--> statement-breakpoint
DROP TABLE "shops_showcases";--> statement-breakpoint
DROP TABLE "shorts";--> statement-breakpoint
DROP TABLE "shorts_directus_users";--> statement-breakpoint
DROP TABLE "shorts_files";--> statement-breakpoint
DROP TABLE "shorts_products";--> statement-breakpoint
DROP TABLE "shorts_spaces";--> statement-breakpoint
DROP TABLE "showcases";--> statement-breakpoint
DROP TABLE "showcases_products";--> statement-breakpoint
DROP TABLE "showcases_shops";--> statement-breakpoint
DROP TABLE "showcases_spaces";--> statement-breakpoint
DROP TABLE "site_preference_categories";--> statement-breakpoint
DROP TABLE "site_preference_countries";--> statement-breakpoint
DROP TABLE "site_preference_departments";--> statement-breakpoint
DROP TABLE "site_preference_products";--> statement-breakpoint
DROP TABLE "social_connections";--> statement-breakpoint
DROP TABLE "Space";--> statement-breakpoint
DROP TABLE "Space_products";--> statement-breakpoint
DROP TABLE "space_types";--> statement-breakpoint
DROP TABLE "spaces";--> statement-breakpoint
DROP TABLE "spaces_articles";--> statement-breakpoint
DROP TABLE "spaces_cities";--> statement-breakpoint
DROP TABLE "spaces_countries";--> statement-breakpoint
DROP TABLE "spaces_departments";--> statement-breakpoint
DROP TABLE "spaces_directus_users";--> statement-breakpoint
DROP TABLE "spaces_files";--> statement-breakpoint
DROP TABLE "spaces_lists";--> statement-breakpoint
DROP TABLE "spaces_live_rooms";--> statement-breakpoint
DROP TABLE "spaces_meta_Space";--> statement-breakpoint
DROP TABLE "spaces_pages";--> statement-breakpoint
DROP TABLE "spaces_posts";--> statement-breakpoint
DROP TABLE "spaces_shop_type";--> statement-breakpoint
DROP TABLE "spaces_space_types";--> statement-breakpoint
DROP TABLE "spaces_states";--> statement-breakpoint
DROP TABLE "spaces_tags";--> statement-breakpoint
DROP TABLE "spaces_templates";--> statement-breakpoint
DROP TABLE "auth"."sso_domains";--> statement-breakpoint
DROP TABLE "auth"."sso_providers";--> statement-breakpoint
DROP TABLE "states";--> statement-breakpoint
DROP TABLE "states_cities";--> statement-breakpoint
DROP TABLE "states_countries";--> statement-breakpoint
DROP TABLE "enovels"."stories_characters";--> statement-breakpoint
DROP TABLE "enovels"."stories";--> statement-breakpoint
DROP TABLE "enovels"."stories_tags";--> statement-breakpoint
DROP TABLE "streams";--> statement-breakpoint
DROP TABLE "streams_ratings";--> statement-breakpoint
DROP TABLE "realtime"."subscription";--> statement-breakpoint
DROP TABLE "subscriptions_directus_users";--> statement-breakpoint
DROP TABLE "subscriptions_products";--> statement-breakpoint
DROP TABLE "tags";--> statement-breakpoint
DROP TABLE "tags_articles";--> statement-breakpoint
DROP TABLE "tags_categories";--> statement-breakpoint
DROP TABLE "tags_departments";--> statement-breakpoint
DROP TABLE "enovels"."tags";--> statement-breakpoint
DROP TABLE "tags_posts";--> statement-breakpoint
DROP TABLE "tags_products";--> statement-breakpoint
DROP TABLE "tags_shorts";--> statement-breakpoint
DROP TABLE "enovels"."tags_videos";--> statement-breakpoint
DROP TABLE "taxes";--> statement-breakpoint
DROP TABLE "taxes_countries";--> statement-breakpoint
DROP TABLE "taxes_states";--> statement-breakpoint
DROP TABLE "team";--> statement-breakpoint
DROP TABLE "templates";--> statement-breakpoint
DROP TABLE "templates_space_types";--> statement-breakpoint
DROP TABLE "testimonials";--> statement-breakpoint
DROP TABLE "timezones";--> statement-breakpoint
DROP TABLE "transactions";--> statement-breakpoint
DROP TABLE "transactions_currency";--> statement-breakpoint
DROP TABLE "translations";--> statement-breakpoint
DROP TABLE "translations_postgresstores";--> statement-breakpoint
DROP TABLE "enovels"."types_characters";--> statement-breakpoint
DROP TABLE "enovels"."types";--> statement-breakpoint
DROP TABLE "user_content_interaction";--> statement-breakpoint
DROP TABLE "user_friends";--> statement-breakpoint
DROP TABLE "user_friends_posts";--> statement-breakpoint
DROP TABLE "user_profile";--> statement-breakpoint
DROP TABLE "auth"."users";--> statement-breakpoint
DROP TABLE "variants";--> statement-breakpoint
DROP TABLE "storage"."vector_indexes";--> statement-breakpoint
DROP TABLE "vibez_clips";--> statement-breakpoint
DROP TABLE "vibez_product_map";--> statement-breakpoint
DROP TABLE "videos";--> statement-breakpoint
DROP TABLE "videos_categories";--> statement-breakpoint
DROP TABLE "videos_comments";--> statement-breakpoint
DROP TABLE "videos_departments";--> statement-breakpoint
DROP TABLE "enovels"."videos";--> statement-breakpoint
DROP TABLE "videos_manufacturer";--> statement-breakpoint
DROP TABLE "videos_product_types";--> statement-breakpoint
DROP TABLE "videos_products";--> statement-breakpoint
DROP TABLE "videos_tags";--> statement-breakpoint
DROP TABLE "auth"."webauthn_challenges";--> statement-breakpoint
DROP TABLE "auth"."webauthn_credentials";--> statement-breakpoint
DROP TABLE "websites";--> statement-breakpoint
DROP TABLE "extensions"."wrappers_fdw_stats";--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "coordinates" varchar(255);--> statement-breakpoint
DROP INDEX "auth"."oauth_clients_deleted_at_idx";--> statement-breakpoint
CREATE INDEX "oauth_clients_deleted_at_idx" ON "auth"."oauth_clients" ("deleted_at" NULLS FIRST);--> statement-breakpoint
DROP TYPE "realtime"."action";--> statement-breakpoint
DROP TYPE "storage"."buckettype";--> statement-breakpoint
DROP TYPE "auth"."code_challenge_method";--> statement-breakpoint
DROP TYPE "color_source";--> statement-breakpoint
DROP TYPE "realtime"."equality_op";--> statement-breakpoint
DROP TYPE "auth"."factor_status";--> statement-breakpoint
DROP TYPE "auth"."factor_type";--> statement-breakpoint
DROP TYPE "pgsodium"."key_status";--> statement-breakpoint
DROP TYPE "pgsodium"."key_type";--> statement-breakpoint
DROP TYPE "auth"."oauth_authorization_status";--> statement-breakpoint
DROP TYPE "auth"."oauth_response_type";--> statement-breakpoint
DROP TYPE "auth"."one_time_token_type";--> statement-breakpoint
DROP TYPE "net"."request_status";--> statement-breakpoint
DROP SEQUENCE "enovels"."directus_settings_id_seq";--> statement-breakpoint
DROP SEQUENCE "meeovi"."directus_settings_id_seq";--> statement-breakpoint
DROP SCHEMA "collaborrate";
--> statement-breakpoint
DROP SCHEMA "creativesuite";
--> statement-breakpoint
DROP SCHEMA "enovels";
--> statement-breakpoint
DROP SCHEMA "extensions";
--> statement-breakpoint
DROP SCHEMA "graphql";
--> statement-breakpoint
DROP SCHEMA "graphql_public";
--> statement-breakpoint
DROP SCHEMA "hdb_catalog";
--> statement-breakpoint
DROP SCHEMA "meeovi";
--> statement-breakpoint
DROP SCHEMA "meevendure";
--> statement-breakpoint
DROP SCHEMA "net";
--> statement-breakpoint
DROP SCHEMA "pgbouncer";
--> statement-breakpoint
DROP SCHEMA "pgmq";
--> statement-breakpoint
DROP SCHEMA "pgsodium";
--> statement-breakpoint
DROP SCHEMA "pgsodium_masks";
--> statement-breakpoint
DROP SCHEMA "pixanomy";
--> statement-breakpoint
DROP SCHEMA "realtime";
--> statement-breakpoint
DROP SCHEMA "storage";
--> statement-breakpoint
DROP SCHEMA "supabase_functions";
--> statement-breakpoint
DROP SCHEMA "vault";
