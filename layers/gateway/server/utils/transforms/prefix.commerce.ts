module.exports = {
  name: 'prefix-commerce',
  transformSchema: (schema) => {
    const { mapSchema, MapperKind } = require('@graphql-tools/utils');

    return mapSchema(schema, {
      [MapperKind.TYPE]: (type) => {
        if (type.name.startsWith('__')) return type;
        return Object.assign(Object.create(type), {
          name: `Commerce_${type.name}`
        });
      },

      [MapperKind.ROOT_FIELD]: (fieldConfig, fieldName) => {
        return {
          ...fieldConfig,
          name: `commerce_${fieldName}`
        };
      },

      [MapperKind.FIELD]: (fieldConfig, fieldName) => {
        return {
          ...fieldConfig,
          name: `commerce_${fieldName}`
        };
      }
    });
  }
};
