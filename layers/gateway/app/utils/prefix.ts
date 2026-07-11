module.exports = {
  name: 'prefix-fields',
  transformSchema: (schema: any) => {
    const { mapSchema, MapperKind } = require('@graphql-tools/utils');

    return mapSchema(schema, {
      [MapperKind.ROOT_FIELD]: (fieldConfig: { name: string; }) => {
        fieldConfig.name = `meeovi_${fieldConfig.name}`;
        return fieldConfig;
      }
    });
  }
};
