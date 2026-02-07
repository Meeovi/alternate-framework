declare module 'prop-types' {
  const PropTypes: any;
  export default PropTypes;
}

declare module 'Component/*' {
  export type ProductType = any;
  export const ProductType: any;
  export type FieldType = any;
  export const FieldType: any;
  export type StockStatus = any;
  export const StockStatus: any;
  export type ImageType = any;
  export const ImageType: any;
  export const REVIEW_POPUP_ID: any;
  export const NONE_RADIO_OPTION: any;
  export const DATE_FIELDS_COUNT: any;
  export type FieldDateType = any;
  export const FieldDateType: any;
  export const TimeFormat: any;
  export type FormFields = any;
  export const FormFields: any;
  export type DateFieldAttr = any;
  export const DateFieldAttr: any;
  export const HourFormat: any;
  export type Directions = any;
  export const Directions: any;
  const whatever: any;
  export default whatever;
}

declare module 'Component/*/*' {
  const whatever: any;
  export = whatever;
}

declare module 'Component/*/*/*' {
  const whatever: any;
  export = whatever;
}

declare module 'Component/Product/Product.config' {
  export const ProductType: any;
  const cfg: any;
  export default cfg;
}

declare module 'Component/Field/Field.config' {
  export const FieldType: any;
  const cfg: any;
  export default cfg;
}
