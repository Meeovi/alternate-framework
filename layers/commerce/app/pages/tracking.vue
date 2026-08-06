<template>
    <div>
        <!-- The AfterShip target container -->
        <div class="as-track-button" data-domain="track.aftership.com" data-size="large"></div>
    </div>
</template>

<script setup>
    useHead({
        title: 'Track your Order',
        script: [{
            id: 'aftership-jssdk',
            src: 'https://button.aftership.com/all.js',
            async: true,
            defer: true
        }]
    })
</script>