import type {
  GetCustomer,
  LoginCustomer,
  LogoutCustomer,
  RegisterCustomer,
  UpdateCustomer,
  ChangeCustomerPassword,
} from "./auth";
import type {
  GetCart,
  AddCartLineItem,
  UpdateCartLineItem,
  RemoveCartLineItem,
  ApplyCouponToCart,
  RemoveCouponFromCart,
} from "./cart";
import type { GetCategories, GetCategory } from "./category";
import type {
  GetAvailableShippingMethods,
  SetCartAddress,
  SetCustomerEmail,
  SetShippingMethod,
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
import type { GetOrders, GetOrderDetails, PlaceOrder } from "./order";
import type {
  GetCartPriceRules,
  GetCatalogPriceRules,
  GetProductDetails,
  GetProductPrice,
  GetProductReviews,
  GetProducts,
  SearchProducts,
} from "./product";
import type { GetCurrencies } from "./settings";

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
  getCategories: GetCategories;
  getCategory: GetCategory;
  getCustomer: GetCustomer;
  loginCustomer: LoginCustomer;
  logoutCustomer: LogoutCustomer;
  registerCustomer: RegisterCustomer;
  updateCustomer: UpdateCustomer;
  changeCustomerPassword: ChangeCustomerPassword;
  getProducts: GetProducts;
  getProductDetails: GetProductDetails;
  getProductReviews: GetProductReviews;
  getProductPrice: GetProductPrice;
  getCatalogPriceRules: GetCatalogPriceRules;
  getCartPriceRules: GetCartPriceRules;
  searchProducts: SearchProducts;
  getAvailableShippingMethods: GetAvailableShippingMethods;
  setCartAddress: SetCartAddress;
  setCustomerEmail: SetCustomerEmail;
  setShippingMethod: SetShippingMethod;
  createCustomerAddress: CreateCustomerAddress;
  deleteCustomerAddress: DeleteCustomerAddress;
  updateCustomerAddress: UpdateCustomerAddress;
  getCustomerAddresses: GetCustomerAddresses;
  getCurrencies: GetCurrencies;
  getOrders: GetOrders;
  getOrderDetails: GetOrderDetails;
  placeOrder: PlaceOrder;
  getBrandBar: GetBrandBar;
  getContentPage: GetContentPage;
  getDotdigitalChatConfig: GetDotdigitalChatConfig;
  getProductRssFeeds: GetProductRssFeeds;
  getProductRssLink: GetProductRssLink;
};
