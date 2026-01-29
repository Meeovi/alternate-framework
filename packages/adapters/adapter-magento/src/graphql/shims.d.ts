declare module '@graphql-typed-document-node/core' {
  export interface DocumentTypeDecoration<TResult = any, TVariables = any> {
    __apiType?: TResult
  }

  export type ResultOf<T> = any
}

declare global {
  // Some generated code refers to DocumentTypeDecoration in the global scope.
  // Mirror a minimal shape to satisfy the typechecker in isolated builds.
  interface DocumentTypeDecoration<TResult = any, TVariables = any> {
    __apiType?: TResult
  }
}

export {}
