const { tokens } = require('../../design/tokens')

module.exports = {
  theme: {
    extend: {
      colors: tokens.colors,
      borderRadius: tokens.radius,
      spacing: tokens.spacing
    }
  }
}