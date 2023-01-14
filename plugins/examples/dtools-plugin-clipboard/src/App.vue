<script setup>
import { useDark } from '@vueuse/core';
import { onMounted } from 'vue';
import {init} from "./assets/js/init"
import ClipHistory from './pages/ClipHistory.vue'
useDark();

onMounted(()=> {
  init();
})

</script>

<template>
  <ClipHistory/>
</template>

<style scoped>

</style>
