<script setup>
import {platformStyle} from '../assets/js/styles'
import WindowsController from "./WindowsController.vue";
import { type } from '@tauri-apps/api/os';
import { onMounted, ref } from 'vue';


const { headerStyle, innerMainStyle } = platformStyle();

const isWindows = ref(false);

onMounted(async()=> {
    const osType = await type();
    isWindows.value = osType ==='Windows_NT';
})


</script>

<template>
    <el-container>
        <el-header :style="headerStyle" data-tauri-drag-region class="unselectable">
            <WindowsController v-if="isWindows"/>
            <slot name="header"></slot>
        </el-header>
        <el-main class="unselectable" :style="innerMainStyle">
            <slot name="main"></slot>
        </el-main>

    </el-container>
</template>

<style scoped>


.el-main {
    background-color: var(--el-bg-color);
}

.el-header {
    background-color: var(--el-fill-color-light);
    padding: 0px;
}


</style>