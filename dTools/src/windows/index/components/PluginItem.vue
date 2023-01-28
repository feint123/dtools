<script setup>
import { onMounted } from "vue";

import { uninstallPlugin } from "../../../assets/js/plugin";

import { Delete } from '@element-plus/icons-vue'


const props = defineProps(
    { model: Object }
)

onMounted(async () => {

})


function unPlugin(event, item) {
    uninstallPlugin(item);
    event.stopPropagation();
}


</script>


<template>
    <div class="plugin-item">
        <el-popover placement="right" :width="300" popper-style="box-shadow: var(--el-box-shadow-light); padding: 0">
            <template #reference>
                <el-row>
                    <el-col :span="6" style="justify-content: center; display: flex;">
                        <el-avatar shape="square" :size="50" fit="fit" :src="props.model.icon" />
                    </el-col>
                    <el-col :span="18">
                        <el-row><span class="multi-text title">{{ props.model.name }}</span></el-row>
                        <el-row><span class="multi-text desc">{{ props.model.desc }}</span></el-row>
                        <div class="plugin-item-bottom">
                            <el-row><span class="multi-text author">{{ props.model.author }}</span></el-row>
                            <el-link :icon="Delete" @click="unPlugin($event, props.model)" :underline="false"></el-link>
                        </div>
                    </el-col>
                </el-row>
            </template>
            <template #default>
                <div class="plugin-item-pop">
                    <div class="plugin-item-pop-body">
                        <el-row><span class="multi-text title" style="margin-right: 4px;">{{
                            props.model.name
                        }}</span><el-tag size="small" type="info">v{{ props.model.version }}</el-tag></el-row>
                        <el-row><span class="multi-text desc">{{ props.model.desc }}</span></el-row>
                    </div>
                    <div class="plugin-item-pop-bottom">
                        <el-row><span class="multi-text desc">{{ props.model.author }}</span></el-row>
                    </div>
                </div>
            </template>
        </el-popover>
    </div>
</template>

<style scoped>
.plugin-item-pop-body {
    padding: var(--el-popover-padding);
    padding-bottom: 0;

}

.plugin-item-pop-body.multi-text {
    -webkit-line-clamp: 10;
}

.plugin-item-pop-body .el-row {
    margin-bottom: 8px;
}

.plugin-item-pop-body .el-tag {
    font-style: italic;
    font-weight: bold;
}

.plugin-item-pop-bottom {
    border-top: var(--window-border);
    padding: 4px 12px;
}

.plugin-item-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
}


.plugin-item {
    padding: 4px 0;
    padding-right: 16px;
    line-height: 1.3;
    background-color: var(--el-fill-color-lighter);
    transition: 0.2s background-color ease-in;
}

.plugin-item:hover {
    background-color: var(--el-fill-color-light);
}

.plugin-container {
    width: 100%;
    border: none;
    background-color: var(--el-bg-color);
    overflow: hidden;
}

.multi-text {
    -webkit-line-clamp: 1;
}

.multi-text.author {
    font-size: var(--el-font-size-extra-small);
    color: var(--el-text-color-regular);
    font-weight: bold;
}

.multi-text.desc {
    font-size: var(--el-font-size-small);
    color: var(--el-text-color-secondary);
}

.multi-text.title {
    font-size: var(--el-font-size-base);
    font-weight: bold;
}
</style>