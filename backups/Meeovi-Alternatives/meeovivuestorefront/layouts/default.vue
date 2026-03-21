<!-- eslint-disable vue/no-unused-components -->
<template>
  <v-card class="mx-auto overflow-hidden">
    <v-system-bar color="deep-purple darken-3"></v-system-bar>
    <LazyHydrate when-visible>
      <Notification />
    </LazyHydrate>
    <TopBar class="desktop-only" />
    <v-app-bar color="deep-purple accent-4" dark prominent>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <HeaderLogo />

      <v-spacer></v-spacer>
      <SearchBar />
      <v-spacer></v-spacer>

      <v-btn icon>
        <CartSidebar v-if="isCartSidebarOpen" />
      </v-btn>

      <v-btn icon>
        <WishlistSidebar v-if="isWishlistSidebarOpen" />
      </v-btn>

      <v-btn icon>
        <LoginModal v-if="isLoginModalOpen" @close="toggleLoginModal" />
      </v-btn>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" absolute bottom temporary>
      <v-list nav dense>
        <v-list-item-group v-model="group" active-class="deep-purple--text text--accent-4">
          <v-list-item>
            <v-list-item-title><HeaderNavigationItem /></v-list-item-title>
          </v-list-item>

          <v-list-item>
            <v-list-item-title>Bar</v-list-item-title>
          </v-list-item>

          <v-list-item>
            <v-list-item-title>Fizz</v-list-item-title>
          </v-list-item>

          <v-list-item>
            <v-list-item-title>Buzz</v-list-item-title>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>

    <v-card-text>
      <div id="layout">
        <nuxt :key="route.fullPath" />
      </div>
    </v-card-text>
    <BottomNavigation />
    <LoadWhenVisible>
      <AppFooter />
    </LoadWhenVisible>
  </v-card>
</template>

<script lang="ts">
  import LazyHydrate from 'vue-lazy-hydration';
  import {
    useRoute,
    defineComponent
  } from '@nuxtjs/composition-api';
  import {
    useUiState
  } from '~/composables';
  // import MainNavigation from '~/components/Header/Navigation/MainNavigation.vue';
  import AppHeader from '~/components/AppHeader.vue';
  import HeaderLogo from '~/components/HeaderLogo.vue';
  import HeaderNavigationItem from '~/components/Header/Navigation/HeaderNavigationItem.vue';
  import SearchBar from '~/components/Header/SearchBar/SearchBar.vue';
  import BottomNavigation from '~/components/BottomNavigation.vue';
  import IconSprite from '~/components/General/IconSprite.vue';
  import LoadWhenVisible from '~/components/utils/LoadWhenVisible.vue';
  import TopBar from '~/components/TopBar/TopBar.vue';

  export default defineComponent({
    name: 'DefaultLayout',

    components: {
      LoadWhenVisible,
      LazyHydrate,
      // MainNavigation,
      HeaderLogo,
      AppHeader,
      HeaderNavigationItem,
      SearchBar,
      BottomNavigation,
      IconSprite,
      TopBar,
      AppFooter: () => import(/* webpackPrefetch: true */ '~/components/AppFooter.vue'),
      CartSidebar: () => import(/* webpackPrefetch: true */ '~/modules/checkout/components/CartSidebar.vue'),
      WishlistSidebar: () => import(/* webpackPrefetch: true */
        '~/modules/wishlist/components/WishlistSidebar.vue'),
      LoginModal: () => import(/* webpackPrefetch: true */
        '~/modules/customer/components/LoginModal/LoginModal.vue'),
      Notification: () => import(/* webpackPrefetch: true */ '~/components/Notification.vue'),
    },

    setup() {
      const route = useRoute();
      const {
        isCartSidebarOpen,
        isWishlistSidebarOpen,
        isLoginModalOpen,
        toggleLoginModal,
      } = useUiState();

      return {
        isCartSidebarOpen,
        isWishlistSidebarOpen,
        isLoginModalOpen,
        toggleLoginModal,
        route,
      };
    },

    data: () => ({
      drawer: false,
      group: null,
    }),

    watch: {
      group() {
        this.drawer = false;
      },
    },

    head: {
      link: [{
        rel: 'stylesheet',
        href: '/_nuxt/fonts.css'
      }],
    },
  });

</script>

<style lang="scss">
  @import "~@storefront-ui/vue/styles";

  #layout {
    box-sizing: border-box;

    @include for-desktop {
      max-width: 1270px;
      margin: auto;
    }
  }

  .no-scroll {
    overflow: hidden;
    height: 100vh;
  }

  // Reset CSS
  html {
    width: auto;

    @include for-mobile {
      overflow-x: hidden;
    }
  }

  body {
    overflow-x: hidden;
    color: var(--c-text);
    font-size: var(--font-size--base);
    font-family: var(--font-family--primary);
    margin: 0;
    padding: 0;
  }

  a {
    text-decoration: none;
    color: var(--c-link);

    &:hover {
      color: var(--c-link-hover);
    }
  }

  h1 {
    font-family: var(--font-family--secondary);
    font-size: var(--h1-font-size);
    line-height: 1.6;
    margin: 0;
  }

  h2 {
    font-family: var(--font-family--secondary);
    font-size: var(--h2-font-size);
    line-height: 1.6;
    margin: 0;
  }

  h3 {
    font-family: var(--font-family--secondary);
    font-size: var(--h3-font-size);
    line-height: 1.6;
    margin: 0;
  }

  h4 {
    font-family: var(--font-family--secondary);
    font-size: var(--h4-font-size);
    line-height: 1.6;
    margin: 0;
  }

</style>
