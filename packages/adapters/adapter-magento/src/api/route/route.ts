export default `
  query route($url: String!) {
    route(url: $url) {
      type
       ... on ProductInterface {
        sku
      }
      ... on CategoryTree {
        id
      }
      ... on CmsPage {
        identifier
      }
      ... on CategoryInterface {
        id
      }
    }
  }
`;
