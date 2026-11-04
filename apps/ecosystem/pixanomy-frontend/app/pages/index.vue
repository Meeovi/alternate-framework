<template>
  <div class="pxh">
    <!-- Hero: gradient banner with the headline and the two main actions -->
    <section class="pxh-hero">
      <div class="pxh-hero__blob pxh-hero__blob--a" aria-hidden="true"></div>
      <div class="pxh-hero__blob pxh-hero__blob--b" aria-hidden="true"></div>
      <div class="pxh-hero__inner">
        <p class="pxh-eyebrow">Your creative cloud</p>
        <h1 class="pxh-hero__title">{{ hero.name }}</h1>
        <div class="pxh-hero__lead" v-dompurify-html="hero.content"></div>
        <div class="pxh-hero__actions">
          <a class="pxh-btn pxh-btn--light" :href="hero.url">{{ hero.url_name }}</a>
          <a class="pxh-btn pxh-btn--glass" :href="links.media">
            <v-icon size="small" icon="fas fa-photo-film" /> Open your media
          </a>
        </div>
      </div>
    </section>

    <!-- Quick shortcuts: round coloured icons, one per place to go -->
    <nav class="pxh-shortcuts" aria-label="Shortcuts">
      <a v-for="s in shortcuts" :key="s.label" class="pxh-shortcut" :href="s.href">
        <span class="pxh-shortcut__icon" :style="{ background: s.color }">
          <v-icon :icon="s.icon" color="white" />
        </span>
        <span class="pxh-shortcut__label">{{ s.label }}</span>
      </a>
    </nav>

    <!-- Card carousel: the main parts of Pixanomy, each with a screenshot -->
    <section class="pxh-section">
      <div class="pxh-section__head">
        <h2 class="pxh-h2">Everything in one place</h2>
        <a class="pxh-more" :href="links.app">See all apps <v-icon size="x-small" icon="fas fa-arrow-right" /></a>
      </div>
      <div class="pxh-rail">
        <a v-for="card in cards" :key="card.name" class="pxh-card" :href="card.url">
          <div class="pxh-card__art" :style="{ background: card.color }">
            <img :src="card.image" :alt="card.name" loading="lazy" width="1160" height="554" />
          </div>
          <div class="pxh-card__body">
            <h3 class="pxh-card__title">{{ card.name }}</h3>
            <div class="pxh-card__text" v-dompurify-html="card.content"></div>
            <span class="pxh-card__cta">{{ card.url_name }} <v-icon size="x-small" icon="fas fa-arrow-right" /></span>
          </div>
        </a>
      </div>
    </section>

    <!-- Features: why Pixanomy -->
    <section class="pxh-section">
      <h2 class="pxh-h2">Made for the way you work</h2>
      <div class="pxh-features">
        <div v-for="f in features" :key="f.name" class="pxh-feature">
          <span class="pxh-feature__icon" :style="{ background: f.tint, color: f.color }">
            <v-icon :icon="f.icon" />
          </span>
          <h3 class="pxh-feature__title">{{ f.name }}</h3>
          <div class="pxh-feature__text" v-dompurify-html="f.content"></div>
        </div>
      </div>
      <ul class="pxh-tags" aria-label="Highlights">
        <li v-for="tag in tags" :key="tag">{{ tag }}</li>
      </ul>
    </section>

    <!-- Call to action: sell on Meeovi -->
    <section class="pxh-section">
      <div class="pxh-cta">
        <div>
          <h2 class="pxh-cta__title">{{ sell.name }}</h2>
          <div class="pxh-cta__text" v-dompurify-html="sell.content"></div>
        </div>
        <a class="pxh-btn pxh-btn--light" :href="sell.url">{{ sell.url_name }}</a>
      </div>
    </section>
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import filesShot from '~/assets/images/screenshot-22-9-2026-18489-app.pixanomy.com-1160x554.jpg'
  import mediaShot from '~/assets/images/screenshot-22-9-2026-184657-app.pixanomy.com-1160x554.jpg'
  import dashboardShot from '~/assets/images/screenshot-22-9-2026-18496-app.pixanomy.com-1794x857.jpg'

  const { $directus, $readItem } = useNuxtApp()
  const appConfig = useAppConfig()
  const appUrl = appConfig.pixanomy?.appUrl || 'https://app.pixanomy.com'
  const links = {
    app: `${appUrl}/index.php/apps/dashboard/`,
    media: appConfig.pixanomy?.mediaUrl || 'https://meeovi.com/workspace/content/manage-media',
  }

  // Homepage copy is edited in Directus (page_blocks 24). The fallbacks keep the page whole
  // if Directus is slow or a row is removed.
  const fallback = [
    { name: 'Welcome to Pixanomy', content: '<p>Centralize your digital assets. Store, share, and manage them all in one place.</p>', url_name: 'Get Started', url: `${appUrl}/index.php/login` },
    { name: 'Your Files', content: '<p>Secure cloud storage and file sharing for easy sync, sharing and collaboration on your files.</p>', url_name: 'Learn more', url: `${appUrl}/index.php/apps/files/files` },
    { name: 'Media Manager', content: '<p>Manage your photos, documents, videos, and more in this robust media manager.</p>', url_name: 'Save your media', url: `${appUrl}/index.php/apps/photos/` },
    { name: 'At a glance', content: '<p>Tie together all of your assets in one place, wherever they come from.</p>', url_name: 'Jump In', url: links.app },
    { name: 'Customize your dashboard', content: '<p>See your most recent files, the latest from Pixanomy, and more.</p>' },
    { name: 'Across every device', content: '<p>Apps for Windows, the browser, iOS, Android, and more.</p>' },
    { name: 'Work with your team', content: '<p>Share your files and creations with your team.</p>' },
    { name: 'Sell your work', content: '<p>Meeovi is a decentralized social marketplace for content creators to sell and share their work.</p>', url_name: 'Take a look', url: 'https://meeovi.com' },
  ]

  const { data: homepage } = await useAsyncData('homepage', () =>
    $directus.request($readItem('page_blocks', '24', { fields: ['content', 'menus'] })).catch(() => null))

  const block = (i) => ({ ...fallback[i], ...(homepage.value?.content?.[i] || {}) })

  const hero = computed(() => block(0))
  const sell = computed(() => block(7))
  const cards = computed(() => [
    { ...block(1), image: filesShot, color: 'linear-gradient(135deg, #7b5cff, #b06bff)' },
    { ...block(2), image: mediaShot, color: 'linear-gradient(135deg, #ff7a59, #ffb347)' },
    { ...block(3), image: dashboardShot, color: 'linear-gradient(135deg, #00b4d8, #2ed3a5)' },
  ])
  const features = computed(() => [
    { ...block(4), icon: 'fas fa-table-columns', color: '#6c4bff', tint: 'rgba(108, 75, 255, 0.14)' },
    { ...block(5), icon: 'fas fa-mobile-screen', color: '#f0643c', tint: 'rgba(240, 100, 60, 0.14)' },
    { ...block(6), icon: 'fas fa-user-group', color: '#0b9ec4', tint: 'rgba(11, 158, 196, 0.14)' },
  ])
  const tags = computed(() => (homepage.value?.menus || []).map((m) => m?.name).filter(Boolean))

  const shortcuts = computed(() => [
    { label: 'Files', icon: 'fas fa-folder', color: '#7b5cff', href: block(1).url },
    { label: 'Photos', icon: 'fas fa-image', color: '#ff7a59', href: block(2).url },
    { label: 'Media', icon: 'fas fa-photo-film', color: '#e2489b', href: links.media },
    { label: 'Dashboard', icon: 'fas fa-gauge', color: '#00a7c9', href: links.app },
    { label: 'Sell', icon: 'fas fa-store', color: '#20b26b', href: block(7).url },
  ])

  useHead({
    title: 'Welcome to Pixanomy - All your creative media in one place',
    meta: [
      {
        name: 'description',
        content: 'Pixanomy is a platform that allows you to manage and showcase all your creative media in one place. Store, share, and manage your files, photos, videos, and more.'
      }
    ]
  })
</script>

<style scoped>
  .pxh {
    --pxh-radius: 20px;
    --pxh-text: rgb(var(--v-theme-on-surface));
    --pxh-muted: rgba(var(--v-theme-on-surface), 0.7);
    --pxh-card: rgb(var(--v-theme-surface));
    --pxh-line: rgba(var(--v-theme-on-surface), 0.1);
    max-width: 1240px;
    margin: 0 auto;
    padding: 16px 16px 56px;
    color: var(--pxh-text);
    font-family: inherit;
  }

  /* The app's global Mobirise/Bootstrap CSS styles bare headings and paragraphs; reset them here. */
  .pxh h1, .pxh h2, .pxh h3 { margin: 0; font-weight: 800; letter-spacing: -0.01em; text-align: inherit; color: inherit; }
  .pxh-section, .pxh-cta > div { text-align: left; }
  /* White text on the gradient panels (beats the reset above and the global heading colours). */
  .pxh .pxh-hero, .pxh .pxh-hero h1, .pxh .pxh-hero :deep(p),
  .pxh .pxh-cta, .pxh .pxh-cta h2, .pxh .pxh-cta :deep(p) { color: #fff; }
  .pxh .pxh-eyebrow { color: #fff; }
  .pxh a { text-decoration: none; }
  .pxh :deep(p) { margin: 0; color: inherit; text-align: inherit; font-size: inherit; line-height: 1.5; }

  /* Hero */
  .pxh-hero {
    position: relative;
    overflow: hidden;
    border-radius: calc(var(--pxh-radius) + 8px);
    padding: clamp(40px, 7vw, 88px) 24px;
    text-align: center;
    color: #fff;
    background: linear-gradient(120deg, #4f2de0 0%, #7b3cf0 38%, #b04ad8 62%, #12b5d6 100%);
  }
  .pxh-hero__blob { position: absolute; border-radius: 50%; filter: blur(8px); opacity: 0.35; }
  .pxh-hero__blob--a { width: 340px; height: 340px; left: -90px; bottom: -150px; background: #ffb347; }
  .pxh-hero__blob--b { width: 260px; height: 260px; right: -60px; top: -110px; background: #2ed3a5; }
  .pxh-hero__inner { position: relative; max-width: 760px; margin: 0 auto; }
  .pxh-eyebrow {
    display: inline-block;
    margin: 0 0 14px;
    padding: 4px 14px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.18);
    font-size: 0.85rem;
    font-weight: 600;
  }
  .pxh-hero__title { font-size: clamp(2.1rem, 5.4vw, 3.6rem); line-height: 1.08; color: #fff; }
  .pxh-hero__lead { margin: 16px auto 0; max-width: 560px; font-size: clamp(1rem, 2.2vw, 1.2rem); opacity: 0.95; }
  .pxh-hero__actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; margin-top: 28px; }

  .pxh-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    border-radius: 999px;
    font-weight: 700;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }
  .pxh-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18); }
  .pxh-btn--light { background: #fff; color: #4f2de0 !important; }
  .pxh-btn--glass { background: rgba(255, 255, 255, 0.16); color: #fff !important; border: 1px solid rgba(255, 255, 255, 0.45); }

  /* Shortcuts */
  .pxh-shortcuts {
    display: flex;
    justify-content: center;
    gap: clamp(14px, 4vw, 40px);
    margin: 28px 0 8px;
    overflow-x: auto;
    padding: 4px 4px 8px;
  }
  .pxh-shortcut { display: flex; flex-direction: column; align-items: center; gap: 8px; min-width: 64px; color: var(--pxh-text) !important; }
  .pxh-shortcut__icon {
    display: grid;
    place-items: center;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.14);
    transition: transform 0.15s ease;
  }
  .pxh-shortcut:hover .pxh-shortcut__icon { transform: translateY(-3px) scale(1.04); }
  .pxh-shortcut__label { font-size: 0.85rem; font-weight: 600; }

  /* Sections */
  .pxh-section { margin-top: clamp(36px, 6vw, 64px); }
  .pxh-section__head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
  .pxh-h2 { font-size: clamp(1.4rem, 3vw, 1.9rem); margin-bottom: 18px !important; }
  .pxh-more { font-weight: 700; color: rgb(var(--v-theme-primary)) !important; white-space: nowrap; }

  /* Card rail */
  .pxh-rail {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: minmax(280px, 1fr);
    gap: 20px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    padding-bottom: 10px;
  }
  .pxh-card {
    scroll-snap-align: start;
    display: flex;
    flex-direction: column;
    border-radius: var(--pxh-radius);
    background: var(--pxh-card);
    border: 1px solid var(--pxh-line);
    overflow: hidden;
    color: var(--pxh-text) !important;
    transition: transform 0.18s ease, box-shadow 0.18s ease;
  }
  .pxh-card:hover { transform: translateY(-4px); box-shadow: 0 14px 30px rgba(0, 0, 0, 0.14); }
  .pxh-card__art { padding: 20px 20px 0; }
  .pxh-card__art img {
    display: block;
    width: 100%;
    height: auto;
    aspect-ratio: 1160 / 554;
    object-fit: cover;
    object-position: top left;
    border-radius: 10px 10px 0 0;
    box-shadow: 0 -2px 18px rgba(0, 0, 0, 0.18);
  }
  .pxh-card__body { display: flex; flex-direction: column; gap: 8px; padding: 18px 20px 20px; flex: 1; }
  .pxh-card__title { font-size: 1.2rem; }
  .pxh-card__text { color: var(--pxh-muted); flex: 1; }
  .pxh-card__cta { font-weight: 700; color: rgb(var(--v-theme-primary)); }

  /* Features */
  .pxh-features { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; }
  .pxh-feature {
    padding: 24px;
    border-radius: var(--pxh-radius);
    background: var(--pxh-card);
    border: 1px solid var(--pxh-line);
  }
  .pxh-feature__icon { display: grid; place-items: center; width: 48px; height: 48px; border-radius: 14px; margin-bottom: 14px; }
  .pxh-feature__title { font-size: 1.1rem; margin-bottom: 6px !important; }
  .pxh-feature__text { color: var(--pxh-muted); }
  .pxh-tags { display: flex; flex-wrap: wrap; gap: 10px; list-style: none; padding: 0; margin: 20px 0 0; }
  .pxh-tags li {
    padding: 6px 16px;
    border-radius: 999px;
    border: 1px solid var(--pxh-line);
    background: var(--pxh-card);
    font-weight: 600;
    font-size: 0.9rem;
  }

  /* CTA banner */
  .pxh-cta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: clamp(28px, 5vw, 44px);
    border-radius: calc(var(--pxh-radius) + 8px);
    color: #fff;
    background: linear-gradient(120deg, #ff6a4d 0%, #ff8f3f 45%, #e2489b 100%);
  }
  .pxh-cta__title { font-size: clamp(1.5rem, 3.4vw, 2.2rem); color: #fff; }
  .pxh-cta__text { margin-top: 8px; max-width: 560px; opacity: 0.95; }
  .pxh-cta .pxh-btn--light { color: #d63f6e !important; }

  @media (max-width: 600px) {
    .pxh { padding: 10px 10px 40px; }
    .pxh-shortcuts { justify-content: flex-start; }
    .pxh-rail { grid-auto-columns: 82%; }
  }
</style>
