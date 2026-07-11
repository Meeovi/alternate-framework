module.exports = {
  name: 'prefix-cms',
  transformSchema: (schema) => {
    const { mapSchema, MapperKind } = require('@graphql-tools/utils');

    return mapSchema(schema, {
      // Prefix all type names
      [MapperKind.TYPE]: (type) => {
        if (type.name.startsWith('__')) return type;
        return Object.assign(Object.create(type), {
          name: `CMS_${type.name}`
        });
      },

      // Prefix root fields (Query, Mutation, Subscription)
      [MapperKind.ROOT_FIELD]: (fieldConfig, fieldName) => {
        return {
          ...fieldConfig,
          name: `cms_${fieldName}`
        };
      },

      // Prefix all field names inside types
      [MapperKind.FIELD]: (fieldConfig, fieldName) => {
        return {
          ...fieldConfig,
          name: `cms_${fieldName}`
        };
      }
    });
  }
};
