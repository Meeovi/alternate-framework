<template>
  <div>
    <intro />
    <div class="homePage">
      <!-- <contentSection /> -->
      <characters />
      <!--<relatedstories />-->
      <videoSection />
    </div>
    <multiversebanner />
  </div>
</template>

<script setup>
  import intro from '~/components/homePage/intro.vue'
  //import contentSection from '~/components/homePage/contentSection.vue'
  import relatedstories from '~/components/related/relatedstories.vue'
  import videoSection from '~/components/homePage/videoSection.vue'
  import characters from '~/components/homePage/characters.vue'
  import multiversebanner from '~/components/homePage/multiversebanner.vue'
  
  useHead({
    title: 'Elite Novels',
  })
</script>