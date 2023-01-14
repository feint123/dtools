<script setup>
import {platformStyle} from '../assets/js/styles'

const { mainStyle } = platformStyle();

</script>

<template>
    <el-container>
        <el-main class="unselectable" :style="mainStyle">
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