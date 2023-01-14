<script setup>
import { appWindow } from '@tauri-apps/api/window'
import { Delete, Search, Close, Minus, FullScreen } from '@element-plus/icons-vue'


</script>



<template>
    <div class="titlebar-button" id="titlebar-minimize" @click="()=>{appWindow.minimize()}">
        <el-icon >
            <Minus />
        </el-icon>
    </div>
    <div class="titlebar-button" id="titlebar-maximize" @click="()=>{appWindow.toggleMaximize()}">
        <el-icon>
            <FullScreen />
        </el-icon>
    </div>
    <div class="titlebar-button" id="titlebar-close" @click="()=>{appWindow.close()}">
        <el-icon>
            <Close />
        </el-icon>
    </div>
</template>

<style scoped>
.titlebar-button {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    width: 45px;
    height: var(--toolbar-height);
}

.titlebar-button:hover,
.el-header .el-icon:hover,
.el-header .el-icon:active {
    background: var(--el-fill-color-dark);
}

#titlebar-close:hover,
.el-header #titlebar-close .el-icon:hover {
    background-color: var(--el-color-danger);
}

.plugin-item-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
</style>