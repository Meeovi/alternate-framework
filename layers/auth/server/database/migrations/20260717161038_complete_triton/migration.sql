DROP VIEW "pgsodium"."masking_rule";--> statement-breakpoint
DROP VIEW "vault"."decrypted_secrets";--> statement-breakpoint
ALTER TABLE "about_departments_articles" DROP CONSTRAINT "about_departments_articles_articles_id_foreign";--> statement-breakpoint
ALTER TABLE "about_departments_pages" DROP CONSTRAINT "about_departments_pages_pages_id_foreign";--> statement-breakpoint
ALTER TABLE "about_departments_platform" DROP CONSTRAINT "about_departments_platform_platform_id_foreign";--> statement-breakpoint
ALTER TABLE "address_cart" DROP CONSTRAINT "address_cart_address_id_foreign";--> statement-breakpoint
ALTER TABLE "address_cart" DROP CONSTRAINT "address_cart_cart_id_foreign";--> statement-breakpoint
ALTER TABLE "address_cities" DROP CONSTRAINT "address_cities_address_id_foreign";--> statement-breakpoint
ALTER TABLE "address_cities" DROP CONSTRAINT "address_cities_cities_id_foreign";--> statement-breakpoint
ALTER TABLE "address_countries" DROP CONSTRAINT "address_countries_address_id_foreign";--> statement-breakpoint
ALTER TABLE "address_countries" DROP CONSTRAINT "address_countries_countries_id_foreign";--> statement-breakpoint
ALTER TABLE "address_directus_users" DROP CONSTRAINT "address_directus_users_address_id_foreign";--> statement-breakpoint
ALTER TABLE "agreements_products" DROP CONSTRAINT "agreements_products_products_id_foreign";--> statement-breakpoint
ALTER TABLE "ai_prompts" DROP CONSTRAINT "ai_prompts_user_created_foreign";--> statement-breakpoint
ALTER TABLE "ai_prompts" DROP CONSTRAINT "ai_prompts_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "announcements" DROP CONSTRAINT "announcements_image_foreign";--> statement-breakpoint
ALTER TABLE "announcements" DROP CONSTRAINT "announcements_user_created_foreign";--> statement-breakpoint
ALTER TABLE "announcements" DROP CONSTRAINT "announcements_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "articles" DROP CONSTRAINT "articles_author_foreign";--> statement-breakpoint
ALTER TABLE "articles_categories" DROP CONSTRAINT "articles_categories_articles_id_foreign";--> statement-breakpoint
ALTER TABLE "articles_categories" DROP CONSTRAINT "articles_categories_categories_id_foreign";--> statement-breakpoint
ALTER TABLE "articles_comments" DROP CONSTRAINT "articles_comments_articles_id_foreign";--> statement-breakpoint
ALTER TABLE "articles_comments" DROP CONSTRAINT "articles_comments_comments_id_foreign";--> statement-breakpoint
ALTER TABLE "articles_departments" DROP CONSTRAINT "articles_departments_articles_id_foreign";--> statement-breakpoint
ALTER TABLE "articles_departments" DROP CONSTRAINT "articles_departments_departments_id_foreign";--> statement-breakpoint
ALTER TABLE "attributes_product_types" DROP CONSTRAINT "attributes_product_types_attributes_id_foreign";--> statement-breakpoint
ALTER TABLE "attributes_product_types" DROP CONSTRAINT "attributes_product_types_product_types_id_foreign";--> statement-breakpoint
ALTER TABLE "attributes_products" DROP CONSTRAINT "attributes_products_attributes_id_foreign";--> statement-breakpoint
ALTER TABLE "attributes_products" DROP CONSTRAINT "attributes_products_products_id_foreign";--> statement-breakpoint
ALTER TABLE "auction_lots" DROP CONSTRAINT "auction_lots_product_id_fkey";--> statement-breakpoint
ALTER TABLE "bids" DROP CONSTRAINT "bids_lot_id_fkey";--> statement-breakpoint
ALTER TABLE "block_button" DROP CONSTRAINT "block_button_button_group_foreign";--> statement-breakpoint
ALTER TABLE "block_button" DROP CONSTRAINT "block_button_user_created_foreign";--> statement-breakpoint
ALTER TABLE "block_button" DROP CONSTRAINT "block_button_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "block_button_group" DROP CONSTRAINT "block_button_group_user_created_foreign";--> statement-breakpoint
ALTER TABLE "block_button_group" DROP CONSTRAINT "block_button_group_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "block_columns_rows" DROP CONSTRAINT "block_columns_rows_block_columns_foreign";--> statement-breakpoint
ALTER TABLE "block_columns_rows" DROP CONSTRAINT "block_columns_rows_button_group_foreign";--> statement-breakpoint
ALTER TABLE "block_columns_rows" DROP CONSTRAINT "block_columns_rows_image_foreign";--> statement-breakpoint
ALTER TABLE "block_columns_rows" DROP CONSTRAINT "block_columns_rows_user_created_foreign";--> statement-breakpoint
ALTER TABLE "block_columns_rows" DROP CONSTRAINT "block_columns_rows_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "block_cta" DROP CONSTRAINT "block_cta_button_group_foreign";--> statement-breakpoint
ALTER TABLE "block_form" DROP CONSTRAINT "block_form_form_foreign";--> statement-breakpoint
ALTER TABLE "block_gallery_files" DROP CONSTRAINT "block_gallery_files_block_gallery_id_foreign";--> statement-breakpoint
ALTER TABLE "block_gallery_files" DROP CONSTRAINT "block_gallery_files_directus_files_id_foreign";--> statement-breakpoint
ALTER TABLE "block_gallery_files" DROP CONSTRAINT "block_gallery_files_user_created_foreign";--> statement-breakpoint
ALTER TABLE "block_gallery_files" DROP CONSTRAINT "block_gallery_files_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "block_hero" DROP CONSTRAINT "block_hero_button_group_foreign";--> statement-breakpoint
ALTER TABLE "block_hero" DROP CONSTRAINT "block_hero_image_foreign";--> statement-breakpoint
ALTER TABLE "block_logocloud_logos" DROP CONSTRAINT "block_logocloud_logos_block_logocloud_id_foreign";--> statement-breakpoint
ALTER TABLE "block_logocloud_logos" DROP CONSTRAINT "block_logocloud_logos_directus_files_id_foreign";--> statement-breakpoint
ALTER TABLE "block_step_items" DROP CONSTRAINT "block_step_items_block_steps_foreign";--> statement-breakpoint
ALTER TABLE "block_step_items" DROP CONSTRAINT "block_step_items_button_group_foreign";--> statement-breakpoint
ALTER TABLE "block_step_items" DROP CONSTRAINT "block_step_items_image_foreign";--> statement-breakpoint
ALTER TABLE "block_testimonial_slider_items" DROP CONSTRAINT "block_testimonial_slider_items_block_testi__4af36ccf_foreign";--> statement-breakpoint
ALTER TABLE "block_testimonial_slider_items" DROP CONSTRAINT "block_testimonial_slider_items_testimonials_id_foreign";--> statement-breakpoint
ALTER TABLE "block_testimonial_slider_items" DROP CONSTRAINT "block_testimonial_slider_items_user_created_foreign";--> statement-breakpoint
ALTER TABLE "block_testimonial_slider_items" DROP CONSTRAINT "block_testimonial_slider_items_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "block_video" DROP CONSTRAINT "block_video_video_file_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."blog" DROP CONSTRAINT "blog_file_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."blog" DROP CONSTRAINT "blog_image_foreign";--> statement-breakpoint
ALTER TABLE "brands" DROP CONSTRAINT "brands_image_foreign";--> statement-breakpoint
ALTER TABLE "brands_categories" DROP CONSTRAINT "brands_categories_brands_id_foreign";--> statement-breakpoint
ALTER TABLE "brands_categories" DROP CONSTRAINT "brands_categories_categories_id_foreign";--> statement-breakpoint
ALTER TABLE "brands_departments" DROP CONSTRAINT "brands_departments_brands_id_foreign";--> statement-breakpoint
ALTER TABLE "brands_departments" DROP CONSTRAINT "brands_departments_departments_id_foreign";--> statement-breakpoint
ALTER TABLE "brands_manufacturer" DROP CONSTRAINT "brands_manufacturer_brands_id_foreign";--> statement-breakpoint
ALTER TABLE "brands_manufacturer" DROP CONSTRAINT "brands_manufacturer_manufacturer_id_foreign";--> statement-breakpoint
ALTER TABLE "brands_products" DROP CONSTRAINT "brands_products_brands_id_foreign";--> statement-breakpoint
ALTER TABLE "brands_products" DROP CONSTRAINT "brands_products_products_id_foreign";--> statement-breakpoint
ALTER TABLE "brands_shorts" DROP CONSTRAINT "brands_shorts_brands_id_foreign";--> statement-breakpoint
ALTER TABLE "brands_shorts" DROP CONSTRAINT "brands_shorts_shorts_id_foreign";--> statement-breakpoint
ALTER TABLE "calendar" DROP CONSTRAINT "calendar_image_foreign";--> statement-breakpoint
ALTER TABLE "calendar_comments" DROP CONSTRAINT "calendar_comments_calendar_id_foreign";--> statement-breakpoint
ALTER TABLE "calendar_comments" DROP CONSTRAINT "calendar_comments_comments_id_foreign";--> statement-breakpoint
ALTER TABLE "calendar_directus_users" DROP CONSTRAINT "calendar_directus_users_calendar_id_foreign";--> statement-breakpoint
ALTER TABLE "calendar_directus_users" DROP CONSTRAINT "calendar_directus_users_directus_users_id_foreign";--> statement-breakpoint
ALTER TABLE "calendar_events" DROP CONSTRAINT "calendar_events_calendar_id_foreign";--> statement-breakpoint
ALTER TABLE "calendar_events" DROP CONSTRAINT "calendar_events_events_id_foreign";--> statement-breakpoint
ALTER TABLE "calendar_integrations" DROP CONSTRAINT "calendar_integrations_calendar_id_foreign";--> statement-breakpoint
ALTER TABLE "calendar_integrations" DROP CONSTRAINT "calendar_integrations_integrations_id_foreign";--> statement-breakpoint
ALTER TABLE "calendar_lists" DROP CONSTRAINT "calendar_lists_calendar_id_foreign";--> statement-breakpoint
ALTER TABLE "calendar_lists" DROP CONSTRAINT "calendar_lists_lists_id_foreign";--> statement-breakpoint
ALTER TABLE "cart" DROP CONSTRAINT "cart_user_foreign";--> statement-breakpoint
ALTER TABLE "cart_cart_items" DROP CONSTRAINT "cart_cart_items_cart_id_foreign";--> statement-breakpoint
ALTER TABLE "cart_cart_items" DROP CONSTRAINT "cart_cart_items_cart_items_id_foreign";--> statement-breakpoint
ALTER TABLE "cart_items" DROP CONSTRAINT "cart_items_cart_foreign";--> statement-breakpoint
ALTER TABLE "cart_items" DROP CONSTRAINT "cart_items_products_foreign";--> statement-breakpoint
ALTER TABLE "cart_products" DROP CONSTRAINT "cart_products_cart_id_foreign";--> statement-breakpoint
ALTER TABLE "cart_products" DROP CONSTRAINT "cart_products_products_id_foreign";--> statement-breakpoint
ALTER TABLE "categories" DROP CONSTRAINT "categories_seo_foreign";--> statement-breakpoint
ALTER TABLE "categories_departments" DROP CONSTRAINT "categories_departments_categories_id_foreign";--> statement-breakpoint
ALTER TABLE "categories_departments" DROP CONSTRAINT "categories_departments_departments_id_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."categories" DROP CONSTRAINT "categories_image_foreign";--> statement-breakpoint
ALTER TABLE "categories_postgresstores" DROP CONSTRAINT "categories_postgresstores_categories_id_foreign";--> statement-breakpoint
ALTER TABLE "categories_postgresstores" DROP CONSTRAINT "categories_postgresstores_postgresstores_id_foreign";--> statement-breakpoint
ALTER TABLE "categories_shorts" DROP CONSTRAINT "categories_shorts_categories_id_foreign";--> statement-breakpoint
ALTER TABLE "categories_shorts" DROP CONSTRAINT "categories_shorts_shorts_id_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."categories_tags" DROP CONSTRAINT "categories_tags_categories_id_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."categories_tags" DROP CONSTRAINT "categories_tags_tags_id_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."characters_abilities" DROP CONSTRAINT "characters_abilities_abilities_id_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."characters_abilities" DROP CONSTRAINT "characters_abilities_characters_id_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."characters_characters" DROP CONSTRAINT "characters_characters_characters_id_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."characters_characters" DROP CONSTRAINT "characters_characters_related_characters_id_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."characters" DROP CONSTRAINT "characters_image_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."characters_tags" DROP CONSTRAINT "characters_tags_characters_id_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."characters_tags" DROP CONSTRAINT "characters_tags_tags_id_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."characters_videos" DROP CONSTRAINT "characters_videos_characters_id_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."characters_videos" DROP CONSTRAINT "characters_videos_videos_id_foreign";--> statement-breakpoint
ALTER TABLE "chart_entries" DROP CONSTRAINT "chart_entries_chart_id_foreign";--> statement-breakpoint
ALTER TABLE "chart_entries" DROP CONSTRAINT "chart_entries_product_id_foreign";--> statement-breakpoint
ALTER TABLE "charts" DROP CONSTRAINT "charts_icon_foreign";--> statement-breakpoint
ALTER TABLE "charts_departments" DROP CONSTRAINT "charts_departments_charts_id_foreign";--> statement-breakpoint
ALTER TABLE "charts_departments" DROP CONSTRAINT "charts_departments_departments_id_foreign";--> statement-breakpoint
ALTER TABLE "charts_products" DROP CONSTRAINT "charts_products_charts_id_foreign";--> statement-breakpoint
ALTER TABLE "charts_products" DROP CONSTRAINT "charts_products_products_id_foreign";--> statement-breakpoint
ALTER TABLE "charts_radios" DROP CONSTRAINT "charts_radios_charts_id_foreign";--> statement-breakpoint
ALTER TABLE "charts_radios" DROP CONSTRAINT "charts_radios_radios_id_foreign";--> statement-breakpoint
ALTER TABLE "chat" DROP CONSTRAINT "chat_image_foreign";--> statement-breakpoint
ALTER TABLE "chat" DROP CONSTRAINT "chat_user_created_foreign";--> statement-breakpoint
ALTER TABLE "chat" DROP CONSTRAINT "chat_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "circles_directus_users" DROP CONSTRAINT "circles_directus_users_directus_users_id_foreign";--> statement-breakpoint
ALTER TABLE "circles_posts" DROP CONSTRAINT "circles_posts_posts_id_foreign";--> statement-breakpoint
ALTER TABLE "circles_products" DROP CONSTRAINT "circles_products_products_id_foreign";--> statement-breakpoint
ALTER TABLE "cities_countries" DROP CONSTRAINT "cities_countries_cities_id_foreign";--> statement-breakpoint
ALTER TABLE "cities_states" DROP CONSTRAINT "cities_states_cities_id_foreign";--> statement-breakpoint
ALTER TABLE "collections_brands" DROP CONSTRAINT "collections_brands_brands_id_foreign";--> statement-breakpoint
ALTER TABLE "collections_brands" DROP CONSTRAINT "collections_brands_collections_id_foreign";--> statement-breakpoint
ALTER TABLE "collections_products" DROP CONSTRAINT "collections_products_collections_id_foreign";--> statement-breakpoint
ALTER TABLE "collections_products" DROP CONSTRAINT "collections_products_products_id_foreign";--> statement-breakpoint
ALTER TABLE "collections_spaces" DROP CONSTRAINT "collections_spaces_collections_id_foreign";--> statement-breakpoint
ALTER TABLE "collections_spaces" DROP CONSTRAINT "collections_spaces_spaces_id_foreign";--> statement-breakpoint
ALTER TABLE "comments" DROP CONSTRAINT "comments_user_foreign";--> statement-breakpoint
ALTER TABLE "comments_directus_users" DROP CONSTRAINT "comments_directus_users_comment_id_foreign";--> statement-breakpoint
ALTER TABLE "comments_products" DROP CONSTRAINT "comments_products_comments_id_foreign";--> statement-breakpoint
ALTER TABLE "comments_products" DROP CONSTRAINT "comments_products_products_id_foreign";--> statement-breakpoint
ALTER TABLE "comments_reactions" DROP CONSTRAINT "comments_reactions_comments_id_foreign";--> statement-breakpoint
ALTER TABLE "comments_reactions" DROP CONSTRAINT "comments_reactions_reactions_id_foreign";--> statement-breakpoint
ALTER TABLE "comments_shorts" DROP CONSTRAINT "comments_shorts_comments_id_foreign";--> statement-breakpoint
ALTER TABLE "comments_shorts" DROP CONSTRAINT "comments_shorts_shorts_id_foreign";--> statement-breakpoint
ALTER TABLE "connections_directus_users" DROP CONSTRAINT "connections_directus_users_connections_id_foreign";--> statement-breakpoint
ALTER TABLE "contacts" DROP CONSTRAINT "contacts_user_created_foreign";--> statement-breakpoint
ALTER TABLE "contacts" DROP CONSTRAINT "contacts_user_foreign";--> statement-breakpoint
ALTER TABLE "contacts" DROP CONSTRAINT "contacts_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "conversations" DROP CONSTRAINT "conversations_organization_foreign";--> statement-breakpoint
ALTER TABLE "conversations" DROP CONSTRAINT "conversations_user_created_foreign";--> statement-breakpoint
ALTER TABLE "conversations" DROP CONSTRAINT "conversations_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "countries_currency" DROP CONSTRAINT "countries_currency_countries_id_foreign";--> statement-breakpoint
ALTER TABLE "countries_currency" DROP CONSTRAINT "countries_currency_currency_id_foreign";--> statement-breakpoint
ALTER TABLE "countries_timezones" DROP CONSTRAINT "countries_timezones_countries_id_foreign";--> statement-breakpoint
ALTER TABLE "countries_timezones" DROP CONSTRAINT "countries_timezones_timezones_id_foreign";--> statement-breakpoint
ALTER TABLE "coupons_products" DROP CONSTRAINT "coupons_products_products_id_foreign";--> statement-breakpoint
ALTER TABLE "cross_sell_products" DROP CONSTRAINT "cross_sell_products_user_foreign";--> statement-breakpoint
ALTER TABLE "cross_sell_products_products" DROP CONSTRAINT "cross_sell_products_products_cross_sell_products_id_foreign";--> statement-breakpoint
ALTER TABLE "cross_sell_products_products" DROP CONSTRAINT "cross_sell_products_products_products_id_foreign";--> statement-breakpoint
ALTER TABLE "currency_departments" DROP CONSTRAINT "currency_departments_currency_id_foreign";--> statement-breakpoint
ALTER TABLE "currency_departments" DROP CONSTRAINT "currency_departments_departments_id_foreign";--> statement-breakpoint
ALTER TABLE "departments_categories" DROP CONSTRAINT "departments_categories_categories_id_foreign";--> statement-breakpoint
ALTER TABLE "departments_categories" DROP CONSTRAINT "departments_categories_departments_id_foreign";--> statement-breakpoint
ALTER TABLE "departments_collections" DROP CONSTRAINT "departments_collections_collections_id_foreign";--> statement-breakpoint
ALTER TABLE "departments_collections" DROP CONSTRAINT "departments_collections_departments_id_foreign";--> statement-breakpoint
ALTER TABLE "departments_products" DROP CONSTRAINT "departments_products_departments_id_foreign";--> statement-breakpoint
ALTER TABLE "departments_products" DROP CONSTRAINT "departments_products_products_id_foreign";--> statement-breakpoint
ALTER TABLE "departments_shorts" DROP CONSTRAINT "departments_shorts_departments_id_foreign";--> statement-breakpoint
ALTER TABLE "departments_shorts" DROP CONSTRAINT "departments_shorts_shorts_id_foreign";--> statement-breakpoint
ALTER TABLE "departments_showcases" DROP CONSTRAINT "departments_showcases_departments_id_foreign";--> statement-breakpoint
ALTER TABLE "departments_showcases" DROP CONSTRAINT "departments_showcases_showcases_id_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."dictionary" DROP CONSTRAINT "dictionary_image_foreign";--> statement-breakpoint
ALTER TABLE "directus_access" DROP CONSTRAINT "directus_access_policy_foreign";--> statement-breakpoint
ALTER TABLE "directus_access" DROP CONSTRAINT "directus_access_role_foreign";--> statement-breakpoint
ALTER TABLE "directus_access" DROP CONSTRAINT "directus_access_user_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."directus_access" DROP CONSTRAINT "directus_access_policy_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."directus_access" DROP CONSTRAINT "directus_access_role_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."directus_access" DROP CONSTRAINT "directus_access_user_foreign";--> statement-breakpoint
ALTER TABLE "directus_comments" DROP CONSTRAINT "directus_comments_user_created_foreign";--> statement-breakpoint
ALTER TABLE "directus_comments" DROP CONSTRAINT "directus_comments_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."directus_comments" DROP CONSTRAINT "directus_comments_user_created_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."directus_comments" DROP CONSTRAINT "directus_comments_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "directus_dashboards" DROP CONSTRAINT "directus_dashboards_user_created_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."directus_dashboards" DROP CONSTRAINT "directus_dashboards_user_created_foreign";--> statement-breakpoint
ALTER TABLE "directus_deployment_projects" DROP CONSTRAINT "directus_deployment_projects_deployment_foreign";--> statement-breakpoint
ALTER TABLE "directus_deployment_projects" DROP CONSTRAINT "directus_deployment_projects_user_created_foreign";--> statement-breakpoint
ALTER TABLE "directus_deployment_runs" DROP CONSTRAINT "directus_deployment_runs_project_foreign";--> statement-breakpoint
ALTER TABLE "directus_deployment_runs" DROP CONSTRAINT "directus_deployment_runs_user_created_foreign";--> statement-breakpoint
ALTER TABLE "directus_deployments" DROP CONSTRAINT "directus_deployments_user_created_foreign";--> statement-breakpoint
ALTER TABLE "directus_files" DROP CONSTRAINT "directus_files_folder_foreign";--> statement-breakpoint
ALTER TABLE "directus_files" DROP CONSTRAINT "directus_files_modified_by_foreign";--> statement-breakpoint
ALTER TABLE "directus_files" DROP CONSTRAINT "directus_files_uploaded_by_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."directus_files" DROP CONSTRAINT "directus_files_folder_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."directus_files" DROP CONSTRAINT "directus_files_modified_by_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."directus_files" DROP CONSTRAINT "directus_files_uploaded_by_foreign";--> statement-breakpoint
ALTER TABLE "directus_flows" DROP CONSTRAINT "directus_flows_user_created_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."directus_flows" DROP CONSTRAINT "directus_flows_user_created_foreign";--> statement-breakpoint
ALTER TABLE "directus_notifications" DROP CONSTRAINT "directus_notifications_recipient_foreign";--> statement-breakpoint
ALTER TABLE "directus_notifications" DROP CONSTRAINT "directus_notifications_sender_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."directus_notifications" DROP CONSTRAINT "directus_notifications_recipient_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."directus_notifications" DROP CONSTRAINT "directus_notifications_sender_foreign";--> statement-breakpoint
ALTER TABLE "directus_oauth_codes" DROP CONSTRAINT "directus_oauth_codes_client_foreign";--> statement-breakpoint
ALTER TABLE "directus_oauth_codes" DROP CONSTRAINT "directus_oauth_codes_user_foreign";--> statement-breakpoint
ALTER TABLE "directus_oauth_consents" DROP CONSTRAINT "directus_oauth_consents_client_foreign";--> statement-breakpoint
ALTER TABLE "directus_oauth_consents" DROP CONSTRAINT "directus_oauth_consents_user_foreign";--> statement-breakpoint
ALTER TABLE "directus_oauth_tokens" DROP CONSTRAINT "directus_oauth_tokens_client_foreign";--> statement-breakpoint
ALTER TABLE "directus_oauth_tokens" DROP CONSTRAINT "directus_oauth_tokens_user_foreign";--> statement-breakpoint
ALTER TABLE "directus_operations" DROP CONSTRAINT "directus_operations_flow_foreign";--> statement-breakpoint
ALTER TABLE "directus_operations" DROP CONSTRAINT "directus_operations_user_created_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."directus_operations" DROP CONSTRAINT "directus_operations_flow_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."directus_operations" DROP CONSTRAINT "directus_operations_user_created_foreign";--> statement-breakpoint
ALTER TABLE "directus_panels" DROP CONSTRAINT "directus_panels_dashboard_foreign";--> statement-breakpoint
ALTER TABLE "directus_panels" DROP CONSTRAINT "directus_panels_user_created_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."directus_panels" DROP CONSTRAINT "directus_panels_dashboard_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."directus_panels" DROP CONSTRAINT "directus_panels_user_created_foreign";--> statement-breakpoint
ALTER TABLE "directus_permissions" DROP CONSTRAINT "directus_permissions_policy_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."directus_permissions" DROP CONSTRAINT "directus_permissions_policy_foreign";--> statement-breakpoint
ALTER TABLE "directus_presets" DROP CONSTRAINT "directus_presets_role_foreign";--> statement-breakpoint
ALTER TABLE "directus_presets" DROP CONSTRAINT "directus_presets_user_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."directus_presets" DROP CONSTRAINT "directus_presets_role_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."directus_presets" DROP CONSTRAINT "directus_presets_user_foreign";--> statement-breakpoint
ALTER TABLE "directus_revisions" DROP CONSTRAINT "directus_revisions_activity_foreign";--> statement-breakpoint
ALTER TABLE "directus_revisions" DROP CONSTRAINT "directus_revisions_version_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."directus_revisions" DROP CONSTRAINT "directus_revisions_activity_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."directus_revisions" DROP CONSTRAINT "directus_revisions_version_foreign";--> statement-breakpoint
ALTER TABLE "directus_sessions" DROP CONSTRAINT "directus_sessions_oauth_client_foreign";--> statement-breakpoint
ALTER TABLE "directus_sessions" DROP CONSTRAINT "directus_sessions_share_foreign";--> statement-breakpoint
ALTER TABLE "directus_sessions" DROP CONSTRAINT "directus_sessions_user_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."directus_sessions" DROP CONSTRAINT "directus_sessions_share_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."directus_sessions" DROP CONSTRAINT "directus_sessions_user_foreign";--> statement-breakpoint
ALTER TABLE "directus_settings" DROP CONSTRAINT "directus_settings_project_logo_foreign";--> statement-breakpoint
ALTER TABLE "directus_settings" DROP CONSTRAINT "directus_settings_public_background_foreign";--> statement-breakpoint
ALTER TABLE "directus_settings" DROP CONSTRAINT "directus_settings_public_favicon_foreign";--> statement-breakpoint
ALTER TABLE "directus_settings" DROP CONSTRAINT "directus_settings_public_foreground_foreign";--> statement-breakpoint
ALTER TABLE "directus_settings" DROP CONSTRAINT "directus_settings_public_registration_role_foreign";--> statement-breakpoint
ALTER TABLE "directus_settings" DROP CONSTRAINT "directus_settings_storage_default_folder_foreign";--> statement-breakpoint
ALTER TABLE "directus_shares" DROP CONSTRAINT "directus_shares_collection_foreign";--> statement-breakpoint
ALTER TABLE "directus_shares" DROP CONSTRAINT "directus_shares_role_foreign";--> statement-breakpoint
ALTER TABLE "directus_shares" DROP CONSTRAINT "directus_shares_user_created_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."directus_shares" DROP CONSTRAINT "directus_shares_collection_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."directus_shares" DROP CONSTRAINT "directus_shares_role_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."directus_shares" DROP CONSTRAINT "directus_shares_user_created_foreign";--> statement-breakpoint
ALTER TABLE "directus_users" DROP CONSTRAINT "directus_users_role_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."directus_users" DROP CONSTRAINT "directus_users_role_foreign";--> statement-breakpoint
ALTER TABLE "directus_versions" DROP CONSTRAINT "directus_versions_collection_foreign";--> statement-breakpoint
ALTER TABLE "directus_versions" DROP CONSTRAINT "directus_versions_user_created_foreign";--> statement-breakpoint
ALTER TABLE "directus_versions" DROP CONSTRAINT "directus_versions_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."directus_versions" DROP CONSTRAINT "directus_versions_collection_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."directus_versions" DROP CONSTRAINT "directus_versions_user_created_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."directus_versions" DROP CONSTRAINT "directus_versions_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."directus_webhooks" DROP CONSTRAINT "directus_webhooks_migrated_flow_foreign";--> statement-breakpoint
ALTER TABLE "emoji_reactions" DROP CONSTRAINT "emoji_reactions_user_id_fkey";--> statement-breakpoint
ALTER TABLE "events" DROP CONSTRAINT "events_image_foreign";--> statement-breakpoint
ALTER TABLE "events" DROP CONSTRAINT "events_user_created_foreign";--> statement-breakpoint
ALTER TABLE "events" DROP CONSTRAINT "events_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "events_cities" DROP CONSTRAINT "events_cities_cities_id_foreign";--> statement-breakpoint
ALTER TABLE "events_cities" DROP CONSTRAINT "events_cities_events_id_foreign";--> statement-breakpoint
ALTER TABLE "events_countries" DROP CONSTRAINT "events_countries_countries_id_foreign";--> statement-breakpoint
ALTER TABLE "events_countries" DROP CONSTRAINT "events_countries_events_id_foreign";--> statement-breakpoint
ALTER TABLE "events_coupons" DROP CONSTRAINT "events_coupons_events_id_foreign";--> statement-breakpoint
ALTER TABLE "events_directus_users" DROP CONSTRAINT "events_directus_users_directus_users_id_foreign";--> statement-breakpoint
ALTER TABLE "events_directus_users" DROP CONSTRAINT "events_directus_users_events_id_foreign";--> statement-breakpoint
ALTER TABLE "events_files" DROP CONSTRAINT "events_files_directus_files_id_foreign";--> statement-breakpoint
ALTER TABLE "events_files" DROP CONSTRAINT "events_files_events_id_foreign";--> statement-breakpoint
ALTER TABLE "events_invoices" DROP CONSTRAINT "events_invoices_events_id_foreign";--> statement-breakpoint
ALTER TABLE "events_invoices" DROP CONSTRAINT "events_invoices_invoices_id_foreign";--> statement-breakpoint
ALTER TABLE "events_lists" DROP CONSTRAINT "events_lists_events_id_foreign";--> statement-breakpoint
ALTER TABLE "events_lists" DROP CONSTRAINT "events_lists_lists_id_foreign";--> statement-breakpoint
ALTER TABLE "events_posts" DROP CONSTRAINT "events_posts_events_id_foreign";--> statement-breakpoint
ALTER TABLE "events_posts" DROP CONSTRAINT "events_posts_posts_id_foreign";--> statement-breakpoint
ALTER TABLE "events_products" DROP CONSTRAINT "events_products_events_id_foreign";--> statement-breakpoint
ALTER TABLE "events_products" DROP CONSTRAINT "events_products_products_id_foreign";--> statement-breakpoint
ALTER TABLE "events_states" DROP CONSTRAINT "events_states_events_id_foreign";--> statement-breakpoint
ALTER TABLE "events_states" DROP CONSTRAINT "events_states_states_id_foreign";--> statement-breakpoint
ALTER TABLE "faqs_directus_users" DROP CONSTRAINT "faqs_directus_users_directus_users_id_foreign";--> statement-breakpoint
ALTER TABLE "faqs_directus_users" DROP CONSTRAINT "faqs_directus_users_faqs_id_foreign";--> statement-breakpoint
ALTER TABLE "faqs_files" DROP CONSTRAINT "faqs_files_faqs_id_foreign";--> statement-breakpoint
ALTER TABLE "faqs_products" DROP CONSTRAINT "faqs_products_faqs_id_foreign";--> statement-breakpoint
ALTER TABLE "faqs_products" DROP CONSTRAINT "faqs_products_products_id_foreign";--> statement-breakpoint
ALTER TABLE "federated_spaces_spaces" DROP CONSTRAINT "federated_spaces_spaces_federated_spaces_id_foreign";--> statement-breakpoint
ALTER TABLE "federated_spaces_spaces" DROP CONSTRAINT "federated_spaces_spaces_spaces_id_foreign";--> statement-breakpoint
ALTER TABLE "feeds" DROP CONSTRAINT "feeds_shop_foreign";--> statement-breakpoint
ALTER TABLE "feeds_posts" DROP CONSTRAINT "feeds_posts_feed_id_foreign";--> statement-breakpoint
ALTER TABLE "feeds_posts" DROP CONSTRAINT "feeds_posts_post_id_foreign";--> statement-breakpoint
ALTER TABLE "finance_index_articles" DROP CONSTRAINT "finance_index_articles_articles_id_foreign";--> statement-breakpoint
ALTER TABLE "finance_index_articles" DROP CONSTRAINT "finance_index_articles_finance_index_id_foreign";--> statement-breakpoint
ALTER TABLE "finance_index_currency" DROP CONSTRAINT "finance_index_currency_currency_id_foreign";--> statement-breakpoint
ALTER TABLE "finance_index_currency" DROP CONSTRAINT "finance_index_currency_finance_index_id_foreign";--> statement-breakpoint
ALTER TABLE "finance_index_region" DROP CONSTRAINT "finance_index_region_finance_index_id_foreign";--> statement-breakpoint
ALTER TABLE "finance_index_region" DROP CONSTRAINT "finance_index_region_region_id_foreign";--> statement-breakpoint
ALTER TABLE "forms" DROP CONSTRAINT "forms_user_created_foreign";--> statement-breakpoint
ALTER TABLE "forms" DROP CONSTRAINT "forms_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "friend_requests_address" DROP CONSTRAINT "friend_requests_address_address_id_foreign";--> statement-breakpoint
ALTER TABLE "friend_requests_address" DROP CONSTRAINT "friend_requests_address_friend_requests_id_foreign";--> statement-breakpoint
ALTER TABLE "friend_requests_profiles" DROP CONSTRAINT "friend_requests_profiles_friend_requests_id_foreign";--> statement-breakpoint
ALTER TABLE "friend_requests_profiles" DROP CONSTRAINT "friend_requests_profiles_profiles_id_foreign";--> statement-breakpoint
ALTER TABLE "friend_suggestions_profiles" DROP CONSTRAINT "friend_suggestions_profiles_friend_suggestions_id_foreign";--> statement-breakpoint
ALTER TABLE "friend_suggestions_profiles" DROP CONSTRAINT "friend_suggestions_profiles_profiles_id_foreign";--> statement-breakpoint
ALTER TABLE "gamification" DROP CONSTRAINT "gamification_anniversaries_foreign";--> statement-breakpoint
ALTER TABLE "gamification" DROP CONSTRAINT "gamification_birthdays_foreign";--> statement-breakpoint
ALTER TABLE "gamification" DROP CONSTRAINT "gamification_leaderboards_foreign";--> statement-breakpoint
ALTER TABLE "gamification" DROP CONSTRAINT "gamification_nomination_user_foreign";--> statement-breakpoint
ALTER TABLE "gamification" DROP CONSTRAINT "gamification_user_created_foreign";--> statement-breakpoint
ALTER TABLE "gamification" DROP CONSTRAINT "gamification_user_profile_foreign";--> statement-breakpoint
ALTER TABLE "gamification" DROP CONSTRAINT "gamification_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "gamification_directus_users" DROP CONSTRAINT "gamification_directus_users_directus_users_id_foreign";--> statement-breakpoint
ALTER TABLE "gamification_directus_users" DROP CONSTRAINT "gamification_directus_users_gamification_id_foreign";--> statement-breakpoint
ALTER TABLE "gamification_events" DROP CONSTRAINT "gamification_events_events_id_foreign";--> statement-breakpoint
ALTER TABLE "gamification_events" DROP CONSTRAINT "gamification_events_gamification_id_foreign";--> statement-breakpoint
ALTER TABLE "gamification_notifications" DROP CONSTRAINT "gamification_notifications_gamification_id_foreign";--> statement-breakpoint
ALTER TABLE "gamification_notifications" DROP CONSTRAINT "gamification_notifications_notifications_id_foreign";--> statement-breakpoint
ALTER TABLE "gamification_products" DROP CONSTRAINT "gamification_products_gamification_id_foreign";--> statement-breakpoint
ALTER TABLE "gamification_products" DROP CONSTRAINT "gamification_products_products_id_foreign";--> statement-breakpoint
ALTER TABLE "gamification_videos" DROP CONSTRAINT "gamification_videos_gamification_id_foreign";--> statement-breakpoint
ALTER TABLE "gamification_videos" DROP CONSTRAINT "gamification_videos_videos_id_foreign";--> statement-breakpoint
ALTER TABLE "geo_regions_cities" DROP CONSTRAINT "geo_regions_cities_cities_id_foreign";--> statement-breakpoint
ALTER TABLE "geo_regions_cities" DROP CONSTRAINT "geo_regions_cities_geo_regions_id_foreign";--> statement-breakpoint
ALTER TABLE "geo_regions_countries" DROP CONSTRAINT "geo_regions_countries_countries_id_foreign";--> statement-breakpoint
ALTER TABLE "geo_regions_countries" DROP CONSTRAINT "geo_regions_countries_geo_regions_id_foreign";--> statement-breakpoint
ALTER TABLE "geo_regions_states" DROP CONSTRAINT "geo_regions_states_geo_regions_id_foreign";--> statement-breakpoint
ALTER TABLE "geo_regions_states" DROP CONSTRAINT "geo_regions_states_states_id_foreign";--> statement-breakpoint
ALTER TABLE "globals" DROP CONSTRAINT "globals_logo_on_dark_bg_foreign";--> statement-breakpoint
ALTER TABLE "globals" DROP CONSTRAINT "globals_logo_on_light_bg_foreign";--> statement-breakpoint
ALTER TABLE "globals" DROP CONSTRAINT "globals_og_image_foreign";--> statement-breakpoint
ALTER TABLE "hdb_catalog"."hdb_cron_event_invocation_logs" DROP CONSTRAINT "hdb_cron_event_invocation_logs_event_id_fkey";--> statement-breakpoint
ALTER TABLE "hdb_catalog"."hdb_scheduled_event_invocation_logs" DROP CONSTRAINT "hdb_scheduled_event_invocation_logs_event_id_fkey";--> statement-breakpoint
ALTER TABLE "help_articles" DROP CONSTRAINT "help_articles_help_collection_foreign";--> statement-breakpoint
ALTER TABLE "help_articles" DROP CONSTRAINT "help_articles_owner_foreign";--> statement-breakpoint
ALTER TABLE "help_articles" DROP CONSTRAINT "help_articles_user_created_foreign";--> statement-breakpoint
ALTER TABLE "help_articles" DROP CONSTRAINT "help_articles_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "help_feedback" DROP CONSTRAINT "help_feedback_user_created_foreign";--> statement-breakpoint
ALTER TABLE "help_feedback" DROP CONSTRAINT "help_feedback_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "auth"."identities" DROP CONSTRAINT "identities_user_id_fkey";--> statement-breakpoint
ALTER TABLE "inbox" DROP CONSTRAINT "inbox_form_foreign";--> statement-breakpoint
ALTER TABLE "inbox" DROP CONSTRAINT "inbox_project_foreign";--> statement-breakpoint
ALTER TABLE "inbox" DROP CONSTRAINT "inbox_task_foreign";--> statement-breakpoint
ALTER TABLE "inbox" DROP CONSTRAINT "inbox_user_created_foreign";--> statement-breakpoint
ALTER TABLE "inbox" DROP CONSTRAINT "inbox_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "incentives" DROP CONSTRAINT "incentives_user_id_foreign";--> statement-breakpoint
ALTER TABLE "incentives_currency" DROP CONSTRAINT "incentives_currency_currency_id_foreign";--> statement-breakpoint
ALTER TABLE "incentives_currency" DROP CONSTRAINT "incentives_currency_incentives_id_foreign";--> statement-breakpoint
ALTER TABLE "incentives_orders" DROP CONSTRAINT "incentives_orders_incentives_id_foreign";--> statement-breakpoint
ALTER TABLE "incentives_orders" DROP CONSTRAINT "incentives_orders_orders_id_foreign";--> statement-breakpoint
ALTER TABLE "incentives_products" DROP CONSTRAINT "incentives_products_incentives_id_foreign";--> statement-breakpoint
ALTER TABLE "incentives_products" DROP CONSTRAINT "incentives_products_products_id_foreign";--> statement-breakpoint
ALTER TABLE "integrations" DROP CONSTRAINT "integrations_user_created_foreign";--> statement-breakpoint
ALTER TABLE "integrations" DROP CONSTRAINT "integrations_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "integrations_attributes" DROP CONSTRAINT "integrations_attributes_attributes_id_foreign";--> statement-breakpoint
ALTER TABLE "integrations_attributes" DROP CONSTRAINT "integrations_attributes_integrations_id_foreign";--> statement-breakpoint
ALTER TABLE "integrations_categories" DROP CONSTRAINT "integrations_categories_categories_id_foreign";--> statement-breakpoint
ALTER TABLE "integrations_categories" DROP CONSTRAINT "integrations_categories_integrations_id_foreign";--> statement-breakpoint
ALTER TABLE "integrations_departments" DROP CONSTRAINT "integrations_departments_departments_id_foreign";--> statement-breakpoint
ALTER TABLE "integrations_departments" DROP CONSTRAINT "integrations_departments_integrations_id_foreign";--> statement-breakpoint
ALTER TABLE "integrations_files" DROP CONSTRAINT "integrations_files_directus_files_id_foreign";--> statement-breakpoint
ALTER TABLE "integrations_files" DROP CONSTRAINT "integrations_files_integrations_id_foreign";--> statement-breakpoint
ALTER TABLE "integrations_platform" DROP CONSTRAINT "integrations_platform_integrations_id_foreign";--> statement-breakpoint
ALTER TABLE "integrations_platform" DROP CONSTRAINT "integrations_platform_platform_id_foreign";--> statement-breakpoint
ALTER TABLE "integrations_product_types" DROP CONSTRAINT "integrations_product_types_integrations_id_foreign";--> statement-breakpoint
ALTER TABLE "integrations_product_types" DROP CONSTRAINT "integrations_product_types_product_types_id_foreign";--> statement-breakpoint
ALTER TABLE "integrations_ratings" DROP CONSTRAINT "integrations_ratings_integrations_id_foreign";--> statement-breakpoint
ALTER TABLE "integrations_ratings" DROP CONSTRAINT "integrations_ratings_ratings_id_foreign";--> statement-breakpoint
ALTER TABLE "integrations_report" DROP CONSTRAINT "integrations_report_integrations_id_foreign";--> statement-breakpoint
ALTER TABLE "integrations_report" DROP CONSTRAINT "integrations_report_report_id_foreign";--> statement-breakpoint
ALTER TABLE "integrations_spaces" DROP CONSTRAINT "integrations_spaces_integrations_id_foreign";--> statement-breakpoint
ALTER TABLE "integrations_spaces" DROP CONSTRAINT "integrations_spaces_spaces_id_foreign";--> statement-breakpoint
ALTER TABLE "integrations_tags" DROP CONSTRAINT "integrations_tags_integrations_id_foreign";--> statement-breakpoint
ALTER TABLE "integrations_tags" DROP CONSTRAINT "integrations_tags_tags_id_foreign";--> statement-breakpoint
ALTER TABLE "invoices_address" DROP CONSTRAINT "invoices_address_address_id_foreign";--> statement-breakpoint
ALTER TABLE "invoices_address" DROP CONSTRAINT "invoices_address_invoice_id_foreign";--> statement-breakpoint
ALTER TABLE "invoices_orders" DROP CONSTRAINT "invoices_orders_invoice_id_foreign";--> statement-breakpoint
ALTER TABLE "invoices_orders" DROP CONSTRAINT "invoices_orders_order_id_foreign";--> statement-breakpoint
ALTER TABLE "invoices_shipping_address" DROP CONSTRAINT "invoices_shipping_address_invoice_id_foreign";--> statement-breakpoint
ALTER TABLE "invoices_shipping_address" DROP CONSTRAINT "invoices_shipping_address_shipping_address_id_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."items_abilities" DROP CONSTRAINT "items_abilities_abilities_id_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."items_abilities" DROP CONSTRAINT "items_abilities_items_id_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."items_characters" DROP CONSTRAINT "items_characters_characters_id_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."items_characters" DROP CONSTRAINT "items_characters_items_id_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."items" DROP CONSTRAINT "items_image_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."items_videos" DROP CONSTRAINT "items_videos_items_id_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."items_videos" DROP CONSTRAINT "items_videos_videos_id_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."levels_characters" DROP CONSTRAINT "levels_characters_characters_id_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."levels_characters" DROP CONSTRAINT "levels_characters_levels_id_foreign";--> statement-breakpoint
ALTER TABLE "list_items" DROP CONSTRAINT "list_items_list_id_foreign";--> statement-breakpoint
ALTER TABLE "list_items" DROP CONSTRAINT "list_items_media_foreign";--> statement-breakpoint
ALTER TABLE "list_items" DROP CONSTRAINT "list_items_post_id_foreign";--> statement-breakpoint
ALTER TABLE "list_items" DROP CONSTRAINT "list_items_user_created_foreign";--> statement-breakpoint
ALTER TABLE "list_items" DROP CONSTRAINT "list_items_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "list_items_directus_users" DROP CONSTRAINT "list_items_directus_users_directus_users_id_foreign";--> statement-breakpoint
ALTER TABLE "list_items_directus_users" DROP CONSTRAINT "list_items_directus_users_list_items_id_foreign";--> statement-breakpoint
ALTER TABLE "list_items_products" DROP CONSTRAINT "list_items_products_list_items_id_foreign";--> statement-breakpoint
ALTER TABLE "list_items_products" DROP CONSTRAINT "list_items_products_products_id_foreign";--> statement-breakpoint
ALTER TABLE "list_products_lists" DROP CONSTRAINT "list_products_lists_list_products_id_foreign";--> statement-breakpoint
ALTER TABLE "list_products_lists" DROP CONSTRAINT "list_products_lists_lists_id_foreign";--> statement-breakpoint
ALTER TABLE "lists_categories" DROP CONSTRAINT "lists_categories_categories_id_foreign";--> statement-breakpoint
ALTER TABLE "lists_categories" DROP CONSTRAINT "lists_categories_lists_id_foreign";--> statement-breakpoint
ALTER TABLE "lists_departments" DROP CONSTRAINT "lists_departments_departments_id_foreign";--> statement-breakpoint
ALTER TABLE "lists_departments" DROP CONSTRAINT "lists_departments_lists_id_foreign";--> statement-breakpoint
ALTER TABLE "lists_directus_users" DROP CONSTRAINT "lists_directus_users_list_id_foreign";--> statement-breakpoint
ALTER TABLE "lists_files" DROP CONSTRAINT "lists_files_directus_files_id_foreign";--> statement-breakpoint
ALTER TABLE "lists_files" DROP CONSTRAINT "lists_files_lists_id_foreign";--> statement-breakpoint
ALTER TABLE "lists_products" DROP CONSTRAINT "lists_products_lists_id_foreign";--> statement-breakpoint
ALTER TABLE "lists_products" DROP CONSTRAINT "lists_products_products_id_foreign";--> statement-breakpoint
ALTER TABLE "lists_shorts" DROP CONSTRAINT "lists_shorts_lists_id_foreign";--> statement-breakpoint
ALTER TABLE "lists_shorts" DROP CONSTRAINT "lists_shorts_shorts_id_foreign";--> statement-breakpoint
ALTER TABLE "lists_template" DROP CONSTRAINT "lists_template_user_created_foreign";--> statement-breakpoint
ALTER TABLE "lists_template" DROP CONSTRAINT "lists_template_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "lists_template_directus_users" DROP CONSTRAINT "lists_template_directus_users_directus_users_id_foreign";--> statement-breakpoint
ALTER TABLE "lists_template_directus_users" DROP CONSTRAINT "lists_template_directus_users_lists_template_id_foreign";--> statement-breakpoint
ALTER TABLE "lists_template_list_items" DROP CONSTRAINT "lists_template_list_items_list_items_id_foreign";--> statement-breakpoint
ALTER TABLE "lists_template_list_items" DROP CONSTRAINT "lists_template_list_items_lists_template_id_foreign";--> statement-breakpoint
ALTER TABLE "lists_template_tags" DROP CONSTRAINT "lists_template_tags_lists_template_id_foreign";--> statement-breakpoint
ALTER TABLE "lists_template_tags" DROP CONSTRAINT "lists_template_tags_tags_id_foreign";--> statement-breakpoint
ALTER TABLE "lists_templates" DROP CONSTRAINT "lists_templates_lists_id_foreign";--> statement-breakpoint
ALTER TABLE "lists_templates" DROP CONSTRAINT "lists_templates_templates_id_foreign";--> statement-breakpoint
ALTER TABLE "lists_type" DROP CONSTRAINT "lists_type_user_created_foreign";--> statement-breakpoint
ALTER TABLE "lists_type" DROP CONSTRAINT "lists_type_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "lists_type_categories" DROP CONSTRAINT "lists_type_categories_categories_id_foreign";--> statement-breakpoint
ALTER TABLE "lists_type_categories" DROP CONSTRAINT "lists_type_categories_lists_type_id_foreign";--> statement-breakpoint
ALTER TABLE "lists_type_lists" DROP CONSTRAINT "lists_type_lists_lists_id_foreign";--> statement-breakpoint
ALTER TABLE "lists_type_lists" DROP CONSTRAINT "lists_type_lists_lists_type_id_foreign";--> statement-breakpoint
ALTER TABLE "manufacturer_countries" DROP CONSTRAINT "manufacturer_countries_countries_id_foreign";--> statement-breakpoint
ALTER TABLE "manufacturer_countries" DROP CONSTRAINT "manufacturer_countries_manufacturer_id_foreign";--> statement-breakpoint
ALTER TABLE "media" DROP CONSTRAINT "media_profile_id_foreign";--> statement-breakpoint
ALTER TABLE "media" DROP CONSTRAINT "media_user_created_foreign";--> statement-breakpoint
ALTER TABLE "media" DROP CONSTRAINT "media_user_foreign";--> statement-breakpoint
ALTER TABLE "media" DROP CONSTRAINT "media_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "media_files" DROP CONSTRAINT "media_files_directus_files_id_foreign";--> statement-breakpoint
ALTER TABLE "media_files" DROP CONSTRAINT "media_files_media_id_foreign";--> statement-breakpoint
ALTER TABLE "media_folders" DROP CONSTRAINT "media_folders_parent_folder_foreign";--> statement-breakpoint
ALTER TABLE "media_folders" DROP CONSTRAINT "media_folders_user_created_foreign";--> statement-breakpoint
ALTER TABLE "media_folders" DROP CONSTRAINT "media_folders_user_foreign";--> statement-breakpoint
ALTER TABLE "media_folders" DROP CONSTRAINT "media_folders_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "media_folders_directus_users" DROP CONSTRAINT "media_folders_directus_users_directus_users_id_foreign";--> statement-breakpoint
ALTER TABLE "media_folders_directus_users" DROP CONSTRAINT "media_folders_directus_users_media_folders_id_foreign";--> statement-breakpoint
ALTER TABLE "member_groups_events" DROP CONSTRAINT "member_groups_events_events_id_foreign";--> statement-breakpoint
ALTER TABLE "member_groups_polls" DROP CONSTRAINT "member_groups_polls_polls_id_foreign";--> statement-breakpoint
ALTER TABLE "member_groups_posts" DROP CONSTRAINT "member_groups_posts_posts_id_foreign";--> statement-breakpoint
ALTER TABLE "member_groups_products" DROP CONSTRAINT "member_groups_products_products_id_foreign";--> statement-breakpoint
ALTER TABLE "messages" DROP CONSTRAINT "messages_conversation_foreign";--> statement-breakpoint
ALTER TABLE "auth"."mfa_amr_claims" DROP CONSTRAINT "mfa_amr_claims_session_id_fkey";--> statement-breakpoint
ALTER TABLE "auth"."mfa_challenges" DROP CONSTRAINT "mfa_challenges_auth_factor_id_fkey";--> statement-breakpoint
ALTER TABLE "auth"."mfa_factors" DROP CONSTRAINT "mfa_factors_user_id_fkey";--> statement-breakpoint
ALTER TABLE "moments_products" DROP CONSTRAINT "moments_products_moments_id_foreign";--> statement-breakpoint
ALTER TABLE "moments_products" DROP CONSTRAINT "moments_products_products_id_foreign";--> statement-breakpoint
ALTER TABLE "moments_spaces" DROP CONSTRAINT "moments_spaces_moments_id_foreign";--> statement-breakpoint
ALTER TABLE "moments_spaces" DROP CONSTRAINT "moments_spaces_spaces_id_foreign";--> statement-breakpoint
ALTER TABLE "musicchart_departments" DROP CONSTRAINT "musicchart_departments_departments_id_foreign";--> statement-breakpoint
ALTER TABLE "navigation" DROP CONSTRAINT "navigation_user_created_foreign";--> statement-breakpoint
ALTER TABLE "navigation" DROP CONSTRAINT "navigation_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "navigation_pages" DROP CONSTRAINT "navigation_pages_navigation_id_foreign";--> statement-breakpoint
ALTER TABLE "navigation_pages" DROP CONSTRAINT "navigation_pages_pages_id_foreign";--> statement-breakpoint
ALTER TABLE "navigation_websites" DROP CONSTRAINT "navigation_websites_navigation_id_foreign";--> statement-breakpoint
ALTER TABLE "navigation_websites" DROP CONSTRAINT "navigation_websites_websites_id_foreign";--> statement-breakpoint
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_recipient_foreign";--> statement-breakpoint
ALTER TABLE "auth"."oauth_authorizations" DROP CONSTRAINT "oauth_authorizations_client_id_fkey";--> statement-breakpoint
ALTER TABLE "auth"."oauth_authorizations" DROP CONSTRAINT "oauth_authorizations_user_id_fkey";--> statement-breakpoint
ALTER TABLE "auth"."oauth_consents" DROP CONSTRAINT "oauth_consents_client_id_fkey";--> statement-breakpoint
ALTER TABLE "auth"."oauth_consents" DROP CONSTRAINT "oauth_consents_user_id_fkey";--> statement-breakpoint
ALTER TABLE "storage"."objects" DROP CONSTRAINT "objects_bucketId_fkey";--> statement-breakpoint
ALTER TABLE "auth"."one_time_tokens" DROP CONSTRAINT "one_time_tokens_user_id_fkey";--> statement-breakpoint
ALTER TABLE "order_items_orders" DROP CONSTRAINT "order_items_orders_order_items_id_foreign";--> statement-breakpoint
ALTER TABLE "order_items_orders" DROP CONSTRAINT "order_items_orders_orders_id_foreign";--> statement-breakpoint
ALTER TABLE "order_items_products" DROP CONSTRAINT "order_items_products_order_items_id_foreign";--> statement-breakpoint
ALTER TABLE "order_items_products" DROP CONSTRAINT "order_items_products_products_id_foreign";--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT "orders_user_id_foreign";--> statement-breakpoint
ALTER TABLE "orders_products" DROP CONSTRAINT "orders_products_orders_id_foreign";--> statement-breakpoint
ALTER TABLE "orders_products" DROP CONSTRAINT "orders_products_products_id_foreign";--> statement-breakpoint
ALTER TABLE "organization_addresses" DROP CONSTRAINT "organization_addresses_organization_foreign";--> statement-breakpoint
ALTER TABLE "organization_addresses" DROP CONSTRAINT "organization_addresses_user_created_foreign";--> statement-breakpoint
ALTER TABLE "organization_addresses" DROP CONSTRAINT "organization_addresses_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "organizations" DROP CONSTRAINT "organizations_folder_foreign";--> statement-breakpoint
ALTER TABLE "organizations" DROP CONSTRAINT "organizations_logo_foreign";--> statement-breakpoint
ALTER TABLE "organizations" DROP CONSTRAINT "organizations_owner_foreign";--> statement-breakpoint
ALTER TABLE "organizations" DROP CONSTRAINT "organizations_payment_terms_foreign";--> statement-breakpoint
ALTER TABLE "organizations" DROP CONSTRAINT "organizations_user_created_foreign";--> statement-breakpoint
ALTER TABLE "organizations" DROP CONSTRAINT "organizations_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "organizations_contacts" DROP CONSTRAINT "organizations_contacts_contacts_id_foreign";--> statement-breakpoint
ALTER TABLE "organizations_contacts" DROP CONSTRAINT "organizations_contacts_organizations_id_foreign";--> statement-breakpoint
ALTER TABLE "os_activities" DROP CONSTRAINT "os_activities_assigned_to_foreign";--> statement-breakpoint
ALTER TABLE "os_activities" DROP CONSTRAINT "os_activities_deal_foreign";--> statement-breakpoint
ALTER TABLE "os_activities" DROP CONSTRAINT "os_activities_organization_foreign";--> statement-breakpoint
ALTER TABLE "os_activities" DROP CONSTRAINT "os_activities_user_created_foreign";--> statement-breakpoint
ALTER TABLE "os_activities" DROP CONSTRAINT "os_activities_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "os_activity_contacts" DROP CONSTRAINT "os_activity_contacts_contacts_id_foreign";--> statement-breakpoint
ALTER TABLE "os_activity_contacts" DROP CONSTRAINT "os_activity_contacts_os_activities_id_foreign";--> statement-breakpoint
ALTER TABLE "os_deal_contacts" DROP CONSTRAINT "os_deal_contacts_contacts_id_foreign";--> statement-breakpoint
ALTER TABLE "os_deal_contacts" DROP CONSTRAINT "os_deal_contacts_os_deals_id_foreign";--> statement-breakpoint
ALTER TABLE "os_deal_stages" DROP CONSTRAINT "os_deal_stages_user_created_foreign";--> statement-breakpoint
ALTER TABLE "os_deal_stages" DROP CONSTRAINT "os_deal_stages_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "os_deals" DROP CONSTRAINT "os_deals_deal_stage_foreign";--> statement-breakpoint
ALTER TABLE "os_deals" DROP CONSTRAINT "os_deals_organization_foreign";--> statement-breakpoint
ALTER TABLE "os_deals" DROP CONSTRAINT "os_deals_owner_foreign";--> statement-breakpoint
ALTER TABLE "os_deals" DROP CONSTRAINT "os_deals_user_created_foreign";--> statement-breakpoint
ALTER TABLE "os_deals" DROP CONSTRAINT "os_deals_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "os_email_templates" DROP CONSTRAINT "os_email_templates_user_created_foreign";--> statement-breakpoint
ALTER TABLE "os_email_templates" DROP CONSTRAINT "os_email_templates_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "os_expenses" DROP CONSTRAINT "os_expenses_file_foreign";--> statement-breakpoint
ALTER TABLE "os_expenses" DROP CONSTRAINT "os_expenses_invoice_item_foreign";--> statement-breakpoint
ALTER TABLE "os_expenses" DROP CONSTRAINT "os_expenses_project_foreign";--> statement-breakpoint
ALTER TABLE "os_expenses" DROP CONSTRAINT "os_expenses_user_created_foreign";--> statement-breakpoint
ALTER TABLE "os_expenses" DROP CONSTRAINT "os_expenses_user_submitted_foreign";--> statement-breakpoint
ALTER TABLE "os_expenses" DROP CONSTRAINT "os_expenses_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "os_invoice_items" DROP CONSTRAINT "os_invoice_items_billable_expense_foreign";--> statement-breakpoint
ALTER TABLE "os_invoice_items" DROP CONSTRAINT "os_invoice_items_invoice_foreign";--> statement-breakpoint
ALTER TABLE "os_invoice_items" DROP CONSTRAINT "os_invoice_items_item_foreign";--> statement-breakpoint
ALTER TABLE "os_invoice_items" DROP CONSTRAINT "os_invoice_items_tax_rate_foreign";--> statement-breakpoint
ALTER TABLE "os_invoice_items" DROP CONSTRAINT "os_invoice_items_user_created_foreign";--> statement-breakpoint
ALTER TABLE "os_invoice_items" DROP CONSTRAINT "os_invoice_items_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "os_invoices" DROP CONSTRAINT "os_invoices_contact_foreign";--> statement-breakpoint
ALTER TABLE "os_invoices" DROP CONSTRAINT "os_invoices_organization_foreign";--> statement-breakpoint
ALTER TABLE "os_invoices" DROP CONSTRAINT "os_invoices_project_foreign";--> statement-breakpoint
ALTER TABLE "os_invoices" DROP CONSTRAINT "os_invoices_user_created_foreign";--> statement-breakpoint
ALTER TABLE "os_invoices" DROP CONSTRAINT "os_invoices_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "os_items" DROP CONSTRAINT "os_items_default_tax_rate_foreign";--> statement-breakpoint
ALTER TABLE "os_items" DROP CONSTRAINT "os_items_user_created_foreign";--> statement-breakpoint
ALTER TABLE "os_items" DROP CONSTRAINT "os_items_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "os_payment_terms" DROP CONSTRAINT "os_payment_terms_user_created_foreign";--> statement-breakpoint
ALTER TABLE "os_payment_terms" DROP CONSTRAINT "os_payment_terms_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "os_payments" DROP CONSTRAINT "os_payments_contact_foreign";--> statement-breakpoint
ALTER TABLE "os_payments" DROP CONSTRAINT "os_payments_invoice_foreign";--> statement-breakpoint
ALTER TABLE "os_payments" DROP CONSTRAINT "os_payments_organization_foreign";--> statement-breakpoint
ALTER TABLE "os_payments" DROP CONSTRAINT "os_payments_user_created_foreign";--> statement-breakpoint
ALTER TABLE "os_payments" DROP CONSTRAINT "os_payments_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "os_project_contacts" DROP CONSTRAINT "os_project_contacts_contacts_id_foreign";--> statement-breakpoint
ALTER TABLE "os_project_contacts" DROP CONSTRAINT "os_project_contacts_os_projects_id_foreign";--> statement-breakpoint
ALTER TABLE "os_project_templates" DROP CONSTRAINT "os_project_templates_user_created_foreign";--> statement-breakpoint
ALTER TABLE "os_project_templates" DROP CONSTRAINT "os_project_templates_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "os_project_updates" DROP CONSTRAINT "os_project_updates_project_foreign";--> statement-breakpoint
ALTER TABLE "os_project_updates" DROP CONSTRAINT "os_project_updates_user_created_foreign";--> statement-breakpoint
ALTER TABLE "os_project_updates" DROP CONSTRAINT "os_project_updates_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "os_projects" DROP CONSTRAINT "os_projects_organization_foreign";--> statement-breakpoint
ALTER TABLE "os_projects" DROP CONSTRAINT "os_projects_owner_foreign";--> statement-breakpoint
ALTER TABLE "os_projects" DROP CONSTRAINT "os_projects_user_created_foreign";--> statement-breakpoint
ALTER TABLE "os_projects" DROP CONSTRAINT "os_projects_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "os_proposal_approvals" DROP CONSTRAINT "os_proposal_approvals_contact_foreign";--> statement-breakpoint
ALTER TABLE "os_proposal_approvals" DROP CONSTRAINT "os_proposal_approvals_proposal_foreign";--> statement-breakpoint
ALTER TABLE "os_proposal_approvals" DROP CONSTRAINT "os_proposal_approvals_signature_image_foreign";--> statement-breakpoint
ALTER TABLE "os_proposal_approvals" DROP CONSTRAINT "os_proposal_approvals_user_created_foreign";--> statement-breakpoint
ALTER TABLE "os_proposal_approvals" DROP CONSTRAINT "os_proposal_approvals_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "os_proposal_blocks" DROP CONSTRAINT "os_proposal_blocks_os_proposals_id_foreign";--> statement-breakpoint
ALTER TABLE "os_proposal_blocks" DROP CONSTRAINT "os_proposal_blocks_user_created_foreign";--> statement-breakpoint
ALTER TABLE "os_proposal_blocks" DROP CONSTRAINT "os_proposal_blocks_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "os_proposal_contacts" DROP CONSTRAINT "os_proposal_contacts_contacts_id_foreign";--> statement-breakpoint
ALTER TABLE "os_proposal_contacts" DROP CONSTRAINT "os_proposal_contacts_os_proposals_id_foreign";--> statement-breakpoint
ALTER TABLE "os_proposals" DROP CONSTRAINT "os_proposals_deal_foreign";--> statement-breakpoint
ALTER TABLE "os_proposals" DROP CONSTRAINT "os_proposals_organization_foreign";--> statement-breakpoint
ALTER TABLE "os_proposals" DROP CONSTRAINT "os_proposals_user_created_foreign";--> statement-breakpoint
ALTER TABLE "os_proposals" DROP CONSTRAINT "os_proposals_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "os_settings" DROP CONSTRAINT "os_settings_organization_folder_root_foreign";--> statement-breakpoint
ALTER TABLE "os_task_files" DROP CONSTRAINT "os_task_files_directus_files_id_foreign";--> statement-breakpoint
ALTER TABLE "os_task_files" DROP CONSTRAINT "os_task_files_os_tasks_id_foreign";--> statement-breakpoint
ALTER TABLE "os_tasks" DROP CONSTRAINT "os_tasks_assigned_to_foreign";--> statement-breakpoint
ALTER TABLE "os_tasks" DROP CONSTRAINT "os_tasks_form_foreign";--> statement-breakpoint
ALTER TABLE "os_tasks" DROP CONSTRAINT "os_tasks_project_foreign";--> statement-breakpoint
ALTER TABLE "os_tasks" DROP CONSTRAINT "os_tasks_user_created_foreign";--> statement-breakpoint
ALTER TABLE "os_tasks" DROP CONSTRAINT "os_tasks_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "os_tax_rates" DROP CONSTRAINT "os_tax_rates_user_created_foreign";--> statement-breakpoint
ALTER TABLE "os_tax_rates" DROP CONSTRAINT "os_tax_rates_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "outlets" DROP CONSTRAINT "outlets_image_foreign";--> statement-breakpoint
ALTER TABLE "outlets_categories" DROP CONSTRAINT "outlets_categories_categories_id_foreign";--> statement-breakpoint
ALTER TABLE "outlets_categories" DROP CONSTRAINT "outlets_categories_outlets_id_foreign";--> statement-breakpoint
ALTER TABLE "outlets_shorts" DROP CONSTRAINT "outlets_shorts_outlets_id_foreign";--> statement-breakpoint
ALTER TABLE "outlets_shorts" DROP CONSTRAINT "outlets_shorts_shorts_id_foreign";--> statement-breakpoint
ALTER TABLE "page_blocks" DROP CONSTRAINT "page_blocks_user_created_foreign";--> statement-breakpoint
ALTER TABLE "page_blocks" DROP CONSTRAINT "page_blocks_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "page_blocks_files" DROP CONSTRAINT "page_blocks_files_directus_files_id_foreign";--> statement-breakpoint
ALTER TABLE "page_blocks_files" DROP CONSTRAINT "page_blocks_files_page_blocks_id_foreign";--> statement-breakpoint
ALTER TABLE "pages" DROP CONSTRAINT "pages_seo_foreign";--> statement-breakpoint
ALTER TABLE "pages_blog" DROP CONSTRAINT "pages_blog_seo_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."pages" DROP CONSTRAINT "pages_image_foreign";--> statement-breakpoint
ALTER TABLE "pages_projects" DROP CONSTRAINT "pages_projects_seo_foreign";--> statement-breakpoint
ALTER TABLE "payments_countries" DROP CONSTRAINT "payments_countries_country_id_foreign";--> statement-breakpoint
ALTER TABLE "payments_countries" DROP CONSTRAINT "payments_countries_payment_id_foreign";--> statement-breakpoint
ALTER TABLE "payments_currency" DROP CONSTRAINT "payments_currency_currency_id_foreign";--> statement-breakpoint
ALTER TABLE "payments_currency" DROP CONSTRAINT "payments_currency_payments_id_foreign";--> statement-breakpoint
ALTER TABLE "payments_directus_users" DROP CONSTRAINT "payments_directus_users_directus_users_id_foreign";--> statement-breakpoint
ALTER TABLE "payments_directus_users" DROP CONSTRAINT "payments_directus_users_payments_id_foreign";--> statement-breakpoint
ALTER TABLE "payments_orders" DROP CONSTRAINT "payments_orders_orders_id_foreign";--> statement-breakpoint
ALTER TABLE "payments_orders" DROP CONSTRAINT "payments_orders_payments_id_foreign";--> statement-breakpoint
ALTER TABLE "pickup_locations_city" DROP CONSTRAINT "pickup_locations_city_pickup_locations_id_foreign";--> statement-breakpoint
ALTER TABLE "pickup_locations_country" DROP CONSTRAINT "pickup_locations_country_pickup_locations_id_foreign";--> statement-breakpoint
ALTER TABLE "pickup_locations_state" DROP CONSTRAINT "pickup_locations_state_pickup_locations_id_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."places_characters" DROP CONSTRAINT "places_characters_characters_id_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."places_characters" DROP CONSTRAINT "places_characters_places_id_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."places" DROP CONSTRAINT "places_image_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."places_items" DROP CONSTRAINT "places_items_items_id_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."places_items" DROP CONSTRAINT "places_items_places_id_foreign";--> statement-breakpoint
ALTER TABLE "platform" DROP CONSTRAINT "platform_image_foreign";--> statement-breakpoint
ALTER TABLE "platform_articles" DROP CONSTRAINT "platform_articles_articles_id_foreign";--> statement-breakpoint
ALTER TABLE "platform_articles" DROP CONSTRAINT "platform_articles_platform_id_foreign";--> statement-breakpoint
ALTER TABLE "platform_categories" DROP CONSTRAINT "platform_categories_categories_id_foreign";--> statement-breakpoint
ALTER TABLE "platform_categories" DROP CONSTRAINT "platform_categories_platform_id_foreign";--> statement-breakpoint
ALTER TABLE "platform_lists" DROP CONSTRAINT "platform_lists_lists_id_foreign";--> statement-breakpoint
ALTER TABLE "platform_lists" DROP CONSTRAINT "platform_lists_platform_id_foreign";--> statement-breakpoint
ALTER TABLE "platform_navigation" DROP CONSTRAINT "platform_navigation_navigation_id_foreign";--> statement-breakpoint
ALTER TABLE "platform_navigation" DROP CONSTRAINT "platform_navigation_platform_id_foreign";--> statement-breakpoint
ALTER TABLE "platform_page_blocks" DROP CONSTRAINT "platform_page_blocks_page_blocks_id_foreign";--> statement-breakpoint
ALTER TABLE "platform_page_blocks" DROP CONSTRAINT "platform_page_blocks_platform_id_foreign";--> statement-breakpoint
ALTER TABLE "platform_pages" DROP CONSTRAINT "platform_pages_pages_id_foreign";--> statement-breakpoint
ALTER TABLE "platform_pages" DROP CONSTRAINT "platform_pages_platform_id_foreign";--> statement-breakpoint
ALTER TABLE "platform_products" DROP CONSTRAINT "platform_products_platform_id_foreign";--> statement-breakpoint
ALTER TABLE "platform_products" DROP CONSTRAINT "platform_products_products_id_foreign";--> statement-breakpoint
ALTER TABLE "polls" DROP CONSTRAINT "polls_author_foreign";--> statement-breakpoint
ALTER TABLE "polls" DROP CONSTRAINT "polls_image_foreign";--> statement-breakpoint
ALTER TABLE "polls" DROP CONSTRAINT "polls_user_created_foreign";--> statement-breakpoint
ALTER TABLE "polls" DROP CONSTRAINT "polls_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "polls_spaces" DROP CONSTRAINT "polls_spaces_polls_id_foreign";--> statement-breakpoint
ALTER TABLE "polls_spaces" DROP CONSTRAINT "polls_spaces_spaces_id_foreign";--> statement-breakpoint
ALTER TABLE "post_gallery_items" DROP CONSTRAINT "post_gallery_items_directus_files_id_foreign";--> statement-breakpoint
ALTER TABLE "postgresstores_collections" DROP CONSTRAINT "postgresstores_collections_collections_id_foreign";--> statement-breakpoint
ALTER TABLE "postgresstores_collections" DROP CONSTRAINT "postgresstores_collections_postgresstores_id_foreign";--> statement-breakpoint
ALTER TABLE "postgresstores_products" DROP CONSTRAINT "postgresstores_products_postgresstores_id_foreign";--> statement-breakpoint
ALTER TABLE "postgresstores_products" DROP CONSTRAINT "postgresstores_products_products_id_foreign";--> statement-breakpoint
ALTER TABLE "postgresstores_websites" DROP CONSTRAINT "postgresstores_websites_postgresstores_id_foreign";--> statement-breakpoint
ALTER TABLE "postgresstores_websites" DROP CONSTRAINT "postgresstores_websites_websites_id_foreign";--> statement-breakpoint
ALTER TABLE "posts" DROP CONSTRAINT "posts_audio_foreign";--> statement-breakpoint
ALTER TABLE "posts" DROP CONSTRAINT "posts_author_foreign";--> statement-breakpoint
ALTER TABLE "posts" DROP CONSTRAINT "posts_image_foreign";--> statement-breakpoint
ALTER TABLE "posts" DROP CONSTRAINT "posts_seo_foreign";--> statement-breakpoint
ALTER TABLE "posts_departments" DROP CONSTRAINT "posts_departments_departments_id_foreign";--> statement-breakpoint
ALTER TABLE "posts_departments" DROP CONSTRAINT "posts_departments_posts_id_foreign";--> statement-breakpoint
ALTER TABLE "posts_polls" DROP CONSTRAINT "posts_polls_polls_id_foreign";--> statement-breakpoint
ALTER TABLE "posts_polls" DROP CONSTRAINT "posts_polls_posts_id_foreign";--> statement-breakpoint
ALTER TABLE "product_attributes" DROP CONSTRAINT "product_attributes_attribute_id_foreign";--> statement-breakpoint
ALTER TABLE "product_attributes" DROP CONSTRAINT "product_attributes_product_id_foreign";--> statement-breakpoint
ALTER TABLE "product_types_products" DROP CONSTRAINT "product_types_products_product_types_id_foreign";--> statement-breakpoint
ALTER TABLE "product_types_products" DROP CONSTRAINT "product_types_products_products_id_foreign";--> statement-breakpoint
ALTER TABLE "products_attributes" DROP CONSTRAINT "products_attributes_attributes_id_foreign";--> statement-breakpoint
ALTER TABLE "products_attributes" DROP CONSTRAINT "products_attributes_products_id_foreign";--> statement-breakpoint
ALTER TABLE "products_categories" DROP CONSTRAINT "products_categories_categories_id_foreign";--> statement-breakpoint
ALTER TABLE "products_categories" DROP CONSTRAINT "products_categories_products_id_foreign";--> statement-breakpoint
ALTER TABLE "products_countries" DROP CONSTRAINT "products_countries_products_id_foreign";--> statement-breakpoint
ALTER TABLE "products_currency" DROP CONSTRAINT "products_currency_currency_id_foreign";--> statement-breakpoint
ALTER TABLE "products_currency" DROP CONSTRAINT "products_currency_products_id_foreign";--> statement-breakpoint
ALTER TABLE "products_departments" DROP CONSTRAINT "products_departments_departments_id_foreign";--> statement-breakpoint
ALTER TABLE "products_departments" DROP CONSTRAINT "products_departments_products_id_foreign";--> statement-breakpoint
ALTER TABLE "products_directus_users" DROP CONSTRAINT "products_directus_users_product_id_foreign";--> statement-breakpoint
ALTER TABLE "products_manufacturer" DROP CONSTRAINT "products_manufacturer_manufacturer_id_foreign";--> statement-breakpoint
ALTER TABLE "products_manufacturer" DROP CONSTRAINT "products_manufacturer_products_id_foreign";--> statement-breakpoint
ALTER TABLE "products_product_designer" DROP CONSTRAINT "products_product_designer_products_id_foreign";--> statement-breakpoint
ALTER TABLE "products_spaces" DROP CONSTRAINT "products_spaces_products_id_foreign";--> statement-breakpoint
ALTER TABLE "products_spaces" DROP CONSTRAINT "products_spaces_spaces_id_foreign";--> statement-breakpoint
ALTER TABLE "products_tags" DROP CONSTRAINT "products_tags_products_id_foreign";--> statement-breakpoint
ALTER TABLE "products_tags" DROP CONSTRAINT "products_tags_tags_id_foreign";--> statement-breakpoint
ALTER TABLE "products_websites" DROP CONSTRAINT "products_websites_products_id_foreign";--> statement-breakpoint
ALTER TABLE "products_websites" DROP CONSTRAINT "products_websites_websites_id_foreign";--> statement-breakpoint
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_avatar_foreign";--> statement-breakpoint
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_id_fkey";--> statement-breakpoint
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_role_foreign";--> statement-breakpoint
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_user_foreign";--> statement-breakpoint
ALTER TABLE "profiles_cities" DROP CONSTRAINT "profiles_cities_cities_id_foreign";--> statement-breakpoint
ALTER TABLE "profiles_cities" DROP CONSTRAINT "profiles_cities_profiles_id_foreign";--> statement-breakpoint
ALTER TABLE "profiles_countries" DROP CONSTRAINT "profiles_countries_countries_id_foreign";--> statement-breakpoint
ALTER TABLE "profiles_countries" DROP CONSTRAINT "profiles_countries_profiles_id_foreign";--> statement-breakpoint
ALTER TABLE "profiles_followers" DROP CONSTRAINT "profiles_followers_followers_id_foreign";--> statement-breakpoint
ALTER TABLE "profiles_followers" DROP CONSTRAINT "profiles_followers_profiles_id_foreign";--> statement-breakpoint
ALTER TABLE "profiles_states" DROP CONSTRAINT "profiles_states_profiles_id_foreign";--> statement-breakpoint
ALTER TABLE "profiles_states" DROP CONSTRAINT "profiles_states_states_id_foreign";--> statement-breakpoint
ALTER TABLE "project_board" DROP CONSTRAINT "project_board_user_created_foreign";--> statement-breakpoint
ALTER TABLE "project_board" DROP CONSTRAINT "project_board_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "project_board_comments" DROP CONSTRAINT "project_board_comments_comments_id_foreign";--> statement-breakpoint
ALTER TABLE "project_board_comments" DROP CONSTRAINT "project_board_comments_project_board_id_foreign";--> statement-breakpoint
ALTER TABLE "project_board_directus_users" DROP CONSTRAINT "project_board_directus_users_directus_users_id_foreign";--> statement-breakpoint
ALTER TABLE "project_board_directus_users" DROP CONSTRAINT "project_board_directus_users_project_board_id_foreign";--> statement-breakpoint
ALTER TABLE "project_board_files" DROP CONSTRAINT "project_board_files_directus_files_id_foreign";--> statement-breakpoint
ALTER TABLE "project_board_files" DROP CONSTRAINT "project_board_files_project_board_id_foreign";--> statement-breakpoint
ALTER TABLE "project_board_projects" DROP CONSTRAINT "project_board_projects_project_board_id_foreign";--> statement-breakpoint
ALTER TABLE "project_board_projects" DROP CONSTRAINT "project_board_projects_projects_id_foreign";--> statement-breakpoint
ALTER TABLE "projects" DROP CONSTRAINT "projects_icon_foreign";--> statement-breakpoint
ALTER TABLE "projects" DROP CONSTRAINT "projects_user_created_foreign";--> statement-breakpoint
ALTER TABLE "projects" DROP CONSTRAINT "projects_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "projects_calendar" DROP CONSTRAINT "projects_calendar_calendar_id_foreign";--> statement-breakpoint
ALTER TABLE "projects_calendar" DROP CONSTRAINT "projects_calendar_projects_id_foreign";--> statement-breakpoint
ALTER TABLE "projects_comments" DROP CONSTRAINT "projects_comments_comments_id_foreign";--> statement-breakpoint
ALTER TABLE "projects_comments" DROP CONSTRAINT "projects_comments_projects_id_foreign";--> statement-breakpoint
ALTER TABLE "projects_directus_users" DROP CONSTRAINT "projects_directus_users_directus_users_id_foreign";--> statement-breakpoint
ALTER TABLE "projects_directus_users" DROP CONSTRAINT "projects_directus_users_projects_id_foreign";--> statement-breakpoint
ALTER TABLE "projects_files" DROP CONSTRAINT "projects_files_directus_files_id_foreign";--> statement-breakpoint
ALTER TABLE "projects_files" DROP CONSTRAINT "projects_files_projects_id_foreign";--> statement-breakpoint
ALTER TABLE "projects_integrations" DROP CONSTRAINT "projects_integrations_integrations_id_foreign";--> statement-breakpoint
ALTER TABLE "projects_integrations" DROP CONSTRAINT "projects_integrations_projects_id_foreign";--> statement-breakpoint
ALTER TABLE "projects_lists" DROP CONSTRAINT "projects_lists_lists_id_foreign";--> statement-breakpoint
ALTER TABLE "projects_lists" DROP CONSTRAINT "projects_lists_projects_id_foreign";--> statement-breakpoint
ALTER TABLE "projects_products" DROP CONSTRAINT "projects_products_products_id_foreign";--> statement-breakpoint
ALTER TABLE "projects_products" DROP CONSTRAINT "projects_products_projects_id_foreign";--> statement-breakpoint
ALTER TABLE "projects_project_timeline" DROP CONSTRAINT "projects_project_timeline_project_timeline_id_foreign";--> statement-breakpoint
ALTER TABLE "projects_project_timeline" DROP CONSTRAINT "projects_project_timeline_projects_id_foreign";--> statement-breakpoint
ALTER TABLE "projects_region" DROP CONSTRAINT "projects_region_projects_id_foreign";--> statement-breakpoint
ALTER TABLE "projects_region" DROP CONSTRAINT "projects_region_region_id_foreign";--> statement-breakpoint
ALTER TABLE "radios" DROP CONSTRAINT "radios_file_foreign";--> statement-breakpoint
ALTER TABLE "radios" DROP CONSTRAINT "radios_image_foreign";--> statement-breakpoint
ALTER TABLE "radios" DROP CONSTRAINT "radios_user_created_foreign";--> statement-breakpoint
ALTER TABLE "radios" DROP CONSTRAINT "radios_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "radios_categories" DROP CONSTRAINT "radios_categories_categories_id_foreign";--> statement-breakpoint
ALTER TABLE "radios_categories" DROP CONSTRAINT "radios_categories_radios_id_foreign";--> statement-breakpoint
ALTER TABLE "radios_departments" DROP CONSTRAINT "radios_departments_departments_id_foreign";--> statement-breakpoint
ALTER TABLE "radios_departments" DROP CONSTRAINT "radios_departments_radios_id_foreign";--> statement-breakpoint
ALTER TABLE "radios_musicchart" DROP CONSTRAINT "radios_musicchart_radios_id_foreign";--> statement-breakpoint
ALTER TABLE "ratings" DROP CONSTRAINT "ratings_image_foreign";--> statement-breakpoint
ALTER TABLE "ratings_products" DROP CONSTRAINT "ratings_products_products_id_foreign";--> statement-breakpoint
ALTER TABLE "ratings_products" DROP CONSTRAINT "ratings_products_ratings_id_foreign";--> statement-breakpoint
ALTER TABLE "reactions" DROP CONSTRAINT "reactions_image_foreign";--> statement-breakpoint
ALTER TABLE "reactions" DROP CONSTRAINT "reactions_list_id_foreign";--> statement-breakpoint
ALTER TABLE "reactions" DROP CONSTRAINT "reactions_posts_foreign";--> statement-breakpoint
ALTER TABLE "reactions" DROP CONSTRAINT "reactions_product_foreign";--> statement-breakpoint
ALTER TABLE "reactions" DROP CONSTRAINT "reactions_space_id_foreign";--> statement-breakpoint
ALTER TABLE "reactions" DROP CONSTRAINT "reactions_user_foreign";--> statement-breakpoint
ALTER TABLE "reactions" DROP CONSTRAINT "reactions_user_id_foreign";--> statement-breakpoint
ALTER TABLE "reactions" DROP CONSTRAINT "reactions_video_id_foreign";--> statement-breakpoint
ALTER TABLE "reactions_comments" DROP CONSTRAINT "reactions_comments_comments_id_foreign";--> statement-breakpoint
ALTER TABLE "reactions_comments" DROP CONSTRAINT "reactions_comments_reactions_id_foreign";--> statement-breakpoint
ALTER TABLE "reactions_directus_users" DROP CONSTRAINT "reactions_directus_users_reaction_id_foreign";--> statement-breakpoint
ALTER TABLE "reactions_lists" DROP CONSTRAINT "reactions_lists_lists_id_foreign";--> statement-breakpoint
ALTER TABLE "reactions_lists" DROP CONSTRAINT "reactions_lists_reactions_id_foreign";--> statement-breakpoint
ALTER TABLE "reactions_posts" DROP CONSTRAINT "reactions_posts_posts_id_foreign";--> statement-breakpoint
ALTER TABLE "reactions_posts" DROP CONSTRAINT "reactions_posts_reactions_id_foreign";--> statement-breakpoint
ALTER TABLE "reactions_shorts" DROP CONSTRAINT "reactions_shorts_reactions_id_foreign";--> statement-breakpoint
ALTER TABLE "reactions_shorts" DROP CONSTRAINT "reactions_shorts_shorts_id_foreign";--> statement-breakpoint
ALTER TABLE "redirects" DROP CONSTRAINT "redirects_user_created_foreign";--> statement-breakpoint
ALTER TABLE "redirects" DROP CONSTRAINT "redirects_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "auth"."refresh_tokens" DROP CONSTRAINT "refresh_tokens_session_id_fkey";--> statement-breakpoint
ALTER TABLE "region_address" DROP CONSTRAINT "region_address_address_id_foreign";--> statement-breakpoint
ALTER TABLE "region_address" DROP CONSTRAINT "region_address_region_id_foreign";--> statement-breakpoint
ALTER TABLE "region_countries" DROP CONSTRAINT "region_countries_countries_id_foreign";--> statement-breakpoint
ALTER TABLE "region_countries" DROP CONSTRAINT "region_countries_region_id_foreign";--> statement-breakpoint
ALTER TABLE "region_shipping_address" DROP CONSTRAINT "region_shipping_address_region_id_foreign";--> statement-breakpoint
ALTER TABLE "region_shipping_address" DROP CONSTRAINT "region_shipping_address_shipping_address_id_foreign";--> statement-breakpoint
ALTER TABLE "related_products" DROP CONSTRAINT "related_products_user_foreign";--> statement-breakpoint
ALTER TABLE "related_products_products" DROP CONSTRAINT "related_products_products_products_id_foreign";--> statement-breakpoint
ALTER TABLE "related_products_products" DROP CONSTRAINT "related_products_products_related_products_id_foreign";--> statement-breakpoint
ALTER TABLE "report_comments" DROP CONSTRAINT "report_comments_comments_id_foreign";--> statement-breakpoint
ALTER TABLE "report_comments" DROP CONSTRAINT "report_comments_report_id_foreign";--> statement-breakpoint
ALTER TABLE "report_directus_users" DROP CONSTRAINT "report_directus_users_report_id_foreign";--> statement-breakpoint
ALTER TABLE "report_faqs" DROP CONSTRAINT "report_faqs_faqs_id_foreign";--> statement-breakpoint
ALTER TABLE "report_faqs" DROP CONSTRAINT "report_faqs_report_id_foreign";--> statement-breakpoint
ALTER TABLE "report_posts" DROP CONSTRAINT "report_posts_posts_id_foreign";--> statement-breakpoint
ALTER TABLE "report_posts" DROP CONSTRAINT "report_posts_report_id_foreign";--> statement-breakpoint
ALTER TABLE "report_products" DROP CONSTRAINT "report_products_products_id_foreign";--> statement-breakpoint
ALTER TABLE "report_products" DROP CONSTRAINT "report_products_report_id_foreign";--> statement-breakpoint
ALTER TABLE "report_spaces" DROP CONSTRAINT "report_spaces_report_id_foreign";--> statement-breakpoint
ALTER TABLE "report_spaces" DROP CONSTRAINT "report_spaces_spaces_id_foreign";--> statement-breakpoint
ALTER TABLE "returns_orders" DROP CONSTRAINT "returns_orders_orders_id_foreign";--> statement-breakpoint
ALTER TABLE "returns_orders" DROP CONSTRAINT "returns_orders_returns_id_foreign";--> statement-breakpoint
ALTER TABLE "returns_products" DROP CONSTRAINT "returns_products_products_id_foreign";--> statement-breakpoint
ALTER TABLE "returns_products" DROP CONSTRAINT "returns_products_returns_id_foreign";--> statement-breakpoint
ALTER TABLE "reviews_products" DROP CONSTRAINT "reviews_products_products_id_foreign";--> statement-breakpoint
ALTER TABLE "storage"."s3_multipart_uploads" DROP CONSTRAINT "s3_multipart_uploads_bucket_id_fkey";--> statement-breakpoint
ALTER TABLE "storage"."s3_multipart_uploads_parts" DROP CONSTRAINT "s3_multipart_uploads_parts_bucket_id_fkey";--> statement-breakpoint
ALTER TABLE "storage"."s3_multipart_uploads_parts" DROP CONSTRAINT "s3_multipart_uploads_parts_upload_id_fkey";--> statement-breakpoint
ALTER TABLE "auth"."saml_providers" DROP CONSTRAINT "saml_providers_sso_provider_id_fkey";--> statement-breakpoint
ALTER TABLE "auth"."saml_relay_states" DROP CONSTRAINT "saml_relay_states_flow_state_id_fkey";--> statement-breakpoint
ALTER TABLE "auth"."saml_relay_states" DROP CONSTRAINT "saml_relay_states_sso_provider_id_fkey";--> statement-breakpoint
ALTER TABLE "seasons" DROP CONSTRAINT "seasons_name_foreign";--> statement-breakpoint
ALTER TABLE "seasons_videos" DROP CONSTRAINT "seasons_videos_seasons_id_foreign";--> statement-breakpoint
ALTER TABLE "seasons_videos" DROP CONSTRAINT "seasons_videos_videos_id_foreign";--> statement-breakpoint
ALTER TABLE "auth"."sessions" DROP CONSTRAINT "sessions_oauth_client_id_fkey";--> statement-breakpoint
ALTER TABLE "auth"."sessions" DROP CONSTRAINT "sessions_user_id_fkey";--> statement-breakpoint
ALTER TABLE "shipment" DROP CONSTRAINT "shipment_order_foreign";--> statement-breakpoint
ALTER TABLE "shipment_address" DROP CONSTRAINT "shipment_address_address_id_foreign";--> statement-breakpoint
ALTER TABLE "shipment_address" DROP CONSTRAINT "shipment_address_shipment_id_foreign";--> statement-breakpoint
ALTER TABLE "shipment_comments" DROP CONSTRAINT "shipment_comments_parent_id_foreign";--> statement-breakpoint
ALTER TABLE "shipment_products" DROP CONSTRAINT "shipment_products_products_id_foreign";--> statement-breakpoint
ALTER TABLE "shipment_products" DROP CONSTRAINT "shipment_products_shipment_id_foreign";--> statement-breakpoint
ALTER TABLE "shipment_tracking" DROP CONSTRAINT "shipment_tracking_parent_id_foreign";--> statement-breakpoint
ALTER TABLE "shipping_addresses_cities" DROP CONSTRAINT "shipping_addresses_cities_cities_id_foreign";--> statement-breakpoint
ALTER TABLE "shipping_addresses_cities" DROP CONSTRAINT "shipping_addresses_cities_shipping_addresses_id_foreign";--> statement-breakpoint
ALTER TABLE "shipping_addresses_countries" DROP CONSTRAINT "shipping_addresses_countries_countries_id_foreign";--> statement-breakpoint
ALTER TABLE "shipping_addresses_countries" DROP CONSTRAINT "shipping_addresses_countries_shipping_addresses_id_foreign";--> statement-breakpoint
ALTER TABLE "shipping_addresses_directus_users" DROP CONSTRAINT "shipping_addresses_directus_users_directus_users_id_foreign";--> statement-breakpoint
ALTER TABLE "shipping_addresses_directus_users" DROP CONSTRAINT "shipping_addresses_directus_users_shipping__1c96539d_foreign";--> statement-breakpoint
ALTER TABLE "shipping_addresses_orders" DROP CONSTRAINT "shipping_addresses_orders_orders_id_foreign";--> statement-breakpoint
ALTER TABLE "shipping_addresses_orders" DROP CONSTRAINT "shipping_addresses_orders_shipping_addresses_id_foreign";--> statement-breakpoint
ALTER TABLE "shipping_addresses_states" DROP CONSTRAINT "shipping_addresses_states_shipping_addresses_id_foreign";--> statement-breakpoint
ALTER TABLE "shipping_addresses_states" DROP CONSTRAINT "shipping_addresses_states_states_id_foreign";--> statement-breakpoint
ALTER TABLE "shop_type_shops" DROP CONSTRAINT "shop_type_shops_shop_type_id_foreign";--> statement-breakpoint
ALTER TABLE "shop_type_shops" DROP CONSTRAINT "shop_type_shops_shops_id_foreign";--> statement-breakpoint
ALTER TABLE "shops_agreements" DROP CONSTRAINT "shops_agreements_shops_id_foreign";--> statement-breakpoint
ALTER TABLE "shops_categories" DROP CONSTRAINT "shops_categories_categories_id_foreign";--> statement-breakpoint
ALTER TABLE "shops_categories" DROP CONSTRAINT "shops_categories_shops_id_foreign";--> statement-breakpoint
ALTER TABLE "shops_comments" DROP CONSTRAINT "shops_comments_comments_id_foreign";--> statement-breakpoint
ALTER TABLE "shops_comments" DROP CONSTRAINT "shops_comments_shops_id_foreign";--> statement-breakpoint
ALTER TABLE "shops_countries" DROP CONSTRAINT "shops_countries_countries_id_foreign";--> statement-breakpoint
ALTER TABLE "shops_countries" DROP CONSTRAINT "shops_countries_shops_id_foreign";--> statement-breakpoint
ALTER TABLE "shops_departments" DROP CONSTRAINT "shops_departments_departments_id_foreign";--> statement-breakpoint
ALTER TABLE "shops_departments" DROP CONSTRAINT "shops_departments_shops_id_foreign";--> statement-breakpoint
ALTER TABLE "shops_directus_users" DROP CONSTRAINT "shops_directus_users_shops_id_foreign";--> statement-breakpoint
ALTER TABLE "shops_files" DROP CONSTRAINT "shops_files_shops_id_foreign";--> statement-breakpoint
ALTER TABLE "shops_products" DROP CONSTRAINT "shops_products_products_id_foreign";--> statement-breakpoint
ALTER TABLE "shops_products" DROP CONSTRAINT "shops_products_shops_id_foreign";--> statement-breakpoint
ALTER TABLE "shops_showcases" DROP CONSTRAINT "shops_showcases_shops_id_foreign";--> statement-breakpoint
ALTER TABLE "shops_showcases" DROP CONSTRAINT "shops_showcases_showcases_id_foreign";--> statement-breakpoint
ALTER TABLE "shorts" DROP CONSTRAINT "shorts_video_foreign";--> statement-breakpoint
ALTER TABLE "shorts_directus_users" DROP CONSTRAINT "shorts_directus_users_shorts_id_foreign";--> statement-breakpoint
ALTER TABLE "shorts_files" DROP CONSTRAINT "shorts_files_directus_files_id_foreign";--> statement-breakpoint
ALTER TABLE "shorts_files" DROP CONSTRAINT "shorts_files_shorts_id_foreign";--> statement-breakpoint
ALTER TABLE "shorts_products" DROP CONSTRAINT "shorts_products_products_id_foreign";--> statement-breakpoint
ALTER TABLE "shorts_products" DROP CONSTRAINT "shorts_products_shorts_id_foreign";--> statement-breakpoint
ALTER TABLE "shorts_spaces" DROP CONSTRAINT "shorts_spaces_shorts_id_foreign";--> statement-breakpoint
ALTER TABLE "shorts_spaces" DROP CONSTRAINT "shorts_spaces_spaces_id_foreign";--> statement-breakpoint
ALTER TABLE "showcases" DROP CONSTRAINT "showcases_owner_foreign";--> statement-breakpoint
ALTER TABLE "showcases_products" DROP CONSTRAINT "showcases_products_products_id_foreign";--> statement-breakpoint
ALTER TABLE "showcases_products" DROP CONSTRAINT "showcases_products_showcases_id_foreign";--> statement-breakpoint
ALTER TABLE "showcases_shops" DROP CONSTRAINT "showcases_shops_shops_id_foreign";--> statement-breakpoint
ALTER TABLE "showcases_shops" DROP CONSTRAINT "showcases_shops_showcases_id_foreign";--> statement-breakpoint
ALTER TABLE "showcases_spaces" DROP CONSTRAINT "showcases_spaces_showcases_id_foreign";--> statement-breakpoint
ALTER TABLE "showcases_spaces" DROP CONSTRAINT "showcases_spaces_spaces_id_foreign";--> statement-breakpoint
ALTER TABLE "site_preference_categories" DROP CONSTRAINT "site_preference_categories_categories_id_foreign";--> statement-breakpoint
ALTER TABLE "site_preference_countries" DROP CONSTRAINT "site_preference_countries_countries_id_foreign";--> statement-breakpoint
ALTER TABLE "site_preference_departments" DROP CONSTRAINT "site_preference_departments_departments_id_foreign";--> statement-breakpoint
ALTER TABLE "site_preference_products" DROP CONSTRAINT "site_preference_products_products_id_foreign";--> statement-breakpoint
ALTER TABLE "Space_products" DROP CONSTRAINT "space_products_products_id_foreign";--> statement-breakpoint
ALTER TABLE "space_types" DROP CONSTRAINT "space_types_icon_foreign";--> statement-breakpoint
ALTER TABLE "spaces" DROP CONSTRAINT "spaces_cover_image_foreign";--> statement-breakpoint
ALTER TABLE "spaces" DROP CONSTRAINT "spaces_image_foreign";--> statement-breakpoint
ALTER TABLE "spaces" DROP CONSTRAINT "spaces_owner_foreign";--> statement-breakpoint
ALTER TABLE "spaces" DROP CONSTRAINT "spaces_user_created_foreign";--> statement-breakpoint
ALTER TABLE "spaces" DROP CONSTRAINT "spaces_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "spaces_articles" DROP CONSTRAINT "spaces_articles_articles_id_foreign";--> statement-breakpoint
ALTER TABLE "spaces_articles" DROP CONSTRAINT "spaces_articles_spaces_id_foreign";--> statement-breakpoint
ALTER TABLE "spaces_cities" DROP CONSTRAINT "spaces_cities_cities_id_foreign";--> statement-breakpoint
ALTER TABLE "spaces_cities" DROP CONSTRAINT "spaces_cities_spaces_id_foreign";--> statement-breakpoint
ALTER TABLE "spaces_countries" DROP CONSTRAINT "spaces_countries_countries_id_foreign";--> statement-breakpoint
ALTER TABLE "spaces_countries" DROP CONSTRAINT "spaces_countries_spaces_id_foreign";--> statement-breakpoint
ALTER TABLE "spaces_departments" DROP CONSTRAINT "spaces_departments_departments_id_foreign";--> statement-breakpoint
ALTER TABLE "spaces_departments" DROP CONSTRAINT "spaces_departments_spaces_id_foreign";--> statement-breakpoint
ALTER TABLE "spaces_directus_users" DROP CONSTRAINT "spaces_directus_users_directus_users_id_foreign";--> statement-breakpoint
ALTER TABLE "spaces_directus_users" DROP CONSTRAINT "spaces_directus_users_spaces_id_foreign";--> statement-breakpoint
ALTER TABLE "spaces_files" DROP CONSTRAINT "spaces_files_directus_files_id_foreign";--> statement-breakpoint
ALTER TABLE "spaces_files" DROP CONSTRAINT "spaces_files_spaces_id_foreign";--> statement-breakpoint
ALTER TABLE "spaces_lists" DROP CONSTRAINT "spaces_lists_lists_id_foreign";--> statement-breakpoint
ALTER TABLE "spaces_lists" DROP CONSTRAINT "spaces_lists_spaces_id_foreign";--> statement-breakpoint
ALTER TABLE "spaces_live_rooms" DROP CONSTRAINT "spaces_live_rooms_spaces_id_foreign";--> statement-breakpoint
ALTER TABLE "spaces_pages" DROP CONSTRAINT "spaces_pages_pages_id_foreign";--> statement-breakpoint
ALTER TABLE "spaces_pages" DROP CONSTRAINT "spaces_pages_spaces_id_foreign";--> statement-breakpoint
ALTER TABLE "spaces_posts" DROP CONSTRAINT "spaces_posts_posts_id_foreign";--> statement-breakpoint
ALTER TABLE "spaces_posts" DROP CONSTRAINT "spaces_posts_spaces_id_foreign";--> statement-breakpoint
ALTER TABLE "spaces_shop_type" DROP CONSTRAINT "spaces_shop_type_shop_type_id_foreign";--> statement-breakpoint
ALTER TABLE "spaces_shop_type" DROP CONSTRAINT "spaces_shop_type_spaces_id_foreign";--> statement-breakpoint
ALTER TABLE "spaces_space_types" DROP CONSTRAINT "spaces_space_types_space_types_id_foreign";--> statement-breakpoint
ALTER TABLE "spaces_space_types" DROP CONSTRAINT "spaces_space_types_spaces_id_foreign";--> statement-breakpoint
ALTER TABLE "spaces_states" DROP CONSTRAINT "spaces_states_spaces_id_foreign";--> statement-breakpoint
ALTER TABLE "spaces_states" DROP CONSTRAINT "spaces_states_states_id_foreign";--> statement-breakpoint
ALTER TABLE "spaces_tags" DROP CONSTRAINT "spaces_tags_spaces_id_foreign";--> statement-breakpoint
ALTER TABLE "spaces_tags" DROP CONSTRAINT "spaces_tags_tags_id_foreign";--> statement-breakpoint
ALTER TABLE "spaces_templates" DROP CONSTRAINT "spaces_templates_spaces_id_foreign";--> statement-breakpoint
ALTER TABLE "spaces_templates" DROP CONSTRAINT "spaces_templates_templates_id_foreign";--> statement-breakpoint
ALTER TABLE "auth"."sso_domains" DROP CONSTRAINT "sso_domains_sso_provider_id_fkey";--> statement-breakpoint
ALTER TABLE "states_cities" DROP CONSTRAINT "states_cities_cities_id_foreign";--> statement-breakpoint
ALTER TABLE "states_cities" DROP CONSTRAINT "states_cities_states_id_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."stories_characters" DROP CONSTRAINT "stories_characters_characters_id_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."stories_characters" DROP CONSTRAINT "stories_characters_stories_id_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."stories" DROP CONSTRAINT "stories_image_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."stories" DROP CONSTRAINT "stories_user_created_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."stories" DROP CONSTRAINT "stories_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."stories_tags" DROP CONSTRAINT "stories_tags_stories_id_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."stories_tags" DROP CONSTRAINT "stories_tags_tags_id_foreign";--> statement-breakpoint
ALTER TABLE "streams" DROP CONSTRAINT "streams_stream_id_foreign";--> statement-breakpoint
ALTER TABLE "streams_ratings" DROP CONSTRAINT "streams_ratings_ratings_id_foreign";--> statement-breakpoint
ALTER TABLE "streams_ratings" DROP CONSTRAINT "streams_ratings_streams_id_foreign";--> statement-breakpoint
ALTER TABLE "subscriptions_directus_users" DROP CONSTRAINT "subscriptions_directus_users_subscriptions_id_foreign";--> statement-breakpoint
ALTER TABLE "subscriptions_products" DROP CONSTRAINT "subscriptions_products_products_id_foreign";--> statement-breakpoint
ALTER TABLE "subscriptions_products" DROP CONSTRAINT "subscriptions_products_subscriptions_id_foreign";--> statement-breakpoint
ALTER TABLE "tags_articles" DROP CONSTRAINT "tags_articles_articles_id_foreign";--> statement-breakpoint
ALTER TABLE "tags_articles" DROP CONSTRAINT "tags_articles_tags_id_foreign";--> statement-breakpoint
ALTER TABLE "tags_categories" DROP CONSTRAINT "tags_categories_categories_id_foreign";--> statement-breakpoint
ALTER TABLE "tags_categories" DROP CONSTRAINT "tags_categories_tags_id_foreign";--> statement-breakpoint
ALTER TABLE "tags_departments" DROP CONSTRAINT "tags_departments_departments_id_foreign";--> statement-breakpoint
ALTER TABLE "tags_departments" DROP CONSTRAINT "tags_departments_tags_id_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."tags" DROP CONSTRAINT "tags_image_foreign";--> statement-breakpoint
ALTER TABLE "tags_posts" DROP CONSTRAINT "tags_posts_posts_id_foreign";--> statement-breakpoint
ALTER TABLE "tags_posts" DROP CONSTRAINT "tags_posts_tags_id_foreign";--> statement-breakpoint
ALTER TABLE "tags_products" DROP CONSTRAINT "tags_products_products_id_foreign";--> statement-breakpoint
ALTER TABLE "tags_products" DROP CONSTRAINT "tags_products_tags_id_foreign";--> statement-breakpoint
ALTER TABLE "tags_shorts" DROP CONSTRAINT "tags_shorts_shorts_id_foreign";--> statement-breakpoint
ALTER TABLE "tags_shorts" DROP CONSTRAINT "tags_shorts_tags_id_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."tags_videos" DROP CONSTRAINT "tags_videos_tags_id_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."tags_videos" DROP CONSTRAINT "tags_videos_videos_id_foreign";--> statement-breakpoint
ALTER TABLE "taxes_countries" DROP CONSTRAINT "taxes_countries_countries_id_foreign";--> statement-breakpoint
ALTER TABLE "taxes_countries" DROP CONSTRAINT "taxes_countries_taxes_id_foreign";--> statement-breakpoint
ALTER TABLE "taxes_states" DROP CONSTRAINT "taxes_states_states_id_foreign";--> statement-breakpoint
ALTER TABLE "taxes_states" DROP CONSTRAINT "taxes_states_taxes_id_foreign";--> statement-breakpoint
ALTER TABLE "team" DROP CONSTRAINT "team_image_foreign";--> statement-breakpoint
ALTER TABLE "team" DROP CONSTRAINT "team_user_created_foreign";--> statement-breakpoint
ALTER TABLE "team" DROP CONSTRAINT "team_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "templates" DROP CONSTRAINT "templates_user_created_foreign";--> statement-breakpoint
ALTER TABLE "templates" DROP CONSTRAINT "templates_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "templates_space_types" DROP CONSTRAINT "templates_space_types_space_types_id_foreign";--> statement-breakpoint
ALTER TABLE "templates_space_types" DROP CONSTRAINT "templates_space_types_templates_id_foreign";--> statement-breakpoint
ALTER TABLE "testimonials" DROP CONSTRAINT "testimonials_company_logo_foreign";--> statement-breakpoint
ALTER TABLE "testimonials" DROP CONSTRAINT "testimonials_image_foreign";--> statement-breakpoint
ALTER TABLE "testimonials" DROP CONSTRAINT "testimonials_user_created_foreign";--> statement-breakpoint
ALTER TABLE "testimonials" DROP CONSTRAINT "testimonials_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_order_foreign";--> statement-breakpoint
ALTER TABLE "transactions_currency" DROP CONSTRAINT "transactions_currency_currency_id_foreign";--> statement-breakpoint
ALTER TABLE "transactions_currency" DROP CONSTRAINT "transactions_currency_transactions_id_foreign";--> statement-breakpoint
ALTER TABLE "translations_postgresstores" DROP CONSTRAINT "translations_postgresstores_postgresstores_id_foreign";--> statement-breakpoint
ALTER TABLE "translations_postgresstores" DROP CONSTRAINT "translations_postgresstores_translations_id_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."types_characters" DROP CONSTRAINT "types_characters_characters_id_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."types_characters" DROP CONSTRAINT "types_characters_types_id_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."types" DROP CONSTRAINT "types_image_foreign";--> statement-breakpoint
ALTER TABLE "user_friends" DROP CONSTRAINT "user_friends_friend_foreign";--> statement-breakpoint
ALTER TABLE "user_friends" DROP CONSTRAINT "user_friends_user_foreign";--> statement-breakpoint
ALTER TABLE "user_friends_posts" DROP CONSTRAINT "user_friends_posts_posts_id_foreign";--> statement-breakpoint
ALTER TABLE "user_friends_posts" DROP CONSTRAINT "user_friends_posts_user_friends_id_foreign";--> statement-breakpoint
ALTER TABLE "user_profile" DROP CONSTRAINT "user_profile_avatar_foreign";--> statement-breakpoint
ALTER TABLE "user_profile" DROP CONSTRAINT "user_profile_user_foreign";--> statement-breakpoint
ALTER TABLE "user_profile" DROP CONSTRAINT "user_profile_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "variants" DROP CONSTRAINT "variants_product_id_fkey";--> statement-breakpoint
ALTER TABLE "storage"."vector_indexes" DROP CONSTRAINT "vector_indexes_bucket_id_fkey";--> statement-breakpoint
ALTER TABLE "vibez_product_map" DROP CONSTRAINT "vibez_product_map_clip_id_fkey";--> statement-breakpoint
ALTER TABLE "vibez_product_map" DROP CONSTRAINT "vibez_product_map_product_id_fkey";--> statement-breakpoint
ALTER TABLE "videos" DROP CONSTRAINT "videos_distributor_foreign";--> statement-breakpoint
ALTER TABLE "videos" DROP CONSTRAINT "videos_media_foreign";--> statement-breakpoint
ALTER TABLE "videos" DROP CONSTRAINT "videos_ratings_foreign";--> statement-breakpoint
ALTER TABLE "videos" DROP CONSTRAINT "videos_thumbnail_foreign";--> statement-breakpoint
ALTER TABLE "videos" DROP CONSTRAINT "videos_user_created_foreign";--> statement-breakpoint
ALTER TABLE "videos" DROP CONSTRAINT "videos_user_foreign";--> statement-breakpoint
ALTER TABLE "videos" DROP CONSTRAINT "videos_user_updated_foreign";--> statement-breakpoint
ALTER TABLE "videos_categories" DROP CONSTRAINT "videos_categories_categories_id_foreign";--> statement-breakpoint
ALTER TABLE "videos_categories" DROP CONSTRAINT "videos_categories_videos_id_foreign";--> statement-breakpoint
ALTER TABLE "videos_comments" DROP CONSTRAINT "videos_comments_comments_id_foreign";--> statement-breakpoint
ALTER TABLE "videos_comments" DROP CONSTRAINT "videos_comments_videos_id_foreign";--> statement-breakpoint
ALTER TABLE "videos_departments" DROP CONSTRAINT "videos_departments_departments_id_foreign";--> statement-breakpoint
ALTER TABLE "videos_departments" DROP CONSTRAINT "videos_departments_videos_id_foreign";--> statement-breakpoint
ALTER TABLE "enovels"."videos" DROP CONSTRAINT "videos_file_foreign";--> statement-breakpoint
ALTER TABLE "videos_manufacturer" DROP CONSTRAINT "videos_manufacturer_manufacturer_id_foreign";--> statement-breakpoint
ALTER TABLE "videos_manufacturer" DROP CONSTRAINT "videos_manufacturer_videos_id_foreign";--> statement-breakpoint
ALTER TABLE "videos_product_types" DROP CONSTRAINT "videos_product_types_product_types_id_foreign";--> statement-breakpoint
ALTER TABLE "videos_product_types" DROP CONSTRAINT "videos_product_types_videos_id_foreign";--> statement-breakpoint
ALTER TABLE "videos_products" DROP CONSTRAINT "videos_products_products_id_foreign";--> statement-breakpoint
ALTER TABLE "videos_products" DROP CONSTRAINT "videos_products_videos_id_foreign";--> statement-breakpoint
ALTER TABLE "videos_tags" DROP CONSTRAINT "videos_tags_tags_id_foreign";--> statement-breakpoint
ALTER TABLE "videos_tags" DROP CONSTRAINT "videos_tags_videos_id_foreign";--> statement-breakpoint
ALTER TABLE "auth"."webauthn_challenges" DROP CONSTRAINT "webauthn_challenges_user_id_fkey";--> statement-breakpoint
ALTER TABLE "auth"."webauthn_credentials" DROP CONSTRAINT "webauthn_credentials_user_id_fkey";--> statement-breakpoint
ALTER TABLE "websites" DROP CONSTRAINT "websites_creator_foreign";--> statement-breakpoint
ALTER TABLE "attributes" DROP CONSTRAINT "product_attribute_pkey";--> statement-breakpoint
ALTER TABLE "digiboard" DROP CONSTRAINT "product_attribute_set_pkey";--> statement-breakpoint
ALTER TABLE "auth"."mfa_amr_claims" DROP CONSTRAINT "amr_id_pk";--> statement-breakpoint
ALTER TABLE "meevendure"."migrations" DROP CONSTRAINT "PK_8c82d7f526340ab734260ea46be";--> statement-breakpoint
ALTER TABLE "newsletters" DROP CONSTRAINT "newsletter_subscribers_pkey";--> statement-breakpoint
ALTER TABLE "realtime"."subscription" DROP CONSTRAINT "pk_subscription";--> statement-breakpoint
ALTER TABLE "organization_members" ADD COLUMN "id" uuid DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "organization_members" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "organization_members" ADD COLUMN "organization_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "organization_members" ADD COLUMN "role" varchar(255) DEFAULT 'member' NOT NULL;--> statement-breakpoint
ALTER TABLE "organization_members" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "attributes" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "digiboard" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "auth"."mfa_amr_claims" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "meevendure"."migrations" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "newsletters" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "organization_members" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "realtime"."subscription" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "pgsodium"."key" ALTER COLUMN "key_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "os_payments" ALTER COLUMN "amount" SET DEFAULT NULL;--> statement-breakpoint
ALTER TABLE "os_expenses" ALTER COLUMN "cost" SET DEFAULT NULL;--> statement-breakpoint
ALTER TABLE "os_tax_rates" ALTER COLUMN "rate" SET DEFAULT NULL;--> statement-breakpoint
ALTER TABLE "os_items" ALTER COLUMN "unit_price" SET DEFAULT NULL;--> statement-breakpoint
ALTER TABLE "os_invoice_items" ALTER COLUMN "tax_amount" SET DEFAULT NULL;--> statement-breakpoint
ALTER TABLE "os_invoice_items" ALTER COLUMN "unit_price" SET DEFAULT NULL;--> statement-breakpoint
ALTER TABLE "os_invoice_items" ALTER COLUMN "quantity" SET DEFAULT NULL;--> statement-breakpoint
ALTER TABLE "os_items" ALTER COLUMN "unit_cost" SET DEFAULT NULL;--> statement-breakpoint
ALTER TABLE "os_invoice_items" ALTER COLUMN "line_amount" SET DEFAULT NULL;--> statement-breakpoint
ALTER TABLE "os_invoices" ALTER COLUMN "subtotal" SET DEFAULT NULL;--> statement-breakpoint
ALTER TABLE "os_invoices" ALTER COLUMN "total_tax" SET DEFAULT NULL;--> statement-breakpoint
ALTER TABLE "os_invoices" ALTER COLUMN "total" SET DEFAULT NULL;--> statement-breakpoint
ALTER TABLE "os_invoices" ALTER COLUMN "amount_paid" SET DEFAULT NULL;--> statement-breakpoint
ALTER TABLE "os_invoices" ALTER COLUMN "amount_due" SET DEFAULT NULL;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_user_org_unique" UNIQUE("user_id","organization_id");--> statement-breakpoint
CREATE INDEX "organization_members_user_id_idx" ON "organization_members" ("user_id");--> statement-breakpoint
CREATE INDEX "organization_members_organization_id_idx" ON "organization_members" ("organization_id");--> statement-breakpoint
ALTER TABLE "about_departments_articles" ADD CONSTRAINT "about_departments_articles_articles_id_articles_id_fkey" FOREIGN KEY ("articles_id") REFERENCES "articles"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "about_departments_pages" ADD CONSTRAINT "about_departments_pages_pages_id_pages_id_fkey" FOREIGN KEY ("pages_id") REFERENCES "pages"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "about_departments_platform" ADD CONSTRAINT "about_departments_platform_platform_id_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "platform"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "address_cart" ADD CONSTRAINT "address_cart_address_id_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "address"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "address_cart" ADD CONSTRAINT "address_cart_cart_id_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "cart"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "address_cities" ADD CONSTRAINT "address_cities_address_id_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "address"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "address_cities" ADD CONSTRAINT "address_cities_cities_id_cities_id_fkey" FOREIGN KEY ("cities_id") REFERENCES "cities"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "address_countries" ADD CONSTRAINT "address_countries_address_id_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "address"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "address_countries" ADD CONSTRAINT "address_countries_countries_id_countries_id_fkey" FOREIGN KEY ("countries_id") REFERENCES "countries"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "address_directus_users" ADD CONSTRAINT "address_directus_users_address_id_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "address"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "agreements_products" ADD CONSTRAINT "agreements_products_products_id_products_id_fkey" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "ai_prompts" ADD CONSTRAINT "ai_prompts_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "ai_prompts" ADD CONSTRAINT "ai_prompts_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_image_directus_files_id_fkey" FOREIGN KEY ("image") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_author_directus_users_id_fkey" FOREIGN KEY ("author") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "articles_categories" ADD CONSTRAINT "articles_categories_articles_id_articles_id_fkey" FOREIGN KEY ("articles_id") REFERENCES "articles"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "articles_categories" ADD CONSTRAINT "articles_categories_categories_id_categories_id_fkey" FOREIGN KEY ("categories_id") REFERENCES "categories"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "articles_comments" ADD CONSTRAINT "articles_comments_articles_id_articles_id_fkey" FOREIGN KEY ("articles_id") REFERENCES "articles"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "articles_comments" ADD CONSTRAINT "articles_comments_comments_id_comments_id_fkey" FOREIGN KEY ("comments_id") REFERENCES "comments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "articles_departments" ADD CONSTRAINT "articles_departments_articles_id_articles_id_fkey" FOREIGN KEY ("articles_id") REFERENCES "articles"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "articles_departments" ADD CONSTRAINT "articles_departments_departments_id_departments_id_fkey" FOREIGN KEY ("departments_id") REFERENCES "departments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "attributes_product_types" ADD CONSTRAINT "attributes_product_types_attributes_id_attributes_id_fkey" FOREIGN KEY ("attributes_id") REFERENCES "attributes"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "attributes_product_types" ADD CONSTRAINT "attributes_product_types_product_types_id_product_types_id_fkey" FOREIGN KEY ("product_types_id") REFERENCES "product_types"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "attributes_products" ADD CONSTRAINT "attributes_products_attributes_id_attributes_id_fkey" FOREIGN KEY ("attributes_id") REFERENCES "attributes"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "attributes_products" ADD CONSTRAINT "attributes_products_products_id_products_id_fkey" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "auction_lots" ADD CONSTRAINT "auction_lots_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id");--> statement-breakpoint
ALTER TABLE "bids" ADD CONSTRAINT "bids_lot_id_auction_lots_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "auction_lots"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "block_button" ADD CONSTRAINT "block_button_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "block_button" ADD CONSTRAINT "block_button_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "block_button" ADD CONSTRAINT "block_button_button_group_block_button_group_id_fkey" FOREIGN KEY ("button_group") REFERENCES "block_button_group"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "block_button_group" ADD CONSTRAINT "block_button_group_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "block_button_group" ADD CONSTRAINT "block_button_group_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "block_columns_rows" ADD CONSTRAINT "block_columns_rows_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "block_columns_rows" ADD CONSTRAINT "block_columns_rows_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "block_columns_rows" ADD CONSTRAINT "block_columns_rows_block_columns_block_columns_id_fkey" FOREIGN KEY ("block_columns") REFERENCES "block_columns"("id");--> statement-breakpoint
ALTER TABLE "block_columns_rows" ADD CONSTRAINT "block_columns_rows_image_directus_files_id_fkey" FOREIGN KEY ("image") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "block_columns_rows" ADD CONSTRAINT "block_columns_rows_button_group_block_button_group_id_fkey" FOREIGN KEY ("button_group") REFERENCES "block_button_group"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "block_cta" ADD CONSTRAINT "block_cta_button_group_block_button_group_id_fkey" FOREIGN KEY ("button_group") REFERENCES "block_button_group"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "block_form" ADD CONSTRAINT "block_form_form_forms_id_fkey" FOREIGN KEY ("form") REFERENCES "forms"("id");--> statement-breakpoint
ALTER TABLE "block_gallery_files" ADD CONSTRAINT "block_gallery_files_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "block_gallery_files" ADD CONSTRAINT "block_gallery_files_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "block_gallery_files" ADD CONSTRAINT "block_gallery_files_block_gallery_id_block_gallery_id_fkey" FOREIGN KEY ("block_gallery_id") REFERENCES "block_gallery"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "block_gallery_files" ADD CONSTRAINT "block_gallery_files_directus_files_id_directus_files_id_fkey" FOREIGN KEY ("directus_files_id") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "block_hero" ADD CONSTRAINT "block_hero_image_directus_files_id_fkey" FOREIGN KEY ("image") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "block_hero" ADD CONSTRAINT "block_hero_button_group_block_button_group_id_fkey" FOREIGN KEY ("button_group") REFERENCES "block_button_group"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "block_logocloud_logos" ADD CONSTRAINT "block_logocloud_logos_mW3gzfjp0vnD_fkey" FOREIGN KEY ("block_logocloud_id") REFERENCES "block_logocloud"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "block_logocloud_logos" ADD CONSTRAINT "block_logocloud_logos_directus_files_id_directus_files_id_fkey" FOREIGN KEY ("directus_files_id") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "block_step_items" ADD CONSTRAINT "block_step_items_image_directus_files_id_fkey" FOREIGN KEY ("image") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "block_step_items" ADD CONSTRAINT "block_step_items_block_steps_block_steps_id_fkey" FOREIGN KEY ("block_steps") REFERENCES "block_steps"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "block_step_items" ADD CONSTRAINT "block_step_items_button_group_block_button_group_id_fkey" FOREIGN KEY ("button_group") REFERENCES "block_button_group"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "block_testimonial_slider_items" ADD CONSTRAINT "block_testimonial_slider_items_saOUlIsn9GQY_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "block_testimonial_slider_items" ADD CONSTRAINT "block_testimonial_slider_items_DMVHo2mpHj5F_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "block_testimonial_slider_items" ADD CONSTRAINT "block_testimonial_slider_items_rg33SM5dK3zj_fkey" FOREIGN KEY ("block_testimonial_slider_id") REFERENCES "block_testimonials"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "block_testimonial_slider_items" ADD CONSTRAINT "block_testimonial_slider_items_NhaxxTdSum8i_fkey" FOREIGN KEY ("testimonials_id") REFERENCES "testimonials"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "block_video" ADD CONSTRAINT "block_video_video_file_directus_files_id_fkey" FOREIGN KEY ("video_file") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."blog" ADD CONSTRAINT "blog_image_directus_files_id_fkey" FOREIGN KEY ("image") REFERENCES "enovels"."directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."blog" ADD CONSTRAINT "blog_file_directus_files_id_fkey" FOREIGN KEY ("file") REFERENCES "enovels"."directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "brands" ADD CONSTRAINT "brands_image_directus_files_id_fkey" FOREIGN KEY ("image") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "brands_categories" ADD CONSTRAINT "brands_categories_brands_id_brands_id_fkey" FOREIGN KEY ("brands_id") REFERENCES "brands"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "brands_categories" ADD CONSTRAINT "brands_categories_categories_id_categories_id_fkey" FOREIGN KEY ("categories_id") REFERENCES "categories"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "brands_departments" ADD CONSTRAINT "brands_departments_brands_id_brands_id_fkey" FOREIGN KEY ("brands_id") REFERENCES "brands"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "brands_departments" ADD CONSTRAINT "brands_departments_departments_id_departments_id_fkey" FOREIGN KEY ("departments_id") REFERENCES "departments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "brands_manufacturer" ADD CONSTRAINT "brands_manufacturer_brands_id_brands_id_fkey" FOREIGN KEY ("brands_id") REFERENCES "brands"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "brands_manufacturer" ADD CONSTRAINT "brands_manufacturer_manufacturer_id_manufacturer_id_fkey" FOREIGN KEY ("manufacturer_id") REFERENCES "manufacturer"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "brands_products" ADD CONSTRAINT "brands_products_brands_id_brands_id_fkey" FOREIGN KEY ("brands_id") REFERENCES "brands"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "brands_products" ADD CONSTRAINT "brands_products_products_id_products_id_fkey" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "brands_shorts" ADD CONSTRAINT "brands_shorts_brands_id_brands_id_fkey" FOREIGN KEY ("brands_id") REFERENCES "brands"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "brands_shorts" ADD CONSTRAINT "brands_shorts_shorts_id_shorts_id_fkey" FOREIGN KEY ("shorts_id") REFERENCES "shorts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "calendar" ADD CONSTRAINT "calendar_image_directus_files_id_fkey" FOREIGN KEY ("image") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "calendar_comments" ADD CONSTRAINT "calendar_comments_calendar_id_calendar_id_fkey" FOREIGN KEY ("calendar_id") REFERENCES "calendar"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "calendar_comments" ADD CONSTRAINT "calendar_comments_comments_id_comments_id_fkey" FOREIGN KEY ("comments_id") REFERENCES "comments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "calendar_directus_users" ADD CONSTRAINT "calendar_directus_users_calendar_id_calendar_id_fkey" FOREIGN KEY ("calendar_id") REFERENCES "calendar"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "calendar_directus_users" ADD CONSTRAINT "calendar_directus_users_W6M8iTepH8eV_fkey" FOREIGN KEY ("directus_users_id") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_calendar_id_calendar_id_fkey" FOREIGN KEY ("calendar_id") REFERENCES "calendar"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_events_id_events_id_fkey" FOREIGN KEY ("events_id") REFERENCES "events"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "calendar_integrations" ADD CONSTRAINT "calendar_integrations_calendar_id_calendar_id_fkey" FOREIGN KEY ("calendar_id") REFERENCES "calendar"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "calendar_integrations" ADD CONSTRAINT "calendar_integrations_integrations_id_integrations_id_fkey" FOREIGN KEY ("integrations_id") REFERENCES "integrations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "calendar_lists" ADD CONSTRAINT "calendar_lists_calendar_id_calendar_id_fkey" FOREIGN KEY ("calendar_id") REFERENCES "calendar"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "calendar_lists" ADD CONSTRAINT "calendar_lists_lists_id_lists_id_fkey" FOREIGN KEY ("lists_id") REFERENCES "lists"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "cart" ADD CONSTRAINT "cart_user_directus_users_id_fkey" FOREIGN KEY ("user") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "cart_cart_items" ADD CONSTRAINT "cart_cart_items_cart_id_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "cart"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "cart_cart_items" ADD CONSTRAINT "cart_cart_items_cart_items_id_cart_items_id_fkey" FOREIGN KEY ("cart_items_id") REFERENCES "cart_items"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_products_products_id_fkey" FOREIGN KEY ("products") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_cart_id_fkey" FOREIGN KEY ("cart") REFERENCES "cart"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "cart_products" ADD CONSTRAINT "cart_products_cart_id_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "cart"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "cart_products" ADD CONSTRAINT "cart_products_products_id_products_id_fkey" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_seo_seo_id_fkey" FOREIGN KEY ("seo") REFERENCES "seo"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "categories_departments" ADD CONSTRAINT "categories_departments_categories_id_categories_id_fkey" FOREIGN KEY ("categories_id") REFERENCES "categories"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "categories_departments" ADD CONSTRAINT "categories_departments_departments_id_departments_id_fkey" FOREIGN KEY ("departments_id") REFERENCES "departments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."categories" ADD CONSTRAINT "categories_image_directus_files_id_fkey" FOREIGN KEY ("image") REFERENCES "enovels"."directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "categories_postgresstores" ADD CONSTRAINT "categories_postgresstores_categories_id_categories_id_fkey" FOREIGN KEY ("categories_id") REFERENCES "categories"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "categories_postgresstores" ADD CONSTRAINT "categories_postgresstores_3l9g4CzQ4wKW_fkey" FOREIGN KEY ("postgresstores_id") REFERENCES "postgresstores"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "categories_shorts" ADD CONSTRAINT "categories_shorts_categories_id_categories_id_fkey" FOREIGN KEY ("categories_id") REFERENCES "categories"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "categories_shorts" ADD CONSTRAINT "categories_shorts_shorts_id_shorts_id_fkey" FOREIGN KEY ("shorts_id") REFERENCES "shorts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."categories_tags" ADD CONSTRAINT "categories_tags_categories_id_categories_id_fkey" FOREIGN KEY ("categories_id") REFERENCES "enovels"."categories"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."categories_tags" ADD CONSTRAINT "categories_tags_tags_id_tags_id_fkey" FOREIGN KEY ("tags_id") REFERENCES "enovels"."tags"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."characters_abilities" ADD CONSTRAINT "characters_abilities_characters_id_characters_id_fkey" FOREIGN KEY ("characters_id") REFERENCES "enovels"."characters"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."characters_abilities" ADD CONSTRAINT "characters_abilities_abilities_id_abilities_id_fkey" FOREIGN KEY ("abilities_id") REFERENCES "enovels"."abilities"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."characters_characters" ADD CONSTRAINT "characters_characters_characters_id_characters_id_fkey" FOREIGN KEY ("characters_id") REFERENCES "enovels"."characters"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."characters_characters" ADD CONSTRAINT "characters_characters_related_characters_id_characters_id_fkey" FOREIGN KEY ("related_characters_id") REFERENCES "enovels"."characters"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."characters" ADD CONSTRAINT "characters_image_directus_files_id_fkey" FOREIGN KEY ("image") REFERENCES "enovels"."directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."characters_tags" ADD CONSTRAINT "characters_tags_characters_id_characters_id_fkey" FOREIGN KEY ("characters_id") REFERENCES "enovels"."characters"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."characters_tags" ADD CONSTRAINT "characters_tags_tags_id_tags_id_fkey" FOREIGN KEY ("tags_id") REFERENCES "enovels"."tags"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."characters_videos" ADD CONSTRAINT "characters_videos_characters_id_characters_id_fkey" FOREIGN KEY ("characters_id") REFERENCES "enovels"."characters"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."characters_videos" ADD CONSTRAINT "characters_videos_videos_id_videos_id_fkey" FOREIGN KEY ("videos_id") REFERENCES "enovels"."videos"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "chart_entries" ADD CONSTRAINT "chart_entries_chart_id_charts_id_fkey" FOREIGN KEY ("chart_id") REFERENCES "charts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "chart_entries" ADD CONSTRAINT "chart_entries_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "charts" ADD CONSTRAINT "charts_icon_directus_files_id_fkey" FOREIGN KEY ("icon") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "charts_departments" ADD CONSTRAINT "charts_departments_charts_id_charts_id_fkey" FOREIGN KEY ("charts_id") REFERENCES "charts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "charts_departments" ADD CONSTRAINT "charts_departments_departments_id_departments_id_fkey" FOREIGN KEY ("departments_id") REFERENCES "departments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "charts_products" ADD CONSTRAINT "charts_products_charts_id_charts_id_fkey" FOREIGN KEY ("charts_id") REFERENCES "charts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "charts_products" ADD CONSTRAINT "charts_products_products_id_products_id_fkey" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "charts_radios" ADD CONSTRAINT "charts_radios_charts_id_charts_id_fkey" FOREIGN KEY ("charts_id") REFERENCES "charts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "charts_radios" ADD CONSTRAINT "charts_radios_radios_id_radios_id_fkey" FOREIGN KEY ("radios_id") REFERENCES "radios"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "chat" ADD CONSTRAINT "chat_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "chat" ADD CONSTRAINT "chat_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "chat" ADD CONSTRAINT "chat_image_directus_files_id_fkey" FOREIGN KEY ("image") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "circles_directus_users" ADD CONSTRAINT "circles_directus_users_directus_users_id_directus_users_id_fkey" FOREIGN KEY ("directus_users_id") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "circles_posts" ADD CONSTRAINT "circles_posts_posts_id_posts_id_fkey" FOREIGN KEY ("posts_id") REFERENCES "posts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "circles_products" ADD CONSTRAINT "circles_products_products_id_products_id_fkey" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "cities_countries" ADD CONSTRAINT "cities_countries_cities_id_cities_id_fkey" FOREIGN KEY ("cities_id") REFERENCES "cities"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "cities_states" ADD CONSTRAINT "cities_states_cities_id_cities_id_fkey" FOREIGN KEY ("cities_id") REFERENCES "cities"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "collections_brands" ADD CONSTRAINT "collections_brands_collections_id_collections_id_fkey" FOREIGN KEY ("collections_id") REFERENCES "collections"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "collections_brands" ADD CONSTRAINT "collections_brands_brands_id_brands_id_fkey" FOREIGN KEY ("brands_id") REFERENCES "brands"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "collections_products" ADD CONSTRAINT "collections_products_collections_id_collections_id_fkey" FOREIGN KEY ("collections_id") REFERENCES "collections"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "collections_products" ADD CONSTRAINT "collections_products_products_id_products_id_fkey" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "collections_spaces" ADD CONSTRAINT "collections_spaces_collections_id_collections_id_fkey" FOREIGN KEY ("collections_id") REFERENCES "collections"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "collections_spaces" ADD CONSTRAINT "collections_spaces_spaces_id_spaces_id_fkey" FOREIGN KEY ("spaces_id") REFERENCES "spaces"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_directus_users_id_fkey" FOREIGN KEY ("user") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "comments_directus_users" ADD CONSTRAINT "comments_directus_users_comment_id_comments_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "comments_products" ADD CONSTRAINT "comments_products_comments_id_comments_id_fkey" FOREIGN KEY ("comments_id") REFERENCES "comments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "comments_products" ADD CONSTRAINT "comments_products_products_id_products_id_fkey" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "comments_reactions" ADD CONSTRAINT "comments_reactions_comments_id_comments_id_fkey" FOREIGN KEY ("comments_id") REFERENCES "comments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "comments_reactions" ADD CONSTRAINT "comments_reactions_reactions_id_reactions_id_fkey" FOREIGN KEY ("reactions_id") REFERENCES "reactions"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "comments_shorts" ADD CONSTRAINT "comments_shorts_comments_id_comments_id_fkey" FOREIGN KEY ("comments_id") REFERENCES "comments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "comments_shorts" ADD CONSTRAINT "comments_shorts_shorts_id_shorts_id_fkey" FOREIGN KEY ("shorts_id") REFERENCES "shorts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "connections_directus_users" ADD CONSTRAINT "connections_directus_users_connections_id_connections_id_fkey" FOREIGN KEY ("connections_id") REFERENCES "connections"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_user_directus_users_id_fkey" FOREIGN KEY ("user") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_organization_organizations_id_fkey" FOREIGN KEY ("organization") REFERENCES "organizations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "countries_currency" ADD CONSTRAINT "countries_currency_countries_id_countries_id_fkey" FOREIGN KEY ("countries_id") REFERENCES "countries"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "countries_currency" ADD CONSTRAINT "countries_currency_currency_id_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "currency"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "countries_timezones" ADD CONSTRAINT "countries_timezones_countries_id_countries_id_fkey" FOREIGN KEY ("countries_id") REFERENCES "countries"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "countries_timezones" ADD CONSTRAINT "countries_timezones_timezones_id_timezones_id_fkey" FOREIGN KEY ("timezones_id") REFERENCES "timezones"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "coupons_products" ADD CONSTRAINT "coupons_products_products_id_products_id_fkey" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "cross_sell_products" ADD CONSTRAINT "cross_sell_products_user_directus_users_id_fkey" FOREIGN KEY ("user") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "cross_sell_products_products" ADD CONSTRAINT "cross_sell_products_products_A7YSorc3eNbd_fkey" FOREIGN KEY ("cross_sell_products_id") REFERENCES "cross_sell_products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "cross_sell_products_products" ADD CONSTRAINT "cross_sell_products_products_products_id_products_id_fkey" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "currency_departments" ADD CONSTRAINT "currency_departments_currency_id_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "currency"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "currency_departments" ADD CONSTRAINT "currency_departments_departments_id_departments_id_fkey" FOREIGN KEY ("departments_id") REFERENCES "departments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "departments_categories" ADD CONSTRAINT "departments_categories_departments_id_departments_id_fkey" FOREIGN KEY ("departments_id") REFERENCES "departments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "departments_categories" ADD CONSTRAINT "departments_categories_categories_id_categories_id_fkey" FOREIGN KEY ("categories_id") REFERENCES "categories"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "departments_collections" ADD CONSTRAINT "departments_collections_departments_id_departments_id_fkey" FOREIGN KEY ("departments_id") REFERENCES "departments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "departments_collections" ADD CONSTRAINT "departments_collections_collections_id_collections_id_fkey" FOREIGN KEY ("collections_id") REFERENCES "collections"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "departments_products" ADD CONSTRAINT "departments_products_departments_id_departments_id_fkey" FOREIGN KEY ("departments_id") REFERENCES "departments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "departments_products" ADD CONSTRAINT "departments_products_products_id_products_id_fkey" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "departments_shorts" ADD CONSTRAINT "departments_shorts_departments_id_departments_id_fkey" FOREIGN KEY ("departments_id") REFERENCES "departments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "departments_shorts" ADD CONSTRAINT "departments_shorts_shorts_id_shorts_id_fkey" FOREIGN KEY ("shorts_id") REFERENCES "shorts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "departments_showcases" ADD CONSTRAINT "departments_showcases_departments_id_departments_id_fkey" FOREIGN KEY ("departments_id") REFERENCES "departments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "departments_showcases" ADD CONSTRAINT "departments_showcases_showcases_id_showcases_id_fkey" FOREIGN KEY ("showcases_id") REFERENCES "showcases"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."dictionary" ADD CONSTRAINT "dictionary_image_directus_files_id_fkey" FOREIGN KEY ("image") REFERENCES "enovels"."directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "directus_access" ADD CONSTRAINT "directus_access_role_directus_roles_id_fkey" FOREIGN KEY ("role") REFERENCES "directus_roles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "directus_access" ADD CONSTRAINT "directus_access_user_directus_users_id_fkey" FOREIGN KEY ("user") REFERENCES "directus_users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "directus_access" ADD CONSTRAINT "directus_access_policy_directus_policies_id_fkey" FOREIGN KEY ("policy") REFERENCES "directus_policies"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "enovels"."directus_access" ADD CONSTRAINT "directus_access_role_directus_roles_id_fkey" FOREIGN KEY ("role") REFERENCES "enovels"."directus_roles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "enovels"."directus_access" ADD CONSTRAINT "directus_access_user_directus_users_id_fkey" FOREIGN KEY ("user") REFERENCES "enovels"."directus_users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "enovels"."directus_access" ADD CONSTRAINT "directus_access_policy_directus_policies_id_fkey" FOREIGN KEY ("policy") REFERENCES "enovels"."directus_policies"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "directus_comments" ADD CONSTRAINT "directus_comments_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "directus_comments" ADD CONSTRAINT "directus_comments_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "enovels"."directus_comments" ADD CONSTRAINT "directus_comments_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "enovels"."directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."directus_comments" ADD CONSTRAINT "directus_comments_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "enovels"."directus_users"("id");--> statement-breakpoint
ALTER TABLE "directus_dashboards" ADD CONSTRAINT "directus_dashboards_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."directus_dashboards" ADD CONSTRAINT "directus_dashboards_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "enovels"."directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "directus_deployment_projects" ADD CONSTRAINT "directus_deployment_projects_8QUPYveJbNr9_fkey" FOREIGN KEY ("deployment") REFERENCES "directus_deployments"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "directus_deployment_projects" ADD CONSTRAINT "directus_deployment_projects_fDcddrjHXQDk_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "directus_deployment_runs" ADD CONSTRAINT "directus_deployment_runs_VnZbhN5ZqrA1_fkey" FOREIGN KEY ("project") REFERENCES "directus_deployment_projects"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "directus_deployment_runs" ADD CONSTRAINT "directus_deployment_runs_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "directus_deployments" ADD CONSTRAINT "directus_deployments_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "directus_files" ADD CONSTRAINT "directus_files_folder_directus_folders_id_fkey" FOREIGN KEY ("folder") REFERENCES "directus_folders"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "directus_files" ADD CONSTRAINT "directus_files_uploaded_by_directus_users_id_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "directus_files" ADD CONSTRAINT "directus_files_modified_by_directus_users_id_fkey" FOREIGN KEY ("modified_by") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "enovels"."directus_files" ADD CONSTRAINT "directus_files_folder_directus_folders_id_fkey" FOREIGN KEY ("folder") REFERENCES "enovels"."directus_folders"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."directus_files" ADD CONSTRAINT "directus_files_uploaded_by_directus_users_id_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "enovels"."directus_users"("id");--> statement-breakpoint
ALTER TABLE "enovels"."directus_files" ADD CONSTRAINT "directus_files_modified_by_directus_users_id_fkey" FOREIGN KEY ("modified_by") REFERENCES "enovels"."directus_users"("id");--> statement-breakpoint
ALTER TABLE "directus_flows" ADD CONSTRAINT "directus_flows_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."directus_flows" ADD CONSTRAINT "directus_flows_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "enovels"."directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "directus_notifications" ADD CONSTRAINT "directus_notifications_recipient_directus_users_id_fkey" FOREIGN KEY ("recipient") REFERENCES "directus_users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "directus_notifications" ADD CONSTRAINT "directus_notifications_sender_directus_users_id_fkey" FOREIGN KEY ("sender") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "enovels"."directus_notifications" ADD CONSTRAINT "directus_notifications_recipient_directus_users_id_fkey" FOREIGN KEY ("recipient") REFERENCES "enovels"."directus_users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "enovels"."directus_notifications" ADD CONSTRAINT "directus_notifications_sender_directus_users_id_fkey" FOREIGN KEY ("sender") REFERENCES "enovels"."directus_users"("id");--> statement-breakpoint
ALTER TABLE "directus_oauth_codes" ADD CONSTRAINT "directus_oauth_codes_SrsNFQb6ZnkJ_fkey" FOREIGN KEY ("client") REFERENCES "directus_oauth_clients"("client_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "directus_oauth_codes" ADD CONSTRAINT "directus_oauth_codes_user_directus_users_id_fkey" FOREIGN KEY ("user") REFERENCES "directus_users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "directus_oauth_consents" ADD CONSTRAINT "directus_oauth_consents_user_directus_users_id_fkey" FOREIGN KEY ("user") REFERENCES "directus_users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "directus_oauth_consents" ADD CONSTRAINT "directus_oauth_consents_CklsRkOoIROs_fkey" FOREIGN KEY ("client") REFERENCES "directus_oauth_clients"("client_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "directus_oauth_tokens" ADD CONSTRAINT "directus_oauth_tokens_LvTpqdxY752D_fkey" FOREIGN KEY ("client") REFERENCES "directus_oauth_clients"("client_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "directus_oauth_tokens" ADD CONSTRAINT "directus_oauth_tokens_user_directus_users_id_fkey" FOREIGN KEY ("user") REFERENCES "directus_users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "directus_operations" ADD CONSTRAINT "directus_operations_flow_directus_flows_id_fkey" FOREIGN KEY ("flow") REFERENCES "directus_flows"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "directus_operations" ADD CONSTRAINT "directus_operations_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."directus_operations" ADD CONSTRAINT "directus_operations_flow_directus_flows_id_fkey" FOREIGN KEY ("flow") REFERENCES "enovels"."directus_flows"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "enovels"."directus_operations" ADD CONSTRAINT "directus_operations_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "enovels"."directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "directus_panels" ADD CONSTRAINT "directus_panels_dashboard_directus_dashboards_id_fkey" FOREIGN KEY ("dashboard") REFERENCES "directus_dashboards"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "directus_panels" ADD CONSTRAINT "directus_panels_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."directus_panels" ADD CONSTRAINT "directus_panels_dashboard_directus_dashboards_id_fkey" FOREIGN KEY ("dashboard") REFERENCES "enovels"."directus_dashboards"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "enovels"."directus_panels" ADD CONSTRAINT "directus_panels_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "enovels"."directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "directus_permissions" ADD CONSTRAINT "directus_permissions_policy_directus_policies_id_fkey" FOREIGN KEY ("policy") REFERENCES "directus_policies"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "enovels"."directus_permissions" ADD CONSTRAINT "directus_permissions_policy_directus_policies_id_fkey" FOREIGN KEY ("policy") REFERENCES "enovels"."directus_policies"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "directus_presets" ADD CONSTRAINT "directus_presets_user_directus_users_id_fkey" FOREIGN KEY ("user") REFERENCES "directus_users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "directus_presets" ADD CONSTRAINT "directus_presets_role_directus_roles_id_fkey" FOREIGN KEY ("role") REFERENCES "directus_roles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "enovels"."directus_presets" ADD CONSTRAINT "directus_presets_user_directus_users_id_fkey" FOREIGN KEY ("user") REFERENCES "enovels"."directus_users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "enovels"."directus_presets" ADD CONSTRAINT "directus_presets_role_directus_roles_id_fkey" FOREIGN KEY ("role") REFERENCES "enovels"."directus_roles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "directus_revisions" ADD CONSTRAINT "directus_revisions_activity_directus_activity_id_fkey" FOREIGN KEY ("activity") REFERENCES "directus_activity"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "directus_revisions" ADD CONSTRAINT "directus_revisions_version_directus_versions_id_fkey" FOREIGN KEY ("version") REFERENCES "directus_versions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "enovels"."directus_revisions" ADD CONSTRAINT "directus_revisions_activity_directus_activity_id_fkey" FOREIGN KEY ("activity") REFERENCES "enovels"."directus_activity"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "enovels"."directus_revisions" ADD CONSTRAINT "directus_revisions_version_directus_versions_id_fkey" FOREIGN KEY ("version") REFERENCES "enovels"."directus_versions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "directus_sessions" ADD CONSTRAINT "directus_sessions_user_directus_users_id_fkey" FOREIGN KEY ("user") REFERENCES "directus_users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "directus_sessions" ADD CONSTRAINT "directus_sessions_share_directus_shares_id_fkey" FOREIGN KEY ("share") REFERENCES "directus_shares"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "directus_sessions" ADD CONSTRAINT "directus_sessions_HYk7XEz2Fptg_fkey" FOREIGN KEY ("oauth_client") REFERENCES "directus_oauth_clients"("client_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "enovels"."directus_sessions" ADD CONSTRAINT "directus_sessions_user_directus_users_id_fkey" FOREIGN KEY ("user") REFERENCES "enovels"."directus_users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "enovels"."directus_sessions" ADD CONSTRAINT "directus_sessions_share_directus_shares_id_fkey" FOREIGN KEY ("share") REFERENCES "enovels"."directus_shares"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "directus_settings" ADD CONSTRAINT "directus_settings_project_logo_directus_files_id_fkey" FOREIGN KEY ("project_logo") REFERENCES "directus_files"("id");--> statement-breakpoint
ALTER TABLE "directus_settings" ADD CONSTRAINT "directus_settings_public_foreground_directus_files_id_fkey" FOREIGN KEY ("public_foreground") REFERENCES "directus_files"("id");--> statement-breakpoint
ALTER TABLE "directus_settings" ADD CONSTRAINT "directus_settings_public_background_directus_files_id_fkey" FOREIGN KEY ("public_background") REFERENCES "directus_files"("id");--> statement-breakpoint
ALTER TABLE "directus_settings" ADD CONSTRAINT "directus_settings_tXm9AhWH4ShS_fkey" FOREIGN KEY ("storage_default_folder") REFERENCES "directus_folders"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "directus_settings" ADD CONSTRAINT "directus_settings_public_favicon_directus_files_id_fkey" FOREIGN KEY ("public_favicon") REFERENCES "directus_files"("id");--> statement-breakpoint
ALTER TABLE "directus_settings" ADD CONSTRAINT "directus_settings_WxGl8P28pmL2_fkey" FOREIGN KEY ("public_registration_role") REFERENCES "directus_roles"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "directus_shares" ADD CONSTRAINT "directus_shares_collection_directus_collections_collection_fkey" FOREIGN KEY ("collection") REFERENCES "directus_collections"("collection") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "directus_shares" ADD CONSTRAINT "directus_shares_role_directus_roles_id_fkey" FOREIGN KEY ("role") REFERENCES "directus_roles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "directus_shares" ADD CONSTRAINT "directus_shares_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."directus_shares" ADD CONSTRAINT "directus_shares_collection_directus_collections_collection_fkey" FOREIGN KEY ("collection") REFERENCES "enovels"."directus_collections"("collection") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "enovels"."directus_shares" ADD CONSTRAINT "directus_shares_role_directus_roles_id_fkey" FOREIGN KEY ("role") REFERENCES "enovels"."directus_roles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "enovels"."directus_shares" ADD CONSTRAINT "directus_shares_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "enovels"."directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "directus_users" ADD CONSTRAINT "directus_users_role_directus_roles_id_fkey" FOREIGN KEY ("role") REFERENCES "directus_roles"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."directus_users" ADD CONSTRAINT "directus_users_role_directus_roles_id_fkey" FOREIGN KEY ("role") REFERENCES "enovels"."directus_roles"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "directus_versions" ADD CONSTRAINT "directus_versions_Qt8na0mYx2Gn_fkey" FOREIGN KEY ("collection") REFERENCES "directus_collections"("collection") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "directus_versions" ADD CONSTRAINT "directus_versions_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "directus_versions" ADD CONSTRAINT "directus_versions_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "enovels"."directus_versions" ADD CONSTRAINT "directus_versions_Qt8na0mYx2Gn_fkey" FOREIGN KEY ("collection") REFERENCES "enovels"."directus_collections"("collection") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "enovels"."directus_versions" ADD CONSTRAINT "directus_versions_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "enovels"."directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."directus_versions" ADD CONSTRAINT "directus_versions_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "enovels"."directus_users"("id");--> statement-breakpoint
ALTER TABLE "enovels"."directus_webhooks" ADD CONSTRAINT "directus_webhooks_migrated_flow_directus_flows_id_fkey" FOREIGN KEY ("migrated_flow") REFERENCES "enovels"."directus_flows"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "emoji_reactions" ADD CONSTRAINT "emoji_reactions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_image_directus_files_id_fkey" FOREIGN KEY ("image") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "events_cities" ADD CONSTRAINT "events_cities_events_id_events_id_fkey" FOREIGN KEY ("events_id") REFERENCES "events"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "events_cities" ADD CONSTRAINT "events_cities_cities_id_cities_id_fkey" FOREIGN KEY ("cities_id") REFERENCES "cities"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "events_countries" ADD CONSTRAINT "events_countries_events_id_events_id_fkey" FOREIGN KEY ("events_id") REFERENCES "events"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "events_countries" ADD CONSTRAINT "events_countries_countries_id_countries_id_fkey" FOREIGN KEY ("countries_id") REFERENCES "countries"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "events_coupons" ADD CONSTRAINT "events_coupons_events_id_events_id_fkey" FOREIGN KEY ("events_id") REFERENCES "events"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "events_directus_users" ADD CONSTRAINT "events_directus_users_events_id_events_id_fkey" FOREIGN KEY ("events_id") REFERENCES "events"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "events_directus_users" ADD CONSTRAINT "events_directus_users_directus_users_id_directus_users_id_fkey" FOREIGN KEY ("directus_users_id") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "events_files" ADD CONSTRAINT "events_files_events_id_events_id_fkey" FOREIGN KEY ("events_id") REFERENCES "events"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "events_files" ADD CONSTRAINT "events_files_directus_files_id_directus_files_id_fkey" FOREIGN KEY ("directus_files_id") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "events_invoices" ADD CONSTRAINT "events_invoices_events_id_events_id_fkey" FOREIGN KEY ("events_id") REFERENCES "events"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "events_invoices" ADD CONSTRAINT "events_invoices_invoices_id_invoices_id_fkey" FOREIGN KEY ("invoices_id") REFERENCES "invoices"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "events_lists" ADD CONSTRAINT "events_lists_events_id_events_id_fkey" FOREIGN KEY ("events_id") REFERENCES "events"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "events_lists" ADD CONSTRAINT "events_lists_lists_id_lists_id_fkey" FOREIGN KEY ("lists_id") REFERENCES "lists"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "events_posts" ADD CONSTRAINT "events_posts_events_id_events_id_fkey" FOREIGN KEY ("events_id") REFERENCES "events"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "events_posts" ADD CONSTRAINT "events_posts_posts_id_posts_id_fkey" FOREIGN KEY ("posts_id") REFERENCES "posts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "events_products" ADD CONSTRAINT "events_products_events_id_events_id_fkey" FOREIGN KEY ("events_id") REFERENCES "events"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "events_products" ADD CONSTRAINT "events_products_products_id_products_id_fkey" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "events_states" ADD CONSTRAINT "events_states_events_id_events_id_fkey" FOREIGN KEY ("events_id") REFERENCES "events"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "events_states" ADD CONSTRAINT "events_states_states_id_states_id_fkey" FOREIGN KEY ("states_id") REFERENCES "states"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "faqs_directus_users" ADD CONSTRAINT "faqs_directus_users_faqs_id_faqs_id_fkey" FOREIGN KEY ("faqs_id") REFERENCES "faqs"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "faqs_directus_users" ADD CONSTRAINT "faqs_directus_users_directus_users_id_directus_users_id_fkey" FOREIGN KEY ("directus_users_id") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "faqs_files" ADD CONSTRAINT "faqs_files_faqs_id_faqs_id_fkey" FOREIGN KEY ("faqs_id") REFERENCES "faqs"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "faqs_products" ADD CONSTRAINT "faqs_products_faqs_id_faqs_id_fkey" FOREIGN KEY ("faqs_id") REFERENCES "faqs"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "faqs_products" ADD CONSTRAINT "faqs_products_products_id_products_id_fkey" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "federated_spaces_spaces" ADD CONSTRAINT "federated_spaces_spaces_lXKAAcGVjdrK_fkey" FOREIGN KEY ("federated_spaces_id") REFERENCES "federated_spaces"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "federated_spaces_spaces" ADD CONSTRAINT "federated_spaces_spaces_spaces_id_spaces_id_fkey" FOREIGN KEY ("spaces_id") REFERENCES "spaces"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "feeds" ADD CONSTRAINT "feeds_shop_shops_id_fkey" FOREIGN KEY ("shop") REFERENCES "shops"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "feeds_posts" ADD CONSTRAINT "feeds_posts_feed_id_feeds_id_fkey" FOREIGN KEY ("feed_id") REFERENCES "feeds"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "feeds_posts" ADD CONSTRAINT "feeds_posts_post_id_posts_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "finance_index_articles" ADD CONSTRAINT "finance_index_articles_finance_index_id_finance_index_id_fkey" FOREIGN KEY ("finance_index_id") REFERENCES "finance_index"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "finance_index_articles" ADD CONSTRAINT "finance_index_articles_articles_id_articles_id_fkey" FOREIGN KEY ("articles_id") REFERENCES "articles"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "finance_index_currency" ADD CONSTRAINT "finance_index_currency_finance_index_id_finance_index_id_fkey" FOREIGN KEY ("finance_index_id") REFERENCES "finance_index"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "finance_index_currency" ADD CONSTRAINT "finance_index_currency_currency_id_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "currency"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "finance_index_region" ADD CONSTRAINT "finance_index_region_finance_index_id_finance_index_id_fkey" FOREIGN KEY ("finance_index_id") REFERENCES "finance_index"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "finance_index_region" ADD CONSTRAINT "finance_index_region_region_id_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "region"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "forms" ADD CONSTRAINT "forms_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "forms" ADD CONSTRAINT "forms_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "friend_requests_address" ADD CONSTRAINT "friend_requests_address_yTDxbq3VlQky_fkey" FOREIGN KEY ("friend_requests_id") REFERENCES "friend_requests"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "friend_requests_address" ADD CONSTRAINT "friend_requests_address_address_id_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "address"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "friend_requests_profiles" ADD CONSTRAINT "friend_requests_profiles_ahcQn6PpnU5i_fkey" FOREIGN KEY ("friend_requests_id") REFERENCES "friend_requests"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "friend_requests_profiles" ADD CONSTRAINT "friend_requests_profiles_profiles_id_profiles_id_fkey" FOREIGN KEY ("profiles_id") REFERENCES "profiles"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "friend_suggestions_profiles" ADD CONSTRAINT "friend_suggestions_profiles_k9QNyX76E17f_fkey" FOREIGN KEY ("friend_suggestions_id") REFERENCES "friend_suggestions"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "friend_suggestions_profiles" ADD CONSTRAINT "friend_suggestions_profiles_profiles_id_profiles_id_fkey" FOREIGN KEY ("profiles_id") REFERENCES "profiles"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "gamification" ADD CONSTRAINT "gamification_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "gamification" ADD CONSTRAINT "gamification_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "gamification" ADD CONSTRAINT "gamification_user_profile_user_profile_id_fkey" FOREIGN KEY ("user_profile") REFERENCES "user_profile"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "gamification" ADD CONSTRAINT "gamification_nomination_user_directus_users_id_fkey" FOREIGN KEY ("nomination_user") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "gamification" ADD CONSTRAINT "gamification_birthdays_directus_users_id_fkey" FOREIGN KEY ("birthdays") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "gamification" ADD CONSTRAINT "gamification_leaderboards_directus_users_id_fkey" FOREIGN KEY ("leaderboards") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "gamification" ADD CONSTRAINT "gamification_anniversaries_directus_users_id_fkey" FOREIGN KEY ("anniversaries") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "gamification_directus_users" ADD CONSTRAINT "gamification_directus_users_J4J4eWweYJ1C_fkey" FOREIGN KEY ("gamification_id") REFERENCES "gamification"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "gamification_directus_users" ADD CONSTRAINT "gamification_directus_users_lB4B4cWYn20q_fkey" FOREIGN KEY ("directus_users_id") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "gamification_events" ADD CONSTRAINT "gamification_events_gamification_id_gamification_id_fkey" FOREIGN KEY ("gamification_id") REFERENCES "gamification"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "gamification_events" ADD CONSTRAINT "gamification_events_events_id_events_id_fkey" FOREIGN KEY ("events_id") REFERENCES "events"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "gamification_notifications" ADD CONSTRAINT "gamification_notifications_gamification_id_gamification_id_fkey" FOREIGN KEY ("gamification_id") REFERENCES "gamification"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "gamification_notifications" ADD CONSTRAINT "gamification_notifications_nv6VgbmjWDso_fkey" FOREIGN KEY ("notifications_id") REFERENCES "notifications"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "gamification_products" ADD CONSTRAINT "gamification_products_gamification_id_gamification_id_fkey" FOREIGN KEY ("gamification_id") REFERENCES "gamification"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "gamification_products" ADD CONSTRAINT "gamification_products_products_id_products_id_fkey" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "gamification_videos" ADD CONSTRAINT "gamification_videos_gamification_id_gamification_id_fkey" FOREIGN KEY ("gamification_id") REFERENCES "gamification"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "gamification_videos" ADD CONSTRAINT "gamification_videos_videos_id_videos_id_fkey" FOREIGN KEY ("videos_id") REFERENCES "videos"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "geo_regions_cities" ADD CONSTRAINT "geo_regions_cities_geo_regions_id_geo_regions_id_fkey" FOREIGN KEY ("geo_regions_id") REFERENCES "geo_regions"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "geo_regions_cities" ADD CONSTRAINT "geo_regions_cities_cities_id_cities_id_fkey" FOREIGN KEY ("cities_id") REFERENCES "cities"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "geo_regions_countries" ADD CONSTRAINT "geo_regions_countries_geo_regions_id_geo_regions_id_fkey" FOREIGN KEY ("geo_regions_id") REFERENCES "geo_regions"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "geo_regions_countries" ADD CONSTRAINT "geo_regions_countries_countries_id_countries_id_fkey" FOREIGN KEY ("countries_id") REFERENCES "countries"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "geo_regions_states" ADD CONSTRAINT "geo_regions_states_geo_regions_id_geo_regions_id_fkey" FOREIGN KEY ("geo_regions_id") REFERENCES "geo_regions"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "geo_regions_states" ADD CONSTRAINT "geo_regions_states_states_id_states_id_fkey" FOREIGN KEY ("states_id") REFERENCES "states"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "globals" ADD CONSTRAINT "globals_og_image_directus_files_id_fkey" FOREIGN KEY ("og_image") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "globals" ADD CONSTRAINT "globals_logo_on_dark_bg_directus_files_id_fkey" FOREIGN KEY ("logo_on_dark_bg") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "globals" ADD CONSTRAINT "globals_logo_on_light_bg_directus_files_id_fkey" FOREIGN KEY ("logo_on_light_bg") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "hdb_catalog"."hdb_cron_event_invocation_logs" ADD CONSTRAINT "hdb_cron_event_invocation_logs_event_id_hdb_cron_events_id_fkey" FOREIGN KEY ("event_id") REFERENCES "hdb_catalog"."hdb_cron_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "hdb_catalog"."hdb_scheduled_event_invocation_logs" ADD CONSTRAINT "hdb_scheduled_event_invocation_logs_zJP8RUHvmkjq_fkey" FOREIGN KEY ("event_id") REFERENCES "hdb_catalog"."hdb_scheduled_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "help_articles" ADD CONSTRAINT "help_articles_help_collection_help_collections_id_fkey" FOREIGN KEY ("help_collection") REFERENCES "help_collections"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "help_articles" ADD CONSTRAINT "help_articles_owner_directus_users_id_fkey" FOREIGN KEY ("owner") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "help_articles" ADD CONSTRAINT "help_articles_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "help_articles" ADD CONSTRAINT "help_articles_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "help_feedback" ADD CONSTRAINT "help_feedback_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "help_feedback" ADD CONSTRAINT "help_feedback_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "auth"."identities" ADD CONSTRAINT "identities_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "inbox" ADD CONSTRAINT "inbox_form_forms_id_fkey" FOREIGN KEY ("form") REFERENCES "forms"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "inbox" ADD CONSTRAINT "inbox_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "inbox" ADD CONSTRAINT "inbox_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "inbox" ADD CONSTRAINT "inbox_project_os_projects_id_fkey" FOREIGN KEY ("project") REFERENCES "os_projects"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "inbox" ADD CONSTRAINT "inbox_task_os_tasks_id_fkey" FOREIGN KEY ("task") REFERENCES "os_tasks"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "incentives" ADD CONSTRAINT "incentives_user_id_directus_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "incentives_currency" ADD CONSTRAINT "incentives_currency_incentives_id_incentives_id_fkey" FOREIGN KEY ("incentives_id") REFERENCES "incentives"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "incentives_currency" ADD CONSTRAINT "incentives_currency_currency_id_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "currency"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "incentives_orders" ADD CONSTRAINT "incentives_orders_incentives_id_incentives_id_fkey" FOREIGN KEY ("incentives_id") REFERENCES "incentives"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "incentives_orders" ADD CONSTRAINT "incentives_orders_orders_id_orders_id_fkey" FOREIGN KEY ("orders_id") REFERENCES "orders"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "incentives_products" ADD CONSTRAINT "incentives_products_incentives_id_incentives_id_fkey" FOREIGN KEY ("incentives_id") REFERENCES "incentives"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "incentives_products" ADD CONSTRAINT "incentives_products_products_id_products_id_fkey" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "integrations_attributes" ADD CONSTRAINT "integrations_attributes_integrations_id_integrations_id_fkey" FOREIGN KEY ("integrations_id") REFERENCES "integrations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "integrations_attributes" ADD CONSTRAINT "integrations_attributes_attributes_id_attributes_id_fkey" FOREIGN KEY ("attributes_id") REFERENCES "attributes"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "integrations_categories" ADD CONSTRAINT "integrations_categories_integrations_id_integrations_id_fkey" FOREIGN KEY ("integrations_id") REFERENCES "integrations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "integrations_categories" ADD CONSTRAINT "integrations_categories_categories_id_categories_id_fkey" FOREIGN KEY ("categories_id") REFERENCES "categories"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "integrations_departments" ADD CONSTRAINT "integrations_departments_integrations_id_integrations_id_fkey" FOREIGN KEY ("integrations_id") REFERENCES "integrations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "integrations_departments" ADD CONSTRAINT "integrations_departments_departments_id_departments_id_fkey" FOREIGN KEY ("departments_id") REFERENCES "departments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "integrations_files" ADD CONSTRAINT "integrations_files_integrations_id_integrations_id_fkey" FOREIGN KEY ("integrations_id") REFERENCES "integrations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "integrations_files" ADD CONSTRAINT "integrations_files_directus_files_id_directus_files_id_fkey" FOREIGN KEY ("directus_files_id") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "integrations_platform" ADD CONSTRAINT "integrations_platform_integrations_id_integrations_id_fkey" FOREIGN KEY ("integrations_id") REFERENCES "integrations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "integrations_platform" ADD CONSTRAINT "integrations_platform_platform_id_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "platform"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "integrations_product_types" ADD CONSTRAINT "integrations_product_types_integrations_id_integrations_id_fkey" FOREIGN KEY ("integrations_id") REFERENCES "integrations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "integrations_product_types" ADD CONSTRAINT "integrations_product_types_GtdXEJcPDYeN_fkey" FOREIGN KEY ("product_types_id") REFERENCES "product_types"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "integrations_ratings" ADD CONSTRAINT "integrations_ratings_integrations_id_integrations_id_fkey" FOREIGN KEY ("integrations_id") REFERENCES "integrations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "integrations_ratings" ADD CONSTRAINT "integrations_ratings_ratings_id_ratings_id_fkey" FOREIGN KEY ("ratings_id") REFERENCES "ratings"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "integrations_report" ADD CONSTRAINT "integrations_report_integrations_id_integrations_id_fkey" FOREIGN KEY ("integrations_id") REFERENCES "integrations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "integrations_report" ADD CONSTRAINT "integrations_report_report_id_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "report"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "integrations_spaces" ADD CONSTRAINT "integrations_spaces_integrations_id_integrations_id_fkey" FOREIGN KEY ("integrations_id") REFERENCES "integrations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "integrations_spaces" ADD CONSTRAINT "integrations_spaces_spaces_id_spaces_id_fkey" FOREIGN KEY ("spaces_id") REFERENCES "spaces"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "integrations_tags" ADD CONSTRAINT "integrations_tags_integrations_id_integrations_id_fkey" FOREIGN KEY ("integrations_id") REFERENCES "integrations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "integrations_tags" ADD CONSTRAINT "integrations_tags_tags_id_tags_id_fkey" FOREIGN KEY ("tags_id") REFERENCES "tags"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "invoices_address" ADD CONSTRAINT "invoices_address_invoice_id_invoices_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "invoices_address" ADD CONSTRAINT "invoices_address_address_id_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "address"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "invoices_orders" ADD CONSTRAINT "invoices_orders_invoice_id_invoices_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "invoices_orders" ADD CONSTRAINT "invoices_orders_order_id_orders_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "invoices_shipping_address" ADD CONSTRAINT "invoices_shipping_address_invoice_id_invoices_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "invoices_shipping_address" ADD CONSTRAINT "invoices_shipping_address_j3ckk8O82r1K_fkey" FOREIGN KEY ("shipping_address_id") REFERENCES "shipping_address"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."items_abilities" ADD CONSTRAINT "items_abilities_items_id_items_id_fkey" FOREIGN KEY ("items_id") REFERENCES "enovels"."items"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."items_abilities" ADD CONSTRAINT "items_abilities_abilities_id_abilities_id_fkey" FOREIGN KEY ("abilities_id") REFERENCES "enovels"."abilities"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."items_characters" ADD CONSTRAINT "items_characters_items_id_items_id_fkey" FOREIGN KEY ("items_id") REFERENCES "enovels"."items"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."items_characters" ADD CONSTRAINT "items_characters_characters_id_characters_id_fkey" FOREIGN KEY ("characters_id") REFERENCES "enovels"."characters"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."items" ADD CONSTRAINT "items_image_directus_files_id_fkey" FOREIGN KEY ("image") REFERENCES "enovels"."directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."items_videos" ADD CONSTRAINT "items_videos_items_id_items_id_fkey" FOREIGN KEY ("items_id") REFERENCES "enovels"."items"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."items_videos" ADD CONSTRAINT "items_videos_videos_id_videos_id_fkey" FOREIGN KEY ("videos_id") REFERENCES "enovels"."videos"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."levels_characters" ADD CONSTRAINT "levels_characters_levels_id_levels_id_fkey" FOREIGN KEY ("levels_id") REFERENCES "enovels"."levels"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."levels_characters" ADD CONSTRAINT "levels_characters_characters_id_characters_id_fkey" FOREIGN KEY ("characters_id") REFERENCES "enovels"."characters"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "list_items" ADD CONSTRAINT "list_items_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "list_items" ADD CONSTRAINT "list_items_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "list_items" ADD CONSTRAINT "list_items_list_id_lists_id_fkey" FOREIGN KEY ("list_id") REFERENCES "lists"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "list_items" ADD CONSTRAINT "list_items_post_id_posts_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "list_items" ADD CONSTRAINT "list_items_media_directus_files_id_fkey" FOREIGN KEY ("media") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "list_items_directus_users" ADD CONSTRAINT "list_items_directus_users_list_items_id_list_items_id_fkey" FOREIGN KEY ("list_items_id") REFERENCES "list_items"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "list_items_directus_users" ADD CONSTRAINT "list_items_directus_users_J0MypUHRGRG8_fkey" FOREIGN KEY ("directus_users_id") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "list_items_products" ADD CONSTRAINT "list_items_products_list_items_id_list_items_id_fkey" FOREIGN KEY ("list_items_id") REFERENCES "list_items"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "list_items_products" ADD CONSTRAINT "list_items_products_products_id_products_id_fkey" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "list_products_lists" ADD CONSTRAINT "list_products_lists_list_products_id_list_products_id_fkey" FOREIGN KEY ("list_products_id") REFERENCES "list_products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "list_products_lists" ADD CONSTRAINT "list_products_lists_lists_id_lists_id_fkey" FOREIGN KEY ("lists_id") REFERENCES "lists"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lists_categories" ADD CONSTRAINT "lists_categories_lists_id_lists_id_fkey" FOREIGN KEY ("lists_id") REFERENCES "lists"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lists_categories" ADD CONSTRAINT "lists_categories_categories_id_categories_id_fkey" FOREIGN KEY ("categories_id") REFERENCES "categories"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lists_departments" ADD CONSTRAINT "lists_departments_lists_id_lists_id_fkey" FOREIGN KEY ("lists_id") REFERENCES "lists"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lists_departments" ADD CONSTRAINT "lists_departments_departments_id_departments_id_fkey" FOREIGN KEY ("departments_id") REFERENCES "departments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lists_directus_users" ADD CONSTRAINT "lists_directus_users_list_id_lists_id_fkey" FOREIGN KEY ("list_id") REFERENCES "lists"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lists_files" ADD CONSTRAINT "lists_files_lists_id_lists_id_fkey" FOREIGN KEY ("lists_id") REFERENCES "lists"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lists_files" ADD CONSTRAINT "lists_files_directus_files_id_directus_files_id_fkey" FOREIGN KEY ("directus_files_id") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lists_products" ADD CONSTRAINT "lists_products_lists_id_lists_id_fkey" FOREIGN KEY ("lists_id") REFERENCES "lists"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lists_products" ADD CONSTRAINT "lists_products_products_id_products_id_fkey" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lists_shorts" ADD CONSTRAINT "lists_shorts_lists_id_lists_id_fkey" FOREIGN KEY ("lists_id") REFERENCES "lists"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lists_shorts" ADD CONSTRAINT "lists_shorts_shorts_id_shorts_id_fkey" FOREIGN KEY ("shorts_id") REFERENCES "shorts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lists_template" ADD CONSTRAINT "lists_template_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "lists_template" ADD CONSTRAINT "lists_template_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "lists_template_directus_users" ADD CONSTRAINT "lists_template_directus_users_CMeamjbF0cL3_fkey" FOREIGN KEY ("lists_template_id") REFERENCES "lists_template"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lists_template_directus_users" ADD CONSTRAINT "lists_template_directus_users_DgcCbAYPgI49_fkey" FOREIGN KEY ("directus_users_id") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lists_template_list_items" ADD CONSTRAINT "lists_template_list_items_j2Dbcs7DJtKy_fkey" FOREIGN KEY ("lists_template_id") REFERENCES "lists_template"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lists_template_list_items" ADD CONSTRAINT "lists_template_list_items_list_items_id_list_items_id_fkey" FOREIGN KEY ("list_items_id") REFERENCES "list_items"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lists_template_tags" ADD CONSTRAINT "lists_template_tags_lists_template_id_lists_template_id_fkey" FOREIGN KEY ("lists_template_id") REFERENCES "lists_template"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lists_template_tags" ADD CONSTRAINT "lists_template_tags_tags_id_tags_id_fkey" FOREIGN KEY ("tags_id") REFERENCES "tags"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lists_templates" ADD CONSTRAINT "lists_templates_lists_id_lists_id_fkey" FOREIGN KEY ("lists_id") REFERENCES "lists"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lists_templates" ADD CONSTRAINT "lists_templates_templates_id_templates_id_fkey" FOREIGN KEY ("templates_id") REFERENCES "templates"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lists_type" ADD CONSTRAINT "lists_type_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "lists_type" ADD CONSTRAINT "lists_type_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "lists_type_categories" ADD CONSTRAINT "lists_type_categories_lists_type_id_lists_type_id_fkey" FOREIGN KEY ("lists_type_id") REFERENCES "lists_type"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lists_type_categories" ADD CONSTRAINT "lists_type_categories_categories_id_categories_id_fkey" FOREIGN KEY ("categories_id") REFERENCES "categories"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lists_type_lists" ADD CONSTRAINT "lists_type_lists_lists_type_id_lists_type_id_fkey" FOREIGN KEY ("lists_type_id") REFERENCES "lists_type"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "lists_type_lists" ADD CONSTRAINT "lists_type_lists_lists_id_lists_id_fkey" FOREIGN KEY ("lists_id") REFERENCES "lists"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "manufacturer_countries" ADD CONSTRAINT "manufacturer_countries_manufacturer_id_manufacturer_id_fkey" FOREIGN KEY ("manufacturer_id") REFERENCES "manufacturer"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "manufacturer_countries" ADD CONSTRAINT "manufacturer_countries_countries_id_countries_id_fkey" FOREIGN KEY ("countries_id") REFERENCES "countries"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_user_directus_users_id_fkey" FOREIGN KEY ("user") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_profile_id_profiles_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "media_files" ADD CONSTRAINT "media_files_media_id_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "media_files" ADD CONSTRAINT "media_files_directus_files_id_directus_files_id_fkey" FOREIGN KEY ("directus_files_id") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "media_folders" ADD CONSTRAINT "media_folders_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "media_folders" ADD CONSTRAINT "media_folders_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "media_folders" ADD CONSTRAINT "media_folders_user_directus_users_id_fkey" FOREIGN KEY ("user") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "media_folders" ADD CONSTRAINT "media_folders_parent_folder_media_id_fkey" FOREIGN KEY ("parent_folder") REFERENCES "media"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "media_folders_directus_users" ADD CONSTRAINT "media_folders_directus_users_7DuSaL4fmUGp_fkey" FOREIGN KEY ("media_folders_id") REFERENCES "media_folders"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "media_folders_directus_users" ADD CONSTRAINT "media_folders_directus_users_epLzRoHvUPJj_fkey" FOREIGN KEY ("directus_users_id") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "member_groups_events" ADD CONSTRAINT "member_groups_events_events_id_events_id_fkey" FOREIGN KEY ("events_id") REFERENCES "events"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "member_groups_polls" ADD CONSTRAINT "member_groups_polls_polls_id_polls_id_fkey" FOREIGN KEY ("polls_id") REFERENCES "polls"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "member_groups_posts" ADD CONSTRAINT "member_groups_posts_posts_id_posts_id_fkey" FOREIGN KEY ("posts_id") REFERENCES "posts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "member_groups_products" ADD CONSTRAINT "member_groups_products_products_id_products_id_fkey" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_conversations_id_fkey" FOREIGN KEY ("conversation") REFERENCES "conversations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "auth"."mfa_amr_claims" ADD CONSTRAINT "mfa_amr_claims_session_id_sessions_id_fkey" FOREIGN KEY ("session_id") REFERENCES "auth"."sessions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "auth"."mfa_challenges" ADD CONSTRAINT "mfa_challenges_factor_id_mfa_factors_id_fkey" FOREIGN KEY ("factor_id") REFERENCES "auth"."mfa_factors"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "auth"."mfa_factors" ADD CONSTRAINT "mfa_factors_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "moments_products" ADD CONSTRAINT "moments_products_moments_id_moments_id_fkey" FOREIGN KEY ("moments_id") REFERENCES "moments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "moments_products" ADD CONSTRAINT "moments_products_products_id_products_id_fkey" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "moments_spaces" ADD CONSTRAINT "moments_spaces_moments_id_moments_id_fkey" FOREIGN KEY ("moments_id") REFERENCES "moments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "moments_spaces" ADD CONSTRAINT "moments_spaces_spaces_id_spaces_id_fkey" FOREIGN KEY ("spaces_id") REFERENCES "spaces"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "musicchart_departments" ADD CONSTRAINT "musicchart_departments_departments_id_departments_id_fkey" FOREIGN KEY ("departments_id") REFERENCES "departments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "navigation" ADD CONSTRAINT "navigation_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "navigation" ADD CONSTRAINT "navigation_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "navigation_pages" ADD CONSTRAINT "navigation_pages_navigation_id_navigation_id_fkey" FOREIGN KEY ("navigation_id") REFERENCES "navigation"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "navigation_pages" ADD CONSTRAINT "navigation_pages_pages_id_pages_id_fkey" FOREIGN KEY ("pages_id") REFERENCES "pages"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "navigation_websites" ADD CONSTRAINT "navigation_websites_navigation_id_navigation_id_fkey" FOREIGN KEY ("navigation_id") REFERENCES "navigation"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "navigation_websites" ADD CONSTRAINT "navigation_websites_websites_id_websites_id_fkey" FOREIGN KEY ("websites_id") REFERENCES "websites"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_directus_users_id_fkey" FOREIGN KEY ("recipient") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "auth"."oauth_authorizations" ADD CONSTRAINT "oauth_authorizations_client_id_oauth_clients_id_fkey" FOREIGN KEY ("client_id") REFERENCES "auth"."oauth_clients"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "auth"."oauth_authorizations" ADD CONSTRAINT "oauth_authorizations_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "auth"."oauth_consents" ADD CONSTRAINT "oauth_consents_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "auth"."oauth_consents" ADD CONSTRAINT "oauth_consents_client_id_oauth_clients_id_fkey" FOREIGN KEY ("client_id") REFERENCES "auth"."oauth_clients"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "storage"."objects" ADD CONSTRAINT "objects_bucket_id_buckets_id_fkey" FOREIGN KEY ("bucket_id") REFERENCES "storage"."buckets"("id");--> statement-breakpoint
ALTER TABLE "auth"."one_time_tokens" ADD CONSTRAINT "one_time_tokens_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "order_items_orders" ADD CONSTRAINT "order_items_orders_order_items_id_order_items_id_fkey" FOREIGN KEY ("order_items_id") REFERENCES "order_items"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "order_items_orders" ADD CONSTRAINT "order_items_orders_orders_id_orders_id_fkey" FOREIGN KEY ("orders_id") REFERENCES "orders"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "order_items_products" ADD CONSTRAINT "order_items_products_order_items_id_order_items_id_fkey" FOREIGN KEY ("order_items_id") REFERENCES "order_items"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "order_items_products" ADD CONSTRAINT "order_items_products_products_id_products_id_fkey" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_directus_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "orders_products" ADD CONSTRAINT "orders_products_orders_id_orders_id_fkey" FOREIGN KEY ("orders_id") REFERENCES "orders"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "orders_products" ADD CONSTRAINT "orders_products_products_id_products_id_fkey" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "organization_addresses" ADD CONSTRAINT "organization_addresses_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "organization_addresses" ADD CONSTRAINT "organization_addresses_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "organization_addresses" ADD CONSTRAINT "organization_addresses_organization_organizations_id_fkey" FOREIGN KEY ("organization") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_user_id_directus_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "enovels"."directus_users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organization_id_organizations_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_logo_directus_files_id_fkey" FOREIGN KEY ("logo") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_payment_terms_os_payment_terms_id_fkey" FOREIGN KEY ("payment_terms") REFERENCES "os_payment_terms"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_owner_directus_users_id_fkey" FOREIGN KEY ("owner") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_folder_directus_folders_id_fkey" FOREIGN KEY ("folder") REFERENCES "directus_folders"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "organizations_contacts" ADD CONSTRAINT "organizations_contacts_contacts_id_contacts_id_fkey" FOREIGN KEY ("contacts_id") REFERENCES "contacts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "organizations_contacts" ADD CONSTRAINT "organizations_contacts_organizations_id_organizations_id_fkey" FOREIGN KEY ("organizations_id") REFERENCES "organizations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "os_activities" ADD CONSTRAINT "os_activities_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_activities" ADD CONSTRAINT "os_activities_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_activities" ADD CONSTRAINT "os_activities_deal_os_deals_id_fkey" FOREIGN KEY ("deal") REFERENCES "os_deals"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_activities" ADD CONSTRAINT "os_activities_organization_organizations_id_fkey" FOREIGN KEY ("organization") REFERENCES "organizations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_activities" ADD CONSTRAINT "os_activities_assigned_to_directus_users_id_fkey" FOREIGN KEY ("assigned_to") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_activity_contacts" ADD CONSTRAINT "os_activity_contacts_os_activities_id_os_activities_id_fkey" FOREIGN KEY ("os_activities_id") REFERENCES "os_activities"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "os_activity_contacts" ADD CONSTRAINT "os_activity_contacts_contacts_id_contacts_id_fkey" FOREIGN KEY ("contacts_id") REFERENCES "contacts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "os_deal_contacts" ADD CONSTRAINT "os_deal_contacts_os_deals_id_os_deals_id_fkey" FOREIGN KEY ("os_deals_id") REFERENCES "os_deals"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "os_deal_contacts" ADD CONSTRAINT "os_deal_contacts_contacts_id_contacts_id_fkey" FOREIGN KEY ("contacts_id") REFERENCES "contacts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "os_deal_stages" ADD CONSTRAINT "os_deal_stages_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_deal_stages" ADD CONSTRAINT "os_deal_stages_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_deals" ADD CONSTRAINT "os_deals_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_deals" ADD CONSTRAINT "os_deals_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_deals" ADD CONSTRAINT "os_deals_owner_directus_users_id_fkey" FOREIGN KEY ("owner") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_deals" ADD CONSTRAINT "os_deals_organization_organizations_id_fkey" FOREIGN KEY ("organization") REFERENCES "organizations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_deals" ADD CONSTRAINT "os_deals_deal_stage_os_deal_stages_id_fkey" FOREIGN KEY ("deal_stage") REFERENCES "os_deal_stages"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_email_templates" ADD CONSTRAINT "os_email_templates_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_email_templates" ADD CONSTRAINT "os_email_templates_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_expenses" ADD CONSTRAINT "os_expenses_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_expenses" ADD CONSTRAINT "os_expenses_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_expenses" ADD CONSTRAINT "os_expenses_file_directus_files_id_fkey" FOREIGN KEY ("file") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_expenses" ADD CONSTRAINT "os_expenses_project_os_projects_id_fkey" FOREIGN KEY ("project") REFERENCES "os_projects"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_expenses" ADD CONSTRAINT "os_expenses_invoice_item_os_invoice_items_id_fkey" FOREIGN KEY ("invoice_item") REFERENCES "os_invoice_items"("id");--> statement-breakpoint
ALTER TABLE "os_expenses" ADD CONSTRAINT "os_expenses_user_submitted_directus_users_id_fkey" FOREIGN KEY ("user_submitted") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_invoice_items" ADD CONSTRAINT "os_invoice_items_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_invoice_items" ADD CONSTRAINT "os_invoice_items_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_invoice_items" ADD CONSTRAINT "os_invoice_items_invoice_os_invoices_id_fkey" FOREIGN KEY ("invoice") REFERENCES "os_invoices"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "os_invoice_items" ADD CONSTRAINT "os_invoice_items_tax_rate_os_tax_rates_id_fkey" FOREIGN KEY ("tax_rate") REFERENCES "os_tax_rates"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_invoice_items" ADD CONSTRAINT "os_invoice_items_billable_expense_os_expenses_id_fkey" FOREIGN KEY ("billable_expense") REFERENCES "os_expenses"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_invoice_items" ADD CONSTRAINT "os_invoice_items_item_os_items_id_fkey" FOREIGN KEY ("item") REFERENCES "os_items"("id");--> statement-breakpoint
ALTER TABLE "os_invoices" ADD CONSTRAINT "os_invoices_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_invoices" ADD CONSTRAINT "os_invoices_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_invoices" ADD CONSTRAINT "os_invoices_organization_organizations_id_fkey" FOREIGN KEY ("organization") REFERENCES "organizations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_invoices" ADD CONSTRAINT "os_invoices_contact_contacts_id_fkey" FOREIGN KEY ("contact") REFERENCES "contacts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_invoices" ADD CONSTRAINT "os_invoices_project_os_projects_id_fkey" FOREIGN KEY ("project") REFERENCES "os_projects"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_items" ADD CONSTRAINT "os_items_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_items" ADD CONSTRAINT "os_items_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_items" ADD CONSTRAINT "os_items_default_tax_rate_os_tax_rates_id_fkey" FOREIGN KEY ("default_tax_rate") REFERENCES "os_tax_rates"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_payment_terms" ADD CONSTRAINT "os_payment_terms_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_payment_terms" ADD CONSTRAINT "os_payment_terms_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_payments" ADD CONSTRAINT "os_payments_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_payments" ADD CONSTRAINT "os_payments_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_payments" ADD CONSTRAINT "os_payments_organization_organizations_id_fkey" FOREIGN KEY ("organization") REFERENCES "organizations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_payments" ADD CONSTRAINT "os_payments_contact_contacts_id_fkey" FOREIGN KEY ("contact") REFERENCES "contacts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_payments" ADD CONSTRAINT "os_payments_invoice_os_invoices_id_fkey" FOREIGN KEY ("invoice") REFERENCES "os_invoices"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_project_contacts" ADD CONSTRAINT "os_project_contacts_os_projects_id_os_projects_id_fkey" FOREIGN KEY ("os_projects_id") REFERENCES "os_projects"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "os_project_contacts" ADD CONSTRAINT "os_project_contacts_contacts_id_contacts_id_fkey" FOREIGN KEY ("contacts_id") REFERENCES "contacts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "os_project_templates" ADD CONSTRAINT "os_project_templates_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_project_templates" ADD CONSTRAINT "os_project_templates_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_project_updates" ADD CONSTRAINT "os_project_updates_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_project_updates" ADD CONSTRAINT "os_project_updates_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_project_updates" ADD CONSTRAINT "os_project_updates_project_os_projects_id_fkey" FOREIGN KEY ("project") REFERENCES "os_projects"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_projects" ADD CONSTRAINT "os_projects_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_projects" ADD CONSTRAINT "os_projects_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_projects" ADD CONSTRAINT "os_projects_organization_organizations_id_fkey" FOREIGN KEY ("organization") REFERENCES "organizations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_projects" ADD CONSTRAINT "os_projects_owner_directus_users_id_fkey" FOREIGN KEY ("owner") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_proposal_approvals" ADD CONSTRAINT "os_proposal_approvals_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_proposal_approvals" ADD CONSTRAINT "os_proposal_approvals_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_proposal_approvals" ADD CONSTRAINT "os_proposal_approvals_signature_image_directus_files_id_fkey" FOREIGN KEY ("signature_image") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_proposal_approvals" ADD CONSTRAINT "os_proposal_approvals_proposal_os_proposals_id_fkey" FOREIGN KEY ("proposal") REFERENCES "os_proposals"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "os_proposal_approvals" ADD CONSTRAINT "os_proposal_approvals_contact_contacts_id_fkey" FOREIGN KEY ("contact") REFERENCES "contacts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_proposal_blocks" ADD CONSTRAINT "os_proposal_blocks_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_proposal_blocks" ADD CONSTRAINT "os_proposal_blocks_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_proposal_blocks" ADD CONSTRAINT "os_proposal_blocks_os_proposals_id_os_proposals_id_fkey" FOREIGN KEY ("os_proposals_id") REFERENCES "os_proposals"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_proposal_contacts" ADD CONSTRAINT "os_proposal_contacts_os_proposals_id_os_proposals_id_fkey" FOREIGN KEY ("os_proposals_id") REFERENCES "os_proposals"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "os_proposal_contacts" ADD CONSTRAINT "os_proposal_contacts_contacts_id_contacts_id_fkey" FOREIGN KEY ("contacts_id") REFERENCES "contacts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "os_proposals" ADD CONSTRAINT "os_proposals_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_proposals" ADD CONSTRAINT "os_proposals_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_proposals" ADD CONSTRAINT "os_proposals_organization_organizations_id_fkey" FOREIGN KEY ("organization") REFERENCES "organizations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_proposals" ADD CONSTRAINT "os_proposals_deal_os_deals_id_fkey" FOREIGN KEY ("deal") REFERENCES "os_deals"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_settings" ADD CONSTRAINT "os_settings_organization_folder_root_directus_folders_id_fkey" FOREIGN KEY ("organization_folder_root") REFERENCES "directus_folders"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_task_files" ADD CONSTRAINT "os_task_files_os_tasks_id_os_tasks_id_fkey" FOREIGN KEY ("os_tasks_id") REFERENCES "os_tasks"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "os_task_files" ADD CONSTRAINT "os_task_files_directus_files_id_directus_files_id_fkey" FOREIGN KEY ("directus_files_id") REFERENCES "directus_files"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "os_tasks" ADD CONSTRAINT "os_tasks_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_tasks" ADD CONSTRAINT "os_tasks_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_tasks" ADD CONSTRAINT "os_tasks_project_os_projects_id_fkey" FOREIGN KEY ("project") REFERENCES "os_projects"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "os_tasks" ADD CONSTRAINT "os_tasks_assigned_to_directus_users_id_fkey" FOREIGN KEY ("assigned_to") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_tasks" ADD CONSTRAINT "os_tasks_form_forms_id_fkey" FOREIGN KEY ("form") REFERENCES "forms"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "os_tax_rates" ADD CONSTRAINT "os_tax_rates_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "os_tax_rates" ADD CONSTRAINT "os_tax_rates_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "outlets" ADD CONSTRAINT "outlets_image_directus_files_id_fkey" FOREIGN KEY ("image") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "outlets_categories" ADD CONSTRAINT "outlets_categories_outlets_id_outlets_id_fkey" FOREIGN KEY ("outlets_id") REFERENCES "outlets"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "outlets_categories" ADD CONSTRAINT "outlets_categories_categories_id_categories_id_fkey" FOREIGN KEY ("categories_id") REFERENCES "categories"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "outlets_shorts" ADD CONSTRAINT "outlets_shorts_outlets_id_outlets_id_fkey" FOREIGN KEY ("outlets_id") REFERENCES "outlets"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "outlets_shorts" ADD CONSTRAINT "outlets_shorts_shorts_id_shorts_id_fkey" FOREIGN KEY ("shorts_id") REFERENCES "shorts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "page_blocks" ADD CONSTRAINT "page_blocks_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "page_blocks" ADD CONSTRAINT "page_blocks_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "page_blocks_files" ADD CONSTRAINT "page_blocks_files_page_blocks_id_page_blocks_id_fkey" FOREIGN KEY ("page_blocks_id") REFERENCES "page_blocks"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "page_blocks_files" ADD CONSTRAINT "page_blocks_files_directus_files_id_directus_files_id_fkey" FOREIGN KEY ("directus_files_id") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "pages" ADD CONSTRAINT "pages_seo_seo_id_fkey" FOREIGN KEY ("seo") REFERENCES "seo"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "pages_blog" ADD CONSTRAINT "pages_blog_seo_seo_id_fkey" FOREIGN KEY ("seo") REFERENCES "seo"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."pages" ADD CONSTRAINT "pages_image_directus_files_id_fkey" FOREIGN KEY ("image") REFERENCES "enovels"."directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "pages_projects" ADD CONSTRAINT "pages_projects_seo_seo_id_fkey" FOREIGN KEY ("seo") REFERENCES "seo"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "payments_countries" ADD CONSTRAINT "payments_countries_payment_id_payments_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "payments_countries" ADD CONSTRAINT "payments_countries_country_id_countries_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "payments_currency" ADD CONSTRAINT "payments_currency_payments_id_payments_id_fkey" FOREIGN KEY ("payments_id") REFERENCES "payments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "payments_currency" ADD CONSTRAINT "payments_currency_currency_id_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "currency"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "payments_directus_users" ADD CONSTRAINT "payments_directus_users_payments_id_payments_id_fkey" FOREIGN KEY ("payments_id") REFERENCES "payments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "payments_directus_users" ADD CONSTRAINT "payments_directus_users_W6M8jloPicYU_fkey" FOREIGN KEY ("directus_users_id") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "payments_orders" ADD CONSTRAINT "payments_orders_payments_id_payments_id_fkey" FOREIGN KEY ("payments_id") REFERENCES "payments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "payments_orders" ADD CONSTRAINT "payments_orders_orders_id_orders_id_fkey" FOREIGN KEY ("orders_id") REFERENCES "orders"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "pickup_locations_city" ADD CONSTRAINT "pickup_locations_city_7oFLpGaOTAVn_fkey" FOREIGN KEY ("pickup_locations_id") REFERENCES "pickup_locations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "pickup_locations_country" ADD CONSTRAINT "pickup_locations_country_51qU7Ea417QY_fkey" FOREIGN KEY ("pickup_locations_id") REFERENCES "pickup_locations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "pickup_locations_state" ADD CONSTRAINT "pickup_locations_state_XtcA0QrbIBtr_fkey" FOREIGN KEY ("pickup_locations_id") REFERENCES "pickup_locations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."places_characters" ADD CONSTRAINT "places_characters_places_id_places_id_fkey" FOREIGN KEY ("places_id") REFERENCES "enovels"."places"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."places_characters" ADD CONSTRAINT "places_characters_characters_id_characters_id_fkey" FOREIGN KEY ("characters_id") REFERENCES "enovels"."characters"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."places" ADD CONSTRAINT "places_image_directus_files_id_fkey" FOREIGN KEY ("image") REFERENCES "enovels"."directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."places_items" ADD CONSTRAINT "places_items_places_id_places_id_fkey" FOREIGN KEY ("places_id") REFERENCES "enovels"."places"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."places_items" ADD CONSTRAINT "places_items_items_id_items_id_fkey" FOREIGN KEY ("items_id") REFERENCES "enovels"."items"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "platform" ADD CONSTRAINT "platform_image_directus_files_id_fkey" FOREIGN KEY ("image") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "platform_articles" ADD CONSTRAINT "platform_articles_platform_id_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "platform"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "platform_articles" ADD CONSTRAINT "platform_articles_articles_id_articles_id_fkey" FOREIGN KEY ("articles_id") REFERENCES "articles"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "platform_categories" ADD CONSTRAINT "platform_categories_platform_id_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "platform"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "platform_categories" ADD CONSTRAINT "platform_categories_categories_id_categories_id_fkey" FOREIGN KEY ("categories_id") REFERENCES "categories"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "platform_lists" ADD CONSTRAINT "platform_lists_platform_id_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "platform"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "platform_lists" ADD CONSTRAINT "platform_lists_lists_id_lists_id_fkey" FOREIGN KEY ("lists_id") REFERENCES "lists"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "platform_navigation" ADD CONSTRAINT "platform_navigation_platform_id_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "platform"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "platform_navigation" ADD CONSTRAINT "platform_navigation_navigation_id_navigation_id_fkey" FOREIGN KEY ("navigation_id") REFERENCES "navigation"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "platform_page_blocks" ADD CONSTRAINT "platform_page_blocks_platform_id_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "platform"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "platform_page_blocks" ADD CONSTRAINT "platform_page_blocks_page_blocks_id_page_blocks_id_fkey" FOREIGN KEY ("page_blocks_id") REFERENCES "page_blocks"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "platform_pages" ADD CONSTRAINT "platform_pages_platform_id_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "platform"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "platform_pages" ADD CONSTRAINT "platform_pages_pages_id_pages_id_fkey" FOREIGN KEY ("pages_id") REFERENCES "pages"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "platform_products" ADD CONSTRAINT "platform_products_platform_id_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "platform"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "platform_products" ADD CONSTRAINT "platform_products_products_id_products_id_fkey" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "polls" ADD CONSTRAINT "polls_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "polls" ADD CONSTRAINT "polls_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "polls" ADD CONSTRAINT "polls_image_directus_files_id_fkey" FOREIGN KEY ("image") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "polls" ADD CONSTRAINT "polls_author_directus_users_id_fkey" FOREIGN KEY ("author") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "polls_spaces" ADD CONSTRAINT "polls_spaces_polls_id_polls_id_fkey" FOREIGN KEY ("polls_id") REFERENCES "polls"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "polls_spaces" ADD CONSTRAINT "polls_spaces_spaces_id_spaces_id_fkey" FOREIGN KEY ("spaces_id") REFERENCES "spaces"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "post_gallery_items" ADD CONSTRAINT "post_gallery_items_directus_files_id_directus_files_id_fkey" FOREIGN KEY ("directus_files_id") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "postgresstores_collections" ADD CONSTRAINT "postgresstores_collections_P5X7xz2VkqyH_fkey" FOREIGN KEY ("postgresstores_id") REFERENCES "postgresstores"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "postgresstores_collections" ADD CONSTRAINT "postgresstores_collections_collections_id_collections_id_fkey" FOREIGN KEY ("collections_id") REFERENCES "collections"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "postgresstores_products" ADD CONSTRAINT "postgresstores_products_3eVdtUBksZ7u_fkey" FOREIGN KEY ("postgresstores_id") REFERENCES "postgresstores"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "postgresstores_products" ADD CONSTRAINT "postgresstores_products_products_id_products_id_fkey" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "postgresstores_websites" ADD CONSTRAINT "postgresstores_websites_bdgqgLHgpdR0_fkey" FOREIGN KEY ("postgresstores_id") REFERENCES "postgresstores"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "postgresstores_websites" ADD CONSTRAINT "postgresstores_websites_websites_id_websites_id_fkey" FOREIGN KEY ("websites_id") REFERENCES "websites"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_image_directus_files_id_fkey" FOREIGN KEY ("image") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_audio_directus_files_id_fkey" FOREIGN KEY ("audio") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_directus_users_id_fkey" FOREIGN KEY ("author") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_seo_seo_id_fkey" FOREIGN KEY ("seo") REFERENCES "seo"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "posts_departments" ADD CONSTRAINT "posts_departments_posts_id_posts_id_fkey" FOREIGN KEY ("posts_id") REFERENCES "posts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "posts_departments" ADD CONSTRAINT "posts_departments_departments_id_departments_id_fkey" FOREIGN KEY ("departments_id") REFERENCES "departments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "posts_polls" ADD CONSTRAINT "posts_polls_posts_id_posts_id_fkey" FOREIGN KEY ("posts_id") REFERENCES "posts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "posts_polls" ADD CONSTRAINT "posts_polls_polls_id_polls_id_fkey" FOREIGN KEY ("polls_id") REFERENCES "polls"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "product_attributes" ADD CONSTRAINT "product_attributes_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "product_attributes" ADD CONSTRAINT "product_attributes_attribute_id_attributes_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "attributes"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "product_types_products" ADD CONSTRAINT "product_types_products_product_types_id_product_types_id_fkey" FOREIGN KEY ("product_types_id") REFERENCES "product_types"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "product_types_products" ADD CONSTRAINT "product_types_products_products_id_products_id_fkey" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "products_attributes" ADD CONSTRAINT "products_attributes_products_id_products_id_fkey" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "products_attributes" ADD CONSTRAINT "products_attributes_attributes_id_attributes_id_fkey" FOREIGN KEY ("attributes_id") REFERENCES "attributes"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "products_categories" ADD CONSTRAINT "products_categories_products_id_products_id_fkey" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "products_categories" ADD CONSTRAINT "products_categories_categories_id_categories_id_fkey" FOREIGN KEY ("categories_id") REFERENCES "categories"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "products_countries" ADD CONSTRAINT "products_countries_products_id_products_id_fkey" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "products_currency" ADD CONSTRAINT "products_currency_products_id_products_id_fkey" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "products_currency" ADD CONSTRAINT "products_currency_currency_id_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "currency"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "products_departments" ADD CONSTRAINT "products_departments_products_id_products_id_fkey" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "products_departments" ADD CONSTRAINT "products_departments_departments_id_departments_id_fkey" FOREIGN KEY ("departments_id") REFERENCES "departments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "products_directus_users" ADD CONSTRAINT "products_directus_users_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "products_manufacturer" ADD CONSTRAINT "products_manufacturer_products_id_products_id_fkey" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "products_manufacturer" ADD CONSTRAINT "products_manufacturer_manufacturer_id_manufacturer_id_fkey" FOREIGN KEY ("manufacturer_id") REFERENCES "manufacturer"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "products_product_designer" ADD CONSTRAINT "products_product_designer_products_id_products_id_fkey" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "products_spaces" ADD CONSTRAINT "products_spaces_products_id_products_id_fkey" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "products_spaces" ADD CONSTRAINT "products_spaces_spaces_id_spaces_id_fkey" FOREIGN KEY ("spaces_id") REFERENCES "spaces"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "products_tags" ADD CONSTRAINT "products_tags_products_id_products_id_fkey" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "products_tags" ADD CONSTRAINT "products_tags_tags_id_tags_id_fkey" FOREIGN KEY ("tags_id") REFERENCES "tags"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "products_websites" ADD CONSTRAINT "products_websites_products_id_products_id_fkey" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "products_websites" ADD CONSTRAINT "products_websites_websites_id_websites_id_fkey" FOREIGN KEY ("websites_id") REFERENCES "websites"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_directus_users_id_fkey" FOREIGN KEY ("user") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_role_directus_roles_id_fkey" FOREIGN KEY ("role") REFERENCES "directus_roles"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_avatar_directus_files_id_fkey" FOREIGN KEY ("avatar") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "profiles_cities" ADD CONSTRAINT "profiles_cities_profiles_id_profiles_id_fkey" FOREIGN KEY ("profiles_id") REFERENCES "profiles"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "profiles_cities" ADD CONSTRAINT "profiles_cities_cities_id_cities_id_fkey" FOREIGN KEY ("cities_id") REFERENCES "cities"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "profiles_countries" ADD CONSTRAINT "profiles_countries_profiles_id_profiles_id_fkey" FOREIGN KEY ("profiles_id") REFERENCES "profiles"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "profiles_countries" ADD CONSTRAINT "profiles_countries_countries_id_countries_id_fkey" FOREIGN KEY ("countries_id") REFERENCES "countries"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "profiles_followers" ADD CONSTRAINT "profiles_followers_profiles_id_profiles_id_fkey" FOREIGN KEY ("profiles_id") REFERENCES "profiles"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "profiles_followers" ADD CONSTRAINT "profiles_followers_followers_id_followers_id_fkey" FOREIGN KEY ("followers_id") REFERENCES "followers"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "profiles_states" ADD CONSTRAINT "profiles_states_profiles_id_profiles_id_fkey" FOREIGN KEY ("profiles_id") REFERENCES "profiles"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "profiles_states" ADD CONSTRAINT "profiles_states_states_id_states_id_fkey" FOREIGN KEY ("states_id") REFERENCES "states"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "project_board" ADD CONSTRAINT "project_board_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "project_board" ADD CONSTRAINT "project_board_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "project_board_comments" ADD CONSTRAINT "project_board_comments_project_board_id_project_board_id_fkey" FOREIGN KEY ("project_board_id") REFERENCES "project_board"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "project_board_comments" ADD CONSTRAINT "project_board_comments_comments_id_comments_id_fkey" FOREIGN KEY ("comments_id") REFERENCES "comments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "project_board_directus_users" ADD CONSTRAINT "project_board_directus_users_qJD0Zkg2tzzP_fkey" FOREIGN KEY ("project_board_id") REFERENCES "project_board"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "project_board_directus_users" ADD CONSTRAINT "project_board_directus_users_WNaIjUaaR1Z7_fkey" FOREIGN KEY ("directus_users_id") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "project_board_files" ADD CONSTRAINT "project_board_files_project_board_id_project_board_id_fkey" FOREIGN KEY ("project_board_id") REFERENCES "project_board"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "project_board_files" ADD CONSTRAINT "project_board_files_directus_files_id_directus_files_id_fkey" FOREIGN KEY ("directus_files_id") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "project_board_projects" ADD CONSTRAINT "project_board_projects_project_board_id_project_board_id_fkey" FOREIGN KEY ("project_board_id") REFERENCES "project_board"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "project_board_projects" ADD CONSTRAINT "project_board_projects_projects_id_projects_id_fkey" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_icon_directus_files_id_fkey" FOREIGN KEY ("icon") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "projects_calendar" ADD CONSTRAINT "projects_calendar_projects_id_projects_id_fkey" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "projects_calendar" ADD CONSTRAINT "projects_calendar_calendar_id_calendar_id_fkey" FOREIGN KEY ("calendar_id") REFERENCES "calendar"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "projects_comments" ADD CONSTRAINT "projects_comments_projects_id_projects_id_fkey" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "projects_comments" ADD CONSTRAINT "projects_comments_comments_id_comments_id_fkey" FOREIGN KEY ("comments_id") REFERENCES "comments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "projects_directus_users" ADD CONSTRAINT "projects_directus_users_projects_id_projects_id_fkey" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "projects_directus_users" ADD CONSTRAINT "projects_directus_users_W6M8jljNWss5_fkey" FOREIGN KEY ("directus_users_id") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "projects_files" ADD CONSTRAINT "projects_files_projects_id_projects_id_fkey" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "projects_files" ADD CONSTRAINT "projects_files_directus_files_id_directus_files_id_fkey" FOREIGN KEY ("directus_files_id") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "projects_integrations" ADD CONSTRAINT "projects_integrations_projects_id_projects_id_fkey" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "projects_integrations" ADD CONSTRAINT "projects_integrations_integrations_id_integrations_id_fkey" FOREIGN KEY ("integrations_id") REFERENCES "integrations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "projects_lists" ADD CONSTRAINT "projects_lists_projects_id_projects_id_fkey" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "projects_lists" ADD CONSTRAINT "projects_lists_lists_id_lists_id_fkey" FOREIGN KEY ("lists_id") REFERENCES "lists"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "projects_products" ADD CONSTRAINT "projects_products_projects_id_projects_id_fkey" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "projects_products" ADD CONSTRAINT "projects_products_products_id_products_id_fkey" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "projects_project_timeline" ADD CONSTRAINT "projects_project_timeline_projects_id_projects_id_fkey" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "projects_project_timeline" ADD CONSTRAINT "projects_project_timeline_yzWChdyyOYaU_fkey" FOREIGN KEY ("project_timeline_id") REFERENCES "project_timeline"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "projects_region" ADD CONSTRAINT "projects_region_projects_id_projects_id_fkey" FOREIGN KEY ("projects_id") REFERENCES "projects"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "projects_region" ADD CONSTRAINT "projects_region_region_id_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "region"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "radios" ADD CONSTRAINT "radios_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "radios" ADD CONSTRAINT "radios_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "radios" ADD CONSTRAINT "radios_image_directus_files_id_fkey" FOREIGN KEY ("image") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "radios" ADD CONSTRAINT "radios_file_directus_files_id_fkey" FOREIGN KEY ("file") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "radios_categories" ADD CONSTRAINT "radios_categories_radios_id_radios_id_fkey" FOREIGN KEY ("radios_id") REFERENCES "radios"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "radios_categories" ADD CONSTRAINT "radios_categories_categories_id_categories_id_fkey" FOREIGN KEY ("categories_id") REFERENCES "categories"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "radios_departments" ADD CONSTRAINT "radios_departments_radios_id_radios_id_fkey" FOREIGN KEY ("radios_id") REFERENCES "radios"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "radios_departments" ADD CONSTRAINT "radios_departments_departments_id_departments_id_fkey" FOREIGN KEY ("departments_id") REFERENCES "departments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "radios_musicchart" ADD CONSTRAINT "radios_musicchart_radios_id_radios_id_fkey" FOREIGN KEY ("radios_id") REFERENCES "radios"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_image_directus_files_id_fkey" FOREIGN KEY ("image") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "ratings_products" ADD CONSTRAINT "ratings_products_ratings_id_ratings_id_fkey" FOREIGN KEY ("ratings_id") REFERENCES "ratings"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "ratings_products" ADD CONSTRAINT "ratings_products_products_id_products_id_fkey" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_posts_posts_id_fkey" FOREIGN KEY ("posts") REFERENCES "posts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_user_id_directus_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_list_id_lists_id_fkey" FOREIGN KEY ("list_id") REFERENCES "lists"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_space_id_spaces_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_video_id_videos_id_fkey" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_product_products_id_fkey" FOREIGN KEY ("product") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_user_directus_users_id_fkey" FOREIGN KEY ("user") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_image_directus_files_id_fkey" FOREIGN KEY ("image") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "reactions_comments" ADD CONSTRAINT "reactions_comments_reactions_id_reactions_id_fkey" FOREIGN KEY ("reactions_id") REFERENCES "reactions"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "reactions_comments" ADD CONSTRAINT "reactions_comments_comments_id_comments_id_fkey" FOREIGN KEY ("comments_id") REFERENCES "comments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "reactions_directus_users" ADD CONSTRAINT "reactions_directus_users_reaction_id_reactions_id_fkey" FOREIGN KEY ("reaction_id") REFERENCES "reactions"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "reactions_lists" ADD CONSTRAINT "reactions_lists_reactions_id_reactions_id_fkey" FOREIGN KEY ("reactions_id") REFERENCES "reactions"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "reactions_lists" ADD CONSTRAINT "reactions_lists_lists_id_lists_id_fkey" FOREIGN KEY ("lists_id") REFERENCES "lists"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "reactions_posts" ADD CONSTRAINT "reactions_posts_reactions_id_reactions_id_fkey" FOREIGN KEY ("reactions_id") REFERENCES "reactions"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "reactions_posts" ADD CONSTRAINT "reactions_posts_posts_id_posts_id_fkey" FOREIGN KEY ("posts_id") REFERENCES "posts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "reactions_shorts" ADD CONSTRAINT "reactions_shorts_reactions_id_reactions_id_fkey" FOREIGN KEY ("reactions_id") REFERENCES "reactions"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "reactions_shorts" ADD CONSTRAINT "reactions_shorts_shorts_id_shorts_id_fkey" FOREIGN KEY ("shorts_id") REFERENCES "shorts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "redirects" ADD CONSTRAINT "redirects_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "redirects" ADD CONSTRAINT "redirects_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "auth"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_session_id_sessions_id_fkey" FOREIGN KEY ("session_id") REFERENCES "auth"."sessions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "region_address" ADD CONSTRAINT "region_address_region_id_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "region"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "region_address" ADD CONSTRAINT "region_address_address_id_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "address"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "region_countries" ADD CONSTRAINT "region_countries_region_id_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "region"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "region_countries" ADD CONSTRAINT "region_countries_countries_id_countries_id_fkey" FOREIGN KEY ("countries_id") REFERENCES "countries"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "region_shipping_address" ADD CONSTRAINT "region_shipping_address_region_id_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "region"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "region_shipping_address" ADD CONSTRAINT "region_shipping_address_pO9cUZLGlqYg_fkey" FOREIGN KEY ("shipping_address_id") REFERENCES "shipping_address"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "related_products" ADD CONSTRAINT "related_products_user_directus_users_id_fkey" FOREIGN KEY ("user") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "related_products_products" ADD CONSTRAINT "related_products_products_E2YPqw2AF9sX_fkey" FOREIGN KEY ("related_products_id") REFERENCES "related_products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "related_products_products" ADD CONSTRAINT "related_products_products_products_id_products_id_fkey" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "report_comments" ADD CONSTRAINT "report_comments_report_id_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "report"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "report_comments" ADD CONSTRAINT "report_comments_comments_id_comments_id_fkey" FOREIGN KEY ("comments_id") REFERENCES "comments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "report_directus_users" ADD CONSTRAINT "report_directus_users_report_id_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "report"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "report_faqs" ADD CONSTRAINT "report_faqs_report_id_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "report"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "report_faqs" ADD CONSTRAINT "report_faqs_faqs_id_faqs_id_fkey" FOREIGN KEY ("faqs_id") REFERENCES "faqs"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "report_posts" ADD CONSTRAINT "report_posts_report_id_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "report"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "report_posts" ADD CONSTRAINT "report_posts_posts_id_posts_id_fkey" FOREIGN KEY ("posts_id") REFERENCES "posts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "report_products" ADD CONSTRAINT "report_products_report_id_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "report"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "report_products" ADD CONSTRAINT "report_products_products_id_products_id_fkey" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "report_spaces" ADD CONSTRAINT "report_spaces_report_id_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "report"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "report_spaces" ADD CONSTRAINT "report_spaces_spaces_id_spaces_id_fkey" FOREIGN KEY ("spaces_id") REFERENCES "spaces"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "returns_orders" ADD CONSTRAINT "returns_orders_returns_id_returns_id_fkey" FOREIGN KEY ("returns_id") REFERENCES "returns"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "returns_orders" ADD CONSTRAINT "returns_orders_orders_id_orders_id_fkey" FOREIGN KEY ("orders_id") REFERENCES "orders"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "returns_products" ADD CONSTRAINT "returns_products_returns_id_returns_id_fkey" FOREIGN KEY ("returns_id") REFERENCES "returns"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "returns_products" ADD CONSTRAINT "returns_products_products_id_products_id_fkey" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "reviews_products" ADD CONSTRAINT "reviews_products_products_id_products_id_fkey" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "storage"."s3_multipart_uploads" ADD CONSTRAINT "s3_multipart_uploads_bucket_id_buckets_id_fkey" FOREIGN KEY ("bucket_id") REFERENCES "storage"."buckets"("id");--> statement-breakpoint
ALTER TABLE "storage"."s3_multipart_uploads_parts" ADD CONSTRAINT "s3_multipart_uploads_parts_kgbyqUQsy1fg_fkey" FOREIGN KEY ("upload_id") REFERENCES "storage"."s3_multipart_uploads"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "storage"."s3_multipart_uploads_parts" ADD CONSTRAINT "s3_multipart_uploads_parts_bucket_id_buckets_id_fkey" FOREIGN KEY ("bucket_id") REFERENCES "storage"."buckets"("id");--> statement-breakpoint
ALTER TABLE "auth"."saml_providers" ADD CONSTRAINT "saml_providers_sso_provider_id_sso_providers_id_fkey" FOREIGN KEY ("sso_provider_id") REFERENCES "auth"."sso_providers"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "auth"."saml_relay_states" ADD CONSTRAINT "saml_relay_states_sso_provider_id_sso_providers_id_fkey" FOREIGN KEY ("sso_provider_id") REFERENCES "auth"."sso_providers"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "auth"."saml_relay_states" ADD CONSTRAINT "saml_relay_states_flow_state_id_flow_state_id_fkey" FOREIGN KEY ("flow_state_id") REFERENCES "auth"."flow_state"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "seasons" ADD CONSTRAINT "seasons_name_videos_id_fkey" FOREIGN KEY ("name") REFERENCES "videos"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "seasons_videos" ADD CONSTRAINT "seasons_videos_seasons_id_seasons_id_fkey" FOREIGN KEY ("seasons_id") REFERENCES "seasons"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "seasons_videos" ADD CONSTRAINT "seasons_videos_videos_id_videos_id_fkey" FOREIGN KEY ("videos_id") REFERENCES "videos"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "auth"."sessions" ADD CONSTRAINT "sessions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "auth"."sessions" ADD CONSTRAINT "sessions_oauth_client_id_oauth_clients_id_fkey" FOREIGN KEY ("oauth_client_id") REFERENCES "auth"."oauth_clients"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "shipment" ADD CONSTRAINT "shipment_order_orders_id_fkey" FOREIGN KEY ("order") REFERENCES "orders"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shipment_address" ADD CONSTRAINT "shipment_address_shipment_id_shipment_id_fkey" FOREIGN KEY ("shipment_id") REFERENCES "shipment"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shipment_address" ADD CONSTRAINT "shipment_address_address_id_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "address"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shipment_comments" ADD CONSTRAINT "shipment_comments_parent_id_shipment_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "shipment"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shipment_products" ADD CONSTRAINT "shipment_products_shipment_id_shipment_id_fkey" FOREIGN KEY ("shipment_id") REFERENCES "shipment"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shipment_products" ADD CONSTRAINT "shipment_products_products_id_products_id_fkey" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shipment_tracking" ADD CONSTRAINT "shipment_tracking_parent_id_shipment_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "shipment"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shipping_addresses_cities" ADD CONSTRAINT "shipping_addresses_cities_EauvN0dE4vs1_fkey" FOREIGN KEY ("shipping_addresses_id") REFERENCES "shipping_addresses"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shipping_addresses_cities" ADD CONSTRAINT "shipping_addresses_cities_cities_id_cities_id_fkey" FOREIGN KEY ("cities_id") REFERENCES "cities"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shipping_addresses_countries" ADD CONSTRAINT "shipping_addresses_countries_AbmkwxuW9muk_fkey" FOREIGN KEY ("shipping_addresses_id") REFERENCES "shipping_addresses"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shipping_addresses_countries" ADD CONSTRAINT "shipping_addresses_countries_countries_id_countries_id_fkey" FOREIGN KEY ("countries_id") REFERENCES "countries"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shipping_addresses_directus_users" ADD CONSTRAINT "shipping_addresses_directus_users_PKTkJ01lVq80_fkey" FOREIGN KEY ("shipping_addresses_id") REFERENCES "shipping_addresses"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shipping_addresses_directus_users" ADD CONSTRAINT "shipping_addresses_directus_users_vNbFNRkHFFnQ_fkey" FOREIGN KEY ("directus_users_id") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shipping_addresses_orders" ADD CONSTRAINT "shipping_addresses_orders_DMyGzeMTrHsP_fkey" FOREIGN KEY ("shipping_addresses_id") REFERENCES "shipping_addresses"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shipping_addresses_orders" ADD CONSTRAINT "shipping_addresses_orders_orders_id_orders_id_fkey" FOREIGN KEY ("orders_id") REFERENCES "orders"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shipping_addresses_states" ADD CONSTRAINT "shipping_addresses_states_aYicxg2jwgew_fkey" FOREIGN KEY ("shipping_addresses_id") REFERENCES "shipping_addresses"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shipping_addresses_states" ADD CONSTRAINT "shipping_addresses_states_states_id_states_id_fkey" FOREIGN KEY ("states_id") REFERENCES "states"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shop_type_shops" ADD CONSTRAINT "shop_type_shops_shop_type_id_shop_type_id_fkey" FOREIGN KEY ("shop_type_id") REFERENCES "shop_type"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shop_type_shops" ADD CONSTRAINT "shop_type_shops_shops_id_shops_id_fkey" FOREIGN KEY ("shops_id") REFERENCES "shops"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shops_agreements" ADD CONSTRAINT "shops_agreements_shops_id_shops_id_fkey" FOREIGN KEY ("shops_id") REFERENCES "shops"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shops_categories" ADD CONSTRAINT "shops_categories_shops_id_shops_id_fkey" FOREIGN KEY ("shops_id") REFERENCES "shops"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shops_categories" ADD CONSTRAINT "shops_categories_categories_id_categories_id_fkey" FOREIGN KEY ("categories_id") REFERENCES "categories"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shops_comments" ADD CONSTRAINT "shops_comments_shops_id_shops_id_fkey" FOREIGN KEY ("shops_id") REFERENCES "shops"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shops_comments" ADD CONSTRAINT "shops_comments_comments_id_comments_id_fkey" FOREIGN KEY ("comments_id") REFERENCES "comments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shops_countries" ADD CONSTRAINT "shops_countries_shops_id_shops_id_fkey" FOREIGN KEY ("shops_id") REFERENCES "shops"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shops_countries" ADD CONSTRAINT "shops_countries_countries_id_countries_id_fkey" FOREIGN KEY ("countries_id") REFERENCES "countries"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shops_departments" ADD CONSTRAINT "shops_departments_shops_id_shops_id_fkey" FOREIGN KEY ("shops_id") REFERENCES "shops"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shops_departments" ADD CONSTRAINT "shops_departments_departments_id_departments_id_fkey" FOREIGN KEY ("departments_id") REFERENCES "departments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shops_directus_users" ADD CONSTRAINT "shops_directus_users_shops_id_shops_id_fkey" FOREIGN KEY ("shops_id") REFERENCES "shops"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shops_files" ADD CONSTRAINT "shops_files_shops_id_shops_id_fkey" FOREIGN KEY ("shops_id") REFERENCES "shops"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shops_products" ADD CONSTRAINT "shops_products_shops_id_shops_id_fkey" FOREIGN KEY ("shops_id") REFERENCES "shops"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shops_products" ADD CONSTRAINT "shops_products_products_id_products_id_fkey" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shops_showcases" ADD CONSTRAINT "shops_showcases_shops_id_shops_id_fkey" FOREIGN KEY ("shops_id") REFERENCES "shops"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shops_showcases" ADD CONSTRAINT "shops_showcases_showcases_id_showcases_id_fkey" FOREIGN KEY ("showcases_id") REFERENCES "showcases"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shorts" ADD CONSTRAINT "shorts_video_directus_files_id_fkey" FOREIGN KEY ("video") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shorts_directus_users" ADD CONSTRAINT "shorts_directus_users_shorts_id_shorts_id_fkey" FOREIGN KEY ("shorts_id") REFERENCES "shorts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shorts_files" ADD CONSTRAINT "shorts_files_shorts_id_shorts_id_fkey" FOREIGN KEY ("shorts_id") REFERENCES "shorts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shorts_files" ADD CONSTRAINT "shorts_files_directus_files_id_directus_files_id_fkey" FOREIGN KEY ("directus_files_id") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shorts_products" ADD CONSTRAINT "shorts_products_shorts_id_shorts_id_fkey" FOREIGN KEY ("shorts_id") REFERENCES "shorts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shorts_products" ADD CONSTRAINT "shorts_products_products_id_products_id_fkey" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shorts_spaces" ADD CONSTRAINT "shorts_spaces_shorts_id_shorts_id_fkey" FOREIGN KEY ("shorts_id") REFERENCES "shorts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shorts_spaces" ADD CONSTRAINT "shorts_spaces_spaces_id_spaces_id_fkey" FOREIGN KEY ("spaces_id") REFERENCES "spaces"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "showcases" ADD CONSTRAINT "showcases_owner_directus_users_id_fkey" FOREIGN KEY ("owner") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "showcases_products" ADD CONSTRAINT "showcases_products_showcases_id_showcases_id_fkey" FOREIGN KEY ("showcases_id") REFERENCES "showcases"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "showcases_products" ADD CONSTRAINT "showcases_products_products_id_products_id_fkey" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "showcases_shops" ADD CONSTRAINT "showcases_shops_showcases_id_showcases_id_fkey" FOREIGN KEY ("showcases_id") REFERENCES "showcases"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "showcases_shops" ADD CONSTRAINT "showcases_shops_shops_id_shops_id_fkey" FOREIGN KEY ("shops_id") REFERENCES "shops"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "showcases_spaces" ADD CONSTRAINT "showcases_spaces_showcases_id_showcases_id_fkey" FOREIGN KEY ("showcases_id") REFERENCES "showcases"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "showcases_spaces" ADD CONSTRAINT "showcases_spaces_spaces_id_spaces_id_fkey" FOREIGN KEY ("spaces_id") REFERENCES "spaces"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "site_preference_categories" ADD CONSTRAINT "site_preference_categories_categories_id_categories_id_fkey" FOREIGN KEY ("categories_id") REFERENCES "categories"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "site_preference_countries" ADD CONSTRAINT "site_preference_countries_countries_id_countries_id_fkey" FOREIGN KEY ("countries_id") REFERENCES "countries"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "site_preference_departments" ADD CONSTRAINT "site_preference_departments_departments_id_departments_id_fkey" FOREIGN KEY ("departments_id") REFERENCES "departments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "site_preference_products" ADD CONSTRAINT "site_preference_products_products_id_products_id_fkey" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "Space_products" ADD CONSTRAINT "Space_products_products_id_products_id_fkey" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "space_types" ADD CONSTRAINT "space_types_icon_directus_files_id_fkey" FOREIGN KEY ("icon") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces" ADD CONSTRAINT "spaces_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "spaces" ADD CONSTRAINT "spaces_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "spaces" ADD CONSTRAINT "spaces_image_directus_files_id_fkey" FOREIGN KEY ("image") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces" ADD CONSTRAINT "spaces_owner_directus_users_id_fkey" FOREIGN KEY ("owner") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces" ADD CONSTRAINT "spaces_cover_image_directus_files_id_fkey" FOREIGN KEY ("cover_image") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_articles" ADD CONSTRAINT "spaces_articles_spaces_id_spaces_id_fkey" FOREIGN KEY ("spaces_id") REFERENCES "spaces"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_articles" ADD CONSTRAINT "spaces_articles_articles_id_articles_id_fkey" FOREIGN KEY ("articles_id") REFERENCES "articles"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_cities" ADD CONSTRAINT "spaces_cities_spaces_id_spaces_id_fkey" FOREIGN KEY ("spaces_id") REFERENCES "spaces"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_cities" ADD CONSTRAINT "spaces_cities_cities_id_cities_id_fkey" FOREIGN KEY ("cities_id") REFERENCES "cities"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_countries" ADD CONSTRAINT "spaces_countries_spaces_id_spaces_id_fkey" FOREIGN KEY ("spaces_id") REFERENCES "spaces"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_countries" ADD CONSTRAINT "spaces_countries_countries_id_countries_id_fkey" FOREIGN KEY ("countries_id") REFERENCES "countries"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_departments" ADD CONSTRAINT "spaces_departments_spaces_id_spaces_id_fkey" FOREIGN KEY ("spaces_id") REFERENCES "spaces"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_departments" ADD CONSTRAINT "spaces_departments_departments_id_departments_id_fkey" FOREIGN KEY ("departments_id") REFERENCES "departments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_directus_users" ADD CONSTRAINT "spaces_directus_users_spaces_id_spaces_id_fkey" FOREIGN KEY ("spaces_id") REFERENCES "spaces"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_directus_users" ADD CONSTRAINT "spaces_directus_users_directus_users_id_directus_users_id_fkey" FOREIGN KEY ("directus_users_id") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_files" ADD CONSTRAINT "spaces_files_spaces_id_spaces_id_fkey" FOREIGN KEY ("spaces_id") REFERENCES "spaces"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_files" ADD CONSTRAINT "spaces_files_directus_files_id_directus_files_id_fkey" FOREIGN KEY ("directus_files_id") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_lists" ADD CONSTRAINT "spaces_lists_spaces_id_spaces_id_fkey" FOREIGN KEY ("spaces_id") REFERENCES "spaces"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_lists" ADD CONSTRAINT "spaces_lists_lists_id_lists_id_fkey" FOREIGN KEY ("lists_id") REFERENCES "lists"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_live_rooms" ADD CONSTRAINT "spaces_live_rooms_spaces_id_spaces_id_fkey" FOREIGN KEY ("spaces_id") REFERENCES "spaces"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_pages" ADD CONSTRAINT "spaces_pages_spaces_id_spaces_id_fkey" FOREIGN KEY ("spaces_id") REFERENCES "spaces"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_pages" ADD CONSTRAINT "spaces_pages_pages_id_pages_id_fkey" FOREIGN KEY ("pages_id") REFERENCES "pages"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_posts" ADD CONSTRAINT "spaces_posts_spaces_id_spaces_id_fkey" FOREIGN KEY ("spaces_id") REFERENCES "spaces"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_posts" ADD CONSTRAINT "spaces_posts_posts_id_posts_id_fkey" FOREIGN KEY ("posts_id") REFERENCES "posts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_shop_type" ADD CONSTRAINT "spaces_shop_type_spaces_id_spaces_id_fkey" FOREIGN KEY ("spaces_id") REFERENCES "spaces"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_shop_type" ADD CONSTRAINT "spaces_shop_type_shop_type_id_shop_type_id_fkey" FOREIGN KEY ("shop_type_id") REFERENCES "shop_type"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_space_types" ADD CONSTRAINT "spaces_space_types_spaces_id_spaces_id_fkey" FOREIGN KEY ("spaces_id") REFERENCES "spaces"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_space_types" ADD CONSTRAINT "spaces_space_types_space_types_id_space_types_id_fkey" FOREIGN KEY ("space_types_id") REFERENCES "space_types"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_states" ADD CONSTRAINT "spaces_states_spaces_id_spaces_id_fkey" FOREIGN KEY ("spaces_id") REFERENCES "spaces"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_states" ADD CONSTRAINT "spaces_states_states_id_states_id_fkey" FOREIGN KEY ("states_id") REFERENCES "states"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_tags" ADD CONSTRAINT "spaces_tags_spaces_id_spaces_id_fkey" FOREIGN KEY ("spaces_id") REFERENCES "spaces"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_tags" ADD CONSTRAINT "spaces_tags_tags_id_tags_id_fkey" FOREIGN KEY ("tags_id") REFERENCES "tags"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_templates" ADD CONSTRAINT "spaces_templates_spaces_id_spaces_id_fkey" FOREIGN KEY ("spaces_id") REFERENCES "spaces"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "spaces_templates" ADD CONSTRAINT "spaces_templates_templates_id_templates_id_fkey" FOREIGN KEY ("templates_id") REFERENCES "templates"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "auth"."sso_domains" ADD CONSTRAINT "sso_domains_sso_provider_id_sso_providers_id_fkey" FOREIGN KEY ("sso_provider_id") REFERENCES "auth"."sso_providers"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "states_cities" ADD CONSTRAINT "states_cities_states_id_states_id_fkey" FOREIGN KEY ("states_id") REFERENCES "states"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "states_cities" ADD CONSTRAINT "states_cities_cities_id_cities_id_fkey" FOREIGN KEY ("cities_id") REFERENCES "cities"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."stories_characters" ADD CONSTRAINT "stories_characters_stories_id_stories_id_fkey" FOREIGN KEY ("stories_id") REFERENCES "enovels"."stories"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."stories_characters" ADD CONSTRAINT "stories_characters_characters_id_characters_id_fkey" FOREIGN KEY ("characters_id") REFERENCES "enovels"."characters"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."stories" ADD CONSTRAINT "stories_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "enovels"."directus_users"("id");--> statement-breakpoint
ALTER TABLE "enovels"."stories" ADD CONSTRAINT "stories_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "enovels"."directus_users"("id");--> statement-breakpoint
ALTER TABLE "enovels"."stories" ADD CONSTRAINT "stories_image_directus_files_id_fkey" FOREIGN KEY ("image") REFERENCES "enovels"."directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."stories_tags" ADD CONSTRAINT "stories_tags_stories_id_stories_id_fkey" FOREIGN KEY ("stories_id") REFERENCES "enovels"."stories"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."stories_tags" ADD CONSTRAINT "stories_tags_tags_id_tags_id_fkey" FOREIGN KEY ("tags_id") REFERENCES "enovels"."tags"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "streams" ADD CONSTRAINT "streams_stream_id_videos_id_fkey" FOREIGN KEY ("stream_id") REFERENCES "videos"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "streams_ratings" ADD CONSTRAINT "streams_ratings_streams_id_streams_id_fkey" FOREIGN KEY ("streams_id") REFERENCES "streams"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "streams_ratings" ADD CONSTRAINT "streams_ratings_ratings_id_ratings_id_fkey" FOREIGN KEY ("ratings_id") REFERENCES "ratings"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "subscriptions_directus_users" ADD CONSTRAINT "subscriptions_directus_users_sUK9Arrfn3jh_fkey" FOREIGN KEY ("subscriptions_id") REFERENCES "subscriptions"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "subscriptions_products" ADD CONSTRAINT "subscriptions_products_subscriptions_id_subscriptions_id_fkey" FOREIGN KEY ("subscriptions_id") REFERENCES "subscriptions"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "subscriptions_products" ADD CONSTRAINT "subscriptions_products_products_id_products_id_fkey" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "tags_articles" ADD CONSTRAINT "tags_articles_tags_id_tags_id_fkey" FOREIGN KEY ("tags_id") REFERENCES "tags"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "tags_articles" ADD CONSTRAINT "tags_articles_articles_id_articles_id_fkey" FOREIGN KEY ("articles_id") REFERENCES "articles"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "tags_categories" ADD CONSTRAINT "tags_categories_tags_id_tags_id_fkey" FOREIGN KEY ("tags_id") REFERENCES "tags"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "tags_categories" ADD CONSTRAINT "tags_categories_categories_id_categories_id_fkey" FOREIGN KEY ("categories_id") REFERENCES "categories"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "tags_departments" ADD CONSTRAINT "tags_departments_tags_id_tags_id_fkey" FOREIGN KEY ("tags_id") REFERENCES "tags"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "tags_departments" ADD CONSTRAINT "tags_departments_departments_id_departments_id_fkey" FOREIGN KEY ("departments_id") REFERENCES "departments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."tags" ADD CONSTRAINT "tags_image_directus_files_id_fkey" FOREIGN KEY ("image") REFERENCES "enovels"."directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "tags_posts" ADD CONSTRAINT "tags_posts_tags_id_tags_id_fkey" FOREIGN KEY ("tags_id") REFERENCES "tags"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "tags_posts" ADD CONSTRAINT "tags_posts_posts_id_posts_id_fkey" FOREIGN KEY ("posts_id") REFERENCES "posts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "tags_products" ADD CONSTRAINT "tags_products_tags_id_tags_id_fkey" FOREIGN KEY ("tags_id") REFERENCES "tags"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "tags_products" ADD CONSTRAINT "tags_products_products_id_products_id_fkey" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "tags_shorts" ADD CONSTRAINT "tags_shorts_tags_id_tags_id_fkey" FOREIGN KEY ("tags_id") REFERENCES "tags"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "tags_shorts" ADD CONSTRAINT "tags_shorts_shorts_id_shorts_id_fkey" FOREIGN KEY ("shorts_id") REFERENCES "shorts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."tags_videos" ADD CONSTRAINT "tags_videos_tags_id_tags_id_fkey" FOREIGN KEY ("tags_id") REFERENCES "enovels"."tags"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."tags_videos" ADD CONSTRAINT "tags_videos_videos_id_videos_id_fkey" FOREIGN KEY ("videos_id") REFERENCES "enovels"."videos"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "taxes_countries" ADD CONSTRAINT "taxes_countries_taxes_id_taxes_id_fkey" FOREIGN KEY ("taxes_id") REFERENCES "taxes"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "taxes_countries" ADD CONSTRAINT "taxes_countries_countries_id_countries_id_fkey" FOREIGN KEY ("countries_id") REFERENCES "countries"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "taxes_states" ADD CONSTRAINT "taxes_states_taxes_id_taxes_id_fkey" FOREIGN KEY ("taxes_id") REFERENCES "taxes"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "taxes_states" ADD CONSTRAINT "taxes_states_states_id_states_id_fkey" FOREIGN KEY ("states_id") REFERENCES "states"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "team" ADD CONSTRAINT "team_image_directus_files_id_fkey" FOREIGN KEY ("image") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "team" ADD CONSTRAINT "team_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "team" ADD CONSTRAINT "team_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "templates" ADD CONSTRAINT "templates_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "templates" ADD CONSTRAINT "templates_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "templates_space_types" ADD CONSTRAINT "templates_space_types_templates_id_templates_id_fkey" FOREIGN KEY ("templates_id") REFERENCES "templates"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "templates_space_types" ADD CONSTRAINT "templates_space_types_space_types_id_space_types_id_fkey" FOREIGN KEY ("space_types_id") REFERENCES "space_types"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_company_logo_directus_files_id_fkey" FOREIGN KEY ("company_logo") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_image_directus_files_id_fkey" FOREIGN KEY ("image") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_order_orders_id_fkey" FOREIGN KEY ("order") REFERENCES "orders"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "transactions_currency" ADD CONSTRAINT "transactions_currency_transactions_id_transactions_id_fkey" FOREIGN KEY ("transactions_id") REFERENCES "transactions"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "transactions_currency" ADD CONSTRAINT "transactions_currency_currency_id_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "currency"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "translations_postgresstores" ADD CONSTRAINT "translations_postgresstores_I0ZQRzK0tYpu_fkey" FOREIGN KEY ("translations_id") REFERENCES "translations"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "translations_postgresstores" ADD CONSTRAINT "translations_postgresstores_neoYqOSD5rkG_fkey" FOREIGN KEY ("postgresstores_id") REFERENCES "postgresstores"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."types_characters" ADD CONSTRAINT "types_characters_types_id_types_id_fkey" FOREIGN KEY ("types_id") REFERENCES "enovels"."types"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."types_characters" ADD CONSTRAINT "types_characters_characters_id_characters_id_fkey" FOREIGN KEY ("characters_id") REFERENCES "enovels"."characters"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."types" ADD CONSTRAINT "types_image_directus_files_id_fkey" FOREIGN KEY ("image") REFERENCES "enovels"."directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "user_friends" ADD CONSTRAINT "user_friends_user_directus_users_id_fkey" FOREIGN KEY ("user") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "user_friends" ADD CONSTRAINT "user_friends_friend_directus_users_id_fkey" FOREIGN KEY ("friend") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "user_friends_posts" ADD CONSTRAINT "user_friends_posts_user_friends_id_user_friends_id_fkey" FOREIGN KEY ("user_friends_id") REFERENCES "user_friends"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "user_friends_posts" ADD CONSTRAINT "user_friends_posts_posts_id_posts_id_fkey" FOREIGN KEY ("posts_id") REFERENCES "posts"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_user_directus_users_id_fkey" FOREIGN KEY ("user") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_avatar_directus_files_id_fkey" FOREIGN KEY ("avatar") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "variants" ADD CONSTRAINT "variants_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "storage"."vector_indexes" ADD CONSTRAINT "vector_indexes_bucket_id_buckets_vectors_id_fkey" FOREIGN KEY ("bucket_id") REFERENCES "storage"."buckets_vectors"("id");--> statement-breakpoint
ALTER TABLE "vibez_product_map" ADD CONSTRAINT "vibez_product_map_clip_id_vibez_clips_id_fkey" FOREIGN KEY ("clip_id") REFERENCES "vibez_clips"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "vibez_product_map" ADD CONSTRAINT "vibez_product_map_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_user_created_directus_users_id_fkey" FOREIGN KEY ("user_created") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_user_updated_directus_users_id_fkey" FOREIGN KEY ("user_updated") REFERENCES "directus_users"("id");--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_ratings_ratings_id_fkey" FOREIGN KEY ("ratings") REFERENCES "ratings"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_media_directus_files_id_fkey" FOREIGN KEY ("media") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_thumbnail_directus_files_id_fkey" FOREIGN KEY ("thumbnail") REFERENCES "directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_user_directus_users_id_fkey" FOREIGN KEY ("user") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_distributor_attributes_id_fkey" FOREIGN KEY ("distributor") REFERENCES "attributes"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "videos_categories" ADD CONSTRAINT "videos_categories_videos_id_videos_id_fkey" FOREIGN KEY ("videos_id") REFERENCES "videos"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "videos_categories" ADD CONSTRAINT "videos_categories_categories_id_categories_id_fkey" FOREIGN KEY ("categories_id") REFERENCES "categories"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "videos_comments" ADD CONSTRAINT "videos_comments_videos_id_videos_id_fkey" FOREIGN KEY ("videos_id") REFERENCES "videos"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "videos_comments" ADD CONSTRAINT "videos_comments_comments_id_comments_id_fkey" FOREIGN KEY ("comments_id") REFERENCES "comments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "videos_departments" ADD CONSTRAINT "videos_departments_videos_id_videos_id_fkey" FOREIGN KEY ("videos_id") REFERENCES "videos"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "videos_departments" ADD CONSTRAINT "videos_departments_departments_id_departments_id_fkey" FOREIGN KEY ("departments_id") REFERENCES "departments"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "enovels"."videos" ADD CONSTRAINT "videos_file_directus_files_id_fkey" FOREIGN KEY ("file") REFERENCES "enovels"."directus_files"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "videos_manufacturer" ADD CONSTRAINT "videos_manufacturer_videos_id_videos_id_fkey" FOREIGN KEY ("videos_id") REFERENCES "videos"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "videos_manufacturer" ADD CONSTRAINT "videos_manufacturer_manufacturer_id_manufacturer_id_fkey" FOREIGN KEY ("manufacturer_id") REFERENCES "manufacturer"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "videos_product_types" ADD CONSTRAINT "videos_product_types_videos_id_videos_id_fkey" FOREIGN KEY ("videos_id") REFERENCES "videos"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "videos_product_types" ADD CONSTRAINT "videos_product_types_product_types_id_product_types_id_fkey" FOREIGN KEY ("product_types_id") REFERENCES "product_types"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "videos_products" ADD CONSTRAINT "videos_products_videos_id_videos_id_fkey" FOREIGN KEY ("videos_id") REFERENCES "videos"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "videos_products" ADD CONSTRAINT "videos_products_products_id_products_id_fkey" FOREIGN KEY ("products_id") REFERENCES "products"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "videos_tags" ADD CONSTRAINT "videos_tags_videos_id_videos_id_fkey" FOREIGN KEY ("videos_id") REFERENCES "videos"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "videos_tags" ADD CONSTRAINT "videos_tags_tags_id_tags_id_fkey" FOREIGN KEY ("tags_id") REFERENCES "tags"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "auth"."webauthn_challenges" ADD CONSTRAINT "webauthn_challenges_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "auth"."webauthn_credentials" ADD CONSTRAINT "webauthn_credentials_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "websites" ADD CONSTRAINT "websites_creator_directus_users_id_fkey" FOREIGN KEY ("creator") REFERENCES "directus_users"("id") ON DELETE SET NULL;--> statement-breakpoint
CREATE VIEW "pgsodium"."masking_rule" AS (WITH const AS ( SELECT 'encrypt +with +key +id +([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})'::text AS pattern_key_id, 'encrypt +with +key +column +([w"-$]+)'::text AS pattern_key_id_column, '(?<=associated) +(([w"-$, ]+))'::text AS pattern_associated_columns, '(?<=nonce) +([w"-$]+)'::text AS pattern_nonce_column, '(?<=decrypt with view) +([w"-$]+.[w"-$]+)'::text AS pattern_view_name, '(?<=security invoker)'::text AS pattern_security_invoker ), rules_from_seclabels AS ( SELECT sl.objoid AS attrelid, sl.objsubid AS attnum, c.relnamespace::regnamespace AS relnamespace, c.relname, a.attname, format_type(a.atttypid, a.atttypmod) AS format_type, sl.label AS col_description, (regexp_match(sl.label, k.pattern_key_id_column, 'i'::text))[1] AS key_id_column, (regexp_match(sl.label, k.pattern_key_id, 'i'::text))[1] AS key_id, (regexp_match(sl.label, k.pattern_associated_columns, 'i'::text))[1] AS associated_columns, (regexp_match(sl.label, k.pattern_nonce_column, 'i'::text))[1] AS nonce_column, COALESCE((regexp_match(sl2.label, k.pattern_view_name, 'i'::text))[1], (c.relnamespace::regnamespace || '.'::text) || quote_ident('decrypted_'::text || c.relname::text)) AS view_name, 100 AS priority, (regexp_match(sl.label, k.pattern_security_invoker, 'i'::text))[1] IS NOT NULL AS security_invoker FROM const k, pg_seclabel sl JOIN pg_class c ON sl.classoid = c.tableoid AND sl.objoid = c.oid JOIN pg_attribute a ON a.attrelid = c.oid AND sl.objsubid = a.attnum LEFT JOIN pg_seclabel sl2 ON sl2.objoid = c.oid AND sl2.objsubid = 0 WHERE a.attnum > 0 AND c.relnamespace::regnamespace::oid <> 'pg_catalog'::regnamespace::oid AND NOT a.attisdropped AND sl.label ~~* 'ENCRYPT%'::text AND sl.provider = 'pgsodium'::text ) SELECT DISTINCT ON (rules_from_seclabels.attrelid, rules_from_seclabels.attnum) rules_from_seclabels.attrelid, rules_from_seclabels.attnum, rules_from_seclabels.relnamespace, rules_from_seclabels.relname, rules_from_seclabels.attname, rules_from_seclabels.format_type, rules_from_seclabels.col_description, rules_from_seclabels.key_id_column, rules_from_seclabels.key_id, rules_from_seclabels.associated_columns, rules_from_seclabels.nonce_column, rules_from_seclabels.view_name, rules_from_seclabels.priority, rules_from_seclabels.security_invoker FROM rules_from_seclabels ORDER BY rules_from_seclabels.attrelid, rules_from_seclabels.attnum, rules_from_seclabels.priority DESC);--> statement-breakpoint
CREATE VIEW "vault"."decrypted_secrets" AS (SELECT s.id, s.name, s.description, s.secret, convert_from(vault._crypto_aead_det_decrypt(message => decode(s.secret, 'base64'::text), additional => convert_to(s.id::text, 'utf8'::name), key_id => 0::bigint, context => 'p67736f6469756d'::bytea, nonce => s.nonce), 'utf8'::name) AS decrypted_secret, s.key_id, s.nonce, s.created_at, s.updated_at FROM vault.secrets s);