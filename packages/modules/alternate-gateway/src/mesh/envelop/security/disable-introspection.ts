import { NoSchemaIntrospectionCustomRule } from "graphql";

export const useDisableIntrospectionPlugin = () => ({
  onValidate({ addValidationRule }: { addValidationRule: (rule: unknown) => void }) {
    if (process.env.NODE_ENV === "production") {
      addValidationRule(NoSchemaIntrospectionCustomRule);
    }
  }
});