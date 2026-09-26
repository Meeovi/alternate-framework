import gql from 'graphql-tag';

const ecosystemmenu = gql`
query {
  navigation (filter: {name: {_eq: "The Meeovi Company"}}) {
    id
    name
    url
    menus
    image {
      filename_disk
    }
  }
}`

export default ecosystemmenu;