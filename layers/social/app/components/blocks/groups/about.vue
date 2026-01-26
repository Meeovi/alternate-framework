<template>
    <div>
        <section data-bs-version="5.1" class="header6 cid-sBXV7XsZQm" id="header6-2i"
            :style="`background-image: url('${backgroundImage}'); background-position: center;`">
            <div class="mbr-overlay" style="opacity: 0.2; background-color: rgb(68, 121, 217);"></div>
            <div class="align-center container-fluid">
                <div class="row justify-content-center">
                    <div class="col-12 col-lg-10">
                        <h1 class="mbr-section-title mbr-fonts-style mbr-white mb-3 display-1">
                            <strong>{{ group?.name }}</strong>
                        </h1>

                        <p class="mbr-text mbr-white mbr-fonts-style display-7" v-dompurify-html="group?.description">
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <section data-bs-version="5.1" class="features1 cid-sBXVhMMeXw" id="features2-2k">
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-12 col-md-6 col-lg-3">
                        <div class="card-wrapper">
                            <div class="card-box align-center">
                                <span class="mbr-iconfont mobi-mbri-credit-card mobi-mbri"
                                    style="color: rgb(255, 153, 102); fill: rgb(255, 153, 102);"></span>
                                <h4 class="card-title align-center mbr-black mbr-fonts-style display-7">
                                    <strong>Status</strong><br><br>{{ group?.status }}
                                </h4>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-md-6 col-lg-3">
                        <div class="card-wrapper">
                            <div class="card-box align-center">
                                <span class="mbr-iconfont mobi-mbri-sites mobi-mbri"
                                    style="color: rgb(255, 153, 102); fill: rgb(255, 153, 102);"></span>
                                <h4 class="card-title align-center mbr-black mbr-fonts-style display-7">
                                    <strong>Group
                                        Created</strong><br><br>{{ new Date(group?.date_created).toLocaleDateString() }}
                                </h4>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-md-6 col-lg-3">
                        <div class="card-wrapper">
                            <div class="card-box align-center">
                                <span class="mbr-iconfont mobi-mbri-users mobi-mbri"
                                    style="color: rgb(255, 153, 102); fill: rgb(255, 153, 102);"></span>
                                <h4 class="card-title align-center mbr-black mbr-fonts-style display-7">
                                    <strong># of Members</strong><br><br>{{ group?.numberOfMembers }}
                                </h4>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-md-6 col-lg-3">
                        <div class="card-wrapper">
                            <div class="card-box align-center">
                                <span class="mbr-iconfont mobi-mbri-home mobi-mbri"
                                    style="color: rgb(255, 153, 102); fill: rgb(255, 153, 102);"></span>
                                <h4 class="card-title align-center mbr-black mbr-fonts-style display-7">
                                    <strong>Owner</strong><br><br>
                                    <NuxtLink :to="`/user/${group?.owner?.id}`">{{ group?.owner?.first_name }}
                                        {{ group?.owner?.last_name }}</NuxtLink>
                                </h4>
                            </div>
                        </div>
                    </div>
                    <div class="col-12">
                        <div class="card-wrapper">
                            <div class="card-box align-center">
                                <p class="card-title align-center mbr-black mbr-fonts-style display-7"
                                    v-dompurify-html="group?.description"></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
    const props = defineProps({
        group: {
            type: Object,
            required: true,
        },
    })

const backgroundImage = computed(() => {
  const image = props.group?.image

  if (image?.filename_disk) {
    return `${$directus.url}assets/${image.filename_disk}`
  }

  // fallback image from /assets
  return new URL('@/assets/images/background2.jpg', import.meta.url).href
})
</script>