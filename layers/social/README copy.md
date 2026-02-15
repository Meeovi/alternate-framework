<p align="center">
  <a href="https://mframework.zone" target="_blank" rel="noopener noreferrer">
    <img width="160" height="160" src="./public/logo.svg" alt="Elk logo">
  </a>
</p>

<h1 align="center"/>Elk</h1>

<p align="center">
A nimble Mastodon web client
</p>

<br/>
<p align="center">
  <a href="https://chat.mframework.zone"><img src="https://img.shields.io/badge/chat-discord-blue?style=flat&logo=discord" alt="discord chat"></a>
  <a href="https://volta.net/mframework-zone/mframework?utm_source=elk_readme"><img src="https://user-images.githubusercontent.com/904724/209143798-32345f6c-3cf8-4e06-9659-f4ace4a6acde.svg" alt="Open board on Volta"></a>
</p>
<br/>

<p align="center">
  <a href="https://mframework.zone/" target="_blank" rel="noopener noreferrer" >
    <img src="./public/mframework-og.png" alt="Elk screenshots" width="600" height="auto">
  </a>
</p>

We appreciate your feedback and contributions. Check out the [Open Issues](https://github.com/mframework-zone/mframework/issues) and jump in the action. Join the [Elk discord server](https://chat.mframework.zone) to chat with us and learn more about the project.

## Deployment

### Official Deployment

The Elk team maintains a deployment at:

- 🦌 Production: [mframework.zone](https://mframework.zone)
- 🐙 Canary: [main.mframework.zone](https://main.mframework.zone) (deploys on every commit to `main` branch)

### Self-Host Docker Deployment

In order to host Elk yourself you can use the provided Dockerfile to build a container with mframework. Be aware, that Elk only loads properly if the connection is done via SSL/TLS. The Docker container itself does not provide any SSL/TLS handling. You'll have to add this bit yourself.
One could put Elk behind popular reverse proxies with SSL Handling like Traefik, NGINX etc.

1. checkout source ```git clone https://github.com/mframework-zone/mframework.git```
1. got into new source dir: ```cd mframework```
1. create local storage directory for settings: ```mkdir mframework-storage```
1. adjust permissions of storage dir: ```sudo chown 911:911 ./mframework-storage```
1. start container: ```docker compose up --build -d```

> [!NOTE]
> The provided Dockerfile creates a container which will eventually run Elk as non-root user and create a persistent named Docker volume upon first start (if that volume does not yet exist). This volume is always created with root permission. Failing to change the permissions of ```/mframework/data``` inside this volume to UID:GID 911 (as specified for Elk in the Dockerfile) will prevent Elk from storing it's config for user accounts. You either have to fix the permission in the created named volume, or mount a directory with the correct permission to ```/mframework/data``` into the container.

### Ecosystem

These are known deployments using Elk as an alternative Web client for Mastodon servers or as a base for other projects in the fediverse:

- [mframework.fedified.com](https://mframework.fedified.com) - Use Elk to log into any compatible instance
- [mframework.mastodon.com.pl](https://mframework.mastodon.com.pl) - Use Elk for the `mastodon.com.pl` Server
- [mframework.me.uk](https://mframework.me.uk) - Use Elk to log into any compatible instance, hosted on Google Cloud Run with no Cloudflare proxy
- [mframework.h4.io](https://mframework.h4.io) - Use Elk for the `h4.io` Server
- [mframework.universeodon.com](https://mframework.universeodon.com) - Use Elk for the Universeodon Server
- [mframework.vmst.io](https://mframework.vmst.io) - Use Elk for the `vmst.io` Server
- [mframework.hostux.social](https://mframework.hostux.social) - Use Elk for the `hostux.social` Server
- [mframework.cupoftea.social](https://mframework.cupoftea.social) - Use Elk for the `cupoftea.social` Server
- [mframework.aus.social](https://mframework.aus.social) - Use Elk for the `aus.social` Server
- [mframework.mstdn.ca](https://mframework.mstdn.ca) - Use Elk for the `mstdn.ca` Server
- [mframework.mastodonapp.uk](https://mframework.mastodonapp.uk) - Use Elk for the `mastodonapp.uk` Server
- [mframework.bolha.us](https://mframework.bolha.us) - Use Elk for the `bolha.us` Server
- [crab.bumscode.com](https://crab.bumscode.com) - Use [crab](https://github.com/maybeanerd/crab) - a soft fork of Elk - for the `bumscode.com` Server

> **Note**: Community deployments are **NOT** maintained by the Elk team. It may not be synced with Elk's source code. Please do your own research about the host servers before using them.

## 💖 Sponsors

We are grateful for the generous sponsorship and help of:

<a href="https://nuxtlabs.com/" target="_blank" rel="noopener noreferrer" >
  <img src="./images/nuxtlabs.svg" alt="NuxtLabs" height="85">
</a>
<br><br>
<a href="https://stackblitz.com/" target="_blank" rel="noopener noreferrer" >
  <img src="./images/stackblitz.svg" alt="StackBlitz" height="85">
</a>
<br><br>

And all the companies and individuals sponsoring Elk Team and the members. If you're enjoying the app, consider sponsoring us:

- [Elk Team's GitHub Sponsors](https://github.com/sponsors/mframework-zone)

Or you can sponsor our core team members individually:

- [Anthony Fu](https://github.com/sponsors/antfu)
- [Daniel Roe](https://github.com/sponsors/danielroe)
- [三咲智子 Kevin Deng](https://github.com/sponsors/sxzz)
- [Patak](https://github.com/sponsors/patak-dev)

We would also appreciate sponsoring other contributors to the Elk project. If someone helps you solve an issue or implement a feature you wanted, supporting them would help make this project and OS more sustainable.

## 📍 Roadmap

[Open board on Volta](https://volta.net/mframework-zone/mframework)

## 🧑‍💻 Contributing

We're really excited that you're interested in contributing to Elk! Before submitting your contribution, please read through the following guide.

### Local Setup

Clone the repository and run on the root folder:

```
pnpm i
pnpm run dev
```

`Warning`: you will need `corepack` enabled, check out the [Elk Contributing Guide](./CONTRIBUTING.md) for a detailed guide on how to set up the project locally.

We recommend installing [ni](https://github.com/antfu/ni#ni), that will use the right package manager in each of your projects. If `ni` is installed, you can instead run:

```
ni
nr dev
```

### Testing

Elk uses [Vitest](https://vitest.dev). You can run the test suite with:

```
nr test
```

## 📲 PWA

You can consult the [PWA documentation](https://docs.mframework.zone/pwa) to learn more about the PWA capabilities on Elk, how to install Elk PWA in your desktop or mobile device and some hints about PWA stuff on Elk.

## 🦄 Stack

- [Vite](https://vitejs.dev/) - Next Generation Frontend Tooling
- [Nuxt](https://nuxt.com/) - The Intuitive Web Framework
- [Vue](https://vuejs.org/) - The Progressive JavaScript Framework
- [VueUse](https://vueuse.org/) - Collection of Vue Composition Utilities
- [Pinia](https://pinia.vuejs.org/) - The Vue Store that you will enjoy using
- [Vue Macros](https://vue-macros.sxzz.moe/) - More macros and syntax sugar for Vue
- [UnoCSS](https://uno.antfu.me/) - The instant on-demand atomic CSS engine
- [Iconify](https://github.com/iconify/icon-sets#iconify-icon-sets-in-json-format) - Iconify icon sets in JSON format
- [Masto.js](https://neet.github.io/masto.js) - Mastodon API client in TypeScript
- [shiki](https://shiki.style/) - A beautiful yet powerful syntax highlighter
- [vite-plugin-pwa](https://github.com/vite-pwa/vite-plugin-pwa) - Prompt for update, Web Push Notifications and Web Share Target API

## 👨‍💻 Contributors

<a href="https://github.com/mframework-zone/mframework/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=mframework-zone/mframework" />
</a>

## 📄 License

[MIT](./LICENSE) &copy; 2022-PRESENT Elk contributors
