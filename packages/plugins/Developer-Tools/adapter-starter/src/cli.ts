#!/usr/bin/env node

import { defineCommand, runMain } from 'citty'

const main = defineCommand({
  meta: {
    name: 'Starter App',
    version: '1.0.0',
    description: 'Starter App CLI',
  },

  subCommands: {
    init: () => import('./commands/init').then(r => r.default),
    webhooks: () => import('./commands/webhooks').then(r => r.default),
  },
})

runMain(main)