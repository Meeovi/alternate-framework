import { ref } from 'vue';
import { groupBy, uniqBy } from 'lodash-es';
/**
 * composable for getting product attributes data
 * @param {SfProduct} product Product object
 * @param {TAttribute} attributesNames get specific product attributes
 */
export function useProductAttribute(product, attributesNames = []) {
    const attributes = groupBy(uniqBy((product?.variants || []).flatMap((variant) => variant?.attributes), 'value'), 'name');
    const mapAttribute = (attributes = []) => {
        const defaults = attributesNames.map((attribute) => ({ name: attribute, value: null }));
        return Object.fromEntries([...defaults, ...attributes].map(({ name, value }) => [name, value]));
    };
    const selectedAttrs = ref(mapAttribute(product.attributes));
    return {
        getAttributeList: (attributeName) => attributes[attributeName] || [],
        getAttribute: (attributeName) => selectedAttrs.value[attributeName],
        setAttribute: (attributeName, attributeValue) => {
            selectedAttrs.value = {
                ...selectedAttrs.value,
                [attributeName]: attributeValue,
            };
        },
    };
}
