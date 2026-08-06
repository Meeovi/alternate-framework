module.exports = {
  name: 'filter-schema',
  transformSchema: (schema: any) => {
    const { filterSchema } = require('@graphql-tools/utils');

    return filterSchema({
      schema,
      rootFieldFilter: (operation: any, fieldName: string) => {
        // Remove fields you don't want exposed
        return !['internalField', 'debugField'].includes(fieldName);
      }
    });
  }
};
