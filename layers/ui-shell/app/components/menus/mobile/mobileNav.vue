<template>
    <nav id="mobileNav" aria-label="Main">
        <NuxtLink v-for="item in items" :key="item.to" :to="item.to" class="mobileNav__item"
            :class="{ 'mobileNav__item--center': item.center, 'is-active': isActive(item) }"
            :aria-current="isActive(item) ? 'page' : undefined">
            <span class="mobileNav__icon"><v-icon :icon="item.icon" size="small" /></span>
            <span class="mobileNav__label">{{ item.label }}</span>
        </NuxtLink>
    </nav>
</template>

<script setup>
    // Bottom tab bar for small screens (up to 1100px, the same breakpoint
    // the apps' own mobile CSS uses for the rest of the mobile chrome).
    const route = useRoute()

    // Left to right; search sits in the middle, raised.
    const items = [
        { label: 'Home', icon: 'fas fa-home', to: '/' },
        { label: 'Workspace', icon: 'fas fa-briefcase', to: '/workspace' },
        { label: 'Search', icon: 'fas fa-search', to: '/search', center: true, also: ['/results'] },
        { label: 'Browse', icon: 'fas fa-bars', to: '/menu-page' },
        { label: 'Lists', icon: 'fas fa-heart', to: '/lists' },
    ]

    function isActive(item) {
        const path = route.path.replace(/\/+$/, '') || '/'
        if (item.to === '/') return path === '/'
        return [item.to, ...(item.also || [])].some((base) => path === base || path.startsWith(`${base}/`))
    }
</script>

<style scoped>
    #mobileNav {
        display: none;
        position: fixed;
        z-index: 1006;
        left: 0;
        right: 0;
        bottom: 0;
        padding-bottom: env(safe-area-inset-bottom, 0px);
        background: rgb(var(--v-theme-surface));
        color: rgb(var(--v-theme-on-surface));
        border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
        box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.08);
    }

    @media (max-width: 1100px) {
        #mobileNav {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
        }
    }

    .mobileNav__item {
        -webkit-tap-highlight-color: transparent;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 2px;
        height: 56px;
        color: inherit !important;
        opacity: 0.65;
        text-decoration: none;
        font-size: 11px;
        font-weight: 600;
    }

    .mobileNav__item.is-active {
        opacity: 1;
        color: rgb(var(--v-theme-primary)) !important;
    }

    .mobileNav__item--center {
        opacity: 1;
    }

    .mobileNav__item--center .mobileNav__icon {
        display: grid;
        place-items: center;
        width: 48px;
        height: 48px;
        margin-top: -22px;
        border-radius: 50%;
        background: rgb(var(--v-theme-primary));
        color: rgb(var(--v-theme-on-primary));
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
    }

    .mobileNav__item--center.is-active {
        color: inherit !important;
    }
</style>
