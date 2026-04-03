import { magentoClient } from "./utils/client";
import { handleMagentoError } from "./utils/errors";
import { normalizeCart, normalizeCategory, normalizeProduct } from "./utils/normalizers";
import type {
  AddToCartInput,
  Cart,
  Category,
  MagentoCommerceAdapter,
  Product,
  ProductFilter,
  UpdateCartInput
} from "./types";

type MagentoProductQueryResult = {
  products?: {
    items?: Array<unknown>;
  };
};

type MagentoCategoriesQueryResult = {
  categories?: {
    items?: Array<unknown>;
  };
};

type MagentoCartResult = {
  cart?: unknown;
  addProductsToCart?: {
    cart?: unknown;
  };
  updateCartItems?: {
    cart?: unknown;
  };
  removeItemFromCart?: {
    cart?: unknown;
  };
};

export class MagentoAdapter implements MagentoCommerceAdapter {
  auth = {
    async login() {
      return { ok: true }
    },
    async logout() {
      return
    },
    async me() {
      return null
    }
  }

  search = {
    query: async (term: string) => {
      const products = await this.getProducts({ search: term, pageSize: 20, currentPage: 1 })
      return products.map((p) => ({
        id: p.id,
        title: p.name,
        name: p.name,
        price: p.price,
        image: p.image,
        description: p.name
      }))
    }
  }

  async getProduct(id: string): Promise<Product | null> {
    const query = /* GraphQL */ `
      query GetProduct($id: String!) {
        products(filter: { sku: { eq: $id } }) {
          items {
            sku
            name
            price_range {
              minimum_price {
                final_price {
                  value
                }
              }
            }
            image {
              url
            }
          }
        }
      }
    `;

    try {
      const result = await magentoClient.request<MagentoProductQueryResult>(query, { id });
      const firstItem = result.products?.items?.[0];
      if (!firstItem) {
        return null;
      }
      return normalizeProduct(firstItem as never);
    } catch (error) {
      handleMagentoError(error);
    }
  }

  async getProducts(filter: ProductFilter): Promise<Product[]> {
    const query = /* GraphQL */ `
      query GetProducts($search: String, $pageSize: Int, $currentPage: Int) {
        products(search: $search, pageSize: $pageSize, currentPage: $currentPage) {
          items {
            sku
            name
            price_range {
              minimum_price {
                final_price {
                  value
                }
              }
            }
            image {
              url
            }
          }
        }
      }
    `;

    try {
      const variables = {
        search: filter.search,
        pageSize: filter.pageSize ?? 20,
        currentPage: filter.currentPage ?? 1
      };
      const result = await magentoClient.request<MagentoProductQueryResult>(query, variables);
      return (result.products?.items ?? []).map((item) => normalizeProduct(item as never));
    } catch (error) {
      handleMagentoError(error);
    }
  }

  async getCategories(): Promise<Category[]> {
    const query = /* GraphQL */ `
      query GetCategories {
        categories {
          items {
            id
            name
          }
        }
      }
    `;

    try {
      const result = await magentoClient.request<MagentoCategoriesQueryResult>(query);
      return (result.categories?.items ?? []).map((item) => normalizeCategory(item as never));
    } catch (error) {
      handleMagentoError(error);
    }
  }

  async addToCart(input: AddToCartInput): Promise<Cart | null> {
    const mutation = /* GraphQL */ `
      mutation AddToCart($cartId: String!, $sku: String!, $quantity: Float!) {
        addProductsToCart(
          cartId: $cartId
          cartItems: [{ sku: $sku, quantity: $quantity }]
        ) {
          cart {
            id
            items {
              id
              quantity
              product {
                sku
              }
              prices {
                price {
                  value
                }
              }
            }
          }
        }
      }
    `;

    if (!input.cartId) {
      return null;
    }

    try {
      const result = await magentoClient.request<MagentoCartResult>(mutation, {
        cartId: input.cartId,
        sku: input.productId,
        quantity: input.quantity
      });
      const cart = result.addProductsToCart?.cart;
      return cart ? normalizeCart(cart as never) : null;
    } catch (error) {
      handleMagentoError(error);
    }
  }

  async updateCart(input: UpdateCartInput): Promise<Cart | null> {
    const mutation = /* GraphQL */ `
      mutation UpdateCart($cartId: String!, $itemId: Int!, $quantity: Float!) {
        updateCartItems(
          input: {
            cart_id: $cartId
            cart_items: [{ cart_item_id: $itemId, quantity: $quantity }]
          }
        ) {
          cart {
            id
            items {
              id
              quantity
              product {
                sku
              }
              prices {
                price {
                  value
                }
              }
            }
          }
        }
      }
    `;

    try {
      const result = await magentoClient.request<MagentoCartResult>(mutation, {
        cartId: input.cartId,
        itemId: Number(input.itemId),
        quantity: input.quantity
      });
      const cart = result.updateCartItems?.cart;
      return cart ? normalizeCart(cart as never) : null;
    } catch (error) {
      handleMagentoError(error);
    }
  }

  async removeFromCart(itemId: string): Promise<Cart | null> {
    const mutation = /* GraphQL */ `
      mutation RemoveFromCart($cartId: String!, $itemId: Int!) {
        removeItemFromCart(input: { cart_id: $cartId, cart_item_id: $itemId }) {
          cart {
            id
            items {
              id
              quantity
              product {
                sku
              }
              prices {
                price {
                  value
                }
              }
            }
          }
        }
      }
    `;

    const cartId = process.env.MAGENTO_CART_ID;
    if (!cartId) {
      return null;
    }

    try {
      const result = await magentoClient.request<MagentoCartResult>(mutation, {
        cartId,
        itemId: Number(itemId)
      });
      const cart = result.removeItemFromCart?.cart;
      return cart ? normalizeCart(cart as never) : null;
    } catch (error) {
      handleMagentoError(error);
    }
  }
}

export const createGatewayAdapterBindings = () => ({
  commerce: {
    magento: new MagentoAdapter()
  }
});