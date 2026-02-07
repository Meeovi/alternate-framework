declare module '@tilework/opus' {
  // Keep generics for compatibility in annotations, but use non-generic member types
  // so different generic instantiations remain structurally compatible.
  export class AbstractField<Name extends string = string, T = any, Required extends boolean = boolean> {
    name: string
    alias?: string
    args?: Record<string, any>
    children?: Array<AbstractField | string>
    required: boolean
    constructor(name: string, required?: boolean)
    setAlias(alias: string): this
    addArgument(name: string, type: string, value?: any): this
    addField(field: AbstractField | string): this
    addFieldList(fields: Array<AbstractField | string>): this
  }

  export class Field<Name extends string = string, T = any, Required extends boolean = boolean> extends AbstractField<Name, T, Required> {
    constructor(name: string, required?: boolean)
  }

  export class InlineFragment<Name extends string = string, T = any, Required extends boolean = boolean> extends AbstractField<Name, T, Required> {
    constructor(typeName: string, fields?: Array<AbstractField | string>)
    addFieldList(fields: Array<AbstractField | string>): this
    addField(field: AbstractField | string): this
  }

  export class Query<Name extends string = string, T = any, Required extends boolean = boolean> extends AbstractField<Name, T, Required> {
    constructor(name?: string, required?: boolean)
    addFragment(fragment: InlineFragment | string): this
    build(): string
  }

  export class Mutation<Name extends string = string, T = any, Required extends boolean = boolean> extends AbstractField<Name, T, Required> {
    constructor(name?: string)
    build(): string
  }

  export class Argument {
    name: string
    type: string
    value?: any
    constructor(name: string, type: string, value?: any)
  }

  export type GraphQlResponse<T = any> = T

  export default Query
}
