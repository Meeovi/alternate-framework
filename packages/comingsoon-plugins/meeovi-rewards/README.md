<!--
Get your module up and running quickly.

Find and replace all on all files (CMD+SHIFT+F):
- Name: Meeovi Rewards
- Package name: meeovi-rewards
- Description: My new Nuxt module
-->

# Meeovi Rewards

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

Meeovi Rewards is one of the gamification tools on your social network to encourage members to have more interaction in the community. With this app, you reward members by giving "virtual points" for each of their activities.

The activity point system can be thought of as a website currency, it can be used in many different ways to manage your users. Users can earn points by doing various actions on your network, and then spend points or purchase items, subscriptions... It also makes things easier for users to manage their point balance with several options and criteria.

In terms of management, the app gives Admin control to adjust member points on each activity, along with several user group settings and point settings. You can also configure the conversion rate to convert the activity points to actual rewards such as real money.

There are many ways to use this system efficiently, such as promoting some active users to be a moderator of the site, giving "real" awards back to some active users, or to users whose points are over a threshold, etc.

Additionally, with no more boundaries or limits from the Core system, the Meeovi Rewards app enables developers to take advantage of the pointing system and use it to develop many features related to Meeovi Rewards.

- [✨ &nbsp;Release Notes](/CHANGELOG.md)
<!-- - [🏀 Online playground](https://stackblitz.com/github/Meeovi/meeovi-rewards?file=playground%2Fapp.vue) -->
<!-- - [📖 &nbsp;Documentation](https://example.com) -->

## Features

<!-- Highlight some of the features your module provide here -->
# Users can:
View the overall point balance with info on how many points users have earned, bought, received, spent & sent.

Review the activity points during a specific time period.

Have a detailed guide on how to earn points for each activity.

Purchase Activity Point packages with Payment Gateways or E-Wallet.

Use activity points to purchase listing items and pay for subscription plans.

Easily track point transaction histories and package transactions.

Send requests to convert points to cash in E-Wallet Balance.

Monitor the status of conversion requests.

# Admin can configure to:
Show/hide details of activity points to users.

Adjust the conversion rate for all available currencies.

Add new and Manage point packages.

Review all transactions using Activity points.

Review Activity Point statistics info of each user, such as their current activity points & total earn/received/bought/spent/sent with the option to adjust points and view their transaction.

Allow users to use Activity Points to purchase items.

Allow users to purchase Activity Point packages.

Allow users of specific roles to use the "Send/Minus Activity Points" function.

Adjust the maximum points and period that specific roles can send.

Manage how many points users of specific roles can receive for a particular activity.

Define conversion rate to convert activity points to cash in the E-Wallet Balance

Charge fee rate (%) when converting activity points to cash.

Manage Conversion requests.

Automatically approve conversion requests of users of specific roles.

## Quick Setup

Install the module to your Nuxt application with one command:

```bash
npx nuxt module add meeovi-rewards
```

That's it! You can now use Meeovi Rewards in your Nuxt app ✨


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
[npm-version-src]: https://img.shields.io/npm/v/meeovi-rewards/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/meeovi-rewards

[npm-downloads-src]: https://img.shields.io/npm/dm/meeovi-rewards.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/meeovi-rewards

[license-src]: https://img.shields.io/npm/l/meeovi-rewards.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/meeovi-rewards