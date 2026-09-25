/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type AddDownloadableProductsToCartInput = {
  /** The ID of the cart. */
  cart_id: string;
  /** An array of downloadable products to add. */
  cart_items: Array<DownloadableProductCartItemInput | null | undefined>;
};

/** Defines the simple and group products to add to the cart. */
export type AddSimpleProductsToCartInput = {
  /** The unique ID of a `Cart` object. */
  cart_id: string;
  /** An array of simple and group items to add. */
  cart_items: Array<SimpleProductCartItemInput | null | undefined>;
};

/** Defines the virtual products to add to the cart. */
export type AddVirtualProductsToCartInput = {
  /** The unique ID of a `Cart` object. */
  cart_id: string;
  /** An array of virtual products to add. */
  cart_items: Array<VirtualProductCartItemInput | null | undefined>;
};

/** Defines an item to be added to the cart. */
export type CartItemInput = {
  /** An array of entered options for the base product, such as personalization text. */
  entered_options?: Array<EnteredOptionInput | null | undefined> | null | undefined;
  /** For a child product, the SKU of its parent product. */
  parent_sku?: string | null | undefined;
  /** The amount or number of an item to add. */
  quantity: number;
  /** The selected options for the base product, such as color or size, using the unique ID for an object such as `CustomizableRadioOption`, `CustomizableDropDownOption`, or `ConfigurableProductOptionsValues`. */
  selected_options?: Array<string | number | null | undefined> | null | undefined;
  /** The SKU of the product. */
  sku: string;
};

/** The list of country codes. */
export type CountryCodeEnum =
  /** Andorra */
  | 'AD'
  /** United Arab Emirates */
  | 'AE'
  /** Afghanistan */
  | 'AF'
  /** Antigua & Barbuda */
  | 'AG'
  /** Anguilla */
  | 'AI'
  /** Albania */
  | 'AL'
  /** Armenia */
  | 'AM'
  /** Netherlands Antilles */
  | 'AN'
  /** Angola */
  | 'AO'
  /** Antarctica */
  | 'AQ'
  /** Argentina */
  | 'AR'
  /** American Samoa */
  | 'AS'
  /** Austria */
  | 'AT'
  /** Australia */
  | 'AU'
  /** Aruba */
  | 'AW'
  /** Åland Islands */
  | 'AX'
  /** Azerbaijan */
  | 'AZ'
  /** Bosnia & Herzegovina */
  | 'BA'
  /** Barbados */
  | 'BB'
  /** Bangladesh */
  | 'BD'
  /** Belgium */
  | 'BE'
  /** Burkina Faso */
  | 'BF'
  /** Bulgaria */
  | 'BG'
  /** Bahrain */
  | 'BH'
  /** Burundi */
  | 'BI'
  /** Benin */
  | 'BJ'
  /** St. Barthélemy */
  | 'BL'
  /** Bermuda */
  | 'BM'
  /** Brunei */
  | 'BN'
  /** Bolivia */
  | 'BO'
  /** Brazil */
  | 'BR'
  /** Bahamas */
  | 'BS'
  /** Bhutan */
  | 'BT'
  /** Bouvet Island */
  | 'BV'
  /** Botswana */
  | 'BW'
  /** Belarus */
  | 'BY'
  /** Belize */
  | 'BZ'
  /** Canada */
  | 'CA'
  /** Cocos (Keeling) Islands */
  | 'CC'
  /** Congo-Kinshasa */
  | 'CD'
  /** Central African Republic */
  | 'CF'
  /** Congo-Brazzaville */
  | 'CG'
  /** Switzerland */
  | 'CH'
  /** Côte d’Ivoire */
  | 'CI'
  /** Cook Islands */
  | 'CK'
  /** Chile */
  | 'CL'
  /** Cameroon */
  | 'CM'
  /** China */
  | 'CN'
  /** Colombia */
  | 'CO'
  /** Costa Rica */
  | 'CR'
  /** Cuba */
  | 'CU'
  /** Cape Verde */
  | 'CV'
  /** Christmas Island */
  | 'CX'
  /** Cyprus */
  | 'CY'
  /** Czech Republic */
  | 'CZ'
  /** Germany */
  | 'DE'
  /** Djibouti */
  | 'DJ'
  /** Denmark */
  | 'DK'
  /** Dominica */
  | 'DM'
  /** Dominican Republic */
  | 'DO'
  /** Algeria */
  | 'DZ'
  /** Ecuador */
  | 'EC'
  /** Estonia */
  | 'EE'
  /** Egypt */
  | 'EG'
  /** Western Sahara */
  | 'EH'
  /** Eritrea */
  | 'ER'
  /** Spain */
  | 'ES'
  /** Ethiopia */
  | 'ET'
  /** Finland */
  | 'FI'
  /** Fiji */
  | 'FJ'
  /** Falkland Islands */
  | 'FK'
  /** Micronesia */
  | 'FM'
  /** Faroe Islands */
  | 'FO'
  /** France */
  | 'FR'
  /** Gabon */
  | 'GA'
  /** United Kingdom */
  | 'GB'
  /** Grenada */
  | 'GD'
  /** Georgia */
  | 'GE'
  /** French Guiana */
  | 'GF'
  /** Guernsey */
  | 'GG'
  /** Ghana */
  | 'GH'
  /** Gibraltar */
  | 'GI'
  /** Greenland */
  | 'GL'
  /** Gambia */
  | 'GM'
  /** Guinea */
  | 'GN'
  /** Guadeloupe */
  | 'GP'
  /** Equatorial Guinea */
  | 'GQ'
  /** Greece */
  | 'GR'
  /** South Georgia & South Sandwich Islands */
  | 'GS'
  /** Guatemala */
  | 'GT'
  /** Guam */
  | 'GU'
  /** Guinea-Bissau */
  | 'GW'
  /** Guyana */
  | 'GY'
  /** Hong Kong SAR China */
  | 'HK'
  /** Heard &amp; McDonald Islands */
  | 'HM'
  /** Honduras */
  | 'HN'
  /** Croatia */
  | 'HR'
  /** Haiti */
  | 'HT'
  /** Hungary */
  | 'HU'
  /** Indonesia */
  | 'ID'
  /** Ireland */
  | 'IE'
  /** Israel */
  | 'IL'
  /** Isle of Man */
  | 'IM'
  /** India */
  | 'IN'
  /** British Indian Ocean Territory */
  | 'IO'
  /** Iraq */
  | 'IQ'
  /** Iran */
  | 'IR'
  /** Iceland */
  | 'IS'
  /** Italy */
  | 'IT'
  /** Jersey */
  | 'JE'
  /** Jamaica */
  | 'JM'
  /** Jordan */
  | 'JO'
  /** Japan */
  | 'JP'
  /** Kenya */
  | 'KE'
  /** Kyrgyzstan */
  | 'KG'
  /** Cambodia */
  | 'KH'
  /** Kiribati */
  | 'KI'
  /** Comoros */
  | 'KM'
  /** St. Kitts & Nevis */
  | 'KN'
  /** North Korea */
  | 'KP'
  /** South Korea */
  | 'KR'
  /** Kuwait */
  | 'KW'
  /** Cayman Islands */
  | 'KY'
  /** Kazakhstan */
  | 'KZ'
  /** Laos */
  | 'LA'
  /** Lebanon */
  | 'LB'
  /** St. Lucia */
  | 'LC'
  /** Liechtenstein */
  | 'LI'
  /** Sri Lanka */
  | 'LK'
  /** Liberia */
  | 'LR'
  /** Lesotho */
  | 'LS'
  /** Lithuania */
  | 'LT'
  /** Luxembourg */
  | 'LU'
  /** Latvia */
  | 'LV'
  /** Libya */
  | 'LY'
  /** Morocco */
  | 'MA'
  /** Monaco */
  | 'MC'
  /** Moldova */
  | 'MD'
  /** Montenegro */
  | 'ME'
  /** St. Martin */
  | 'MF'
  /** Madagascar */
  | 'MG'
  /** Marshall Islands */
  | 'MH'
  /** Macedonia */
  | 'MK'
  /** Mali */
  | 'ML'
  /** Myanmar (Burma) */
  | 'MM'
  /** Mongolia */
  | 'MN'
  /** Macau SAR China */
  | 'MO'
  /** Northern Mariana Islands */
  | 'MP'
  /** Martinique */
  | 'MQ'
  /** Mauritania */
  | 'MR'
  /** Montserrat */
  | 'MS'
  /** Malta */
  | 'MT'
  /** Mauritius */
  | 'MU'
  /** Maldives */
  | 'MV'
  /** Malawi */
  | 'MW'
  /** Mexico */
  | 'MX'
  /** Malaysia */
  | 'MY'
  /** Mozambique */
  | 'MZ'
  /** Namibia */
  | 'NA'
  /** New Caledonia */
  | 'NC'
  /** Niger */
  | 'NE'
  /** Norfolk Island */
  | 'NF'
  /** Nigeria */
  | 'NG'
  /** Nicaragua */
  | 'NI'
  /** Netherlands */
  | 'NL'
  /** Norway */
  | 'NO'
  /** Nepal */
  | 'NP'
  /** Nauru */
  | 'NR'
  /** Niue */
  | 'NU'
  /** New Zealand */
  | 'NZ'
  /** Oman */
  | 'OM'
  /** Panama */
  | 'PA'
  /** Peru */
  | 'PE'
  /** French Polynesia */
  | 'PF'
  /** Papua New Guinea */
  | 'PG'
  /** Philippines */
  | 'PH'
  /** Pakistan */
  | 'PK'
  /** Poland */
  | 'PL'
  /** St. Pierre & Miquelon */
  | 'PM'
  /** Pitcairn Islands */
  | 'PN'
  /** Palestinian Territories */
  | 'PS'
  /** Portugal */
  | 'PT'
  /** Palau */
  | 'PW'
  /** Paraguay */
  | 'PY'
  /** Qatar */
  | 'QA'
  /** Réunion */
  | 'RE'
  /** Romania */
  | 'RO'
  /** Serbia */
  | 'RS'
  /** Russia */
  | 'RU'
  /** Rwanda */
  | 'RW'
  /** Saudi Arabia */
  | 'SA'
  /** Solomon Islands */
  | 'SB'
  /** Seychelles */
  | 'SC'
  /** Sudan */
  | 'SD'
  /** Sweden */
  | 'SE'
  /** Singapore */
  | 'SG'
  /** St. Helena */
  | 'SH'
  /** Slovenia */
  | 'SI'
  /** Svalbard & Jan Mayen */
  | 'SJ'
  /** Slovakia */
  | 'SK'
  /** Sierra Leone */
  | 'SL'
  /** San Marino */
  | 'SM'
  /** Senegal */
  | 'SN'
  /** Somalia */
  | 'SO'
  /** Suriname */
  | 'SR'
  /** São Tomé & Príncipe */
  | 'ST'
  /** El Salvador */
  | 'SV'
  /** Syria */
  | 'SY'
  /** Eswatini */
  | 'SZ'
  /** Turks & Caicos Islands */
  | 'TC'
  /** Chad */
  | 'TD'
  /** French Southern Territories */
  | 'TF'
  /** Togo */
  | 'TG'
  /** Thailand */
  | 'TH'
  /** Tajikistan */
  | 'TJ'
  /** Tokelau */
  | 'TK'
  /** Timor-Leste */
  | 'TL'
  /** Turkmenistan */
  | 'TM'
  /** Tunisia */
  | 'TN'
  /** Tonga */
  | 'TO'
  /** Turkey */
  | 'TR'
  /** Trinidad & Tobago */
  | 'TT'
  /** Tuvalu */
  | 'TV'
  /** Taiwan */
  | 'TW'
  /** Tanzania */
  | 'TZ'
  /** Ukraine */
  | 'UA'
  /** Uganda */
  | 'UG'
  /** U.S. Outlying Islands */
  | 'UM'
  /** United States */
  | 'US'
  /** Uruguay */
  | 'UY'
  /** Uzbekistan */
  | 'UZ'
  /** Vatican City */
  | 'VA'
  /** St. Vincent & Grenadines */
  | 'VC'
  /** Venezuela */
  | 'VE'
  /** British Virgin Islands */
  | 'VG'
  /** U.S. Virgin Islands */
  | 'VI'
  /** Vietnam */
  | 'VN'
  /** Vanuatu */
  | 'VU'
  /** Wallis & Futuna */
  | 'WF'
  /** Samoa */
  | 'WS'
  /** Yemen */
  | 'YE'
  /** Mayotte */
  | 'YT'
  /** South Africa */
  | 'ZA'
  /** Zambia */
  | 'ZM'
  /** Zimbabwe */
  | 'ZW';

/** The list of available currency codes. */
export type CurrencyEnum =
  | 'AED'
  | 'AFN'
  | 'ALL'
  | 'AMD'
  | 'ANG'
  | 'AOA'
  | 'ARS'
  | 'AUD'
  | 'AWG'
  | 'AZM'
  | 'AZN'
  | 'BAM'
  | 'BBD'
  | 'BDT'
  | 'BGN'
  | 'BHD'
  | 'BIF'
  | 'BMD'
  | 'BND'
  | 'BOB'
  | 'BRL'
  | 'BSD'
  | 'BTN'
  | 'BUK'
  | 'BWP'
  | 'BYN'
  | 'BZD'
  | 'CAD'
  | 'CDF'
  | 'CHE'
  | 'CHF'
  | 'CHW'
  | 'CLP'
  | 'CNY'
  | 'COP'
  | 'CRC'
  | 'CUP'
  | 'CVE'
  | 'CZK'
  | 'DJF'
  | 'DKK'
  | 'DOP'
  | 'DZD'
  | 'EEK'
  | 'EGP'
  | 'ERN'
  | 'ETB'
  | 'EUR'
  | 'FJD'
  | 'FKP'
  | 'GBP'
  | 'GEK'
  | 'GEL'
  | 'GHS'
  | 'GIP'
  | 'GMD'
  | 'GNF'
  | 'GQE'
  | 'GTQ'
  | 'GYD'
  | 'HKD'
  | 'HNL'
  | 'HRK'
  | 'HTG'
  | 'HUF'
  | 'IDR'
  | 'ILS'
  | 'INR'
  | 'IQD'
  | 'IRR'
  | 'ISK'
  | 'JMD'
  | 'JOD'
  | 'JPY'
  | 'KES'
  | 'KGS'
  | 'KHR'
  | 'KMF'
  | 'KPW'
  | 'KRW'
  | 'KWD'
  | 'KYD'
  | 'KZT'
  | 'LAK'
  | 'LBP'
  | 'LKR'
  | 'LRD'
  | 'LSL'
  | 'LSM'
  | 'LTL'
  | 'LVL'
  | 'LYD'
  | 'MAD'
  | 'MDL'
  | 'MGA'
  | 'MKD'
  | 'MMK'
  | 'MNT'
  | 'MOP'
  | 'MRO'
  | 'MUR'
  | 'MVR'
  | 'MWK'
  | 'MXN'
  | 'MYR'
  | 'MZN'
  | 'NAD'
  | 'NGN'
  | 'NIC'
  | 'NOK'
  | 'NPR'
  | 'NZD'
  | 'OMR'
  | 'PAB'
  | 'PEN'
  | 'PGK'
  | 'PHP'
  | 'PKR'
  | 'PLN'
  | 'PYG'
  | 'QAR'
  | 'RHD'
  | 'ROL'
  | 'RON'
  | 'RSD'
  | 'RUB'
  | 'RWF'
  | 'SAR'
  | 'SBD'
  | 'SCR'
  | 'SDG'
  | 'SEK'
  | 'SGD'
  | 'SHP'
  | 'SKK'
  | 'SLL'
  | 'SOS'
  | 'SRD'
  | 'STD'
  | 'SVC'
  | 'SYP'
  | 'SZL'
  | 'THB'
  | 'TJS'
  | 'TMM'
  | 'TND'
  | 'TOP'
  | 'TRL'
  | 'TRY'
  | 'TTD'
  | 'TWD'
  | 'TZS'
  | 'UAH'
  | 'UGX'
  | 'USD'
  | 'UYU'
  | 'UZS'
  | 'VEB'
  | 'VEF'
  | 'VND'
  | 'VUV'
  | 'WST'
  | 'XCD'
  | 'XOF'
  | 'XPF'
  | 'YER'
  | 'YTL'
  | 'ZAR'
  | 'ZMK'
  | 'ZWD';

/** Identifies the filter to use for filtering orders. */
export type CustomerOrdersFilterInput = {
  /** Filters by order base grand total value. */
  grand_total?: FilterRangeTypeInput | null | undefined;
  /** Filters by order number. */
  number?: FilterStringTypeInput | null | undefined;
  /** Filters by order created_at time. */
  order_date?: FilterRangeTypeInput | null | undefined;
  /** Filters by order status. */
  status?: FilterEqualTypeInput | null | undefined;
};

/** Defines a customizable option. */
export type CustomizableOptionInput = {
  /** The customizable option ID of the product. */
  id?: number | null | undefined;
  /** The unique ID for a `CartItemInterface` object. */
  uid?: string | number | null | undefined;
  /** The string value of the option. */
  value_string: string;
};

/** Defines a single downloadable product. */
export type DownloadableProductCartItemInput = {
  /** The ID and value of the option. */
  customizable_options?: Array<CustomizableOptionInput | null | undefined> | null | undefined;
  /** The quantity and SKU of the downloadable product. */
  data: CartItemInput;
  /** An array of objects containing the link_id of the downloadable product link. */
  downloadable_product_links?: Array<DownloadableProductLinksInput | null | undefined> | null | undefined;
};

/** Contains the link ID for the downloadable product. */
export type DownloadableProductLinksInput = {
  /** The unique ID of the downloadable product link. */
  link_id: number;
};

/** Defines a customer-entered option. */
export type EnteredOptionInput = {
  /** The unique ID for a `CustomizableOptionInterface` object, such as a `CustomizableFieldOption`, `CustomizableFileOption`, or `CustomizableAreaOption` object. */
  uid: string | number;
  /** Text the customer entered. */
  value: string;
};

/** Defines a filter that matches the input exactly. */
export type FilterEqualTypeInput = {
  /** Use this attribute to exactly match the specified string. For example, to filter on a specific category ID, specify a value such as `5`. */
  eq?: string | null | undefined;
  /** Use this attribute to filter on an array of values. For example, to filter on category IDs 4, 5, and 6, specify a value of `["4", "5", "6"]`. */
  in?: Array<string | null | undefined> | null | undefined;
};

/** Defines a filter that matches a range of values, such as prices or dates. */
export type FilterRangeTypeInput = {
  /** Use this attribute to specify the lowest possible value in the range. */
  from?: string | null | undefined;
  /** Use this attribute to specify the highest possible value in the range. */
  to?: string | null | undefined;
};

/** Defines a filter for an input string. */
export type FilterStringTypeInput = {
  /** Filters items that are exactly the same as the specified string. */
  eq?: string | null | undefined;
  /** Filters items that are exactly the same as entries specified in an array of strings. */
  in?: Array<string | null | undefined> | null | undefined;
  /** Defines a filter that performs a fuzzy search using the specified string. */
  match?: string | null | undefined;
};

/** This enumeration states whether a product stock status is in stock or out of stock */
export type ProductStockStatus =
  | 'IN_STOCK'
  | 'OUT_OF_STOCK';

/** Defines a single product to add to the cart. */
export type SimpleProductCartItemInput = {
  /** An array that defines customizable options for the product. */
  customizable_options?: Array<CustomizableOptionInput | null | undefined> | null | undefined;
  /** An object containing the `sku`, `quantity`, and other relevant information about the product. */
  data: CartItemInput;
};

/** This enumeration defines the entity type. */
export type UrlRewriteEntityTypeEnum =
  | 'CATEGORY'
  | 'CMS_PAGE'
  | 'PRODUCT';

/** Defines a single product to add to the cart. */
export type VirtualProductCartItemInput = {
  /** An array that defines customizable options for the product. */
  customizable_options?: Array<CustomizableOptionInput | null | undefined> | null | undefined;
  /** An object containing the `sku`, `quantity`, and other relevant information about the product. */
  data: CartItemInput;
};

export type AddDownloadableProductsToCartMutationVariables = Exact<{
  input?: AddDownloadableProductsToCartInput | null | undefined;
}>;


export type AddDownloadableProductsToCartMutation = { addDownloadableProductsToCart: { cart: { id: string, email: string | null, is_virtual: boolean, total_quantity: number, applied_coupons: Array<{ code: string } | null> | null, prices: { subtotal_with_discount_excluding_tax: { value: number | null, currency: CurrencyEnum | null } | null, subtotal_excluding_tax: { value: number | null, currency: CurrencyEnum | null } | null, subtotal_including_tax: { value: number | null, currency: CurrencyEnum | null } | null, applied_taxes: Array<{ label: string, amount: { value: number | null, currency: CurrencyEnum | null } } | null> | null, discounts: Array<{ label: string, amount: { value: number | null, currency: CurrencyEnum | null } } | null> | null, grand_total: { value: number | null, currency: CurrencyEnum | null } | null } | null, items: Array<
        | { id: string, quantity: number, bundle_options: Array<{ id: number, label: string, type: string, values: Array<{ id: number, label: string, price: number, quantity: number } | null> } | null>, product:
            | { __typename: 'BundleProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'ConfigurableProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'DownloadableProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'GroupedProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'SimpleProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'VirtualProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
          , prices: { row_total: { value: number | null, currency: CurrencyEnum | null }, row_total_including_tax: { value: number | null, currency: CurrencyEnum | null }, total_item_discount: { value: number | null, currency: CurrencyEnum | null } | null } | null }
        | { id: string, quantity: number, configurable_options: Array<{ configurable_product_option_uid: string, option_label: string, configurable_product_option_value_uid: string, value_label: string } | null>, configured_variant:
            | { sku: string | null, name: string | null, only_x_left_in_stock: number | null, price_range: { minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, thumbnail: { url: string | null } | null }
            | { sku: string | null, name: string | null, only_x_left_in_stock: number | null, price_range: { minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, thumbnail: { url: string | null } | null }
            | { sku: string | null, name: string | null, only_x_left_in_stock: number | null, price_range: { minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, thumbnail: { url: string | null } | null }
            | { sku: string | null, name: string | null, only_x_left_in_stock: number | null, price_range: { minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, thumbnail: { url: string | null } | null }
            | { sku: string | null, name: string | null, only_x_left_in_stock: number | null, price_range: { minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, thumbnail: { url: string | null } | null }
            | { sku: string | null, name: string | null, only_x_left_in_stock: number | null, price_range: { minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, thumbnail: { url: string | null } | null }
          , product:
            | { __typename: 'BundleProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'ConfigurableProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'DownloadableProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'GroupedProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'SimpleProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'VirtualProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
          , prices: { row_total: { value: number | null, currency: CurrencyEnum | null }, row_total_including_tax: { value: number | null, currency: CurrencyEnum | null }, total_item_discount: { value: number | null, currency: CurrencyEnum | null } | null } | null }
        | { id: string, quantity: number, product:
            | { __typename: 'BundleProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'ConfigurableProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'DownloadableProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'GroupedProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'SimpleProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'VirtualProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
          , prices: { row_total: { value: number | null, currency: CurrencyEnum | null }, row_total_including_tax: { value: number | null, currency: CurrencyEnum | null }, total_item_discount: { value: number | null, currency: CurrencyEnum | null } | null } | null }
        | { id: string, quantity: number, product:
            | { __typename: 'BundleProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'ConfigurableProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'DownloadableProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'GroupedProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'SimpleProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'VirtualProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
          , prices: { row_total: { value: number | null, currency: CurrencyEnum | null }, row_total_including_tax: { value: number | null, currency: CurrencyEnum | null }, total_item_discount: { value: number | null, currency: CurrencyEnum | null } | null } | null }
        | { id: string, quantity: number, product:
            | { __typename: 'BundleProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'ConfigurableProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'DownloadableProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'GroupedProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'SimpleProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'VirtualProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
          , prices: { row_total: { value: number | null, currency: CurrencyEnum | null }, row_total_including_tax: { value: number | null, currency: CurrencyEnum | null }, total_item_discount: { value: number | null, currency: CurrencyEnum | null } | null } | null }
       | null> | null, shipping_addresses: Array<{ firstname: string, lastname: string, street: Array<string | null>, city: string, company: string | null, postcode: string | null, telephone: string | null, region: { code: string | null, region_id: number | null, label: string | null } | null, country: { code: string, label: string }, selected_shipping_method: { carrier_code: string, carrier_title: string, method_code: string, method_title: string, amount: { value: number | null, currency: CurrencyEnum | null } } | null } | null>, billing_address: { firstname: string, lastname: string, street: Array<string | null>, city: string, company: string | null, postcode: string | null, telephone: string | null, region: { code: string | null, region_id: number | null, label: string | null } | null, country: { code: string, label: string } } | null } } | null };

export type AddSimpleProductsToCartMutationVariables = Exact<{
  input?: AddSimpleProductsToCartInput | null | undefined;
}>;


export type AddSimpleProductsToCartMutation = { addSimpleProductsToCart: { cart: { id: string, email: string | null, is_virtual: boolean, total_quantity: number, applied_coupons: Array<{ code: string } | null> | null, prices: { subtotal_with_discount_excluding_tax: { value: number | null, currency: CurrencyEnum | null } | null, subtotal_excluding_tax: { value: number | null, currency: CurrencyEnum | null } | null, subtotal_including_tax: { value: number | null, currency: CurrencyEnum | null } | null, applied_taxes: Array<{ label: string, amount: { value: number | null, currency: CurrencyEnum | null } } | null> | null, discounts: Array<{ label: string, amount: { value: number | null, currency: CurrencyEnum | null } } | null> | null, grand_total: { value: number | null, currency: CurrencyEnum | null } | null } | null, items: Array<
        | { id: string, quantity: number, bundle_options: Array<{ id: number, label: string, type: string, values: Array<{ id: number, label: string, price: number, quantity: number } | null> } | null>, product:
            | { __typename: 'BundleProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'ConfigurableProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'DownloadableProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'GroupedProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'SimpleProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'VirtualProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
          , prices: { row_total: { value: number | null, currency: CurrencyEnum | null }, row_total_including_tax: { value: number | null, currency: CurrencyEnum | null }, total_item_discount: { value: number | null, currency: CurrencyEnum | null } | null } | null }
        | { id: string, quantity: number, configurable_options: Array<{ configurable_product_option_uid: string, option_label: string, configurable_product_option_value_uid: string, value_label: string } | null>, configured_variant:
            | { sku: string | null, name: string | null, only_x_left_in_stock: number | null, price_range: { minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, thumbnail: { url: string | null } | null }
            | { sku: string | null, name: string | null, only_x_left_in_stock: number | null, price_range: { minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, thumbnail: { url: string | null } | null }
            | { sku: string | null, name: string | null, only_x_left_in_stock: number | null, price_range: { minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, thumbnail: { url: string | null } | null }
            | { sku: string | null, name: string | null, only_x_left_in_stock: number | null, price_range: { minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, thumbnail: { url: string | null } | null }
            | { sku: string | null, name: string | null, only_x_left_in_stock: number | null, price_range: { minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, thumbnail: { url: string | null } | null }
            | { sku: string | null, name: string | null, only_x_left_in_stock: number | null, price_range: { minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, thumbnail: { url: string | null } | null }
          , product:
            | { __typename: 'BundleProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'ConfigurableProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'DownloadableProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'GroupedProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'SimpleProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'VirtualProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
          , prices: { row_total: { value: number | null, currency: CurrencyEnum | null }, row_total_including_tax: { value: number | null, currency: CurrencyEnum | null }, total_item_discount: { value: number | null, currency: CurrencyEnum | null } | null } | null }
        | { id: string, quantity: number, product:
            | { __typename: 'BundleProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'ConfigurableProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'DownloadableProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'GroupedProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'SimpleProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'VirtualProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
          , prices: { row_total: { value: number | null, currency: CurrencyEnum | null }, row_total_including_tax: { value: number | null, currency: CurrencyEnum | null }, total_item_discount: { value: number | null, currency: CurrencyEnum | null } | null } | null }
        | { id: string, quantity: number, product:
            | { __typename: 'BundleProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'ConfigurableProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'DownloadableProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'GroupedProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'SimpleProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'VirtualProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
          , prices: { row_total: { value: number | null, currency: CurrencyEnum | null }, row_total_including_tax: { value: number | null, currency: CurrencyEnum | null }, total_item_discount: { value: number | null, currency: CurrencyEnum | null } | null } | null }
        | { id: string, quantity: number, product:
            | { __typename: 'BundleProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'ConfigurableProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'DownloadableProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'GroupedProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'SimpleProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'VirtualProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
          , prices: { row_total: { value: number | null, currency: CurrencyEnum | null }, row_total_including_tax: { value: number | null, currency: CurrencyEnum | null }, total_item_discount: { value: number | null, currency: CurrencyEnum | null } | null } | null }
       | null> | null, shipping_addresses: Array<{ firstname: string, lastname: string, street: Array<string | null>, city: string, company: string | null, postcode: string | null, telephone: string | null, region: { code: string | null, region_id: number | null, label: string | null } | null, country: { code: string, label: string }, selected_shipping_method: { carrier_code: string, carrier_title: string, method_code: string, method_title: string, amount: { value: number | null, currency: CurrencyEnum | null } } | null } | null>, billing_address: { firstname: string, lastname: string, street: Array<string | null>, city: string, company: string | null, postcode: string | null, telephone: string | null, region: { code: string | null, region_id: number | null, label: string | null } | null, country: { code: string, label: string } } | null } } | null };

export type AddVirtualProductsToCartMutationVariables = Exact<{
  input?: AddVirtualProductsToCartInput | null | undefined;
}>;


export type AddVirtualProductsToCartMutation = { addVirtualProductsToCart: { cart: { id: string, email: string | null, is_virtual: boolean, total_quantity: number, applied_coupons: Array<{ code: string } | null> | null, prices: { subtotal_with_discount_excluding_tax: { value: number | null, currency: CurrencyEnum | null } | null, subtotal_excluding_tax: { value: number | null, currency: CurrencyEnum | null } | null, subtotal_including_tax: { value: number | null, currency: CurrencyEnum | null } | null, applied_taxes: Array<{ label: string, amount: { value: number | null, currency: CurrencyEnum | null } } | null> | null, discounts: Array<{ label: string, amount: { value: number | null, currency: CurrencyEnum | null } } | null> | null, grand_total: { value: number | null, currency: CurrencyEnum | null } | null } | null, items: Array<
        | { id: string, quantity: number, bundle_options: Array<{ id: number, label: string, type: string, values: Array<{ id: number, label: string, price: number, quantity: number } | null> } | null>, product:
            | { __typename: 'BundleProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'ConfigurableProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'DownloadableProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'GroupedProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'SimpleProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'VirtualProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
          , prices: { row_total: { value: number | null, currency: CurrencyEnum | null }, row_total_including_tax: { value: number | null, currency: CurrencyEnum | null }, total_item_discount: { value: number | null, currency: CurrencyEnum | null } | null } | null }
        | { id: string, quantity: number, configurable_options: Array<{ configurable_product_option_uid: string, option_label: string, configurable_product_option_value_uid: string, value_label: string } | null>, configured_variant:
            | { sku: string | null, name: string | null, only_x_left_in_stock: number | null, price_range: { minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, thumbnail: { url: string | null } | null }
            | { sku: string | null, name: string | null, only_x_left_in_stock: number | null, price_range: { minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, thumbnail: { url: string | null } | null }
            | { sku: string | null, name: string | null, only_x_left_in_stock: number | null, price_range: { minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, thumbnail: { url: string | null } | null }
            | { sku: string | null, name: string | null, only_x_left_in_stock: number | null, price_range: { minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, thumbnail: { url: string | null } | null }
            | { sku: string | null, name: string | null, only_x_left_in_stock: number | null, price_range: { minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, thumbnail: { url: string | null } | null }
            | { sku: string | null, name: string | null, only_x_left_in_stock: number | null, price_range: { minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, thumbnail: { url: string | null } | null }
          , product:
            | { __typename: 'BundleProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'ConfigurableProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'DownloadableProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'GroupedProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'SimpleProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'VirtualProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
          , prices: { row_total: { value: number | null, currency: CurrencyEnum | null }, row_total_including_tax: { value: number | null, currency: CurrencyEnum | null }, total_item_discount: { value: number | null, currency: CurrencyEnum | null } | null } | null }
        | { id: string, quantity: number, product:
            | { __typename: 'BundleProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'ConfigurableProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'DownloadableProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'GroupedProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'SimpleProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'VirtualProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
          , prices: { row_total: { value: number | null, currency: CurrencyEnum | null }, row_total_including_tax: { value: number | null, currency: CurrencyEnum | null }, total_item_discount: { value: number | null, currency: CurrencyEnum | null } | null } | null }
        | { id: string, quantity: number, product:
            | { __typename: 'BundleProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'ConfigurableProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'DownloadableProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'GroupedProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'SimpleProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'VirtualProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
          , prices: { row_total: { value: number | null, currency: CurrencyEnum | null }, row_total_including_tax: { value: number | null, currency: CurrencyEnum | null }, total_item_discount: { value: number | null, currency: CurrencyEnum | null } | null } | null }
        | { id: string, quantity: number, product:
            | { __typename: 'BundleProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'ConfigurableProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'DownloadableProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'GroupedProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'SimpleProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
            | { __typename: 'VirtualProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, url_key: string | null, include_in_menu: number | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
          , prices: { row_total: { value: number | null, currency: CurrencyEnum | null }, row_total_including_tax: { value: number | null, currency: CurrencyEnum | null }, total_item_discount: { value: number | null, currency: CurrencyEnum | null } | null } | null }
       | null> | null, shipping_addresses: Array<{ firstname: string, lastname: string, street: Array<string | null>, city: string, company: string | null, postcode: string | null, telephone: string | null, region: { code: string | null, region_id: number | null, label: string | null } | null, country: { code: string, label: string }, selected_shipping_method: { carrier_code: string, carrier_title: string, method_code: string, method_title: string, amount: { value: number | null, currency: CurrencyEnum | null } } | null } | null>, billing_address: { firstname: string, lastname: string, street: Array<string | null>, city: string, company: string | null, postcode: string | null, telephone: string | null, region: { code: string | null, region_id: number | null, label: string | null } | null, country: { code: string, label: string } } | null } } | null };

export type CountryInformationQueryVariables = Exact<{
  id?: string | null | undefined;
}>;


export type CountryInformationQuery = { country: { id: string | null, two_letter_abbreviation: string | null, full_name_locale: string | null, full_name_english: string | null, available_regions: Array<{ id: number | null, code: string | null, name: string | null } | null> | null } | null };

export type CustomerOrdersQueryVariables = Exact<{
  currentPage?: number | null | undefined;
  filter?: CustomerOrdersFilterInput | null | undefined;
  pageSize?: number | null | undefined;
}>;


export type CustomerOrdersQuery = { customer: { orders: { total_count: number | null, items: Array<{ number: string, id: string, order_date: string, status: string, shipping_method: string | null, total: { discounts: Array<{ label: string, amount: { currency: CurrencyEnum | null, value: number | null } } | null> | null, grand_total: { currency: CurrencyEnum | null, value: number | null }, base_grand_total: { currency: CurrencyEnum | null, value: number | null }, shipping_handling: { amount_excluding_tax: { currency: CurrencyEnum | null, value: number | null } | null, amount_including_tax: { currency: CurrencyEnum | null, value: number | null } | null, discounts: Array<{ amount: { currency: CurrencyEnum | null, value: number | null } } | null> | null, taxes: Array<{ rate: number, title: string, amount: { currency: CurrencyEnum | null, value: number | null } } | null> | null, total_amount: { currency: CurrencyEnum | null, value: number | null } } | null, subtotal: { currency: CurrencyEnum | null, value: number | null }, taxes: Array<{ rate: number, title: string, amount: { currency: CurrencyEnum | null, value: number | null } } | null> | null, total_shipping: { currency: CurrencyEnum | null, value: number | null }, total_tax: { currency: CurrencyEnum | null, value: number | null } } | null, comments: Array<{ message: string, timestamp: string } | null> | null, invoices: Array<{ id: string, number: string, comments: Array<{ message: string, timestamp: string } | null> | null, items: Array<
            | { id: string, product_name: string | null, product_sku: string, quantity_invoiced: number | null, discounts: Array<{ label: string, amount: { currency: CurrencyEnum | null, value: number | null } } | null> | null, product_sale_price: { currency: CurrencyEnum | null, value: number | null } }
            | { id: string, product_name: string | null, product_sku: string, quantity_invoiced: number | null, discounts: Array<{ label: string, amount: { currency: CurrencyEnum | null, value: number | null } } | null> | null, product_sale_price: { currency: CurrencyEnum | null, value: number | null } }
            | { id: string, product_name: string | null, product_sku: string, quantity_invoiced: number | null, discounts: Array<{ label: string, amount: { currency: CurrencyEnum | null, value: number | null } } | null> | null, product_sale_price: { currency: CurrencyEnum | null, value: number | null } }
           | null> | null, total: { discounts: Array<{ label: string, amount: { currency: CurrencyEnum | null, value: number | null } } | null> | null, base_grand_total: { currency: CurrencyEnum | null, value: number | null }, shipping_handling: { amount_excluding_tax: { currency: CurrencyEnum | null, value: number | null } | null, amount_including_tax: { currency: CurrencyEnum | null, value: number | null } | null, discounts: Array<{ amount: { currency: CurrencyEnum | null, value: number | null } } | null> | null, taxes: Array<{ rate: number, title: string, amount: { currency: CurrencyEnum | null, value: number | null } } | null> | null, total_amount: { currency: CurrencyEnum | null, value: number | null } } | null, subtotal: { currency: CurrencyEnum | null, value: number | null }, taxes: Array<{ rate: number, title: string, amount: { currency: CurrencyEnum | null, value: number | null } } | null> | null, total_shipping: { currency: CurrencyEnum | null, value: number | null }, total_tax: { currency: CurrencyEnum | null, value: number | null } } | null } | null>, items: Array<
          | { id: string, product_name: string | null, product_sku: string, product_type: string | null, product_url_key: string | null, quantity_canceled: number | null, quantity_invoiced: number | null, quantity_ordered: number | null, quantity_refunded: number | null, quantity_returned: number | null, quantity_shipped: number | null, status: string | null, discounts: Array<{ label: string, amount: { currency: CurrencyEnum | null, value: number | null } } | null> | null, entered_options: Array<{ label: string, value: string } | null> | null, product_sale_price: { currency: CurrencyEnum | null, value: number | null }, selected_options: Array<{ label: string, value: string } | null> | null }
          | { id: string, product_name: string | null, product_sku: string, product_type: string | null, product_url_key: string | null, quantity_canceled: number | null, quantity_invoiced: number | null, quantity_ordered: number | null, quantity_refunded: number | null, quantity_returned: number | null, quantity_shipped: number | null, status: string | null, discounts: Array<{ label: string, amount: { currency: CurrencyEnum | null, value: number | null } } | null> | null, entered_options: Array<{ label: string, value: string } | null> | null, product_sale_price: { currency: CurrencyEnum | null, value: number | null }, selected_options: Array<{ label: string, value: string } | null> | null }
          | { id: string, product_name: string | null, product_sku: string, product_type: string | null, product_url_key: string | null, quantity_canceled: number | null, quantity_invoiced: number | null, quantity_ordered: number | null, quantity_refunded: number | null, quantity_returned: number | null, quantity_shipped: number | null, status: string | null, discounts: Array<{ label: string, amount: { currency: CurrencyEnum | null, value: number | null } } | null> | null, entered_options: Array<{ label: string, value: string } | null> | null, product_sale_price: { currency: CurrencyEnum | null, value: number | null }, selected_options: Array<{ label: string, value: string } | null> | null }
          | { id: string, product_name: string | null, product_sku: string, product_type: string | null, product_url_key: string | null, quantity_canceled: number | null, quantity_invoiced: number | null, quantity_ordered: number | null, quantity_refunded: number | null, quantity_returned: number | null, quantity_shipped: number | null, status: string | null, discounts: Array<{ label: string, amount: { currency: CurrencyEnum | null, value: number | null } } | null> | null, entered_options: Array<{ label: string, value: string } | null> | null, product_sale_price: { currency: CurrencyEnum | null, value: number | null }, selected_options: Array<{ label: string, value: string } | null> | null }
         | null> | null, payment_methods: Array<{ name: string, type: string, additional_data: Array<{ name: string | null, value: string | null } | null> | null } | null> | null, shipments: Array<{ id: string, number: string, comments: Array<{ message: string, timestamp: string } | null> | null, tracking: Array<{ carrier: string, number: string | null, title: string } | null> | null, items: Array<
            | { id: string, product_name: string | null, product_sku: string, quantity_shipped: number, product_sale_price: { currency: CurrencyEnum | null, value: number | null } }
            | { id: string, product_name: string | null, product_sku: string, quantity_shipped: number, product_sale_price: { currency: CurrencyEnum | null, value: number | null } }
           | null> | null } | null> | null, shipping_address: { city: string, country_code: CountryCodeEnum | null, firstname: string, lastname: string, postcode: string | null, prefix: string | null, region: string | null, street: Array<string | null>, suffix: string | null, telephone: string | null } | null, billing_address: { city: string, country_code: CountryCodeEnum | null, firstname: string, lastname: string, postcode: string | null, prefix: string | null, region: string | null, street: Array<string | null>, suffix: string | null, telephone: string | null } | null } | null>, page_info: { current_page: number | null, total_pages: number | null, page_size: number | null } | null } | null } | null };

export type UrlResolverQueryVariables = Exact<{
  url: string;
}>;


export type UrlResolverQuery = { urlResolver: { id: number | null, redirectCode: number | null, relative_url: string | null, type: UrlRewriteEntityTypeEnum | null, entity_uid: string | null } | null };

export type WishlistQueryVariables = Exact<{
  currentPage?: number | null | undefined;
  pageSize?: number | null | undefined;
}>;


export type WishlistQuery = { customer: { wishlists: Array<{ id: string | null, items_count: number | null, sharing_code: string | null, items_v2: { items: Array<
          | { id: string, quantity: number, description: string | null, added_at: string, product:
              | { __typename: 'BundleProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, items: Array<{ sku: string | null, title: string | null, options: Array<{ id: number | null, quantity: number | null, product:
                      | { id: number | null, sku: string | null, name: string | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } } }
                      | { id: number | null, sku: string | null, name: string | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } } }
                      | { id: number | null, sku: string | null, name: string | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } } }
                      | { id: number | null, sku: string | null, name: string | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } } }
                      | { id: number | null, sku: string | null, name: string | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } } }
                      | { id: number | null, sku: string | null, name: string | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } } }
                     | null } | null> | null } | null> | null, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
              | { __typename: 'ConfigurableProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, configurable_options: Array<{ attribute_code: string | null, attribute_uid: string, label: string | null, position: number | null, id: number | null, use_default: boolean | null, values: Array<{ label: string | null, uid: string | null, swatch_data:
                      | { value: string | null }
                      | { value: string | null }
                      | { value: string | null }
                     | null } | null> | null } | null> | null, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
              | { __typename: 'DownloadableProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
              | { __typename: 'GroupedProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, items: Array<{ product:
                    | { sku: string | null }
                    | { sku: string | null }
                    | { sku: string | null }
                    | { sku: string | null }
                    | { sku: string | null }
                    | { sku: string | null }
                   | null } | null> | null, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
              | { __typename: 'SimpleProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
              | { __typename: 'VirtualProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
             | null }
          | { id: string, quantity: number, description: string | null, added_at: string, product:
              | { __typename: 'BundleProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, items: Array<{ sku: string | null, title: string | null, options: Array<{ id: number | null, quantity: number | null, product:
                      | { id: number | null, sku: string | null, name: string | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } } }
                      | { id: number | null, sku: string | null, name: string | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } } }
                      | { id: number | null, sku: string | null, name: string | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } } }
                      | { id: number | null, sku: string | null, name: string | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } } }
                      | { id: number | null, sku: string | null, name: string | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } } }
                      | { id: number | null, sku: string | null, name: string | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } } }
                     | null } | null> | null } | null> | null, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
              | { __typename: 'ConfigurableProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, configurable_options: Array<{ attribute_code: string | null, attribute_uid: string, label: string | null, position: number | null, id: number | null, use_default: boolean | null, values: Array<{ label: string | null, uid: string | null, swatch_data:
                      | { value: string | null }
                      | { value: string | null }
                      | { value: string | null }
                     | null } | null> | null } | null> | null, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
              | { __typename: 'DownloadableProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
              | { __typename: 'GroupedProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, items: Array<{ product:
                    | { sku: string | null }
                    | { sku: string | null }
                    | { sku: string | null }
                    | { sku: string | null }
                    | { sku: string | null }
                    | { sku: string | null }
                   | null } | null> | null, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
              | { __typename: 'SimpleProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
              | { __typename: 'VirtualProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
             | null }
          | { id: string, quantity: number, description: string | null, added_at: string, product:
              | { __typename: 'BundleProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, items: Array<{ sku: string | null, title: string | null, options: Array<{ id: number | null, quantity: number | null, product:
                      | { id: number | null, sku: string | null, name: string | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } } }
                      | { id: number | null, sku: string | null, name: string | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } } }
                      | { id: number | null, sku: string | null, name: string | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } } }
                      | { id: number | null, sku: string | null, name: string | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } } }
                      | { id: number | null, sku: string | null, name: string | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } } }
                      | { id: number | null, sku: string | null, name: string | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } } }
                     | null } | null> | null } | null> | null, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
              | { __typename: 'ConfigurableProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, configurable_options: Array<{ attribute_code: string | null, attribute_uid: string, label: string | null, position: number | null, id: number | null, use_default: boolean | null, values: Array<{ label: string | null, uid: string | null, swatch_data:
                      | { value: string | null }
                      | { value: string | null }
                      | { value: string | null }
                     | null } | null> | null } | null> | null, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
              | { __typename: 'DownloadableProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
              | { __typename: 'GroupedProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, items: Array<{ product:
                    | { sku: string | null }
                    | { sku: string | null }
                    | { sku: string | null }
                    | { sku: string | null }
                    | { sku: string | null }
                    | { sku: string | null }
                   | null } | null> | null, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
              | { __typename: 'SimpleProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
              | { __typename: 'VirtualProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
             | null }
          | { id: string, quantity: number, description: string | null, added_at: string, product:
              | { __typename: 'BundleProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, items: Array<{ sku: string | null, title: string | null, options: Array<{ id: number | null, quantity: number | null, product:
                      | { id: number | null, sku: string | null, name: string | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } } }
                      | { id: number | null, sku: string | null, name: string | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } } }
                      | { id: number | null, sku: string | null, name: string | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } } }
                      | { id: number | null, sku: string | null, name: string | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } } }
                      | { id: number | null, sku: string | null, name: string | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } } }
                      | { id: number | null, sku: string | null, name: string | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } } }
                     | null } | null> | null } | null> | null, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
              | { __typename: 'ConfigurableProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, configurable_options: Array<{ attribute_code: string | null, attribute_uid: string, label: string | null, position: number | null, id: number | null, use_default: boolean | null, values: Array<{ label: string | null, uid: string | null, swatch_data:
                      | { value: string | null }
                      | { value: string | null }
                      | { value: string | null }
                     | null } | null> | null } | null> | null, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
              | { __typename: 'DownloadableProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
              | { __typename: 'GroupedProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, items: Array<{ product:
                    | { sku: string | null }
                    | { sku: string | null }
                    | { sku: string | null }
                    | { sku: string | null }
                    | { sku: string | null }
                    | { sku: string | null }
                   | null } | null> | null, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
              | { __typename: 'SimpleProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
              | { __typename: 'VirtualProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
             | null }
          | { id: string, quantity: number, description: string | null, added_at: string, product:
              | { __typename: 'BundleProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, items: Array<{ sku: string | null, title: string | null, options: Array<{ id: number | null, quantity: number | null, product:
                      | { id: number | null, sku: string | null, name: string | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } } }
                      | { id: number | null, sku: string | null, name: string | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } } }
                      | { id: number | null, sku: string | null, name: string | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } } }
                      | { id: number | null, sku: string | null, name: string | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } } }
                      | { id: number | null, sku: string | null, name: string | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } } }
                      | { id: number | null, sku: string | null, name: string | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } } }
                     | null } | null> | null } | null> | null, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
              | { __typename: 'ConfigurableProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, configurable_options: Array<{ attribute_code: string | null, attribute_uid: string, label: string | null, position: number | null, id: number | null, use_default: boolean | null, values: Array<{ label: string | null, uid: string | null, swatch_data:
                      | { value: string | null }
                      | { value: string | null }
                      | { value: string | null }
                     | null } | null> | null } | null> | null, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
              | { __typename: 'DownloadableProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
              | { __typename: 'GroupedProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, items: Array<{ product:
                    | { sku: string | null }
                    | { sku: string | null }
                    | { sku: string | null }
                    | { sku: string | null }
                    | { sku: string | null }
                    | { sku: string | null }
                   | null } | null> | null, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
              | { __typename: 'SimpleProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
              | { __typename: 'VirtualProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
             | null }
          | { id: string, quantity: number, description: string | null, added_at: string, product:
              | { __typename: 'BundleProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, items: Array<{ sku: string | null, title: string | null, options: Array<{ id: number | null, quantity: number | null, product:
                      | { id: number | null, sku: string | null, name: string | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } } }
                      | { id: number | null, sku: string | null, name: string | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } } }
                      | { id: number | null, sku: string | null, name: string | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } } }
                      | { id: number | null, sku: string | null, name: string | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } } }
                      | { id: number | null, sku: string | null, name: string | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } } }
                      | { id: number | null, sku: string | null, name: string | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } } }
                     | null } | null> | null } | null> | null, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
              | { __typename: 'ConfigurableProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, configurable_options: Array<{ attribute_code: string | null, attribute_uid: string, label: string | null, position: number | null, id: number | null, use_default: boolean | null, values: Array<{ label: string | null, uid: string | null, swatch_data:
                      | { value: string | null }
                      | { value: string | null }
                      | { value: string | null }
                     | null } | null> | null } | null> | null, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
              | { __typename: 'DownloadableProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
              | { __typename: 'GroupedProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, items: Array<{ product:
                    | { sku: string | null }
                    | { sku: string | null }
                    | { sku: string | null }
                    | { sku: string | null }
                    | { sku: string | null }
                    | { sku: string | null }
                   | null } | null> | null, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
              | { __typename: 'SimpleProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
              | { __typename: 'VirtualProduct', id: number | null, sku: string | null, name: string | null, stock_status: ProductStockStatus | null, only_x_left_in_stock: number | null, rating_summary: number, url_key: string | null, review_count: number, categories: Array<{ id: number | null, name: string | null, url_suffix: string | null, url_path: string | null, breadcrumbs: Array<{ category_name: string | null, category_url_path: string | null } | null> | null } | null> | null, price_range: { maximum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } | null, minimum_price: { final_price: { currency: CurrencyEnum | null, value: number | null }, regular_price: { currency: CurrencyEnum | null, value: number | null } } }, thumbnail: { url: string | null, position: number | null, disabled: boolean | null, label: string | null } | null, url_rewrites: Array<{ url: string | null } | null> | null, reviews: { items: Array<{ average_rating: number, ratings_breakdown: Array<{ name: string, value: string } | null> } | null> } }
             | null }
         | null>, page_info: { current_page: number | null, page_size: number | null, total_pages: number | null } | null } | null } | null> } | null };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}

export const AddDownloadableProductsToCartDocument = new TypedDocumentString(`
    mutation addDownloadableProductsToCart($input: AddDownloadableProductsToCartInput) {
  addDownloadableProductsToCart(input: $input) {
    cart {
      id
      email
      is_virtual
      applied_coupons {
        code
      }
      prices {
        subtotal_with_discount_excluding_tax {
          value
          currency
        }
        subtotal_excluding_tax {
          value
          currency
        }
        subtotal_including_tax {
          value
          currency
        }
        applied_taxes {
          amount {
            value
            currency
          }
          label
        }
        discounts {
          amount {
            value
            currency
          }
          label
        }
        grand_total {
          value
          currency
        }
      }
      items {
        id
        product {
          id
          __typename
          sku
          name
          stock_status
          only_x_left_in_stock
          rating_summary
          thumbnail {
            url
            position
            disabled
            label
          }
          url_key
          url_rewrites {
            url
          }
          price_range {
            maximum_price {
              final_price {
                currency
                value
              }
              regular_price {
                currency
                value
              }
            }
            minimum_price {
              final_price {
                currency
                value
              }
              regular_price {
                currency
                value
              }
            }
          }
          categories {
            id
            name
            url_suffix
            url_path
            url_key
            include_in_menu
            breadcrumbs {
              category_name
              category_url_path
            }
          }
          review_count
          reviews {
            items {
              average_rating
              ratings_breakdown {
                name
                value
              }
            }
          }
        }
        prices {
          row_total {
            value
            currency
          }
          row_total_including_tax {
            value
            currency
          }
          total_item_discount {
            value
            currency
          }
        }
        quantity
        ... on ConfigurableCartItem {
          configurable_options {
            configurable_product_option_uid
            option_label
            configurable_product_option_value_uid
            value_label
          }
          configured_variant {
            sku
            name
            only_x_left_in_stock
            price_range {
              minimum_price {
                final_price {
                  currency
                  value
                }
                regular_price {
                  currency
                  value
                }
              }
            }
            thumbnail {
              url
            }
          }
        }
        ... on BundleCartItem {
          bundle_options {
            id
            label
            type
            values {
              id
              label
              price
              quantity
            }
          }
        }
      }
      total_quantity
      shipping_addresses {
        firstname
        lastname
        street
        city
        company
        region {
          code
          region_id
          label
        }
        postcode
        telephone
        country {
          code
          label
        }
        selected_shipping_method {
          carrier_code
          carrier_title
          method_code
          method_title
          amount {
            value
            currency
          }
        }
      }
      billing_address {
        firstname
        lastname
        street
        city
        company
        region {
          code
          region_id
          label
        }
        postcode
        telephone
        country {
          code
          label
        }
      }
    }
  }
}
    `) as unknown as TypedDocumentString<AddDownloadableProductsToCartMutation, AddDownloadableProductsToCartMutationVariables>;
export const AddSimpleProductsToCartDocument = new TypedDocumentString(`
    mutation addSimpleProductsToCart($input: AddSimpleProductsToCartInput) {
  addSimpleProductsToCart(input: $input) {
    cart {
      id
      email
      is_virtual
      applied_coupons {
        code
      }
      prices {
        subtotal_with_discount_excluding_tax {
          value
          currency
        }
        subtotal_excluding_tax {
          value
          currency
        }
        subtotal_including_tax {
          value
          currency
        }
        applied_taxes {
          amount {
            value
            currency
          }
          label
        }
        discounts {
          amount {
            value
            currency
          }
          label
        }
        grand_total {
          value
          currency
        }
      }
      items {
        id
        product {
          id
          __typename
          sku
          name
          stock_status
          only_x_left_in_stock
          rating_summary
          thumbnail {
            url
            position
            disabled
            label
          }
          url_key
          url_rewrites {
            url
          }
          price_range {
            maximum_price {
              final_price {
                currency
                value
              }
              regular_price {
                currency
                value
              }
            }
            minimum_price {
              final_price {
                currency
                value
              }
              regular_price {
                currency
                value
              }
            }
          }
          categories {
            id
            name
            url_suffix
            url_path
            url_key
            include_in_menu
            breadcrumbs {
              category_name
              category_url_path
            }
          }
          review_count
          reviews {
            items {
              average_rating
              ratings_breakdown {
                name
                value
              }
            }
          }
        }
        prices {
          row_total {
            value
            currency
          }
          row_total_including_tax {
            value
            currency
          }
          total_item_discount {
            value
            currency
          }
        }
        quantity
        ... on ConfigurableCartItem {
          configurable_options {
            configurable_product_option_uid
            option_label
            configurable_product_option_value_uid
            value_label
          }
          configured_variant {
            sku
            name
            only_x_left_in_stock
            price_range {
              minimum_price {
                final_price {
                  currency
                  value
                }
                regular_price {
                  currency
                  value
                }
              }
            }
            thumbnail {
              url
            }
          }
        }
        ... on BundleCartItem {
          bundle_options {
            id
            label
            type
            values {
              id
              label
              price
              quantity
            }
          }
        }
      }
      total_quantity
      shipping_addresses {
        firstname
        lastname
        street
        city
        company
        region {
          code
          region_id
          label
        }
        postcode
        telephone
        country {
          code
          label
        }
        selected_shipping_method {
          carrier_code
          carrier_title
          method_code
          method_title
          amount {
            value
            currency
          }
        }
      }
      billing_address {
        firstname
        lastname
        street
        city
        company
        region {
          code
          region_id
          label
        }
        postcode
        telephone
        country {
          code
          label
        }
      }
    }
  }
}
    `) as unknown as TypedDocumentString<AddSimpleProductsToCartMutation, AddSimpleProductsToCartMutationVariables>;
export const AddVirtualProductsToCartDocument = new TypedDocumentString(`
    mutation addVirtualProductsToCart($input: AddVirtualProductsToCartInput) {
  addVirtualProductsToCart(input: $input) {
    cart {
      id
      email
      is_virtual
      applied_coupons {
        code
      }
      prices {
        subtotal_with_discount_excluding_tax {
          value
          currency
        }
        subtotal_excluding_tax {
          value
          currency
        }
        subtotal_including_tax {
          value
          currency
        }
        applied_taxes {
          amount {
            value
            currency
          }
          label
        }
        discounts {
          amount {
            value
            currency
          }
          label
        }
        grand_total {
          value
          currency
        }
      }
      items {
        id
        product {
          id
          __typename
          sku
          name
          stock_status
          only_x_left_in_stock
          rating_summary
          thumbnail {
            url
            position
            disabled
            label
          }
          url_key
          url_rewrites {
            url
          }
          price_range {
            maximum_price {
              final_price {
                currency
                value
              }
              regular_price {
                currency
                value
              }
            }
            minimum_price {
              final_price {
                currency
                value
              }
              regular_price {
                currency
                value
              }
            }
          }
          categories {
            id
            name
            url_suffix
            url_path
            url_key
            include_in_menu
            breadcrumbs {
              category_name
              category_url_path
            }
          }
          review_count
          reviews {
            items {
              average_rating
              ratings_breakdown {
                name
                value
              }
            }
          }
        }
        prices {
          row_total {
            value
            currency
          }
          row_total_including_tax {
            value
            currency
          }
          total_item_discount {
            value
            currency
          }
        }
        quantity
        ... on ConfigurableCartItem {
          configurable_options {
            configurable_product_option_uid
            option_label
            configurable_product_option_value_uid
            value_label
          }
          configured_variant {
            sku
            name
            only_x_left_in_stock
            price_range {
              minimum_price {
                final_price {
                  currency
                  value
                }
                regular_price {
                  currency
                  value
                }
              }
            }
            thumbnail {
              url
            }
          }
        }
        ... on BundleCartItem {
          bundle_options {
            id
            label
            type
            values {
              id
              label
              price
              quantity
            }
          }
        }
      }
      total_quantity
      shipping_addresses {
        firstname
        lastname
        street
        city
        company
        region {
          code
          region_id
          label
        }
        postcode
        telephone
        country {
          code
          label
        }
        selected_shipping_method {
          carrier_code
          carrier_title
          method_code
          method_title
          amount {
            value
            currency
          }
        }
      }
      billing_address {
        firstname
        lastname
        street
        city
        company
        region {
          code
          region_id
          label
        }
        postcode
        telephone
        country {
          code
          label
        }
      }
    }
  }
}
    `) as unknown as TypedDocumentString<AddVirtualProductsToCartMutation, AddVirtualProductsToCartMutationVariables>;
export const CountryInformationDocument = new TypedDocumentString(`
    query countryInformation($id: String) {
  country(id: $id) {
    id
    two_letter_abbreviation
    full_name_locale
    full_name_english
    available_regions {
      id
      code
      name
    }
  }
}
    `) as unknown as TypedDocumentString<CountryInformationQuery, CountryInformationQueryVariables>;
export const CustomerOrdersDocument = new TypedDocumentString(`
    query customerOrders($currentPage: Int = 1, $filter: CustomerOrdersFilterInput = {  }, $pageSize: Int = 10) {
  customer {
    orders(currentPage: $currentPage, filter: $filter, pageSize: $pageSize) {
      items {
        number
        id
        order_date
        total {
          discounts {
            amount {
              currency
              value
            }
            label
          }
          grand_total {
            currency
            value
          }
          base_grand_total {
            currency
            value
          }
          shipping_handling {
            amount_excluding_tax {
              currency
              value
            }
            amount_including_tax {
              currency
              value
            }
            discounts {
              amount {
                currency
                value
              }
            }
            taxes {
              amount {
                currency
                value
              }
              rate
              title
            }
            total_amount {
              currency
              value
            }
          }
          subtotal {
            currency
            value
          }
          taxes {
            amount {
              currency
              value
            }
            rate
            title
          }
          total_shipping {
            currency
            value
          }
          total_tax {
            currency
            value
          }
        }
        status
        comments {
          message
          timestamp
        }
        invoices {
          comments {
            message
            timestamp
          }
          id
          items {
            discounts {
              amount {
                currency
                value
              }
              label
            }
            id
            product_name
            product_sale_price {
              currency
              value
            }
            product_sku
            quantity_invoiced
          }
          number
          total {
            discounts {
              amount {
                currency
                value
              }
              label
            }
            base_grand_total {
              currency
              value
            }
            shipping_handling {
              amount_excluding_tax {
                currency
                value
              }
              amount_including_tax {
                currency
                value
              }
              discounts {
                amount {
                  currency
                  value
                }
              }
              taxes {
                amount {
                  currency
                  value
                }
                rate
                title
              }
              total_amount {
                currency
                value
              }
            }
            subtotal {
              currency
              value
            }
            taxes {
              amount {
                currency
                value
              }
              rate
              title
            }
            total_shipping {
              currency
              value
            }
            total_tax {
              currency
              value
            }
          }
        }
        items {
          discounts {
            amount {
              currency
              value
            }
            label
          }
          entered_options {
            label
            value
          }
          id
          product_name
          product_sale_price {
            currency
            value
          }
          product_sku
          product_type
          product_url_key
          quantity_canceled
          quantity_invoiced
          quantity_ordered
          quantity_refunded
          quantity_returned
          quantity_shipped
          selected_options {
            label
            value
          }
          status
        }
        payment_methods {
          name
          type
          additional_data {
            name
            value
          }
        }
        shipments {
          comments {
            message
            timestamp
          }
          id
          number
          tracking {
            carrier
            number
            title
          }
          items {
            id
            product_name
            product_sale_price {
              currency
              value
            }
            product_sku
            quantity_shipped
          }
        }
        shipping_address {
          city
          country_code
          firstname
          lastname
          postcode
          prefix
          region
          street
          suffix
          telephone
        }
        billing_address {
          city
          country_code
          firstname
          lastname
          postcode
          prefix
          region
          street
          suffix
          telephone
        }
        shipping_method
      }
      page_info {
        current_page
        total_pages
        page_size
      }
      total_count
    }
  }
}
    `) as unknown as TypedDocumentString<CustomerOrdersQuery, CustomerOrdersQueryVariables>;
export const UrlResolverDocument = new TypedDocumentString(`
    query urlResolver($url: String!) {
  urlResolver(url: $url) {
    id
    redirectCode
    relative_url
    type
    entity_uid
  }
}
    `) as unknown as TypedDocumentString<UrlResolverQuery, UrlResolverQueryVariables>;
export const WishlistDocument = new TypedDocumentString(`
    query wishlist($currentPage: Int = 1, $pageSize: Int = 10) {
  customer {
    wishlists {
      id
      items_count
      sharing_code
      items_v2(currentPage: $currentPage, pageSize: $pageSize) {
        items {
          id
          quantity
          description
          added_at
          product {
            ... on ConfigurableProduct {
              configurable_options {
                attribute_code
                attribute_uid
                label
                position
                id
                use_default
                values {
                  label
                  swatch_data {
                    value
                  }
                  uid
                }
              }
            }
            ... on BundleProduct {
              items {
                sku
                title
                options {
                  id
                  quantity
                  product {
                    id
                    sku
                    name
                    price_range {
                      maximum_price {
                        final_price {
                          currency
                          value
                        }
                        regular_price {
                          currency
                          value
                        }
                      }
                      minimum_price {
                        final_price {
                          currency
                          value
                        }
                        regular_price {
                          currency
                          value
                        }
                      }
                    }
                  }
                }
              }
            }
            id
            __typename
            sku
            name
            stock_status
            only_x_left_in_stock
            rating_summary
            categories {
              id
              name
              url_suffix
              url_path
              breadcrumbs {
                category_name
                category_url_path
              }
            }
            price_range {
              maximum_price {
                final_price {
                  currency
                  value
                }
                regular_price {
                  currency
                  value
                }
              }
              minimum_price {
                final_price {
                  currency
                  value
                }
                regular_price {
                  currency
                  value
                }
              }
            }
            thumbnail {
              url
              position
              disabled
              label
            }
            url_key
            url_rewrites {
              url
            }
            review_count
            reviews {
              items {
                average_rating
                ratings_breakdown {
                  name
                  value
                }
              }
            }
            ... on GroupedProduct {
              items {
                product {
                  sku
                }
              }
            }
          }
        }
        page_info {
          current_page
          page_size
          total_pages
        }
      }
    }
  }
}
    `) as unknown as TypedDocumentString<WishlistQuery, WishlistQueryVariables>;