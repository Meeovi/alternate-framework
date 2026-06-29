import type {
  GetCustomer,
  LoginCustomer,
  LogoutCustomer,
  RegisterCustomer,
  UpdateCustomer,
  ChangeCustomerPassword,
  GetCustomerGroups,
} from "./auth";
import type {
  GetCart,
  AddCartLineItem,
  UpdateCartLineItem,
  RemoveCartLineItem,
  ApplyCouponToCart,
  RemoveCouponFromCart,
  SplitCart,
} from "./cart";
import type {
  GetCategories,
  GetCategory,
  GetCategoryTree,
  GetCategoryProducts,
  CreateCategory,
  UpdateCategory,
  DeleteCategory,
} from "./category";
import type {
  GetAvailableShippingMethods,
  SetCartAddress,
  SetCustomerEmail,
  SetShippingMethod,
  SetPaymentMethod,
  GetPaymentMethods,
} from "./checkout";
import type {
  CreateCustomerAddress,
  DeleteCustomerAddress,
  UpdateCustomerAddress,
  GetCustomerAddresses,
} from "./customer";
import type {
  GetBrandBar,
  GetContentPage,
  GetDotdigitalChatConfig,
  GetProductRssFeeds,
  GetProductRssLink,
} from './content';
import type {
  GetOrders,
  GetOrderDetails,
  PlaceOrder,
  GetInvoices,
  GetInvoice,
  GetShipments,
  GetShipment,
  GetCreditMemos,
  GetCreditMemo,
} from "./order";
import type {
  GetCartPriceRules,
  GetCatalogPriceRules,
  GetProductDetails,
  GetProductPrice,
  GetProductReviews,
  GetProducts,
  SearchProducts,
  SearchAutocomplete,
  GetProductSearchSuggestions,
  GetProductMediaGalleryEntries,
} from "./product";
import type { GetCurrencies, GetExchangeRates } from "./settings";

export * from "./auth";
export * from "./cart";
export * from "./category";
export * from "./checkout";
export * from './content';
export * from "./customer";
export * from "./helpers";
export * from "./product";
export * from "./settings";
export * from "./order";

export type UnifiedMethods = {
  getCart: GetCart;
  addCartLineItem: AddCartLineItem;
  updateCartLineItem: UpdateCartLineItem;
  removeCartLineItem: RemoveCartLineItem;
  applyCouponToCart: ApplyCouponToCart;
  removeCouponFromCart: RemoveCouponFromCart;
  splitCart: SplitCart;
  getCategories: GetCategories;
  getCategory: GetCategory;
  getCategoryTree: GetCategoryTree;
  getCategoryProducts: GetCategoryProducts;
  createCategory: CreateCategory;
  updateCategory: UpdateCategory;
  deleteCategory: DeleteCategory;
  getCustomer: GetCustomer;
  loginCustomer: LoginCustomer;
  logoutCustomer: LogoutCustomer;
  registerCustomer: RegisterCustomer;
  updateCustomer: UpdateCustomer;
  changeCustomerPassword: ChangeCustomerPassword;
  getCustomerGroups: GetCustomerGroups;
  getProducts: GetProducts;
  getProductDetails: GetProductDetails;
  getProductReviews: GetProductReviews;
  getProductPrice: GetProductPrice;
  getCatalogPriceRules: GetCatalogPriceRules;
  getCartPriceRules: GetCartPriceRules;
  searchProducts: SearchProducts;
  searchAutocomplete: SearchAutocomplete;
  getProductSearchSuggestions: GetProductSearchSuggestions;
  getProductMediaGalleryEntries: GetProductMediaGalleryEntries;
  getAvailableShippingMethods: GetAvailableShippingMethods;
  setCartAddress: SetCartAddress;
  setCustomerEmail: SetCustomerEmail;
  setShippingMethod: SetShippingMethod;
  setPaymentMethod: SetPaymentMethod;
  getPaymentMethods: GetPaymentMethods;
  createCustomerAddress: CreateCustomerAddress;
  deleteCustomerAddress: DeleteCustomerAddress;
  updateCustomerAddress: UpdateCustomerAddress;
  getCustomerAddresses: GetCustomerAddresses;
  getCurrencies: GetCurrencies;
  getExchangeRates: GetExchangeRates;
  getOrders: GetOrders;
  getOrderDetails: GetOrderDetails;
  placeOrder: PlaceOrder;
  getInvoices: GetInvoices;
  getInvoice: GetInvoice;
  getShipments: GetShipments;
  getShipment: GetShipment;
  getCreditMemos: GetCreditMemos;
  getCreditMemo: GetCreditMemo;
  getBrandBar: GetBrandBar;
  getContentPage: GetContentPage;
  getDotdigitalChatConfig: GetDotdigitalChatConfig;
  getProductRssFeeds: GetProductRssFeeds;
  getProductRssLink: GetProductRssLink;
};
