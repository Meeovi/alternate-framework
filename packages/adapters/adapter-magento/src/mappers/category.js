export function mapMagentoCategory(category) {
    return {
        id: category.uid,
        slug: category.url_key ?? category.uid,
        name: category.name,
        parentId: undefined, // Magento tree is nested; parentId can be derived if needed
        children: (category.children ?? []).map(mapMagentoCategory),
    };
}
