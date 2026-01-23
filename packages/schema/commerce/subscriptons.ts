export interface MeeoviSubscription {
  id: number
  status?: string | null
  date_created?: string | null
  date_updated?: string | null
  subscription_number?: string | null
  start_date?: string | null
  end_date?: string | null
  // relations omitted: subscriptions_directus_users[], subscriptions_products[]
}

