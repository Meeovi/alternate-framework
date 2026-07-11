export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Mage_TransportOptions: { input: unknown; output: unknown; }
  _DirectiveExtensions: { input: unknown; output: unknown; }
  join__FieldSet: { input: unknown; output: unknown; }
  link__Import: { input: unknown; output: unknown; }
};

/** Defines the bundle products to add to the cart. */
export type Mage_AddBundleProductsToCartInput = {
  /** The ID of the cart. */
  cart_id: Scalars['String']['input'];
  /** An array of bundle products to add. */
  cart_items: Array<InputMaybe<Mage_BundleProductCartItemInput>>;
};

/** Contains details about the cart after adding bundle products. */
export type Mage_AddBundleProductsToCartOutput = {
  __typename?: 'Mage_AddBundleProductsToCartOutput';
  /** The cart after adding products. */
  cart: Mage_Cart;
};

/** Defines the configurable products to add to the cart. */
export type Mage_AddConfigurableProductsToCartInput = {
  /** The ID of the cart. */
  cart_id: Scalars['String']['input'];
  /** An array of configurable products to add. */
  cart_items: Array<InputMaybe<Mage_ConfigurableProductCartItemInput>>;
};

/** Contains details about the cart after adding configurable products. */
export type Mage_AddConfigurableProductsToCartOutput = {
  __typename?: 'Mage_AddConfigurableProductsToCartOutput';
  /** The cart after adding products. */
  cart: Mage_Cart;
};

export type Mage_AddDownloadableProductsToCartInput = {
  /** The ID of the cart. */
  cart_id: Scalars['String']['input'];
  /** An array of downloadable products to add. */
  cart_items: Array<InputMaybe<Mage_DownloadableProductCartItemInput>>;
};

/** Contains details about the cart after adding downloadable products. */
export type Mage_AddDownloadableProductsToCartOutput = {
  __typename?: 'Mage_AddDownloadableProductsToCartOutput';
  /** The cart after adding products. */
  cart: Mage_Cart;
};

/** Contains details about the cart after adding products to it. */
export type Mage_AddProductsToCartOutput = {
  __typename?: 'Mage_AddProductsToCartOutput';
  /** The cart after products have been added. */
  cart: Mage_Cart;
  /** Contains errors encountered while adding an item to the cart. */
  user_errors: Array<Maybe<Mage_Error>>;
};

/** Contains products to add to an existing compare list. */
export type Mage_AddProductsToCompareListInput = {
  /** An array of product IDs to add to the compare list. */
  products: Array<InputMaybe<Scalars['ID']['input']>>;
  /** The unique identifier of the compare list to modify. */
  uid: Scalars['ID']['input'];
};

/** Contains details about the cart after adding products to it. */
export type Mage_AddProductsToNewCartOutput = {
  __typename?: 'Mage_AddProductsToNewCartOutput';
  /** The cart after products have been added. */
  cart?: Maybe<Mage_Cart>;
  /** Contains errors encountered while adding an item to the cart. */
  user_errors?: Maybe<Array<Maybe<Mage_CartUserInputError>>>;
};

/** Contains the customer's wish list and any errors encountered. */
export type Mage_AddProductsToWishlistOutput = {
  __typename?: 'Mage_AddProductsToWishlistOutput';
  /** An array of errors encountered while adding products to a wish list. */
  user_errors: Array<Maybe<Mage_WishListUserInputError>>;
  /** Contains the wish list with all items that were successfully added. */
  wishlist: Mage_Wishlist;
};

/** Defines the simple and group products to add to the cart. */
export type Mage_AddSimpleProductsToCartInput = {
  /** The unique ID of a `Cart` object. */
  cart_id: Scalars['String']['input'];
  /** An array of simple and group items to add. */
  cart_items: Array<InputMaybe<Mage_SimpleProductCartItemInput>>;
};

/** Contains details about the cart after adding simple or group products. */
export type Mage_AddSimpleProductsToCartOutput = {
  __typename?: 'Mage_AddSimpleProductsToCartOutput';
  /** The cart after adding products. */
  cart: Mage_Cart;
};

/** Defines the virtual products to add to the cart. */
export type Mage_AddVirtualProductsToCartInput = {
  /** The unique ID of a `Cart` object. */
  cart_id: Scalars['String']['input'];
  /** An array of virtual products to add. */
  cart_items: Array<InputMaybe<Mage_VirtualProductCartItemInput>>;
};

/** Contains details about the cart after adding virtual products. */
export type Mage_AddVirtualProductsToCartOutput = {
  __typename?: 'Mage_AddVirtualProductsToCartOutput';
  /** The cart after adding products. */
  cart: Mage_Cart;
};

/** Contains the resultant wish list and any error information. */
export type Mage_AddWishlistItemsToCartOutput = {
  __typename?: 'Mage_AddWishlistItemsToCartOutput';
  /** An array of errors encountered while adding products to the customer's cart. */
  add_wishlist_items_to_cart_user_errors: Array<Maybe<Mage_WishlistCartUserInputError>>;
  /** Indicates whether the attempt to add items to the customer's cart was successful. */
  status: Scalars['Boolean']['output'];
  /** Contains the wish list with all items that were successfully added. */
  wishlist: Mage_Wishlist;
};

/** Contains information for each filterable option (such as price, category `UID`, and custom attributes). */
export type Mage_Aggregation = {
  __typename?: 'Mage_Aggregation';
  /** Attribute code of the aggregation group. */
  attribute_code: Scalars['String']['output'];
  /** The number of options in the aggregation group. */
  count?: Maybe<Scalars['Int']['output']>;
  /** The aggregation display name. */
  label?: Maybe<Scalars['String']['output']>;
  /** Array of options for the aggregation. */
  options?: Maybe<Array<Maybe<Mage_AggregationOption>>>;
  /** The relative position of the attribute in a layered navigation block. */
  position?: Maybe<Scalars['Int']['output']>;
};

/** An implementation of `AggregationOptionInterface`. */
export type Mage_AggregationOption = Mage_AggregationOptionInterface & {
  __typename?: 'Mage_AggregationOption';
  /** The number of items that match the aggregation option. */
  count?: Maybe<Scalars['Int']['output']>;
  /** The display label for an aggregation option. */
  label?: Maybe<Scalars['String']['output']>;
  /** The internal ID that represents the value of the option. */
  value: Scalars['String']['output'];
};

/** Defines aggregation option fields. */
export type Mage_AggregationOptionInterface = {
  /** The number of items that match the aggregation option. */
  count?: Maybe<Scalars['Int']['output']>;
  /** The display label for an aggregation option. */
  label?: Maybe<Scalars['String']['output']>;
  /** The internal ID that represents the value of the option. */
  value: Scalars['String']['output'];
};

/** Filter category aggregations in layered navigation. */
export type Mage_AggregationsCategoryFilterInput = {
  /** Indicates whether to include only direct subcategories or all children categories at all levels. */
  includeDirectChildrenOnly?: InputMaybe<Scalars['Boolean']['input']>;
};

/** An input object that specifies the filters used in product aggregations. */
export type Mage_AggregationsFilterInput = {
  /** Filter category aggregations in layered navigation. */
  category?: InputMaybe<Mage_AggregationsCategoryFilterInput>;
};

export type Mage_ApplePayConfig = Mage_PaymentConfigItem & {
  __typename?: 'Mage_ApplePayConfig';
  /** The styles for the ApplePay Smart Button configuration */
  button_styles?: Maybe<Mage_ButtonStyles>;
  /** The payment method code as defined in the payment gateway */
  code?: Maybe<Scalars['String']['output']>;
  /** Indicates whether the payment method is displayed */
  is_visible?: Maybe<Scalars['Boolean']['output']>;
  /** Defines the payment intent (Authorize or Capture */
  payment_intent?: Maybe<Scalars['String']['output']>;
  /** The payment source for the payment method */
  payment_source?: Maybe<Scalars['String']['output']>;
  /** The PayPal parameters required to load the JS SDK */
  sdk_params?: Maybe<Array<Maybe<Mage_SdkParams>>>;
  /** The relative order the payment method is displayed on the checkout page */
  sort_order?: Maybe<Scalars['String']['output']>;
  /** The name displayed for the payment method */
  title?: Maybe<Scalars['String']['output']>;
};

/** Apple Pay inputs */
export type Mage_ApplePayMethodInput = {
  /** The payment source for the payment method */
  payment_source?: InputMaybe<Scalars['String']['input']>;
  /** The payment services order ID */
  payments_order_id?: InputMaybe<Scalars['String']['input']>;
  /** PayPal order ID */
  paypal_order_id?: InputMaybe<Scalars['String']['input']>;
};

/** Contains the applied coupon code. */
export type Mage_AppliedCoupon = {
  __typename?: 'Mage_AppliedCoupon';
  /** The coupon code the shopper applied to the card. */
  code: Scalars['String']['output'];
};

/** Specifies the coupon code to apply to the cart. */
export type Mage_ApplyCouponToCartInput = {
  /** The unique ID of a `Cart` object. */
  cart_id: Scalars['String']['input'];
  /** A valid coupon code. */
  coupon_code: Scalars['String']['input'];
};

/** Contains details about the cart after applying a coupon. */
export type Mage_ApplyCouponToCartOutput = {
  __typename?: 'Mage_ApplyCouponToCartOutput';
  /** The cart after applying a coupon. */
  cart: Mage_Cart;
};

/** AreaInput defines the parameters which will be used for filter by specified location. */
export type Mage_AreaInput = {
  /** The radius for the search in KM. */
  radius: Scalars['Int']['input'];
  /** The country code where search must be performed. Required parameter together with region, city or postcode. */
  search_term: Scalars['String']['input'];
};

/** Contains the results of the request to assign a compare list. */
export type Mage_AssignCompareListToCustomerOutput = {
  __typename?: 'Mage_AssignCompareListToCustomerOutput';
  /** The contents of the customer's compare list. */
  compare_list?: Maybe<Mage_CompareList>;
  /** Indicates whether the compare list was successfully assigned to the customer. */
  result: Scalars['Boolean']['output'];
};

/** Contains details about the attribute, including the code and type. */
export type Mage_Attribute = {
  __typename?: 'Mage_Attribute';
  /** The unique identifier for an attribute code. This value should be in lowercase letters without spaces. */
  attribute_code?: Maybe<Scalars['String']['output']>;
  /** Attribute options list. */
  attribute_options?: Maybe<Array<Maybe<Mage_AttributeOption>>>;
  /** The data type of the attribute. */
  attribute_type?: Maybe<Scalars['String']['output']>;
  /** The type of entity that defines the attribute. */
  entity_type?: Maybe<Scalars['String']['output']>;
  /** The frontend input type of the attribute. */
  input_type?: Maybe<Scalars['String']['output']>;
  /** Details about the storefront properties configured for the attribute. */
  storefront_properties?: Maybe<Mage_StorefrontProperties>;
};

/** List of all entity types. Populated by the modules introducing EAV entities. */
export enum Mage_AttributeEntityTypeEnum {
  CatalogCategory = 'CATALOG_CATEGORY',
  CatalogProduct = 'CATALOG_PRODUCT',
  Customer = 'CUSTOMER',
  CustomerAddress = 'CUSTOMER_ADDRESS'
}

/** An input object that specifies the filters used for attributes. */
export type Mage_AttributeFilterInput = {
  /** Whether a product or category attribute can be compared against another or not. */
  is_comparable?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether a product or category attribute can be filtered or not. */
  is_filterable?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether a product or category attribute can be filtered in search or not. */
  is_filterable_in_search?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether a product or category attribute can use HTML on front or not. */
  is_html_allowed_on_front?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether a product or category attribute can be searched or not. */
  is_searchable?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether a product or category attribute can be used for price rules or not. */
  is_used_for_price_rules?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether a product or category attribute is used for promo rules or not. */
  is_used_for_promo_rules?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether a product or category attribute is visible in advanced search or not. */
  is_visible_in_advanced_search?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether a product or category attribute is visible on front or not. */
  is_visible_on_front?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether a product or category attribute has WYSIWYG enabled or not. */
  is_wysiwyg_enabled?: InputMaybe<Scalars['Boolean']['input']>;
  /** Whether a product or category attribute is used in product listing or not. */
  used_in_product_listing?: InputMaybe<Scalars['Boolean']['input']>;
};

/** EAV attribute frontend input types. */
export enum Mage_AttributeFrontendInputEnum {
  Boolean = 'BOOLEAN',
  Date = 'DATE',
  Datetime = 'DATETIME',
  File = 'FILE',
  Gallery = 'GALLERY',
  Hidden = 'HIDDEN',
  Image = 'IMAGE',
  MediaImage = 'MEDIA_IMAGE',
  Multiline = 'MULTILINE',
  Multiselect = 'MULTISELECT',
  Price = 'PRICE',
  Select = 'SELECT',
  Text = 'TEXT',
  Textarea = 'TEXTAREA',
  Undefined = 'UNDEFINED',
  Weight = 'WEIGHT'
}

/** Defines the attribute characteristics to search for the `attribute_code` and `entity_type` to search. */
export type Mage_AttributeInput = {
  /** The unique identifier for an attribute code. This value should be in lowercase letters without spaces. */
  attribute_code?: InputMaybe<Scalars['String']['input']>;
  /** The type of entity that defines the attribute. */
  entity_type?: InputMaybe<Scalars['String']['input']>;
};

/** Specifies selected option for a select or multiselect attribute value. */
export type Mage_AttributeInputSelectedOption = {
  /** The attribute option value. */
  value: Scalars['String']['input'];
};

/** Base EAV implementation of CustomAttributeMetadataInterface. */
export type Mage_AttributeMetadata = Mage_CustomAttributeMetadataInterface & {
  __typename?: 'Mage_AttributeMetadata';
  /** The unique identifier for an attribute code. This value should be in lowercase letters without spaces. */
  code: Scalars['ID']['output'];
  /** Default attribute value. */
  default_value?: Maybe<Scalars['String']['output']>;
  /** The type of entity that defines the attribute. */
  entity_type: Mage_AttributeEntityTypeEnum;
  /** The frontend class of the attribute. */
  frontend_class?: Maybe<Scalars['String']['output']>;
  /** The frontend input type of the attribute. */
  frontend_input?: Maybe<Mage_AttributeFrontendInputEnum>;
  /** Whether the attribute value is required. */
  is_required: Scalars['Boolean']['output'];
  /** Whether the attribute value must be unique. */
  is_unique: Scalars['Boolean']['output'];
  /** The label assigned to the attribute. */
  label?: Maybe<Scalars['String']['output']>;
  /** Attribute options. */
  options: Array<Maybe<Mage_CustomAttributeOptionInterface>>;
};

/** Attribute metadata retrieval error. */
export type Mage_AttributeMetadataError = {
  __typename?: 'Mage_AttributeMetadataError';
  /** Attribute metadata retrieval error message. */
  message: Scalars['String']['output'];
  /** Attribute metadata retrieval error type. */
  type: Mage_AttributeMetadataErrorType;
};

/** Attribute metadata retrieval error types. */
export enum Mage_AttributeMetadataErrorType {
  /** The requested attribute was not found. */
  AttributeNotFound = 'ATTRIBUTE_NOT_FOUND',
  /** The requested entity was not found. */
  EntityNotFound = 'ENTITY_NOT_FOUND',
  /** The filter cannot be applied as it does not belong to the entity */
  FilterNotFound = 'FILTER_NOT_FOUND',
  /** Not categorized error, see the error message. */
  Undefined = 'UNDEFINED'
}

/** Defines an attribute option. */
export type Mage_AttributeOption = {
  __typename?: 'Mage_AttributeOption';
  /** The label assigned to the attribute option. */
  label?: Maybe<Scalars['String']['output']>;
  /** The attribute option value. */
  value?: Maybe<Scalars['String']['output']>;
};

/** Base EAV implementation of CustomAttributeOptionInterface. */
export type Mage_AttributeOptionMetadata = Mage_CustomAttributeOptionInterface & {
  __typename?: 'Mage_AttributeOptionMetadata';
  /** Is the option value default. */
  is_default: Scalars['Boolean']['output'];
  /** The label assigned to the attribute option. */
  label: Scalars['String']['output'];
  /** The attribute option value. */
  value: Scalars['String']['output'];
};

export type Mage_AttributeSelectedOption = Mage_AttributeSelectedOptionInterface & {
  __typename?: 'Mage_AttributeSelectedOption';
  /** The attribute selected option label. */
  label: Scalars['String']['output'];
  /** The attribute selected option value. */
  value: Scalars['String']['output'];
};

export type Mage_AttributeSelectedOptionInterface = {
  /** The attribute selected option label. */
  label: Scalars['String']['output'];
  /** The attribute selected option value. */
  value: Scalars['String']['output'];
};

export type Mage_AttributeSelectedOptions = Mage_AttributeValueInterface & {
  __typename?: 'Mage_AttributeSelectedOptions';
  /** The attribute code. */
  code: Scalars['ID']['output'];
  selected_options: Array<Maybe<Mage_AttributeSelectedOptionInterface>>;
};

export type Mage_AttributeValue = Mage_AttributeValueInterface & {
  __typename?: 'Mage_AttributeValue';
  /** The attribute code. */
  code: Scalars['ID']['output'];
  /** The attribute value. */
  value: Scalars['String']['output'];
};

/** Specifies the value for attribute. */
export type Mage_AttributeValueInput = {
  /** The code of the attribute. */
  attribute_code: Scalars['String']['input'];
  /** An array containing selected options for a select or multiselect attribute. */
  selected_options?: InputMaybe<Array<InputMaybe<Mage_AttributeInputSelectedOption>>>;
  /** The value assigned to the attribute. */
  value?: InputMaybe<Scalars['String']['input']>;
};

export type Mage_AttributeValueInterface = {
  /** The attribute code. */
  code: Scalars['ID']['output'];
};

/** Metadata of EAV attributes associated to form */
export type Mage_AttributesFormOutput = {
  __typename?: 'Mage_AttributesFormOutput';
  /** Errors of retrieving certain attributes metadata. */
  errors: Array<Maybe<Mage_AttributeMetadataError>>;
  /** Requested attributes metadata. */
  items: Array<Maybe<Mage_CustomAttributeMetadataInterface>>;
};

/** Metadata of EAV attributes. */
export type Mage_AttributesMetadataOutput = {
  __typename?: 'Mage_AttributesMetadataOutput';
  /** Errors of retrieving certain attributes metadata. */
  errors: Array<Maybe<Mage_AttributeMetadataError>>;
  /** Requested attributes metadata. */
  items: Array<Maybe<Mage_CustomAttributeMetadataInterface>>;
};

/** Describes a payment method that the shopper can use to pay for the order. */
export type Mage_AvailablePaymentMethod = {
  __typename?: 'Mage_AvailablePaymentMethod';
  /** The payment method code. */
  code: Scalars['String']['output'];
  /** If the payment method is an online integration */
  is_deferred: Scalars['Boolean']['output'];
  /** Available issuers for this payment method */
  mollie_available_issuers?: Maybe<Array<Maybe<Mage_MollieIssuer>>>;
  /** Available terminals for this payment method */
  mollie_available_terminals?: Maybe<Array<Maybe<Mage_MollieTerminalOutput>>>;
  /** Retrieve meta information for this payment method (image) */
  mollie_meta: Mage_MolliePaymentMethodMeta;
  /** The payment method title. */
  title: Scalars['String']['output'];
};

/** Contains details about the possible shipping methods and carriers. */
export type Mage_AvailableShippingMethod = {
  __typename?: 'Mage_AvailableShippingMethod';
  /** The cost of shipping using this shipping method. */
  amount: Mage_Money;
  /** Indicates whether this shipping method can be applied to the cart. */
  available: Scalars['Boolean']['output'];
  /** @deprecated The field should not be used on the storefront. */
  base_amount?: Maybe<Mage_Money>;
  /** A string that identifies a commercial carrier or an offline shipping method. */
  carrier_code: Scalars['String']['output'];
  /** The label for the carrier code. */
  carrier_title: Scalars['String']['output'];
  /** Describes an error condition. */
  error_message?: Maybe<Scalars['String']['output']>;
  /** A shipping method code associated with a carrier. The value could be null if no method is available. */
  method_code?: Maybe<Scalars['String']['output']>;
  /** The label for the shipping method code. The value could be null if no method is available. */
  method_title?: Maybe<Scalars['String']['output']>;
  /** The cost of shipping using this shipping method, excluding tax. */
  price_excl_tax: Mage_Money;
  /** The cost of shipping using this shipping method, including tax. */
  price_incl_tax: Mage_Money;
};

export enum Mage_BatchMutationStatus {
  Failure = 'FAILURE',
  MixedResults = 'MIXED_RESULTS',
  Success = 'SUCCESS'
}

/** Defines the billing address. */
export type Mage_BillingAddressInput = {
  /** Defines a billing address. */
  address?: InputMaybe<Mage_CartAddressInput>;
  /** An ID from the customer's address book that uniquely identifies the address to be used for billing. */
  customer_address_id?: InputMaybe<Scalars['Int']['input']>;
  /** Indicates whether to set the billing address to be the same as the existing shipping address on the cart. */
  same_as_shipping?: InputMaybe<Scalars['Boolean']['input']>;
  /** Indicates whether to set the shipping address to be the same as this billing address. */
  use_for_shipping?: InputMaybe<Scalars['Boolean']['input']>;
};

/** The billing address information */
export type Mage_BillingAddressPaymentSourceInput = {
  /** The first line of the address */
  address_line_1?: InputMaybe<Scalars['String']['input']>;
  /** The second line of the address */
  address_line_2?: InputMaybe<Scalars['String']['input']>;
  /** The city of the address */
  city?: InputMaybe<Scalars['String']['input']>;
  /** The country of the address */
  country_code: Scalars['String']['input'];
  /** The postal code of the address */
  postal_code?: InputMaybe<Scalars['String']['input']>;
  /** The region of the address */
  region?: InputMaybe<Scalars['String']['input']>;
};

/** Contains details about the billing address. */
export type Mage_BillingCartAddress = Mage_CartAddressInterface & {
  __typename?: 'Mage_BillingCartAddress';
  /** The city specified for the billing or shipping address. */
  city: Scalars['String']['output'];
  /** The company specified for the billing or shipping address. */
  company?: Maybe<Scalars['String']['output']>;
  /** An object containing the country label and code. */
  country: Mage_CartAddressCountry;
  /** @deprecated The field is used only in shipping address. */
  customer_notes?: Maybe<Scalars['String']['output']>;
  /** The customer's fax number. */
  fax?: Maybe<Scalars['String']['output']>;
  /** The first name of the customer or guest. */
  firstname: Scalars['String']['output'];
  /** Id of the customer address. */
  id?: Maybe<Scalars['Int']['output']>;
  /** The last name of the customer or guest. */
  lastname: Scalars['String']['output'];
  /** The middle name of the person associated with the billing/shipping address. */
  middlename?: Maybe<Scalars['String']['output']>;
  /** The ZIP or postal code of the billing or shipping address. */
  postcode?: Maybe<Scalars['String']['output']>;
  /** An honorific, such as Dr., Mr., or Mrs. */
  prefix?: Maybe<Scalars['String']['output']>;
  /** An object containing the region label and code. */
  region?: Maybe<Mage_CartAddressRegion>;
  /** An array containing the street for the billing or shipping address. */
  street: Array<Maybe<Scalars['String']['output']>>;
  /** A value such as Sr., Jr., or III. */
  suffix?: Maybe<Scalars['String']['output']>;
  /** The telephone number for the billing or shipping address. */
  telephone?: Maybe<Scalars['String']['output']>;
  /** The unique id of the customer address. */
  uid: Scalars['String']['output'];
  /** The VAT company number for billing or shipping address. */
  vat_id?: Maybe<Scalars['String']['output']>;
};

export type Mage_BraintreeCcVaultInput = {
  device_data?: InputMaybe<Scalars['String']['input']>;
  public_hash: Scalars['String']['input'];
};

export type Mage_BraintreeInput = {
  /** Contains a fingerprint provided by Braintree JS SDK and should be sent with sale transaction details to the Braintree payment gateway. */
  device_data?: InputMaybe<Scalars['String']['input']>;
  /** States whether the payment details (Credit/Debit Card, PayPal Account) entered by a customer should be tokenized for later usage. Required only if Vault is enabled for the relevant Braintree payment integration. */
  is_active_payment_token_enabler: Scalars['Boolean']['input'];
  /** The one-time payment token generated by Braintree payment gateway based on payment details (Card, PayPal). Required field to make sale transaction. */
  payment_method_nonce: Scalars['String']['input'];
};

export type Mage_BraintreeVaultInput = {
  device_data?: InputMaybe<Scalars['String']['input']>;
  public_hash: Scalars['String']['input'];
};

/** Contains details about an individual category that comprises a breadcrumb. */
export type Mage_Breadcrumb = {
  __typename?: 'Mage_Breadcrumb';
  /**
   * The ID of the category.
   * @deprecated Use `category_uid` instead.
   */
  category_id?: Maybe<Scalars['Int']['output']>;
  /** The category level. */
  category_level?: Maybe<Scalars['Int']['output']>;
  /** The display name of the category. */
  category_name?: Maybe<Scalars['String']['output']>;
  /** The unique ID for a `Breadcrumb` object. */
  category_uid: Scalars['ID']['output'];
  /** The URL key of the category. */
  category_url_key?: Maybe<Scalars['String']['output']>;
  /** The URL path of the category. */
  category_url_path?: Maybe<Scalars['String']['output']>;
};

/** An implementation for bundle product cart items. */
export type Mage_BundleCartItem = Mage_CartItemInterface & {
  __typename?: 'Mage_BundleCartItem';
  /** An array containing the bundle options the shopper selected. */
  bundle_options: Array<Maybe<Mage_SelectedBundleOption>>;
  /** An array containing the customizable options the shopper selected. */
  customizable_options: Array<Maybe<Mage_SelectedCustomizableOption>>;
  /** Errors assigned to this quote item */
  errors?: Maybe<Array<Maybe<Mage_CartItemError>>>;
  /** The entered gift message for the cart item */
  gift_message?: Maybe<Mage_GiftMessage>;
  /** @deprecated Use `uid` instead. */
  id: Scalars['String']['output'];
  /** True if requested quantity is less than available stock, false otherwise. */
  is_available: Scalars['Boolean']['output'];
  /** Message to display when the product is not available with this selected option. */
  not_available_message?: Maybe<Scalars['String']['output']>;
  /** Contains details about the price of the item, including taxes and discounts. */
  prices?: Maybe<Mage_CartItemPrices>;
  /** Details about an item in the cart. */
  product: Mage_ProductInterface;
  product_type: Scalars['String']['output'];
  /** The quantity of this item in the cart. */
  quantity: Scalars['Float']['output'];
  /** The unique ID for a `CartItemInterface` object. */
  uid: Scalars['ID']['output'];
};

/** Defines bundle product options for `CreditMemoItemInterface`. */
export type Mage_BundleCreditMemoItem = Mage_CreditMemoItemInterface & {
  __typename?: 'Mage_BundleCreditMemoItem';
  /** A list of bundle options that are assigned to a bundle product that is part of a credit memo. */
  bundle_options?: Maybe<Array<Maybe<Mage_ItemSelectedBundleOption>>>;
  /** Details about the final discount amount for the base product, including discounts on options. */
  discounts?: Maybe<Array<Maybe<Mage_Discount>>>;
  /** The unique ID for a `CreditMemoItemInterface` object. */
  id: Scalars['ID']['output'];
  /** The order item the credit memo is applied to. */
  order_item?: Maybe<Mage_OrderItemInterface>;
  /** The name of the base product. */
  product_name?: Maybe<Scalars['String']['output']>;
  /** The sale price for the base product, including selected options. */
  product_sale_price: Mage_Money;
  /** The SKU of the base product. */
  product_sku: Scalars['String']['output'];
  /** The number of refunded items. */
  quantity_refunded?: Maybe<Scalars['Float']['output']>;
};

/** Defines bundle product options for `InvoiceItemInterface`. */
export type Mage_BundleInvoiceItem = Mage_InvoiceItemInterface & {
  __typename?: 'Mage_BundleInvoiceItem';
  /** A list of bundle options that are assigned to an invoiced bundle product. */
  bundle_options?: Maybe<Array<Maybe<Mage_ItemSelectedBundleOption>>>;
  /** Information about the final discount amount for the base product, including discounts on options. */
  discounts?: Maybe<Array<Maybe<Mage_Discount>>>;
  /** The unique ID for an `InvoiceItemInterface` object. */
  id: Scalars['ID']['output'];
  /** Details about an individual order item. */
  order_item?: Maybe<Mage_OrderItemInterface>;
  /** The name of the base product. */
  product_name?: Maybe<Scalars['String']['output']>;
  /** The sale price for the base product including selected options. */
  product_sale_price: Mage_Money;
  /** The SKU of the base product. */
  product_sku: Scalars['String']['output'];
  /** The number of invoiced items. */
  quantity_invoiced?: Maybe<Scalars['Float']['output']>;
};

/** Defines an individual item within a bundle product. */
export type Mage_BundleItem = {
  __typename?: 'Mage_BundleItem';
  /**
   * An ID assigned to each type of item in a bundle product.
   * @deprecated Use `uid` instead
   */
  option_id?: Maybe<Scalars['Int']['output']>;
  /** An array of additional options for this bundle item. */
  options?: Maybe<Array<Maybe<Mage_BundleItemOption>>>;
  /** A number indicating the sequence order of this item compared to the other bundle items. */
  position?: Maybe<Scalars['Int']['output']>;
  /** The range of prices for the product */
  price_range: Mage_PriceRange;
  /** Indicates whether the item must be included in the bundle. */
  required?: Maybe<Scalars['Boolean']['output']>;
  /** The SKU of the bundle product. */
  sku?: Maybe<Scalars['String']['output']>;
  /** The display name of the item. */
  title?: Maybe<Scalars['String']['output']>;
  /** The input type that the customer uses to select the item. Examples include radio button and checkbox. */
  type?: Maybe<Scalars['String']['output']>;
  /** The unique ID for a `BundleItem` object. */
  uid?: Maybe<Scalars['ID']['output']>;
};

/** Defines the characteristics that comprise a specific bundle item and its options. */
export type Mage_BundleItemOption = {
  __typename?: 'Mage_BundleItemOption';
  /** Indicates whether the customer can change the number of items for this option. */
  can_change_quantity?: Maybe<Scalars['Boolean']['output']>;
  /**
   * The ID assigned to the bundled item option.
   * @deprecated Use `uid` instead
   */
  id?: Maybe<Scalars['Int']['output']>;
  /** Indicates whether this option is the default option. */
  is_default?: Maybe<Scalars['Boolean']['output']>;
  /** The text that identifies the bundled item option. */
  label?: Maybe<Scalars['String']['output']>;
  /** When a bundle item contains multiple options, the relative position of this option compared to the other options. */
  position?: Maybe<Scalars['Int']['output']>;
  /** The price of the selected option. */
  price?: Maybe<Scalars['Float']['output']>;
  /** One of FIXED, PERCENT, or DYNAMIC. */
  price_type?: Maybe<Mage_PriceTypeEnum>;
  /** Contains details about this product option. */
  product?: Maybe<Mage_ProductInterface>;
  /**
   * Indicates the quantity of this specific bundle item.
   * @deprecated Use `quantity` instead.
   */
  qty?: Maybe<Scalars['Float']['output']>;
  /** The quantity of this specific bundle item. */
  quantity?: Maybe<Scalars['Float']['output']>;
  /** The unique ID for a `BundleItemOption` object. */
  uid: Scalars['ID']['output'];
};

/** Defines the input for a bundle option. */
export type Mage_BundleOptionInput = {
  /** The ID of the option. */
  id: Scalars['Int']['input'];
  /** The number of the selected item to add to the cart. */
  quantity: Scalars['Float']['input'];
  /** An array with the chosen value of the option. */
  value: Array<InputMaybe<Scalars['String']['input']>>;
};

/** Defines bundle product options for `OrderItemInterface`. */
export type Mage_BundleOrderItem = Mage_OrderItemInterface & {
  __typename?: 'Mage_BundleOrderItem';
  /** A list of bundle options that are assigned to the bundle product. */
  bundle_options?: Maybe<Array<Maybe<Mage_ItemSelectedBundleOption>>>;
  /** The final discount information for the product. */
  discounts?: Maybe<Array<Maybe<Mage_Discount>>>;
  /** The entered option for the base product, such as a logo or image. */
  entered_options?: Maybe<Array<Maybe<Mage_OrderItemOption>>>;
  /** The selected gift message for the order item */
  gift_message?: Maybe<Mage_GiftMessage>;
  /** The unique ID for an `OrderItemInterface` object. */
  id: Scalars['ID']['output'];
  /** The SKU of parent product. */
  parent_sku?: Maybe<Scalars['String']['output']>;
  /** Contains details about the price of the item, including taxes and discounts. */
  prices?: Maybe<Mage_OrderItemPrices>;
  /** The ProductInterface object, which contains details about the base product */
  product?: Maybe<Mage_ProductInterface>;
  /** The name of the base product. */
  product_name?: Maybe<Scalars['String']['output']>;
  /** The sale price of the base product, including selected options. */
  product_sale_price: Mage_Money;
  /** The SKU of the base product. */
  product_sku: Scalars['String']['output'];
  /** The type of product, such as simple, configurable, etc. */
  product_type?: Maybe<Scalars['String']['output']>;
  /** URL key of the base product. */
  product_url_key?: Maybe<Scalars['String']['output']>;
  /** The number of canceled items. */
  quantity_canceled?: Maybe<Scalars['Float']['output']>;
  /** The number of invoiced items. */
  quantity_invoiced?: Maybe<Scalars['Float']['output']>;
  /** The number of units ordered for this item. */
  quantity_ordered?: Maybe<Scalars['Float']['output']>;
  /** The number of refunded items. */
  quantity_refunded?: Maybe<Scalars['Float']['output']>;
  /** The number of returned items. */
  quantity_returned?: Maybe<Scalars['Float']['output']>;
  /** The number of shipped items. */
  quantity_shipped?: Maybe<Scalars['Float']['output']>;
  /** The selected options for the base product, such as color or size. */
  selected_options?: Maybe<Array<Maybe<Mage_OrderItemOption>>>;
  /** The status of the order item. */
  status?: Maybe<Scalars['String']['output']>;
};

/** Defines basic features of a bundle product and contains multiple BundleItems. */
export type Mage_BundleProduct = Mage_CustomizableProductInterface & Mage_PhysicalProductInterface & Mage_ProductInterface & Mage_RoutableInterface & {
  __typename?: 'Mage_BundleProduct';
  /** @deprecated Use the `custom_attributes` field instead. */
  activity?: Maybe<Scalars['String']['output']>;
  /**
   * The attribute set assigned to the product.
   * @deprecated The field should not be used on the storefront.
   */
  attribute_set_id?: Maybe<Scalars['Int']['output']>;
  /** The relative canonical URL. This value is returned only if the system setting 'Use Canonical Link Meta Tag For Products' is enabled. */
  canonical_url?: Maybe<Scalars['String']['output']>;
  /** The categories assigned to a product. */
  categories?: Maybe<Array<Maybe<Mage_CategoryInterface>>>;
  /** @deprecated Use the `custom_attributes` field instead. */
  category_gear?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  climate?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  collar?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  color?: Maybe<Scalars['Int']['output']>;
  /** The product's country of origin. */
  country_of_manufacture?: Maybe<Scalars['String']['output']>;
  /**
   * Timestamp indicating when the product was created.
   * @deprecated The field should not be used on the storefront.
   */
  created_at?: Maybe<Scalars['String']['output']>;
  /** Crosssell Products */
  crosssell_products?: Maybe<Array<Maybe<Mage_ProductInterface>>>;
  /** Product custom attributes. */
  custom_attributesV2?: Maybe<Mage_ProductCustomAttributes>;
  /** Detailed information about the product. The value can include simple HTML tags. */
  description?: Maybe<Mage_ComplexTextValue>;
  /** Indicates whether the bundle product has a dynamic price. */
  dynamic_price?: Maybe<Scalars['Boolean']['output']>;
  /** Indicates whether the bundle product has a dynamic SKU. */
  dynamic_sku?: Maybe<Scalars['Boolean']['output']>;
  /** Indicates whether the bundle product has a dynamically calculated weight. */
  dynamic_weight?: Maybe<Scalars['Boolean']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  eco_collection?: Maybe<Scalars['Int']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  erin_recommends?: Maybe<Scalars['Int']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  features_bags?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  format?: Maybe<Scalars['Int']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  gender?: Maybe<Scalars['String']['output']>;
  /** Returns a value indicating gift message availability for the product. */
  gift_message_available: Scalars['Boolean']['output'];
  /**
   * The ID number assigned to the product.
   * @deprecated Use the `uid` field instead.
   */
  id?: Maybe<Scalars['Int']['output']>;
  /** The relative path to the main image on the product page. */
  image?: Maybe<Mage_ProductImage>;
  /** @deprecated Use the `custom_attributes` field instead. */
  is_seller_product?: Maybe<Scalars['Int']['output']>;
  /** An array containing information about individual bundle items. */
  items?: Maybe<Array<Maybe<Mage_BundleItem>>>;
  /**
   * A number representing the product's manufacturer.
   * @deprecated Use the `custom_attributes` field instead.
   */
  manufacturer?: Maybe<Scalars['Int']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  material?: Maybe<Scalars['String']['output']>;
  /** Maximum Qty Allowed in Shopping Cart */
  max_sale_qty?: Maybe<Scalars['Float']['output']>;
  /** An array of media gallery objects. */
  media_gallery?: Maybe<Array<Maybe<Mage_MediaGalleryInterface>>>;
  /**
   * An array of MediaGalleryEntry objects.
   * @deprecated Use `media_gallery` instead.
   */
  media_gallery_entries?: Maybe<Array<Maybe<Mage_MediaGalleryEntry>>>;
  /** A brief overview of the product for search results listings, maximum 255 characters. */
  meta_description?: Maybe<Scalars['String']['output']>;
  /** A comma-separated list of keywords that are visible only to search engines. */
  meta_keyword?: Maybe<Scalars['String']['output']>;
  /** A string that is displayed in the title bar and tab of the browser and in search results lists. */
  meta_title?: Maybe<Scalars['String']['output']>;
  /** Minimum Qty Allowed in Shopping Cart */
  min_sale_qty?: Maybe<Scalars['Float']['output']>;
  /** The product name. Customers use this name to identify the product. */
  name?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  new?: Maybe<Scalars['Int']['output']>;
  /** The beginning date for new product listings, and determines if the product is featured as a new product. */
  new_from_date?: Maybe<Scalars['String']['output']>;
  /** The end date for new product listings. */
  new_to_date?: Maybe<Scalars['String']['output']>;
  /** Product stock only x left count */
  only_x_left_in_stock?: Maybe<Scalars['Float']['output']>;
  /** An array of options for a customizable product. */
  options?: Maybe<Array<Maybe<Mage_CustomizableOptionInterface>>>;
  /** If the product has multiple options, determines where they appear on the product page. */
  options_container?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  pattern?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  performance_fabric?: Maybe<Scalars['Int']['output']>;
  /**
   * Indicates the price of an item.
   * @deprecated Use `price_range` for product price information.
   */
  price?: Maybe<Mage_ProductPrices>;
  /** The price details of the main product */
  price_details?: Maybe<Mage_PriceDetails>;
  /** The range of prices for the product */
  price_range: Mage_PriceRange;
  /** An array of `TierPrice` objects. */
  price_tiers?: Maybe<Array<Maybe<Mage_TierPrice>>>;
  /** One of PRICE_RANGE or AS_LOW_AS. */
  price_view?: Maybe<Mage_PriceViewEnum>;
  /** An array of `ProductLinks` objects. */
  product_links?: Maybe<Array<Maybe<Mage_ProductLinksInterface>>>;
  /** Amount of available stock */
  quantity?: Maybe<Scalars['Float']['output']>;
  /** The average of all the ratings given to the product. */
  rating_summary: Scalars['Float']['output'];
  /** Contains 0 when there is no redirect error. A value of 301 indicates the URL of the requested resource has been changed permanently, while a value of 302 indicates a temporary redirect. */
  redirect_code: Scalars['Int']['output'];
  /** An array of products to be displayed in a Related Products block. */
  related_products?: Maybe<Array<Maybe<Mage_ProductInterface>>>;
  /** The internal relative URL. If the specified URL is a redirect, the query returns the redirected URL, not the original. */
  relative_url?: Maybe<Scalars['String']['output']>;
  /** The total count of all the reviews given to the product. */
  review_count: Scalars['Int']['output'];
  /** The list of products reviews. */
  reviews: Mage_ProductReviews;
  /** @deprecated Use the `custom_attributes` field instead. */
  sale?: Maybe<Scalars['Int']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  seller_id?: Maybe<Scalars['Int']['output']>;
  /** Indicates whether to ship bundle items together or individually. */
  ship_bundle_items?: Maybe<Mage_ShipBundleItemsEnum>;
  /** A short description of the product. Its use depends on the theme. */
  short_description?: Maybe<Mage_ComplexTextValue>;
  /** @deprecated Use the `custom_attributes` field instead. */
  size?: Maybe<Scalars['Int']['output']>;
  /** A number or code assigned to a product to identify the product, options, price, and manufacturer. */
  sku?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  sleeve?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  sm_featured?: Maybe<Scalars['Int']['output']>;
  /** The relative path to the small image, which is used on catalog pages. */
  small_image?: Maybe<Mage_ProductImage>;
  /**
   * The beginning date that a product has a special price.
   * @deprecated The field should not be used on the storefront.
   */
  special_from_date?: Maybe<Scalars['String']['output']>;
  /** The discounted price of the product. */
  special_price?: Maybe<Scalars['Float']['output']>;
  /** The end date for a product with a special price. */
  special_to_date?: Maybe<Scalars['String']['output']>;
  /** The status assigned to the product, 0 for disabled, 1 for enabled. */
  status?: Maybe<Scalars['Int']['output']>;
  /** Stock status of the product */
  stock_status?: Maybe<Mage_ProductStockStatus>;
  /** @deprecated Use the `custom_attributes` field instead. */
  strap_bags?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  style_bags?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  style_bottom?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  style_general?: Maybe<Scalars['String']['output']>;
  /** The file name of a swatch image. */
  swatch_image?: Maybe<Scalars['String']['output']>;
  /** The relative path to the product's thumbnail image. */
  thumbnail?: Maybe<Mage_ProductImage>;
  /**
   * The price when tier pricing is in effect and the items purchased threshold has been reached.
   * @deprecated Use `price_tiers` for product tier price information.
   */
  tier_price?: Maybe<Scalars['Float']['output']>;
  /**
   * An array of ProductTierPrices objects.
   * @deprecated Use `price_tiers` for product tier price information.
   */
  tier_prices?: Maybe<Array<Maybe<Mage_ProductTierPrices>>>;
  /** One of PRODUCT, CATEGORY, or CMS_PAGE. */
  type?: Maybe<Mage_UrlRewriteEntityTypeEnum>;
  /**
   * One of simple, virtual, bundle, downloadable, grouped, or configurable.
   * @deprecated Use `__typename` instead.
   */
  type_id?: Maybe<Scalars['String']['output']>;
  /** The unique ID for a `ProductInterface` object. */
  uid: Scalars['ID']['output'];
  /**
   * Timestamp indicating when the product was updated.
   * @deprecated The field should not be used on the storefront.
   */
  updated_at?: Maybe<Scalars['String']['output']>;
  /** Upsell Products */
  upsell_products?: Maybe<Array<Maybe<Mage_ProductInterface>>>;
  /** The part of the URL that identifies the product */
  url_key?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use product's `canonical_url` or url rewrites instead */
  url_path?: Maybe<Scalars['String']['output']>;
  /** URL rewrites list */
  url_rewrites?: Maybe<Array<Maybe<Mage_UrlRewrite>>>;
  /** The part of the product URL that is appended after the url key */
  url_suffix?: Maybe<Scalars['String']['output']>;
  /** The visibility assigned to the product. */
  visibility?: Maybe<Scalars['Int']['output']>;
  /**
   * An array of websites in which the product is available.
   * @deprecated The field should not be used on the storefront.
   */
  websites?: Maybe<Array<Maybe<Mage_Website>>>;
  /** The weight of the item, in units defined by the store. */
  weight?: Maybe<Scalars['Float']['output']>;
};


/** Defines basic features of a bundle product and contains multiple BundleItems. */
export type Mage_BundleProductCustom_AttributesV2Args = {
  filters?: InputMaybe<Mage_AttributeFilterInput>;
};


/** Defines basic features of a bundle product and contains multiple BundleItems. */
export type Mage_BundleProductReviewsArgs = {
  currentPage?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
};

/** Defines a single bundle product. */
export type Mage_BundleProductCartItemInput = {
  /** A mandatory array of options for the bundle product, including each chosen option and specified quantity. */
  bundle_options: Array<InputMaybe<Mage_BundleOptionInput>>;
  /** The ID and value of the option. */
  customizable_options?: InputMaybe<Array<InputMaybe<Mage_CustomizableOptionInput>>>;
  /** The quantity and SKU of the bundle product. */
  data: Mage_CartItemInput;
};

/** Defines bundle product options for `ShipmentItemInterface`. */
export type Mage_BundleShipmentItem = Mage_ShipmentItemInterface & {
  __typename?: 'Mage_BundleShipmentItem';
  /** A list of bundle options that are assigned to a shipped product. */
  bundle_options?: Maybe<Array<Maybe<Mage_ItemSelectedBundleOption>>>;
  /** The unique ID for a `ShipmentItemInterface` object. */
  id: Scalars['ID']['output'];
  /** The order item associated with the shipment item. */
  order_item?: Maybe<Mage_OrderItemInterface>;
  /** The name of the base product. */
  product_name?: Maybe<Scalars['String']['output']>;
  /** The sale price for the base product. */
  product_sale_price: Mage_Money;
  /** The SKU of the base product. */
  product_sku: Scalars['String']['output'];
  /** The number of shipped items. */
  quantity_shipped: Scalars['Float']['output'];
};

/** Defines bundle product options for `WishlistItemInterface`. */
export type Mage_BundleWishlistItem = Mage_WishlistItemInterface & {
  __typename?: 'Mage_BundleWishlistItem';
  /** The date and time the item was added to the wish list. */
  added_at: Scalars['String']['output'];
  /** An array containing information about the selected bundle items. */
  bundle_options?: Maybe<Array<Maybe<Mage_SelectedBundleOption>>>;
  /** Custom options selected for the wish list item. */
  customizable_options: Array<Maybe<Mage_SelectedCustomizableOption>>;
  /** The description of the item. */
  description?: Maybe<Scalars['String']['output']>;
  /** The unique ID for a `WishlistItemInterface` object. */
  id: Scalars['ID']['output'];
  /** Product details of the wish list item. */
  product?: Maybe<Mage_ProductInterface>;
  /** The quantity of this wish list item. */
  quantity: Scalars['Float']['output'];
};

export type Mage_ButtonStyles = {
  __typename?: 'Mage_ButtonStyles';
  /** The button color */
  color?: Maybe<Scalars['String']['output']>;
  /** The button height in pixels */
  height?: Maybe<Scalars['Int']['output']>;
  /** The button label */
  label?: Maybe<Scalars['String']['output']>;
  /** The button layout */
  layout?: Maybe<Scalars['String']['output']>;
  /** The button shape */
  shape?: Maybe<Scalars['String']['output']>;
  /** Indicates whether the tagline is displayed */
  tagline?: Maybe<Scalars['Boolean']['output']>;
  /** Defines if the button uses default height. If the value is false, the value of height is used */
  use_default_height?: Maybe<Scalars['Boolean']['output']>;
};

export type Mage_CancelOrderError = {
  __typename?: 'Mage_CancelOrderError';
  /** An error code that is specific to cancel order. */
  code: Mage_CancelOrderErrorCode;
  /** A localized error message. */
  message: Scalars['String']['output'];
};

export enum Mage_CancelOrderErrorCode {
  InvalidOrderStatus = 'INVALID_ORDER_STATUS',
  OrderCancellationDisabled = 'ORDER_CANCELLATION_DISABLED',
  OrderNotFound = 'ORDER_NOT_FOUND',
  PartialOrderItemShipped = 'PARTIAL_ORDER_ITEM_SHIPPED',
  Unauthorised = 'UNAUTHORISED',
  Undefined = 'UNDEFINED'
}

/** Defines the order to cancel. */
export type Mage_CancelOrderInput = {
  /** The unique ID of an `Order` type. */
  order_id: Scalars['ID']['input'];
  /** Cancellation reason. */
  reason: Scalars['String']['input'];
};

/** Contains the updated customer order and error message if any. */
export type Mage_CancelOrderOutput = {
  __typename?: 'Mage_CancelOrderOutput';
  /** Error encountered while cancelling the order. */
  error?: Maybe<Scalars['String']['output']>;
  errorV2?: Maybe<Mage_CancelOrderError>;
  /** Updated customer order. */
  order?: Maybe<Mage_CustomerOrder>;
};

export type Mage_CancellationReason = {
  __typename?: 'Mage_CancellationReason';
  description: Scalars['String']['output'];
};

export type Mage_Card = {
  __typename?: 'Mage_Card';
  /** Card bin details */
  bin_details?: Maybe<Mage_CardBin>;
  /** Expiration month of the card */
  card_expiry_month?: Maybe<Scalars['String']['output']>;
  /** Expiration year of the card */
  card_expiry_year?: Maybe<Scalars['String']['output']>;
  /** Last four digits of the card */
  last_digits?: Maybe<Scalars['String']['output']>;
  /** Name on the card */
  name?: Maybe<Scalars['String']['output']>;
};

export type Mage_CardBin = {
  __typename?: 'Mage_CardBin';
  /** Card bin number */
  bin?: Maybe<Scalars['String']['output']>;
};

/** The card payment source information */
export type Mage_CardPaymentSourceInput = {
  /** The billing address of the card */
  billing_address: Mage_BillingAddressPaymentSourceInput;
  /** The name on the cardholder */
  name?: InputMaybe<Scalars['String']['input']>;
};

/** The card payment source information */
export type Mage_CardPaymentSourceOutput = {
  __typename?: 'Mage_CardPaymentSourceOutput';
  /** The brand of the card */
  brand?: Maybe<Scalars['String']['output']>;
  /** The expiry of the card */
  expiry?: Maybe<Scalars['String']['output']>;
  /** The last digits of the card */
  last_digits?: Maybe<Scalars['String']['output']>;
};

/** Contains the contents and other details about a guest or customer cart. */
export type Mage_Cart = {
  __typename?: 'Mage_Cart';
  /** @deprecated Use `applied_coupons` instead. */
  applied_coupon?: Maybe<Mage_AppliedCoupon>;
  /** An array of `AppliedCoupon` objects. Each object contains the `code` text attribute, which specifies the coupon code. */
  applied_coupons?: Maybe<Array<Maybe<Mage_AppliedCoupon>>>;
  /** An array of available payment methods. */
  available_payment_methods?: Maybe<Array<Maybe<Mage_AvailablePaymentMethod>>>;
  /** The billing address assigned to the cart. */
  billing_address?: Maybe<Mage_BillingCartAddress>;
  /** The email address of the guest or customer. */
  email?: Maybe<Scalars['String']['output']>;
  /** The entered gift message for the cart */
  gift_message?: Maybe<Mage_GiftMessage>;
  /** The unique ID for a `Cart` object. */
  id: Scalars['ID']['output'];
  /** Indicates whether the cart contains only virtual products. */
  is_virtual: Scalars['Boolean']['output'];
  /**
   * An array of products that have been added to the cart.
   * @deprecated Use `itemsV2` instead.
   */
  items?: Maybe<Array<Maybe<Mage_CartItemInterface>>>;
  itemsV2?: Maybe<Mage_CartItems>;
  /** Available issuers for the selected payment method */
  mollie_available_issuers?: Maybe<Array<Maybe<Mage_MollieIssuer>>>;
  /** Pricing details for the quote. */
  prices?: Maybe<Mage_CartPrices>;
  /** Indicates which payment method was applied to the cart. */
  selected_payment_method?: Maybe<Mage_SelectedPaymentMethod>;
  /** An array of shipping addresses assigned to the cart. */
  shipping_addresses: Array<Maybe<Mage_ShippingCartAddress>>;
  /** The total number of items in the cart. */
  total_quantity: Scalars['Float']['output'];
};


/** Contains the contents and other details about a guest or customer cart. */
export type Mage_CartItemsV2Args = {
  currentPage?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Mage_QuoteItemsSortInput>;
};

/** Contains details the country in a billing or shipping address. */
export type Mage_CartAddressCountry = {
  __typename?: 'Mage_CartAddressCountry';
  /** The country code. */
  code: Scalars['String']['output'];
  /** The display label for the country. */
  label: Scalars['String']['output'];
};

/** Defines the billing or shipping address to be applied to the cart. */
export type Mage_CartAddressInput = {
  /** The city specified for the billing or shipping address. */
  city: Scalars['String']['input'];
  /** The company specified for the billing or shipping address. */
  company?: InputMaybe<Scalars['String']['input']>;
  /** The country code and label for the billing or shipping address. */
  country_code: Scalars['String']['input'];
  /** The customer's fax number. */
  fax?: InputMaybe<Scalars['String']['input']>;
  /** The first name of the customer or guest. */
  firstname: Scalars['String']['input'];
  /** The last name of the customer or guest. */
  lastname: Scalars['String']['input'];
  /** The middle name of the person associated with the billing/shipping address. */
  middlename?: InputMaybe<Scalars['String']['input']>;
  /** The ZIP or postal code of the billing or shipping address. */
  postcode?: InputMaybe<Scalars['String']['input']>;
  /** An honorific, such as Dr., Mr., or Mrs. */
  prefix?: InputMaybe<Scalars['String']['input']>;
  /** A string that defines the state or province of the billing or shipping address. */
  region?: InputMaybe<Scalars['String']['input']>;
  /** An integer that defines the state or province of the billing or shipping address. */
  region_id?: InputMaybe<Scalars['Int']['input']>;
  /** Determines whether to save the address in the customer's address book. The default value is true. */
  save_in_address_book?: InputMaybe<Scalars['Boolean']['input']>;
  /** An array containing the street for the billing or shipping address. */
  street: Array<InputMaybe<Scalars['String']['input']>>;
  /** A value such as Sr., Jr., or III. */
  suffix?: InputMaybe<Scalars['String']['input']>;
  /** The telephone number for the billing or shipping address. */
  telephone?: InputMaybe<Scalars['String']['input']>;
  /** The VAT company number for billing or shipping address. */
  vat_id?: InputMaybe<Scalars['String']['input']>;
};

export type Mage_CartAddressInterface = {
  /** The city specified for the billing or shipping address. */
  city: Scalars['String']['output'];
  /** The company specified for the billing or shipping address. */
  company?: Maybe<Scalars['String']['output']>;
  /** An object containing the country label and code. */
  country: Mage_CartAddressCountry;
  /** The customer's fax number. */
  fax?: Maybe<Scalars['String']['output']>;
  /** The first name of the customer or guest. */
  firstname: Scalars['String']['output'];
  /** Id of the customer address. */
  id?: Maybe<Scalars['Int']['output']>;
  /** The last name of the customer or guest. */
  lastname: Scalars['String']['output'];
  /** The middle name of the person associated with the billing/shipping address. */
  middlename?: Maybe<Scalars['String']['output']>;
  /** The ZIP or postal code of the billing or shipping address. */
  postcode?: Maybe<Scalars['String']['output']>;
  /** An honorific, such as Dr., Mr., or Mrs. */
  prefix?: Maybe<Scalars['String']['output']>;
  /** An object containing the region label and code. */
  region?: Maybe<Mage_CartAddressRegion>;
  /** An array containing the street for the billing or shipping address. */
  street: Array<Maybe<Scalars['String']['output']>>;
  /** A value such as Sr., Jr., or III. */
  suffix?: Maybe<Scalars['String']['output']>;
  /** The telephone number for the billing or shipping address. */
  telephone?: Maybe<Scalars['String']['output']>;
  /** The unique id of the customer address. */
  uid: Scalars['String']['output'];
  /** The VAT company number for billing or shipping address. */
  vat_id?: Maybe<Scalars['String']['output']>;
};

/** Contains details about the region in a billing or shipping address. */
export type Mage_CartAddressRegion = {
  __typename?: 'Mage_CartAddressRegion';
  /** The state or province code. */
  code?: Maybe<Scalars['String']['output']>;
  /** The display label for the region. */
  label?: Maybe<Scalars['String']['output']>;
  /** The unique ID for a pre-defined region. */
  region_id?: Maybe<Scalars['Int']['output']>;
};

/** Contains information about discounts applied to the cart. */
export type Mage_CartDiscount = {
  __typename?: 'Mage_CartDiscount';
  /** The amount of the discount applied to the item. */
  amount: Mage_Money;
  /** The description of the discount. */
  label: Array<Maybe<Scalars['String']['output']>>;
};

export enum Mage_CartDiscountType {
  Item = 'ITEM',
  Shipping = 'SHIPPING'
}

export type Mage_CartItemError = {
  __typename?: 'Mage_CartItemError';
  /** An error code that describes the error encountered */
  code: Mage_CartItemErrorType;
  /** A localized error message */
  message: Scalars['String']['output'];
};

export enum Mage_CartItemErrorType {
  ItemIncrements = 'ITEM_INCREMENTS',
  ItemQty = 'ITEM_QTY',
  Undefined = 'UNDEFINED'
}

/** Defines an item to be added to the cart. */
export type Mage_CartItemInput = {
  /** An array of entered options for the base product, such as personalization text. */
  entered_options?: InputMaybe<Array<InputMaybe<Mage_EnteredOptionInput>>>;
  /** For a child product, the SKU of its parent product. */
  parent_sku?: InputMaybe<Scalars['String']['input']>;
  /** The amount or number of an item to add. */
  quantity: Scalars['Float']['input'];
  /** The selected options for the base product, such as color or size, using the unique ID for an object such as `CustomizableRadioOption`, `CustomizableDropDownOption`, or `ConfigurableProductOptionsValues`. */
  selected_options?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  /** The SKU of the product. */
  sku: Scalars['String']['input'];
};

/** An interface for products in a cart. */
export type Mage_CartItemInterface = {
  /** Errors assigned to this quote item */
  errors?: Maybe<Array<Maybe<Mage_CartItemError>>>;
  /** @deprecated Use `uid` instead. */
  id: Scalars['String']['output'];
  /** True if requested quantity is less than available stock, false otherwise. */
  is_available: Scalars['Boolean']['output'];
  /** Message to display when the product is not available with this selected option. */
  not_available_message?: Maybe<Scalars['String']['output']>;
  /** Contains details about the price of the item, including taxes and discounts. */
  prices?: Maybe<Mage_CartItemPrices>;
  /** Details about an item in the cart. */
  product: Mage_ProductInterface;
  product_type: Scalars['String']['output'];
  /** The quantity of this item in the cart. */
  quantity: Scalars['Float']['output'];
  /** The unique ID for a `CartItemInterface` object. */
  uid: Scalars['ID']['output'];
};

/** Contains details about the price of the item, including taxes and discounts. */
export type Mage_CartItemPrices = {
  __typename?: 'Mage_CartItemPrices';
  /** The price discount for the unit price of the item represents the difference between its regular price and final price. */
  catalog_discount?: Maybe<Mage_ProductDiscount>;
  /** An array of discounts to be applied to the cart item. */
  discounts?: Maybe<Array<Maybe<Mage_Discount>>>;
  /** An array of FPTs applied to the cart item. */
  fixed_product_taxes?: Maybe<Array<Maybe<Mage_FixedProductTax>>>;
  /** The value of the original unit price for the item, including discounts. */
  original_item_price: Mage_Money;
  /** The value of the original price multiplied by the quantity of the item. */
  original_row_total: Mage_Money;
  /** The price of the item before any discounts were applied. The price that might include tax, depending on the configured display settings for cart. */
  price: Mage_Money;
  price_incl_tax: Mage_Money;
  /** The price of the item before any discounts were applied. The price that might include tax, depending on the configured display settings for cart. */
  price_including_tax: Mage_Money;
  /** The price discount multiplied by the item quantity represents the total difference between the regular price and the final price for the entire quote item. */
  row_catalog_discount?: Maybe<Mage_ProductDiscount>;
  /** The value of the price multiplied by the quantity of the item. */
  row_total: Mage_Money;
  row_total_incl_tax: Mage_Money;
  /** The value of `row_total` plus the tax applied to the item. */
  row_total_including_tax: Mage_Money;
  /** The total of all discounts applied to the item. */
  total_item_discount?: Maybe<Mage_Money>;
};

/** Deprecated: The `ShippingCartAddress.cart_items` field now returns `CartItemInterface`. */
export type Mage_CartItemQuantity = {
  __typename?: 'Mage_CartItemQuantity';
  /** @deprecated The `ShippingCartAddress.cart_items` field now returns `CartItemInterface`. */
  cart_item_id: Scalars['Int']['output'];
  /** @deprecated The `ShippingCartAddress.cart_items` field now returns `CartItemInterface`. */
  quantity: Scalars['Float']['output'];
};

/** Contains details about the price of a selected customizable value. */
export type Mage_CartItemSelectedOptionValuePrice = {
  __typename?: 'Mage_CartItemSelectedOptionValuePrice';
  /** Indicates whether the price type is fixed, percent, or dynamic. */
  type: Mage_PriceTypeEnum;
  /** A string that describes the unit of the value. */
  units: Scalars['String']['output'];
  /** A price value. */
  value: Scalars['Float']['output'];
};

/** A single item to be updated. */
export type Mage_CartItemUpdateInput = {
  /** Deprecated. Use `cart_item_uid` instead. */
  cart_item_id?: InputMaybe<Scalars['Int']['input']>;
  /** The unique ID for a `CartItemInterface` object. */
  cart_item_uid?: InputMaybe<Scalars['ID']['input']>;
  /** An array that defines customizable options for the product. */
  customizable_options?: InputMaybe<Array<InputMaybe<Mage_CustomizableOptionInput>>>;
  /** Gift message details for the cart item */
  gift_message?: InputMaybe<Mage_GiftMessageInput>;
  /** The new quantity of the item. */
  quantity?: InputMaybe<Scalars['Float']['input']>;
};

export type Mage_CartItems = {
  __typename?: 'Mage_CartItems';
  /** An array of products that have been added to the cart. */
  items: Array<Maybe<Mage_CartItemInterface>>;
  /** Metadata for pagination rendering. */
  page_info?: Maybe<Mage_SearchResultPageInfo>;
  /** The number of returned cart items. */
  total_count: Scalars['Int']['output'];
};

/** Contains details about the final price of items in the cart, including discount and tax information. */
export type Mage_CartPrices = {
  __typename?: 'Mage_CartPrices';
  /** An array containing the names and amounts of taxes applied to each item in the cart. */
  applied_taxes?: Maybe<Array<Maybe<Mage_CartTaxItem>>>;
  /** @deprecated Use discounts instead. */
  discount?: Maybe<Mage_CartDiscount>;
  /** An array containing cart rule discounts, store credit and gift cards applied to the cart. */
  discounts?: Maybe<Array<Maybe<Mage_Discount>>>;
  /** The total, including discounts, taxes, shipping, and other fees. */
  grand_total?: Maybe<Mage_Money>;
  /** The total of the cart, including discounts, shipping, and other fees without tax. */
  grand_total_excluding_tax?: Maybe<Mage_Money>;
  mollie_payment_fee?: Maybe<Mage_MolliePaymentFee>;
  /** The subtotal without any applied taxes. */
  subtotal_excluding_tax?: Maybe<Mage_Money>;
  /** The subtotal including any applied taxes. */
  subtotal_including_tax?: Maybe<Mage_Money>;
  /** The subtotal with any discounts applied, but not taxes. */
  subtotal_with_discount_excluding_tax?: Maybe<Mage_Money>;
};

/** Contains tax information about an item in the cart. */
export type Mage_CartTaxItem = {
  __typename?: 'Mage_CartTaxItem';
  /** The amount of tax applied to the item. */
  amount: Mage_Money;
  /** The description of the tax. */
  label: Scalars['String']['output'];
};

export type Mage_CartUserInputError = Mage_Error & {
  __typename?: 'Mage_CartUserInputError';
  /** A cart-specific error code. */
  code: Mage_CartUserInputErrorType;
  /** A localized error message. */
  message: Scalars['String']['output'];
};

export enum Mage_CartUserInputErrorType {
  CouldNotFindCartItem = 'COULD_NOT_FIND_CART_ITEM',
  InsufficientStock = 'INSUFFICIENT_STOCK',
  InvalidParameterValue = 'INVALID_PARAMETER_VALUE',
  NotSalable = 'NOT_SALABLE',
  ProductNotFound = 'PRODUCT_NOT_FOUND',
  RequiredParameterMissing = 'REQUIRED_PARAMETER_MISSING',
  Undefined = 'UNDEFINED'
}

export enum Mage_CatalogAttributeApplyToEnum {
  Bundle = 'BUNDLE',
  Category = 'CATEGORY',
  Configurable = 'CONFIGURABLE',
  Downloadable = 'DOWNLOADABLE',
  Grouped = 'GROUPED',
  Simple = 'SIMPLE',
  Virtual = 'VIRTUAL'
}

/** Swatch attribute metadata. */
export type Mage_CatalogAttributeMetadata = Mage_CustomAttributeMetadataInterface & {
  __typename?: 'Mage_CatalogAttributeMetadata';
  /** To which catalog types an attribute can be applied. */
  apply_to?: Maybe<Array<Maybe<Mage_CatalogAttributeApplyToEnum>>>;
  /** The unique identifier for an attribute code. This value should be in lowercase letters without spaces. */
  code: Scalars['ID']['output'];
  /** Default attribute value. */
  default_value?: Maybe<Scalars['String']['output']>;
  /** The type of entity that defines the attribute. */
  entity_type: Mage_AttributeEntityTypeEnum;
  /** The frontend class of the attribute. */
  frontend_class?: Maybe<Scalars['String']['output']>;
  /** The frontend input type of the attribute. */
  frontend_input?: Maybe<Mage_AttributeFrontendInputEnum>;
  /** Whether a product or category attribute can be compared against another or not. */
  is_comparable?: Maybe<Scalars['Boolean']['output']>;
  /** Whether a product or category attribute can be filtered or not. */
  is_filterable?: Maybe<Scalars['Boolean']['output']>;
  /** Whether a product or category attribute can be filtered in search or not. */
  is_filterable_in_search?: Maybe<Scalars['Boolean']['output']>;
  /** Whether a product or category attribute can use HTML on front or not. */
  is_html_allowed_on_front?: Maybe<Scalars['Boolean']['output']>;
  /** Whether the attribute value is required. */
  is_required: Scalars['Boolean']['output'];
  /** Whether a product or category attribute can be searched or not. */
  is_searchable?: Maybe<Scalars['Boolean']['output']>;
  /** Whether the attribute value must be unique. */
  is_unique: Scalars['Boolean']['output'];
  /** Whether a product or category attribute can be used for price rules or not. */
  is_used_for_price_rules?: Maybe<Scalars['Boolean']['output']>;
  /** Whether a product or category attribute is used for promo rules or not. */
  is_used_for_promo_rules?: Maybe<Scalars['Boolean']['output']>;
  /** Whether a product or category attribute is visible in advanced search or not. */
  is_visible_in_advanced_search?: Maybe<Scalars['Boolean']['output']>;
  /** Whether a product or category attribute is visible on front or not. */
  is_visible_on_front?: Maybe<Scalars['Boolean']['output']>;
  /** Whether a product or category attribute has WYSIWYG enabled or not. */
  is_wysiwyg_enabled?: Maybe<Scalars['Boolean']['output']>;
  /** The label assigned to the attribute. */
  label?: Maybe<Scalars['String']['output']>;
  /** Attribute options. */
  options: Array<Maybe<Mage_CustomAttributeOptionInterface>>;
  /** Input type of the swatch attribute option. */
  swatch_input_type?: Maybe<Mage_SwatchInputTypeEnum>;
  /** Whether update product preview image or not. */
  update_product_preview_image?: Maybe<Scalars['Boolean']['output']>;
  /** Whether use product image for swatch or not. */
  use_product_image_for_swatch?: Maybe<Scalars['Boolean']['output']>;
  /** Whether a product or category attribute is used in product listing or not. */
  used_in_product_listing?: Maybe<Scalars['Boolean']['output']>;
};

/** Defines the filters to be used in the search. A filter contains at least one attribute, a comparison operator, and the value that is being searched for. */
export type Mage_CategoryFilterInput = {
  /** Filter by the unique category ID for a `CategoryInterface` object. */
  category_uid?: InputMaybe<Mage_FilterEqualTypeInput>;
  /** Deprecated: use 'category_uid' to filter uniquely identifiers of categories. */
  ids?: InputMaybe<Mage_FilterEqualTypeInput>;
  /** Filter by the display name of the category. */
  name?: InputMaybe<Mage_FilterMatchTypeInput>;
  /** Filter by the unique parent category ID for a `CategoryInterface` object. */
  parent_category_uid?: InputMaybe<Mage_FilterEqualTypeInput>;
  /** Filter by the unique parent category ID for a `CategoryInterface` object. */
  parent_id?: InputMaybe<Mage_FilterEqualTypeInput>;
  /** Filter by the part of the URL that identifies the category. */
  url_key?: InputMaybe<Mage_FilterEqualTypeInput>;
  /** Filter by the URL path for the category. */
  url_path?: InputMaybe<Mage_FilterEqualTypeInput>;
};

/** Contains the full set of attributes that can be returned in a category search. */
export type Mage_CategoryInterface = {
  amtoolkit_robots?: Maybe<Scalars['String']['output']>;
  available_sort_by?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** An array of breadcrumb items. */
  breadcrumbs?: Maybe<Array<Maybe<Mage_Breadcrumb>>>;
  /** The relative canonical URL. This value is returned only if the system setting 'Use Canonical Link Meta Tag For Categories' is enabled. */
  canonical_url?: Maybe<Scalars['String']['output']>;
  category_code?: Maybe<Scalars['String']['output']>;
  children_count?: Maybe<Scalars['String']['output']>;
  /** Contains a category CMS block. */
  cms_block?: Maybe<Mage_CmsBlock>;
  /**
   * The timestamp indicating when the category was created.
   * @deprecated The field should not be used on the storefront.
   */
  created_at?: Maybe<Scalars['String']['output']>;
  custom_layout_update_file?: Maybe<Scalars['String']['output']>;
  /** The attribute to use for sorting. */
  default_sort_by?: Maybe<Scalars['String']['output']>;
  /** An optional description of the category. */
  description?: Maybe<Scalars['String']['output']>;
  display_mode?: Maybe<Scalars['String']['output']>;
  filter_price_range?: Maybe<Scalars['Float']['output']>;
  /**
   * An ID that uniquely identifies the category.
   * @deprecated Use `uid` instead.
   */
  id?: Maybe<Scalars['Int']['output']>;
  image?: Maybe<Scalars['String']['output']>;
  include_in_menu?: Maybe<Scalars['Int']['output']>;
  is_anchor?: Maybe<Scalars['Int']['output']>;
  landing_page?: Maybe<Scalars['Int']['output']>;
  /** The depth of the category within the tree. */
  level?: Maybe<Scalars['Int']['output']>;
  meta_description?: Maybe<Scalars['String']['output']>;
  meta_keywords?: Maybe<Scalars['String']['output']>;
  meta_product_set_id?: Maybe<Scalars['String']['output']>;
  meta_title?: Maybe<Scalars['String']['output']>;
  /** The display name of the category. */
  name?: Maybe<Scalars['String']['output']>;
  /** The full category path. */
  path?: Maybe<Scalars['String']['output']>;
  /** The category path within the store. */
  path_in_store?: Maybe<Scalars['String']['output']>;
  /** The position of the category relative to other categories at the same level in tree. */
  position?: Maybe<Scalars['Int']['output']>;
  /** The number of products in the category that are marked as visible. By default, in complex products, parent products are visible, but their child products are not. */
  product_count?: Maybe<Scalars['Int']['output']>;
  /** The list of products assigned to the category. */
  products?: Maybe<Mage_CategoryProducts>;
  sync_to_facebook_catalog?: Maybe<Scalars['Int']['output']>;
  thumbnail?: Maybe<Scalars['String']['output']>;
  /** The unique ID for a `CategoryInterface` object. */
  uid: Scalars['ID']['output'];
  /**
   * The timestamp indicating when the category was updated.
   * @deprecated The field should not be used on the storefront.
   */
  updated_at?: Maybe<Scalars['String']['output']>;
  /** The URL key assigned to the category. */
  url_key?: Maybe<Scalars['String']['output']>;
  /** The URL path assigned to the category. */
  url_path?: Maybe<Scalars['String']['output']>;
  /** The part of the category URL that is appended after the url key */
  url_suffix?: Maybe<Scalars['String']['output']>;
};


/** Contains the full set of attributes that can be returned in a category search. */
export type Mage_CategoryInterfaceProductsArgs = {
  currentPage?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Mage_ProductAttributeSortInput>;
};

/** Contains details about the products assigned to a category. */
export type Mage_CategoryProducts = {
  __typename?: 'Mage_CategoryProducts';
  /** An array of products that are assigned to the category. */
  items?: Maybe<Array<Maybe<Mage_ProductInterface>>>;
  /** Pagination metadata. */
  page_info?: Maybe<Mage_SearchResultPageInfo>;
  /** The number of products in the category that are marked as visible. By default, in complex products, parent products are visible, but their child products are not. */
  total_count?: Maybe<Scalars['Int']['output']>;
};

/** Contains a collection of `CategoryTree` objects and pagination information. */
export type Mage_CategoryResult = {
  __typename?: 'Mage_CategoryResult';
  /** A list of categories that match the filter criteria. */
  items?: Maybe<Array<Maybe<Mage_CategoryTree>>>;
  /** An object that includes the `page_info` and `currentPage` values specified in the query. */
  page_info?: Maybe<Mage_SearchResultPageInfo>;
  /** The total number of categories that match the criteria. */
  total_count?: Maybe<Scalars['Int']['output']>;
};

/** Contains the hierarchy of categories. */
export type Mage_CategoryTree = Mage_CategoryInterface & Mage_RoutableInterface & {
  __typename?: 'Mage_CategoryTree';
  amtoolkit_robots?: Maybe<Scalars['String']['output']>;
  available_sort_by?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** An array of breadcrumb items. */
  breadcrumbs?: Maybe<Array<Maybe<Mage_Breadcrumb>>>;
  /** The relative canonical URL. This value is returned only if the system setting 'Use Canonical Link Meta Tag For Categories' is enabled. */
  canonical_url?: Maybe<Scalars['String']['output']>;
  category_code?: Maybe<Scalars['String']['output']>;
  /** A tree of child categories. */
  children?: Maybe<Array<Maybe<Mage_CategoryTree>>>;
  children_count?: Maybe<Scalars['String']['output']>;
  /** Contains a category CMS block. */
  cms_block?: Maybe<Mage_CmsBlock>;
  /**
   * The timestamp indicating when the category was created.
   * @deprecated The field should not be used on the storefront.
   */
  created_at?: Maybe<Scalars['String']['output']>;
  custom_layout_update_file?: Maybe<Scalars['String']['output']>;
  /** The attribute to use for sorting. */
  default_sort_by?: Maybe<Scalars['String']['output']>;
  /** An optional description of the category. */
  description?: Maybe<Scalars['String']['output']>;
  display_mode?: Maybe<Scalars['String']['output']>;
  filter_price_range?: Maybe<Scalars['Float']['output']>;
  /**
   * An ID that uniquely identifies the category.
   * @deprecated Use `uid` instead.
   */
  id?: Maybe<Scalars['Int']['output']>;
  image?: Maybe<Scalars['String']['output']>;
  include_in_menu?: Maybe<Scalars['Int']['output']>;
  is_anchor?: Maybe<Scalars['Int']['output']>;
  landing_page?: Maybe<Scalars['Int']['output']>;
  /** The depth of the category within the tree. */
  level?: Maybe<Scalars['Int']['output']>;
  meta_description?: Maybe<Scalars['String']['output']>;
  meta_keywords?: Maybe<Scalars['String']['output']>;
  meta_product_set_id?: Maybe<Scalars['String']['output']>;
  meta_title?: Maybe<Scalars['String']['output']>;
  /** The display name of the category. */
  name?: Maybe<Scalars['String']['output']>;
  /** The full category path. */
  path?: Maybe<Scalars['String']['output']>;
  /** The category path within the store. */
  path_in_store?: Maybe<Scalars['String']['output']>;
  /** The position of the category relative to other categories at the same level in tree. */
  position?: Maybe<Scalars['Int']['output']>;
  /** The number of products in the category that are marked as visible. By default, in complex products, parent products are visible, but their child products are not. */
  product_count?: Maybe<Scalars['Int']['output']>;
  /** The list of products assigned to the category. */
  products?: Maybe<Mage_CategoryProducts>;
  /** Contains 0 when there is no redirect error. A value of 301 indicates the URL of the requested resource has been changed permanently, while a value of 302 indicates a temporary redirect. */
  redirect_code: Scalars['Int']['output'];
  /** The internal relative URL. If the specified URL is a redirect, the query returns the redirected URL, not the original. */
  relative_url?: Maybe<Scalars['String']['output']>;
  sync_to_facebook_catalog?: Maybe<Scalars['Int']['output']>;
  thumbnail?: Maybe<Scalars['String']['output']>;
  /** One of PRODUCT, CATEGORY, or CMS_PAGE. */
  type?: Maybe<Mage_UrlRewriteEntityTypeEnum>;
  /** The unique ID for a `CategoryInterface` object. */
  uid: Scalars['ID']['output'];
  /**
   * The timestamp indicating when the category was updated.
   * @deprecated The field should not be used on the storefront.
   */
  updated_at?: Maybe<Scalars['String']['output']>;
  /** The URL key assigned to the category. */
  url_key?: Maybe<Scalars['String']['output']>;
  /** The URL path assigned to the category. */
  url_path?: Maybe<Scalars['String']['output']>;
  /** The part of the category URL that is appended after the url key */
  url_suffix?: Maybe<Scalars['String']['output']>;
};


/** Contains the hierarchy of categories. */
export type Mage_CategoryTreeProductsArgs = {
  currentPage?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Mage_ProductAttributeSortInput>;
};

/** Defines details about an individual checkout agreement. */
export type Mage_CheckoutAgreement = {
  __typename?: 'Mage_CheckoutAgreement';
  /** The ID for a checkout agreement. */
  agreement_id: Scalars['Int']['output'];
  /** The checkbox text for the checkout agreement. */
  checkbox_text: Scalars['String']['output'];
  /** Required. The text of the agreement. */
  content: Scalars['String']['output'];
  /** The height of the text box where the Terms and Conditions statement appears during checkout. */
  content_height?: Maybe<Scalars['String']['output']>;
  /** Indicates whether the `content` text is in HTML format. */
  is_html: Scalars['Boolean']['output'];
  /** Indicates whether agreements are accepted automatically or manually. */
  mode: Mage_CheckoutAgreementMode;
  /** The name given to the condition. */
  name: Scalars['String']['output'];
};

/** Indicates how agreements are accepted. */
export enum Mage_CheckoutAgreementMode {
  /** Conditions are automatically accepted upon checkout. */
  Auto = 'AUTO',
  /** Shoppers must manually accept the conditions to place an order. */
  Manual = 'MANUAL'
}

/** An error encountered while adding an item to the cart. */
export type Mage_CheckoutUserInputError = {
  __typename?: 'Mage_CheckoutUserInputError';
  /** An error code that is specific to Checkout. */
  code: Mage_CheckoutUserInputErrorCodes;
  /** A localized error message. */
  message: Scalars['String']['output'];
  /** The path to the input field that caused an error. See the GraphQL specification about path errors for details: http://spec.graphql.org/draft/#sec-Errors */
  path: Array<Maybe<Scalars['String']['output']>>;
};

export enum Mage_CheckoutUserInputErrorCodes {
  InsufficientStock = 'INSUFFICIENT_STOCK',
  NotSalable = 'NOT_SALABLE',
  ProductNotFound = 'PRODUCT_NOT_FOUND',
  ReorderNotAvailable = 'REORDER_NOT_AVAILABLE',
  Undefined = 'UNDEFINED'
}

/** Contains details about a specific CMS block. */
export type Mage_CmsBlock = {
  __typename?: 'Mage_CmsBlock';
  /** The content of the CMS block in raw HTML. */
  content?: Maybe<Scalars['String']['output']>;
  /** The CMS block identifier. */
  identifier?: Maybe<Scalars['String']['output']>;
  /** The title assigned to the CMS block. */
  title?: Maybe<Scalars['String']['output']>;
};

/** Contains an array CMS block items. */
export type Mage_CmsBlocks = {
  __typename?: 'Mage_CmsBlocks';
  /** An array of CMS blocks. */
  items?: Maybe<Array<Maybe<Mage_CmsBlock>>>;
};

/** Contains details about a CMS page. */
export type Mage_CmsPage = Mage_RoutableInterface & {
  __typename?: 'Mage_CmsPage';
  /** The content of the CMS page in raw HTML. */
  content?: Maybe<Scalars['String']['output']>;
  /** The heading that displays at the top of the CMS page. */
  content_heading?: Maybe<Scalars['String']['output']>;
  /** The ID of a CMS page. */
  identifier?: Maybe<Scalars['String']['output']>;
  /** A brief description of the page for search results listings. */
  meta_description?: Maybe<Scalars['String']['output']>;
  /** A brief description of the page for search results listings. */
  meta_keywords?: Maybe<Scalars['String']['output']>;
  /** A page title that is indexed by search engines and appears in search results listings. */
  meta_title?: Maybe<Scalars['String']['output']>;
  /** The design layout of the page, indicating the number of columns and navigation features used on the page. */
  page_layout?: Maybe<Scalars['String']['output']>;
  /** Contains 0 when there is no redirect error. A value of 301 indicates the URL of the requested resource has been changed permanently, while a value of 302 indicates a temporary redirect. */
  redirect_code: Scalars['Int']['output'];
  /** The internal relative URL. If the specified URL is a redirect, the query returns the redirected URL, not the original. */
  relative_url?: Maybe<Scalars['String']['output']>;
  /** The name that appears in the breadcrumb trail navigation and in the browser title bar and tab. */
  title?: Maybe<Scalars['String']['output']>;
  /** One of PRODUCT, CATEGORY, or CMS_PAGE. */
  type?: Maybe<Mage_UrlRewriteEntityTypeEnum>;
  /** The URL key of the CMS page, which is often based on the `content_heading`. */
  url_key?: Maybe<Scalars['String']['output']>;
};

export type Mage_ColorSwatchData = Mage_SwatchDataInterface & {
  __typename?: 'Mage_ColorSwatchData';
  /** The value can be represented as color (HEX code), image link, or text. */
  value?: Maybe<Scalars['String']['output']>;
};

/** Contains an attribute code that is used for product comparisons. */
export type Mage_ComparableAttribute = {
  __typename?: 'Mage_ComparableAttribute';
  /** An attribute code that is enabled for product comparisons. */
  code: Scalars['String']['output'];
  /** The label of the attribute code. */
  label: Scalars['String']['output'];
};

/** Defines an object used to iterate through items for product comparisons. */
export type Mage_ComparableItem = {
  __typename?: 'Mage_ComparableItem';
  /** An array of product attributes that can be used to compare products. */
  attributes: Array<Maybe<Mage_ProductAttribute>>;
  /** Details about a product in a compare list. */
  product: Mage_ProductInterface;
  /** The unique ID of an item in a compare list. */
  uid: Scalars['ID']['output'];
};

/** Contains iterable information such as the array of items, the count, and attributes that represent the compare list. */
export type Mage_CompareList = {
  __typename?: 'Mage_CompareList';
  /** An array of attributes that can be used for comparing products. */
  attributes?: Maybe<Array<Maybe<Mage_ComparableAttribute>>>;
  /** The number of items in the compare list. */
  item_count: Scalars['Int']['output'];
  /** An array of products to compare. */
  items?: Maybe<Array<Maybe<Mage_ComparableItem>>>;
  /** The unique ID assigned to the compare list. */
  uid: Scalars['ID']['output'];
};

/** Update the quote and complete the order */
export type Mage_CompleteOrderInput = {
  /** The customer cart ID */
  cartId: Scalars['String']['input'];
  /** PayPal order ID */
  id: Scalars['String']['input'];
};

export type Mage_ComplexTextValue = {
  __typename?: 'Mage_ComplexTextValue';
  /** Text that can contain HTML tags. */
  html: Scalars['String']['output'];
};

/** Contains details about a configurable product attribute option. */
export type Mage_ConfigurableAttributeOption = {
  __typename?: 'Mage_ConfigurableAttributeOption';
  /** The ID assigned to the attribute. */
  code?: Maybe<Scalars['String']['output']>;
  /** A string that describes the configurable attribute option. */
  label?: Maybe<Scalars['String']['output']>;
  /** The unique ID for a `ConfigurableAttributeOption` object. */
  uid: Scalars['ID']['output'];
  /** A unique index number assigned to the configurable product option. */
  value_index?: Maybe<Scalars['Int']['output']>;
};

/** An implementation for configurable product cart items. */
export type Mage_ConfigurableCartItem = Mage_CartItemInterface & {
  __typename?: 'Mage_ConfigurableCartItem';
  /** An array containing the configuranle options the shopper selected. */
  configurable_options: Array<Maybe<Mage_SelectedConfigurableOption>>;
  /** Product details of the cart item. */
  configured_variant: Mage_ProductInterface;
  /** An array containing the customizable options the shopper selected. */
  customizable_options: Array<Maybe<Mage_SelectedCustomizableOption>>;
  /** Errors assigned to this quote item */
  errors?: Maybe<Array<Maybe<Mage_CartItemError>>>;
  /** The entered gift message for the cart item */
  gift_message?: Maybe<Mage_GiftMessage>;
  /** @deprecated Use `uid` instead. */
  id: Scalars['String']['output'];
  /** True if requested quantity is less than available stock, false otherwise. */
  is_available: Scalars['Boolean']['output'];
  /** Message to display when the product is not available with this selected option. */
  not_available_message?: Maybe<Scalars['String']['output']>;
  /** Contains details about the price of the item, including taxes and discounts. */
  prices?: Maybe<Mage_CartItemPrices>;
  /** Details about an item in the cart. */
  product: Mage_ProductInterface;
  product_type: Scalars['String']['output'];
  /** The quantity of this item in the cart. */
  quantity: Scalars['Float']['output'];
  /** The unique ID for a `CartItemInterface` object. */
  uid: Scalars['ID']['output'];
};

/** Describes configurable options that have been selected and can be selected as a result of the previous selections. */
export type Mage_ConfigurableOptionAvailableForSelection = {
  __typename?: 'Mage_ConfigurableOptionAvailableForSelection';
  /** An attribute code that uniquely identifies a configurable option. */
  attribute_code: Scalars['String']['output'];
  /** An array of selectable option value IDs. */
  option_value_uids: Array<Maybe<Scalars['ID']['output']>>;
};

export type Mage_ConfigurableOrderItem = Mage_OrderItemInterface & {
  __typename?: 'Mage_ConfigurableOrderItem';
  /** The final discount information for the product. */
  discounts?: Maybe<Array<Maybe<Mage_Discount>>>;
  /** The entered option for the base product, such as a logo or image. */
  entered_options?: Maybe<Array<Maybe<Mage_OrderItemOption>>>;
  /** The selected gift message for the order item */
  gift_message?: Maybe<Mage_GiftMessage>;
  /** The unique ID for an `OrderItemInterface` object. */
  id: Scalars['ID']['output'];
  /** The SKU of parent product. */
  parent_sku?: Maybe<Scalars['String']['output']>;
  /** Contains details about the price of the item, including taxes and discounts. */
  prices?: Maybe<Mage_OrderItemPrices>;
  /** The ProductInterface object, which contains details about the base product */
  product?: Maybe<Mage_ProductInterface>;
  /** The name of the base product. */
  product_name?: Maybe<Scalars['String']['output']>;
  /** The sale price of the base product, including selected options. */
  product_sale_price: Mage_Money;
  /** The SKU of the base product. */
  product_sku: Scalars['String']['output'];
  /** The type of product, such as simple, configurable, etc. */
  product_type?: Maybe<Scalars['String']['output']>;
  /** URL key of the base product. */
  product_url_key?: Maybe<Scalars['String']['output']>;
  /** The number of canceled items. */
  quantity_canceled?: Maybe<Scalars['Float']['output']>;
  /** The number of invoiced items. */
  quantity_invoiced?: Maybe<Scalars['Float']['output']>;
  /** The number of units ordered for this item. */
  quantity_ordered?: Maybe<Scalars['Float']['output']>;
  /** The number of refunded items. */
  quantity_refunded?: Maybe<Scalars['Float']['output']>;
  /** The number of returned items. */
  quantity_returned?: Maybe<Scalars['Float']['output']>;
  /** The number of shipped items. */
  quantity_shipped?: Maybe<Scalars['Float']['output']>;
  /** The selected options for the base product, such as color or size. */
  selected_options?: Maybe<Array<Maybe<Mage_OrderItemOption>>>;
  /** The status of the order item. */
  status?: Maybe<Scalars['String']['output']>;
};

/** Defines basic features of a configurable product and its simple product variants. */
export type Mage_ConfigurableProduct = Mage_CustomizableProductInterface & Mage_PhysicalProductInterface & Mage_ProductInterface & Mage_RoutableInterface & {
  __typename?: 'Mage_ConfigurableProduct';
  /** @deprecated Use the `custom_attributes` field instead. */
  activity?: Maybe<Scalars['String']['output']>;
  /**
   * The attribute set assigned to the product.
   * @deprecated The field should not be used on the storefront.
   */
  attribute_set_id?: Maybe<Scalars['Int']['output']>;
  /** The relative canonical URL. This value is returned only if the system setting 'Use Canonical Link Meta Tag For Products' is enabled. */
  canonical_url?: Maybe<Scalars['String']['output']>;
  /** The categories assigned to a product. */
  categories?: Maybe<Array<Maybe<Mage_CategoryInterface>>>;
  /** @deprecated Use the `custom_attributes` field instead. */
  category_gear?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  climate?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  collar?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  color?: Maybe<Scalars['Int']['output']>;
  /** An array of options for the configurable product. */
  configurable_options?: Maybe<Array<Maybe<Mage_ConfigurableProductOptions>>>;
  /** An array of media gallery items and other details about selected configurable product options as well as details about remaining selectable options. */
  configurable_product_options_selection?: Maybe<Mage_ConfigurableProductOptionsSelection>;
  /** The product's country of origin. */
  country_of_manufacture?: Maybe<Scalars['String']['output']>;
  /**
   * Timestamp indicating when the product was created.
   * @deprecated The field should not be used on the storefront.
   */
  created_at?: Maybe<Scalars['String']['output']>;
  /** Crosssell Products */
  crosssell_products?: Maybe<Array<Maybe<Mage_ProductInterface>>>;
  /** Product custom attributes. */
  custom_attributesV2?: Maybe<Mage_ProductCustomAttributes>;
  /** Detailed information about the product. The value can include simple HTML tags. */
  description?: Maybe<Mage_ComplexTextValue>;
  /** @deprecated Use the `custom_attributes` field instead. */
  eco_collection?: Maybe<Scalars['Int']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  erin_recommends?: Maybe<Scalars['Int']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  features_bags?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  format?: Maybe<Scalars['Int']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  gender?: Maybe<Scalars['String']['output']>;
  /** Returns a value indicating gift message availability for the product. */
  gift_message_available: Scalars['Boolean']['output'];
  /**
   * The ID number assigned to the product.
   * @deprecated Use the `uid` field instead.
   */
  id?: Maybe<Scalars['Int']['output']>;
  /** The relative path to the main image on the product page. */
  image?: Maybe<Mage_ProductImage>;
  /** @deprecated Use the `custom_attributes` field instead. */
  is_seller_product?: Maybe<Scalars['Int']['output']>;
  /**
   * A number representing the product's manufacturer.
   * @deprecated Use the `custom_attributes` field instead.
   */
  manufacturer?: Maybe<Scalars['Int']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  material?: Maybe<Scalars['String']['output']>;
  /** Maximum Qty Allowed in Shopping Cart */
  max_sale_qty?: Maybe<Scalars['Float']['output']>;
  /** An array of media gallery objects. */
  media_gallery?: Maybe<Array<Maybe<Mage_MediaGalleryInterface>>>;
  /**
   * An array of MediaGalleryEntry objects.
   * @deprecated Use `media_gallery` instead.
   */
  media_gallery_entries?: Maybe<Array<Maybe<Mage_MediaGalleryEntry>>>;
  /** A brief overview of the product for search results listings, maximum 255 characters. */
  meta_description?: Maybe<Scalars['String']['output']>;
  /** A comma-separated list of keywords that are visible only to search engines. */
  meta_keyword?: Maybe<Scalars['String']['output']>;
  /** A string that is displayed in the title bar and tab of the browser and in search results lists. */
  meta_title?: Maybe<Scalars['String']['output']>;
  /** Minimum Qty Allowed in Shopping Cart */
  min_sale_qty?: Maybe<Scalars['Float']['output']>;
  /** The product name. Customers use this name to identify the product. */
  name?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  new?: Maybe<Scalars['Int']['output']>;
  /** The beginning date for new product listings, and determines if the product is featured as a new product. */
  new_from_date?: Maybe<Scalars['String']['output']>;
  /** The end date for new product listings. */
  new_to_date?: Maybe<Scalars['String']['output']>;
  /** Product stock only x left count */
  only_x_left_in_stock?: Maybe<Scalars['Float']['output']>;
  /** An array of options for a customizable product. */
  options?: Maybe<Array<Maybe<Mage_CustomizableOptionInterface>>>;
  /** If the product has multiple options, determines where they appear on the product page. */
  options_container?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  pattern?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  performance_fabric?: Maybe<Scalars['Int']['output']>;
  /**
   * Indicates the price of an item.
   * @deprecated Use `price_range` for product price information.
   */
  price?: Maybe<Mage_ProductPrices>;
  /** The range of prices for the product */
  price_range: Mage_PriceRange;
  /** An array of `TierPrice` objects. */
  price_tiers?: Maybe<Array<Maybe<Mage_TierPrice>>>;
  /** An array of `ProductLinks` objects. */
  product_links?: Maybe<Array<Maybe<Mage_ProductLinksInterface>>>;
  /** Amount of available stock */
  quantity?: Maybe<Scalars['Float']['output']>;
  /** The average of all the ratings given to the product. */
  rating_summary: Scalars['Float']['output'];
  /** Contains 0 when there is no redirect error. A value of 301 indicates the URL of the requested resource has been changed permanently, while a value of 302 indicates a temporary redirect. */
  redirect_code: Scalars['Int']['output'];
  /** An array of products to be displayed in a Related Products block. */
  related_products?: Maybe<Array<Maybe<Mage_ProductInterface>>>;
  /** The internal relative URL. If the specified URL is a redirect, the query returns the redirected URL, not the original. */
  relative_url?: Maybe<Scalars['String']['output']>;
  /** The total count of all the reviews given to the product. */
  review_count: Scalars['Int']['output'];
  /** The list of products reviews. */
  reviews: Mage_ProductReviews;
  /** @deprecated Use the `custom_attributes` field instead. */
  sale?: Maybe<Scalars['Int']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  seller_id?: Maybe<Scalars['Int']['output']>;
  /** A short description of the product. Its use depends on the theme. */
  short_description?: Maybe<Mage_ComplexTextValue>;
  /** @deprecated Use the `custom_attributes` field instead. */
  size?: Maybe<Scalars['Int']['output']>;
  /** A number or code assigned to a product to identify the product, options, price, and manufacturer. */
  sku?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  sleeve?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  sm_featured?: Maybe<Scalars['Int']['output']>;
  /** The relative path to the small image, which is used on catalog pages. */
  small_image?: Maybe<Mage_ProductImage>;
  /**
   * The beginning date that a product has a special price.
   * @deprecated The field should not be used on the storefront.
   */
  special_from_date?: Maybe<Scalars['String']['output']>;
  /** The discounted price of the product. */
  special_price?: Maybe<Scalars['Float']['output']>;
  /** The end date for a product with a special price. */
  special_to_date?: Maybe<Scalars['String']['output']>;
  /** The status assigned to the product, 0 for disabled, 1 for enabled. */
  status?: Maybe<Scalars['Int']['output']>;
  /** Stock status of the product */
  stock_status?: Maybe<Mage_ProductStockStatus>;
  /** @deprecated Use the `custom_attributes` field instead. */
  strap_bags?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  style_bags?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  style_bottom?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  style_general?: Maybe<Scalars['String']['output']>;
  /** The file name of a swatch image. */
  swatch_image?: Maybe<Scalars['String']['output']>;
  /** The relative path to the product's thumbnail image. */
  thumbnail?: Maybe<Mage_ProductImage>;
  /**
   * The price when tier pricing is in effect and the items purchased threshold has been reached.
   * @deprecated Use `price_tiers` for product tier price information.
   */
  tier_price?: Maybe<Scalars['Float']['output']>;
  /**
   * An array of ProductTierPrices objects.
   * @deprecated Use `price_tiers` for product tier price information.
   */
  tier_prices?: Maybe<Array<Maybe<Mage_ProductTierPrices>>>;
  /** One of PRODUCT, CATEGORY, or CMS_PAGE. */
  type?: Maybe<Mage_UrlRewriteEntityTypeEnum>;
  /**
   * One of simple, virtual, bundle, downloadable, grouped, or configurable.
   * @deprecated Use `__typename` instead.
   */
  type_id?: Maybe<Scalars['String']['output']>;
  /** The unique ID for a `ProductInterface` object. */
  uid: Scalars['ID']['output'];
  /**
   * Timestamp indicating when the product was updated.
   * @deprecated The field should not be used on the storefront.
   */
  updated_at?: Maybe<Scalars['String']['output']>;
  /** Upsell Products */
  upsell_products?: Maybe<Array<Maybe<Mage_ProductInterface>>>;
  /** The part of the URL that identifies the product */
  url_key?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use product's `canonical_url` or url rewrites instead */
  url_path?: Maybe<Scalars['String']['output']>;
  /** URL rewrites list */
  url_rewrites?: Maybe<Array<Maybe<Mage_UrlRewrite>>>;
  /** The part of the product URL that is appended after the url key */
  url_suffix?: Maybe<Scalars['String']['output']>;
  /** An array of simple product variants. */
  variants?: Maybe<Array<Maybe<Mage_ConfigurableVariant>>>;
  /** The visibility assigned to the product. */
  visibility?: Maybe<Scalars['Int']['output']>;
  /**
   * An array of websites in which the product is available.
   * @deprecated The field should not be used on the storefront.
   */
  websites?: Maybe<Array<Maybe<Mage_Website>>>;
  /** The weight of the item, in units defined by the store. */
  weight?: Maybe<Scalars['Float']['output']>;
};


/** Defines basic features of a configurable product and its simple product variants. */
export type Mage_ConfigurableProductConfigurable_Product_Options_SelectionArgs = {
  configurableOptionValueUids?: InputMaybe<Array<Scalars['ID']['input']>>;
};


/** Defines basic features of a configurable product and its simple product variants. */
export type Mage_ConfigurableProductCustom_AttributesV2Args = {
  filters?: InputMaybe<Mage_AttributeFilterInput>;
};


/** Defines basic features of a configurable product and its simple product variants. */
export type Mage_ConfigurableProductReviewsArgs = {
  currentPage?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
};

export type Mage_ConfigurableProductCartItemInput = {
  /** The ID and value of the option. */
  customizable_options?: InputMaybe<Array<InputMaybe<Mage_CustomizableOptionInput>>>;
  /** The quantity and SKU of the configurable product. */
  data: Mage_CartItemInput;
  /** The SKU of the parent configurable product. */
  parent_sku?: InputMaybe<Scalars['String']['input']>;
  variant_sku?: InputMaybe<Scalars['String']['input']>;
};

/** Contains details about configurable product options. */
export type Mage_ConfigurableProductOption = {
  __typename?: 'Mage_ConfigurableProductOption';
  /** An attribute code that uniquely identifies a configurable option. */
  attribute_code: Scalars['String']['output'];
  /** The display name of the option. */
  label: Scalars['String']['output'];
  /** The unique ID of the configurable option. */
  uid: Scalars['ID']['output'];
  /** An array of values that are applicable for this option. */
  values?: Maybe<Array<Maybe<Mage_ConfigurableProductOptionValue>>>;
};

/** Defines a value for a configurable product option. */
export type Mage_ConfigurableProductOptionValue = {
  __typename?: 'Mage_ConfigurableProductOptionValue';
  /** Indicates whether the product is available with this selected option. */
  is_available: Scalars['Boolean']['output'];
  /** Indicates whether the value is the default. */
  is_use_default: Scalars['Boolean']['output'];
  /** The display name of the value. */
  label: Scalars['String']['output'];
  /** The URL assigned to the thumbnail of the swatch image. */
  swatch?: Maybe<Mage_SwatchDataInterface>;
  /** The unique ID of the value. */
  uid: Scalars['ID']['output'];
};

/** Defines configurable attributes for the specified product. */
export type Mage_ConfigurableProductOptions = {
  __typename?: 'Mage_ConfigurableProductOptions';
  /** A string that identifies the attribute. */
  attribute_code?: Maybe<Scalars['String']['output']>;
  /**
   * The ID assigned to the attribute.
   * @deprecated Use `attribute_uid` instead.
   */
  attribute_id?: Maybe<Scalars['String']['output']>;
  /**
   * The ID assigned to the attribute.
   * @deprecated Use `attribute_uid` instead.
   */
  attribute_id_v2?: Maybe<Scalars['Int']['output']>;
  /** The unique ID for an `Attribute` object. */
  attribute_uid: Scalars['ID']['output'];
  /**
   * The configurable option ID number assigned by the system.
   * @deprecated Use `uid` instead.
   */
  id?: Maybe<Scalars['Int']['output']>;
  /** A displayed string that describes the configurable product option. */
  label?: Maybe<Scalars['String']['output']>;
  /** A number that indicates the order in which the attribute is displayed. */
  position?: Maybe<Scalars['Int']['output']>;
  /**
   * This is the same as a product's `id` field.
   * @deprecated `product_id` is not needed and can be obtained from its parent.
   */
  product_id?: Maybe<Scalars['Int']['output']>;
  /** The unique ID for a `ConfigurableProductOptions` object. */
  uid: Scalars['ID']['output'];
  /** Indicates whether the option is the default. */
  use_default?: Maybe<Scalars['Boolean']['output']>;
  /** An array that defines the `value_index` codes assigned to the configurable product. */
  values?: Maybe<Array<Maybe<Mage_ConfigurableProductOptionsValues>>>;
};

/** Contains metadata corresponding to the selected configurable options. */
export type Mage_ConfigurableProductOptionsSelection = {
  __typename?: 'Mage_ConfigurableProductOptionsSelection';
  /** An array of all possible configurable options. */
  configurable_options?: Maybe<Array<Maybe<Mage_ConfigurableProductOption>>>;
  /** Product images and videos corresponding to the specified configurable options selection. */
  media_gallery?: Maybe<Array<Maybe<Mage_MediaGalleryInterface>>>;
  /** The configurable options available for further selection based on the current selection. */
  options_available_for_selection?: Maybe<Array<Maybe<Mage_ConfigurableOptionAvailableForSelection>>>;
  /** A variant represented by the specified configurable options selection. The value is expected to be null until selections are made for each configurable option. */
  variant?: Maybe<Mage_SimpleProduct>;
};

/** Contains the index number assigned to a configurable product option. */
export type Mage_ConfigurableProductOptionsValues = {
  __typename?: 'Mage_ConfigurableProductOptionsValues';
  /** The label of the product on the default store. */
  default_label?: Maybe<Scalars['String']['output']>;
  /** The label of the product. */
  label?: Maybe<Scalars['String']['output']>;
  /** The label of the product on the current store. */
  store_label?: Maybe<Scalars['String']['output']>;
  /** Swatch data for a configurable product option. */
  swatch_data?: Maybe<Mage_SwatchDataInterface>;
  /** The unique ID for a `ConfigurableProductOptionsValues` object. */
  uid?: Maybe<Scalars['ID']['output']>;
  /** Indicates whether to use the default_label. */
  use_default_value?: Maybe<Scalars['Boolean']['output']>;
  /**
   * A unique index number assigned to the configurable product option.
   * @deprecated Use `uid` instead.
   */
  value_index?: Maybe<Scalars['Int']['output']>;
};

/** Contains all the simple product variants of a configurable product. */
export type Mage_ConfigurableVariant = {
  __typename?: 'Mage_ConfigurableVariant';
  /** An array of configurable attribute options. */
  attributes?: Maybe<Array<Maybe<Mage_ConfigurableAttributeOption>>>;
  /** An array of linked simple products. */
  product?: Maybe<Mage_SimpleProduct>;
};

/** A configurable product wish list item. */
export type Mage_ConfigurableWishlistItem = Mage_WishlistItemInterface & {
  __typename?: 'Mage_ConfigurableWishlistItem';
  /** The date and time the item was added to the wish list. */
  added_at: Scalars['String']['output'];
  /**
   * The SKU of the simple product corresponding to a set of selected configurable options.
   * @deprecated Use `ConfigurableWishlistItem.configured_variant.sku` instead.
   */
  child_sku: Scalars['String']['output'];
  /** An array of selected configurable options. */
  configurable_options?: Maybe<Array<Maybe<Mage_SelectedConfigurableOption>>>;
  /** Product details of the selected variant. The value is null if some options are not configured. */
  configured_variant?: Maybe<Mage_ProductInterface>;
  /** Custom options selected for the wish list item. */
  customizable_options: Array<Maybe<Mage_SelectedCustomizableOption>>;
  /** The description of the item. */
  description?: Maybe<Scalars['String']['output']>;
  /** The unique ID for a `WishlistItemInterface` object. */
  id: Scalars['ID']['output'];
  /** Product details of the wish list item. */
  product?: Maybe<Mage_ProductInterface>;
  /** The quantity of this wish list item. */
  quantity: Scalars['Float']['output'];
};

export type Mage_ConfirmCancelOrderInput = {
  /** Confirmation Key to cancel the order. */
  confirmation_key: Scalars['String']['input'];
  /** The unique ID of an `Order` type. */
  order_id: Scalars['ID']['input'];
};

/** Contains details about a customer email address to confirm. */
export type Mage_ConfirmEmailInput = {
  /** The key to confirm the email address. */
  confirmation_key: Scalars['String']['input'];
  /** The email address to be confirmed. */
  email: Scalars['String']['input'];
};

/** List of account confirmation statuses. */
export enum Mage_ConfirmationStatusEnum {
  /** Account confirmation not required */
  AccountConfirmationNotRequired = 'ACCOUNT_CONFIRMATION_NOT_REQUIRED',
  /** Account confirmed */
  AccountConfirmed = 'ACCOUNT_CONFIRMED'
}

export type Mage_ContactUsInput = {
  /** The shopper's comment to the merchant. */
  comment: Scalars['String']['input'];
  /** The email address of the shopper. */
  email: Scalars['String']['input'];
  /** The full name of the shopper. */
  name: Scalars['String']['input'];
  /** The shopper's telephone number. */
  telephone?: InputMaybe<Scalars['String']['input']>;
};

/** Contains the status of the request. */
export type Mage_ContactUsOutput = {
  __typename?: 'Mage_ContactUsOutput';
  /** Indicates whether the request was successful. */
  status: Scalars['Boolean']['output'];
};

export type Mage_Country = {
  __typename?: 'Mage_Country';
  /** An array of regions within a particular country. */
  available_regions?: Maybe<Array<Maybe<Mage_Region>>>;
  /** The name of the country in English. */
  full_name_english?: Maybe<Scalars['String']['output']>;
  /** The name of the country in the current locale. */
  full_name_locale?: Maybe<Scalars['String']['output']>;
  /** The unique ID for a `Country` object. */
  id?: Maybe<Scalars['String']['output']>;
  /** The three-letter abbreviation of the country, such as USA. */
  three_letter_abbreviation?: Maybe<Scalars['String']['output']>;
  /** The two-letter abbreviation of the country, such as US. */
  two_letter_abbreviation?: Maybe<Scalars['String']['output']>;
};

/** The list of country codes. */
export enum Mage_CountryCodeEnum {
  /** Andorra */
  Ad = 'AD',
  /** United Arab Emirates */
  Ae = 'AE',
  /** Afghanistan */
  Af = 'AF',
  /** Antigua & Barbuda */
  Ag = 'AG',
  /** Anguilla */
  Ai = 'AI',
  /** Albania */
  Al = 'AL',
  /** Armenia */
  Am = 'AM',
  /** Netherlands Antilles */
  An = 'AN',
  /** Angola */
  Ao = 'AO',
  /** Antarctica */
  Aq = 'AQ',
  /** Argentina */
  Ar = 'AR',
  /** American Samoa */
  As = 'AS',
  /** Austria */
  At = 'AT',
  /** Australia */
  Au = 'AU',
  /** Aruba */
  Aw = 'AW',
  /** Åland Islands */
  Ax = 'AX',
  /** Azerbaijan */
  Az = 'AZ',
  /** Bosnia & Herzegovina */
  Ba = 'BA',
  /** Barbados */
  Bb = 'BB',
  /** Bangladesh */
  Bd = 'BD',
  /** Belgium */
  Be = 'BE',
  /** Burkina Faso */
  Bf = 'BF',
  /** Bulgaria */
  Bg = 'BG',
  /** Bahrain */
  Bh = 'BH',
  /** Burundi */
  Bi = 'BI',
  /** Benin */
  Bj = 'BJ',
  /** St. Barthélemy */
  Bl = 'BL',
  /** Bermuda */
  Bm = 'BM',
  /** Brunei */
  Bn = 'BN',
  /** Bolivia */
  Bo = 'BO',
  /** Brazil */
  Br = 'BR',
  /** Bahamas */
  Bs = 'BS',
  /** Bhutan */
  Bt = 'BT',
  /** Bouvet Island */
  Bv = 'BV',
  /** Botswana */
  Bw = 'BW',
  /** Belarus */
  By = 'BY',
  /** Belize */
  Bz = 'BZ',
  /** Canada */
  Ca = 'CA',
  /** Cocos (Keeling) Islands */
  Cc = 'CC',
  /** Congo-Kinshasa */
  Cd = 'CD',
  /** Central African Republic */
  Cf = 'CF',
  /** Congo-Brazzaville */
  Cg = 'CG',
  /** Switzerland */
  Ch = 'CH',
  /** Côte d’Ivoire */
  Ci = 'CI',
  /** Cook Islands */
  Ck = 'CK',
  /** Chile */
  Cl = 'CL',
  /** Cameroon */
  Cm = 'CM',
  /** China */
  Cn = 'CN',
  /** Colombia */
  Co = 'CO',
  /** Costa Rica */
  Cr = 'CR',
  /** Cuba */
  Cu = 'CU',
  /** Cape Verde */
  Cv = 'CV',
  /** Christmas Island */
  Cx = 'CX',
  /** Cyprus */
  Cy = 'CY',
  /** Czech Republic */
  Cz = 'CZ',
  /** Germany */
  De = 'DE',
  /** Djibouti */
  Dj = 'DJ',
  /** Denmark */
  Dk = 'DK',
  /** Dominica */
  Dm = 'DM',
  /** Dominican Republic */
  Do = 'DO',
  /** Algeria */
  Dz = 'DZ',
  /** Ecuador */
  Ec = 'EC',
  /** Estonia */
  Ee = 'EE',
  /** Egypt */
  Eg = 'EG',
  /** Western Sahara */
  Eh = 'EH',
  /** Eritrea */
  Er = 'ER',
  /** Spain */
  Es = 'ES',
  /** Ethiopia */
  Et = 'ET',
  /** Finland */
  Fi = 'FI',
  /** Fiji */
  Fj = 'FJ',
  /** Falkland Islands */
  Fk = 'FK',
  /** Micronesia */
  Fm = 'FM',
  /** Faroe Islands */
  Fo = 'FO',
  /** France */
  Fr = 'FR',
  /** Gabon */
  Ga = 'GA',
  /** United Kingdom */
  Gb = 'GB',
  /** Grenada */
  Gd = 'GD',
  /** Georgia */
  Ge = 'GE',
  /** French Guiana */
  Gf = 'GF',
  /** Guernsey */
  Gg = 'GG',
  /** Ghana */
  Gh = 'GH',
  /** Gibraltar */
  Gi = 'GI',
  /** Greenland */
  Gl = 'GL',
  /** Gambia */
  Gm = 'GM',
  /** Guinea */
  Gn = 'GN',
  /** Guadeloupe */
  Gp = 'GP',
  /** Equatorial Guinea */
  Gq = 'GQ',
  /** Greece */
  Gr = 'GR',
  /** South Georgia & South Sandwich Islands */
  Gs = 'GS',
  /** Guatemala */
  Gt = 'GT',
  /** Guam */
  Gu = 'GU',
  /** Guinea-Bissau */
  Gw = 'GW',
  /** Guyana */
  Gy = 'GY',
  /** Hong Kong SAR China */
  Hk = 'HK',
  /** Heard &amp; McDonald Islands */
  Hm = 'HM',
  /** Honduras */
  Hn = 'HN',
  /** Croatia */
  Hr = 'HR',
  /** Haiti */
  Ht = 'HT',
  /** Hungary */
  Hu = 'HU',
  /** Indonesia */
  Id = 'ID',
  /** Ireland */
  Ie = 'IE',
  /** Israel */
  Il = 'IL',
  /** Isle of Man */
  Im = 'IM',
  /** India */
  In = 'IN',
  /** British Indian Ocean Territory */
  Io = 'IO',
  /** Iraq */
  Iq = 'IQ',
  /** Iran */
  Ir = 'IR',
  /** Iceland */
  Is = 'IS',
  /** Italy */
  It = 'IT',
  /** Jersey */
  Je = 'JE',
  /** Jamaica */
  Jm = 'JM',
  /** Jordan */
  Jo = 'JO',
  /** Japan */
  Jp = 'JP',
  /** Kenya */
  Ke = 'KE',
  /** Kyrgyzstan */
  Kg = 'KG',
  /** Cambodia */
  Kh = 'KH',
  /** Kiribati */
  Ki = 'KI',
  /** Comoros */
  Km = 'KM',
  /** St. Kitts & Nevis */
  Kn = 'KN',
  /** North Korea */
  Kp = 'KP',
  /** South Korea */
  Kr = 'KR',
  /** Kuwait */
  Kw = 'KW',
  /** Cayman Islands */
  Ky = 'KY',
  /** Kazakhstan */
  Kz = 'KZ',
  /** Laos */
  La = 'LA',
  /** Lebanon */
  Lb = 'LB',
  /** St. Lucia */
  Lc = 'LC',
  /** Liechtenstein */
  Li = 'LI',
  /** Sri Lanka */
  Lk = 'LK',
  /** Liberia */
  Lr = 'LR',
  /** Lesotho */
  Ls = 'LS',
  /** Lithuania */
  Lt = 'LT',
  /** Luxembourg */
  Lu = 'LU',
  /** Latvia */
  Lv = 'LV',
  /** Libya */
  Ly = 'LY',
  /** Morocco */
  Ma = 'MA',
  /** Monaco */
  Mc = 'MC',
  /** Moldova */
  Md = 'MD',
  /** Montenegro */
  Me = 'ME',
  /** St. Martin */
  Mf = 'MF',
  /** Madagascar */
  Mg = 'MG',
  /** Marshall Islands */
  Mh = 'MH',
  /** Macedonia */
  Mk = 'MK',
  /** Mali */
  Ml = 'ML',
  /** Myanmar (Burma) */
  Mm = 'MM',
  /** Mongolia */
  Mn = 'MN',
  /** Macau SAR China */
  Mo = 'MO',
  /** Northern Mariana Islands */
  Mp = 'MP',
  /** Martinique */
  Mq = 'MQ',
  /** Mauritania */
  Mr = 'MR',
  /** Montserrat */
  Ms = 'MS',
  /** Malta */
  Mt = 'MT',
  /** Mauritius */
  Mu = 'MU',
  /** Maldives */
  Mv = 'MV',
  /** Malawi */
  Mw = 'MW',
  /** Mexico */
  Mx = 'MX',
  /** Malaysia */
  My = 'MY',
  /** Mozambique */
  Mz = 'MZ',
  /** Namibia */
  Na = 'NA',
  /** New Caledonia */
  Nc = 'NC',
  /** Niger */
  Ne = 'NE',
  /** Norfolk Island */
  Nf = 'NF',
  /** Nigeria */
  Ng = 'NG',
  /** Nicaragua */
  Ni = 'NI',
  /** Netherlands */
  Nl = 'NL',
  /** Norway */
  No = 'NO',
  /** Nepal */
  Np = 'NP',
  /** Nauru */
  Nr = 'NR',
  /** Niue */
  Nu = 'NU',
  /** New Zealand */
  Nz = 'NZ',
  /** Oman */
  Om = 'OM',
  /** Panama */
  Pa = 'PA',
  /** Peru */
  Pe = 'PE',
  /** French Polynesia */
  Pf = 'PF',
  /** Papua New Guinea */
  Pg = 'PG',
  /** Philippines */
  Ph = 'PH',
  /** Pakistan */
  Pk = 'PK',
  /** Poland */
  Pl = 'PL',
  /** St. Pierre & Miquelon */
  Pm = 'PM',
  /** Pitcairn Islands */
  Pn = 'PN',
  /** Palestinian Territories */
  Ps = 'PS',
  /** Portugal */
  Pt = 'PT',
  /** Palau */
  Pw = 'PW',
  /** Paraguay */
  Py = 'PY',
  /** Qatar */
  Qa = 'QA',
  /** Réunion */
  Re = 'RE',
  /** Romania */
  Ro = 'RO',
  /** Serbia */
  Rs = 'RS',
  /** Russia */
  Ru = 'RU',
  /** Rwanda */
  Rw = 'RW',
  /** Saudi Arabia */
  Sa = 'SA',
  /** Solomon Islands */
  Sb = 'SB',
  /** Seychelles */
  Sc = 'SC',
  /** Sudan */
  Sd = 'SD',
  /** Sweden */
  Se = 'SE',
  /** Singapore */
  Sg = 'SG',
  /** St. Helena */
  Sh = 'SH',
  /** Slovenia */
  Si = 'SI',
  /** Svalbard & Jan Mayen */
  Sj = 'SJ',
  /** Slovakia */
  Sk = 'SK',
  /** Sierra Leone */
  Sl = 'SL',
  /** San Marino */
  Sm = 'SM',
  /** Senegal */
  Sn = 'SN',
  /** Somalia */
  So = 'SO',
  /** Suriname */
  Sr = 'SR',
  /** São Tomé & Príncipe */
  St = 'ST',
  /** El Salvador */
  Sv = 'SV',
  /** Syria */
  Sy = 'SY',
  /** Eswatini */
  Sz = 'SZ',
  /** Turks & Caicos Islands */
  Tc = 'TC',
  /** Chad */
  Td = 'TD',
  /** French Southern Territories */
  Tf = 'TF',
  /** Togo */
  Tg = 'TG',
  /** Thailand */
  Th = 'TH',
  /** Tajikistan */
  Tj = 'TJ',
  /** Tokelau */
  Tk = 'TK',
  /** Timor-Leste */
  Tl = 'TL',
  /** Turkmenistan */
  Tm = 'TM',
  /** Tunisia */
  Tn = 'TN',
  /** Tonga */
  To = 'TO',
  /** Turkey */
  Tr = 'TR',
  /** Trinidad & Tobago */
  Tt = 'TT',
  /** Tuvalu */
  Tv = 'TV',
  /** Taiwan */
  Tw = 'TW',
  /** Tanzania */
  Tz = 'TZ',
  /** Ukraine */
  Ua = 'UA',
  /** Uganda */
  Ug = 'UG',
  /** U.S. Outlying Islands */
  Um = 'UM',
  /** United States */
  Us = 'US',
  /** Uruguay */
  Uy = 'UY',
  /** Uzbekistan */
  Uz = 'UZ',
  /** Vatican City */
  Va = 'VA',
  /** St. Vincent & Grenadines */
  Vc = 'VC',
  /** Venezuela */
  Ve = 'VE',
  /** British Virgin Islands */
  Vg = 'VG',
  /** U.S. Virgin Islands */
  Vi = 'VI',
  /** Vietnam */
  Vn = 'VN',
  /** Vanuatu */
  Vu = 'VU',
  /** Wallis & Futuna */
  Wf = 'WF',
  /** Samoa */
  Ws = 'WS',
  /** Yemen */
  Ye = 'YE',
  /** Mayotte */
  Yt = 'YT',
  /** South Africa */
  Za = 'ZA',
  /** Zambia */
  Zm = 'ZM',
  /** Zimbabwe */
  Zw = 'ZW'
}

/** Contains an array of product IDs to use for creating a compare list. */
export type Mage_CreateCompareListInput = {
  /** An array of product IDs to add to the compare list. */
  products?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};

export type Mage_CreateGuestCartInput = {
  /** Optional client-generated ID */
  cart_uid?: InputMaybe<Scalars['ID']['input']>;
};

export type Mage_CreateGuestCartOutput = {
  __typename?: 'Mage_CreateGuestCartOutput';
  /** The newly created cart. */
  cart?: Maybe<Mage_Cart>;
};

/** Contains the secure information used to authorize transaction. Applies to Payflow Pro and Payments Pro payment methods. */
export type Mage_CreatePayflowProTokenOutput = {
  __typename?: 'Mage_CreatePayflowProTokenOutput';
  /** The RESPMSG returned by PayPal. If the `result` is `0`, then `response_message` is `Approved`. */
  response_message: Scalars['String']['output'];
  /** A non-zero value if any errors occurred. */
  result: Scalars['Int']['output'];
  /** The RESULT returned by PayPal. A value of `0` indicates the transaction was approved. */
  result_code: Scalars['Int']['output'];
  /** A secure token generated by PayPal. */
  secure_token: Scalars['String']['output'];
  /** A secure token ID generated by PayPal. */
  secure_token_id: Scalars['String']['output'];
};

/** Contains payment order details that are used while processing the payment order */
export type Mage_CreatePaymentOrderInput = {
  /** The customer cart ID */
  cartId: Scalars['String']['input'];
  /** Defines the origin location for that payment request */
  location: Mage_PaymentLocation;
  /** The code for the payment method used in the order */
  methodCode: Scalars['String']['input'];
  /** The identifiable payment source for the payment method */
  paymentSource: Scalars['String']['input'];
  /** Indicates whether the payment information should be vaulted */
  vaultIntent?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Contains payment order details that are used while processing the payment order */
export type Mage_CreatePaymentOrderOutput = {
  __typename?: 'Mage_CreatePaymentOrderOutput';
  /** The amount of the payment order */
  amount?: Maybe<Scalars['Float']['output']>;
  /** The currency of the payment order */
  currency_code?: Maybe<Scalars['String']['output']>;
  /** PayPal order ID */
  id?: Maybe<Scalars['String']['output']>;
  /** The order ID generated by Payment Services */
  mp_order_id?: Maybe<Scalars['String']['output']>;
  /** The status of the payment order */
  status?: Maybe<Scalars['String']['output']>;
};

/** Defines a new product review. */
export type Mage_CreateProductReviewInput = {
  /** The customer's nickname. Defaults to the customer name, if logged in. */
  nickname: Scalars['String']['input'];
  /** The ratings details by category. For example, Price: 5 stars, Quality: 4 stars, etc. */
  ratings: Array<InputMaybe<Mage_ProductReviewRatingInput>>;
  /** The SKU of the reviewed product. */
  sku: Scalars['String']['input'];
  /** The summary (title) of the review. */
  summary: Scalars['String']['input'];
  /** The review text. */
  text: Scalars['String']['input'];
};

/** Contains the completed product review. */
export type Mage_CreateProductReviewOutput = {
  __typename?: 'Mage_CreateProductReviewOutput';
  /** Product review details. */
  review: Mage_ProductReview;
};

/** Describe the variables needed to create a vault payment token */
export type Mage_CreateVaultCardPaymentTokenInput = {
  /** Description of the vaulted card */
  card_description?: InputMaybe<Scalars['String']['input']>;
  /** The setup token obtained by the createVaultCardSetupToken endpoint */
  setup_token_id: Scalars['String']['input'];
};

/** The vault token id and information about the payment source */
export type Mage_CreateVaultCardPaymentTokenOutput = {
  __typename?: 'Mage_CreateVaultCardPaymentTokenOutput';
  /** The payment source information */
  payment_source: Mage_PaymentSourceOutput;
  /** The vault payment token information */
  vault_token_id: Scalars['String']['output'];
};

/** Describe the variables needed to create a vault card setup token */
export type Mage_CreateVaultCardSetupTokenInput = {
  /** The setup token information */
  setup_token: Mage_VaultSetupTokenInput;
  /** The 3DS mode */
  three_ds_mode?: InputMaybe<Mage_ThreeDsMode>;
};

/** The setup token id information */
export type Mage_CreateVaultCardSetupTokenOutput = {
  __typename?: 'Mage_CreateVaultCardSetupTokenOutput';
  /** The setup token id */
  setup_token: Scalars['String']['output'];
};

/** Required fields for Payflow Pro and Payments Pro credit card payments. */
export type Mage_CreditCardDetailsInput = {
  /** The credit card expiration month. */
  cc_exp_month: Scalars['Int']['input'];
  /** The credit card expiration year. */
  cc_exp_year: Scalars['Int']['input'];
  /** The last 4 digits of the credit card. */
  cc_last_4: Scalars['Int']['input'];
  /** The credit card type. */
  cc_type: Scalars['String']['input'];
};

/** Contains credit memo details. */
export type Mage_CreditMemo = {
  __typename?: 'Mage_CreditMemo';
  /** Comments on the credit memo. */
  comments?: Maybe<Array<Maybe<Mage_SalesCommentItem>>>;
  /** The unique ID for a `CreditMemo` object. */
  id: Scalars['ID']['output'];
  /** An array containing details about refunded items. */
  items?: Maybe<Array<Maybe<Mage_CreditMemoItemInterface>>>;
  /** The sequential credit memo number. */
  number: Scalars['String']['output'];
  /** Details about the total refunded amount. */
  total?: Maybe<Mage_CreditMemoTotal>;
};

export type Mage_CreditMemoItem = Mage_CreditMemoItemInterface & {
  __typename?: 'Mage_CreditMemoItem';
  /** Details about the final discount amount for the base product, including discounts on options. */
  discounts?: Maybe<Array<Maybe<Mage_Discount>>>;
  /** The unique ID for a `CreditMemoItemInterface` object. */
  id: Scalars['ID']['output'];
  /** The order item the credit memo is applied to. */
  order_item?: Maybe<Mage_OrderItemInterface>;
  /** The name of the base product. */
  product_name?: Maybe<Scalars['String']['output']>;
  /** The sale price for the base product, including selected options. */
  product_sale_price: Mage_Money;
  /** The SKU of the base product. */
  product_sku: Scalars['String']['output'];
  /** The number of refunded items. */
  quantity_refunded?: Maybe<Scalars['Float']['output']>;
};

/** Credit memo item details. */
export type Mage_CreditMemoItemInterface = {
  /** Details about the final discount amount for the base product, including discounts on options. */
  discounts?: Maybe<Array<Maybe<Mage_Discount>>>;
  /** The unique ID for a `CreditMemoItemInterface` object. */
  id: Scalars['ID']['output'];
  /** The order item the credit memo is applied to. */
  order_item?: Maybe<Mage_OrderItemInterface>;
  /** The name of the base product. */
  product_name?: Maybe<Scalars['String']['output']>;
  /** The sale price for the base product, including selected options. */
  product_sale_price: Mage_Money;
  /** The SKU of the base product. */
  product_sku: Scalars['String']['output'];
  /** The number of refunded items. */
  quantity_refunded?: Maybe<Scalars['Float']['output']>;
};

/** Contains credit memo price details. */
export type Mage_CreditMemoTotal = {
  __typename?: 'Mage_CreditMemoTotal';
  /** An adjustment manually applied to the order. */
  adjustment: Mage_Money;
  /** The final base grand total amount in the base currency. */
  base_grand_total: Mage_Money;
  /** The applied discounts to the credit memo. */
  discounts?: Maybe<Array<Maybe<Mage_Discount>>>;
  /** The final total amount, including shipping, discounts, and taxes. */
  grand_total: Mage_Money;
  /** Details about the shipping and handling costs for the credit memo. */
  shipping_handling?: Maybe<Mage_ShippingHandling>;
  /** The subtotal of the invoice, excluding shipping, discounts, and taxes. */
  subtotal: Mage_Money;
  /** The credit memo tax details. */
  taxes?: Maybe<Array<Maybe<Mage_TaxItem>>>;
  /** The shipping amount for the credit memo. */
  total_shipping: Mage_Money;
  /** The amount of tax applied to the credit memo. */
  total_tax: Mage_Money;
};

export type Mage_Currency = {
  __typename?: 'Mage_Currency';
  /** An array of three-letter currency codes accepted by the store, such as USD and EUR. */
  available_currency_codes?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** The base currency set for the store, such as USD. */
  base_currency_code?: Maybe<Scalars['String']['output']>;
  /** The symbol for the specified base currency, such as $. */
  base_currency_symbol?: Maybe<Scalars['String']['output']>;
  /** @deprecated Symbol was missed. Use `default_display_currency_code`. */
  default_display_currecy_code?: Maybe<Scalars['String']['output']>;
  /** @deprecated Symbol was missed. Use `default_display_currency_code`. */
  default_display_currecy_symbol?: Maybe<Scalars['String']['output']>;
  /** The currency that is displayed by default, such as USD. */
  default_display_currency_code?: Maybe<Scalars['String']['output']>;
  /** The currency symbol that is displayed by default, such as $. */
  default_display_currency_symbol?: Maybe<Scalars['String']['output']>;
  /** An array of exchange rates for currencies defined in the store. */
  exchange_rates?: Maybe<Array<Maybe<Mage_ExchangeRate>>>;
};

/** The list of available currency codes. */
export enum Mage_CurrencyEnum {
  Aed = 'AED',
  Afn = 'AFN',
  All = 'ALL',
  Amd = 'AMD',
  Ang = 'ANG',
  Aoa = 'AOA',
  Ars = 'ARS',
  Aud = 'AUD',
  Awg = 'AWG',
  Azm = 'AZM',
  Azn = 'AZN',
  Bam = 'BAM',
  Bbd = 'BBD',
  Bdt = 'BDT',
  Bgn = 'BGN',
  Bhd = 'BHD',
  Bif = 'BIF',
  Bmd = 'BMD',
  Bnd = 'BND',
  Bob = 'BOB',
  Brl = 'BRL',
  Bsd = 'BSD',
  Btn = 'BTN',
  Buk = 'BUK',
  Bwp = 'BWP',
  Byn = 'BYN',
  Bzd = 'BZD',
  Cad = 'CAD',
  Cdf = 'CDF',
  Che = 'CHE',
  Chf = 'CHF',
  Chw = 'CHW',
  Clp = 'CLP',
  Cny = 'CNY',
  Cop = 'COP',
  Crc = 'CRC',
  Cup = 'CUP',
  Cve = 'CVE',
  Czk = 'CZK',
  Djf = 'DJF',
  Dkk = 'DKK',
  Dop = 'DOP',
  Dzd = 'DZD',
  Eek = 'EEK',
  Egp = 'EGP',
  Ern = 'ERN',
  Etb = 'ETB',
  Eur = 'EUR',
  Fjd = 'FJD',
  Fkp = 'FKP',
  Gbp = 'GBP',
  Gek = 'GEK',
  Gel = 'GEL',
  Ghs = 'GHS',
  Gip = 'GIP',
  Gmd = 'GMD',
  Gnf = 'GNF',
  Gqe = 'GQE',
  Gtq = 'GTQ',
  Gyd = 'GYD',
  Hkd = 'HKD',
  Hnl = 'HNL',
  Hrk = 'HRK',
  Htg = 'HTG',
  Huf = 'HUF',
  Idr = 'IDR',
  Ils = 'ILS',
  Inr = 'INR',
  Iqd = 'IQD',
  Irr = 'IRR',
  Isk = 'ISK',
  Jmd = 'JMD',
  Jod = 'JOD',
  Jpy = 'JPY',
  Kes = 'KES',
  Kgs = 'KGS',
  Khr = 'KHR',
  Kmf = 'KMF',
  Kpw = 'KPW',
  Krw = 'KRW',
  Kwd = 'KWD',
  Kyd = 'KYD',
  Kzt = 'KZT',
  Lak = 'LAK',
  Lbp = 'LBP',
  Lkr = 'LKR',
  Lrd = 'LRD',
  Lsl = 'LSL',
  Lsm = 'LSM',
  Ltl = 'LTL',
  Lvl = 'LVL',
  Lyd = 'LYD',
  Mad = 'MAD',
  Mdl = 'MDL',
  Mga = 'MGA',
  Mkd = 'MKD',
  Mmk = 'MMK',
  Mnt = 'MNT',
  Mop = 'MOP',
  Mro = 'MRO',
  Mur = 'MUR',
  Mvr = 'MVR',
  Mwk = 'MWK',
  Mxn = 'MXN',
  Myr = 'MYR',
  Mzn = 'MZN',
  Nad = 'NAD',
  Ngn = 'NGN',
  Nic = 'NIC',
  Nok = 'NOK',
  Npr = 'NPR',
  Nzd = 'NZD',
  Omr = 'OMR',
  Pab = 'PAB',
  Pen = 'PEN',
  Pgk = 'PGK',
  Php = 'PHP',
  Pkr = 'PKR',
  Pln = 'PLN',
  Pyg = 'PYG',
  Qar = 'QAR',
  Rhd = 'RHD',
  Rol = 'ROL',
  Ron = 'RON',
  Rsd = 'RSD',
  Rub = 'RUB',
  Rwf = 'RWF',
  Sar = 'SAR',
  Sbd = 'SBD',
  Scr = 'SCR',
  Sdg = 'SDG',
  Sek = 'SEK',
  Sgd = 'SGD',
  Shp = 'SHP',
  Skk = 'SKK',
  Sll = 'SLL',
  Sos = 'SOS',
  Srd = 'SRD',
  Std = 'STD',
  Svc = 'SVC',
  Syp = 'SYP',
  Szl = 'SZL',
  Thb = 'THB',
  Tjs = 'TJS',
  Tmm = 'TMM',
  Tnd = 'TND',
  Top = 'TOP',
  Trl = 'TRL',
  Try = 'TRY',
  Ttd = 'TTD',
  Twd = 'TWD',
  Tzs = 'TZS',
  Uah = 'UAH',
  Ugx = 'UGX',
  Usd = 'USD',
  Uyu = 'UYU',
  Uzs = 'UZS',
  Veb = 'VEB',
  Vef = 'VEF',
  Vnd = 'VND',
  Vuv = 'VUV',
  Wst = 'WST',
  Xcd = 'XCD',
  Xof = 'XOF',
  Xpf = 'XPF',
  Yer = 'YER',
  Ytl = 'YTL',
  Zar = 'ZAR',
  Zmk = 'ZMK',
  Zwd = 'ZWD'
}

/** Defines an array of custom attributes. */
export type Mage_CustomAttributeMetadata = {
  __typename?: 'Mage_CustomAttributeMetadata';
  /** An array of attributes. */
  items?: Maybe<Array<Maybe<Mage_Attribute>>>;
};

/** An interface containing fields that define the EAV attribute. */
export type Mage_CustomAttributeMetadataInterface = {
  /** The unique identifier for an attribute code. This value should be in lowercase letters without spaces. */
  code: Scalars['ID']['output'];
  /** Default attribute value. */
  default_value?: Maybe<Scalars['String']['output']>;
  /** The type of entity that defines the attribute. */
  entity_type: Mage_AttributeEntityTypeEnum;
  /** The frontend class of the attribute. */
  frontend_class?: Maybe<Scalars['String']['output']>;
  /** The frontend input type of the attribute. */
  frontend_input?: Maybe<Mage_AttributeFrontendInputEnum>;
  /** Whether the attribute value is required. */
  is_required: Scalars['Boolean']['output'];
  /** Whether the attribute value must be unique. */
  is_unique: Scalars['Boolean']['output'];
  /** The label assigned to the attribute. */
  label?: Maybe<Scalars['String']['output']>;
  /** Attribute options. */
  options: Array<Maybe<Mage_CustomAttributeOptionInterface>>;
};

export type Mage_CustomAttributeOptionInterface = {
  /** Is the option value default. */
  is_default: Scalars['Boolean']['output'];
  /** The label assigned to the attribute option. */
  label: Scalars['String']['output'];
  /** The attribute option value. */
  value: Scalars['String']['output'];
};

/** Defines the customer name, addresses, and other details. */
export type Mage_Customer = {
  __typename?: 'Mage_Customer';
  /** An array containing the customer's shipping and billing addresses. */
  addresses?: Maybe<Array<Maybe<Mage_CustomerAddress>>>;
  /** An array containing the customer's shipping and billing addresses. */
  addressesV2?: Maybe<Mage_CustomerAddresses>;
  /** Indicates whether the customer has enabled remote shopping assistance. */
  allow_remote_shopping_assistance: Scalars['Boolean']['output'];
  /** The contents of the customer's compare list. */
  compare_list?: Maybe<Mage_CompareList>;
  /** The customer's confirmation status. */
  confirmation_status: Mage_ConfirmationStatusEnum;
  /** Timestamp indicating when the account was created. */
  created_at?: Maybe<Scalars['String']['output']>;
  /** Customer's custom attributes. */
  custom_attributes?: Maybe<Array<Maybe<Mage_AttributeValueInterface>>>;
  /** The customer's date of birth. */
  date_of_birth?: Maybe<Scalars['String']['output']>;
  /** The ID assigned to the billing address. */
  default_billing?: Maybe<Scalars['String']['output']>;
  /** The ID assigned to the shipping address. */
  default_shipping?: Maybe<Scalars['String']['output']>;
  /**
   * The customer's date of birth.
   * @deprecated Use `date_of_birth` instead.
   */
  dob?: Maybe<Scalars['String']['output']>;
  /** The customer's email address. Required. */
  email?: Maybe<Scalars['String']['output']>;
  /** The customer's first name. */
  firstname?: Maybe<Scalars['String']['output']>;
  /** The customer's gender (Male - 1, Female - 2). */
  gender?: Maybe<Scalars['Int']['output']>;
  /** @deprecated Customer group should not be exposed in the storefront scenarios. */
  group_id?: Maybe<Scalars['Int']['output']>;
  /**
   * The ID assigned to the customer.
   * @deprecated `id` is not needed as part of `Customer`, because on the server side, it can be identified based on the customer token used for authentication. There is no need to know customer ID on the client side.
   */
  id?: Maybe<Scalars['Int']['output']>;
  /** Indicates whether the customer is subscribed to the company's newsletter. */
  is_subscribed?: Maybe<Scalars['Boolean']['output']>;
  /** The customer's family name. */
  lastname?: Maybe<Scalars['String']['output']>;
  /** The customer's middle name. */
  middlename?: Maybe<Scalars['String']['output']>;
  orders?: Maybe<Mage_CustomerOrders>;
  /** An honorific, such as Dr., Mr., or Mrs. */
  prefix?: Maybe<Scalars['String']['output']>;
  /** Contains the customer's product reviews. */
  reviews: Mage_ProductReviews;
  /** A value such as Sr., Jr., or III. */
  suffix?: Maybe<Scalars['String']['output']>;
  /** The customer's Value-added tax (VAT) number (for corporate customers). */
  taxvat?: Maybe<Scalars['String']['output']>;
  /**
   * Return a customer's wish lists.
   * @deprecated Use `Customer.wishlists` or `Customer.wishlist_v2` instead.
   */
  wishlist: Mage_Wishlist;
  /** Retrieve the wish list identified by the unique ID for a `Wishlist` object. */
  wishlist_v2?: Maybe<Mage_Wishlist>;
  /** An array of wishlists. In Magento Open Source, customers are limited to one wish list. The number of wish lists is configurable for Adobe Commerce. */
  wishlists: Array<Maybe<Mage_Wishlist>>;
};


/** Defines the customer name, addresses, and other details. */
export type Mage_CustomerAddressesV2Args = {
  currentPage?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
};


/** Defines the customer name, addresses, and other details. */
export type Mage_CustomerCustom_AttributesArgs = {
  attributeCodes?: InputMaybe<Array<Scalars['ID']['input']>>;
};


/** Defines the customer name, addresses, and other details. */
export type Mage_CustomerOrdersArgs = {
  currentPage?: InputMaybe<Scalars['Int']['input']>;
  filter?: InputMaybe<Mage_CustomerOrdersFilterInput>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  scope?: InputMaybe<Mage_ScopeTypeEnum>;
  sort?: InputMaybe<Mage_CustomerOrderSortInput>;
};


/** Defines the customer name, addresses, and other details. */
export type Mage_CustomerReviewsArgs = {
  currentPage?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
};


/** Defines the customer name, addresses, and other details. */
export type Mage_CustomerWishlist_V2Args = {
  id: Scalars['ID']['input'];
};


/** Defines the customer name, addresses, and other details. */
export type Mage_CustomerWishlistsArgs = {
  currentPage?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
};

/** Contains detailed information about a customer's billing or shipping address. */
export type Mage_CustomerAddress = {
  __typename?: 'Mage_CustomerAddress';
  /** The customer's city or town. */
  city?: Maybe<Scalars['String']['output']>;
  /** The customer's company. */
  company?: Maybe<Scalars['String']['output']>;
  /** The customer's country. */
  country_code?: Maybe<Mage_CountryCodeEnum>;
  /**
   * The customer's country.
   * @deprecated Use `country_code` instead.
   */
  country_id?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use custom_attributesV2 instead. */
  custom_attributes?: Maybe<Array<Maybe<Mage_CustomerAddressAttribute>>>;
  /** Custom attributes assigned to the customer address. */
  custom_attributesV2: Array<Maybe<Mage_AttributeValueInterface>>;
  /**
   * The customer ID
   * @deprecated `customer_id` is not needed as part of `CustomerAddress`. The `id` is a unique identifier for the addresses.
   */
  customer_id?: Maybe<Scalars['Int']['output']>;
  /** Indicates whether the address is the customer's default billing address. */
  default_billing?: Maybe<Scalars['Boolean']['output']>;
  /** Indicates whether the address is the customer's default shipping address. */
  default_shipping?: Maybe<Scalars['Boolean']['output']>;
  /** Contains any extension attributes for the address. */
  extension_attributes?: Maybe<Array<Maybe<Mage_CustomerAddressAttribute>>>;
  /** The customer's fax number. */
  fax?: Maybe<Scalars['String']['output']>;
  /** The first name of the person associated with the shipping/billing address. */
  firstname?: Maybe<Scalars['String']['output']>;
  /** The ID of a `CustomerAddress` object. */
  id?: Maybe<Scalars['Int']['output']>;
  /** The family name of the person associated with the shipping/billing address. */
  lastname?: Maybe<Scalars['String']['output']>;
  /** The middle name of the person associated with the shipping/billing address. */
  middlename?: Maybe<Scalars['String']['output']>;
  /** The customer's ZIP or postal code. */
  postcode?: Maybe<Scalars['String']['output']>;
  /** An honorific, such as Dr., Mr., or Mrs. */
  prefix?: Maybe<Scalars['String']['output']>;
  /** An object containing the region name, region code, and region ID. */
  region?: Maybe<Mage_CustomerAddressRegion>;
  /** The unique ID for a pre-defined region. */
  region_id?: Maybe<Scalars['Int']['output']>;
  /** An array of strings that define the street number and name. */
  street?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** A value such as Sr., Jr., or III. */
  suffix?: Maybe<Scalars['String']['output']>;
  /** The customer's telephone number. */
  telephone?: Maybe<Scalars['String']['output']>;
  /** The customer's Value-added tax (VAT) number (for corporate customers). */
  vat_id?: Maybe<Scalars['String']['output']>;
};


/** Contains detailed information about a customer's billing or shipping address. */
export type Mage_CustomerAddressCustom_AttributesV2Args = {
  attributeCodes?: InputMaybe<Array<Scalars['ID']['input']>>;
};

/** Specifies the attribute code and value of a customer address attribute. */
export type Mage_CustomerAddressAttribute = {
  __typename?: 'Mage_CustomerAddressAttribute';
  /** The name assigned to the customer address attribute. */
  attribute_code?: Maybe<Scalars['String']['output']>;
  /** The value assigned to the customer address attribute. */
  value?: Maybe<Scalars['String']['output']>;
};

/** Specifies the attribute code and value of a customer attribute. */
export type Mage_CustomerAddressAttributeInput = {
  /** The name assigned to the attribute. */
  attribute_code: Scalars['String']['input'];
  /** The value assigned to the attribute. */
  value: Scalars['String']['input'];
};

/** Contains details about a billing or shipping address. */
export type Mage_CustomerAddressInput = {
  /** The customer's city or town. */
  city?: InputMaybe<Scalars['String']['input']>;
  /** The customer's company. */
  company?: InputMaybe<Scalars['String']['input']>;
  /** The two-letter code representing the customer's country. */
  country_code?: InputMaybe<Mage_CountryCodeEnum>;
  country_id?: InputMaybe<Mage_CountryCodeEnum>;
  custom_attributes?: InputMaybe<Array<InputMaybe<Mage_CustomerAddressAttributeInput>>>;
  /** Custom attributes assigned to the customer address. */
  custom_attributesV2?: InputMaybe<Array<InputMaybe<Mage_AttributeValueInput>>>;
  /** Indicates whether the address is the default billing address. */
  default_billing?: InputMaybe<Scalars['Boolean']['input']>;
  /** Indicates whether the address is the default shipping address. */
  default_shipping?: InputMaybe<Scalars['Boolean']['input']>;
  /** The customer's fax number. */
  fax?: InputMaybe<Scalars['String']['input']>;
  /** The first name of the person associated with the billing/shipping address. */
  firstname?: InputMaybe<Scalars['String']['input']>;
  /** The family name of the person associated with the billing/shipping address. */
  lastname?: InputMaybe<Scalars['String']['input']>;
  /** The middle name of the person associated with the billing/shipping address. */
  middlename?: InputMaybe<Scalars['String']['input']>;
  /** The customer's ZIP or postal code. */
  postcode?: InputMaybe<Scalars['String']['input']>;
  /** An honorific, such as Dr., Mr., or Mrs. */
  prefix?: InputMaybe<Scalars['String']['input']>;
  /** An object containing the region name, region code, and region ID. */
  region?: InputMaybe<Mage_CustomerAddressRegionInput>;
  /** An array of strings that define the street number and name. */
  street?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** A value such as Sr., Jr., or III. */
  suffix?: InputMaybe<Scalars['String']['input']>;
  /** The customer's telephone number. */
  telephone?: InputMaybe<Scalars['String']['input']>;
  /** The customer's Tax/VAT number (for corporate customers). */
  vat_id?: InputMaybe<Scalars['String']['input']>;
};

/** Defines the customer's state or province. */
export type Mage_CustomerAddressRegion = {
  __typename?: 'Mage_CustomerAddressRegion';
  /** The state or province name. */
  region?: Maybe<Scalars['String']['output']>;
  /** The address region code. */
  region_code?: Maybe<Scalars['String']['output']>;
  /** The unique ID for a pre-defined region. */
  region_id?: Maybe<Scalars['Int']['output']>;
};

/** Defines the customer's state or province. */
export type Mage_CustomerAddressRegionInput = {
  /** The state or province name. */
  region?: InputMaybe<Scalars['String']['input']>;
  /** The address region code. */
  region_code?: InputMaybe<Scalars['String']['input']>;
  /** The unique ID for a pre-defined region. */
  region_id?: InputMaybe<Scalars['Int']['input']>;
};

export type Mage_CustomerAddresses = {
  __typename?: 'Mage_CustomerAddresses';
  /** An array containing the customer's shipping and billing addresses. */
  items?: Maybe<Array<Maybe<Mage_CustomerAddress>>>;
  /** Contains pagination metadata. */
  page_info?: Maybe<Mage_SearchResultPageInfo>;
  /** The total count of customer addresses. */
  total_count?: Maybe<Scalars['Int']['output']>;
};

/** Customer attribute metadata. */
export type Mage_CustomerAttributeMetadata = Mage_CustomAttributeMetadataInterface & {
  __typename?: 'Mage_CustomerAttributeMetadata';
  /** The unique identifier for an attribute code. This value should be in lowercase letters without spaces. */
  code: Scalars['ID']['output'];
  /** Default attribute value. */
  default_value?: Maybe<Scalars['String']['output']>;
  /** The type of entity that defines the attribute. */
  entity_type: Mage_AttributeEntityTypeEnum;
  /** The frontend class of the attribute. */
  frontend_class?: Maybe<Scalars['String']['output']>;
  /** The frontend input type of the attribute. */
  frontend_input?: Maybe<Mage_AttributeFrontendInputEnum>;
  /** The template used for the input of the attribute (e.g., 'date'). */
  input_filter?: Maybe<Mage_InputFilterEnum>;
  /** Whether the attribute value is required. */
  is_required: Scalars['Boolean']['output'];
  /** Whether the attribute value must be unique. */
  is_unique: Scalars['Boolean']['output'];
  /** The label assigned to the attribute. */
  label?: Maybe<Scalars['String']['output']>;
  /** The number of lines of the attribute value. */
  multiline_count?: Maybe<Scalars['Int']['output']>;
  /** Attribute options. */
  options: Array<Maybe<Mage_CustomAttributeOptionInterface>>;
  /** The position of the attribute in the form. */
  sort_order?: Maybe<Scalars['Int']['output']>;
  /** The validation rules of the attribute value. */
  validate_rules?: Maybe<Array<Maybe<Mage_ValidationRule>>>;
};

/** An input object for creating a customer. */
export type Mage_CustomerCreateInput = {
  /** Indicates whether the customer has enabled remote shopping assistance. */
  allow_remote_shopping_assistance?: InputMaybe<Scalars['Boolean']['input']>;
  /** The customer's custom attributes. */
  custom_attributes?: InputMaybe<Array<InputMaybe<Mage_AttributeValueInput>>>;
  /** The customer's date of birth. */
  date_of_birth?: InputMaybe<Scalars['String']['input']>;
  dob?: InputMaybe<Scalars['String']['input']>;
  /** The customer's email address. */
  email: Scalars['String']['input'];
  /** The customer's first name. */
  firstname: Scalars['String']['input'];
  /** The customer's gender (Male - 1, Female - 2). */
  gender?: InputMaybe<Scalars['Int']['input']>;
  /** Indicates whether the customer is subscribed to the company's newsletter. */
  is_subscribed?: InputMaybe<Scalars['Boolean']['input']>;
  /** The customer's family name. */
  lastname: Scalars['String']['input'];
  /** The customer's middle name. */
  middlename?: InputMaybe<Scalars['String']['input']>;
  /** The customer's password. */
  password?: InputMaybe<Scalars['String']['input']>;
  /** An honorific, such as Dr., Mr., or Mrs. */
  prefix?: InputMaybe<Scalars['String']['input']>;
  /** A value such as Sr., Jr., or III. */
  suffix?: InputMaybe<Scalars['String']['input']>;
  /** The customer's Tax/VAT number (for corporate customers). */
  taxvat?: InputMaybe<Scalars['String']['input']>;
};

/** Contains details about a single downloadable product. */
export type Mage_CustomerDownloadableProduct = {
  __typename?: 'Mage_CustomerDownloadableProduct';
  /** The date and time the purchase was made. */
  date?: Maybe<Scalars['String']['output']>;
  /** The fully qualified URL to the download file. */
  download_url?: Maybe<Scalars['String']['output']>;
  /** The unique ID assigned to the item. */
  order_increment_id?: Maybe<Scalars['String']['output']>;
  /** The remaining number of times the customer can download the product. */
  remaining_downloads?: Maybe<Scalars['String']['output']>;
  /** Indicates when the product becomes available for download. Options are `Pending` and `Invoiced`. */
  status?: Maybe<Scalars['String']['output']>;
};

/** Contains a list of downloadable products. */
export type Mage_CustomerDownloadableProducts = {
  __typename?: 'Mage_CustomerDownloadableProducts';
  /** An array of purchased downloadable items. */
  items?: Maybe<Array<Maybe<Mage_CustomerDownloadableProduct>>>;
};

/** An input object that assigns or updates customer attributes. */
export type Mage_CustomerInput = {
  /** The customer's date of birth. */
  date_of_birth?: InputMaybe<Scalars['String']['input']>;
  dob?: InputMaybe<Scalars['String']['input']>;
  /** The customer's email address. Required when creating a customer. */
  email?: InputMaybe<Scalars['String']['input']>;
  /** The customer's first name. */
  firstname?: InputMaybe<Scalars['String']['input']>;
  /** The customer's gender (Male - 1, Female - 2). */
  gender?: InputMaybe<Scalars['Int']['input']>;
  /** Indicates whether the customer is subscribed to the company's newsletter. */
  is_subscribed?: InputMaybe<Scalars['Boolean']['input']>;
  /** The customer's family name. */
  lastname?: InputMaybe<Scalars['String']['input']>;
  /** The customer's middle name. */
  middlename?: InputMaybe<Scalars['String']['input']>;
  /** The customer's password. */
  password?: InputMaybe<Scalars['String']['input']>;
  /** An honorific, such as Dr., Mr., or Mrs. */
  prefix?: InputMaybe<Scalars['String']['input']>;
  /** A value such as Sr., Jr., or III. */
  suffix?: InputMaybe<Scalars['String']['input']>;
  /** The customer's Tax/VAT number (for corporate customers). */
  taxvat?: InputMaybe<Scalars['String']['input']>;
};

/** Contains details about each of the customer's orders. */
export type Mage_CustomerOrder = {
  __typename?: 'Mage_CustomerOrder';
  /** Coupons applied to the order. */
  applied_coupons: Array<Maybe<Mage_AppliedCoupon>>;
  /** List of available order actions. */
  available_actions: Array<Maybe<Mage_OrderActionType>>;
  /** The billing address for the order. */
  billing_address?: Maybe<Mage_OrderAddress>;
  /** The shipping carrier for the order delivery. */
  carrier?: Maybe<Scalars['String']['output']>;
  /** Comments about the order. */
  comments?: Maybe<Array<Maybe<Mage_SalesCommentItem>>>;
  /** @deprecated Use the `order_date` field instead. */
  created_at?: Maybe<Scalars['String']['output']>;
  /** A list of credit memos. */
  credit_memos?: Maybe<Array<Maybe<Mage_CreditMemo>>>;
  /** Returns customer information from order. */
  customer_info: Mage_OrderCustomerInfo;
  /** Order customer email. */
  email?: Maybe<Scalars['String']['output']>;
  /** The entered gift message for the order */
  gift_message?: Maybe<Mage_GiftMessage>;
  /** @deprecated Use the `totals.grand_total` field instead. */
  grand_total?: Maybe<Scalars['Float']['output']>;
  /** The unique ID for a `CustomerOrder` object. */
  id: Scalars['ID']['output'];
  /** @deprecated Use the `id` field instead. */
  increment_id?: Maybe<Scalars['String']['output']>;
  /** A list of invoices for the order. */
  invoices: Array<Maybe<Mage_Invoice>>;
  /** `TRUE` if the order is virtual */
  is_virtual: Scalars['Boolean']['output'];
  /** An array containing the items purchased in this order. */
  items?: Maybe<Array<Maybe<Mage_OrderItemInterface>>>;
  /** The order number. */
  number: Scalars['String']['output'];
  /** The date the order was placed. */
  order_date: Scalars['String']['output'];
  /** @deprecated Use the `number` field instead. */
  order_number: Scalars['String']['output'];
  /** The date the order status was last updated. */
  order_status_change_date: Scalars['String']['output'];
  /** Payment details for the order. */
  payment_methods?: Maybe<Array<Maybe<Mage_OrderPaymentMethod>>>;
  /** A list of shipments for the order. */
  shipments?: Maybe<Array<Maybe<Mage_OrderShipment>>>;
  /** The shipping address for the order. */
  shipping_address?: Maybe<Mage_OrderAddress>;
  /** The delivery method for the order. */
  shipping_method?: Maybe<Scalars['String']['output']>;
  /** The current status of the order. */
  status: Scalars['String']['output'];
  /** The token that can be used to retrieve the order using order query. */
  token: Scalars['String']['output'];
  /** Details about the calculated totals for this order. */
  total?: Maybe<Mage_OrderTotal>;
};

/** CustomerOrderSortInput specifies the field to use for sorting search results and indicates whether the results are sorted in ascending or descending order. */
export type Mage_CustomerOrderSortInput = {
  /** This enumeration indicates whether to return results in ascending or descending order */
  sort_direction: Mage_SortEnum;
  /** Specifies the field to use for sorting */
  sort_field: Mage_CustomerOrderSortableField;
};

/** Specifies the field to use for sorting */
export enum Mage_CustomerOrderSortableField {
  /** Sorts customer orders by created_at field */
  CreatedAt = 'CREATED_AT',
  /** Sorts customer orders by number */
  Number = 'NUMBER'
}

/** The collection of orders that match the conditions defined in the filter. */
export type Mage_CustomerOrders = {
  __typename?: 'Mage_CustomerOrders';
  /** Date of the first order placed in the store */
  date_of_first_order?: Maybe<Scalars['String']['output']>;
  /** An array of customer orders. */
  items: Array<Maybe<Mage_CustomerOrder>>;
  /** Contains pagination metadata. */
  page_info?: Maybe<Mage_SearchResultPageInfo>;
  /** The total count of customer orders. */
  total_count?: Maybe<Scalars['Int']['output']>;
};

/** Identifies the filter to use for filtering orders. */
export type Mage_CustomerOrdersFilterInput = {
  /** Filters by order base grand total value. */
  grand_total?: InputMaybe<Mage_FilterRangeTypeInput>;
  /** Filters by order number. */
  number?: InputMaybe<Mage_FilterStringTypeInput>;
  /** Filters by order created_at time. */
  order_date?: InputMaybe<Mage_FilterRangeTypeInput>;
  /** Filters by order status. */
  status?: InputMaybe<Mage_FilterEqualTypeInput>;
};

/** Contains details about a newly-created or updated customer. */
export type Mage_CustomerOutput = {
  __typename?: 'Mage_CustomerOutput';
  /** Customer details after creating or updating a customer. */
  customer: Mage_Customer;
};

/** Contains payment tokens stored in the customer's vault. */
export type Mage_CustomerPaymentTokens = {
  __typename?: 'Mage_CustomerPaymentTokens';
  /** An array of payment tokens. */
  items: Array<Maybe<Mage_PaymentToken>>;
};

/** Contains a customer authorization token. */
export type Mage_CustomerToken = {
  __typename?: 'Mage_CustomerToken';
  /** The customer authorization token. */
  token?: Maybe<Scalars['String']['output']>;
};

/** An input object for updating a customer. */
export type Mage_CustomerUpdateInput = {
  /** Indicates whether the customer has enabled remote shopping assistance. */
  allow_remote_shopping_assistance?: InputMaybe<Scalars['Boolean']['input']>;
  /** The customer's custom attributes. */
  custom_attributes?: InputMaybe<Array<InputMaybe<Mage_AttributeValueInput>>>;
  /** The customer's date of birth. */
  date_of_birth?: InputMaybe<Scalars['String']['input']>;
  dob?: InputMaybe<Scalars['String']['input']>;
  /** The customer's first name. */
  firstname?: InputMaybe<Scalars['String']['input']>;
  /** The customer's gender (Male - 1, Female - 2). */
  gender?: InputMaybe<Scalars['Int']['input']>;
  /** Indicates whether the customer is subscribed to the company's newsletter. */
  is_subscribed?: InputMaybe<Scalars['Boolean']['input']>;
  /** The customer's family name. */
  lastname?: InputMaybe<Scalars['String']['input']>;
  /** The customer's middle name. */
  middlename?: InputMaybe<Scalars['String']['input']>;
  /** An honorific, such as Dr., Mr., or Mrs. */
  prefix?: InputMaybe<Scalars['String']['input']>;
  /** A value such as Sr., Jr., or III. */
  suffix?: InputMaybe<Scalars['String']['input']>;
  /** The customer's Tax/VAT number (for corporate customers). */
  taxvat?: InputMaybe<Scalars['String']['input']>;
};

/** Contains information about a text area that is defined as part of a customizable option. */
export type Mage_CustomizableAreaOption = Mage_CustomizableOptionInterface & {
  __typename?: 'Mage_CustomizableAreaOption';
  /**
   * Option ID.
   * @deprecated Use `uid` instead
   */
  option_id?: Maybe<Scalars['Int']['output']>;
  /** The Stock Keeping Unit of the base product. */
  product_sku?: Maybe<Scalars['String']['output']>;
  /** Indicates whether the option is required. */
  required?: Maybe<Scalars['Boolean']['output']>;
  /** The order in which the option is displayed. */
  sort_order?: Maybe<Scalars['Int']['output']>;
  /** The display name for this option. */
  title?: Maybe<Scalars['String']['output']>;
  /** The unique ID for a `CustomizableOptionInterface` object. */
  uid: Scalars['ID']['output'];
  /** An object that defines a text area. */
  value?: Maybe<Mage_CustomizableAreaValue>;
};

/** Defines the price and sku of a product whose page contains a customized text area. */
export type Mage_CustomizableAreaValue = {
  __typename?: 'Mage_CustomizableAreaValue';
  /** The maximum number of characters that can be entered for this customizable option. */
  max_characters?: Maybe<Scalars['Int']['output']>;
  /** The price assigned to this option. */
  price?: Maybe<Scalars['Float']['output']>;
  /** FIXED, PERCENT, or DYNAMIC. */
  price_type?: Maybe<Mage_PriceTypeEnum>;
  /** The Stock Keeping Unit for this option. */
  sku?: Maybe<Scalars['String']['output']>;
  /** The unique ID for a `CustomizableAreaValue` object. */
  uid: Scalars['ID']['output'];
};

/** Contains information about a set of checkbox values that are defined as part of a customizable option. */
export type Mage_CustomizableCheckboxOption = Mage_CustomizableOptionInterface & {
  __typename?: 'Mage_CustomizableCheckboxOption';
  /**
   * Option ID.
   * @deprecated Use `uid` instead
   */
  option_id?: Maybe<Scalars['Int']['output']>;
  /** Indicates whether the option is required. */
  required?: Maybe<Scalars['Boolean']['output']>;
  /** The order in which the option is displayed. */
  sort_order?: Maybe<Scalars['Int']['output']>;
  /** The display name for this option. */
  title?: Maybe<Scalars['String']['output']>;
  /** The unique ID for a `CustomizableOptionInterface` object. */
  uid: Scalars['ID']['output'];
  /** An array that defines a set of checkbox values. */
  value?: Maybe<Array<Maybe<Mage_CustomizableCheckboxValue>>>;
};

/** Defines the price and sku of a product whose page contains a customized set of checkbox values. */
export type Mage_CustomizableCheckboxValue = {
  __typename?: 'Mage_CustomizableCheckboxValue';
  /** The ID assigned to the value. */
  option_type_id?: Maybe<Scalars['Int']['output']>;
  /** The price assigned to this option. */
  price?: Maybe<Scalars['Float']['output']>;
  /** FIXED, PERCENT, or DYNAMIC. */
  price_type?: Maybe<Mage_PriceTypeEnum>;
  /** The Stock Keeping Unit for this option. */
  sku?: Maybe<Scalars['String']['output']>;
  /** The order in which the checkbox value is displayed. */
  sort_order?: Maybe<Scalars['Int']['output']>;
  /** The display name for this option. */
  title?: Maybe<Scalars['String']['output']>;
  /** The unique ID for a `CustomizableCheckboxValue` object. */
  uid: Scalars['ID']['output'];
};

/** Contains information about a date picker that is defined as part of a customizable option. */
export type Mage_CustomizableDateOption = Mage_CustomizableOptionInterface & {
  __typename?: 'Mage_CustomizableDateOption';
  /**
   * Option ID.
   * @deprecated Use `uid` instead
   */
  option_id?: Maybe<Scalars['Int']['output']>;
  /** The Stock Keeping Unit of the base product. */
  product_sku?: Maybe<Scalars['String']['output']>;
  /** Indicates whether the option is required. */
  required?: Maybe<Scalars['Boolean']['output']>;
  /** The order in which the option is displayed. */
  sort_order?: Maybe<Scalars['Int']['output']>;
  /** The display name for this option. */
  title?: Maybe<Scalars['String']['output']>;
  /** The unique ID for a `CustomizableOptionInterface` object. */
  uid: Scalars['ID']['output'];
  /** An object that defines a date field in a customizable option. */
  value?: Maybe<Mage_CustomizableDateValue>;
};

/** Defines the customizable date type. */
export enum Mage_CustomizableDateTypeEnum {
  Date = 'DATE',
  DateTime = 'DATE_TIME',
  Time = 'TIME'
}

/** Defines the price and sku of a product whose page contains a customized date picker. */
export type Mage_CustomizableDateValue = {
  __typename?: 'Mage_CustomizableDateValue';
  /** The price assigned to this option. */
  price?: Maybe<Scalars['Float']['output']>;
  /** FIXED, PERCENT, or DYNAMIC. */
  price_type?: Maybe<Mage_PriceTypeEnum>;
  /** The Stock Keeping Unit for this option. */
  sku?: Maybe<Scalars['String']['output']>;
  /** DATE, DATE_TIME or TIME */
  type?: Maybe<Mage_CustomizableDateTypeEnum>;
  /** The unique ID for a `CustomizableDateValue` object. */
  uid: Scalars['ID']['output'];
};

/** Contains information about a drop down menu that is defined as part of a customizable option. */
export type Mage_CustomizableDropDownOption = Mage_CustomizableOptionInterface & {
  __typename?: 'Mage_CustomizableDropDownOption';
  /**
   * Option ID.
   * @deprecated Use `uid` instead
   */
  option_id?: Maybe<Scalars['Int']['output']>;
  /** Indicates whether the option is required. */
  required?: Maybe<Scalars['Boolean']['output']>;
  /** The order in which the option is displayed. */
  sort_order?: Maybe<Scalars['Int']['output']>;
  /** The display name for this option. */
  title?: Maybe<Scalars['String']['output']>;
  /** The unique ID for a `CustomizableOptionInterface` object. */
  uid: Scalars['ID']['output'];
  /** An array that defines the set of options for a drop down menu. */
  value?: Maybe<Array<Maybe<Mage_CustomizableDropDownValue>>>;
};

/** Defines the price and sku of a product whose page contains a customized drop down menu. */
export type Mage_CustomizableDropDownValue = {
  __typename?: 'Mage_CustomizableDropDownValue';
  /** The ID assigned to the value. */
  option_type_id?: Maybe<Scalars['Int']['output']>;
  /** The price assigned to this option. */
  price?: Maybe<Scalars['Float']['output']>;
  /** FIXED, PERCENT, or DYNAMIC. */
  price_type?: Maybe<Mage_PriceTypeEnum>;
  /** The Stock Keeping Unit for this option. */
  sku?: Maybe<Scalars['String']['output']>;
  /** The order in which the option is displayed. */
  sort_order?: Maybe<Scalars['Int']['output']>;
  /** The display name for this option. */
  title?: Maybe<Scalars['String']['output']>;
  /** The unique ID for a `CustomizableDropDownValue` object. */
  uid: Scalars['ID']['output'];
};

/** Contains information about a text field that is defined as part of a customizable option. */
export type Mage_CustomizableFieldOption = Mage_CustomizableOptionInterface & {
  __typename?: 'Mage_CustomizableFieldOption';
  /**
   * Option ID.
   * @deprecated Use `uid` instead
   */
  option_id?: Maybe<Scalars['Int']['output']>;
  /** The Stock Keeping Unit of the base product. */
  product_sku?: Maybe<Scalars['String']['output']>;
  /** Indicates whether the option is required. */
  required?: Maybe<Scalars['Boolean']['output']>;
  /** The order in which the option is displayed. */
  sort_order?: Maybe<Scalars['Int']['output']>;
  /** The display name for this option. */
  title?: Maybe<Scalars['String']['output']>;
  /** The unique ID for a `CustomizableOptionInterface` object. */
  uid: Scalars['ID']['output'];
  /** An object that defines a text field. */
  value?: Maybe<Mage_CustomizableFieldValue>;
};

/** Defines the price and sku of a product whose page contains a customized text field. */
export type Mage_CustomizableFieldValue = {
  __typename?: 'Mage_CustomizableFieldValue';
  /** The maximum number of characters that can be entered for this customizable option. */
  max_characters?: Maybe<Scalars['Int']['output']>;
  /** The price of the custom value. */
  price?: Maybe<Scalars['Float']['output']>;
  /** FIXED, PERCENT, or DYNAMIC. */
  price_type?: Maybe<Mage_PriceTypeEnum>;
  /** The Stock Keeping Unit for this option. */
  sku?: Maybe<Scalars['String']['output']>;
  /** The unique ID for a `CustomizableFieldValue` object. */
  uid: Scalars['ID']['output'];
};

/** Contains information about a file picker that is defined as part of a customizable option. */
export type Mage_CustomizableFileOption = Mage_CustomizableOptionInterface & {
  __typename?: 'Mage_CustomizableFileOption';
  /**
   * Option ID.
   * @deprecated Use `uid` instead
   */
  option_id?: Maybe<Scalars['Int']['output']>;
  /** The Stock Keeping Unit of the base product. */
  product_sku?: Maybe<Scalars['String']['output']>;
  /** Indicates whether the option is required. */
  required?: Maybe<Scalars['Boolean']['output']>;
  /** The order in which the option is displayed. */
  sort_order?: Maybe<Scalars['Int']['output']>;
  /** The display name for this option. */
  title?: Maybe<Scalars['String']['output']>;
  /** The unique ID for a `CustomizableOptionInterface` object. */
  uid: Scalars['ID']['output'];
  /** An object that defines a file value. */
  value?: Maybe<Mage_CustomizableFileValue>;
};

/** Defines the price and sku of a product whose page contains a customized file picker. */
export type Mage_CustomizableFileValue = {
  __typename?: 'Mage_CustomizableFileValue';
  /** The file extension to accept. */
  file_extension?: Maybe<Scalars['String']['output']>;
  /** The maximum width of an image. */
  image_size_x?: Maybe<Scalars['Int']['output']>;
  /** The maximum height of an image. */
  image_size_y?: Maybe<Scalars['Int']['output']>;
  /** The price assigned to this option. */
  price?: Maybe<Scalars['Float']['output']>;
  /** FIXED, PERCENT, or DYNAMIC. */
  price_type?: Maybe<Mage_PriceTypeEnum>;
  /** The Stock Keeping Unit for this option. */
  sku?: Maybe<Scalars['String']['output']>;
  /** The unique ID for a `CustomizableFileValue` object. */
  uid: Scalars['ID']['output'];
};

/** Contains information about a multiselect that is defined as part of a customizable option. */
export type Mage_CustomizableMultipleOption = Mage_CustomizableOptionInterface & {
  __typename?: 'Mage_CustomizableMultipleOption';
  /**
   * Option ID.
   * @deprecated Use `uid` instead
   */
  option_id?: Maybe<Scalars['Int']['output']>;
  /** Indicates whether the option is required. */
  required?: Maybe<Scalars['Boolean']['output']>;
  /** The order in which the option is displayed. */
  sort_order?: Maybe<Scalars['Int']['output']>;
  /** The display name for this option. */
  title?: Maybe<Scalars['String']['output']>;
  /** The unique ID for a `CustomizableOptionInterface` object. */
  uid: Scalars['ID']['output'];
  /** An array that defines the set of options for a multiselect. */
  value?: Maybe<Array<Maybe<Mage_CustomizableMultipleValue>>>;
};

/** Defines the price and sku of a product whose page contains a customized multiselect. */
export type Mage_CustomizableMultipleValue = {
  __typename?: 'Mage_CustomizableMultipleValue';
  /** The ID assigned to the value. */
  option_type_id?: Maybe<Scalars['Int']['output']>;
  /** The price assigned to this option. */
  price?: Maybe<Scalars['Float']['output']>;
  /** FIXED, PERCENT, or DYNAMIC. */
  price_type?: Maybe<Mage_PriceTypeEnum>;
  /** The Stock Keeping Unit for this option. */
  sku?: Maybe<Scalars['String']['output']>;
  /** The order in which the option is displayed. */
  sort_order?: Maybe<Scalars['Int']['output']>;
  /** The display name for this option. */
  title?: Maybe<Scalars['String']['output']>;
  /** The unique ID for a `CustomizableMultipleValue` object. */
  uid: Scalars['ID']['output'];
};

/** Defines a customizable option. */
export type Mage_CustomizableOptionInput = {
  /** The customizable option ID of the product. */
  id?: InputMaybe<Scalars['Int']['input']>;
  /** The unique ID for a `CartItemInterface` object. */
  uid?: InputMaybe<Scalars['ID']['input']>;
  /** The string value of the option. */
  value_string: Scalars['String']['input'];
};

/** Contains basic information about a customizable option. It can be implemented by several types of configurable options. */
export type Mage_CustomizableOptionInterface = {
  /**
   * Option ID.
   * @deprecated Use `uid` instead
   */
  option_id?: Maybe<Scalars['Int']['output']>;
  /** Indicates whether the option is required. */
  required?: Maybe<Scalars['Boolean']['output']>;
  /** The order in which the option is displayed. */
  sort_order?: Maybe<Scalars['Int']['output']>;
  /** The display name for this option. */
  title?: Maybe<Scalars['String']['output']>;
  /** The unique ID for a `CustomizableOptionInterface` object. */
  uid: Scalars['ID']['output'];
};

/** Contains information about customizable product options. */
export type Mage_CustomizableProductInterface = {
  /** An array of options for a customizable product. */
  options?: Maybe<Array<Maybe<Mage_CustomizableOptionInterface>>>;
};

/** Contains information about a set of radio buttons that are defined as part of a customizable option. */
export type Mage_CustomizableRadioOption = Mage_CustomizableOptionInterface & {
  __typename?: 'Mage_CustomizableRadioOption';
  /**
   * Option ID.
   * @deprecated Use `uid` instead
   */
  option_id?: Maybe<Scalars['Int']['output']>;
  /** Indicates whether the option is required. */
  required?: Maybe<Scalars['Boolean']['output']>;
  /** The order in which the option is displayed. */
  sort_order?: Maybe<Scalars['Int']['output']>;
  /** The display name for this option. */
  title?: Maybe<Scalars['String']['output']>;
  /** The unique ID for a `CustomizableOptionInterface` object. */
  uid: Scalars['ID']['output'];
  /** An array that defines a set of radio buttons. */
  value?: Maybe<Array<Maybe<Mage_CustomizableRadioValue>>>;
};

/** Defines the price and sku of a product whose page contains a customized set of radio buttons. */
export type Mage_CustomizableRadioValue = {
  __typename?: 'Mage_CustomizableRadioValue';
  /** The ID assigned to the value. */
  option_type_id?: Maybe<Scalars['Int']['output']>;
  /** The price assigned to this option. */
  price?: Maybe<Scalars['Float']['output']>;
  /** FIXED, PERCENT, or DYNAMIC. */
  price_type?: Maybe<Mage_PriceTypeEnum>;
  /** The Stock Keeping Unit for this option. */
  sku?: Maybe<Scalars['String']['output']>;
  /** The order in which the radio button is displayed. */
  sort_order?: Maybe<Scalars['Int']['output']>;
  /** The display name for this option. */
  title?: Maybe<Scalars['String']['output']>;
  /** The unique ID for a `CustomizableRadioValue` object. */
  uid: Scalars['ID']['output'];
};

/** Contains the results of the request to delete a compare list. */
export type Mage_DeleteCompareListOutput = {
  __typename?: 'Mage_DeleteCompareListOutput';
  /** Indicates whether the compare list was successfully deleted. */
  result: Scalars['Boolean']['output'];
};

/** Indicates whether the request succeeded and returns the remaining customer payment tokens. */
export type Mage_DeletePaymentTokenOutput = {
  __typename?: 'Mage_DeletePaymentTokenOutput';
  /** A container for the customer's remaining payment tokens. */
  customerPaymentTokens?: Maybe<Mage_CustomerPaymentTokens>;
  /** Indicates whether the request succeeded. */
  result: Scalars['Boolean']['output'];
};

/** Defines an individual discount. A discount can be applied to the cart as a whole or to an item, shipping. */
export type Mage_Discount = {
  __typename?: 'Mage_Discount';
  /** The amount of the discount. */
  amount: Mage_Money;
  /** The type of the entity the discount is applied to. */
  applied_to: Mage_CartDiscountType;
  /** The coupon related to the discount. */
  coupon?: Maybe<Mage_AppliedCoupon>;
  /** A description of the discount. */
  label: Scalars['String']['output'];
};

/** An implementation for downloadable product cart items. */
export type Mage_DownloadableCartItem = Mage_CartItemInterface & {
  __typename?: 'Mage_DownloadableCartItem';
  /** An array containing the customizable options the shopper selected. */
  customizable_options: Array<Maybe<Mage_SelectedCustomizableOption>>;
  /** Errors assigned to this quote item */
  errors?: Maybe<Array<Maybe<Mage_CartItemError>>>;
  /** @deprecated Use `uid` instead. */
  id: Scalars['String']['output'];
  /** True if requested quantity is less than available stock, false otherwise. */
  is_available: Scalars['Boolean']['output'];
  /** An array containing information about the links for the downloadable product added to the cart. */
  links?: Maybe<Array<Maybe<Mage_DownloadableProductLinks>>>;
  /** Message to display when the product is not available with this selected option. */
  not_available_message?: Maybe<Scalars['String']['output']>;
  /** Contains details about the price of the item, including taxes and discounts. */
  prices?: Maybe<Mage_CartItemPrices>;
  /** Details about an item in the cart. */
  product: Mage_ProductInterface;
  product_type: Scalars['String']['output'];
  /** The quantity of this item in the cart. */
  quantity: Scalars['Float']['output'];
  /** An array containing information about samples of the selected downloadable product. */
  samples?: Maybe<Array<Maybe<Mage_DownloadableProductSamples>>>;
  /** The unique ID for a `CartItemInterface` object. */
  uid: Scalars['ID']['output'];
};

/** Defines downloadable product options for `CreditMemoItemInterface`. */
export type Mage_DownloadableCreditMemoItem = Mage_CreditMemoItemInterface & {
  __typename?: 'Mage_DownloadableCreditMemoItem';
  /** Details about the final discount amount for the base product, including discounts on options. */
  discounts?: Maybe<Array<Maybe<Mage_Discount>>>;
  /** A list of downloadable links that are refunded from the downloadable product. */
  downloadable_links?: Maybe<Array<Maybe<Mage_DownloadableItemsLinks>>>;
  /** The unique ID for a `CreditMemoItemInterface` object. */
  id: Scalars['ID']['output'];
  /** The order item the credit memo is applied to. */
  order_item?: Maybe<Mage_OrderItemInterface>;
  /** The name of the base product. */
  product_name?: Maybe<Scalars['String']['output']>;
  /** The sale price for the base product, including selected options. */
  product_sale_price: Mage_Money;
  /** The SKU of the base product. */
  product_sku: Scalars['String']['output'];
  /** The number of refunded items. */
  quantity_refunded?: Maybe<Scalars['Float']['output']>;
};

export enum Mage_DownloadableFileTypeEnum {
  /** @deprecated `sample_url` serves to get the downloadable sample */
  File = 'FILE',
  /** @deprecated `sample_url` serves to get the downloadable sample */
  Url = 'URL'
}

/** Defines downloadable product options for `InvoiceItemInterface`. */
export type Mage_DownloadableInvoiceItem = Mage_InvoiceItemInterface & {
  __typename?: 'Mage_DownloadableInvoiceItem';
  /** Information about the final discount amount for the base product, including discounts on options. */
  discounts?: Maybe<Array<Maybe<Mage_Discount>>>;
  /** A list of downloadable links that are invoiced from the downloadable product. */
  downloadable_links?: Maybe<Array<Maybe<Mage_DownloadableItemsLinks>>>;
  /** The unique ID for an `InvoiceItemInterface` object. */
  id: Scalars['ID']['output'];
  /** Details about an individual order item. */
  order_item?: Maybe<Mage_OrderItemInterface>;
  /** The name of the base product. */
  product_name?: Maybe<Scalars['String']['output']>;
  /** The sale price for the base product including selected options. */
  product_sale_price: Mage_Money;
  /** The SKU of the base product. */
  product_sku: Scalars['String']['output'];
  /** The number of invoiced items. */
  quantity_invoiced?: Maybe<Scalars['Float']['output']>;
};

/** Defines characteristics of the links for downloadable product. */
export type Mage_DownloadableItemsLinks = {
  __typename?: 'Mage_DownloadableItemsLinks';
  /** A number indicating the sort order. */
  sort_order?: Maybe<Scalars['Int']['output']>;
  /** The display name of the link. */
  title?: Maybe<Scalars['String']['output']>;
  /** The unique ID for a `DownloadableItemsLinks` object. */
  uid: Scalars['ID']['output'];
};

/** Defines downloadable product options for `OrderItemInterface`. */
export type Mage_DownloadableOrderItem = Mage_OrderItemInterface & {
  __typename?: 'Mage_DownloadableOrderItem';
  /** The final discount information for the product. */
  discounts?: Maybe<Array<Maybe<Mage_Discount>>>;
  /** A list of downloadable links that are ordered from the downloadable product. */
  downloadable_links?: Maybe<Array<Maybe<Mage_DownloadableItemsLinks>>>;
  /** The entered option for the base product, such as a logo or image. */
  entered_options?: Maybe<Array<Maybe<Mage_OrderItemOption>>>;
  /** The selected gift message for the order item */
  gift_message?: Maybe<Mage_GiftMessage>;
  /** The unique ID for an `OrderItemInterface` object. */
  id: Scalars['ID']['output'];
  /** Contains details about the price of the item, including taxes and discounts. */
  prices?: Maybe<Mage_OrderItemPrices>;
  /** The ProductInterface object, which contains details about the base product */
  product?: Maybe<Mage_ProductInterface>;
  /** The name of the base product. */
  product_name?: Maybe<Scalars['String']['output']>;
  /** The sale price of the base product, including selected options. */
  product_sale_price: Mage_Money;
  /** The SKU of the base product. */
  product_sku: Scalars['String']['output'];
  /** The type of product, such as simple, configurable, etc. */
  product_type?: Maybe<Scalars['String']['output']>;
  /** URL key of the base product. */
  product_url_key?: Maybe<Scalars['String']['output']>;
  /** The number of canceled items. */
  quantity_canceled?: Maybe<Scalars['Float']['output']>;
  /** The number of invoiced items. */
  quantity_invoiced?: Maybe<Scalars['Float']['output']>;
  /** The number of units ordered for this item. */
  quantity_ordered?: Maybe<Scalars['Float']['output']>;
  /** The number of refunded items. */
  quantity_refunded?: Maybe<Scalars['Float']['output']>;
  /** The number of returned items. */
  quantity_returned?: Maybe<Scalars['Float']['output']>;
  /** The number of shipped items. */
  quantity_shipped?: Maybe<Scalars['Float']['output']>;
  /** The selected options for the base product, such as color or size. */
  selected_options?: Maybe<Array<Maybe<Mage_OrderItemOption>>>;
  /** The status of the order item. */
  status?: Maybe<Scalars['String']['output']>;
};

/** Defines a product that the shopper downloads. */
export type Mage_DownloadableProduct = Mage_CustomizableProductInterface & Mage_ProductInterface & Mage_RoutableInterface & {
  __typename?: 'Mage_DownloadableProduct';
  /** @deprecated Use the `custom_attributes` field instead. */
  activity?: Maybe<Scalars['String']['output']>;
  /**
   * The attribute set assigned to the product.
   * @deprecated The field should not be used on the storefront.
   */
  attribute_set_id?: Maybe<Scalars['Int']['output']>;
  /** The relative canonical URL. This value is returned only if the system setting 'Use Canonical Link Meta Tag For Products' is enabled. */
  canonical_url?: Maybe<Scalars['String']['output']>;
  /** The categories assigned to a product. */
  categories?: Maybe<Array<Maybe<Mage_CategoryInterface>>>;
  /** @deprecated Use the `custom_attributes` field instead. */
  category_gear?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  climate?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  collar?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  color?: Maybe<Scalars['Int']['output']>;
  /** The product's country of origin. */
  country_of_manufacture?: Maybe<Scalars['String']['output']>;
  /**
   * Timestamp indicating when the product was created.
   * @deprecated The field should not be used on the storefront.
   */
  created_at?: Maybe<Scalars['String']['output']>;
  /** Crosssell Products */
  crosssell_products?: Maybe<Array<Maybe<Mage_ProductInterface>>>;
  /** Product custom attributes. */
  custom_attributesV2?: Maybe<Mage_ProductCustomAttributes>;
  /** Detailed information about the product. The value can include simple HTML tags. */
  description?: Maybe<Mage_ComplexTextValue>;
  /** An array containing information about the links for this downloadable product. */
  downloadable_product_links?: Maybe<Array<Maybe<Mage_DownloadableProductLinks>>>;
  /** An array containing information about samples of this downloadable product. */
  downloadable_product_samples?: Maybe<Array<Maybe<Mage_DownloadableProductSamples>>>;
  /** @deprecated Use the `custom_attributes` field instead. */
  eco_collection?: Maybe<Scalars['Int']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  erin_recommends?: Maybe<Scalars['Int']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  features_bags?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  format?: Maybe<Scalars['Int']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  gender?: Maybe<Scalars['String']['output']>;
  /** Returns a value indicating gift message availability for the product. */
  gift_message_available: Scalars['Boolean']['output'];
  /**
   * The ID number assigned to the product.
   * @deprecated Use the `uid` field instead.
   */
  id?: Maybe<Scalars['Int']['output']>;
  /** The relative path to the main image on the product page. */
  image?: Maybe<Mage_ProductImage>;
  /** @deprecated Use the `custom_attributes` field instead. */
  is_seller_product?: Maybe<Scalars['Int']['output']>;
  /** A value of 1 indicates that each link in the array must be purchased separately. */
  links_purchased_separately?: Maybe<Scalars['Int']['output']>;
  /** The heading above the list of downloadable products. */
  links_title?: Maybe<Scalars['String']['output']>;
  /**
   * A number representing the product's manufacturer.
   * @deprecated Use the `custom_attributes` field instead.
   */
  manufacturer?: Maybe<Scalars['Int']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  material?: Maybe<Scalars['String']['output']>;
  /** Maximum Qty Allowed in Shopping Cart */
  max_sale_qty?: Maybe<Scalars['Float']['output']>;
  /** An array of media gallery objects. */
  media_gallery?: Maybe<Array<Maybe<Mage_MediaGalleryInterface>>>;
  /**
   * An array of MediaGalleryEntry objects.
   * @deprecated Use `media_gallery` instead.
   */
  media_gallery_entries?: Maybe<Array<Maybe<Mage_MediaGalleryEntry>>>;
  /** A brief overview of the product for search results listings, maximum 255 characters. */
  meta_description?: Maybe<Scalars['String']['output']>;
  /** A comma-separated list of keywords that are visible only to search engines. */
  meta_keyword?: Maybe<Scalars['String']['output']>;
  /** A string that is displayed in the title bar and tab of the browser and in search results lists. */
  meta_title?: Maybe<Scalars['String']['output']>;
  /** Minimum Qty Allowed in Shopping Cart */
  min_sale_qty?: Maybe<Scalars['Float']['output']>;
  /** The product name. Customers use this name to identify the product. */
  name?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  new?: Maybe<Scalars['Int']['output']>;
  /** The beginning date for new product listings, and determines if the product is featured as a new product. */
  new_from_date?: Maybe<Scalars['String']['output']>;
  /** The end date for new product listings. */
  new_to_date?: Maybe<Scalars['String']['output']>;
  /** Product stock only x left count */
  only_x_left_in_stock?: Maybe<Scalars['Float']['output']>;
  /** An array of options for a customizable product. */
  options?: Maybe<Array<Maybe<Mage_CustomizableOptionInterface>>>;
  /** If the product has multiple options, determines where they appear on the product page. */
  options_container?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  pattern?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  performance_fabric?: Maybe<Scalars['Int']['output']>;
  /**
   * Indicates the price of an item.
   * @deprecated Use `price_range` for product price information.
   */
  price?: Maybe<Mage_ProductPrices>;
  /** The range of prices for the product */
  price_range: Mage_PriceRange;
  /** An array of `TierPrice` objects. */
  price_tiers?: Maybe<Array<Maybe<Mage_TierPrice>>>;
  /** An array of `ProductLinks` objects. */
  product_links?: Maybe<Array<Maybe<Mage_ProductLinksInterface>>>;
  /** Amount of available stock */
  quantity?: Maybe<Scalars['Float']['output']>;
  /** The average of all the ratings given to the product. */
  rating_summary: Scalars['Float']['output'];
  /** Contains 0 when there is no redirect error. A value of 301 indicates the URL of the requested resource has been changed permanently, while a value of 302 indicates a temporary redirect. */
  redirect_code: Scalars['Int']['output'];
  /** An array of products to be displayed in a Related Products block. */
  related_products?: Maybe<Array<Maybe<Mage_ProductInterface>>>;
  /** The internal relative URL. If the specified URL is a redirect, the query returns the redirected URL, not the original. */
  relative_url?: Maybe<Scalars['String']['output']>;
  /** The total count of all the reviews given to the product. */
  review_count: Scalars['Int']['output'];
  /** The list of products reviews. */
  reviews: Mage_ProductReviews;
  /** @deprecated Use the `custom_attributes` field instead. */
  sale?: Maybe<Scalars['Int']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  seller_id?: Maybe<Scalars['Int']['output']>;
  /** A short description of the product. Its use depends on the theme. */
  short_description?: Maybe<Mage_ComplexTextValue>;
  /** @deprecated Use the `custom_attributes` field instead. */
  size?: Maybe<Scalars['Int']['output']>;
  /** A number or code assigned to a product to identify the product, options, price, and manufacturer. */
  sku?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  sleeve?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  sm_featured?: Maybe<Scalars['Int']['output']>;
  /** The relative path to the small image, which is used on catalog pages. */
  small_image?: Maybe<Mage_ProductImage>;
  /**
   * The beginning date that a product has a special price.
   * @deprecated The field should not be used on the storefront.
   */
  special_from_date?: Maybe<Scalars['String']['output']>;
  /** The discounted price of the product. */
  special_price?: Maybe<Scalars['Float']['output']>;
  /** The end date for a product with a special price. */
  special_to_date?: Maybe<Scalars['String']['output']>;
  /** The status assigned to the product, 0 for disabled, 1 for enabled. */
  status?: Maybe<Scalars['Int']['output']>;
  /** Stock status of the product */
  stock_status?: Maybe<Mage_ProductStockStatus>;
  /** @deprecated Use the `custom_attributes` field instead. */
  strap_bags?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  style_bags?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  style_bottom?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  style_general?: Maybe<Scalars['String']['output']>;
  /** The file name of a swatch image. */
  swatch_image?: Maybe<Scalars['String']['output']>;
  /** The relative path to the product's thumbnail image. */
  thumbnail?: Maybe<Mage_ProductImage>;
  /**
   * The price when tier pricing is in effect and the items purchased threshold has been reached.
   * @deprecated Use `price_tiers` for product tier price information.
   */
  tier_price?: Maybe<Scalars['Float']['output']>;
  /**
   * An array of ProductTierPrices objects.
   * @deprecated Use `price_tiers` for product tier price information.
   */
  tier_prices?: Maybe<Array<Maybe<Mage_ProductTierPrices>>>;
  /** One of PRODUCT, CATEGORY, or CMS_PAGE. */
  type?: Maybe<Mage_UrlRewriteEntityTypeEnum>;
  /**
   * One of simple, virtual, bundle, downloadable, grouped, or configurable.
   * @deprecated Use `__typename` instead.
   */
  type_id?: Maybe<Scalars['String']['output']>;
  /** The unique ID for a `ProductInterface` object. */
  uid: Scalars['ID']['output'];
  /**
   * Timestamp indicating when the product was updated.
   * @deprecated The field should not be used on the storefront.
   */
  updated_at?: Maybe<Scalars['String']['output']>;
  /** Upsell Products */
  upsell_products?: Maybe<Array<Maybe<Mage_ProductInterface>>>;
  /** The part of the URL that identifies the product */
  url_key?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use product's `canonical_url` or url rewrites instead */
  url_path?: Maybe<Scalars['String']['output']>;
  /** URL rewrites list */
  url_rewrites?: Maybe<Array<Maybe<Mage_UrlRewrite>>>;
  /** The part of the product URL that is appended after the url key */
  url_suffix?: Maybe<Scalars['String']['output']>;
  /** The visibility assigned to the product. */
  visibility?: Maybe<Scalars['Int']['output']>;
  /**
   * An array of websites in which the product is available.
   * @deprecated The field should not be used on the storefront.
   */
  websites?: Maybe<Array<Maybe<Mage_Website>>>;
};


/** Defines a product that the shopper downloads. */
export type Mage_DownloadableProductCustom_AttributesV2Args = {
  filters?: InputMaybe<Mage_AttributeFilterInput>;
};


/** Defines a product that the shopper downloads. */
export type Mage_DownloadableProductReviewsArgs = {
  currentPage?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
};

/** Defines a single downloadable product. */
export type Mage_DownloadableProductCartItemInput = {
  /** The ID and value of the option. */
  customizable_options?: InputMaybe<Array<InputMaybe<Mage_CustomizableOptionInput>>>;
  /** The quantity and SKU of the downloadable product. */
  data: Mage_CartItemInput;
  /** An array of objects containing the link_id of the downloadable product link. */
  downloadable_product_links?: InputMaybe<Array<InputMaybe<Mage_DownloadableProductLinksInput>>>;
};

/** Defines characteristics of a downloadable product. */
export type Mage_DownloadableProductLinks = {
  __typename?: 'Mage_DownloadableProductLinks';
  /** @deprecated This information should not be exposed on frontend. */
  id?: Maybe<Scalars['Int']['output']>;
  /** @deprecated This information should not be exposed on frontend. */
  is_shareable?: Maybe<Scalars['Boolean']['output']>;
  /** @deprecated `sample_url` serves to get the downloadable sample */
  link_type?: Maybe<Mage_DownloadableFileTypeEnum>;
  /** @deprecated This information should not be exposed on frontend. */
  number_of_downloads?: Maybe<Scalars['Int']['output']>;
  /** The price of the downloadable product. */
  price?: Maybe<Scalars['Float']['output']>;
  /** @deprecated `sample_url` serves to get the downloadable sample */
  sample_file?: Maybe<Scalars['String']['output']>;
  /** @deprecated `sample_url` serves to get the downloadable sample */
  sample_type?: Maybe<Mage_DownloadableFileTypeEnum>;
  /** The full URL to the downloadable sample. */
  sample_url?: Maybe<Scalars['String']['output']>;
  /** A number indicating the sort order. */
  sort_order?: Maybe<Scalars['Int']['output']>;
  /** The display name of the link. */
  title?: Maybe<Scalars['String']['output']>;
  /** The unique ID for a `DownloadableProductLinks` object. */
  uid: Scalars['ID']['output'];
};

/** Contains the link ID for the downloadable product. */
export type Mage_DownloadableProductLinksInput = {
  /** The unique ID of the downloadable product link. */
  link_id: Scalars['Int']['input'];
};

/** Defines characteristics of a downloadable product. */
export type Mage_DownloadableProductSamples = {
  __typename?: 'Mage_DownloadableProductSamples';
  /** @deprecated This information should not be exposed on frontend. */
  id?: Maybe<Scalars['Int']['output']>;
  /** @deprecated `sample_url` serves to get the downloadable sample */
  sample_file?: Maybe<Scalars['String']['output']>;
  /** @deprecated `sample_url` serves to get the downloadable sample */
  sample_type?: Maybe<Mage_DownloadableFileTypeEnum>;
  /** The full URL to the downloadable sample. */
  sample_url?: Maybe<Scalars['String']['output']>;
  /** A number indicating the sort order. */
  sort_order?: Maybe<Scalars['Int']['output']>;
  /** The display name of the sample. */
  title?: Maybe<Scalars['String']['output']>;
};

/** A downloadable product wish list item. */
export type Mage_DownloadableWishlistItem = Mage_WishlistItemInterface & {
  __typename?: 'Mage_DownloadableWishlistItem';
  /** The date and time the item was added to the wish list. */
  added_at: Scalars['String']['output'];
  /** Custom options selected for the wish list item. */
  customizable_options: Array<Maybe<Mage_SelectedCustomizableOption>>;
  /** The description of the item. */
  description?: Maybe<Scalars['String']['output']>;
  /** The unique ID for a `WishlistItemInterface` object. */
  id: Scalars['ID']['output'];
  /** An array containing information about the selected links. */
  links_v2?: Maybe<Array<Maybe<Mage_DownloadableProductLinks>>>;
  /** Product details of the wish list item. */
  product?: Maybe<Mage_ProductInterface>;
  /** The quantity of this wish list item. */
  quantity: Scalars['Float']['output'];
  /** An array containing information about the selected samples. */
  samples?: Maybe<Array<Maybe<Mage_DownloadableProductSamples>>>;
};

/** Defines a customer-entered option. */
export type Mage_EnteredOptionInput = {
  /** The unique ID for a `CustomizableOptionInterface` object, such as a `CustomizableFieldOption`, `CustomizableFileOption`, or `CustomizableAreaOption` object. */
  uid: Scalars['ID']['input'];
  /** Text the customer entered. */
  value: Scalars['String']['input'];
};

/** Contains the `uid`, `relative_url`, and `type` attributes. */
export type Mage_EntityUrl = {
  __typename?: 'Mage_EntityUrl';
  /** @deprecated Use `relative_url` instead. */
  canonical_url?: Maybe<Scalars['String']['output']>;
  /** The unique ID for a `ProductInterface`, `CategoryInterface`, `CmsPage`, or similar object associated with the specified URL. This could be a product, category, or CMS page UID. */
  entity_uid?: Maybe<Scalars['ID']['output']>;
  /**
   * The ID assigned to the object associated with the specified url. This could be a product ID, category ID, or page ID.
   * @deprecated Use `entity_uid` instead.
   */
  id?: Maybe<Scalars['Int']['output']>;
  /** Contains 0 when there is no redirect error. A value of 301 indicates the URL of the requested resource has been changed permanently, while a value of 302 indicates a temporary redirect. */
  redirectCode?: Maybe<Scalars['Int']['output']>;
  /** The internal relative URL. If the specified URL is a redirect, the query returns the redirected URL, not the original. */
  relative_url?: Maybe<Scalars['String']['output']>;
  /** One of PRODUCT, CATEGORY, or CMS_PAGE. */
  type?: Maybe<Mage_UrlRewriteEntityTypeEnum>;
};

/** An error encountered while adding an item to the the cart. */
export type Mage_Error = {
  /** A cart-specific error code. */
  code: Mage_CartUserInputErrorType;
  /** A localized error message. */
  message: Scalars['String']['output'];
};

export type Mage_ErrorInterface = {
  /** The returned error message. */
  message: Scalars['String']['output'];
};

/** Contains details about an address. */
export type Mage_EstimateAddressInput = {
  /** The two-letter code representing the customer's country. */
  country_code: Mage_CountryCodeEnum;
  /** The customer's ZIP or postal code. */
  postcode?: InputMaybe<Scalars['String']['input']>;
  /** An object containing the region name, region code, and region ID. */
  region?: InputMaybe<Mage_CustomerAddressRegionInput>;
};

export type Mage_EstimateTotalsInput = {
  /** Customer's address to estimate totals. */
  address: Mage_EstimateAddressInput;
  /** The unique ID of the cart to query. */
  cart_id: Scalars['String']['input'];
  /** Selected shipping method to estimate totals. */
  shipping_method?: InputMaybe<Mage_ShippingMethodInput>;
};

/** Estimate totals output. */
export type Mage_EstimateTotalsOutput = {
  __typename?: 'Mage_EstimateTotalsOutput';
  /** Cart after totals estimation */
  cart?: Maybe<Mage_Cart>;
};

/** Lists the exchange rate. */
export type Mage_ExchangeRate = {
  __typename?: 'Mage_ExchangeRate';
  /** Specifies the store’s default currency to exchange to. */
  currency_to?: Maybe<Scalars['String']['output']>;
  /** The exchange rate for the store’s default currency. */
  rate?: Maybe<Scalars['Float']['output']>;
};

export type Mage_FastlaneConfig = Mage_PaymentConfigItem & {
  __typename?: 'Mage_FastlaneConfig';
  /** The payment method code as defined in the payment gateway */
  code?: Maybe<Scalars['String']['output']>;
  /** Indicates whether the payment method is displayed */
  is_visible?: Maybe<Scalars['Boolean']['output']>;
  /** Defines the payment intent (Authorize or Capture */
  payment_intent?: Maybe<Scalars['String']['output']>;
  /** The payment source for the payment method */
  payment_source?: Maybe<Scalars['String']['output']>;
  /** The PayPal parameters required to load the JS SDK */
  sdk_params?: Maybe<Array<Maybe<Mage_SdkParams>>>;
  /** The relative order the payment method is displayed on the checkout page */
  sort_order?: Maybe<Scalars['String']['output']>;
  /** 3DS mode */
  three_ds_mode?: Maybe<Mage_ThreeDsMode>;
  /** The name displayed for the payment method */
  title?: Maybe<Scalars['String']['output']>;
};

/** Fastlane Payment inputs */
export type Mage_FastlaneMethodInput = {
  /** The payment source for the payment method */
  payment_source?: InputMaybe<Scalars['String']['input']>;
  /** The single use token from Fastlane */
  paypal_fastlane_token?: InputMaybe<Scalars['String']['input']>;
};

/** Defines a filter that matches the input exactly. */
export type Mage_FilterEqualTypeInput = {
  /** Use this attribute to exactly match the specified string. For example, to filter on a specific category ID, specify a value such as `5`. */
  eq?: InputMaybe<Scalars['String']['input']>;
  /** Use this attribute to filter on an array of values. For example, to filter on category IDs 4, 5, and 6, specify a value of `["4", "5", "6"]`. */
  in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export enum Mage_FilterMatchTypeEnum {
  Full = 'FULL',
  Partial = 'PARTIAL'
}

/** Defines a filter that performs a fuzzy search. */
export type Mage_FilterMatchTypeInput = {
  /** Use this attribute to fuzzy match the specified string. For example, to filter on a specific SKU, specify a value such as `24-MB01`. */
  match?: InputMaybe<Scalars['String']['input']>;
  /** Filter match type for fine-tuned results. Possible values FULL or PARTIAL. If match_type is not provided, returned results will default to FULL match. */
  match_type?: InputMaybe<Mage_FilterMatchTypeEnum>;
};

/** Defines a filter that matches a range of values, such as prices or dates. */
export type Mage_FilterRangeTypeInput = {
  /** Use this attribute to specify the lowest possible value in the range. */
  from?: InputMaybe<Scalars['String']['input']>;
  /** Use this attribute to specify the highest possible value in the range. */
  to?: InputMaybe<Scalars['String']['input']>;
};

/** Defines a filter for an input string. */
export type Mage_FilterStringTypeInput = {
  /** Filters items that are exactly the same as the specified string. */
  eq?: InputMaybe<Scalars['String']['input']>;
  /** Filters items that are exactly the same as entries specified in an array of strings. */
  in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Defines a filter that performs a fuzzy search using the specified string. */
  match?: InputMaybe<Scalars['String']['input']>;
};

/** Defines the comparison operators that can be used in a filter. */
export type Mage_FilterTypeInput = {
  /** Equals. */
  eq?: InputMaybe<Scalars['String']['input']>;
  finset?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** From. Must be used with the `to` field. */
  from?: InputMaybe<Scalars['String']['input']>;
  /** Greater than. */
  gt?: InputMaybe<Scalars['String']['input']>;
  /** Greater than or equal to. */
  gteq?: InputMaybe<Scalars['String']['input']>;
  /** In. The value can contain a set of comma-separated values. */
  in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Like. The specified value can contain % (percent signs) to allow matching of 0 or more characters. */
  like?: InputMaybe<Scalars['String']['input']>;
  /** Less than. */
  lt?: InputMaybe<Scalars['String']['input']>;
  /** Less than or equal to. */
  lteq?: InputMaybe<Scalars['String']['input']>;
  /** More than or equal to. */
  moreq?: InputMaybe<Scalars['String']['input']>;
  /** Not equal to. */
  neq?: InputMaybe<Scalars['String']['input']>;
  /** Not in. The value can contain a set of comma-separated values. */
  nin?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** Not null. */
  notnull?: InputMaybe<Scalars['String']['input']>;
  /** Is null. */
  null?: InputMaybe<Scalars['String']['input']>;
  /** To. Must be used with the `from` field. */
  to?: InputMaybe<Scalars['String']['input']>;
};

/** A single FPT that can be applied to a product price. */
export type Mage_FixedProductTax = {
  __typename?: 'Mage_FixedProductTax';
  /** The amount of the Fixed Product Tax. */
  amount?: Maybe<Mage_Money>;
  /** The display label assigned to the Fixed Product Tax. */
  label?: Maybe<Scalars['String']['output']>;
};

/** Lists display settings for the Fixed Product Tax. */
export enum Mage_FixedProductTaxDisplaySettings {
  /** The displayed price does not include the FPT amount. The values of `ProductPrice.fixed_product_taxes` and the price including the FPT are displayed separately. This value corresponds to 'Excluding FPT, Including FPT description and final price.' */
  ExcludeFptAndIncludeWithDetails = 'EXCLUDE_FPT_AND_INCLUDE_WITH_DETAILS',
  /** The displayed price does not include the FPT amount. The values from `ProductPrice.fixed_product_taxes` are not displayed. This value corresponds to 'Excluding FPT'. */
  ExcludeFptWithoutDetails = 'EXCLUDE_FPT_WITHOUT_DETAILS',
  /** The FPT feature is not enabled. You can omit `ProductPrice.fixed_product_taxes` from your query. */
  FptDisabled = 'FPT_DISABLED',
  /** The displayed price includes the FPT amount without displaying the `ProductPrice.fixed_product_taxes` values. This value corresponds to 'Including FPT only'. */
  IncludeFptWithoutDetails = 'INCLUDE_FPT_WITHOUT_DETAILS',
  /** The displayed price includes the FPT amount while displaying the values of `ProductPrice.fixed_product_taxes` separately. This value corresponds to 'Including FPT and FPT description'. */
  IncludeFptWithDetails = 'INCLUDE_FPT_WITH_DETAILS'
}

/** Identifies which customer requires remote shopping assistance. */
export type Mage_GenerateCustomerTokenAsAdminInput = {
  /** The email address of the customer requesting remote shopping assistance. */
  customer_email: Scalars['String']['input'];
};

/** Contains the generated customer token. */
export type Mage_GenerateCustomerTokenAsAdminOutput = {
  __typename?: 'Mage_GenerateCustomerTokenAsAdminOutput';
  /** The generated customer token. */
  customer_token: Scalars['String']['output'];
};

/** Gets the payment SDK URLs and values */
export type Mage_GetPaymentSdkOutput = {
  __typename?: 'Mage_GetPaymentSDKOutput';
  /** The payment SDK parameters */
  sdkParams?: Maybe<Array<Maybe<Mage_PaymentSdkParamsItem>>>;
};

export type Mage_GiftCardInfo = {
  __typename?: 'Mage_GiftCardInfo';
  /** Query by balance. */
  balance?: Maybe<Mage_Money>;
  /** Query by code. */
  code?: Maybe<Scalars['String']['output']>;
};

/** Contains the text of a gift message, its sender, and recipient */
export type Mage_GiftMessage = {
  __typename?: 'Mage_GiftMessage';
  /** Sender name */
  from: Scalars['String']['output'];
  /** Gift message text */
  message: Scalars['String']['output'];
  /** Recipient name */
  to: Scalars['String']['output'];
};

/** Contains the text of a gift message, its sender, and recipient */
export type Mage_GiftMessageInput = {
  /** Sender name */
  from: Scalars['String']['input'];
  /** Gift message text */
  message: Scalars['String']['input'];
  /** Recipient name */
  to: Scalars['String']['input'];
};

export type Mage_GooglePayButtonStyles = {
  __typename?: 'Mage_GooglePayButtonStyles';
  /** The button color */
  color?: Maybe<Scalars['String']['output']>;
  /** The button height in pixels */
  height?: Maybe<Scalars['Int']['output']>;
  /** The button type */
  type?: Maybe<Scalars['String']['output']>;
};

export type Mage_GooglePayConfig = Mage_PaymentConfigItem & {
  __typename?: 'Mage_GooglePayConfig';
  /** The styles for the GooglePay Button configuration */
  button_styles?: Maybe<Mage_GooglePayButtonStyles>;
  /** The payment method code as defined in the payment gateway */
  code?: Maybe<Scalars['String']['output']>;
  /** Indicates whether the payment method is displayed */
  is_visible?: Maybe<Scalars['Boolean']['output']>;
  /** Defines the payment intent (Authorize or Capture */
  payment_intent?: Maybe<Scalars['String']['output']>;
  /** The payment source for the payment method */
  payment_source?: Maybe<Scalars['String']['output']>;
  /** The PayPal parameters required to load the JS SDK */
  sdk_params?: Maybe<Array<Maybe<Mage_SdkParams>>>;
  /** The relative order the payment method is displayed on the checkout page */
  sort_order?: Maybe<Scalars['String']['output']>;
  /** 3DS mode */
  three_ds_mode?: Maybe<Mage_ThreeDsMode>;
  /** The name displayed for the payment method */
  title?: Maybe<Scalars['String']['output']>;
};

/** Google Pay inputs */
export type Mage_GooglePayMethodInput = {
  /** The payment source for the payment method */
  payment_source?: InputMaybe<Scalars['String']['input']>;
  /** The payment services order ID */
  payments_order_id?: InputMaybe<Scalars['String']['input']>;
  /** PayPal order ID */
  paypal_order_id?: InputMaybe<Scalars['String']['input']>;
};

/** Defines a grouped product, which consists of simple standalone products that are presented as a group. */
export type Mage_GroupedProduct = Mage_PhysicalProductInterface & Mage_ProductInterface & Mage_RoutableInterface & {
  __typename?: 'Mage_GroupedProduct';
  /** @deprecated Use the `custom_attributes` field instead. */
  activity?: Maybe<Scalars['String']['output']>;
  /**
   * The attribute set assigned to the product.
   * @deprecated The field should not be used on the storefront.
   */
  attribute_set_id?: Maybe<Scalars['Int']['output']>;
  /** The relative canonical URL. This value is returned only if the system setting 'Use Canonical Link Meta Tag For Products' is enabled. */
  canonical_url?: Maybe<Scalars['String']['output']>;
  /** The categories assigned to a product. */
  categories?: Maybe<Array<Maybe<Mage_CategoryInterface>>>;
  /** @deprecated Use the `custom_attributes` field instead. */
  category_gear?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  climate?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  collar?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  color?: Maybe<Scalars['Int']['output']>;
  /** The product's country of origin. */
  country_of_manufacture?: Maybe<Scalars['String']['output']>;
  /**
   * Timestamp indicating when the product was created.
   * @deprecated The field should not be used on the storefront.
   */
  created_at?: Maybe<Scalars['String']['output']>;
  /** Crosssell Products */
  crosssell_products?: Maybe<Array<Maybe<Mage_ProductInterface>>>;
  /** Product custom attributes. */
  custom_attributesV2?: Maybe<Mage_ProductCustomAttributes>;
  /** Detailed information about the product. The value can include simple HTML tags. */
  description?: Maybe<Mage_ComplexTextValue>;
  /** @deprecated Use the `custom_attributes` field instead. */
  eco_collection?: Maybe<Scalars['Int']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  erin_recommends?: Maybe<Scalars['Int']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  features_bags?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  format?: Maybe<Scalars['Int']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  gender?: Maybe<Scalars['String']['output']>;
  /** Returns a value indicating gift message availability for the product. */
  gift_message_available: Scalars['Boolean']['output'];
  /**
   * The ID number assigned to the product.
   * @deprecated Use the `uid` field instead.
   */
  id?: Maybe<Scalars['Int']['output']>;
  /** The relative path to the main image on the product page. */
  image?: Maybe<Mage_ProductImage>;
  /** @deprecated Use the `custom_attributes` field instead. */
  is_seller_product?: Maybe<Scalars['Int']['output']>;
  /** An array containing grouped product items. */
  items?: Maybe<Array<Maybe<Mage_GroupedProductItem>>>;
  /**
   * A number representing the product's manufacturer.
   * @deprecated Use the `custom_attributes` field instead.
   */
  manufacturer?: Maybe<Scalars['Int']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  material?: Maybe<Scalars['String']['output']>;
  /** Maximum Qty Allowed in Shopping Cart */
  max_sale_qty?: Maybe<Scalars['Float']['output']>;
  /** An array of media gallery objects. */
  media_gallery?: Maybe<Array<Maybe<Mage_MediaGalleryInterface>>>;
  /**
   * An array of MediaGalleryEntry objects.
   * @deprecated Use `media_gallery` instead.
   */
  media_gallery_entries?: Maybe<Array<Maybe<Mage_MediaGalleryEntry>>>;
  /** A brief overview of the product for search results listings, maximum 255 characters. */
  meta_description?: Maybe<Scalars['String']['output']>;
  /** A comma-separated list of keywords that are visible only to search engines. */
  meta_keyword?: Maybe<Scalars['String']['output']>;
  /** A string that is displayed in the title bar and tab of the browser and in search results lists. */
  meta_title?: Maybe<Scalars['String']['output']>;
  /** Minimum Qty Allowed in Shopping Cart */
  min_sale_qty?: Maybe<Scalars['Float']['output']>;
  /** The product name. Customers use this name to identify the product. */
  name?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  new?: Maybe<Scalars['Int']['output']>;
  /** The beginning date for new product listings, and determines if the product is featured as a new product. */
  new_from_date?: Maybe<Scalars['String']['output']>;
  /** The end date for new product listings. */
  new_to_date?: Maybe<Scalars['String']['output']>;
  /** Product stock only x left count */
  only_x_left_in_stock?: Maybe<Scalars['Float']['output']>;
  /** If the product has multiple options, determines where they appear on the product page. */
  options_container?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  pattern?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  performance_fabric?: Maybe<Scalars['Int']['output']>;
  /**
   * Indicates the price of an item.
   * @deprecated Use `price_range` for product price information.
   */
  price?: Maybe<Mage_ProductPrices>;
  /** The range of prices for the product */
  price_range: Mage_PriceRange;
  /** An array of `TierPrice` objects. */
  price_tiers?: Maybe<Array<Maybe<Mage_TierPrice>>>;
  /** An array of `ProductLinks` objects. */
  product_links?: Maybe<Array<Maybe<Mage_ProductLinksInterface>>>;
  /** Amount of available stock */
  quantity?: Maybe<Scalars['Float']['output']>;
  /** The average of all the ratings given to the product. */
  rating_summary: Scalars['Float']['output'];
  /** Contains 0 when there is no redirect error. A value of 301 indicates the URL of the requested resource has been changed permanently, while a value of 302 indicates a temporary redirect. */
  redirect_code: Scalars['Int']['output'];
  /** An array of products to be displayed in a Related Products block. */
  related_products?: Maybe<Array<Maybe<Mage_ProductInterface>>>;
  /** The internal relative URL. If the specified URL is a redirect, the query returns the redirected URL, not the original. */
  relative_url?: Maybe<Scalars['String']['output']>;
  /** The total count of all the reviews given to the product. */
  review_count: Scalars['Int']['output'];
  /** The list of products reviews. */
  reviews: Mage_ProductReviews;
  /** @deprecated Use the `custom_attributes` field instead. */
  sale?: Maybe<Scalars['Int']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  seller_id?: Maybe<Scalars['Int']['output']>;
  /** A short description of the product. Its use depends on the theme. */
  short_description?: Maybe<Mage_ComplexTextValue>;
  /** @deprecated Use the `custom_attributes` field instead. */
  size?: Maybe<Scalars['Int']['output']>;
  /** A number or code assigned to a product to identify the product, options, price, and manufacturer. */
  sku?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  sleeve?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  sm_featured?: Maybe<Scalars['Int']['output']>;
  /** The relative path to the small image, which is used on catalog pages. */
  small_image?: Maybe<Mage_ProductImage>;
  /**
   * The beginning date that a product has a special price.
   * @deprecated The field should not be used on the storefront.
   */
  special_from_date?: Maybe<Scalars['String']['output']>;
  /** The discounted price of the product. */
  special_price?: Maybe<Scalars['Float']['output']>;
  /** The end date for a product with a special price. */
  special_to_date?: Maybe<Scalars['String']['output']>;
  /** The status assigned to the product, 0 for disabled, 1 for enabled. */
  status?: Maybe<Scalars['Int']['output']>;
  /** Stock status of the product */
  stock_status?: Maybe<Mage_ProductStockStatus>;
  /** @deprecated Use the `custom_attributes` field instead. */
  strap_bags?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  style_bags?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  style_bottom?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  style_general?: Maybe<Scalars['String']['output']>;
  /** The file name of a swatch image. */
  swatch_image?: Maybe<Scalars['String']['output']>;
  /** The relative path to the product's thumbnail image. */
  thumbnail?: Maybe<Mage_ProductImage>;
  /**
   * The price when tier pricing is in effect and the items purchased threshold has been reached.
   * @deprecated Use `price_tiers` for product tier price information.
   */
  tier_price?: Maybe<Scalars['Float']['output']>;
  /**
   * An array of ProductTierPrices objects.
   * @deprecated Use `price_tiers` for product tier price information.
   */
  tier_prices?: Maybe<Array<Maybe<Mage_ProductTierPrices>>>;
  /** One of PRODUCT, CATEGORY, or CMS_PAGE. */
  type?: Maybe<Mage_UrlRewriteEntityTypeEnum>;
  /**
   * One of simple, virtual, bundle, downloadable, grouped, or configurable.
   * @deprecated Use `__typename` instead.
   */
  type_id?: Maybe<Scalars['String']['output']>;
  /** The unique ID for a `ProductInterface` object. */
  uid: Scalars['ID']['output'];
  /**
   * Timestamp indicating when the product was updated.
   * @deprecated The field should not be used on the storefront.
   */
  updated_at?: Maybe<Scalars['String']['output']>;
  /** Upsell Products */
  upsell_products?: Maybe<Array<Maybe<Mage_ProductInterface>>>;
  /** The part of the URL that identifies the product */
  url_key?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use product's `canonical_url` or url rewrites instead */
  url_path?: Maybe<Scalars['String']['output']>;
  /** URL rewrites list */
  url_rewrites?: Maybe<Array<Maybe<Mage_UrlRewrite>>>;
  /** The part of the product URL that is appended after the url key */
  url_suffix?: Maybe<Scalars['String']['output']>;
  /** The visibility assigned to the product. */
  visibility?: Maybe<Scalars['Int']['output']>;
  /**
   * An array of websites in which the product is available.
   * @deprecated The field should not be used on the storefront.
   */
  websites?: Maybe<Array<Maybe<Mage_Website>>>;
  /** The weight of the item, in units defined by the store. */
  weight?: Maybe<Scalars['Float']['output']>;
};


/** Defines a grouped product, which consists of simple standalone products that are presented as a group. */
export type Mage_GroupedProductCustom_AttributesV2Args = {
  filters?: InputMaybe<Mage_AttributeFilterInput>;
};


/** Defines a grouped product, which consists of simple standalone products that are presented as a group. */
export type Mage_GroupedProductReviewsArgs = {
  currentPage?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
};

/** Contains information about an individual grouped product item. */
export type Mage_GroupedProductItem = {
  __typename?: 'Mage_GroupedProductItem';
  /** The relative position of this item compared to the other group items. */
  position?: Maybe<Scalars['Int']['output']>;
  /** Details about this product option. */
  product?: Maybe<Mage_ProductInterface>;
  /** The quantity of this grouped product item. */
  qty?: Maybe<Scalars['Float']['output']>;
};

/** A grouped product wish list item. */
export type Mage_GroupedProductWishlistItem = Mage_WishlistItemInterface & {
  __typename?: 'Mage_GroupedProductWishlistItem';
  /** The date and time the item was added to the wish list. */
  added_at: Scalars['String']['output'];
  /** Custom options selected for the wish list item. */
  customizable_options: Array<Maybe<Mage_SelectedCustomizableOption>>;
  /** The description of the item. */
  description?: Maybe<Scalars['String']['output']>;
  /** The unique ID for a `WishlistItemInterface` object. */
  id: Scalars['ID']['output'];
  /** Product details of the wish list item. */
  product?: Maybe<Mage_ProductInterface>;
  /** The quantity of this wish list item. */
  quantity: Scalars['Float']['output'];
};

/** Input to retrieve a guest order based on token. */
export type Mage_GuestOrderCancelInput = {
  /** Cancellation reason. */
  reason: Scalars['String']['input'];
  /** Order token. */
  token: Scalars['String']['input'];
};

export type Mage_HostedFieldsConfig = Mage_PaymentConfigItem & {
  __typename?: 'Mage_HostedFieldsConfig';
  /** Vault payment method code */
  cc_vault_code?: Maybe<Scalars['String']['output']>;
  /** The payment method code as defined in the payment gateway */
  code?: Maybe<Scalars['String']['output']>;
  /** Card vault enabled */
  is_vault_enabled?: Maybe<Scalars['Boolean']['output']>;
  /** Indicates whether the payment method is displayed */
  is_visible?: Maybe<Scalars['Boolean']['output']>;
  /** Defines the payment intent (Authorize or Capture */
  payment_intent?: Maybe<Scalars['String']['output']>;
  /** The payment source for the payment method */
  payment_source?: Maybe<Scalars['String']['output']>;
  /** Card and bin details required */
  requires_card_details?: Maybe<Scalars['Boolean']['output']>;
  /** The PayPal parameters required to load the JS SDK */
  sdk_params?: Maybe<Array<Maybe<Mage_SdkParams>>>;
  /** The relative order the payment method is displayed on the checkout page */
  sort_order?: Maybe<Scalars['String']['output']>;
  /**
   * Whether 3DS is activated; true if 3DS mode is not OFF.
   * @deprecated Use 'three_ds_mode' instead.
   */
  three_ds?: Maybe<Scalars['Boolean']['output']>;
  /** 3DS mode */
  three_ds_mode?: Maybe<Mage_ThreeDsMode>;
  /** The name displayed for the payment method */
  title?: Maybe<Scalars['String']['output']>;
};

/** Hosted Fields payment inputs */
export type Mage_HostedFieldsInput = {
  /** Card bin number */
  cardBin?: InputMaybe<Scalars['String']['input']>;
  /** Expiration month of the card */
  cardExpiryMonth?: InputMaybe<Scalars['String']['input']>;
  /** Expiration year of the card */
  cardExpiryYear?: InputMaybe<Scalars['String']['input']>;
  /** Last four digits of the card */
  cardLast4?: InputMaybe<Scalars['String']['input']>;
  /** Name on the card */
  holderName?: InputMaybe<Scalars['String']['input']>;
  /** Indicates whether details about the shopper's credit/debit card should be tokenized for later usage. Required only if Vault is enabled for the Payment Services payment integration. */
  is_active_payment_token_enabler?: InputMaybe<Scalars['Boolean']['input']>;
  /** The payment source for the payment method */
  payment_source?: InputMaybe<Scalars['String']['input']>;
  /** The payment services order ID */
  payments_order_id?: InputMaybe<Scalars['String']['input']>;
  /** PayPal order ID */
  paypal_order_id?: InputMaybe<Scalars['String']['input']>;
};

/** Contains a set of relative URLs that PayPal uses in response to various actions during the authorization process. Magento prepends the base URL to this value to create a full URL. For example, if the full URL is https://www.example.com/path/to/page.html, the relative URL is path/to/page.html. Use this input for Payments Pro Hosted Solution payment method. */
export type Mage_HostedProInput = {
  /** The relative URL of the page that PayPal redirects to when the buyer cancels the transaction in order to choose a different payment method. For example, if the full URL to this page is https://www.example.com/paypal/action/cancel.html, the relative URL is paypal/action/cancel.html. */
  cancel_url: Scalars['String']['input'];
  /** The relative URL of the final confirmation page that PayPal redirects to upon payment success. For example, if the full URL to this page is https://www.example.com/paypal/action/return.html, the relative URL is paypal/action/return.html. */
  return_url: Scalars['String']['input'];
};

/** Contains the secure URL used for the Payments Pro Hosted Solution payment method. */
export type Mage_HostedProUrl = {
  __typename?: 'Mage_HostedProUrl';
  /** The secure URL generated by PayPal. */
  secure_form_url?: Maybe<Scalars['String']['output']>;
};

/** Contains the required input to request the secure URL for Payments Pro Hosted Solution payment. */
export type Mage_HostedProUrlInput = {
  /** The unique ID that identifies the shopper's cart. */
  cart_id: Scalars['String']['input'];
};

/** Contains target path parameters. */
export type Mage_HttpQueryParameter = {
  __typename?: 'Mage_HttpQueryParameter';
  /** A parameter name. */
  name?: Maybe<Scalars['String']['output']>;
  /** A parameter value. */
  value?: Maybe<Scalars['String']['output']>;
};

export type Mage_ImageSwatchData = Mage_SwatchDataInterface & {
  __typename?: 'Mage_ImageSwatchData';
  /** The URL assigned to the thumbnail of the swatch image. */
  thumbnail?: Maybe<Scalars['String']['output']>;
  /** The value can be represented as color (HEX code), image link, or text. */
  value?: Maybe<Scalars['String']['output']>;
};

/** List of templates/filters applied to customer attribute input. */
export enum Mage_InputFilterEnum {
  /** Forces attribute input to follow the date format. */
  Date = 'DATE',
  /** Escape HTML Entities. */
  Escapehtml = 'ESCAPEHTML',
  /** There are no templates or filters to be applied. */
  None = 'NONE',
  /** Strip HTML Tags. */
  Striptags = 'STRIPTAGS',
  /** Strip whitespace (or other characters) from the beginning and end of the input. */
  Trim = 'TRIM'
}

export type Mage_InsufficientStockError = Mage_Error & {
  __typename?: 'Mage_InsufficientStockError';
  /** A cart-specific error code. */
  code: Mage_CartUserInputErrorType;
  /** A localized error message. */
  message: Scalars['String']['output'];
  /** Amount of available stock */
  quantity?: Maybe<Scalars['Float']['output']>;
};

/** Contains an error message when an internal error occurred. */
export type Mage_InternalError = Mage_ErrorInterface & {
  __typename?: 'Mage_InternalError';
  /** The returned error message. */
  message: Scalars['String']['output'];
};

/** Contains invoice details. */
export type Mage_Invoice = {
  __typename?: 'Mage_Invoice';
  /** Comments on the invoice. */
  comments?: Maybe<Array<Maybe<Mage_SalesCommentItem>>>;
  /** The unique ID for a `Invoice` object. */
  id: Scalars['ID']['output'];
  /** Invoiced product details. */
  items?: Maybe<Array<Maybe<Mage_InvoiceItemInterface>>>;
  /** Sequential invoice number. */
  number: Scalars['String']['output'];
  /** Invoice total amount details. */
  total?: Maybe<Mage_InvoiceTotal>;
};

export type Mage_InvoiceItem = Mage_InvoiceItemInterface & {
  __typename?: 'Mage_InvoiceItem';
  /** Information about the final discount amount for the base product, including discounts on options. */
  discounts?: Maybe<Array<Maybe<Mage_Discount>>>;
  /** The unique ID for an `InvoiceItemInterface` object. */
  id: Scalars['ID']['output'];
  /** Details about an individual order item. */
  order_item?: Maybe<Mage_OrderItemInterface>;
  /** The name of the base product. */
  product_name?: Maybe<Scalars['String']['output']>;
  /** The sale price for the base product including selected options. */
  product_sale_price: Mage_Money;
  /** The SKU of the base product. */
  product_sku: Scalars['String']['output'];
  /** The number of invoiced items. */
  quantity_invoiced?: Maybe<Scalars['Float']['output']>;
};

/** Contains detailes about invoiced items. */
export type Mage_InvoiceItemInterface = {
  /** Information about the final discount amount for the base product, including discounts on options. */
  discounts?: Maybe<Array<Maybe<Mage_Discount>>>;
  /** The unique ID for an `InvoiceItemInterface` object. */
  id: Scalars['ID']['output'];
  /** Details about an individual order item. */
  order_item?: Maybe<Mage_OrderItemInterface>;
  /** The name of the base product. */
  product_name?: Maybe<Scalars['String']['output']>;
  /** The sale price for the base product including selected options. */
  product_sale_price: Mage_Money;
  /** The SKU of the base product. */
  product_sku: Scalars['String']['output'];
  /** The number of invoiced items. */
  quantity_invoiced?: Maybe<Scalars['Float']['output']>;
};

/** Contains price details from an invoice. */
export type Mage_InvoiceTotal = {
  __typename?: 'Mage_InvoiceTotal';
  /** The final base grand total amount in the base currency. */
  base_grand_total: Mage_Money;
  /** The applied discounts to the invoice. */
  discounts?: Maybe<Array<Maybe<Mage_Discount>>>;
  /** The final total amount, including shipping, discounts, and taxes. */
  grand_total: Mage_Money;
  /** Details about the shipping and handling costs for the invoice. */
  shipping_handling?: Maybe<Mage_ShippingHandling>;
  /** The subtotal of the invoice, excluding shipping, discounts, and taxes. */
  subtotal: Mage_Money;
  /** The invoice tax details. */
  taxes?: Maybe<Array<Maybe<Mage_TaxItem>>>;
  /** The shipping amount for the invoice. */
  total_shipping: Mage_Money;
  /** The amount of tax applied to the invoice. */
  total_tax: Mage_Money;
};

/** Contains the result of the `isEmailAvailable` query. */
export type Mage_IsEmailAvailableOutput = {
  __typename?: 'Mage_IsEmailAvailableOutput';
  /** Indicates whether the specified email address can be used to create a customer. */
  is_email_available?: Maybe<Scalars['Boolean']['output']>;
};

/** A list of options of the selected bundle product. */
export type Mage_ItemSelectedBundleOption = {
  __typename?: 'Mage_ItemSelectedBundleOption';
  /**
   * The unique ID for a `ItemSelectedBundleOption` object.
   * @deprecated Use `uid` instead.
   */
  id: Scalars['ID']['output'];
  /** The label of the option. */
  label: Scalars['String']['output'];
  /** The unique ID for a `ItemSelectedBundleOption` object. */
  uid: Scalars['ID']['output'];
  /** A list of products that represent the values of the parent option. */
  values?: Maybe<Array<Maybe<Mage_ItemSelectedBundleOptionValue>>>;
};

/** A list of values for the selected bundle product. */
export type Mage_ItemSelectedBundleOptionValue = {
  __typename?: 'Mage_ItemSelectedBundleOptionValue';
  /**
   * The unique ID for a `ItemSelectedBundleOptionValue` object.
   * @deprecated Use `uid` instead.
   */
  id: Scalars['ID']['output'];
  /** The price of the child bundle product. */
  price: Mage_Money;
  /** The name of the child bundle product. */
  product_name: Scalars['String']['output'];
  /** The SKU of the child bundle product. */
  product_sku: Scalars['String']['output'];
  /** The number of this bundle product that were ordered. */
  quantity: Scalars['Float']['output'];
  /** The unique ID for a `ItemSelectedBundleOptionValue` object. */
  uid: Scalars['ID']['output'];
};

/** Contains a key-value pair. */
export type Mage_KeyValue = {
  __typename?: 'Mage_KeyValue';
  /** The name part of the key/value pair. */
  name?: Maybe<Scalars['String']['output']>;
  /** The value part of the key/value pair. */
  value?: Maybe<Scalars['String']['output']>;
};

/** Contains information for rendering layered navigation. */
export type Mage_LayerFilter = {
  __typename?: 'Mage_LayerFilter';
  /**
   * An array of filter items.
   * @deprecated Use `Aggregation.options` instead.
   */
  filter_items?: Maybe<Array<Maybe<Mage_LayerFilterItemInterface>>>;
  /**
   * The count of filter items in filter group.
   * @deprecated Use `Aggregation.count` instead.
   */
  filter_items_count?: Maybe<Scalars['Int']['output']>;
  /**
   * The name of a layered navigation filter.
   * @deprecated Use `Aggregation.label` instead.
   */
  name?: Maybe<Scalars['String']['output']>;
  /**
   * The request variable name for a filter query.
   * @deprecated Use `Aggregation.attribute_code` instead.
   */
  request_var?: Maybe<Scalars['String']['output']>;
};

export type Mage_LayerFilterItem = Mage_LayerFilterItemInterface & {
  __typename?: 'Mage_LayerFilterItem';
  /**
   * The count of items per filter.
   * @deprecated Use `AggregationOption.count` instead.
   */
  items_count?: Maybe<Scalars['Int']['output']>;
  /**
   * The label for a filter.
   * @deprecated Use `AggregationOption.label` instead.
   */
  label?: Maybe<Scalars['String']['output']>;
  /**
   * The value of a filter request variable to be used in query.
   * @deprecated Use `AggregationOption.value` instead.
   */
  value_string?: Maybe<Scalars['String']['output']>;
};

export type Mage_LayerFilterItemInterface = {
  /**
   * The count of items per filter.
   * @deprecated Use `AggregationOption.count` instead.
   */
  items_count?: Maybe<Scalars['Int']['output']>;
  /**
   * The label for a filter.
   * @deprecated Use `AggregationOption.label` instead.
   */
  label?: Maybe<Scalars['String']['output']>;
  /**
   * The value of a filter request variable to be used in query.
   * @deprecated Use `AggregationOption.value` instead.
   */
  value_string?: Maybe<Scalars['String']['output']>;
};

/** Defines characteristics about images and videos associated with a specific product. */
export type Mage_MediaGalleryEntry = {
  __typename?: 'Mage_MediaGalleryEntry';
  /** Details about the content of the media gallery item. */
  content?: Maybe<Mage_ProductMediaGalleryEntriesContent>;
  /** Indicates whether the image is hidden from view. */
  disabled?: Maybe<Scalars['Boolean']['output']>;
  /** The path of the image on the server. */
  file?: Maybe<Scalars['String']['output']>;
  /**
   * The identifier assigned to the object.
   * @deprecated Use `uid` instead.
   */
  id?: Maybe<Scalars['Int']['output']>;
  /** The alt text displayed on the storefront when the user points to the image. */
  label?: Maybe<Scalars['String']['output']>;
  /** Either `image` or `video`. */
  media_type?: Maybe<Scalars['String']['output']>;
  /** The media item's position after it has been sorted. */
  position?: Maybe<Scalars['Int']['output']>;
  /** Array of image types. It can have the following values: image, small_image, thumbnail. */
  types?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** The unique ID for a `MediaGalleryEntry` object. */
  uid: Scalars['ID']['output'];
  /** Details about the content of a video item. */
  video_content?: Maybe<Mage_ProductMediaGalleryEntriesVideoContent>;
};

/** Contains basic information about a product image or video. */
export type Mage_MediaGalleryInterface = {
  /** Indicates whether the image is hidden from view. */
  disabled?: Maybe<Scalars['Boolean']['output']>;
  /** The label of the product image or video. */
  label?: Maybe<Scalars['String']['output']>;
  /** The media item's position after it has been sorted. */
  position?: Maybe<Scalars['Int']['output']>;
  /** The URL of the product image or video. */
  url?: Maybe<Scalars['String']['output']>;
};

export type Mage_MessageStyleLogo = {
  __typename?: 'Mage_MessageStyleLogo';
  /** The type of logo for the PayPal Pay Later messaging */
  type?: Maybe<Scalars['String']['output']>;
};

export type Mage_MessageStyles = {
  __typename?: 'Mage_MessageStyles';
  /** The message layout */
  layout?: Maybe<Scalars['String']['output']>;
  /** The message logo */
  logo?: Maybe<Mage_MessageStyleLogo>;
};

export type Mage_ModuleConfiguration = {
  __typename?: 'Mage_ModuleConfiguration';
  /** The Public Key of the Stripe payment. */
  apiKey?: Maybe<Scalars['String']['output']>;
  /** Module Version and Partner ID etc */
  appInfo?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  /** Serialized options that can be used to initialize the Elements object */
  elementsOptions?: Maybe<Scalars['String']['output']>;
  /** Locale */
  locale?: Maybe<Scalars['String']['output']>;
  /** Betas and API version */
  options?: Maybe<Mage_ModuleOptions>;
};

export type Mage_ModuleOptions = {
  __typename?: 'Mage_ModuleOptions';
  /** API Version */
  apiVersion?: Maybe<Scalars['String']['output']>;
  /** Betas. */
  betas?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
};

export type Mage_MollieApplePayValidationOutput = {
  __typename?: 'Mage_MollieApplePayValidationOutput';
  response: Scalars['String']['output'];
};

export type Mage_MollieIssuer = {
  __typename?: 'Mage_MollieIssuer';
  code?: Maybe<Scalars['String']['output']>;
  image?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  svg?: Maybe<Scalars['String']['output']>;
};

export type Mage_MolliePaymentFee = {
  __typename?: 'Mage_MolliePaymentFee';
  /** Base mollie payment fee */
  base_fee?: Maybe<Mage_Money>;
  /** Base mollie payment fee tax */
  base_fee_tax?: Maybe<Mage_Money>;
  /** Mollie payment fee */
  fee?: Maybe<Mage_Money>;
  /** Mollie payment fee tax */
  fee_tax?: Maybe<Mage_Money>;
};

export type Mage_MolliePaymentLinkRedirectOutput = {
  __typename?: 'Mage_MolliePaymentLinkRedirectOutput';
  already_paid: Scalars['Boolean']['output'];
  is_expired: Scalars['Boolean']['output'];
  redirect_url?: Maybe<Scalars['String']['output']>;
};

export type Mage_MolliePaymentMethod = {
  __typename?: 'Mage_MolliePaymentMethod';
  code?: Maybe<Scalars['String']['output']>;
  image?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type Mage_MolliePaymentMethodMeta = {
  __typename?: 'Mage_MolliePaymentMethodMeta';
  image?: Maybe<Scalars['String']['output']>;
};

export type Mage_MolliePaymentMethodsInput = {
  amount: Scalars['Float']['input'];
  currency?: InputMaybe<Scalars['String']['input']>;
};

export type Mage_MolliePaymentMethodsOutput = {
  __typename?: 'Mage_MolliePaymentMethodsOutput';
  methods?: Maybe<Array<Maybe<Mage_MolliePaymentMethod>>>;
};

export type Mage_MollieProcessTransactionInput = {
  /** The payment token returned from the PlaceOrder call/added to the return URL */
  payment_token: Scalars['String']['input'];
};

export type Mage_MollieProcessTransactionOutput = {
  __typename?: 'Mage_MollieProcessTransactionOutput';
  /** The cart is only available when the payment status is failed, canceled or expired. */
  cart?: Maybe<Mage_Cart>;
  paymentStatus?: Maybe<Mage_PaymentStatusEnum>;
  /** Indicates if the customer should be redirected to the cart. */
  redirect_to_cart?: Maybe<Scalars['Boolean']['output']>;
  /** Indicates if the customer should be redirected to the success page. */
  redirect_to_success_page?: Maybe<Scalars['Boolean']['output']>;
};

export type Mage_MollieResetCartInput = {
  /** The unique ID that identifies the customer's cart */
  cart_id: Scalars['String']['input'];
};

export type Mage_MollieResetCartOutput = {
  __typename?: 'Mage_MollieResetCartOutput';
  cart: Mage_Cart;
};

export type Mage_MollieStoreConfig = {
  __typename?: 'Mage_MollieStoreConfig';
  /** Is Mollie running in live mode? */
  live_mode?: Maybe<Scalars['Boolean']['output']>;
  /** The profile ID used for this store */
  profile_id?: Maybe<Scalars['String']['output']>;
};

export type Mage_MollieTerminalOutput = {
  __typename?: 'Mage_MollieTerminalOutput';
  brand: Scalars['String']['output'];
  description: Scalars['String']['output'];
  id: Scalars['String']['output'];
  model: Scalars['String']['output'];
  serialNumber?: Maybe<Scalars['String']['output']>;
};

export type Mage_MollieTransactionInput = {
  issuer?: InputMaybe<Scalars['String']['input']>;
  payment_token: Scalars['String']['input'];
};

export type Mage_MollieTransactionOutput = {
  __typename?: 'Mage_MollieTransactionOutput';
  checkout_url?: Maybe<Scalars['String']['output']>;
};

/** Defines a monetary value, including a numeric value and a currency code. */
export type Mage_Money = {
  __typename?: 'Mage_Money';
  /** A three-letter currency code, such as USD or EUR. */
  currency?: Maybe<Mage_CurrencyEnum>;
  /** A number expressing a monetary value. */
  value?: Maybe<Scalars['Float']['output']>;
};

/** Contains an error message when an invalid UID was specified. */
export type Mage_NoSuchEntityUidError = Mage_ErrorInterface & {
  __typename?: 'Mage_NoSuchEntityUidError';
  /** The returned error message. */
  message: Scalars['String']['output'];
  /** The specified invalid unique ID of an object. */
  uid: Scalars['ID']['output'];
};

/** Contains the order ID. */
export type Mage_Order = {
  __typename?: 'Mage_Order';
  /** The client secret of the PaymentIntent or SetupIntent that is associated with this order */
  client_secret?: Maybe<Scalars['String']['output']>;
  mollie_payment_token?: Maybe<Scalars['String']['output']>;
  mollie_redirect_url?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use `order_number` instead. */
  order_id?: Maybe<Scalars['String']['output']>;
  /** The unique ID for an `Order` object. */
  order_number: Scalars['String']['output'];
};

/** The list of available order actions. */
export enum Mage_OrderActionType {
  Cancel = 'CANCEL',
  Reorder = 'REORDER'
}

/** Contains detailed information about an order's billing and shipping addresses. */
export type Mage_OrderAddress = {
  __typename?: 'Mage_OrderAddress';
  /** The city or town. */
  city: Scalars['String']['output'];
  /** The customer's company. */
  company?: Maybe<Scalars['String']['output']>;
  /** The customer's country. */
  country_code?: Maybe<Mage_CountryCodeEnum>;
  /** The fax number. */
  fax?: Maybe<Scalars['String']['output']>;
  /** The first name of the person associated with the shipping/billing address. */
  firstname: Scalars['String']['output'];
  /** The family name of the person associated with the shipping/billing address. */
  lastname: Scalars['String']['output'];
  /** The middle name of the person associated with the shipping/billing address. */
  middlename?: Maybe<Scalars['String']['output']>;
  /** The customer's ZIP or postal code. */
  postcode?: Maybe<Scalars['String']['output']>;
  /** An honorific, such as Dr., Mr., or Mrs. */
  prefix?: Maybe<Scalars['String']['output']>;
  /** The state or province name. */
  region?: Maybe<Scalars['String']['output']>;
  /** The unique ID for a `Region` object of a pre-defined region. */
  region_id?: Maybe<Scalars['ID']['output']>;
  /** An array of strings that define the street number and name. */
  street: Array<Maybe<Scalars['String']['output']>>;
  /** A value such as Sr., Jr., or III. */
  suffix?: Maybe<Scalars['String']['output']>;
  /** The telephone number. */
  telephone?: Maybe<Scalars['String']['output']>;
  /** The customer's Value-added tax (VAT) number (for corporate customers). */
  vat_id?: Maybe<Scalars['String']['output']>;
};

export type Mage_OrderCustomerInfo = {
  __typename?: 'Mage_OrderCustomerInfo';
  /** First name of the customer */
  firstname: Scalars['String']['output'];
  /** Last name of the customer */
  lastname?: Maybe<Scalars['String']['output']>;
  /** Middle name of the customer */
  middlename?: Maybe<Scalars['String']['output']>;
  /** Prefix of the customer */
  prefix?: Maybe<Scalars['String']['output']>;
  /** Suffix of the customer */
  suffix?: Maybe<Scalars['String']['output']>;
};

/** Input to retrieve an order based on details. */
export type Mage_OrderInformationInput = {
  /** Order billing address email. */
  email: Scalars['String']['input'];
  /** Order billing address lastname. */
  lastname: Scalars['String']['input'];
  /** Order number. */
  number: Scalars['String']['input'];
};

export type Mage_OrderItem = Mage_OrderItemInterface & {
  __typename?: 'Mage_OrderItem';
  /** The final discount information for the product. */
  discounts?: Maybe<Array<Maybe<Mage_Discount>>>;
  /** The entered option for the base product, such as a logo or image. */
  entered_options?: Maybe<Array<Maybe<Mage_OrderItemOption>>>;
  /** The selected gift message for the order item */
  gift_message?: Maybe<Mage_GiftMessage>;
  /** The unique ID for an `OrderItemInterface` object. */
  id: Scalars['ID']['output'];
  /** Contains details about the price of the item, including taxes and discounts. */
  prices?: Maybe<Mage_OrderItemPrices>;
  /** The ProductInterface object, which contains details about the base product */
  product?: Maybe<Mage_ProductInterface>;
  /** The name of the base product. */
  product_name?: Maybe<Scalars['String']['output']>;
  /** The sale price of the base product, including selected options. */
  product_sale_price: Mage_Money;
  /** The SKU of the base product. */
  product_sku: Scalars['String']['output'];
  /** The type of product, such as simple, configurable, etc. */
  product_type?: Maybe<Scalars['String']['output']>;
  /** URL key of the base product. */
  product_url_key?: Maybe<Scalars['String']['output']>;
  /** The number of canceled items. */
  quantity_canceled?: Maybe<Scalars['Float']['output']>;
  /** The number of invoiced items. */
  quantity_invoiced?: Maybe<Scalars['Float']['output']>;
  /** The number of units ordered for this item. */
  quantity_ordered?: Maybe<Scalars['Float']['output']>;
  /** The number of refunded items. */
  quantity_refunded?: Maybe<Scalars['Float']['output']>;
  /** The number of returned items. */
  quantity_returned?: Maybe<Scalars['Float']['output']>;
  /** The number of shipped items. */
  quantity_shipped?: Maybe<Scalars['Float']['output']>;
  /** The selected options for the base product, such as color or size. */
  selected_options?: Maybe<Array<Maybe<Mage_OrderItemOption>>>;
  /** The status of the order item. */
  status?: Maybe<Scalars['String']['output']>;
};

/** Order item details. */
export type Mage_OrderItemInterface = {
  /** The final discount information for the product. */
  discounts?: Maybe<Array<Maybe<Mage_Discount>>>;
  /** The entered option for the base product, such as a logo or image. */
  entered_options?: Maybe<Array<Maybe<Mage_OrderItemOption>>>;
  /** The selected gift message for the order item */
  gift_message?: Maybe<Mage_GiftMessage>;
  /** The unique ID for an `OrderItemInterface` object. */
  id: Scalars['ID']['output'];
  /** Contains details about the price of the item, including taxes and discounts. */
  prices?: Maybe<Mage_OrderItemPrices>;
  /** The ProductInterface object, which contains details about the base product */
  product?: Maybe<Mage_ProductInterface>;
  /** The name of the base product. */
  product_name?: Maybe<Scalars['String']['output']>;
  /** The sale price of the base product, including selected options. */
  product_sale_price: Mage_Money;
  /** The SKU of the base product. */
  product_sku: Scalars['String']['output'];
  /** The type of product, such as simple, configurable, etc. */
  product_type?: Maybe<Scalars['String']['output']>;
  /** URL key of the base product. */
  product_url_key?: Maybe<Scalars['String']['output']>;
  /** The number of canceled items. */
  quantity_canceled?: Maybe<Scalars['Float']['output']>;
  /** The number of invoiced items. */
  quantity_invoiced?: Maybe<Scalars['Float']['output']>;
  /** The number of units ordered for this item. */
  quantity_ordered?: Maybe<Scalars['Float']['output']>;
  /** The number of refunded items. */
  quantity_refunded?: Maybe<Scalars['Float']['output']>;
  /** The number of returned items. */
  quantity_returned?: Maybe<Scalars['Float']['output']>;
  /** The number of shipped items. */
  quantity_shipped?: Maybe<Scalars['Float']['output']>;
  /** The selected options for the base product, such as color or size. */
  selected_options?: Maybe<Array<Maybe<Mage_OrderItemOption>>>;
  /** The status of the order item. */
  status?: Maybe<Scalars['String']['output']>;
};

/** Represents order item options like selected or entered. */
export type Mage_OrderItemOption = {
  __typename?: 'Mage_OrderItemOption';
  /** The name of the option. */
  label: Scalars['String']['output'];
  /** The value of the option. */
  value: Scalars['String']['output'];
};

export type Mage_OrderItemPrices = {
  __typename?: 'Mage_OrderItemPrices';
  /** An array of discounts to be applied to the cart item. */
  discounts?: Maybe<Array<Maybe<Mage_Discount>>>;
  fixed_product_taxes: Array<Maybe<Mage_FixedProductTax>>;
  /** The original price of the item. */
  original_price?: Maybe<Mage_Money>;
  /** The original price of the item including tax. */
  original_price_including_tax?: Maybe<Mage_Money>;
  /** The value of the original price multiplied by the quantity of the item. */
  original_row_total: Mage_Money;
  /** The value of the original price multiplied by the quantity of the item including tax. */
  original_row_total_including_tax: Mage_Money;
  /** The price of the item before any discounts were applied. The price that might include tax, depending on the configured display settings for cart. */
  price: Mage_Money;
  /** The price of the item before any discounts were applied. The price that might include tax, depending on the configured display settings for cart. */
  price_including_tax: Mage_Money;
  /** The value of the price multiplied by the quantity of the item. */
  row_total: Mage_Money;
  /** The value of `row_total` plus the tax applied to the item. */
  row_total_including_tax: Mage_Money;
  /** The total of all discounts applied to the item. */
  total_item_discount: Mage_Money;
};

/** Contains details about the payment method used to pay for the order. */
export type Mage_OrderPaymentMethod = {
  __typename?: 'Mage_OrderPaymentMethod';
  /** Additional data per payment method type. */
  additional_data?: Maybe<Array<Maybe<Mage_KeyValue>>>;
  /** The label that describes the payment method. */
  name: Scalars['String']['output'];
  /** The payment method code that indicates how the order was paid for. */
  type: Scalars['String']['output'];
};

/** Contains order shipment details. */
export type Mage_OrderShipment = {
  __typename?: 'Mage_OrderShipment';
  /** Comments added to the shipment. */
  comments?: Maybe<Array<Maybe<Mage_SalesCommentItem>>>;
  /** The unique ID for a `OrderShipment` object. */
  id: Scalars['ID']['output'];
  /** An array of items included in the shipment. */
  items?: Maybe<Array<Maybe<Mage_ShipmentItemInterface>>>;
  /** The sequential credit shipment number. */
  number: Scalars['String']['output'];
  /** An array of shipment tracking details. */
  tracking?: Maybe<Array<Maybe<Mage_ShipmentTracking>>>;
};

/** Input to retrieve an order based on token. */
export type Mage_OrderTokenInput = {
  /** Order token. */
  token: Scalars['String']['input'];
};

/** Contains details about the sales total amounts used to calculate the final price. */
export type Mage_OrderTotal = {
  __typename?: 'Mage_OrderTotal';
  /** The final base grand total amount in the base currency. */
  base_grand_total: Mage_Money;
  /** The applied discounts to the order. */
  discounts?: Maybe<Array<Maybe<Mage_Discount>>>;
  /** The final total amount, including shipping, discounts, and taxes. */
  grand_total: Mage_Money;
  /** Details about the shipping and handling costs for the order. */
  shipping_handling?: Maybe<Mage_ShippingHandling>;
  /**
   * The subtotal of the order, excluding shipping, discounts, and taxes.
   * @deprecated Use subtotal_excl_tax field instead
   */
  subtotal: Mage_Money;
  /** The subtotal of the order, excluding taxes. */
  subtotal_excl_tax: Mage_Money;
  /** The subtotal of the order, including taxes. */
  subtotal_incl_tax: Mage_Money;
  /** The order tax details. */
  taxes?: Maybe<Array<Maybe<Mage_TaxItem>>>;
  /** The shipping amount for the order. */
  total_shipping: Mage_Money;
  /** The amount of tax applied to the order. */
  total_tax: Mage_Money;
};

/** Contains required input for Payflow Express Checkout payments. */
export type Mage_PayflowExpressInput = {
  /** The unique ID of the PayPal user. */
  payer_id: Scalars['String']['input'];
  /** The token returned by the createPaypalExpressToken mutation. */
  token: Scalars['String']['input'];
};

/** A set of relative URLs that PayPal uses in response to various actions during the authorization process. Adobe Commerce prepends the base URL to this value to create a full URL. For example, if the full URL is https://www.example.com/path/to/page.html, the relative URL is path/to/page.html. Use this input for Payflow Link and Payments Advanced payment methods. */
export type Mage_PayflowLinkInput = {
  /** The relative URL of the page that PayPal redirects to when the buyer cancels the transaction in order to choose a different payment method. If the full URL to this page is https://www.example.com/paypal/action/cancel.html, the relative URL is paypal/action/cancel.html. */
  cancel_url: Scalars['String']['input'];
  /** The relative URL of the transaction error page that PayPal redirects to upon payment error. If the full URL to this page is https://www.example.com/paypal/action/error.html, the relative URL is paypal/action/error.html. */
  error_url: Scalars['String']['input'];
  /** The relative URL of the order confirmation page that PayPal redirects to when the payment is successful and additional confirmation is not needed. If the full URL to this page is https://www.example.com/paypal/action/return.html, the relative URL is paypal/action/return.html. */
  return_url: Scalars['String']['input'];
};

/** Indicates the mode for payment. Applies to the Payflow Link and Payments Advanced payment methods. */
export enum Mage_PayflowLinkMode {
  Live = 'LIVE',
  Test = 'TEST'
}

/** Contains information used to generate PayPal iframe for transaction. Applies to Payflow Link and Payments Advanced payment methods. */
export type Mage_PayflowLinkToken = {
  __typename?: 'Mage_PayflowLinkToken';
  /** The mode for the Payflow transaction. */
  mode?: Maybe<Mage_PayflowLinkMode>;
  /** The PayPal URL used for requesting a Payflow form. */
  paypal_url?: Maybe<Scalars['String']['output']>;
  /** The secure token generated by PayPal. */
  secure_token?: Maybe<Scalars['String']['output']>;
  /** The secure token ID generated by PayPal. */
  secure_token_id?: Maybe<Scalars['String']['output']>;
};

/** Contains information required to fetch payment token information for the Payflow Link and Payments Advanced payment methods. */
export type Mage_PayflowLinkTokenInput = {
  /** The unique ID that identifies the customer's cart. */
  cart_id: Scalars['String']['input'];
};

/** Contains input for the Payflow Pro and Payments Pro payment methods. */
export type Mage_PayflowProInput = {
  /** Required input for credit card related information. */
  cc_details: Mage_CreditCardDetailsInput;
  /** Indicates whether details about the shopper's credit/debit card should be tokenized for later usage. Required only if Vault is enabled for the PayPal Payflow Pro payment integration. */
  is_active_payment_token_enabler?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Input required to complete payment. Applies to Payflow Pro and Payments Pro payment methods. */
export type Mage_PayflowProResponseInput = {
  /** The unique ID that identifies the shopper's cart. */
  cart_id: Scalars['String']['input'];
  /** The payload returned from PayPal. */
  paypal_payload: Scalars['String']['input'];
};

export type Mage_PayflowProResponseOutput = {
  __typename?: 'Mage_PayflowProResponseOutput';
  /** The cart with the updated selected payment method. */
  cart: Mage_Cart;
};

/** Contains the secure information used to authorize transaction. Applies to Payflow Pro and Payments Pro payment methods. */
export type Mage_PayflowProToken = {
  __typename?: 'Mage_PayflowProToken';
  /** The RESPMSG returned by PayPal. If the `result` is `0`, then `response_message` is `Approved`. */
  response_message: Scalars['String']['output'];
  /** A non-zero value if any errors occurred. */
  result: Scalars['Int']['output'];
  /** The RESULT returned by PayPal. A value of `0` indicates the transaction was approved. */
  result_code: Scalars['Int']['output'];
  /** A secure token generated by PayPal. */
  secure_token: Scalars['String']['output'];
  /** A secure token ID generated by PayPal. */
  secure_token_id: Scalars['String']['output'];
};

/** Contains input required to fetch payment token information for the Payflow Pro and Payments Pro payment methods. */
export type Mage_PayflowProTokenInput = {
  /** The unique ID that identifies the shopper's cart. */
  cart_id: Scalars['String']['input'];
  /** A set of relative URLs that PayPal uses for callback. */
  urls: Mage_PayflowProUrlInput;
};

/** Contains a set of relative URLs that PayPal uses in response to various actions during the authorization process. Magento prepends the base URL to this value to create a full URL. For example, if the full URL is https://www.example.com/path/to/page.html, the relative URL is path/to/page.html. Use this input for the Payflow Pro and Payment Pro payment methods. */
export type Mage_PayflowProUrlInput = {
  /** The relative URL of the page that PayPal redirects to when the buyer cancels the transaction in order to choose a different payment method. If the full URL to this page is https://www.example.com/paypal/action/cancel.html, the relative URL is paypal/action/cancel.html. */
  cancel_url: Scalars['String']['input'];
  /** The relative URL of the transaction error page that PayPal redirects to upon payment error. If the full URL to this page is https://www.example.com/paypal/action/error.html, the relative URL is paypal/action/error.html. */
  error_url: Scalars['String']['input'];
  /** The relative URL of the final confirmation page that PayPal redirects to upon payment success. If the full URL to this page is https://www.example.com/paypal/action/return.html, the relative URL is paypal/action/return.html. */
  return_url: Scalars['String']['input'];
};

export type Mage_PaymentCommonConfig = Mage_PaymentConfigItem & {
  __typename?: 'Mage_PaymentCommonConfig';
  /** The payment method code as defined in the payment gateway */
  code?: Maybe<Scalars['String']['output']>;
  /** Indicates whether the payment method is displayed */
  is_visible?: Maybe<Scalars['Boolean']['output']>;
  /** Defines the payment intent (Authorize or Capture */
  payment_intent?: Maybe<Scalars['String']['output']>;
  /** The PayPal parameters required to load the JS SDK */
  sdk_params?: Maybe<Array<Maybe<Mage_SdkParams>>>;
  /** The relative order the payment method is displayed on the checkout page */
  sort_order?: Maybe<Scalars['String']['output']>;
  /** The name displayed for the payment method */
  title?: Maybe<Scalars['String']['output']>;
};

/** Contains payment fields that are common to all types of payment methods. */
export type Mage_PaymentConfigItem = {
  /** The payment method code as defined in the payment gateway */
  code?: Maybe<Scalars['String']['output']>;
  /** Indicates whether the payment method is displayed */
  is_visible?: Maybe<Scalars['Boolean']['output']>;
  /** Defines the payment intent (Authorize or Capture */
  payment_intent?: Maybe<Scalars['String']['output']>;
  /** The PayPal parameters required to load the JS SDK */
  sdk_params?: Maybe<Array<Maybe<Mage_SdkParams>>>;
  /** The relative order the payment method is displayed on the checkout page */
  sort_order?: Maybe<Scalars['String']['output']>;
  /** The name displayed for the payment method */
  title?: Maybe<Scalars['String']['output']>;
};

/** Retrieves the payment configuration for a given location */
export type Mage_PaymentConfigOutput = {
  __typename?: 'Mage_PaymentConfigOutput';
  /** ApplePay payment method configuration */
  apple_pay?: Maybe<Mage_ApplePayConfig>;
  /** Fastlane payment method configuration */
  fastlane?: Maybe<Mage_FastlaneConfig>;
  /** GooglePay payment method configuration */
  google_pay?: Maybe<Mage_GooglePayConfig>;
  /** Hosted fields payment method configuration */
  hosted_fields?: Maybe<Mage_HostedFieldsConfig>;
  /** Smart Buttons payment method configuration */
  smart_buttons?: Maybe<Mage_SmartButtonsConfig>;
};

/** Defines the origin location for that payment request */
export enum Mage_PaymentLocation {
  Admin = 'ADMIN',
  Cart = 'CART',
  Checkout = 'CHECKOUT',
  Minicart = 'MINICART',
  ProductDetail = 'PRODUCT_DETAIL',
  StartOfCheckout = 'START_OF_CHECKOUT'
}

export type Mage_PaymentMethod = {
  __typename?: 'Mage_PaymentMethod';
  /** Available issuers for this payment method */
  mollie_available_issuers?: Maybe<Array<Maybe<Mage_MollieIssuer>>>;
  /** Retrieve meta information for this payment method (image) */
  mollie_meta: Mage_MolliePaymentMethodMeta;
};

/** Defines the payment method. */
export type Mage_PaymentMethodInput = {
  braintree?: InputMaybe<Mage_BraintreeInput>;
  braintree_ach_direct_debit?: InputMaybe<Mage_BraintreeInput>;
  braintree_ach_direct_debit_vault?: InputMaybe<Mage_BraintreeVaultInput>;
  braintree_applepay_vault?: InputMaybe<Mage_BraintreeVaultInput>;
  braintree_cc_vault?: InputMaybe<Mage_BraintreeCcVaultInput>;
  braintree_googlepay_vault?: InputMaybe<Mage_BraintreeVaultInput>;
  braintree_paypal?: InputMaybe<Mage_BraintreeInput>;
  braintree_paypal_vault?: InputMaybe<Mage_BraintreeVaultInput>;
  /** The internal name for the payment method. */
  code: Scalars['String']['input'];
  /** Required input for PayPal Hosted pro payments. */
  hosted_pro?: InputMaybe<Mage_HostedProInput>;
  /** The Apple Pay payment token */
  mollie_applepay_payment_token?: InputMaybe<Scalars['String']['input']>;
  /** The card token provided by Mollie Components */
  mollie_card_token?: InputMaybe<Scalars['String']['input']>;
  /** Provided the issuer chosen by the end-user */
  mollie_selected_issuer?: InputMaybe<Scalars['String']['input']>;
  /** Provided the terminal chosen */
  mollie_selected_terminal?: InputMaybe<Scalars['String']['input']>;
  /** Required input for Payflow Express Checkout payments. */
  payflow_express?: InputMaybe<Mage_PayflowExpressInput>;
  /** Required input for PayPal Payflow Link and Payments Advanced payments. */
  payflow_link?: InputMaybe<Mage_PayflowLinkInput>;
  /** Required input for PayPal Payflow Pro and Payment Pro payments. */
  payflowpro?: InputMaybe<Mage_PayflowProInput>;
  /** Required input for PayPal Payflow Pro vault payments. */
  payflowpro_cc_vault?: InputMaybe<Mage_VaultTokenInput>;
  /** Required input for Apple Pay button */
  payment_services_paypal_apple_pay?: InputMaybe<Mage_ApplePayMethodInput>;
  /** Required input for fastlane */
  payment_services_paypal_fastlane?: InputMaybe<Mage_FastlaneMethodInput>;
  /** Required input for Google Pay button */
  payment_services_paypal_google_pay?: InputMaybe<Mage_GooglePayMethodInput>;
  /** Required input for Hosted Fields */
  payment_services_paypal_hosted_fields?: InputMaybe<Mage_HostedFieldsInput>;
  /** Required input for Smart buttons */
  payment_services_paypal_smart_buttons?: InputMaybe<Mage_SmartButtonMethodInput>;
  /** Required input for vault */
  payment_services_paypal_vault?: InputMaybe<Mage_VaultMethodInput>;
  /** Required input for Express Checkout and Payments Standard payments. */
  paypal_express?: InputMaybe<Mage_PaypalExpressInput>;
  /** The purchase order number. Optional for most payment methods. */
  purchase_order_number?: InputMaybe<Scalars['String']['input']>;
  /** Required input for Stripe Payments */
  stripe_payments?: InputMaybe<Mage_StripePaymentsInput>;
};

/** Contains the payment order details */
export type Mage_PaymentOrderOutput = {
  __typename?: 'Mage_PaymentOrderOutput';
  /** PayPal order ID */
  id?: Maybe<Scalars['String']['output']>;
  /** The order ID generated by Payment Services */
  mp_order_id?: Maybe<Scalars['String']['output']>;
  /** Details about the card used on the order */
  payment_source_details?: Maybe<Mage_PaymentSourceDetails>;
  /** The status of the payment order */
  status?: Maybe<Scalars['String']['output']>;
};

export type Mage_PaymentSdkParamsItem = {
  __typename?: 'Mage_PaymentSDKParamsItem';
  /** The payment method code used in the order */
  code?: Maybe<Scalars['String']['output']>;
  /** The payment SDK parameters */
  params?: Maybe<Array<Maybe<Mage_SdkParams>>>;
};

export type Mage_PaymentSourceDetails = {
  __typename?: 'Mage_PaymentSourceDetails';
  /** Details about the card used on the order */
  card?: Maybe<Mage_Card>;
};

/** The payment source information */
export type Mage_PaymentSourceInput = {
  /** The card payment source information */
  card: Mage_CardPaymentSourceInput;
};

/** The payment source information */
export type Mage_PaymentSourceOutput = {
  __typename?: 'Mage_PaymentSourceOutput';
  /** The card payment source information */
  card: Mage_CardPaymentSourceOutput;
};

export enum Mage_PaymentStatusEnum {
  Authorized = 'AUTHORIZED',
  Canceled = 'CANCELED',
  Completed = 'COMPLETED',
  Created = 'CREATED',
  Error = 'ERROR',
  Expired = 'EXPIRED',
  Failed = 'FAILED',
  Open = 'OPEN',
  Paid = 'PAID',
  Pending = 'PENDING',
  Refunded = 'REFUNDED',
  Shipping = 'SHIPPING'
}

/** The stored payment method available to the customer. */
export type Mage_PaymentToken = {
  __typename?: 'Mage_PaymentToken';
  /** A description of the stored account details. */
  details?: Maybe<Scalars['String']['output']>;
  /** The payment method code associated with the token. */
  payment_method_code: Scalars['String']['output'];
  /** The public hash of the token. */
  public_hash: Scalars['String']['output'];
  /** Specifies the payment token type. */
  type: Mage_PaymentTokenTypeEnum;
};

/** The list of available payment token types. */
export enum Mage_PaymentTokenTypeEnum {
  /** phpcs:ignore Magento2.GraphQL.ValidArgumentName */
  Account = 'account',
  /** phpcs:ignore Magento2.GraphQL.ValidArgumentName */
  Card = 'card'
}

/** Contains required input for Express Checkout and Payments Standard payments. */
export type Mage_PaypalExpressInput = {
  /** The unique ID of the PayPal user. */
  payer_id: Scalars['String']['input'];
  /** The token returned by the `createPaypalExpressToken` mutation. */
  token: Scalars['String']['input'];
};

/** Deprecated. Use `PaypalExpressTokenOutput` instead. */
export type Mage_PaypalExpressToken = {
  __typename?: 'Mage_PaypalExpressToken';
  /**
   * A set of URLs that allow the buyer to authorize payment and adjust checkout details.
   * @deprecated Use `PaypalExpressTokenOutput.paypal_urls` instead.
   */
  paypal_urls?: Maybe<Mage_PaypalExpressUrlList>;
  /**
   * The token returned by PayPal.
   * @deprecated Use `PaypalExpressTokenOutput.token` instead.
   */
  token?: Maybe<Scalars['String']['output']>;
};

/** Defines the attributes required to receive a payment token for Express Checkout and Payments Standard payment methods. */
export type Mage_PaypalExpressTokenInput = {
  /** The unique ID that identifies the customer's cart. */
  cart_id: Scalars['String']['input'];
  /** The payment method code. */
  code: Scalars['String']['input'];
  /** Indicates whether the buyer selected the quick checkout button. The default value is false. */
  express_button?: InputMaybe<Scalars['Boolean']['input']>;
  /** A set of relative URLs that PayPal uses in response to various actions during the authorization process. */
  urls: Mage_PaypalExpressUrlsInput;
  /** Indicates whether the buyer clicked the PayPal credit button. The default value is false. */
  use_paypal_credit?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Contains the token returned by PayPal and a set of URLs that allow the buyer to authorize payment and adjust checkout details. Applies to Express Checkout and Payments Standard payment methods. */
export type Mage_PaypalExpressTokenOutput = {
  __typename?: 'Mage_PaypalExpressTokenOutput';
  /** A set of URLs that allow the buyer to authorize payment and adjust checkout details. */
  paypal_urls?: Maybe<Mage_PaypalExpressUrlList>;
  /** The token returned by PayPal. */
  token?: Maybe<Scalars['String']['output']>;
};

/** Contains a set of URLs that allow the buyer to authorize payment and adjust checkout details for Express Checkout and Payments Standard transactions. */
export type Mage_PaypalExpressUrlList = {
  __typename?: 'Mage_PaypalExpressUrlList';
  /** The PayPal URL that allows the buyer to edit their checkout details. */
  edit?: Maybe<Scalars['String']['output']>;
  /** The URL to the PayPal login page. */
  start?: Maybe<Scalars['String']['output']>;
};

/** Contains a set of relative URLs that PayPal uses in response to various actions during the authorization process. Magento prepends the base URL to this value to create a full URL. For example, if the full URL is https://www.example.com/path/to/page.html, the relative URL is path/to/page.html. Use this input for Express Checkout and Payments Standard payment methods. */
export type Mage_PaypalExpressUrlsInput = {
  /** The relative URL of the page that PayPal redirects to when the buyer cancels the transaction in order to choose a different payment method. If the full URL to this page is https://www.example.com/paypal/action/cancel.html, the relative URL is paypal/action/cancel.html. */
  cancel_url: Scalars['String']['input'];
  /** The relative URL of the page that PayPal redirects to when the payment has been put on hold for additional review. This condition mostly applies to ACH transactions, and is not applicable to most PayPal solutions. If the full URL to this page is https://www.example.com/paypal/action/success_pending.html, the relative URL is paypal/action/success_pending.html. */
  pending_url?: InputMaybe<Scalars['String']['input']>;
  /** The relative URL of the final confirmation page that PayPal redirects to upon payment success. If the full URL to this page is https://www.example.com/paypal/action/return.html, the relative URL is paypal/action/return.html. */
  return_url: Scalars['String']['input'];
  /** The relative URL of the order confirmation page that PayPal redirects to when the payment is successful and additional confirmation is not needed. Not applicable to most PayPal solutions. If the full URL to this page is https://www.example.com/paypal/action/success.html, the relative URL is paypal/action/success.html. */
  success_url?: InputMaybe<Scalars['String']['input']>;
};

/** Contains attributes specific to tangible products. */
export type Mage_PhysicalProductInterface = {
  /** The weight of the item, in units defined by the store. */
  weight?: Maybe<Scalars['Float']['output']>;
};

/** Defines Pickup Location information. */
export type Mage_PickupLocation = {
  __typename?: 'Mage_PickupLocation';
  city?: Maybe<Scalars['String']['output']>;
  contact_name?: Maybe<Scalars['String']['output']>;
  country_id?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  fax?: Maybe<Scalars['String']['output']>;
  latitude?: Maybe<Scalars['Float']['output']>;
  longitude?: Maybe<Scalars['Float']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  pickup_location_code?: Maybe<Scalars['String']['output']>;
  postcode?: Maybe<Scalars['String']['output']>;
  region?: Maybe<Scalars['String']['output']>;
  region_id?: Maybe<Scalars['Int']['output']>;
  street?: Maybe<Scalars['String']['output']>;
};

/** PickupLocationFilterInput defines the list of attributes and filters for the search. */
export type Mage_PickupLocationFilterInput = {
  /** Filter by city. */
  city?: InputMaybe<Mage_FilterTypeInput>;
  /** Filter by country. */
  country_id?: InputMaybe<Mage_FilterTypeInput>;
  /** Filter by pickup location name. */
  name?: InputMaybe<Mage_FilterTypeInput>;
  /** Filter by pickup location code. */
  pickup_location_code?: InputMaybe<Mage_FilterTypeInput>;
  /** Filter by postcode. */
  postcode?: InputMaybe<Mage_FilterTypeInput>;
  /** Filter by region. */
  region?: InputMaybe<Mage_FilterTypeInput>;
  /** Filter by region id. */
  region_id?: InputMaybe<Mage_FilterTypeInput>;
  /** Filter by street. */
  street?: InputMaybe<Mage_FilterTypeInput>;
};

/** PickupLocationSortInput specifies attribute to use for sorting search results and indicates whether the results are sorted in ascending or descending order. */
export type Mage_PickupLocationSortInput = {
  /** City where pickup location is placed. */
  city?: InputMaybe<Mage_SortEnum>;
  /** Name of the contact person. */
  contact_name?: InputMaybe<Mage_SortEnum>;
  /** Id of the country in two letters. */
  country_id?: InputMaybe<Mage_SortEnum>;
  /** Description of the pickup location. */
  description?: InputMaybe<Mage_SortEnum>;
  /** Distance to the address, requested by distance filter. Applicable only with distance filter. If distance sort order is present, all other sort orders will be ignored. */
  distance?: InputMaybe<Mage_SortEnum>;
  /** Contact email of the pickup location. */
  email?: InputMaybe<Mage_SortEnum>;
  /** Contact fax of the pickup location. */
  fax?: InputMaybe<Mage_SortEnum>;
  /** Geographic latitude where pickup location is placed. */
  latitude?: InputMaybe<Mage_SortEnum>;
  /** Geographic longitude where pickup location is placed. */
  longitude?: InputMaybe<Mage_SortEnum>;
  /** The pickup location name. Customer use this to identify the pickup location. */
  name?: InputMaybe<Mage_SortEnum>;
  /** Contact phone number of the pickup location. */
  phone?: InputMaybe<Mage_SortEnum>;
  /** A code assigned to pickup location to identify the source. */
  pickup_location_code?: InputMaybe<Mage_SortEnum>;
  /** Postcode where pickup location is placed. */
  postcode?: InputMaybe<Mage_SortEnum>;
  /** Name of the region. */
  region?: InputMaybe<Mage_SortEnum>;
  /** Id of the region. */
  region_id?: InputMaybe<Mage_SortEnum>;
  /** Street where pickup location is placed. */
  street?: InputMaybe<Mage_SortEnum>;
};

/** Top level object returned in a pickup locations search. */
export type Mage_PickupLocations = {
  __typename?: 'Mage_PickupLocations';
  /** An array of pickup locations that match the specific search request. */
  items?: Maybe<Array<Maybe<Mage_PickupLocation>>>;
  /** An object that includes the page_info and currentPage values specified in the query. */
  page_info?: Maybe<Mage_SearchResultPageInfo>;
  /** The number of products returned. */
  total_count?: Maybe<Scalars['Int']['output']>;
};

/** An error encountered while placing an order. */
export type Mage_PlaceOrderError = {
  __typename?: 'Mage_PlaceOrderError';
  /** An error code that is specific to place order. */
  code: Mage_PlaceOrderErrorCodes;
  /** A localized error message. */
  message: Scalars['String']['output'];
};

export enum Mage_PlaceOrderErrorCodes {
  CartNotActive = 'CART_NOT_ACTIVE',
  CartNotFound = 'CART_NOT_FOUND',
  GuestEmailMissing = 'GUEST_EMAIL_MISSING',
  UnableToPlaceOrder = 'UNABLE_TO_PLACE_ORDER',
  Undefined = 'UNDEFINED'
}

/** Specifies the quote to be converted to an order. */
export type Mage_PlaceOrderInput = {
  /** The unique ID of a `Cart` object. */
  cart_id: Scalars['String']['input'];
  /** Optionally send a URL where the visitor is returned after completing the Mollie order */
  mollie_return_url?: InputMaybe<Scalars['String']['input']>;
};

/** Contains the results of the request to place an order. */
export type Mage_PlaceOrderOutput = {
  __typename?: 'Mage_PlaceOrderOutput';
  /** An array of place order errors. */
  errors: Array<Maybe<Mage_PlaceOrderError>>;
  /**
   * The ID of the order.
   * @deprecated Use `orderV2` instead.
   */
  order?: Maybe<Mage_Order>;
  /** Full order information. */
  orderV2?: Maybe<Mage_CustomerOrder>;
};

/** Deprecated. Use `ProductPrice` instead. Defines the price of a product as well as any tax-related adjustments. */
export type Mage_Price = {
  __typename?: 'Mage_Price';
  /**
   * An array that provides information about tax, weee, or weee_tax adjustments.
   * @deprecated Use `ProductPrice` instead.
   */
  adjustments?: Maybe<Array<Maybe<Mage_PriceAdjustment>>>;
  /**
   * The price of a product plus a three-letter currency code.
   * @deprecated Use `ProductPrice` instead.
   */
  amount?: Maybe<Mage_Money>;
};

/** Deprecated. Taxes will be included or excluded in the price. Defines the amount of money to apply as an adjustment, the type of adjustment to apply, and whether the item is included or excluded from the adjustment. */
export type Mage_PriceAdjustment = {
  __typename?: 'Mage_PriceAdjustment';
  /** The amount of the price adjustment and its currency code. */
  amount?: Maybe<Mage_Money>;
  /**
   * Indicates whether the adjustment involves tax, weee, or weee_tax.
   * @deprecated `PriceAdjustment` is deprecated.
   */
  code?: Maybe<Mage_PriceAdjustmentCodesEnum>;
  /**
   * Indicates whether the entity described by the code attribute is included or excluded from the adjustment.
   * @deprecated `PriceAdjustment` is deprecated.
   */
  description?: Maybe<Mage_PriceAdjustmentDescriptionEnum>;
};

/** `PriceAdjustment.code` is deprecated. */
export enum Mage_PriceAdjustmentCodesEnum {
  /** @deprecated `PriceAdjustmentCodesEnum` is deprecated. Tax is included or excluded in the price. Tax is not shown separately in Catalog. */
  Tax = 'TAX',
  /** @deprecated WEEE code is deprecated. Use `fixed_product_taxes.label` instead. */
  Weee = 'WEEE',
  /** @deprecated Use `fixed_product_taxes` instead.  Tax is included or excluded in price. The tax is not shown separtely in Catalog. */
  WeeeTax = 'WEEE_TAX'
}

/** `PriceAdjustmentDescriptionEnum` is deprecated. States whether a price adjustment is included or excluded. */
export enum Mage_PriceAdjustmentDescriptionEnum {
  Excluded = 'EXCLUDED',
  Included = 'INCLUDED'
}

/** Can be used to retrieve the main price details in case of bundle product */
export type Mage_PriceDetails = {
  __typename?: 'Mage_PriceDetails';
  /** The percentage of discount applied to the main product price */
  discount_percentage?: Maybe<Scalars['Float']['output']>;
  /** The final price after applying the discount to the main product */
  main_final_price?: Maybe<Scalars['Float']['output']>;
  /** The regular price of the main product */
  main_price?: Maybe<Scalars['Float']['output']>;
};

/** Contains the price range for a product. If the product has a single price, the minimum and maximum price will be the same. */
export type Mage_PriceRange = {
  __typename?: 'Mage_PriceRange';
  /** The highest possible price for the product. */
  maximum_price?: Maybe<Mage_ProductPrice>;
  /** The lowest possible price for the product. */
  minimum_price: Mage_ProductPrice;
};

/** Defines the price type. */
export enum Mage_PriceTypeEnum {
  Dynamic = 'DYNAMIC',
  Fixed = 'FIXED',
  Percent = 'PERCENT'
}

/** Defines whether a bundle product's price is displayed as the lowest possible value or as a range. */
export enum Mage_PriceViewEnum {
  AsLowAs = 'AS_LOW_AS',
  PriceRange = 'PRICE_RANGE'
}

/** Contains a product attribute code and value. */
export type Mage_ProductAttribute = {
  __typename?: 'Mage_ProductAttribute';
  /** The unique identifier for a product attribute code. */
  code: Scalars['String']['output'];
  /** The display value of the attribute. */
  value: Scalars['String']['output'];
};

/** Defines the filters to be used in the search. A filter contains at least one attribute, a comparison operator, and the value that is being searched for. */
export type Mage_ProductAttributeFilterInput = {
  /** Attribute label: Activity */
  activity?: InputMaybe<Mage_FilterEqualTypeInput>;
  /** Attribute label: Category Gear */
  category_gear?: InputMaybe<Mage_FilterEqualTypeInput>;
  /** Deprecated: use `category_uid` to filter product by category ID. */
  category_id?: InputMaybe<Mage_FilterEqualTypeInput>;
  /** Filter product by the unique ID for a `CategoryInterface` object. */
  category_uid?: InputMaybe<Mage_FilterEqualTypeInput>;
  /** Filter product by category URL path. */
  category_url_path?: InputMaybe<Mage_FilterEqualTypeInput>;
  /** Attribute label: Climate */
  climate?: InputMaybe<Mage_FilterEqualTypeInput>;
  /** Attribute label: Collar */
  collar?: InputMaybe<Mage_FilterEqualTypeInput>;
  /** Attribute label: Color */
  color?: InputMaybe<Mage_FilterEqualTypeInput>;
  /** Attribute label: Description */
  description?: InputMaybe<Mage_FilterMatchTypeInput>;
  /** Attribute label: Eco Collection */
  eco_collection?: InputMaybe<Mage_FilterEqualTypeInput>;
  /** Attribute label: Erin Recommends */
  erin_recommends?: InputMaybe<Mage_FilterEqualTypeInput>;
  /** Attribute label: Features */
  features_bags?: InputMaybe<Mage_FilterEqualTypeInput>;
  /** Attribute label: Format */
  format?: InputMaybe<Mage_FilterEqualTypeInput>;
  /** Attribute label: Gender */
  gender?: InputMaybe<Mage_FilterEqualTypeInput>;
  /** Attribute label: Is Seller Product */
  is_seller_product?: InputMaybe<Mage_FilterEqualTypeInput>;
  /** Attribute label: Material */
  material?: InputMaybe<Mage_FilterEqualTypeInput>;
  /** Attribute label: Product Name */
  name?: InputMaybe<Mage_FilterMatchTypeInput>;
  /** Attribute label: New */
  new?: InputMaybe<Mage_FilterEqualTypeInput>;
  /** Attribute label: Pattern */
  pattern?: InputMaybe<Mage_FilterEqualTypeInput>;
  /** Attribute label: Performance Fabric */
  performance_fabric?: InputMaybe<Mage_FilterEqualTypeInput>;
  /** Attribute label: Price */
  price?: InputMaybe<Mage_FilterRangeTypeInput>;
  /** Attribute label: Sale */
  sale?: InputMaybe<Mage_FilterEqualTypeInput>;
  /** Attribute label: Short Description */
  short_description?: InputMaybe<Mage_FilterMatchTypeInput>;
  /** Attribute label: Size */
  size?: InputMaybe<Mage_FilterEqualTypeInput>;
  /** Attribute label: SKU */
  sku?: InputMaybe<Mage_FilterEqualTypeInput>;
  /** Attribute label: Sleeve */
  sleeve?: InputMaybe<Mage_FilterEqualTypeInput>;
  /** Attribute label: Strap/Handle */
  strap_bags?: InputMaybe<Mage_FilterEqualTypeInput>;
  /** Attribute label: Style Bags */
  style_bags?: InputMaybe<Mage_FilterEqualTypeInput>;
  /** Attribute label: Style Bottom */
  style_bottom?: InputMaybe<Mage_FilterEqualTypeInput>;
  /** Attribute label: Style General */
  style_general?: InputMaybe<Mage_FilterEqualTypeInput>;
  /** The part of the URL that identifies the product */
  url_key?: InputMaybe<Mage_FilterEqualTypeInput>;
};

/** Specifies the attribute to use for sorting search results and indicates whether the results are sorted in ascending or descending order. It's possible to sort products using searchable attributes with enabled 'Use in Filter Options' option */
export type Mage_ProductAttributeSortInput = {
  /** Attribute label: Product Name */
  name?: InputMaybe<Mage_SortEnum>;
  /** Sort by the position assigned to each product. */
  position?: InputMaybe<Mage_SortEnum>;
  /** Attribute label: Price */
  price?: InputMaybe<Mage_SortEnum>;
  /** Sort by the search relevance score (default). */
  relevance?: InputMaybe<Mage_SortEnum>;
};

/** Product custom attributes */
export type Mage_ProductCustomAttributes = {
  __typename?: 'Mage_ProductCustomAttributes';
  /** Errors when retrieving custom attributes metadata. */
  errors: Array<Maybe<Mage_AttributeMetadataError>>;
  /** Requested custom attributes */
  items: Array<Maybe<Mage_AttributeValueInterface>>;
};

/** Contains the discount applied to a product price. */
export type Mage_ProductDiscount = {
  __typename?: 'Mage_ProductDiscount';
  /** The actual value of the discount. */
  amount_off?: Maybe<Scalars['Float']['output']>;
  /** The discount expressed a percentage. */
  percent_off?: Maybe<Scalars['Float']['output']>;
};

/** ProductFilterInput is deprecated, use @ProductAttributeFilterInput instead. ProductFilterInput defines the filters to be used in the search. A filter contains at least one attribute, a comparison operator, and the value that is being searched for. */
export type Mage_ProductFilterInput = {
  /** The category ID the product belongs to. */
  category_id?: InputMaybe<Mage_FilterTypeInput>;
  /** The product's country of origin. */
  country_of_manufacture?: InputMaybe<Mage_FilterTypeInput>;
  /** The timestamp indicating when the product was created. */
  created_at?: InputMaybe<Mage_FilterTypeInput>;
  /** The name of a custom layout. */
  custom_layout?: InputMaybe<Mage_FilterTypeInput>;
  /** XML code that is applied as a layout update to the product page. */
  custom_layout_update?: InputMaybe<Mage_FilterTypeInput>;
  /** Detailed information about the product. The value can include simple HTML tags. */
  description?: InputMaybe<Mage_FilterTypeInput>;
  /** Indicates whether a gift message is available. */
  gift_message_available?: InputMaybe<Mage_FilterTypeInput>;
  /** Indicates whether additional attributes have been created for the product. */
  has_options?: InputMaybe<Mage_FilterTypeInput>;
  /** The relative path to the main image on the product page. */
  image?: InputMaybe<Mage_FilterTypeInput>;
  /** The label assigned to a product image. */
  image_label?: InputMaybe<Mage_FilterTypeInput>;
  /** A number representing the product's manufacturer. */
  manufacturer?: InputMaybe<Mage_FilterTypeInput>;
  /** The numeric maximal price of the product. Do not include the currency code. */
  max_price?: InputMaybe<Mage_FilterTypeInput>;
  /** A brief overview of the product for search results listings, maximum 255 characters. */
  meta_description?: InputMaybe<Mage_FilterTypeInput>;
  /** A comma-separated list of keywords that are visible only to search engines. */
  meta_keyword?: InputMaybe<Mage_FilterTypeInput>;
  /** A string that is displayed in the title bar and tab of the browser and in search results lists. */
  meta_title?: InputMaybe<Mage_FilterTypeInput>;
  /** The numeric minimal price of the product. Do not include the currency code. */
  min_price?: InputMaybe<Mage_FilterTypeInput>;
  /** The product name. Customers use this name to identify the product. */
  name?: InputMaybe<Mage_FilterTypeInput>;
  /** The beginning date for new product listings, and determines if the product is featured as a new product. */
  news_from_date?: InputMaybe<Mage_FilterTypeInput>;
  /** The end date for new product listings. */
  news_to_date?: InputMaybe<Mage_FilterTypeInput>;
  /** If the product has multiple options, determines where they appear on the product page. */
  options_container?: InputMaybe<Mage_FilterTypeInput>;
  /** The keyword required to perform a logical OR comparison. */
  or?: InputMaybe<Mage_ProductFilterInput>;
  /** The price of an item. */
  price?: InputMaybe<Mage_FilterTypeInput>;
  /** Indicates whether the product has required options. */
  required_options?: InputMaybe<Mage_FilterTypeInput>;
  /** A short description of the product. Its use depends on the theme. */
  short_description?: InputMaybe<Mage_FilterTypeInput>;
  /** A number or code assigned to a product to identify the product, options, price, and manufacturer. */
  sku?: InputMaybe<Mage_FilterTypeInput>;
  /** The relative path to the small image, which is used on catalog pages. */
  small_image?: InputMaybe<Mage_FilterTypeInput>;
  /** The label assigned to a product's small image. */
  small_image_label?: InputMaybe<Mage_FilterTypeInput>;
  /** The beginning date that a product has a special price. */
  special_from_date?: InputMaybe<Mage_FilterTypeInput>;
  /** The discounted price of the product. Do not include the currency code. */
  special_price?: InputMaybe<Mage_FilterTypeInput>;
  /** The end date that a product has a special price. */
  special_to_date?: InputMaybe<Mage_FilterTypeInput>;
  /** The file name of a swatch image. */
  swatch_image?: InputMaybe<Mage_FilterTypeInput>;
  /** The relative path to the product's thumbnail image. */
  thumbnail?: InputMaybe<Mage_FilterTypeInput>;
  /** The label assigned to a product's thumbnail image. */
  thumbnail_label?: InputMaybe<Mage_FilterTypeInput>;
  /** The price when tier pricing is in effect and the items purchased threshold has been reached. */
  tier_price?: InputMaybe<Mage_FilterTypeInput>;
  /** The timestamp indicating when the product was updated. */
  updated_at?: InputMaybe<Mage_FilterTypeInput>;
  /** The part of the URL that identifies the product */
  url_key?: InputMaybe<Mage_FilterTypeInput>;
  url_path?: InputMaybe<Mage_FilterTypeInput>;
  /** The weight of the item, in units defined by the store. */
  weight?: InputMaybe<Mage_FilterTypeInput>;
};

/** Contains product image information, including the image URL and label. */
export type Mage_ProductImage = Mage_MediaGalleryInterface & {
  __typename?: 'Mage_ProductImage';
  /** Indicates whether the image is hidden from view. */
  disabled?: Maybe<Scalars['Boolean']['output']>;
  /** The label of the product image or video. */
  label?: Maybe<Scalars['String']['output']>;
  /** The media item's position after it has been sorted. */
  position?: Maybe<Scalars['Int']['output']>;
  /** The URL of the product image or video. */
  url?: Maybe<Scalars['String']['output']>;
};

export enum Mage_ProductImageThumbnail {
  /** Use thumbnail of product as image. */
  Itself = 'ITSELF',
  /** Use thumbnail of product's parent as image. */
  Parent = 'PARENT'
}

/** Product Information used for Pickup Locations search. */
export type Mage_ProductInfoInput = {
  /** Product SKU. */
  sku: Scalars['String']['input'];
};

/** Contains fields that are common to all types of products. */
export type Mage_ProductInterface = {
  /** @deprecated Use the `custom_attributes` field instead. */
  activity?: Maybe<Scalars['String']['output']>;
  /**
   * The attribute set assigned to the product.
   * @deprecated The field should not be used on the storefront.
   */
  attribute_set_id?: Maybe<Scalars['Int']['output']>;
  /** The relative canonical URL. This value is returned only if the system setting 'Use Canonical Link Meta Tag For Products' is enabled. */
  canonical_url?: Maybe<Scalars['String']['output']>;
  /** The categories assigned to a product. */
  categories?: Maybe<Array<Maybe<Mage_CategoryInterface>>>;
  /** @deprecated Use the `custom_attributes` field instead. */
  category_gear?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  climate?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  collar?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  color?: Maybe<Scalars['Int']['output']>;
  /** The product's country of origin. */
  country_of_manufacture?: Maybe<Scalars['String']['output']>;
  /**
   * Timestamp indicating when the product was created.
   * @deprecated The field should not be used on the storefront.
   */
  created_at?: Maybe<Scalars['String']['output']>;
  /** Crosssell Products */
  crosssell_products?: Maybe<Array<Maybe<Mage_ProductInterface>>>;
  /** Product custom attributes. */
  custom_attributesV2?: Maybe<Mage_ProductCustomAttributes>;
  /** Detailed information about the product. The value can include simple HTML tags. */
  description?: Maybe<Mage_ComplexTextValue>;
  /** @deprecated Use the `custom_attributes` field instead. */
  eco_collection?: Maybe<Scalars['Int']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  erin_recommends?: Maybe<Scalars['Int']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  features_bags?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  format?: Maybe<Scalars['Int']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  gender?: Maybe<Scalars['String']['output']>;
  /** Returns a value indicating gift message availability for the product. */
  gift_message_available: Scalars['Boolean']['output'];
  /**
   * The ID number assigned to the product.
   * @deprecated Use the `uid` field instead.
   */
  id?: Maybe<Scalars['Int']['output']>;
  /** The relative path to the main image on the product page. */
  image?: Maybe<Mage_ProductImage>;
  /** @deprecated Use the `custom_attributes` field instead. */
  is_seller_product?: Maybe<Scalars['Int']['output']>;
  /**
   * A number representing the product's manufacturer.
   * @deprecated Use the `custom_attributes` field instead.
   */
  manufacturer?: Maybe<Scalars['Int']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  material?: Maybe<Scalars['String']['output']>;
  /** Maximum Qty Allowed in Shopping Cart */
  max_sale_qty?: Maybe<Scalars['Float']['output']>;
  /** An array of media gallery objects. */
  media_gallery?: Maybe<Array<Maybe<Mage_MediaGalleryInterface>>>;
  /**
   * An array of MediaGalleryEntry objects.
   * @deprecated Use `media_gallery` instead.
   */
  media_gallery_entries?: Maybe<Array<Maybe<Mage_MediaGalleryEntry>>>;
  /** A brief overview of the product for search results listings, maximum 255 characters. */
  meta_description?: Maybe<Scalars['String']['output']>;
  /** A comma-separated list of keywords that are visible only to search engines. */
  meta_keyword?: Maybe<Scalars['String']['output']>;
  /** A string that is displayed in the title bar and tab of the browser and in search results lists. */
  meta_title?: Maybe<Scalars['String']['output']>;
  /** Minimum Qty Allowed in Shopping Cart */
  min_sale_qty?: Maybe<Scalars['Float']['output']>;
  /** The product name. Customers use this name to identify the product. */
  name?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  new?: Maybe<Scalars['Int']['output']>;
  /** The beginning date for new product listings, and determines if the product is featured as a new product. */
  new_from_date?: Maybe<Scalars['String']['output']>;
  /** The end date for new product listings. */
  new_to_date?: Maybe<Scalars['String']['output']>;
  /** Product stock only x left count */
  only_x_left_in_stock?: Maybe<Scalars['Float']['output']>;
  /** If the product has multiple options, determines where they appear on the product page. */
  options_container?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  pattern?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  performance_fabric?: Maybe<Scalars['Int']['output']>;
  /**
   * Indicates the price of an item.
   * @deprecated Use `price_range` for product price information.
   */
  price?: Maybe<Mage_ProductPrices>;
  /** The range of prices for the product */
  price_range: Mage_PriceRange;
  /** An array of `TierPrice` objects. */
  price_tiers?: Maybe<Array<Maybe<Mage_TierPrice>>>;
  /** An array of `ProductLinks` objects. */
  product_links?: Maybe<Array<Maybe<Mage_ProductLinksInterface>>>;
  /** Amount of available stock */
  quantity?: Maybe<Scalars['Float']['output']>;
  /** The average of all the ratings given to the product. */
  rating_summary: Scalars['Float']['output'];
  /** An array of products to be displayed in a Related Products block. */
  related_products?: Maybe<Array<Maybe<Mage_ProductInterface>>>;
  /** The total count of all the reviews given to the product. */
  review_count: Scalars['Int']['output'];
  /** The list of products reviews. */
  reviews: Mage_ProductReviews;
  /** @deprecated Use the `custom_attributes` field instead. */
  sale?: Maybe<Scalars['Int']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  seller_id?: Maybe<Scalars['Int']['output']>;
  /** A short description of the product. Its use depends on the theme. */
  short_description?: Maybe<Mage_ComplexTextValue>;
  /** @deprecated Use the `custom_attributes` field instead. */
  size?: Maybe<Scalars['Int']['output']>;
  /** A number or code assigned to a product to identify the product, options, price, and manufacturer. */
  sku?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  sleeve?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  sm_featured?: Maybe<Scalars['Int']['output']>;
  /** The relative path to the small image, which is used on catalog pages. */
  small_image?: Maybe<Mage_ProductImage>;
  /**
   * The beginning date that a product has a special price.
   * @deprecated The field should not be used on the storefront.
   */
  special_from_date?: Maybe<Scalars['String']['output']>;
  /** The discounted price of the product. */
  special_price?: Maybe<Scalars['Float']['output']>;
  /** The end date for a product with a special price. */
  special_to_date?: Maybe<Scalars['String']['output']>;
  /** The status assigned to the product, 0 for disabled, 1 for enabled. */
  status?: Maybe<Scalars['Int']['output']>;
  /** Stock status of the product */
  stock_status?: Maybe<Mage_ProductStockStatus>;
  /** @deprecated Use the `custom_attributes` field instead. */
  strap_bags?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  style_bags?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  style_bottom?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  style_general?: Maybe<Scalars['String']['output']>;
  /** The file name of a swatch image. */
  swatch_image?: Maybe<Scalars['String']['output']>;
  /** The relative path to the product's thumbnail image. */
  thumbnail?: Maybe<Mage_ProductImage>;
  /**
   * The price when tier pricing is in effect and the items purchased threshold has been reached.
   * @deprecated Use `price_tiers` for product tier price information.
   */
  tier_price?: Maybe<Scalars['Float']['output']>;
  /**
   * An array of ProductTierPrices objects.
   * @deprecated Use `price_tiers` for product tier price information.
   */
  tier_prices?: Maybe<Array<Maybe<Mage_ProductTierPrices>>>;
  /**
   * One of simple, virtual, bundle, downloadable, grouped, or configurable.
   * @deprecated Use `__typename` instead.
   */
  type_id?: Maybe<Scalars['String']['output']>;
  /** The unique ID for a `ProductInterface` object. */
  uid: Scalars['ID']['output'];
  /**
   * Timestamp indicating when the product was updated.
   * @deprecated The field should not be used on the storefront.
   */
  updated_at?: Maybe<Scalars['String']['output']>;
  /** Upsell Products */
  upsell_products?: Maybe<Array<Maybe<Mage_ProductInterface>>>;
  /** The part of the URL that identifies the product */
  url_key?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use product's `canonical_url` or url rewrites instead */
  url_path?: Maybe<Scalars['String']['output']>;
  /** URL rewrites list */
  url_rewrites?: Maybe<Array<Maybe<Mage_UrlRewrite>>>;
  /** The part of the product URL that is appended after the url key */
  url_suffix?: Maybe<Scalars['String']['output']>;
  /** The visibility assigned to the product. */
  visibility?: Maybe<Scalars['Int']['output']>;
  /**
   * An array of websites in which the product is available.
   * @deprecated The field should not be used on the storefront.
   */
  websites?: Maybe<Array<Maybe<Mage_Website>>>;
};


/** Contains fields that are common to all types of products. */
export type Mage_ProductInterfaceCustom_AttributesV2Args = {
  filters?: InputMaybe<Mage_AttributeFilterInput>;
};


/** Contains fields that are common to all types of products. */
export type Mage_ProductInterfaceReviewsArgs = {
  currentPage?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
};

/** An implementation of `ProductLinksInterface`. */
export type Mage_ProductLinks = Mage_ProductLinksInterface & {
  __typename?: 'Mage_ProductLinks';
  /** One of related, associated, upsell, or crosssell. */
  link_type?: Maybe<Scalars['String']['output']>;
  /** The SKU of the linked product. */
  linked_product_sku?: Maybe<Scalars['String']['output']>;
  /** The type of linked product (simple, virtual, bundle, downloadable, grouped, configurable). */
  linked_product_type?: Maybe<Scalars['String']['output']>;
  /** The position within the list of product links. */
  position?: Maybe<Scalars['Int']['output']>;
  /** The identifier of the linked product. */
  sku?: Maybe<Scalars['String']['output']>;
};

/** Contains information about linked products, including the link type and product type of each item. */
export type Mage_ProductLinksInterface = {
  /** One of related, associated, upsell, or crosssell. */
  link_type?: Maybe<Scalars['String']['output']>;
  /** The SKU of the linked product. */
  linked_product_sku?: Maybe<Scalars['String']['output']>;
  /** The type of linked product (simple, virtual, bundle, downloadable, grouped, configurable). */
  linked_product_type?: Maybe<Scalars['String']['output']>;
  /** The position within the list of product links. */
  position?: Maybe<Scalars['Int']['output']>;
  /** The identifier of the linked product. */
  sku?: Maybe<Scalars['String']['output']>;
};

/** Contains an image in base64 format and basic information about the image. */
export type Mage_ProductMediaGalleryEntriesContent = {
  __typename?: 'Mage_ProductMediaGalleryEntriesContent';
  /** The image in base64 format. */
  base64_encoded_data?: Maybe<Scalars['String']['output']>;
  /** The file name of the image. */
  name?: Maybe<Scalars['String']['output']>;
  /** The MIME type of the file, such as image/png. */
  type?: Maybe<Scalars['String']['output']>;
};

/** Contains a link to a video file and basic information about the video. */
export type Mage_ProductMediaGalleryEntriesVideoContent = {
  __typename?: 'Mage_ProductMediaGalleryEntriesVideoContent';
  /** Must be external-video. */
  media_type?: Maybe<Scalars['String']['output']>;
  /** A description of the video. */
  video_description?: Maybe<Scalars['String']['output']>;
  /** Optional data about the video. */
  video_metadata?: Maybe<Scalars['String']['output']>;
  /** Describes the video source. */
  video_provider?: Maybe<Scalars['String']['output']>;
  /** The title of the video. */
  video_title?: Maybe<Scalars['String']['output']>;
  /** The URL to the video. */
  video_url?: Maybe<Scalars['String']['output']>;
};

/** Represents a product price. */
export type Mage_ProductPrice = {
  __typename?: 'Mage_ProductPrice';
  /** The price discount. Represents the difference between the regular and final price. */
  discount?: Maybe<Mage_ProductDiscount>;
  /** The final price of the product after applying discounts. */
  final_price: Mage_Money;
  /** An array of the multiple Fixed Product Taxes that can be applied to a product price. */
  fixed_product_taxes?: Maybe<Array<Maybe<Mage_FixedProductTax>>>;
  /** The regular price of the product. */
  regular_price: Mage_Money;
};

/** Deprecated. Use `PriceRange` instead. Contains the regular price of an item, as well as its minimum and maximum prices. Only composite products, which include bundle, configurable, and grouped products, can contain a minimum and maximum price. */
export type Mage_ProductPrices = {
  __typename?: 'Mage_ProductPrices';
  /**
   * The highest possible final price for all the options defined within a composite product. If you are specifying a price range, this would be the `to` value.
   * @deprecated Use `PriceRange.maximum_price` instead.
   */
  maximalPrice?: Maybe<Mage_Price>;
  /**
   * The lowest possible final price for all the options defined within a composite product. If you are specifying a price range, this would be the `from` value.
   * @deprecated Use `PriceRange.minimum_price` instead.
   */
  minimalPrice?: Maybe<Mage_Price>;
  /**
   * The base price of a product.
   * @deprecated Use `regular_price` from `PriceRange.minimum_price` or `PriceRange.maximum_price` instead.
   */
  regularPrice?: Maybe<Mage_Price>;
};

/** Contains details of a product review. */
export type Mage_ProductReview = {
  __typename?: 'Mage_ProductReview';
  /** The average of all ratings for this product. */
  average_rating: Scalars['Float']['output'];
  /** The date the review was created. */
  created_at: Scalars['String']['output'];
  /** The customer's nickname. Defaults to the customer name, if logged in. */
  nickname: Scalars['String']['output'];
  /** The reviewed product. */
  product: Mage_ProductInterface;
  /** An array of ratings by rating category, such as quality, price, and value. */
  ratings_breakdown: Array<Maybe<Mage_ProductReviewRating>>;
  /** The summary (title) of the review. */
  summary: Scalars['String']['output'];
  /** The review text. */
  text: Scalars['String']['output'];
};

/** Contains data about a single aspect of a product review. */
export type Mage_ProductReviewRating = {
  __typename?: 'Mage_ProductReviewRating';
  /** The label assigned to an aspect of a product that is being rated, such as quality or price. */
  name: Scalars['String']['output'];
  /** The rating value given by customer. By default, possible values range from 1 to 5. */
  value: Scalars['String']['output'];
};

/** Contains the reviewer's rating for a single aspect of a review. */
export type Mage_ProductReviewRatingInput = {
  /** An encoded rating ID. */
  id: Scalars['String']['input'];
  /** An encoded rating value ID. */
  value_id: Scalars['String']['input'];
};

/** Contains details about a single aspect of a product review. */
export type Mage_ProductReviewRatingMetadata = {
  __typename?: 'Mage_ProductReviewRatingMetadata';
  /** An encoded rating ID. */
  id: Scalars['String']['output'];
  /** The label assigned to an aspect of a product that is being rated, such as quality or price. */
  name: Scalars['String']['output'];
  /** List of product review ratings sorted by position. */
  values: Array<Maybe<Mage_ProductReviewRatingValueMetadata>>;
};

/** Contains details about a single value in a product review. */
export type Mage_ProductReviewRatingValueMetadata = {
  __typename?: 'Mage_ProductReviewRatingValueMetadata';
  /** A ratings scale, such as the number of stars awarded. */
  value: Scalars['String']['output'];
  /** An encoded rating value ID. */
  value_id: Scalars['String']['output'];
};

/** Contains an array of metadata about each aspect of a product review. */
export type Mage_ProductReviewRatingsMetadata = {
  __typename?: 'Mage_ProductReviewRatingsMetadata';
  /** An array of product reviews sorted by position. */
  items: Array<Maybe<Mage_ProductReviewRatingMetadata>>;
};

/** Contains an array of product reviews. */
export type Mage_ProductReviews = {
  __typename?: 'Mage_ProductReviews';
  /** An array of product reviews. */
  items: Array<Maybe<Mage_ProductReview>>;
  /** Metadata for pagination rendering. */
  page_info: Mage_SearchResultPageInfo;
};

/** Deprecated. Use `ProductAttributeSortInput` instead. Specifies the attribute to use for sorting search results and indicates whether the results are sorted in ascending or descending order. */
export type Mage_ProductSortInput = {
  /** The product's country of origin. */
  country_of_manufacture?: InputMaybe<Mage_SortEnum>;
  /** The timestamp indicating when the product was created. */
  created_at?: InputMaybe<Mage_SortEnum>;
  /** The name of a custom layout. */
  custom_layout?: InputMaybe<Mage_SortEnum>;
  /** XML code that is applied as a layout update to the product page. */
  custom_layout_update?: InputMaybe<Mage_SortEnum>;
  /** Detailed information about the product. The value can include simple HTML tags. */
  description?: InputMaybe<Mage_SortEnum>;
  /** Indicates whether a gift message is available. */
  gift_message_available?: InputMaybe<Mage_SortEnum>;
  /** Indicates whether additional attributes have been created for the product. */
  has_options?: InputMaybe<Mage_SortEnum>;
  /** The relative path to the main image on the product page. */
  image?: InputMaybe<Mage_SortEnum>;
  /** The label assigned to a product image. */
  image_label?: InputMaybe<Mage_SortEnum>;
  /** A number representing the product's manufacturer. */
  manufacturer?: InputMaybe<Mage_SortEnum>;
  /** A brief overview of the product for search results listings, maximum 255 characters. */
  meta_description?: InputMaybe<Mage_SortEnum>;
  /** A comma-separated list of keywords that are visible only to search engines. */
  meta_keyword?: InputMaybe<Mage_SortEnum>;
  /** A string that is displayed in the title bar and tab of the browser and in search results lists. */
  meta_title?: InputMaybe<Mage_SortEnum>;
  /** The product name. Customers use this name to identify the product. */
  name?: InputMaybe<Mage_SortEnum>;
  /** The beginning date for new product listings, and determines if the product is featured as a new product. */
  news_from_date?: InputMaybe<Mage_SortEnum>;
  /** The end date for new product listings. */
  news_to_date?: InputMaybe<Mage_SortEnum>;
  /** If the product has multiple options, determines where they appear on the product page. */
  options_container?: InputMaybe<Mage_SortEnum>;
  /** The price of the item. */
  price?: InputMaybe<Mage_SortEnum>;
  /** Indicates whether the product has required options. */
  required_options?: InputMaybe<Mage_SortEnum>;
  /** A short description of the product. Its use depends on the theme. */
  short_description?: InputMaybe<Mage_SortEnum>;
  /** A number or code assigned to a product to identify the product, options, price, and manufacturer. */
  sku?: InputMaybe<Mage_SortEnum>;
  /** The relative path to the small image, which is used on catalog pages. */
  small_image?: InputMaybe<Mage_SortEnum>;
  /** The label assigned to a product's small image. */
  small_image_label?: InputMaybe<Mage_SortEnum>;
  /** The beginning date that a product has a special price. */
  special_from_date?: InputMaybe<Mage_SortEnum>;
  /** The discounted price of the product. */
  special_price?: InputMaybe<Mage_SortEnum>;
  /** The end date that a product has a special price. */
  special_to_date?: InputMaybe<Mage_SortEnum>;
  /** Indicates the criteria to sort swatches. */
  swatch_image?: InputMaybe<Mage_SortEnum>;
  /** The relative path to the product's thumbnail image. */
  thumbnail?: InputMaybe<Mage_SortEnum>;
  /** The label assigned to a product's thumbnail image. */
  thumbnail_label?: InputMaybe<Mage_SortEnum>;
  /** The price when tier pricing is in effect and the items purchased threshold has been reached. */
  tier_price?: InputMaybe<Mage_SortEnum>;
  /** The timestamp indicating when the product was updated. */
  updated_at?: InputMaybe<Mage_SortEnum>;
  /** The part of the URL that identifies the product */
  url_key?: InputMaybe<Mage_SortEnum>;
  url_path?: InputMaybe<Mage_SortEnum>;
  /** The weight of the item, in units defined by the store. */
  weight?: InputMaybe<Mage_SortEnum>;
};

/** This enumeration states whether a product stock status is in stock or out of stock */
export enum Mage_ProductStockStatus {
  InStock = 'IN_STOCK',
  OutOfStock = 'OUT_OF_STOCK'
}

/** Deprecated. Use `TierPrice` instead. Defines a tier price, which is a quantity discount offered to a specific customer group. */
export type Mage_ProductTierPrices = {
  __typename?: 'Mage_ProductTierPrices';
  /**
   * The ID of the customer group.
   * @deprecated Not relevant for the storefront.
   */
  customer_group_id?: Maybe<Scalars['String']['output']>;
  /**
   * The percentage discount of the item.
   * @deprecated Use `TierPrice.discount` instead.
   */
  percentage_value?: Maybe<Scalars['Float']['output']>;
  /**
   * The number of items that must be purchased to qualify for tier pricing.
   * @deprecated Use `TierPrice.quantity` instead.
   */
  qty?: Maybe<Scalars['Float']['output']>;
  /**
   * The price of the fixed price item.
   * @deprecated Use `TierPrice.final_price` instead.
   */
  value?: Maybe<Scalars['Float']['output']>;
  /**
   * The ID assigned to the website.
   * @deprecated Not relevant for the storefront.
   */
  website_id?: Maybe<Scalars['Float']['output']>;
};

/** Contains information about a product video. */
export type Mage_ProductVideo = Mage_MediaGalleryInterface & {
  __typename?: 'Mage_ProductVideo';
  /** Indicates whether the image is hidden from view. */
  disabled?: Maybe<Scalars['Boolean']['output']>;
  /** The label of the product image or video. */
  label?: Maybe<Scalars['String']['output']>;
  /** The media item's position after it has been sorted. */
  position?: Maybe<Scalars['Int']['output']>;
  /** The URL of the product image or video. */
  url?: Maybe<Scalars['String']['output']>;
  /** Contains a `ProductMediaGalleryEntriesVideoContent` object. */
  video_content?: Maybe<Mage_ProductMediaGalleryEntriesVideoContent>;
};

/** Contains the results of a `products` query. */
export type Mage_Products = {
  __typename?: 'Mage_Products';
  /** A bucket that contains the attribute code and label for each filterable option. */
  aggregations?: Maybe<Array<Maybe<Mage_Aggregation>>>;
  /**
   * Layered navigation filters array.
   * @deprecated Use `aggregations` instead.
   */
  filters?: Maybe<Array<Maybe<Mage_LayerFilter>>>;
  /** An array of products that match the specified search criteria. */
  items?: Maybe<Array<Maybe<Mage_ProductInterface>>>;
  /** An object that includes the page_info and currentPage values specified in the query. */
  page_info?: Maybe<Mage_SearchResultPageInfo>;
  /** An object that includes the default sort field and all available sort fields. */
  sort_fields?: Maybe<Mage_SortFields>;
  /** An array of search suggestions for case when search query have no results. */
  suggestions?: Maybe<Array<Maybe<Mage_SearchSuggestion>>>;
  /** The number of products that are marked as visible. By default, in complex products, parent products are visible, but their child products are not. */
  total_count?: Maybe<Scalars['Int']['output']>;
};


/** Contains the results of a `products` query. */
export type Mage_ProductsAggregationsArgs = {
  filter?: InputMaybe<Mage_AggregationsFilterInput>;
};

/** Specifies the field to use for sorting quote items */
export type Mage_QuoteItemsSortInput = {
  /** Specifies the quote items field to sort by */
  field: Mage_SortQuoteItemsEnum;
  /** Specifies the order of quote items' sorting */
  order: Mage_SortEnum;
};

export type Mage_ReCaptchaConfigOutput = {
  __typename?: 'Mage_ReCaptchaConfigOutput';
  /** Configuration details for reCaptcha type */
  configurations?: Maybe<Mage_ReCaptchaConfiguration>;
  /** Indicates whether reCaptcha type is enabled */
  is_enabled: Scalars['Boolean']['output'];
};

/** Contains reCAPTCHA form configuration details. */
export type Mage_ReCaptchaConfiguration = {
  __typename?: 'Mage_ReCaptchaConfiguration';
  /** The position of the invisible reCAPTCHA badge on each page. */
  badge_position?: Maybe<Scalars['String']['output']>;
  /** A two-character code that specifies the language that is used for Google reCAPTCHA text and messaging. */
  language_code?: Maybe<Scalars['String']['output']>;
  /** The minimum score that identifies a user interaction as a potential risk. */
  minimum_score?: Maybe<Scalars['Float']['output']>;
  re_captcha_type: Mage_ReCaptchaTypeEmum;
  /** The message that appears when reCaptcha fails. */
  technical_failure_message: Scalars['String']['output'];
  /** Theme to be used to render reCaptcha. */
  theme: Scalars['String']['output'];
  /** The message that appears to the user if validation fails. */
  validation_failure_message: Scalars['String']['output'];
  /** The website key generated when the Google reCAPTCHA account was registered. */
  website_key: Scalars['String']['output'];
};

/** Contains reCAPTCHA V3-Invisible configuration details. */
export type Mage_ReCaptchaConfigurationV3 = {
  __typename?: 'Mage_ReCaptchaConfigurationV3';
  /** The position of the invisible reCAPTCHA badge on each page. */
  badge_position: Scalars['String']['output'];
  /** The message that appears to the user if validation fails. */
  failure_message: Scalars['String']['output'];
  /** A list of forms on the storefront that have been configured to use reCAPTCHA V3. */
  forms: Array<Maybe<Mage_ReCaptchaFormEnum>>;
  /** Return whether recaptcha is enabled or not */
  is_enabled: Scalars['Boolean']['output'];
  /** A two-character code that specifies the language that is used for Google reCAPTCHA text and messaging. */
  language_code?: Maybe<Scalars['String']['output']>;
  /** The minimum score that identifies a user interaction as a potential risk. */
  minimum_score: Scalars['Float']['output'];
  /** Theme to be used to render reCaptcha. */
  theme: Scalars['String']['output'];
  /** The website key generated when the Google reCAPTCHA account was registered. */
  website_key: Scalars['String']['output'];
};

export enum Mage_ReCaptchaFormEnum {
  Braintree = 'BRAINTREE',
  Contact = 'CONTACT',
  CustomerCreate = 'CUSTOMER_CREATE',
  CustomerEdit = 'CUSTOMER_EDIT',
  CustomerForgotPassword = 'CUSTOMER_FORGOT_PASSWORD',
  CustomerLogin = 'CUSTOMER_LOGIN',
  Newsletter = 'NEWSLETTER',
  PlaceOrder = 'PLACE_ORDER',
  ProductReview = 'PRODUCT_REVIEW',
  ResendConfirmationEmail = 'RESEND_CONFIRMATION_EMAIL',
  Sendfriend = 'SENDFRIEND'
}

export enum Mage_ReCaptchaTypeEmum {
  Invisible = 'INVISIBLE',
  Recaptcha = 'RECAPTCHA',
  RecaptchaV3 = 'RECAPTCHA_V3'
}

export type Mage_Region = {
  __typename?: 'Mage_Region';
  /** The two-letter code for the region, such as TX for Texas. */
  code?: Maybe<Scalars['String']['output']>;
  /** The unique ID for a `Region` object. */
  id?: Maybe<Scalars['Int']['output']>;
  /** The name of the region, such as Texas. */
  name?: Maybe<Scalars['String']['output']>;
};

/** Specifies the cart from which to remove a coupon. */
export type Mage_RemoveCouponFromCartInput = {
  /** The unique ID of a `Cart` object. */
  cart_id: Scalars['String']['input'];
};

/** Contains details about the cart after removing a coupon. */
export type Mage_RemoveCouponFromCartOutput = {
  __typename?: 'Mage_RemoveCouponFromCartOutput';
  /** The cart after removing a coupon. */
  cart?: Maybe<Mage_Cart>;
};

/** Specifies which items to remove from the cart. */
export type Mage_RemoveItemFromCartInput = {
  /** The unique ID of a `Cart` object. */
  cart_id: Scalars['String']['input'];
  /** Deprecated. Use `cart_item_uid` instead. */
  cart_item_id?: InputMaybe<Scalars['Int']['input']>;
  /** Required field. The unique ID for a `CartItemInterface` object. */
  cart_item_uid?: InputMaybe<Scalars['ID']['input']>;
};

/** Contains details about the cart after removing an item. */
export type Mage_RemoveItemFromCartOutput = {
  __typename?: 'Mage_RemoveItemFromCartOutput';
  /** The cart after removing an item. */
  cart: Mage_Cart;
};

/** Defines which products to remove from a compare list. */
export type Mage_RemoveProductsFromCompareListInput = {
  /** An array of product IDs to remove from the compare list. */
  products: Array<InputMaybe<Scalars['ID']['input']>>;
  /** The unique identifier of the compare list to modify. */
  uid: Scalars['ID']['input'];
};

/** Contains the customer's wish list and any errors encountered. */
export type Mage_RemoveProductsFromWishlistOutput = {
  __typename?: 'Mage_RemoveProductsFromWishlistOutput';
  /** An array of errors encountered while deleting products from a wish list. */
  user_errors: Array<Maybe<Mage_WishListUserInputError>>;
  /** Contains the wish list with after items were successfully deleted. */
  wishlist: Mage_Wishlist;
};

/** Contains the cart and any errors after adding products. */
export type Mage_ReorderItemsOutput = {
  __typename?: 'Mage_ReorderItemsOutput';
  /** Detailed information about the customer's cart. */
  cart: Mage_Cart;
  /** An array of reordering errors. */
  userInputErrors: Array<Maybe<Mage_CheckoutUserInputError>>;
};

export type Mage_Res = {
  __typename?: 'Mage_Res';
  code?: Maybe<Scalars['Int']['output']>;
  message?: Maybe<Scalars['String']['output']>;
};

/** Contains the result of a request to revoke a customer token. */
export type Mage_RevokeCustomerTokenOutput = {
  __typename?: 'Mage_RevokeCustomerTokenOutput';
  /** The result of a request to revoke a customer token. */
  result: Scalars['Boolean']['output'];
};

/** Routable entities serve as the model for a rendered page. */
export type Mage_RoutableInterface = {
  /** Contains 0 when there is no redirect error. A value of 301 indicates the URL of the requested resource has been changed permanently, while a value of 302 indicates a temporary redirect. */
  redirect_code: Scalars['Int']['output'];
  /** The internal relative URL. If the specified URL is a redirect, the query returns the redirected URL, not the original. */
  relative_url?: Maybe<Scalars['String']['output']>;
  /** One of PRODUCT, CATEGORY, or CMS_PAGE. */
  type?: Maybe<Mage_UrlRewriteEntityTypeEnum>;
};

/** Default implementation of RoutableInterface. This type is returned when the URL is not linked to an entity. */
export type Mage_RoutableUrl = Mage_RoutableInterface & {
  __typename?: 'Mage_RoutableUrl';
  /** Contains 0 when there is no redirect error. A value of 301 indicates the URL of the requested resource has been changed permanently, while a value of 302 indicates a temporary redirect. */
  redirect_code: Scalars['Int']['output'];
  /** The internal relative URL. If the specified URL is a redirect, the query returns the redirected URL, not the original. */
  relative_url?: Maybe<Scalars['String']['output']>;
  /** One of PRODUCT, CATEGORY, or CMS_PAGE. */
  type?: Maybe<Mage_UrlRewriteEntityTypeEnum>;
};

/** Defines the name and value of a SDK parameter */
export type Mage_SdkParams = {
  __typename?: 'Mage_SDKParams';
  /** The name of the SDK parameter */
  name?: Maybe<Scalars['String']['output']>;
  /** The value of the SDK parameter */
  value?: Maybe<Scalars['String']['output']>;
};

/** Contains details about a comment. */
export type Mage_SalesCommentItem = {
  __typename?: 'Mage_SalesCommentItem';
  /** The text of the message. */
  message: Scalars['String']['output'];
  /** The timestamp of the comment. */
  timestamp: Scalars['String']['output'];
};

export type Mage_SalesItemInterface = {
  __typename?: 'Mage_SalesItemInterface';
  /** The entered gift message for the order item */
  gift_message?: Maybe<Mage_GiftMessage>;
};

/** This enumeration defines the scope type for customer orders. */
export enum Mage_ScopeTypeEnum {
  Global = 'GLOBAL',
  Store = 'STORE',
  Website = 'WEBSITE'
}

/** Provides navigation for the query response. */
export type Mage_SearchResultPageInfo = {
  __typename?: 'Mage_SearchResultPageInfo';
  /** The specific page to return. */
  current_page?: Maybe<Scalars['Int']['output']>;
  /** The maximum number of items to return per page of results. */
  page_size?: Maybe<Scalars['Int']['output']>;
  /** The total number of pages in the response. */
  total_pages?: Maybe<Scalars['Int']['output']>;
};

/** A string that contains search suggestion */
export type Mage_SearchSuggestion = {
  __typename?: 'Mage_SearchSuggestion';
  /** The search suggestion of existing product. */
  search: Scalars['String']['output'];
};

/** Contains details about a selected bundle option. */
export type Mage_SelectedBundleOption = {
  __typename?: 'Mage_SelectedBundleOption';
  /** @deprecated Use `uid` instead */
  id: Scalars['Int']['output'];
  /** The display name of the selected bundle product option. */
  label: Scalars['String']['output'];
  /** The type of selected bundle product option. */
  type: Scalars['String']['output'];
  /** The unique ID for a `SelectedBundleOption` object */
  uid: Scalars['ID']['output'];
  /** An array of selected bundle option values. */
  values: Array<Maybe<Mage_SelectedBundleOptionValue>>;
};

/** Contains details about a value for a selected bundle option. */
export type Mage_SelectedBundleOptionValue = {
  __typename?: 'Mage_SelectedBundleOptionValue';
  /** Use `uid` instead */
  id: Scalars['Int']['output'];
  /** The display name of the value for the selected bundle product option. */
  label: Scalars['String']['output'];
  /** The original price of the value for the selected bundle product option. */
  original_price: Mage_Money;
  /**
   * The price of the value for the selected bundle product option.
   * @deprecated Use priceV2 instead.
   */
  price: Scalars['Float']['output'];
  /** The price of the value for the selected bundle product option. */
  priceV2: Mage_Money;
  /** The quantity of the value for the selected bundle product option. */
  quantity: Scalars['Float']['output'];
  /** The unique ID for a `SelectedBundleOptionValue` object */
  uid: Scalars['ID']['output'];
};

/** Contains details about a selected configurable option. */
export type Mage_SelectedConfigurableOption = {
  __typename?: 'Mage_SelectedConfigurableOption';
  /** The unique ID for a `ConfigurableProductOptions` object. */
  configurable_product_option_uid: Scalars['ID']['output'];
  /** The unique ID for a `ConfigurableProductOptionsValues` object. */
  configurable_product_option_value_uid: Scalars['ID']['output'];
  /** @deprecated Use `SelectedConfigurableOption.configurable_product_option_uid` instead. */
  id: Scalars['Int']['output'];
  /** The display text for the option. */
  option_label: Scalars['String']['output'];
  /** @deprecated Use `SelectedConfigurableOption.configurable_product_option_value_uid` instead. */
  value_id: Scalars['Int']['output'];
  /** The display name of the selected configurable option. */
  value_label: Scalars['String']['output'];
};

/** Identifies a customized product that has been placed in a cart. */
export type Mage_SelectedCustomizableOption = {
  __typename?: 'Mage_SelectedCustomizableOption';
  /** The unique ID for a specific `CustomizableOptionInterface` object, such as a `CustomizableFieldOption`, `CustomizableFileOption`, or `CustomizableAreaOption` object. */
  customizable_option_uid: Scalars['ID']['output'];
  /** @deprecated Use `SelectedCustomizableOption.customizable_option_uid` instead. */
  id: Scalars['Int']['output'];
  /** Indicates whether the customizable option is required. */
  is_required: Scalars['Boolean']['output'];
  /** The display name of the selected customizable option. */
  label: Scalars['String']['output'];
  /** A value indicating the order to display this option. */
  sort_order: Scalars['Int']['output'];
  /** The type of `CustomizableOptionInterface` object. */
  type: Scalars['String']['output'];
  /** An array of selectable values. */
  values: Array<Maybe<Mage_SelectedCustomizableOptionValue>>;
};

/** Identifies the value of the selected customized option. */
export type Mage_SelectedCustomizableOptionValue = {
  __typename?: 'Mage_SelectedCustomizableOptionValue';
  /** The unique ID for a value object that corresponds to the object represented by the `customizable_option_uid` attribute. */
  customizable_option_value_uid: Scalars['ID']['output'];
  has_file?: Maybe<Scalars['Boolean']['output']>;
  /** @deprecated Use `SelectedCustomizableOptionValue.customizable_option_value_uid` instead. */
  id: Scalars['Int']['output'];
  /** The display name of the selected value. */
  label: Scalars['String']['output'];
  /** The price of the selected customizable value. */
  price: Mage_CartItemSelectedOptionValuePrice;
  /** The text identifying the selected value. */
  value: Scalars['String']['output'];
};

/** Describes the payment method the shopper selected. */
export type Mage_SelectedPaymentMethod = {
  __typename?: 'Mage_SelectedPaymentMethod';
  /** The payment method code. */
  code: Scalars['String']['output'];
  /** Retrieve meta information for this payment method (image) */
  mollie_meta: Mage_MolliePaymentMethodMeta;
  /** The purchase order number. */
  purchase_order_number?: Maybe<Scalars['String']['output']>;
  /** The payment method title. */
  title: Scalars['String']['output'];
};

/** Contains details about the selected shipping method and carrier. */
export type Mage_SelectedShippingMethod = {
  __typename?: 'Mage_SelectedShippingMethod';
  /** The cost of shipping using this shipping method. */
  amount: Mage_Money;
  /** @deprecated The field should not be used on the storefront. */
  base_amount?: Maybe<Mage_Money>;
  /** A string that identifies a commercial carrier or an offline shipping method. */
  carrier_code: Scalars['String']['output'];
  /** The label for the carrier code. */
  carrier_title: Scalars['String']['output'];
  /** A shipping method code associated with a carrier. */
  method_code: Scalars['String']['output'];
  /** The label for the method code. */
  method_title: Scalars['String']['output'];
  /** The cost of shipping using this shipping method, excluding tax. */
  price_excl_tax: Mage_Money;
  /** The cost of shipping using this shipping method, including tax. */
  price_incl_tax: Mage_Money;
};

/** Defines the referenced product and the email sender and recipients. */
export type Mage_SendEmailToFriendInput = {
  /** The ID of the product that the sender is referencing. */
  product_id: Scalars['Int']['input'];
  /** An array containing information about each recipient. */
  recipients: Array<InputMaybe<Mage_SendEmailToFriendRecipientInput>>;
  /** Information about the customer and the content of the message. */
  sender: Mage_SendEmailToFriendSenderInput;
};

/** Contains information about the sender and recipients. */
export type Mage_SendEmailToFriendOutput = {
  __typename?: 'Mage_SendEmailToFriendOutput';
  /** An array containing information about each recipient. */
  recipients?: Maybe<Array<Maybe<Mage_SendEmailToFriendRecipient>>>;
  /** Information about the customer and the content of the message. */
  sender?: Maybe<Mage_SendEmailToFriendSender>;
};

/** An output object that contains information about the recipient. */
export type Mage_SendEmailToFriendRecipient = {
  __typename?: 'Mage_SendEmailToFriendRecipient';
  /** The email address of the recipient. */
  email: Scalars['String']['output'];
  /** The name of the recipient. */
  name: Scalars['String']['output'];
};

/** Contains details about a recipient. */
export type Mage_SendEmailToFriendRecipientInput = {
  /** The email address of the recipient. */
  email: Scalars['String']['input'];
  /** The name of the recipient. */
  name: Scalars['String']['input'];
};

/** An output object that contains information about the sender. */
export type Mage_SendEmailToFriendSender = {
  __typename?: 'Mage_SendEmailToFriendSender';
  /** The email address of the sender. */
  email: Scalars['String']['output'];
  /** The text of the message to be sent. */
  message: Scalars['String']['output'];
  /** The name of the sender. */
  name: Scalars['String']['output'];
};

/** Contains details about the sender. */
export type Mage_SendEmailToFriendSenderInput = {
  /** The email address of the sender. */
  email: Scalars['String']['input'];
  /** The text of the message to be sent. */
  message: Scalars['String']['input'];
  /** The name of the sender. */
  name: Scalars['String']['input'];
};

/** Contains details about the configuration of the Email to a Friend feature. */
export type Mage_SendFriendConfiguration = {
  __typename?: 'Mage_SendFriendConfiguration';
  /** Indicates whether the Email to a Friend feature is enabled. */
  enabled_for_customers: Scalars['Boolean']['output'];
  /** Indicates whether the Email to a Friend feature is enabled for guests. */
  enabled_for_guests: Scalars['Boolean']['output'];
};

/** Sets the billing address. */
export type Mage_SetBillingAddressOnCartInput = {
  /** The billing address. */
  billing_address: Mage_BillingAddressInput;
  /** The unique ID of a `Cart` object. */
  cart_id: Scalars['String']['input'];
};

/** Contains details about the cart after setting the billing address. */
export type Mage_SetBillingAddressOnCartOutput = {
  __typename?: 'Mage_SetBillingAddressOnCartOutput';
  /** The cart after setting the billing address. */
  cart: Mage_Cart;
};

/** Sets the cart as inactive */
export type Mage_SetCartAsInactiveOutput = {
  __typename?: 'Mage_SetCartAsInactiveOutput';
  /** The error message returned after failing to set the cart as inactive */
  error?: Maybe<Scalars['String']['output']>;
  /** Indicates whether the cart was set as inactive */
  success: Scalars['Boolean']['output'];
};

/** Defines the guest email and cart. */
export type Mage_SetGuestEmailOnCartInput = {
  /** The unique ID of a `Cart` object. */
  cart_id: Scalars['String']['input'];
  /** The email address of the guest. */
  email: Scalars['String']['input'];
};

/** Contains details about the cart after setting the email of a guest. */
export type Mage_SetGuestEmailOnCartOutput = {
  __typename?: 'Mage_SetGuestEmailOnCartOutput';
  /** The cart after setting the guest email. */
  cart: Mage_Cart;
};

/** Applies a payment method to the quote. */
export type Mage_SetPaymentMethodAndPlaceOrderInput = {
  /** The unique ID of a `Cart` object. */
  cart_id: Scalars['String']['input'];
  /** The payment method data to apply to the cart. */
  payment_method: Mage_PaymentMethodInput;
};

/** Applies a payment method to the cart. */
export type Mage_SetPaymentMethodOnCartInput = {
  /** The unique ID of a `Cart` object. */
  cart_id: Scalars['String']['input'];
  /** The payment method data to apply to the cart. */
  payment_method: Mage_PaymentMethodInput;
};

/** Contains details about the cart after setting the payment method. */
export type Mage_SetPaymentMethodOnCartOutput = {
  __typename?: 'Mage_SetPaymentMethodOnCartOutput';
  /** The cart after setting the payment method. */
  cart: Mage_Cart;
};

/** Specifies an array of addresses to use for shipping. */
export type Mage_SetShippingAddressesOnCartInput = {
  /** The unique ID of a `Cart` object. */
  cart_id: Scalars['String']['input'];
  /** An array of shipping addresses. */
  shipping_addresses: Array<InputMaybe<Mage_ShippingAddressInput>>;
};

/** Contains details about the cart after setting the shipping addresses. */
export type Mage_SetShippingAddressesOnCartOutput = {
  __typename?: 'Mage_SetShippingAddressesOnCartOutput';
  /** The cart after setting the shipping addresses. */
  cart: Mage_Cart;
};

/** Applies one or shipping methods to the cart. */
export type Mage_SetShippingMethodsOnCartInput = {
  /** The unique ID of a `Cart` object. */
  cart_id: Scalars['String']['input'];
  /** An array of shipping methods. */
  shipping_methods: Array<InputMaybe<Mage_ShippingMethodInput>>;
};

/** Contains details about the cart after setting the shipping methods. */
export type Mage_SetShippingMethodsOnCartOutput = {
  __typename?: 'Mage_SetShippingMethodsOnCartOutput';
  /** The cart after setting the shipping methods. */
  cart: Mage_Cart;
};

/** Defines whether bundle items must be shipped together. */
export enum Mage_ShipBundleItemsEnum {
  Separately = 'SEPARATELY',
  Together = 'TOGETHER'
}

export type Mage_ShipmentItem = Mage_ShipmentItemInterface & {
  __typename?: 'Mage_ShipmentItem';
  /** The unique ID for a `ShipmentItemInterface` object. */
  id: Scalars['ID']['output'];
  /** The order item associated with the shipment item. */
  order_item?: Maybe<Mage_OrderItemInterface>;
  /** The name of the base product. */
  product_name?: Maybe<Scalars['String']['output']>;
  /** The sale price for the base product. */
  product_sale_price: Mage_Money;
  /** The SKU of the base product. */
  product_sku: Scalars['String']['output'];
  /** The number of shipped items. */
  quantity_shipped: Scalars['Float']['output'];
};

/** Order shipment item details. */
export type Mage_ShipmentItemInterface = {
  /** The unique ID for a `ShipmentItemInterface` object. */
  id: Scalars['ID']['output'];
  /** The order item associated with the shipment item. */
  order_item?: Maybe<Mage_OrderItemInterface>;
  /** The name of the base product. */
  product_name?: Maybe<Scalars['String']['output']>;
  /** The sale price for the base product. */
  product_sale_price: Mage_Money;
  /** The SKU of the base product. */
  product_sku: Scalars['String']['output'];
  /** The number of shipped items. */
  quantity_shipped: Scalars['Float']['output'];
};

/** Contains order shipment tracking details. */
export type Mage_ShipmentTracking = {
  __typename?: 'Mage_ShipmentTracking';
  /** The shipping carrier for the order delivery. */
  carrier: Scalars['String']['output'];
  /** The tracking number of the order shipment. */
  number?: Maybe<Scalars['String']['output']>;
  /** The shipment tracking title. */
  title: Scalars['String']['output'];
};

/** Defines a single shipping address. */
export type Mage_ShippingAddressInput = {
  /** Defines a shipping address. */
  address?: InputMaybe<Mage_CartAddressInput>;
  /** An ID from the customer's address book that uniquely identifies the address to be used for shipping. */
  customer_address_id?: InputMaybe<Scalars['Int']['input']>;
  /** Text provided by the shopper. */
  customer_notes?: InputMaybe<Scalars['String']['input']>;
  /** The code of Pickup Location which will be used for In-Store Pickup. */
  pickup_location_code?: InputMaybe<Scalars['String']['input']>;
};

/** Contains shipping addresses and methods. */
export type Mage_ShippingCartAddress = Mage_CartAddressInterface & {
  __typename?: 'Mage_ShippingCartAddress';
  /** An array that lists the shipping methods that can be applied to the cart. */
  available_shipping_methods?: Maybe<Array<Maybe<Mage_AvailableShippingMethod>>>;
  /** @deprecated Use `cart_items_v2` instead. */
  cart_items?: Maybe<Array<Maybe<Mage_CartItemQuantity>>>;
  /** An array that lists the items in the cart. */
  cart_items_v2?: Maybe<Array<Maybe<Mage_CartItemInterface>>>;
  /** The city specified for the billing or shipping address. */
  city: Scalars['String']['output'];
  /** The company specified for the billing or shipping address. */
  company?: Maybe<Scalars['String']['output']>;
  /** An object containing the country label and code. */
  country: Mage_CartAddressCountry;
  /** Text provided by the shopper. */
  customer_notes?: Maybe<Scalars['String']['output']>;
  /** The customer's fax number. */
  fax?: Maybe<Scalars['String']['output']>;
  /** The first name of the customer or guest. */
  firstname: Scalars['String']['output'];
  /** Id of the customer address. */
  id?: Maybe<Scalars['Int']['output']>;
  /** @deprecated This information should not be exposed on the frontend. */
  items_weight?: Maybe<Scalars['Float']['output']>;
  /** The last name of the customer or guest. */
  lastname: Scalars['String']['output'];
  /** The middle name of the person associated with the billing/shipping address. */
  middlename?: Maybe<Scalars['String']['output']>;
  pickup_location_code?: Maybe<Scalars['String']['output']>;
  /** The ZIP or postal code of the billing or shipping address. */
  postcode?: Maybe<Scalars['String']['output']>;
  /** An honorific, such as Dr., Mr., or Mrs. */
  prefix?: Maybe<Scalars['String']['output']>;
  /** An object containing the region label and code. */
  region?: Maybe<Mage_CartAddressRegion>;
  /** Indicates whether the shipping address is same as billing address. */
  same_as_billing: Scalars['Boolean']['output'];
  /** An object that describes the selected shipping method. */
  selected_shipping_method?: Maybe<Mage_SelectedShippingMethod>;
  /** An array containing the street for the billing or shipping address. */
  street: Array<Maybe<Scalars['String']['output']>>;
  /** A value such as Sr., Jr., or III. */
  suffix?: Maybe<Scalars['String']['output']>;
  /** The telephone number for the billing or shipping address. */
  telephone?: Maybe<Scalars['String']['output']>;
  /** The unique id of the customer address. */
  uid: Scalars['String']['output'];
  /** The VAT company number for billing or shipping address. */
  vat_id?: Maybe<Scalars['String']['output']>;
};

/** Defines an individual shipping discount. This discount can be applied to shipping. */
export type Mage_ShippingDiscount = {
  __typename?: 'Mage_ShippingDiscount';
  /** The amount of the discount. */
  amount: Mage_Money;
};

/** Contains details about shipping and handling costs. */
export type Mage_ShippingHandling = {
  __typename?: 'Mage_ShippingHandling';
  /** The shipping amount, excluding tax. */
  amount_excluding_tax?: Maybe<Mage_Money>;
  /** The shipping amount, including tax. */
  amount_including_tax?: Maybe<Mage_Money>;
  /** The applied discounts to the shipping. */
  discounts?: Maybe<Array<Maybe<Mage_ShippingDiscount>>>;
  /** Details about taxes applied for shipping. */
  taxes?: Maybe<Array<Maybe<Mage_TaxItem>>>;
  /** The total amount for shipping. */
  total_amount: Mage_Money;
};

/** Defines the shipping carrier and method. */
export type Mage_ShippingMethodInput = {
  /** A string that identifies a commercial carrier or an offline delivery method. */
  carrier_code: Scalars['String']['input'];
  /** A string that indicates which service a commercial carrier will use to ship items. For offline delivery methods, this value is similar to the label displayed on the checkout page. */
  method_code: Scalars['String']['input'];
};

/** An implementation for simple product cart items. */
export type Mage_SimpleCartItem = Mage_CartItemInterface & {
  __typename?: 'Mage_SimpleCartItem';
  /** An array containing the customizable options the shopper selected. */
  customizable_options: Array<Maybe<Mage_SelectedCustomizableOption>>;
  /** Errors assigned to this quote item */
  errors?: Maybe<Array<Maybe<Mage_CartItemError>>>;
  /** The entered gift message for the cart item */
  gift_message?: Maybe<Mage_GiftMessage>;
  /** @deprecated Use `uid` instead. */
  id: Scalars['String']['output'];
  /** True if requested quantity is less than available stock, false otherwise. */
  is_available: Scalars['Boolean']['output'];
  /** Message to display when the product is not available with this selected option. */
  not_available_message?: Maybe<Scalars['String']['output']>;
  /** Contains details about the price of the item, including taxes and discounts. */
  prices?: Maybe<Mage_CartItemPrices>;
  /** Details about an item in the cart. */
  product: Mage_ProductInterface;
  product_type: Scalars['String']['output'];
  /** The quantity of this item in the cart. */
  quantity: Scalars['Float']['output'];
  /** The unique ID for a `CartItemInterface` object. */
  uid: Scalars['ID']['output'];
};

/** Defines a simple product, which is tangible and is usually sold in single units or in fixed quantities. */
export type Mage_SimpleProduct = Mage_CustomizableProductInterface & Mage_PhysicalProductInterface & Mage_ProductInterface & Mage_RoutableInterface & {
  __typename?: 'Mage_SimpleProduct';
  /** @deprecated Use the `custom_attributes` field instead. */
  activity?: Maybe<Scalars['String']['output']>;
  /**
   * The attribute set assigned to the product.
   * @deprecated The field should not be used on the storefront.
   */
  attribute_set_id?: Maybe<Scalars['Int']['output']>;
  /** The relative canonical URL. This value is returned only if the system setting 'Use Canonical Link Meta Tag For Products' is enabled. */
  canonical_url?: Maybe<Scalars['String']['output']>;
  /** The categories assigned to a product. */
  categories?: Maybe<Array<Maybe<Mage_CategoryInterface>>>;
  /** @deprecated Use the `custom_attributes` field instead. */
  category_gear?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  climate?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  collar?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  color?: Maybe<Scalars['Int']['output']>;
  /** The product's country of origin. */
  country_of_manufacture?: Maybe<Scalars['String']['output']>;
  /**
   * Timestamp indicating when the product was created.
   * @deprecated The field should not be used on the storefront.
   */
  created_at?: Maybe<Scalars['String']['output']>;
  /** Crosssell Products */
  crosssell_products?: Maybe<Array<Maybe<Mage_ProductInterface>>>;
  /** Product custom attributes. */
  custom_attributesV2?: Maybe<Mage_ProductCustomAttributes>;
  /** Detailed information about the product. The value can include simple HTML tags. */
  description?: Maybe<Mage_ComplexTextValue>;
  /** @deprecated Use the `custom_attributes` field instead. */
  eco_collection?: Maybe<Scalars['Int']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  erin_recommends?: Maybe<Scalars['Int']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  features_bags?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  format?: Maybe<Scalars['Int']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  gender?: Maybe<Scalars['String']['output']>;
  /** Returns a value indicating gift message availability for the product. */
  gift_message_available: Scalars['Boolean']['output'];
  /**
   * The ID number assigned to the product.
   * @deprecated Use the `uid` field instead.
   */
  id?: Maybe<Scalars['Int']['output']>;
  /** The relative path to the main image on the product page. */
  image?: Maybe<Mage_ProductImage>;
  /** @deprecated Use the `custom_attributes` field instead. */
  is_seller_product?: Maybe<Scalars['Int']['output']>;
  /**
   * A number representing the product's manufacturer.
   * @deprecated Use the `custom_attributes` field instead.
   */
  manufacturer?: Maybe<Scalars['Int']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  material?: Maybe<Scalars['String']['output']>;
  /** Maximum Qty Allowed in Shopping Cart */
  max_sale_qty?: Maybe<Scalars['Float']['output']>;
  /** An array of media gallery objects. */
  media_gallery?: Maybe<Array<Maybe<Mage_MediaGalleryInterface>>>;
  /**
   * An array of MediaGalleryEntry objects.
   * @deprecated Use `media_gallery` instead.
   */
  media_gallery_entries?: Maybe<Array<Maybe<Mage_MediaGalleryEntry>>>;
  /** A brief overview of the product for search results listings, maximum 255 characters. */
  meta_description?: Maybe<Scalars['String']['output']>;
  /** A comma-separated list of keywords that are visible only to search engines. */
  meta_keyword?: Maybe<Scalars['String']['output']>;
  /** A string that is displayed in the title bar and tab of the browser and in search results lists. */
  meta_title?: Maybe<Scalars['String']['output']>;
  /** Minimum Qty Allowed in Shopping Cart */
  min_sale_qty?: Maybe<Scalars['Float']['output']>;
  /** The product name. Customers use this name to identify the product. */
  name?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  new?: Maybe<Scalars['Int']['output']>;
  /** The beginning date for new product listings, and determines if the product is featured as a new product. */
  new_from_date?: Maybe<Scalars['String']['output']>;
  /** The end date for new product listings. */
  new_to_date?: Maybe<Scalars['String']['output']>;
  /** Product stock only x left count */
  only_x_left_in_stock?: Maybe<Scalars['Float']['output']>;
  /** An array of options for a customizable product. */
  options?: Maybe<Array<Maybe<Mage_CustomizableOptionInterface>>>;
  /** If the product has multiple options, determines where they appear on the product page. */
  options_container?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  pattern?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  performance_fabric?: Maybe<Scalars['Int']['output']>;
  /**
   * Indicates the price of an item.
   * @deprecated Use `price_range` for product price information.
   */
  price?: Maybe<Mage_ProductPrices>;
  /** The range of prices for the product */
  price_range: Mage_PriceRange;
  /** An array of `TierPrice` objects. */
  price_tiers?: Maybe<Array<Maybe<Mage_TierPrice>>>;
  /** An array of `ProductLinks` objects. */
  product_links?: Maybe<Array<Maybe<Mage_ProductLinksInterface>>>;
  /** Amount of available stock */
  quantity?: Maybe<Scalars['Float']['output']>;
  /** The average of all the ratings given to the product. */
  rating_summary: Scalars['Float']['output'];
  /** Contains 0 when there is no redirect error. A value of 301 indicates the URL of the requested resource has been changed permanently, while a value of 302 indicates a temporary redirect. */
  redirect_code: Scalars['Int']['output'];
  /** An array of products to be displayed in a Related Products block. */
  related_products?: Maybe<Array<Maybe<Mage_ProductInterface>>>;
  /** The internal relative URL. If the specified URL is a redirect, the query returns the redirected URL, not the original. */
  relative_url?: Maybe<Scalars['String']['output']>;
  /** The total count of all the reviews given to the product. */
  review_count: Scalars['Int']['output'];
  /** The list of products reviews. */
  reviews: Mage_ProductReviews;
  /** @deprecated Use the `custom_attributes` field instead. */
  sale?: Maybe<Scalars['Int']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  seller_id?: Maybe<Scalars['Int']['output']>;
  /** A short description of the product. Its use depends on the theme. */
  short_description?: Maybe<Mage_ComplexTextValue>;
  /** @deprecated Use the `custom_attributes` field instead. */
  size?: Maybe<Scalars['Int']['output']>;
  /** A number or code assigned to a product to identify the product, options, price, and manufacturer. */
  sku?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  sleeve?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  sm_featured?: Maybe<Scalars['Int']['output']>;
  /** The relative path to the small image, which is used on catalog pages. */
  small_image?: Maybe<Mage_ProductImage>;
  /**
   * The beginning date that a product has a special price.
   * @deprecated The field should not be used on the storefront.
   */
  special_from_date?: Maybe<Scalars['String']['output']>;
  /** The discounted price of the product. */
  special_price?: Maybe<Scalars['Float']['output']>;
  /** The end date for a product with a special price. */
  special_to_date?: Maybe<Scalars['String']['output']>;
  /** The status assigned to the product, 0 for disabled, 1 for enabled. */
  status?: Maybe<Scalars['Int']['output']>;
  /** Stock status of the product */
  stock_status?: Maybe<Mage_ProductStockStatus>;
  /** @deprecated Use the `custom_attributes` field instead. */
  strap_bags?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  style_bags?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  style_bottom?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  style_general?: Maybe<Scalars['String']['output']>;
  /** The file name of a swatch image. */
  swatch_image?: Maybe<Scalars['String']['output']>;
  /** The relative path to the product's thumbnail image. */
  thumbnail?: Maybe<Mage_ProductImage>;
  /**
   * The price when tier pricing is in effect and the items purchased threshold has been reached.
   * @deprecated Use `price_tiers` for product tier price information.
   */
  tier_price?: Maybe<Scalars['Float']['output']>;
  /**
   * An array of ProductTierPrices objects.
   * @deprecated Use `price_tiers` for product tier price information.
   */
  tier_prices?: Maybe<Array<Maybe<Mage_ProductTierPrices>>>;
  /** One of PRODUCT, CATEGORY, or CMS_PAGE. */
  type?: Maybe<Mage_UrlRewriteEntityTypeEnum>;
  /**
   * One of simple, virtual, bundle, downloadable, grouped, or configurable.
   * @deprecated Use `__typename` instead.
   */
  type_id?: Maybe<Scalars['String']['output']>;
  /** The unique ID for a `ProductInterface` object. */
  uid: Scalars['ID']['output'];
  /**
   * Timestamp indicating when the product was updated.
   * @deprecated The field should not be used on the storefront.
   */
  updated_at?: Maybe<Scalars['String']['output']>;
  /** Upsell Products */
  upsell_products?: Maybe<Array<Maybe<Mage_ProductInterface>>>;
  /** The part of the URL that identifies the product */
  url_key?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use product's `canonical_url` or url rewrites instead */
  url_path?: Maybe<Scalars['String']['output']>;
  /** URL rewrites list */
  url_rewrites?: Maybe<Array<Maybe<Mage_UrlRewrite>>>;
  /** The part of the product URL that is appended after the url key */
  url_suffix?: Maybe<Scalars['String']['output']>;
  /** The visibility assigned to the product. */
  visibility?: Maybe<Scalars['Int']['output']>;
  /**
   * An array of websites in which the product is available.
   * @deprecated The field should not be used on the storefront.
   */
  websites?: Maybe<Array<Maybe<Mage_Website>>>;
  /** The weight of the item, in units defined by the store. */
  weight?: Maybe<Scalars['Float']['output']>;
};


/** Defines a simple product, which is tangible and is usually sold in single units or in fixed quantities. */
export type Mage_SimpleProductCustom_AttributesV2Args = {
  filters?: InputMaybe<Mage_AttributeFilterInput>;
};


/** Defines a simple product, which is tangible and is usually sold in single units or in fixed quantities. */
export type Mage_SimpleProductReviewsArgs = {
  currentPage?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
};

/** Defines a single product to add to the cart. */
export type Mage_SimpleProductCartItemInput = {
  /** An array that defines customizable options for the product. */
  customizable_options?: InputMaybe<Array<InputMaybe<Mage_CustomizableOptionInput>>>;
  /** An object containing the `sku`, `quantity`, and other relevant information about the product. */
  data: Mage_CartItemInput;
};

/** Contains a simple product wish list item. */
export type Mage_SimpleWishlistItem = Mage_WishlistItemInterface & {
  __typename?: 'Mage_SimpleWishlistItem';
  /** The date and time the item was added to the wish list. */
  added_at: Scalars['String']['output'];
  /** Custom options selected for the wish list item. */
  customizable_options: Array<Maybe<Mage_SelectedCustomizableOption>>;
  /** The description of the item. */
  description?: Maybe<Scalars['String']['output']>;
  /** The unique ID for a `WishlistItemInterface` object. */
  id: Scalars['ID']['output'];
  /** Product details of the wish list item. */
  product?: Maybe<Mage_ProductInterface>;
  /** The quantity of this wish list item. */
  quantity: Scalars['Float']['output'];
};

/** Smart button payment inputs */
export type Mage_SmartButtonMethodInput = {
  /** The payment source for the payment method */
  payment_source?: InputMaybe<Scalars['String']['input']>;
  /** The payment services order ID */
  payments_order_id?: InputMaybe<Scalars['String']['input']>;
  /** PayPal order ID */
  paypal_order_id?: InputMaybe<Scalars['String']['input']>;
};

export type Mage_SmartButtonsConfig = Mage_PaymentConfigItem & {
  __typename?: 'Mage_SmartButtonsConfig';
  /** Indicated whether to use App Switch on enabled mobile devices */
  app_switch_when_available?: Maybe<Scalars['Boolean']['output']>;
  /** The styles for the PayPal Smart Button configuration */
  button_styles?: Maybe<Mage_ButtonStyles>;
  /** The payment method code as defined in the payment gateway */
  code?: Maybe<Scalars['String']['output']>;
  /** Indicates whether to display the PayPal Pay Later message */
  display_message?: Maybe<Scalars['Boolean']['output']>;
  /** Indicates whether to display Venmo */
  display_venmo?: Maybe<Scalars['Boolean']['output']>;
  /** Indicates whether the payment method is displayed */
  is_visible?: Maybe<Scalars['Boolean']['output']>;
  /** Contains details about the styles for the PayPal Pay Later message */
  message_styles?: Maybe<Mage_MessageStyles>;
  /** Defines the payment intent (Authorize or Capture */
  payment_intent?: Maybe<Scalars['String']['output']>;
  /** The PayPal parameters required to load the JS SDK */
  sdk_params?: Maybe<Array<Maybe<Mage_SdkParams>>>;
  /** The relative order the payment method is displayed on the checkout page */
  sort_order?: Maybe<Scalars['String']['output']>;
  /** The name displayed for the payment method */
  title?: Maybe<Scalars['String']['output']>;
};

/** Indicates whether to return results in ascending or descending order. */
export enum Mage_SortEnum {
  Asc = 'ASC',
  Desc = 'DESC'
}

/** Defines a possible sort field. */
export type Mage_SortField = {
  __typename?: 'Mage_SortField';
  /** The label of the sort field. */
  label?: Maybe<Scalars['String']['output']>;
  /** The attribute code of the sort field. */
  value?: Maybe<Scalars['String']['output']>;
};

/** Contains a default value for sort fields and all available sort fields. */
export type Mage_SortFields = {
  __typename?: 'Mage_SortFields';
  /** The default sort field value. */
  default?: Maybe<Scalars['String']['output']>;
  /** An array of possible sort fields. */
  options?: Maybe<Array<Maybe<Mage_SortField>>>;
};

/** Specifies the field to use for sorting quote items */
export enum Mage_SortQuoteItemsEnum {
  BaseDiscountAmount = 'BASE_DISCOUNT_AMOUNT',
  BaseDiscountTaxCompensationAmount = 'BASE_DISCOUNT_TAX_COMPENSATION_AMOUNT',
  BasePrice = 'BASE_PRICE',
  BasePriceIncTax = 'BASE_PRICE_INC_TAX',
  BaseRowTotal = 'BASE_ROW_TOTAL',
  BaseRowTotalIncTax = 'BASE_ROW_TOTAL_INC_TAX',
  BaseTaxAmount = 'BASE_TAX_AMOUNT',
  BaseTaxBeforeDiscount = 'BASE_TAX_BEFORE_DISCOUNT',
  CreatedAt = 'CREATED_AT',
  CustomPrice = 'CUSTOM_PRICE',
  Description = 'DESCRIPTION',
  DiscountAmount = 'DISCOUNT_AMOUNT',
  DiscountPercent = 'DISCOUNT_PERCENT',
  DiscountTaxCompensationAmount = 'DISCOUNT_TAX_COMPENSATION_AMOUNT',
  FreeShipping = 'FREE_SHIPPING',
  ItemId = 'ITEM_ID',
  Name = 'NAME',
  OriginalCustomPrice = 'ORIGINAL_CUSTOM_PRICE',
  Price = 'PRICE',
  PriceIncTax = 'PRICE_INC_TAX',
  ProductId = 'PRODUCT_ID',
  ProductType = 'PRODUCT_TYPE',
  Qty = 'QTY',
  RowTotal = 'ROW_TOTAL',
  RowTotalIncTax = 'ROW_TOTAL_INC_TAX',
  RowTotalWithDiscount = 'ROW_TOTAL_WITH_DISCOUNT',
  RowWeight = 'ROW_WEIGHT',
  Sku = 'SKU',
  TaxAmount = 'TAX_AMOUNT',
  TaxBeforeDiscount = 'TAX_BEFORE_DISCOUNT',
  TaxPercent = 'TAX_PERCENT',
  UpdatedAt = 'UPDATED_AT',
  Weight = 'WEIGHT'
}

/** Contains information about a store's configuration. */
export type Mage_StoreConfig = {
  __typename?: 'Mage_StoreConfig';
  /** Contains scripts that must be included in the HTML before the closing `<body>` tag. */
  absolute_footer?: Maybe<Scalars['String']['output']>;
  /** Indicates whether guest users can write product reviews. Possible values: 1 (Yes) and 0 (No). */
  allow_guests_to_write_product_reviews?: Maybe<Scalars['String']['output']>;
  /** The value of the Allow Gift Messages for Order Items option */
  allow_items?: Maybe<Scalars['String']['output']>;
  /** The value of the Allow Gift Messages on Order Level option */
  allow_order?: Maybe<Scalars['String']['output']>;
  /** Indicates whether to enable autocomplete on login and forgot password forms. */
  autocomplete_on_storefront?: Maybe<Scalars['Boolean']['output']>;
  /** The base currency code. */
  base_currency_code?: Maybe<Scalars['String']['output']>;
  /** A fully-qualified URL that is used to create relative links to the `base_url`. */
  base_link_url?: Maybe<Scalars['String']['output']>;
  /** The fully-qualified URL that specifies the location of media files. */
  base_media_url?: Maybe<Scalars['String']['output']>;
  /** The fully-qualified URL that specifies the location of static view files. */
  base_static_url?: Maybe<Scalars['String']['output']>;
  /** The store’s fully-qualified base URL. */
  base_url?: Maybe<Scalars['String']['output']>;
  /** Braintree 3D Secure, should 3D Secure be used for specific countries. */
  braintree_3dsecure_allowspecific?: Maybe<Scalars['Boolean']['output']>;
  /** Braintree 3D Secure, always request 3D Secure flag. */
  braintree_3dsecure_always_request_3ds?: Maybe<Scalars['Boolean']['output']>;
  /** Braintree 3D Secure, the specific countries to use 3D Secure in, to be used if allow specific is status is enabled. */
  braintree_3dsecure_specificcountry?: Maybe<Scalars['String']['output']>;
  /** Braintree 3D Secure, threshold above which 3D Secure should be requested. */
  braintree_3dsecure_threshold_amount?: Maybe<Scalars['String']['output']>;
  /** Braintree 3D Secure enabled/active status. */
  braintree_3dsecure_verify_3dsecure?: Maybe<Scalars['Boolean']['output']>;
  /** Braintree ACH vault status. */
  braintree_ach_direct_debit_vault_active?: Maybe<Scalars['Boolean']['output']>;
  /** Braintree Apple Pay merchant name. */
  braintree_applepay_merchant_name?: Maybe<Scalars['String']['output']>;
  /** Braintree Apple Pay vault status. */
  braintree_applepay_vault_active?: Maybe<Scalars['Boolean']['output']>;
  /** Braintree cc vault status. */
  braintree_cc_vault_active?: Maybe<Scalars['String']['output']>;
  /** Braintree cc vault CVV re-verification enabled status. */
  braintree_cc_vault_cvv?: Maybe<Scalars['Boolean']['output']>;
  /** Braintree environment. */
  braintree_environment?: Maybe<Scalars['String']['output']>;
  /** Braintree Google Pay button color. */
  braintree_googlepay_btn_color?: Maybe<Scalars['String']['output']>;
  /** Braintree Google Pay Card types supported. */
  braintree_googlepay_cctypes?: Maybe<Scalars['String']['output']>;
  /** Braintree Google Pay merchant ID. */
  braintree_googlepay_merchant_id?: Maybe<Scalars['String']['output']>;
  /** Braintree Google Pay vault status. */
  braintree_googlepay_vault_active?: Maybe<Scalars['Boolean']['output']>;
  /** Braintree Local Payment Methods allowed payment methods. */
  braintree_local_payment_allowed_methods?: Maybe<Scalars['String']['output']>;
  /** Braintree Local Payment Methods fallback button text. */
  braintree_local_payment_fallback_button_text?: Maybe<Scalars['String']['output']>;
  /** Braintree Local Payment Methods redirect URL on failed payment. */
  braintree_local_payment_redirect_on_fail?: Maybe<Scalars['String']['output']>;
  /** Braintree Merchant Account ID. */
  braintree_merchant_account_id?: Maybe<Scalars['String']['output']>;
  /** Braintree PayPal Credit mini-cart & cart button style color. */
  braintree_paypal_button_location_cart_type_credit_color?: Maybe<Scalars['String']['output']>;
  /** Braintree PayPal Credit mini-cart & cart button style label. */
  braintree_paypal_button_location_cart_type_credit_label?: Maybe<Scalars['String']['output']>;
  /** Braintree PayPal Credit mini-cart & cart button style shape. */
  braintree_paypal_button_location_cart_type_credit_shape?: Maybe<Scalars['String']['output']>;
  /** Braintree PayPal Credit mini-cart & cart button show status. */
  braintree_paypal_button_location_cart_type_credit_show?: Maybe<Scalars['Boolean']['output']>;
  /** Braintree PayPal Pay Later messaging mini-cart & cart style layout. */
  braintree_paypal_button_location_cart_type_messaging_layout?: Maybe<Scalars['String']['output']>;
  /** Braintree PayPal Pay Later messaging mini-cart & cart style logo. */
  braintree_paypal_button_location_cart_type_messaging_logo?: Maybe<Scalars['String']['output']>;
  /** Braintree PayPal Pay Later messaging mini-cart & cart style logo position. */
  braintree_paypal_button_location_cart_type_messaging_logo_position?: Maybe<Scalars['String']['output']>;
  /** Braintree PayPal Pay Later messaging mini-cart & cart show status. */
  braintree_paypal_button_location_cart_type_messaging_show?: Maybe<Scalars['Boolean']['output']>;
  /** Braintree PayPal Pay Later messaging checkout style text color. */
  braintree_paypal_button_location_cart_type_messaging_text_color?: Maybe<Scalars['String']['output']>;
  /** Braintree PayPal Pay Later mini-cart & cart button style color. */
  braintree_paypal_button_location_cart_type_paylater_color?: Maybe<Scalars['String']['output']>;
  /** Braintree PayPal Pay Later mini-cart & cart button style label. */
  braintree_paypal_button_location_cart_type_paylater_label?: Maybe<Scalars['String']['output']>;
  /** Braintree PayPal Pay Later mini-cart & cart button style shape. */
  braintree_paypal_button_location_cart_type_paylater_shape?: Maybe<Scalars['String']['output']>;
  /** Braintree PayPal Pay Later mini-cart & cart button show status. */
  braintree_paypal_button_location_cart_type_paylater_show?: Maybe<Scalars['Boolean']['output']>;
  /** Braintree PayPal mini-cart & cart button style color. */
  braintree_paypal_button_location_cart_type_paypal_color?: Maybe<Scalars['String']['output']>;
  /** Braintree PayPal mini-cart & cart button style label. */
  braintree_paypal_button_location_cart_type_paypal_label?: Maybe<Scalars['String']['output']>;
  /** Braintree PayPal mini-cart & cart button style shape. */
  braintree_paypal_button_location_cart_type_paypal_shape?: Maybe<Scalars['String']['output']>;
  /** Braintree PayPal mini-cart & cart button show. */
  braintree_paypal_button_location_cart_type_paypal_show?: Maybe<Scalars['Boolean']['output']>;
  /** Braintree PayPal Credit checkout button style color. */
  braintree_paypal_button_location_checkout_type_credit_color?: Maybe<Scalars['String']['output']>;
  /** Braintree PayPal Credit checkout button style label. */
  braintree_paypal_button_location_checkout_type_credit_label?: Maybe<Scalars['String']['output']>;
  /** Braintree PayPal Credit checkout button style shape. */
  braintree_paypal_button_location_checkout_type_credit_shape?: Maybe<Scalars['String']['output']>;
  /** Braintree PayPal Credit checkout button show status. */
  braintree_paypal_button_location_checkout_type_credit_show?: Maybe<Scalars['Boolean']['output']>;
  /** Braintree PayPal Pay Later messaging checkout style layout. */
  braintree_paypal_button_location_checkout_type_messaging_layout?: Maybe<Scalars['String']['output']>;
  /** Braintree PayPal Pay Later messaging checkout style logo. */
  braintree_paypal_button_location_checkout_type_messaging_logo?: Maybe<Scalars['String']['output']>;
  /** Braintree PayPal Pay Later messaging checkout style logo position. */
  braintree_paypal_button_location_checkout_type_messaging_logo_position?: Maybe<Scalars['String']['output']>;
  /** Braintree PayPal Pay Later messaging checkout show status. */
  braintree_paypal_button_location_checkout_type_messaging_show?: Maybe<Scalars['Boolean']['output']>;
  /** Braintree PayPal Pay Later messaging checkout style text color. */
  braintree_paypal_button_location_checkout_type_messaging_text_color?: Maybe<Scalars['String']['output']>;
  /** Braintree PayPal Pay Later checkout button style color. */
  braintree_paypal_button_location_checkout_type_paylater_color?: Maybe<Scalars['String']['output']>;
  /** Braintree PayPal Pay Later checkout button style label. */
  braintree_paypal_button_location_checkout_type_paylater_label?: Maybe<Scalars['String']['output']>;
  /** Braintree PayPal Pay Later checkout button style shape. */
  braintree_paypal_button_location_checkout_type_paylater_shape?: Maybe<Scalars['String']['output']>;
  /** Braintree PayPal Pay Later checkout button show status. */
  braintree_paypal_button_location_checkout_type_paylater_show?: Maybe<Scalars['Boolean']['output']>;
  /** Braintree PayPal checkout button style color. */
  braintree_paypal_button_location_checkout_type_paypal_color?: Maybe<Scalars['String']['output']>;
  /** Braintree PayPal checkout button style label. */
  braintree_paypal_button_location_checkout_type_paypal_label?: Maybe<Scalars['String']['output']>;
  /** Braintree PayPal checkout button style shape. */
  braintree_paypal_button_location_checkout_type_paypal_shape?: Maybe<Scalars['String']['output']>;
  /** Braintree PayPal checkout button show. */
  braintree_paypal_button_location_checkout_type_paypal_show?: Maybe<Scalars['Boolean']['output']>;
  /** Braintree PayPal Credit PDP button style color. */
  braintree_paypal_button_location_productpage_type_credit_color?: Maybe<Scalars['String']['output']>;
  /** Braintree PayPal Credit PDP button style label. */
  braintree_paypal_button_location_productpage_type_credit_label?: Maybe<Scalars['String']['output']>;
  /** Braintree PayPal Credit PDP button style shape. */
  braintree_paypal_button_location_productpage_type_credit_shape?: Maybe<Scalars['String']['output']>;
  /** Braintree PayPal Credit PDP button show status. */
  braintree_paypal_button_location_productpage_type_credit_show?: Maybe<Scalars['Boolean']['output']>;
  /** Braintree PayPal Pay Later messaging PDP style layout. */
  braintree_paypal_button_location_productpage_type_messaging_layout?: Maybe<Scalars['String']['output']>;
  /** Braintree PayPal Pay Later messaging PDP style logo. */
  braintree_paypal_button_location_productpage_type_messaging_logo?: Maybe<Scalars['String']['output']>;
  /** Braintree PayPal Pay Later messaging PDP style logo position. */
  braintree_paypal_button_location_productpage_type_messaging_logo_position?: Maybe<Scalars['String']['output']>;
  /** Braintree PayPal Pay Later messaging PDP show status. */
  braintree_paypal_button_location_productpage_type_messaging_show?: Maybe<Scalars['Boolean']['output']>;
  /** Braintree PayPal Pay Later messaging PDP style text color. */
  braintree_paypal_button_location_productpage_type_messaging_text_color?: Maybe<Scalars['String']['output']>;
  /** Braintree PayPal Pay Later PDP button style color. */
  braintree_paypal_button_location_productpage_type_paylater_color?: Maybe<Scalars['String']['output']>;
  /** Braintree PayPal Pay Later PDP button style label. */
  braintree_paypal_button_location_productpage_type_paylater_label?: Maybe<Scalars['String']['output']>;
  /** Braintree PayPal Pay Later PDP button style shape. */
  braintree_paypal_button_location_productpage_type_paylater_shape?: Maybe<Scalars['String']['output']>;
  /** Braintree PayPal Pay Later PDP button show status. */
  braintree_paypal_button_location_productpage_type_paylater_show?: Maybe<Scalars['Boolean']['output']>;
  /** Braintree PayPal PDP button style color. */
  braintree_paypal_button_location_productpage_type_paypal_color?: Maybe<Scalars['String']['output']>;
  /** Braintree PayPal PDP button style label. */
  braintree_paypal_button_location_productpage_type_paypal_label?: Maybe<Scalars['String']['output']>;
  /** Braintree PayPal PDP button style shape. */
  braintree_paypal_button_location_productpage_type_paypal_shape?: Maybe<Scalars['String']['output']>;
  /** Braintree PayPal PDP button show. */
  braintree_paypal_button_location_productpage_type_paypal_show?: Maybe<Scalars['Boolean']['output']>;
  /** Braintree PayPal Credit Merchant Name on the FCA Register. */
  braintree_paypal_credit_uk_merchant_name?: Maybe<Scalars['String']['output']>;
  /** Should display Braintree PayPal in mini-cart & cart? */
  braintree_paypal_display_on_shopping_cart?: Maybe<Scalars['Boolean']['output']>;
  /** Braintree PayPal merchant's country. */
  braintree_paypal_merchant_country?: Maybe<Scalars['String']['output']>;
  /** Braintree PayPal override for Merchant Name. */
  braintree_paypal_merchant_name_override?: Maybe<Scalars['String']['output']>;
  /** Does Braintree PayPal require the customer's billing address? */
  braintree_paypal_require_billing_address?: Maybe<Scalars['Boolean']['output']>;
  /** Does Braintree PayPal require the order line items? */
  braintree_paypal_send_cart_line_items?: Maybe<Scalars['Boolean']['output']>;
  /** Braintree PayPal vault status. */
  braintree_paypal_vault_active?: Maybe<Scalars['Boolean']['output']>;
  /** checkout/cart/delete_quote_after: quote lifetime in days. */
  cart_expires_in_days?: Maybe<Scalars['Int']['output']>;
  /** checkout/cart_link/use_qty: what to show in the display cart summary, number of items or item quantities. */
  cart_summary_display_quantity?: Maybe<Scalars['Int']['output']>;
  /** The default sort order of the search results list. */
  catalog_default_sort_by?: Maybe<Scalars['String']['output']>;
  /** Corresponds to the 'Display Prices In Product Lists' field in the Admin. It indicates how FPT information is displayed on category pages. */
  category_fixed_product_tax_display_setting?: Maybe<Mage_FixedProductTaxDisplaySettings>;
  /** The suffix applied to category pages, such as `.htm` or `.html`. */
  category_url_suffix?: Maybe<Scalars['String']['output']>;
  /** Indicates whether only specific countries can use this payment method. */
  check_money_order_enable_for_specific_countries?: Maybe<Scalars['Boolean']['output']>;
  /** Indicates whether the Check/Money Order payment method is enabled. */
  check_money_order_enabled?: Maybe<Scalars['Boolean']['output']>;
  /** The name of the party to whom the check must be payable. */
  check_money_order_make_check_payable_to?: Maybe<Scalars['String']['output']>;
  /** The maximum order amount required to qualify for the Check/Money Order payment method. */
  check_money_order_max_order_total?: Maybe<Scalars['String']['output']>;
  /** The minimum order amount required to qualify for the Check/Money Order payment method. */
  check_money_order_min_order_total?: Maybe<Scalars['String']['output']>;
  /** The status of new orders placed using the Check/Money Order payment method. */
  check_money_order_new_order_status?: Maybe<Scalars['String']['output']>;
  /** A comma-separated list of specific countries allowed to use the Check/Money Order payment method. */
  check_money_order_payment_from_specific_countries?: Maybe<Scalars['String']['output']>;
  /** The full street address or PO Box where the checks are mailed. */
  check_money_order_send_check_to?: Maybe<Scalars['String']['output']>;
  /** A number indicating the position of the Check/Money Order payment method in the list of available payment methods during checkout. */
  check_money_order_sort_order?: Maybe<Scalars['Int']['output']>;
  /** The title of the Check/Money Order payment method displayed on the storefront. */
  check_money_order_title?: Maybe<Scalars['String']['output']>;
  /** The name of the CMS page that identifies the home page for the store. */
  cms_home_page?: Maybe<Scalars['String']['output']>;
  /** A specific CMS page that displays when cookies are not enabled for the browser. */
  cms_no_cookies?: Maybe<Scalars['String']['output']>;
  /** A specific CMS page that displays when a 404 'Page Not Found' error occurs. */
  cms_no_route?: Maybe<Scalars['String']['output']>;
  /**
   * A code assigned to the store to identify it.
   * @deprecated Use `store_code` instead.
   */
  code?: Maybe<Scalars['String']['output']>;
  /** checkout/cart/configurable_product_image: which image to use for configurable products. */
  configurable_product_image: Mage_ProductImageThumbnail;
  /** Indicates whether the `parent` or child (`itself`) thumbnail should be used in the cart for configurable products. */
  configurable_thumbnail_source?: Maybe<Scalars['String']['output']>;
  /** Indicates whether the Contact Us form in enabled. */
  contact_enabled: Scalars['Boolean']['output'];
  /** The copyright statement that appears at the bottom of each page. */
  copyright?: Maybe<Scalars['String']['output']>;
  /** Extended Config Data - general/region/state_required */
  countries_with_required_region?: Maybe<Scalars['String']['output']>;
  /** Indicates if the new accounts need confirmation. */
  create_account_confirmation?: Maybe<Scalars['Boolean']['output']>;
  /** Customer access token lifetime. */
  customer_access_token_lifetime?: Maybe<Scalars['Float']['output']>;
  /** Extended Config Data - general/country/default */
  default_country?: Maybe<Scalars['String']['output']>;
  /** The description that provides a summary of your site for search engine listings. It should not be more than 160 characters in length. */
  default_description?: Maybe<Scalars['String']['output']>;
  /** The default display currency code. */
  default_display_currency_code?: Maybe<Scalars['String']['output']>;
  /** A series of keywords that describe your store, each separated by a comma. */
  default_keywords?: Maybe<Scalars['String']['output']>;
  /** The title that appears at the title bar of each page when viewed in a browser. */
  default_title?: Maybe<Scalars['String']['output']>;
  /** Controls the display of the demo store notice at the top of the page. Options: 0 (No) or 1 (Yes). */
  demonotice?: Maybe<Scalars['Int']['output']>;
  /** Configuration data from tax/display/type */
  display_product_prices_in_catalog: Scalars['Int']['output'];
  /** Configuration data from tax/display/shipping */
  display_shipping_prices: Scalars['Int']['output'];
  /** Extended Config Data - general/region/display_all */
  display_state_if_optional?: Maybe<Scalars['Boolean']['output']>;
  /** Configuration data from tax/weee/apply_vat */
  fixed_product_taxes_apply_tax_to_fpt: Scalars['Boolean']['output'];
  /** Configuration data from tax/weee/display_email */
  fixed_product_taxes_display_prices_in_emails: Scalars['Int']['output'];
  /** Configuration data from tax/weee/display_list */
  fixed_product_taxes_display_prices_in_product_lists: Scalars['Int']['output'];
  /** Configuration data from tax/weee/display_sales */
  fixed_product_taxes_display_prices_in_sales_modules: Scalars['Int']['output'];
  /** Configuration data from tax/weee/display */
  fixed_product_taxes_display_prices_on_product_view_page: Scalars['Int']['output'];
  /** Configuration data from tax/weee/enable */
  fixed_product_taxes_enable: Scalars['Boolean']['output'];
  /** Configuration data from tax/weee/include_in_subtotal */
  fixed_product_taxes_include_fpt_in_subtotal: Scalars['Boolean']['output'];
  /** The landing page that is associated with the base URL. */
  front?: Maybe<Scalars['String']['output']>;
  /** The default number of products per page in Grid View. */
  grid_per_page?: Maybe<Scalars['Int']['output']>;
  /** A list of numbers that define how many products can be displayed in Grid View. */
  grid_per_page_values?: Maybe<Scalars['String']['output']>;
  /** checkout/cart/grouped_product_image: which image to use for grouped products. */
  grouped_product_image: Mage_ProductImageThumbnail;
  /** Scripts that must be included in the HTML before the closing `<head>` tag. */
  head_includes?: Maybe<Scalars['String']['output']>;
  /** The small graphic image (favicon) that appears in the address bar and tab of the browser. */
  head_shortcut_icon?: Maybe<Scalars['String']['output']>;
  /** The path to the logo that appears in the header. */
  header_logo_src?: Maybe<Scalars['String']['output']>;
  /**
   * The ID number assigned to the store.
   * @deprecated Use `store_code` instead.
   */
  id?: Maybe<Scalars['Int']['output']>;
  /** Configuration data from checkout/options/enable_agreements */
  is_checkout_agreements_enabled: Scalars['Boolean']['output'];
  /** Indicates whether the store view has been designated as the default within the store group. */
  is_default_store?: Maybe<Scalars['Boolean']['output']>;
  /** Indicates whether the store group has been designated as the default within the website. */
  is_default_store_group?: Maybe<Scalars['Boolean']['output']>;
  /** checkout/options/guest_checkout: whether the guest checkout is enabled or not. */
  is_guest_checkout_enabled?: Maybe<Scalars['Boolean']['output']>;
  /** checkout/options/onepage_checkout_enabled: whether the one page checkout is enabled or not */
  is_one_page_checkout_enabled?: Maybe<Scalars['Boolean']['output']>;
  /** The format of the search results list. */
  list_mode?: Maybe<Scalars['String']['output']>;
  /** The default number of products per page in List View. */
  list_per_page?: Maybe<Scalars['Int']['output']>;
  /** A list of numbers that define how many products can be displayed in List View. */
  list_per_page_values?: Maybe<Scalars['String']['output']>;
  /** The store locale. */
  locale?: Maybe<Scalars['String']['output']>;
  /** The Alt text that is associated with the logo. */
  logo_alt?: Maybe<Scalars['String']['output']>;
  /** The height of the logo image, in pixels. */
  logo_height?: Maybe<Scalars['Int']['output']>;
  /** The width of the logo image, in pixels. */
  logo_width?: Maybe<Scalars['Int']['output']>;
  /** Indicates whether wishlists are enabled (1) or disabled (0). */
  magento_wishlist_general_is_enabled?: Maybe<Scalars['String']['output']>;
  /** checkout/options/max_items_display_count: maximum number of items to display in order summary. */
  max_items_in_order_summary?: Maybe<Scalars['Int']['output']>;
  /** checkout/sidebar/display: whether to display the minicart or not. */
  minicart_display?: Maybe<Scalars['Boolean']['output']>;
  /** checkout/sidebar/count: maximum number of items to show in minicart. */
  minicart_max_items?: Maybe<Scalars['Int']['output']>;
  /** The minimum number of characters required for a valid password. */
  minimum_password_length?: Maybe<Scalars['String']['output']>;
  /** Mollie store config */
  mollie?: Maybe<Mage_MollieStoreConfig>;
  /** Indicates whether newsletters are enabled. */
  newsletter_enabled: Scalars['Boolean']['output'];
  /** The default page that displays when a 404 'Page not Found' error occurs. */
  no_route?: Maybe<Scalars['String']['output']>;
  /** Extended Config Data - general/country/optional_zip_countries */
  optional_zip_countries?: Maybe<Scalars['String']['output']>;
  /** Indicates whether orders can be cancelled by customers or not. */
  order_cancellation_enabled: Scalars['Boolean']['output'];
  /** An array containing available cancellation reasons. */
  order_cancellation_reasons: Array<Maybe<Mage_CancellationReason>>;
  /** Configuration data from tax/sales_display/full_summary */
  orders_invoices_credit_memos_display_full_summary: Scalars['Boolean']['output'];
  /** Configuration data from tax/sales_display/grandtotal */
  orders_invoices_credit_memos_display_grandtotal: Scalars['Boolean']['output'];
  /** Configuration data from tax/sales_display/price */
  orders_invoices_credit_memos_display_price: Scalars['Int']['output'];
  /** Configuration data from tax/sales_display/shipping */
  orders_invoices_credit_memos_display_shipping_amount: Scalars['Int']['output'];
  /** Configuration data from tax/sales_display/subtotal */
  orders_invoices_credit_memos_display_subtotal: Scalars['Int']['output'];
  /** Configuration data from tax/sales_display/zero_tax */
  orders_invoices_credit_memos_display_zero_tax: Scalars['Boolean']['output'];
  /** Payflow Pro vault status. */
  payment_payflowpro_cc_vault_active?: Maybe<Scalars['String']['output']>;
  /** Corresponds to the 'Display Prices On Product View Page' field in the Admin. It indicates how FPT information is displayed on product pages. */
  product_fixed_product_tax_display_setting?: Maybe<Mage_FixedProductTaxDisplaySettings>;
  /** Indicates whether product reviews are enabled. Possible values: 1 (Yes) and 0 (No). */
  product_reviews_enabled?: Maybe<Scalars['String']['output']>;
  /** The suffix applied to product pages, such as `.htm` or `.html`. */
  product_url_suffix?: Maybe<Scalars['String']['output']>;
  /** The number of different character classes (lowercase, uppercase, digits, special characters) required in a password. */
  required_character_classes_number?: Maybe<Scalars['String']['output']>;
  /**
   * The ID of the root category.
   * @deprecated Use `root_category_uid` instead.
   */
  root_category_id?: Maybe<Scalars['Int']['output']>;
  /** The unique ID for a `CategoryInterface` object. */
  root_category_uid?: Maybe<Scalars['ID']['output']>;
  /** Corresponds to the 'Display Prices In Sales Modules' field in the Admin. It indicates how FPT information is displayed on cart, checkout, and order pages. */
  sales_fixed_product_tax_display_setting?: Maybe<Mage_FixedProductTaxDisplaySettings>;
  /** A secure fully-qualified URL that is used to create relative links to the `base_url`. */
  secure_base_link_url?: Maybe<Scalars['String']['output']>;
  /** The secure fully-qualified URL that specifies the location of media files. */
  secure_base_media_url?: Maybe<Scalars['String']['output']>;
  /** The secure fully-qualified URL that specifies the location of static view files. */
  secure_base_static_url?: Maybe<Scalars['String']['output']>;
  /** The store’s fully-qualified secure base URL. */
  secure_base_url?: Maybe<Scalars['String']['output']>;
  /** Email to a Friend configuration. */
  send_friend?: Maybe<Mage_SendFriendConfiguration>;
  /** Extended Config Data - tax/cart_display/full_summary */
  shopping_cart_display_full_summary?: Maybe<Scalars['Boolean']['output']>;
  /** Extended Config Data - tax/cart_display/grandtotal */
  shopping_cart_display_grand_total?: Maybe<Scalars['Boolean']['output']>;
  /** Extended Config Data - tax/cart_display/price */
  shopping_cart_display_price?: Maybe<Scalars['Int']['output']>;
  /** Extended Config Data - tax/cart_display/shipping */
  shopping_cart_display_shipping?: Maybe<Scalars['Int']['output']>;
  /** Extended Config Data - tax/cart_display/subtotal */
  shopping_cart_display_subtotal?: Maybe<Scalars['Int']['output']>;
  /** Extended Config Data - tax/cart_display/gift_wrapping */
  shopping_cart_display_tax_gift_wrapping?: Maybe<Mage_TaxWrappingEnum>;
  /** Extended Config Data - tax/cart_display/zero_tax */
  shopping_cart_display_zero_tax?: Maybe<Scalars['Boolean']['output']>;
  /** Indicates whether a breadcrumb trail appears on all CMS pages in the catalog. 0 (No) or 1 (Yes). */
  show_cms_breadcrumbs?: Maybe<Scalars['Int']['output']>;
  /** The unique ID of the store view. In the Admin, this is called the Store View Code. When making a GraphQL call, assign this value to the `Store` header to provide the scope. */
  store_code?: Maybe<Scalars['ID']['output']>;
  /** The unique ID assigned to the store group. In the Admin, this is called the Store Name. */
  store_group_code?: Maybe<Scalars['ID']['output']>;
  /** The label assigned to the store group. */
  store_group_name?: Maybe<Scalars['String']['output']>;
  /** The label assigned to the store view. */
  store_name?: Maybe<Scalars['String']['output']>;
  /** The store view sort order. */
  store_sort_order?: Maybe<Scalars['Int']['output']>;
  /** The time zone of the store. */
  timezone?: Maybe<Scalars['String']['output']>;
  /** A prefix that appears before the title to create a two- or three-part title. */
  title_prefix?: Maybe<Scalars['String']['output']>;
  /** The character that separates the category name and subcategory in the browser title bar. */
  title_separator?: Maybe<Scalars['String']['output']>;
  /** A suffix that appears after the title to create a two- or three-part title. */
  title_suffix?: Maybe<Scalars['String']['output']>;
  /** Indicates whether the store code should be used in the URL. */
  use_store_in_url?: Maybe<Scalars['Boolean']['output']>;
  /** The unique ID for the website. */
  website_code?: Maybe<Scalars['ID']['output']>;
  /**
   * The ID number assigned to the website store.
   * @deprecated The field should not be used on the storefront.
   */
  website_id?: Maybe<Scalars['Int']['output']>;
  /** The label assigned to the website. */
  website_name?: Maybe<Scalars['String']['output']>;
  /** The unit of weight. */
  weight_unit?: Maybe<Scalars['String']['output']>;
  /** Text that appears in the header of the page and includes the name of the logged in customer. */
  welcome?: Maybe<Scalars['String']['output']>;
  /** Indicates whether only specific countries can use this payment method. */
  zero_subtotal_enable_for_specific_countries?: Maybe<Scalars['Boolean']['output']>;
  /** Indicates whether the Zero Subtotal payment method is enabled. */
  zero_subtotal_enabled?: Maybe<Scalars['Boolean']['output']>;
  /** The status of new orders placed using the Zero Subtotal payment method. */
  zero_subtotal_new_order_status?: Maybe<Scalars['String']['output']>;
  /** When the new order status is 'Processing', this can be set to `authorize_capture` to automatically invoice all items that have a zero balance. */
  zero_subtotal_payment_action?: Maybe<Scalars['String']['output']>;
  /** A comma-separated list of specific countries allowed to use the Zero Subtotal payment method. */
  zero_subtotal_payment_from_specific_countries?: Maybe<Scalars['String']['output']>;
  /** A number indicating the position of the Zero Subtotal payment method in the list of available payment methods during checkout. */
  zero_subtotal_sort_order?: Maybe<Scalars['Int']['output']>;
  /** The title of the Zero Subtotal payment method displayed on the storefront. */
  zero_subtotal_title?: Maybe<Scalars['String']['output']>;
};

/** Indicates where an attribute can be displayed. */
export type Mage_StorefrontProperties = {
  __typename?: 'Mage_StorefrontProperties';
  /** The relative position of the attribute in the layered navigation block. */
  position?: Maybe<Scalars['Int']['output']>;
  /** Indicates whether the attribute is filterable with results, without results, or not at all. */
  use_in_layered_navigation?: Maybe<Mage_UseInLayeredNavigationOptions>;
  /** Indicates whether the attribute is displayed in product listings. */
  use_in_product_listing?: Maybe<Scalars['Boolean']['output']>;
  /** Indicates whether the attribute can be used in layered navigation on search results pages. */
  use_in_search_results_layered_navigation?: Maybe<Scalars['Boolean']['output']>;
  /** Indicates whether the attribute is displayed on product pages. */
  visible_on_catalog_pages?: Maybe<Scalars['Boolean']['output']>;
};

export type Mage_StripePaymentMethod = {
  __typename?: 'Mage_StripePaymentMethod';
  /** Card brand */
  brand?: Maybe<Scalars['String']['output']>;
  /** UNIX timestamp representing the date that the payment method was created. */
  created?: Maybe<Scalars['Int']['output']>;
  /** Indicates whether this saved payment method requires a CVC token to be submitted when placing an order. */
  cvc?: Maybe<Scalars['Boolean']['output']>;
  /** Card expiration month */
  exp_month?: Maybe<Scalars['Int']['output']>;
  /** Card expiration year */
  exp_year?: Maybe<Scalars['Int']['output']>;
  /** A unique identifier for the card number, tax id, bank account etc. */
  fingerprint?: Maybe<Scalars['String']['output']>;
  /** A payment method icon URL that can be used at the front-end. */
  icon?: Maybe<Scalars['String']['output']>;
  /** Payment method ID */
  id: Scalars['ID']['output'];
  /** A formatted payment method label that you can display to the customer. */
  label?: Maybe<Scalars['String']['output']>;
  /** The type of the payment method, i.e. card, klarna, sepa_debit. */
  type?: Maybe<Scalars['String']['output']>;
};

export type Mage_StripePaymentMethodId = {
  /** When this is passed, the action will be performed on all duplicate payment methods which match the fingerprint. */
  fingerprint?: InputMaybe<Scalars['String']['input']>;
  /** The ID of a payment method object */
  payment_method: Scalars['String']['input'];
};

export type Mage_StripePaymentsInput = {
  /** When CVC is enabled for saved cards, pass the CVC token here to perform the verification. */
  cvc_token?: InputMaybe<Scalars['String']['input']>;
  /** Pass the payment method token here (starts with pm_) */
  payment_method?: InputMaybe<Scalars['String']['input']>;
  /** Specify whether the payment method should be saved */
  save_payment_method?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Contains the result of the `subscribeEmailToNewsletter` operation. */
export type Mage_SubscribeEmailToNewsletterOutput = {
  __typename?: 'Mage_SubscribeEmailToNewsletterOutput';
  /** The status of the subscription request. */
  status?: Maybe<Mage_SubscriptionStatusesEnum>;
};

/** Indicates the status of the request. */
export enum Mage_SubscriptionStatusesEnum {
  NotActive = 'NOT_ACTIVE',
  Subscribed = 'SUBSCRIBED',
  Unconfirmed = 'UNCONFIRMED',
  Unsubscribed = 'UNSUBSCRIBED'
}

/** Describes the swatch type and a value. */
export type Mage_SwatchData = {
  __typename?: 'Mage_SwatchData';
  /** The type of swatch filter item: 1 - text; 2 - image. */
  type?: Maybe<Scalars['String']['output']>;
  /** The value for the swatch item. It could be text or an image link. */
  value?: Maybe<Scalars['String']['output']>;
};

export type Mage_SwatchDataInterface = {
  /** The value can be represented as color (HEX code), image link, or text. */
  value?: Maybe<Scalars['String']['output']>;
};

/** Swatch attribute metadata input types. */
export enum Mage_SwatchInputTypeEnum {
  Boolean = 'BOOLEAN',
  Date = 'DATE',
  Datetime = 'DATETIME',
  Dropdown = 'DROPDOWN',
  File = 'FILE',
  Gallery = 'GALLERY',
  Hidden = 'HIDDEN',
  Image = 'IMAGE',
  MediaImage = 'MEDIA_IMAGE',
  Multiline = 'MULTILINE',
  Multiselect = 'MULTISELECT',
  Price = 'PRICE',
  Select = 'SELECT',
  Text = 'TEXT',
  Textarea = 'TEXTAREA',
  Undefined = 'UNDEFINED',
  Visual = 'VISUAL',
  Weight = 'WEIGHT'
}

export type Mage_SwatchLayerFilterItem = Mage_LayerFilterItemInterface & Mage_SwatchLayerFilterItemInterface & {
  __typename?: 'Mage_SwatchLayerFilterItem';
  /**
   * The count of items per filter.
   * @deprecated Use `AggregationOption.count` instead.
   */
  items_count?: Maybe<Scalars['Int']['output']>;
  /**
   * The label for a filter.
   * @deprecated Use `AggregationOption.label` instead.
   */
  label?: Maybe<Scalars['String']['output']>;
  /** Data required to render a swatch filter item. */
  swatch_data?: Maybe<Mage_SwatchData>;
  /**
   * The value of a filter request variable to be used in query.
   * @deprecated Use `AggregationOption.value` instead.
   */
  value_string?: Maybe<Scalars['String']['output']>;
};

export type Mage_SwatchLayerFilterItemInterface = {
  /** Data required to render a swatch filter item. */
  swatch_data?: Maybe<Mage_SwatchData>;
};

/** Synchronizes the payment order details */
export type Mage_SyncPaymentOrderInput = {
  /** The customer cart ID */
  cartId: Scalars['String']['input'];
  /** PayPal order ID */
  id: Scalars['String']['input'];
};

/** Contains tax item details. */
export type Mage_TaxItem = {
  __typename?: 'Mage_TaxItem';
  /** The amount of tax applied to the item. */
  amount: Mage_Money;
  /** The rate used to calculate the tax. */
  rate: Scalars['Float']['output'];
  /** A title that describes the tax. */
  title: Scalars['String']['output'];
};

export enum Mage_TaxWrappingEnum {
  DisplayExcludingTax = 'DISPLAY_EXCLUDING_TAX',
  DisplayIncludingTax = 'DISPLAY_INCLUDING_TAX',
  DisplayTypeBoth = 'DISPLAY_TYPE_BOTH'
}

export type Mage_TextSwatchData = Mage_SwatchDataInterface & {
  __typename?: 'Mage_TextSwatchData';
  /** The value can be represented as color (HEX code), image link, or text. */
  value?: Maybe<Scalars['String']['output']>;
};

/** 3D Secure mode. */
export enum Mage_ThreeDsMode {
  Off = 'OFF',
  ScaAlways = 'SCA_ALWAYS',
  ScaWhenRequired = 'SCA_WHEN_REQUIRED'
}

/** Defines a price based on the quantity purchased. */
export type Mage_TierPrice = {
  __typename?: 'Mage_TierPrice';
  /** The price discount that this tier represents. */
  discount?: Maybe<Mage_ProductDiscount>;
  /** The price of the product at this tier. */
  final_price?: Maybe<Mage_Money>;
  /** The minimum number of items that must be purchased to qualify for this price tier. */
  quantity?: Maybe<Scalars['Float']['output']>;
};

/** Modifies the specified items in the cart. */
export type Mage_UpdateCartItemsInput = {
  /** The unique ID of a `Cart` object. */
  cart_id: Scalars['String']['input'];
  /** An array of items to be updated. */
  cart_items: Array<InputMaybe<Mage_CartItemUpdateInput>>;
};

/** Contains details about the cart after updating items. */
export type Mage_UpdateCartItemsOutput = {
  __typename?: 'Mage_UpdateCartItemsOutput';
  /** The cart after updating products. */
  cart: Mage_Cart;
  /** Contains errors encountered while updating an item to the cart. */
  errors: Array<Maybe<Mage_CartUserInputError>>;
};

/** Contains the customer's wish list and any errors encountered. */
export type Mage_UpdateProductsInWishlistOutput = {
  __typename?: 'Mage_UpdateProductsInWishlistOutput';
  /** An array of errors encountered while updating products in a wish list. */
  user_errors: Array<Maybe<Mage_WishListUserInputError>>;
  /** Contains the wish list with all items that were successfully updated. */
  wishlist: Mage_Wishlist;
};

/** Contains URL rewrite details. */
export type Mage_UrlRewrite = {
  __typename?: 'Mage_UrlRewrite';
  /** An array of request parameters. */
  parameters?: Maybe<Array<Maybe<Mage_HttpQueryParameter>>>;
  /** The request URL. */
  url?: Maybe<Scalars['String']['output']>;
};

/** This enumeration defines the entity type. */
export enum Mage_UrlRewriteEntityTypeEnum {
  Category = 'CATEGORY',
  CmsPage = 'CMS_PAGE',
  Product = 'PRODUCT'
}

/** Defines whether the attribute is filterable in layered navigation. */
export enum Mage_UseInLayeredNavigationOptions {
  FilterableNoResult = 'FILTERABLE_NO_RESULT',
  FilterableWithResults = 'FILTERABLE_WITH_RESULTS',
  No = 'NO'
}

/** Defines a customer attribute validation rule. */
export type Mage_ValidationRule = {
  __typename?: 'Mage_ValidationRule';
  /** Validation rule name applied to a customer attribute. */
  name?: Maybe<Mage_ValidationRuleEnum>;
  /** Validation rule value. */
  value?: Maybe<Scalars['String']['output']>;
};

/** List of validation rule names applied to a customer attribute. */
export enum Mage_ValidationRuleEnum {
  DateRangeMax = 'DATE_RANGE_MAX',
  DateRangeMin = 'DATE_RANGE_MIN',
  FileExtensions = 'FILE_EXTENSIONS',
  InputValidation = 'INPUT_VALIDATION',
  MaxFileSize = 'MAX_FILE_SIZE',
  MaxImageHeight = 'MAX_IMAGE_HEIGHT',
  MaxImageWidth = 'MAX_IMAGE_WIDTH',
  MaxTextLength = 'MAX_TEXT_LENGTH',
  MinTextLength = 'MIN_TEXT_LENGTH'
}

/** Retrieves the vault configuration */
export type Mage_VaultConfigOutput = {
  __typename?: 'Mage_VaultConfigOutput';
  /** Credit card vault method configuration */
  credit_card?: Maybe<Mage_VaultCreditCardConfig>;
};

export type Mage_VaultCreditCardConfig = {
  __typename?: 'Mage_VaultCreditCardConfig';
  /** Is vault enabled */
  is_vault_enabled?: Maybe<Scalars['Boolean']['output']>;
  /** The parameters required to load the Paypal JS SDK */
  sdk_params?: Maybe<Array<Maybe<Mage_SdkParams>>>;
  /** 3DS mode */
  three_ds_mode?: Maybe<Mage_ThreeDsMode>;
};

/** Vault payment inputs */
export type Mage_VaultMethodInput = {
  /** The payment source for the payment method */
  payment_source?: InputMaybe<Scalars['String']['input']>;
  /** The payment services order ID */
  payments_order_id?: InputMaybe<Scalars['String']['input']>;
  /** PayPal order ID */
  paypal_order_id?: InputMaybe<Scalars['String']['input']>;
  /** The public hash of the token. */
  public_hash?: InputMaybe<Scalars['String']['input']>;
};

/** The payment source information */
export type Mage_VaultSetupTokenInput = {
  /** The payment source information */
  payment_source: Mage_PaymentSourceInput;
};

/** Contains required input for payment methods with Vault support. */
export type Mage_VaultTokenInput = {
  /** The public hash of the payment token. */
  public_hash: Scalars['String']['input'];
};

/** An implementation for virtual product cart items. */
export type Mage_VirtualCartItem = Mage_CartItemInterface & {
  __typename?: 'Mage_VirtualCartItem';
  /** An array containing customizable options the shopper selected. */
  customizable_options: Array<Maybe<Mage_SelectedCustomizableOption>>;
  /** Errors assigned to this quote item */
  errors?: Maybe<Array<Maybe<Mage_CartItemError>>>;
  /** @deprecated Use `uid` instead. */
  id: Scalars['String']['output'];
  /** True if requested quantity is less than available stock, false otherwise. */
  is_available: Scalars['Boolean']['output'];
  /** Message to display when the product is not available with this selected option. */
  not_available_message?: Maybe<Scalars['String']['output']>;
  /** Contains details about the price of the item, including taxes and discounts. */
  prices?: Maybe<Mage_CartItemPrices>;
  /** Details about an item in the cart. */
  product: Mage_ProductInterface;
  product_type: Scalars['String']['output'];
  /** The quantity of this item in the cart. */
  quantity: Scalars['Float']['output'];
  /** The unique ID for a `CartItemInterface` object. */
  uid: Scalars['ID']['output'];
};

/** Defines a virtual product, which is a non-tangible product that does not require shipping and is not kept in inventory. */
export type Mage_VirtualProduct = Mage_CustomizableProductInterface & Mage_ProductInterface & Mage_RoutableInterface & {
  __typename?: 'Mage_VirtualProduct';
  /** @deprecated Use the `custom_attributes` field instead. */
  activity?: Maybe<Scalars['String']['output']>;
  /**
   * The attribute set assigned to the product.
   * @deprecated The field should not be used on the storefront.
   */
  attribute_set_id?: Maybe<Scalars['Int']['output']>;
  /** The relative canonical URL. This value is returned only if the system setting 'Use Canonical Link Meta Tag For Products' is enabled. */
  canonical_url?: Maybe<Scalars['String']['output']>;
  /** The categories assigned to a product. */
  categories?: Maybe<Array<Maybe<Mage_CategoryInterface>>>;
  /** @deprecated Use the `custom_attributes` field instead. */
  category_gear?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  climate?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  collar?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  color?: Maybe<Scalars['Int']['output']>;
  /** The product's country of origin. */
  country_of_manufacture?: Maybe<Scalars['String']['output']>;
  /**
   * Timestamp indicating when the product was created.
   * @deprecated The field should not be used on the storefront.
   */
  created_at?: Maybe<Scalars['String']['output']>;
  /** Crosssell Products */
  crosssell_products?: Maybe<Array<Maybe<Mage_ProductInterface>>>;
  /** Product custom attributes. */
  custom_attributesV2?: Maybe<Mage_ProductCustomAttributes>;
  /** Detailed information about the product. The value can include simple HTML tags. */
  description?: Maybe<Mage_ComplexTextValue>;
  /** @deprecated Use the `custom_attributes` field instead. */
  eco_collection?: Maybe<Scalars['Int']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  erin_recommends?: Maybe<Scalars['Int']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  features_bags?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  format?: Maybe<Scalars['Int']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  gender?: Maybe<Scalars['String']['output']>;
  /** Returns a value indicating gift message availability for the product. */
  gift_message_available: Scalars['Boolean']['output'];
  /**
   * The ID number assigned to the product.
   * @deprecated Use the `uid` field instead.
   */
  id?: Maybe<Scalars['Int']['output']>;
  /** The relative path to the main image on the product page. */
  image?: Maybe<Mage_ProductImage>;
  /** @deprecated Use the `custom_attributes` field instead. */
  is_seller_product?: Maybe<Scalars['Int']['output']>;
  /**
   * A number representing the product's manufacturer.
   * @deprecated Use the `custom_attributes` field instead.
   */
  manufacturer?: Maybe<Scalars['Int']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  material?: Maybe<Scalars['String']['output']>;
  /** Maximum Qty Allowed in Shopping Cart */
  max_sale_qty?: Maybe<Scalars['Float']['output']>;
  /** An array of media gallery objects. */
  media_gallery?: Maybe<Array<Maybe<Mage_MediaGalleryInterface>>>;
  /**
   * An array of MediaGalleryEntry objects.
   * @deprecated Use `media_gallery` instead.
   */
  media_gallery_entries?: Maybe<Array<Maybe<Mage_MediaGalleryEntry>>>;
  /** A brief overview of the product for search results listings, maximum 255 characters. */
  meta_description?: Maybe<Scalars['String']['output']>;
  /** A comma-separated list of keywords that are visible only to search engines. */
  meta_keyword?: Maybe<Scalars['String']['output']>;
  /** A string that is displayed in the title bar and tab of the browser and in search results lists. */
  meta_title?: Maybe<Scalars['String']['output']>;
  /** Minimum Qty Allowed in Shopping Cart */
  min_sale_qty?: Maybe<Scalars['Float']['output']>;
  /** The product name. Customers use this name to identify the product. */
  name?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  new?: Maybe<Scalars['Int']['output']>;
  /** The beginning date for new product listings, and determines if the product is featured as a new product. */
  new_from_date?: Maybe<Scalars['String']['output']>;
  /** The end date for new product listings. */
  new_to_date?: Maybe<Scalars['String']['output']>;
  /** Product stock only x left count */
  only_x_left_in_stock?: Maybe<Scalars['Float']['output']>;
  /** An array of options for a customizable product. */
  options?: Maybe<Array<Maybe<Mage_CustomizableOptionInterface>>>;
  /** If the product has multiple options, determines where they appear on the product page. */
  options_container?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  pattern?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  performance_fabric?: Maybe<Scalars['Int']['output']>;
  /**
   * Indicates the price of an item.
   * @deprecated Use `price_range` for product price information.
   */
  price?: Maybe<Mage_ProductPrices>;
  /** The range of prices for the product */
  price_range: Mage_PriceRange;
  /** An array of `TierPrice` objects. */
  price_tiers?: Maybe<Array<Maybe<Mage_TierPrice>>>;
  /** An array of `ProductLinks` objects. */
  product_links?: Maybe<Array<Maybe<Mage_ProductLinksInterface>>>;
  /** Amount of available stock */
  quantity?: Maybe<Scalars['Float']['output']>;
  /** The average of all the ratings given to the product. */
  rating_summary: Scalars['Float']['output'];
  /** Contains 0 when there is no redirect error. A value of 301 indicates the URL of the requested resource has been changed permanently, while a value of 302 indicates a temporary redirect. */
  redirect_code: Scalars['Int']['output'];
  /** An array of products to be displayed in a Related Products block. */
  related_products?: Maybe<Array<Maybe<Mage_ProductInterface>>>;
  /** The internal relative URL. If the specified URL is a redirect, the query returns the redirected URL, not the original. */
  relative_url?: Maybe<Scalars['String']['output']>;
  /** The total count of all the reviews given to the product. */
  review_count: Scalars['Int']['output'];
  /** The list of products reviews. */
  reviews: Mage_ProductReviews;
  /** @deprecated Use the `custom_attributes` field instead. */
  sale?: Maybe<Scalars['Int']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  seller_id?: Maybe<Scalars['Int']['output']>;
  /** A short description of the product. Its use depends on the theme. */
  short_description?: Maybe<Mage_ComplexTextValue>;
  /** @deprecated Use the `custom_attributes` field instead. */
  size?: Maybe<Scalars['Int']['output']>;
  /** A number or code assigned to a product to identify the product, options, price, and manufacturer. */
  sku?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  sleeve?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  sm_featured?: Maybe<Scalars['Int']['output']>;
  /** The relative path to the small image, which is used on catalog pages. */
  small_image?: Maybe<Mage_ProductImage>;
  /**
   * The beginning date that a product has a special price.
   * @deprecated The field should not be used on the storefront.
   */
  special_from_date?: Maybe<Scalars['String']['output']>;
  /** The discounted price of the product. */
  special_price?: Maybe<Scalars['Float']['output']>;
  /** The end date for a product with a special price. */
  special_to_date?: Maybe<Scalars['String']['output']>;
  /** The status assigned to the product, 0 for disabled, 1 for enabled. */
  status?: Maybe<Scalars['Int']['output']>;
  /** Stock status of the product */
  stock_status?: Maybe<Mage_ProductStockStatus>;
  /** @deprecated Use the `custom_attributes` field instead. */
  strap_bags?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  style_bags?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  style_bottom?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use the `custom_attributes` field instead. */
  style_general?: Maybe<Scalars['String']['output']>;
  /** The file name of a swatch image. */
  swatch_image?: Maybe<Scalars['String']['output']>;
  /** The relative path to the product's thumbnail image. */
  thumbnail?: Maybe<Mage_ProductImage>;
  /**
   * The price when tier pricing is in effect and the items purchased threshold has been reached.
   * @deprecated Use `price_tiers` for product tier price information.
   */
  tier_price?: Maybe<Scalars['Float']['output']>;
  /**
   * An array of ProductTierPrices objects.
   * @deprecated Use `price_tiers` for product tier price information.
   */
  tier_prices?: Maybe<Array<Maybe<Mage_ProductTierPrices>>>;
  /** One of PRODUCT, CATEGORY, or CMS_PAGE. */
  type?: Maybe<Mage_UrlRewriteEntityTypeEnum>;
  /**
   * One of simple, virtual, bundle, downloadable, grouped, or configurable.
   * @deprecated Use `__typename` instead.
   */
  type_id?: Maybe<Scalars['String']['output']>;
  /** The unique ID for a `ProductInterface` object. */
  uid: Scalars['ID']['output'];
  /**
   * Timestamp indicating when the product was updated.
   * @deprecated The field should not be used on the storefront.
   */
  updated_at?: Maybe<Scalars['String']['output']>;
  /** Upsell Products */
  upsell_products?: Maybe<Array<Maybe<Mage_ProductInterface>>>;
  /** The part of the URL that identifies the product */
  url_key?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use product's `canonical_url` or url rewrites instead */
  url_path?: Maybe<Scalars['String']['output']>;
  /** URL rewrites list */
  url_rewrites?: Maybe<Array<Maybe<Mage_UrlRewrite>>>;
  /** The part of the product URL that is appended after the url key */
  url_suffix?: Maybe<Scalars['String']['output']>;
  /** The visibility assigned to the product. */
  visibility?: Maybe<Scalars['Int']['output']>;
  /**
   * An array of websites in which the product is available.
   * @deprecated The field should not be used on the storefront.
   */
  websites?: Maybe<Array<Maybe<Mage_Website>>>;
};


/** Defines a virtual product, which is a non-tangible product that does not require shipping and is not kept in inventory. */
export type Mage_VirtualProductCustom_AttributesV2Args = {
  filters?: InputMaybe<Mage_AttributeFilterInput>;
};


/** Defines a virtual product, which is a non-tangible product that does not require shipping and is not kept in inventory. */
export type Mage_VirtualProductReviewsArgs = {
  currentPage?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
};

/** Defines a single product to add to the cart. */
export type Mage_VirtualProductCartItemInput = {
  /** An array that defines customizable options for the product. */
  customizable_options?: InputMaybe<Array<InputMaybe<Mage_CustomizableOptionInput>>>;
  /** An object containing the `sku`, `quantity`, and other relevant information about the product. */
  data: Mage_CartItemInput;
};

/** Contains a virtual product wish list item. */
export type Mage_VirtualWishlistItem = Mage_WishlistItemInterface & {
  __typename?: 'Mage_VirtualWishlistItem';
  /** The date and time the item was added to the wish list. */
  added_at: Scalars['String']['output'];
  /** Custom options selected for the wish list item. */
  customizable_options: Array<Maybe<Mage_SelectedCustomizableOption>>;
  /** The description of the item. */
  description?: Maybe<Scalars['String']['output']>;
  /** The unique ID for a `WishlistItemInterface` object. */
  id: Scalars['ID']['output'];
  /** Product details of the wish list item. */
  product?: Maybe<Mage_ProductInterface>;
  /** The quantity of this wish list item. */
  quantity: Scalars['Float']['output'];
};

/** Deprecated. It should not be used on the storefront. Contains information about a website. */
export type Mage_Website = {
  __typename?: 'Mage_Website';
  /**
   * A code assigned to the website to identify it.
   * @deprecated The field should not be used on the storefront.
   */
  code?: Maybe<Scalars['String']['output']>;
  /**
   * The default group ID of the website.
   * @deprecated The field should not be used on the storefront.
   */
  default_group_id?: Maybe<Scalars['String']['output']>;
  /**
   * The ID number assigned to the website.
   * @deprecated The field should not be used on the storefront.
   */
  id?: Maybe<Scalars['Int']['output']>;
  /**
   * Indicates whether this is the default website.
   * @deprecated The field should not be used on the storefront.
   */
  is_default?: Maybe<Scalars['Boolean']['output']>;
  /**
   * The website name. Websites use this name to identify it easier.
   * @deprecated The field should not be used on the storefront.
   */
  name?: Maybe<Scalars['String']['output']>;
  /**
   * The attribute to use for sorting websites.
   * @deprecated The field should not be used on the storefront.
   */
  sort_order?: Maybe<Scalars['Int']['output']>;
};

/** An error encountered while performing operations with WishList. */
export type Mage_WishListUserInputError = {
  __typename?: 'Mage_WishListUserInputError';
  /** A wish list-specific error code. */
  code: Mage_WishListUserInputErrorType;
  /** A localized error message. */
  message: Scalars['String']['output'];
};

/** A list of possible error types. */
export enum Mage_WishListUserInputErrorType {
  ProductNotFound = 'PRODUCT_NOT_FOUND',
  Undefined = 'UNDEFINED'
}

/** Contains a customer wish list. */
export type Mage_Wishlist = {
  __typename?: 'Mage_Wishlist';
  /** The unique ID for a `Wishlist` object. */
  id?: Maybe<Scalars['ID']['output']>;
  /** @deprecated Use the `items_v2` field instead. */
  items?: Maybe<Array<Maybe<Mage_WishlistItem>>>;
  /** The number of items in the wish list. */
  items_count?: Maybe<Scalars['Int']['output']>;
  /** An array of items in the customer's wish list. */
  items_v2?: Maybe<Mage_WishlistItems>;
  /** An encrypted code that Magento uses to link to the wish list. */
  sharing_code?: Maybe<Scalars['String']['output']>;
  /** The time of the last modification to the wish list. */
  updated_at?: Maybe<Scalars['String']['output']>;
};


/** Contains a customer wish list. */
export type Mage_WishlistItems_V2Args = {
  currentPage?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
};

/** Contains details about errors encountered when a customer added wish list items to the cart. */
export type Mage_WishlistCartUserInputError = {
  __typename?: 'Mage_WishlistCartUserInputError';
  /** An error code that describes the error encountered. */
  code: Mage_WishlistCartUserInputErrorType;
  /** A localized error message. */
  message: Scalars['String']['output'];
  /** The unique ID of the `Wishlist` object containing an error. */
  wishlistId: Scalars['ID']['output'];
  /** The unique ID of the wish list item containing an error. */
  wishlistItemId: Scalars['ID']['output'];
};

/** A list of possible error types. */
export enum Mage_WishlistCartUserInputErrorType {
  InsufficientStock = 'INSUFFICIENT_STOCK',
  NotSalable = 'NOT_SALABLE',
  ProductNotFound = 'PRODUCT_NOT_FOUND',
  Undefined = 'UNDEFINED'
}

/** Contains details about a wish list item. */
export type Mage_WishlistItem = {
  __typename?: 'Mage_WishlistItem';
  /** The time when the customer added the item to the wish list. */
  added_at?: Maybe<Scalars['String']['output']>;
  /** The customer's comment about this item. */
  description?: Maybe<Scalars['String']['output']>;
  /** The unique ID for a `WishlistItem` object. */
  id?: Maybe<Scalars['Int']['output']>;
  /** Details about the wish list item. */
  product?: Maybe<Mage_ProductInterface>;
  /** The quantity of this wish list item */
  qty?: Maybe<Scalars['Float']['output']>;
};

/** Defines the items to add to a wish list. */
export type Mage_WishlistItemInput = {
  /** An array of options that the customer entered. */
  entered_options?: InputMaybe<Array<InputMaybe<Mage_EnteredOptionInput>>>;
  /** For complex product types, the SKU of the parent product. */
  parent_sku?: InputMaybe<Scalars['String']['input']>;
  /** The amount or number of items to add. */
  quantity: Scalars['Float']['input'];
  /** An array of strings corresponding to options the customer selected. */
  selected_options?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  /** The SKU of the product to add. For complex product types, specify the child product SKU. */
  sku: Scalars['String']['input'];
};

/** The interface for wish list items. */
export type Mage_WishlistItemInterface = {
  /** The date and time the item was added to the wish list. */
  added_at: Scalars['String']['output'];
  /** Custom options selected for the wish list item. */
  customizable_options: Array<Maybe<Mage_SelectedCustomizableOption>>;
  /** The description of the item. */
  description?: Maybe<Scalars['String']['output']>;
  /** The unique ID for a `WishlistItemInterface` object. */
  id: Scalars['ID']['output'];
  /** Product details of the wish list item. */
  product?: Maybe<Mage_ProductInterface>;
  /** The quantity of this wish list item. */
  quantity: Scalars['Float']['output'];
};

/** Defines updates to items in a wish list. */
export type Mage_WishlistItemUpdateInput = {
  /** Customer-entered comments about the item. */
  description?: InputMaybe<Scalars['String']['input']>;
  /** An array of options that the customer entered. */
  entered_options?: InputMaybe<Array<InputMaybe<Mage_EnteredOptionInput>>>;
  /** The new amount or number of this item. */
  quantity?: InputMaybe<Scalars['Float']['input']>;
  /** An array of strings corresponding to options the customer selected. */
  selected_options?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  /** The unique ID for a `WishlistItemInterface` object. */
  wishlist_item_id: Scalars['ID']['input'];
};

/** Contains an array of items in a wish list. */
export type Mage_WishlistItems = {
  __typename?: 'Mage_WishlistItems';
  /** A list of items in the wish list. */
  items: Array<Maybe<Mage_WishlistItemInterface>>;
  /** Contains pagination metadata. */
  page_info?: Maybe<Mage_SearchResultPageInfo>;
};

/** Deprecated: Use the `Wishlist` type instead. */
export type Mage_WishlistOutput = {
  __typename?: 'Mage_WishlistOutput';
  /**
   * An array of items in the customer's wish list
   * @deprecated Use the `Wishlist.items` field instead.
   */
  items?: Maybe<Array<Maybe<Mage_WishlistItem>>>;
  /**
   * The number of items in the wish list.
   * @deprecated Use the `Wishlist.items_count` field instead.
   */
  items_count?: Maybe<Scalars['Int']['output']>;
  /**
   * When multiple wish lists are enabled, the name the customer assigns to the wishlist.
   * @deprecated This field is related to Commerce functionality and is always `null` in Open Source.
   */
  name?: Maybe<Scalars['String']['output']>;
  /**
   * An encrypted code that links to the wish list.
   * @deprecated Use the `Wishlist.sharing_code` field instead.
   */
  sharing_code?: Maybe<Scalars['String']['output']>;
  /**
   * The time of the last modification to the wish list.
   * @deprecated Use the `Wishlist.updated_at` field instead.
   */
  updated_at?: Maybe<Scalars['String']['output']>;
};

/** Assigns a specific `cart_id` to the empty cart. */
export type Mage_CreateEmptyCartInput = {
  /** The ID to assign to the cart. */
  cart_id?: InputMaybe<Scalars['String']['input']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Add one or more bundle products to the specified cart. We recommend using `addProductsToCart` instead. */
  Mage_addBundleProductsToCart?: Maybe<Mage_AddBundleProductsToCartOutput>;
  /** Add one or more configurable products to the specified cart. We recommend using `addProductsToCart` instead. */
  Mage_addConfigurableProductsToCart?: Maybe<Mage_AddConfigurableProductsToCartOutput>;
  /** Add one or more downloadable products to the specified cart. We recommend using `addProductsToCart` instead. */
  Mage_addDownloadableProductsToCart?: Maybe<Mage_AddDownloadableProductsToCartOutput>;
  /** Add any type of product to the cart. */
  Mage_addProductsToCart?: Maybe<Mage_AddProductsToCartOutput>;
  /** Add products to the specified compare list. */
  Mage_addProductsToCompareList?: Maybe<Mage_CompareList>;
  /** Creates a new cart and add any type of product to it */
  Mage_addProductsToNewCart?: Maybe<Mage_AddProductsToNewCartOutput>;
  /** Add one or more products to the specified wish list. This mutation supports all product types. */
  Mage_addProductsToWishlist?: Maybe<Mage_AddProductsToWishlistOutput>;
  /** Add one or more simple products to the specified cart. We recommend using `addProductsToCart` instead. */
  Mage_addSimpleProductsToCart?: Maybe<Mage_AddSimpleProductsToCartOutput>;
  /** Saves a payment method on the logged in customer */
  Mage_addStripePaymentMethod?: Maybe<Mage_StripePaymentMethod>;
  /** Add one or more virtual products to the specified cart. We recommend using `addProductsToCart` instead. */
  Mage_addVirtualProductsToCart?: Maybe<Mage_AddVirtualProductsToCartOutput>;
  /** Add items in the specified wishlist to the customer's cart. */
  Mage_addWishlistItemsToCart?: Maybe<Mage_AddWishlistItemsToCartOutput>;
  /** Apply a pre-defined coupon code to the specified cart. */
  Mage_applyCouponToCart?: Maybe<Mage_ApplyCouponToCartOutput>;
  /** Assign the specified compare list to the logged in customer. */
  Mage_assignCompareListToCustomer?: Maybe<Mage_AssignCompareListToCustomerOutput>;
  /** Assign a logged-in customer to the specified guest shopping cart. */
  Mage_assignCustomerToGuestCart: Mage_Cart;
  /** Cancel the specified customer order. */
  Mage_cancelOrder?: Maybe<Mage_CancelOrderOutput>;
  /** Change the password for the logged-in customer. */
  Mage_changeCustomerPassword?: Maybe<Mage_Customer>;
  /** Synchronizes order details and place the order */
  Mage_completeOrder?: Maybe<Mage_PlaceOrderOutput>;
  /** Cancel the specified guest customer order. */
  Mage_confirmCancelOrder?: Maybe<Mage_CancelOrderOutput>;
  /** Confirms the email address for a customer. */
  Mage_confirmEmail?: Maybe<Mage_CustomerOutput>;
  /** Send a 'Contact Us' email to the merchant. */
  Mage_contactUs?: Maybe<Mage_ContactUsOutput>;
  /** Creates Client Token for Braintree Javascript SDK initialization. */
  Mage_createBraintreeClientToken: Scalars['String']['output'];
  /** Creates Client Token for Braintree PayPal Javascript SDK initialization. */
  Mage_createBraintreePayPalClientToken: Scalars['String']['output'];
  /** Creates Client Token for Braintree PayPal Vault Javascript SDK initialization. */
  Mage_createBraintreePayPalVaultClientToken: Scalars['String']['output'];
  /** Create a new compare list. The compare list is saved for logged in customers. */
  Mage_createCompareList?: Maybe<Mage_CompareList>;
  /** @deprecated Use `createCustomerV2` instead. */
  Mage_createCustomer?: Maybe<Mage_CustomerOutput>;
  /** Create a billing or shipping address for a customer or guest. */
  Mage_createCustomerAddress?: Maybe<Mage_CustomerAddress>;
  /** Create a customer account. */
  Mage_createCustomerV2?: Maybe<Mage_CustomerOutput>;
  /**
   * Create an empty shopping cart for a guest or logged in user
   * @deprecated Use `Mutation.createGuestCart` or `Query.customerCart` for logged in customer
   */
  Mage_createEmptyCart?: Maybe<Scalars['String']['output']>;
  /** Create a new shopping cart */
  Mage_createGuestCart?: Maybe<Mage_CreateGuestCartOutput>;
  /** @deprecated Using the Order.mollie_redirect_url attribuut */
  Mage_createMollieTransaction?: Maybe<Mage_MollieTransactionOutput>;
  /** Initiate a transaction and receive a token. Use this mutation for Payflow Pro and Payments Pro payment methods */
  Mage_createPayflowProToken?: Maybe<Mage_CreatePayflowProTokenOutput>;
  /** Creates a payment order for further payment processing */
  Mage_createPaymentOrder?: Maybe<Mage_CreatePaymentOrderOutput>;
  /** Initiate an Express Checkout transaction and receive a token. Use this mutation for Express Checkout and Payments Standard payment methods. */
  Mage_createPaypalExpressToken?: Maybe<Mage_PaypalExpressTokenOutput>;
  /** Create a product review for the specified product. */
  Mage_createProductReview: Mage_CreateProductReviewOutput;
  /** Creates a vault payment token */
  Mage_createVaultCardPaymentToken?: Maybe<Mage_CreateVaultCardPaymentTokenOutput>;
  /** Creates a vault card setup token */
  Mage_createVaultCardSetupToken?: Maybe<Mage_CreateVaultCardSetupTokenOutput>;
  /** Delete the specified compare list. */
  Mage_deleteCompareList?: Maybe<Mage_DeleteCompareListOutput>;
  /** Delete customer account */
  Mage_deleteCustomer?: Maybe<Scalars['Boolean']['output']>;
  /** Delete the billing or shipping address of a customer. */
  Mage_deleteCustomerAddress?: Maybe<Scalars['Boolean']['output']>;
  /** Delete a customer's payment token. */
  Mage_deletePaymentToken?: Maybe<Mage_DeletePaymentTokenOutput>;
  /** Deletes a saved payment method from a logged in customer */
  Mage_deleteStripePaymentMethod?: Maybe<Scalars['String']['output']>;
  /** Estimate shipping method(s) for cart based on address */
  Mage_estimateShippingMethods?: Maybe<Array<Maybe<Mage_AvailableShippingMethod>>>;
  /** Estimate totals for cart based on the address */
  Mage_estimateTotals: Mage_EstimateTotalsOutput;
  /** Generate a token for specified customer. */
  Mage_generateCustomerToken?: Maybe<Mage_CustomerToken>;
  /** Request a customer token so that an administrator can perform remote shopping assistance. */
  Mage_generateCustomerTokenAsAdmin?: Maybe<Mage_GenerateCustomerTokenAsAdminOutput>;
  /** Handle a payment response and save the payment in Quote. Use this mutation for Payflow Pro and Payments Pro payment methods. */
  Mage_handlePayflowProResponse?: Maybe<Mage_PayflowProResponseOutput>;
  /** List all saved payment methods of a logged in customer */
  Mage_listStripePaymentMethods?: Maybe<Array<Maybe<Mage_StripePaymentMethod>>>;
  /** Add gift card to quote. */
  Mage_lofAddGiftCardToQuote?: Maybe<Mage_Res>;
  /** Apply customer balance to quote. */
  Mage_lofApplyCustomerBalanceToCart?: Maybe<Mage_Res>;
  /** Redeem gift card to customer. */
  Mage_lofGiftCardRedeem?: Maybe<Mage_Res>;
  /** Transfer the contents of a guest cart into the cart of a logged-in customer. */
  Mage_mergeCarts: Mage_Cart;
  Mage_mollieApplePayValidation?: Maybe<Mage_MollieApplePayValidationOutput>;
  Mage_molliePaymentLinkRedirect?: Maybe<Mage_MolliePaymentLinkRedirectOutput>;
  Mage_mollieProcessTransaction?: Maybe<Mage_MollieProcessTransactionOutput>;
  Mage_mollieRestoreCart?: Maybe<Mage_MollieResetCartOutput>;
  /** Convert the quote into an order. */
  Mage_placeOrder?: Maybe<Mage_PlaceOrderOutput>;
  /** Remove a previously-applied coupon from the cart. The cart must contain at least one item in order to remove the coupon. */
  Mage_removeCouponFromCart?: Maybe<Mage_RemoveCouponFromCartOutput>;
  /** Delete the entire quantity of a specified item from the cart. If you remove all items from the cart, the cart continues to exist. */
  Mage_removeItemFromCart?: Maybe<Mage_RemoveItemFromCartOutput>;
  /** Remove products from the specified compare list. */
  Mage_removeProductsFromCompareList?: Maybe<Mage_CompareList>;
  /** Remove one or more products from the specified wish list. */
  Mage_removeProductsFromWishlist?: Maybe<Mage_RemoveProductsFromWishlistOutput>;
  /** Add all products from a customer's previous order to the cart. */
  Mage_reorderItems?: Maybe<Mage_ReorderItemsOutput>;
  /** Request to cancel specified guest order. */
  Mage_requestGuestOrderCancel?: Maybe<Mage_CancelOrderOutput>;
  /** Request an email with a reset password token for the registered customer identified by the specified email. */
  Mage_requestPasswordResetEmail?: Maybe<Scalars['Boolean']['output']>;
  /** Resends the confirmation email to a customer. */
  Mage_resendConfirmationEmail?: Maybe<Scalars['Boolean']['output']>;
  /** Reset a customer's password using the reset password token that the customer received in an email after requesting it using `requestPasswordResetEmail`. */
  Mage_resetPassword?: Maybe<Scalars['Boolean']['output']>;
  /** Revoke the customer token. */
  Mage_revokeCustomerToken?: Maybe<Mage_RevokeCustomerTokenOutput>;
  /** Send a message on behalf of a customer to the specified email addresses. */
  Mage_sendEmailToFriend?: Maybe<Mage_SendEmailToFriendOutput>;
  /** Set the billing address on a specific cart. */
  Mage_setBillingAddressOnCart?: Maybe<Mage_SetBillingAddressOnCartOutput>;
  /** Sets the cart as inactive */
  Mage_setCartAsInactive?: Maybe<Mage_SetCartAsInactiveOutput>;
  /** Assign the email address of a guest to the cart. */
  Mage_setGuestEmailOnCart?: Maybe<Mage_SetGuestEmailOnCartOutput>;
  /**
   * Set the cart payment method and convert the cart into an order.
   * @deprecated Should use setPaymentMethodOnCart and placeOrder mutations in single request.
   */
  Mage_setPaymentMethodAndPlaceOrder?: Maybe<Mage_PlaceOrderOutput>;
  /** Apply a payment method to the cart. */
  Mage_setPaymentMethodOnCart?: Maybe<Mage_SetPaymentMethodOnCartOutput>;
  /** Set one or more shipping addresses on a specific cart. */
  Mage_setShippingAddressesOnCart?: Maybe<Mage_SetShippingAddressesOnCartOutput>;
  /** Set one or more delivery methods on a cart. */
  Mage_setShippingMethodsOnCart?: Maybe<Mage_SetShippingMethodsOnCartOutput>;
  /** Subscribe the specified email to the store's newsletter. */
  Mage_subscribeEmailToNewsletter?: Maybe<Mage_SubscribeEmailToNewsletterOutput>;
  /** Synchronizes the payment order details for further payment processing */
  Mage_syncPaymentOrder?: Maybe<Scalars['Boolean']['output']>;
  /** Modify items in the cart. */
  Mage_updateCartItems?: Maybe<Mage_UpdateCartItemsOutput>;
  /** @deprecated Use `updateCustomerV2` instead. */
  Mage_updateCustomer?: Maybe<Mage_CustomerOutput>;
  /** Update the billing or shipping address of a customer or guest. */
  Mage_updateCustomerAddress?: Maybe<Mage_CustomerAddress>;
  /** Change the email address for the logged-in customer. */
  Mage_updateCustomerEmail?: Maybe<Mage_CustomerOutput>;
  /** Update the customer's personal information. */
  Mage_updateCustomerV2?: Maybe<Mage_CustomerOutput>;
  /** Update one or more products in the specified wish list. */
  Mage_updateProductsInWishlist?: Maybe<Mage_UpdateProductsInWishlistOutput>;
};


export type MutationMage_AddBundleProductsToCartArgs = {
  input?: InputMaybe<Mage_AddBundleProductsToCartInput>;
};


export type MutationMage_AddConfigurableProductsToCartArgs = {
  input?: InputMaybe<Mage_AddConfigurableProductsToCartInput>;
};


export type MutationMage_AddDownloadableProductsToCartArgs = {
  input?: InputMaybe<Mage_AddDownloadableProductsToCartInput>;
};


export type MutationMage_AddProductsToCartArgs = {
  cartId: Scalars['String']['input'];
  cartItems: Array<Mage_CartItemInput>;
};


export type MutationMage_AddProductsToCompareListArgs = {
  input?: InputMaybe<Mage_AddProductsToCompareListInput>;
};


export type MutationMage_AddProductsToNewCartArgs = {
  cartItems: Array<Mage_CartItemInput>;
};


export type MutationMage_AddProductsToWishlistArgs = {
  wishlistId: Scalars['ID']['input'];
  wishlistItems: Array<Mage_WishlistItemInput>;
};


export type MutationMage_AddSimpleProductsToCartArgs = {
  input?: InputMaybe<Mage_AddSimpleProductsToCartInput>;
};


export type MutationMage_AddStripePaymentMethodArgs = {
  input: Mage_StripePaymentMethodId;
};


export type MutationMage_AddVirtualProductsToCartArgs = {
  input?: InputMaybe<Mage_AddVirtualProductsToCartInput>;
};


export type MutationMage_AddWishlistItemsToCartArgs = {
  wishlistId: Scalars['ID']['input'];
  wishlistItemIds?: InputMaybe<Array<Scalars['ID']['input']>>;
};


export type MutationMage_ApplyCouponToCartArgs = {
  input?: InputMaybe<Mage_ApplyCouponToCartInput>;
};


export type MutationMage_AssignCompareListToCustomerArgs = {
  uid: Scalars['ID']['input'];
};


export type MutationMage_AssignCustomerToGuestCartArgs = {
  cart_id: Scalars['String']['input'];
};


export type MutationMage_CancelOrderArgs = {
  input: Mage_CancelOrderInput;
};


export type MutationMage_ChangeCustomerPasswordArgs = {
  currentPassword: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
};


export type MutationMage_CompleteOrderArgs = {
  input?: InputMaybe<Mage_CompleteOrderInput>;
};


export type MutationMage_ConfirmCancelOrderArgs = {
  input: Mage_ConfirmCancelOrderInput;
};


export type MutationMage_ConfirmEmailArgs = {
  input: Mage_ConfirmEmailInput;
};


export type MutationMage_ContactUsArgs = {
  input: Mage_ContactUsInput;
};


export type MutationMage_CreateBraintreePayPalVaultClientTokenArgs = {
  input?: InputMaybe<Mage_BraintreeVaultInput>;
};


export type MutationMage_CreateCompareListArgs = {
  input?: InputMaybe<Mage_CreateCompareListInput>;
};


export type MutationMage_CreateCustomerArgs = {
  input: Mage_CustomerInput;
};


export type MutationMage_CreateCustomerAddressArgs = {
  input: Mage_CustomerAddressInput;
};


export type MutationMage_CreateCustomerV2Args = {
  input: Mage_CustomerCreateInput;
};


export type MutationMage_CreateEmptyCartArgs = {
  input?: InputMaybe<Mage_CreateEmptyCartInput>;
};


export type MutationMage_CreateGuestCartArgs = {
  input?: InputMaybe<Mage_CreateGuestCartInput>;
};


export type MutationMage_CreateMollieTransactionArgs = {
  input?: InputMaybe<Mage_MollieTransactionInput>;
};


export type MutationMage_CreatePayflowProTokenArgs = {
  input: Mage_PayflowProTokenInput;
};


export type MutationMage_CreatePaymentOrderArgs = {
  input: Mage_CreatePaymentOrderInput;
};


export type MutationMage_CreatePaypalExpressTokenArgs = {
  input: Mage_PaypalExpressTokenInput;
};


export type MutationMage_CreateProductReviewArgs = {
  input: Mage_CreateProductReviewInput;
};


export type MutationMage_CreateVaultCardPaymentTokenArgs = {
  input: Mage_CreateVaultCardPaymentTokenInput;
};


export type MutationMage_CreateVaultCardSetupTokenArgs = {
  input: Mage_CreateVaultCardSetupTokenInput;
};


export type MutationMage_DeleteCompareListArgs = {
  uid: Scalars['ID']['input'];
};


export type MutationMage_DeleteCustomerAddressArgs = {
  id: Scalars['Int']['input'];
};


export type MutationMage_DeletePaymentTokenArgs = {
  public_hash: Scalars['String']['input'];
};


export type MutationMage_DeleteStripePaymentMethodArgs = {
  input: Mage_StripePaymentMethodId;
};


export type MutationMage_EstimateShippingMethodsArgs = {
  input: Mage_EstimateTotalsInput;
};


export type MutationMage_EstimateTotalsArgs = {
  input: Mage_EstimateTotalsInput;
};


export type MutationMage_GenerateCustomerTokenArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationMage_GenerateCustomerTokenAsAdminArgs = {
  input: Mage_GenerateCustomerTokenAsAdminInput;
};


export type MutationMage_HandlePayflowProResponseArgs = {
  input: Mage_PayflowProResponseInput;
};


export type MutationMage_LofAddGiftCardToQuoteArgs = {
  cart_id: Scalars['String']['input'];
  code: Scalars['String']['input'];
};


export type MutationMage_LofApplyCustomerBalanceToCartArgs = {
  cart_id: Scalars['String']['input'];
};


export type MutationMage_LofGiftCardRedeemArgs = {
  code: Scalars['String']['input'];
  customer_id: Scalars['String']['input'];
};


export type MutationMage_MergeCartsArgs = {
  destination_cart_id?: InputMaybe<Scalars['String']['input']>;
  source_cart_id: Scalars['String']['input'];
};


export type MutationMage_MollieApplePayValidationArgs = {
  domain?: InputMaybe<Scalars['String']['input']>;
  validationUrl: Scalars['String']['input'];
};


export type MutationMage_MolliePaymentLinkRedirectArgs = {
  order?: InputMaybe<Scalars['String']['input']>;
};


export type MutationMage_MollieProcessTransactionArgs = {
  input?: InputMaybe<Mage_MollieProcessTransactionInput>;
};


export type MutationMage_MollieRestoreCartArgs = {
  input?: InputMaybe<Mage_MollieResetCartInput>;
};


export type MutationMage_PlaceOrderArgs = {
  input?: InputMaybe<Mage_PlaceOrderInput>;
};


export type MutationMage_RemoveCouponFromCartArgs = {
  input?: InputMaybe<Mage_RemoveCouponFromCartInput>;
};


export type MutationMage_RemoveItemFromCartArgs = {
  input?: InputMaybe<Mage_RemoveItemFromCartInput>;
};


export type MutationMage_RemoveProductsFromCompareListArgs = {
  input?: InputMaybe<Mage_RemoveProductsFromCompareListInput>;
};


export type MutationMage_RemoveProductsFromWishlistArgs = {
  wishlistId: Scalars['ID']['input'];
  wishlistItemsIds: Array<Scalars['ID']['input']>;
};


export type MutationMage_ReorderItemsArgs = {
  orderNumber: Scalars['String']['input'];
};


export type MutationMage_RequestGuestOrderCancelArgs = {
  input: Mage_GuestOrderCancelInput;
};


export type MutationMage_RequestPasswordResetEmailArgs = {
  email: Scalars['String']['input'];
};


export type MutationMage_ResendConfirmationEmailArgs = {
  email: Scalars['String']['input'];
};


export type MutationMage_ResetPasswordArgs = {
  email: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
  resetPasswordToken: Scalars['String']['input'];
};


export type MutationMage_SendEmailToFriendArgs = {
  input?: InputMaybe<Mage_SendEmailToFriendInput>;
};


export type MutationMage_SetBillingAddressOnCartArgs = {
  input?: InputMaybe<Mage_SetBillingAddressOnCartInput>;
};


export type MutationMage_SetCartAsInactiveArgs = {
  cartId: Scalars['String']['input'];
};


export type MutationMage_SetGuestEmailOnCartArgs = {
  input?: InputMaybe<Mage_SetGuestEmailOnCartInput>;
};


export type MutationMage_SetPaymentMethodAndPlaceOrderArgs = {
  input?: InputMaybe<Mage_SetPaymentMethodAndPlaceOrderInput>;
};


export type MutationMage_SetPaymentMethodOnCartArgs = {
  input?: InputMaybe<Mage_SetPaymentMethodOnCartInput>;
};


export type MutationMage_SetShippingAddressesOnCartArgs = {
  input?: InputMaybe<Mage_SetShippingAddressesOnCartInput>;
};


export type MutationMage_SetShippingMethodsOnCartArgs = {
  input?: InputMaybe<Mage_SetShippingMethodsOnCartInput>;
};


export type MutationMage_SubscribeEmailToNewsletterArgs = {
  email: Scalars['String']['input'];
};


export type MutationMage_SyncPaymentOrderArgs = {
  input?: InputMaybe<Mage_SyncPaymentOrderInput>;
};


export type MutationMage_UpdateCartItemsArgs = {
  input?: InputMaybe<Mage_UpdateCartItemsInput>;
};


export type MutationMage_UpdateCustomerArgs = {
  input: Mage_CustomerInput;
};


export type MutationMage_UpdateCustomerAddressArgs = {
  id: Scalars['Int']['input'];
  input?: InputMaybe<Mage_CustomerAddressInput>;
};


export type MutationMage_UpdateCustomerEmailArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationMage_UpdateCustomerV2Args = {
  input: Mage_CustomerUpdateInput;
};


export type MutationMage_UpdateProductsInWishlistArgs = {
  wishlistId: Scalars['ID']['input'];
  wishlistItems: Array<Mage_WishlistItemUpdateInput>;
};

export type Query = {
  __typename?: 'Query';
  /** Retrieve EAV attributes associated to a frontend form. Use countries query provided by DirectoryGraphQl module to retrieve region_id and country_id attribute options. */
  Mage_attributesForm: Mage_AttributesFormOutput;
  /** Returns a list of attributes metadata for a given entity type. */
  Mage_attributesList?: Maybe<Mage_AttributesMetadataOutput>;
  /** Get a list of available store views and their config information. */
  Mage_availableStores?: Maybe<Array<Maybe<Mage_StoreConfig>>>;
  /** The cachedCurrency query returns information about store currency and contains a 'config' cache key. */
  Mage_cachedCurrency?: Maybe<Mage_Currency>;
  /** Return information about the specified shopping cart. */
  Mage_cart?: Maybe<Mage_Cart>;
  /** Return a list of categories that match the specified filter. */
  Mage_categories?: Maybe<Mage_CategoryResult>;
  /**
   * Search for categories that match the criteria specified in the `search` and `filter` attributes.
   * @deprecated Use `categories` instead.
   */
  Mage_category?: Maybe<Mage_CategoryTree>;
  /**
   * Return an array of categories based on the specified filters.
   * @deprecated Use `categories` instead.
   */
  Mage_categoryList?: Maybe<Array<Maybe<Mage_CategoryTree>>>;
  /** Return Terms and Conditions configuration information. */
  Mage_checkoutAgreements?: Maybe<Array<Maybe<Mage_CheckoutAgreement>>>;
  /** Return information about CMS blocks. */
  Mage_cmsBlocks?: Maybe<Mage_CmsBlocks>;
  /** Return details about a CMS page. */
  Mage_cmsPage?: Maybe<Mage_CmsPage>;
  /** Return products that have been added to the specified compare list. */
  Mage_compareList?: Maybe<Mage_CompareList>;
  /** The countries query provides information for all countries. */
  Mage_countries?: Maybe<Array<Maybe<Mage_Country>>>;
  /** The countries query provides information for a single country. */
  Mage_country?: Maybe<Mage_Country>;
  /** Return information about the store's currency. */
  Mage_currency?: Maybe<Mage_Currency>;
  /**
   * Return the attribute type, given an attribute code and entity type.
   * @deprecated Use `customAttributeMetadataV2` query instead.
   */
  Mage_customAttributeMetadata?: Maybe<Mage_CustomAttributeMetadata>;
  /** Retrieve EAV attributes metadata. */
  Mage_customAttributeMetadataV2: Mage_AttributesMetadataOutput;
  /** Return detailed information about a customer account. */
  Mage_customer?: Maybe<Mage_Customer>;
  /** Return information about the customer's shopping cart. */
  Mage_customerCart: Mage_Cart;
  /** Return a list of downloadable products the customer has purchased. */
  Mage_customerDownloadableProducts?: Maybe<Mage_CustomerDownloadableProducts>;
  /** @deprecated Use the `customer` query instead. */
  Mage_customerOrders?: Maybe<Mage_CustomerOrders>;
  /** Return a list of customer payment tokens stored in the vault. */
  Mage_customerPaymentTokens?: Maybe<Mage_CustomerPaymentTokens>;
  /** Retrieve the secure PayPal URL for a Payments Pro Hosted Solution transaction. */
  Mage_getHostedProUrl?: Maybe<Mage_HostedProUrl>;
  /** Retrieve payment credentials for a transaction. Use this query for Payflow Link and Payments Advanced payment methods. */
  Mage_getPayflowLinkToken?: Maybe<Mage_PayflowLinkToken>;
  /** Retrieves the payment configuration for a given location */
  Mage_getPaymentConfig?: Maybe<Mage_PaymentConfigOutput>;
  /** Retrieves the payment details for the order */
  Mage_getPaymentOrder?: Maybe<Mage_PaymentOrderOutput>;
  /** Gets the payment SDK urls and values */
  Mage_getPaymentSDK?: Maybe<Mage_GetPaymentSdkOutput>;
  /** Get the module's configuration to initialize Stripe Elements. */
  Mage_getStripeConfiguration?: Maybe<Mage_ModuleConfiguration>;
  /** Retrieves the vault configuration */
  Mage_getVaultConfig?: Maybe<Mage_VaultConfigOutput>;
  /** Retrieve guest order details based on number, email and billing last name. */
  Mage_guestOrder: Mage_CustomerOrder;
  /** Retrieve guest order details based on token. */
  Mage_guestOrderByToken: Mage_CustomerOrder;
  /** Check whether the specified email has already been used to create a customer account. */
  Mage_isEmailAvailable?: Maybe<Mage_IsEmailAvailableOutput>;
  /** Query gift card info by id. */
  Mage_lofGiftCardInfo?: Maybe<Mage_GiftCardInfo>;
  Mage_mollieCustomerOrder?: Maybe<Mage_CustomerOrder>;
  Mage_molliePaymentMethods?: Maybe<Mage_MolliePaymentMethodsOutput>;
  /** The pickup locations query searches for locations that match the search request requirements. */
  Mage_pickupLocations?: Maybe<Mage_PickupLocations>;
  /** Return the active ratings attributes and the values each rating can have. */
  Mage_productReviewRatingsMetadata: Mage_ProductReviewRatingsMetadata;
  /** Search for products that match the criteria specified in the `search` and `filter` attributes. */
  Mage_products?: Maybe<Mage_Products>;
  Mage_recaptchaFormConfig?: Maybe<Mage_ReCaptchaConfigOutput>;
  /** Returns details about Google reCAPTCHA V3-Invisible configuration. */
  Mage_recaptchaV3Config?: Maybe<Mage_ReCaptchaConfigurationV3>;
  /** Return the full details for a specified product, category, or CMS page. */
  Mage_route?: Maybe<Mage_RoutableInterface>;
  /** Return details about the store's configuration. */
  Mage_storeConfig?: Maybe<Mage_StoreConfig>;
  /**
   * Return the relative URL for a specified product, category or CMS page.
   * @deprecated Use the `route` query instead.
   */
  Mage_urlResolver?: Maybe<Mage_EntityUrl>;
  /**
   * Return the contents of a customer's wish list.
   * @deprecated Moved under `Customer.wishlist`.
   */
  Mage_wishlist?: Maybe<Mage_WishlistOutput>;
};


export type QueryMage_AttributesFormArgs = {
  formCode: Scalars['String']['input'];
};


export type QueryMage_AttributesListArgs = {
  entityType: Mage_AttributeEntityTypeEnum;
  filters?: InputMaybe<Mage_AttributeFilterInput>;
};


export type QueryMage_AvailableStoresArgs = {
  useCurrentGroup?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryMage_CartArgs = {
  cart_id: Scalars['String']['input'];
};


export type QueryMage_CategoriesArgs = {
  currentPage?: InputMaybe<Scalars['Int']['input']>;
  filters?: InputMaybe<Mage_CategoryFilterInput>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryMage_CategoryArgs = {
  id?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryMage_CategoryListArgs = {
  currentPage?: InputMaybe<Scalars['Int']['input']>;
  filters?: InputMaybe<Mage_CategoryFilterInput>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryMage_CmsBlocksArgs = {
  identifiers?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryMage_CmsPageArgs = {
  id?: InputMaybe<Scalars['Int']['input']>;
  identifier?: InputMaybe<Scalars['String']['input']>;
};


export type QueryMage_CompareListArgs = {
  uid: Scalars['ID']['input'];
};


export type QueryMage_CountryArgs = {
  id?: InputMaybe<Scalars['String']['input']>;
};


export type QueryMage_CustomAttributeMetadataArgs = {
  attributes: Array<Mage_AttributeInput>;
};


export type QueryMage_CustomAttributeMetadataV2Args = {
  attributes?: InputMaybe<Array<Mage_AttributeInput>>;
};


export type QueryMage_GetHostedProUrlArgs = {
  input: Mage_HostedProUrlInput;
};


export type QueryMage_GetPayflowLinkTokenArgs = {
  input: Mage_PayflowLinkTokenInput;
};


export type QueryMage_GetPaymentConfigArgs = {
  location: Mage_PaymentLocation;
};


export type QueryMage_GetPaymentOrderArgs = {
  cartId: Scalars['String']['input'];
  id: Scalars['String']['input'];
};


export type QueryMage_GetPaymentSdkArgs = {
  location: Mage_PaymentLocation;
};


export type QueryMage_GuestOrderArgs = {
  input: Mage_OrderInformationInput;
};


export type QueryMage_GuestOrderByTokenArgs = {
  input: Mage_OrderTokenInput;
};


export type QueryMage_IsEmailAvailableArgs = {
  email: Scalars['String']['input'];
};


export type QueryMage_LofGiftCardInfoArgs = {
  code: Scalars['String']['input'];
};


export type QueryMage_MollieCustomerOrderArgs = {
  hash?: InputMaybe<Scalars['String']['input']>;
};


export type QueryMage_MolliePaymentMethodsArgs = {
  input?: InputMaybe<Mage_MolliePaymentMethodsInput>;
};


export type QueryMage_PickupLocationsArgs = {
  area?: InputMaybe<Mage_AreaInput>;
  currentPage?: InputMaybe<Scalars['Int']['input']>;
  filters?: InputMaybe<Mage_PickupLocationFilterInput>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  productsInfo?: InputMaybe<Array<InputMaybe<Mage_ProductInfoInput>>>;
  sort?: InputMaybe<Mage_PickupLocationSortInput>;
};


export type QueryMage_ProductsArgs = {
  currentPage?: InputMaybe<Scalars['Int']['input']>;
  filter?: InputMaybe<Mage_ProductAttributeFilterInput>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Mage_ProductAttributeSortInput>;
};


export type QueryMage_RecaptchaFormConfigArgs = {
  formType: Mage_ReCaptchaFormEnum;
};


export type QueryMage_RouteArgs = {
  url: Scalars['String']['input'];
};


export type QueryMage_UrlResolverArgs = {
  url: Scalars['String']['input'];
};

export enum Join__Graph {
  Mage = 'MAGE'
}

export enum Link__Purpose {
  /** `EXECUTION` features provide metadata necessary for operation execution. */
  Execution = 'EXECUTION',
  /** `SECURITY` features provide metadata necessary to securely resolve fields. */
  Security = 'SECURITY'
}
