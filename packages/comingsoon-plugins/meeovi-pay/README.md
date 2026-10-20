<!--
Get your module up and running quickly.

Find and replace all on all files (CMD+SHIFT+F):
- Name: Meeovi Pay
- Package name: meeovi-pay
- Description: A e-waller 
-->

# Meeovi Pay

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

The groundbreaking E-Wallet feature, designed to enhance your experience on Meeovi while offering you opportunities for financial growth. With E-Wallet, you can now seamlessly engage with our community and generate income while enjoying a secure and efficient payment system.

All payments initiated by users within the community will be routed directly to the E-Wallet account configured in the AdminCP. This streamlines payment processing, ensuring that funds are securely and promptly received.

User accounts will reflect the paid amount after deducting the payment transaction/commission fee if having. The actual amount processed will be based on USD (United States Dollar) after being converted using the latest currency conversion rates. This ensures that users have a clear view of their earnings and expenditures.

Users can manage their finances effortlessly within the E-Wallet section. This includes checking their current balance, reviewing transaction history, sending funds, and monitoring withdrawal requests.

Admins play a vital role in the E-Wallet system by managing user withdrawal requests. Upon receiving a withdrawal request, Admins have the authority to approve it. Once approved, the Admin will be redirected to PayPal to complete the payment processing.

- [✨ &nbsp;Release Notes](/CHANGELOG.md)
<!-- - [🏀 Online playground](https://stackblitz.com/github/Meeovi/meeovi-pay?file=playground%2Fapp.vue) -->
<!-- - [📖 &nbsp;Documentation](https://meeovi.com/pay) -->

## Features

Seamlessly integrated with payment procedures. All payments received will be added to users' balances in E-Wallet.

Users can send requests to withdraw money from the E-Wallet. After admin approves withdrawal requests in AdminCP, money will be transferred to a chosen user payment account.

- Easily track detailed transactions, overview of E-Wallet balance, and withdrawal requests.

- The E-Wallet balance of sellers can be updated for a received amount when others pay for their listing items.

- Buyers can use money in E-Wallet to buy listing items, pay for subscription plans, and purchase activity point packages conveniently.

- Admin can configure a number of pending days that received money can be withdrawn since the payment date.

- Allow admin to charge withdrawal fee (in percent) on each withdrawal request.

= Admin can set up Exchange rates for multiple currencies in either manual way or auto-sync way.

## Quick Setup

Install the module to your Nuxt application with one command:

```bash
npx nuxt module add meeovi-pay
```

That's it! You can now use Meeovi Pay in your Nuxt app ✨


## Contribution

<details>
  <summary>Local development</summary>
  
  ```bash
  # Install dependencies
  npm install
  
  # Generate type stubs
  npm run dev:prepare
  
  # Develop with the playground
  npm run dev
  
  # Build the playground
  npm run dev:build
  
  # Run ESLint
  npm run lint
  
  # Run Vitest
  npm run test
  npm run test:watch
  
  # Release new version
  npm run release
  ```

</details>


<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/meeovi-pay/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/meeovi-pay

[npm-downloads-src]: https://img.shields.io/npm/dm/meeovi-pay.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/meeovi-pay

[license-src]: https://img.shields.io/npm/l/meeovi-pay.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/meeovi-pay