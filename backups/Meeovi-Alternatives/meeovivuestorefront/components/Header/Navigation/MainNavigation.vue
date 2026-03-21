<!-- eslint-disable vue/block-lang -->
<!-- eslint-disable vue/max-attributes-per-line -->
<!-- eslint-disable vue/html-self-closing -->
<!-- eslint-disable vue/html-indent -->
<template>
  <v-card class="mx-auto overflow-hidden" height="400">
    <v-system-bar color="deep-purple darken-3"></v-system-bar>
    <LazyHydrate when-visible>
      <Notification />
    </LazyHydrate>
    <TopBar class="desktop-only" />
    <v-app-bar color="deep-purple accent-4" dark prominent>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>

      <v-spacer></v-spacer>

      <v-btn icon>
        <IconSprite />
      </v-btn>

      <v-btn icon>
        <CartSidebar v-if="isCartSidebarOpen" />
      </v-btn>

      <v-btn icon>
        <WishlistSidebar v-if="isWishlistSidebarOpen" />
      </v-btn>

      <v-btn icon>
        <LoginModal
      v-if="isLoginModalOpen"
      @close="toggleLoginModal"
    />
      </v-btn>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" absolute bottom temporary>
      <v-list nav dense>
        <v-list-item-group v-model="group" active-class="deep-purple--text text--accent-4">
          <v-list-item>
            <v-list-item-title>Foo</v-list-item-title>
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

<script>
export default {
  data: () => ({
    drawer: false,
    group: null,
  }),

  watch: {
    group() {
      this.drawer = false;
    },
  },
};
</script>
