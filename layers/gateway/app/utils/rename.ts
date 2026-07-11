module.exports = {
  name: 'rename-types',
  transformSchema: (schema: any) => {
    // Example: rename Magento types
    return require('@graphql-tools/utils').mapSchema(schema, {
      renameType: (name: string) => {
        if (name.startsWith('Magento_')) {
          return name.replace('Magento_', 'M_');
        }
        return name;
      }
    });
  }
};
