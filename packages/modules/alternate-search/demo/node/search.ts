import { createSearch, defineIndex, keywordField, memoryAdapter, numberField, textField } from "alternate-search";

export const search = createSearch({
  adapter: memoryAdapter(),
  indexes: {
    products: defineIndex({
      name: "products",
      primaryKey: "id",
      fieldMap: {
        id: keywordField(),
        title: textField({ searchable: true, sortable: true }),
        description: textField({ searchable: true }),
        category: keywordField({ facetable: true }),
        price: numberField({ filterable: true, sortable: true, facetable: true }),
      },
    }),
  },
});

export async function seedProducts(): Promise<void> {
  await search.setup();
  await search.index("products", [
    { id: "p1", title: "Running Shoes", description: "Lightweight trainers for daily runs", category: "footwear", price: 89.99 },
    { id: "p2", title: "Trail Sneakers", description: "All-terrain grip for outdoor adventures", category: "footwear", price: 119.00 },
    { id: "p3", title: "Laptop Stand", description: "Ergonomic aluminum stand for notebooks", category: "office", price: 42.50 },
    { id: "p4", title: "Mechanical Keyboard", description: "Tactile switches and compact layout", category: "office", price: 129.99 },
  ]);
}
