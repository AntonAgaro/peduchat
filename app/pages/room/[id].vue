<template>
  <div>
    <h1>ROOM id: {{ id }}</h1>
    <video ref="localVideo" autoplay playsinline muted class="w-full h-full object-cover" />
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const id = route.params.id;

const stream = await navigator.mediaDevices.getUserMedia({
  video: {
    facingMode: 'user',
    width: { ideal: 1280 },
    height: { ideal: 720 },
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
  },
});
</script>

<style scoped></style>
