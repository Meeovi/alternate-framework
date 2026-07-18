<template>
  <ScriptCarbonAds
    class="Carbon border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-white/5"
    serve="..."
    placement="..."
    format="..."
  />
</template>

<style lang="postcss">
/* Credits to nuxt.com */
.dark .Carbon {
  min-height: 220px;
  .carbon-text {
    @apply text-gray-400;

    &:hover {
      @apply text-gray-200;
    }
  }
}

.light .Carbon {
  .carbon-text {
    @apply text-gray-600;

    &:hover {
      @apply text-gray-800;
    }
  }
}

.Carbon {
  @apply p-3 flex flex-col max-w-full;

  #carbonads span {
    @apply flex flex-col justify-between;

    .carbon-wrap {
      @apply flex flex-col;

      flex: 1;

      @media (min-width: 320px) {
        @apply flex-row;
      }

      .carbon-img {
        @apply flex items-start justify-center mb-4;

        @media (min-width: 320px) {
          @apply mb-0;
        }
      }

      .carbon-text {
        @apply flex-1 text-sm w-full m-0 text-left block;

        &:hover {
          @apply no-underline;
        }

        @media (min-width: 320px) {
          @apply ml-4;
        }
      }
    }
  }

  img {
    @apply w-full;
  }

  & .carbon-poweredby {
    @apply ml-2 text-xs text-right text-gray-400 block pt-2;

    &:hover {
      @apply no-underline text-gray-500;
    }
  }
}
</style>
