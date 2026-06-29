import { getCommerceClient } from '../../../../utils/client'
import type { SfProduct, SfProductStatus, SfProductVisibility, SfProductType } from '~/composables/system/models'

export interface ProductAttribute {
  id: string
  code: string
  label: string
  value: string | number | boolean | string[]
  frontendInput: string
  isRequired: boolean
  isVisible: boolean
  sortOrder: number
}

export function useProductAttribute(product: SfProduct, attributesNames: string[] = []) {
  const attributes = (product?.variants || [])
    .flatMap((variant: any) => variant?.attributes || [])
    .filter((attr: any, index: number, self: any[]) => 
      index === self.findIndex((a: any) => a.name === attr.name)
    )

  const mapAttribute = (attrs: any[] = []) => {
    const defaults = attributesNames.map((name) => ({ name, value: null }))
    return Object.fromEntries([...defaults, ...attrs].map(({ name, value }: any) => [name, value]))
  }

  const selectedAttrs = ref(mapAttribute(product.attributes))

  return {
    getAttributeList: (attributeName: string) => attributes.filter((a: any) => a.name === attributeName),
    getAttribute: (attributeName: string) => selectedAttrs.value[attributeName],
    setAttribute: (attributeName: string, attributeValue: string) => {
      selectedAttrs.value = {
        ...selectedAttrs.value,
        [attributeName]: attributeValue,
      }
    },
  }
}
