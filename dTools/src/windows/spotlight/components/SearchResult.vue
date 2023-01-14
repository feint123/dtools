<script setup>
import { onMounted, ref } from "vue";
import { emit } from '@tauri-apps/api/event';
import { dToolsEvent } from '../../../assets/js/events'

const props = defineProps({
    "result": {
        type: Array,
        default: [],
    }
})


onMounted(() => {
    // setTimeout(() => {
    //     const searchItems = document.getElementsByClassName("search-item");
    //     if (searchItems.length > 0) {
    //         searchItems[0].focus();
    //     }
    // }, 100);
})

function choosePlugin(item) {
    emit(dToolsEvent.PLUGIN_SELECT_CHANGED, item)
}

</script>


<template>
    <el-container style="border: none;">
        <el-main>
            <div v-for="item in result" class="search-item" tabindex="1" @keyup.enter="choosePlugin(item)">
                <el-avatar class="plugin-icon" shape="square" :size="25" fit="fit" :src="item.icon" />
                <div class="plugin-line">
                    <span class="multi-text plugin-name" v-if="item.type==1">{{ item.name }}</span>
                    <span class="multi-text plugin-name" v-else>{{ item.cName }}</span>
                </div>
            </div>
        </el-main>
    </el-container>
</template>


<style scoped>
.search-item {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    height: 30px;
    text-align: center;
    border-radius: 8px;
    margin: 4px 0;
}

/* .multi-text.desc {
    font-size: var(--el-font-size-small);
    color: var(--el-text-color-secondary);
} */
.plugin-icon {
    align-self: center;
    margin: 0.5em;
}

.plugin-item-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.multi-text {
    -webkit-line-clamp: 1;
}

.plugin-name {
    font-size: var(--el-font-size-base);
}

.search-item:focus {
    background: var(--focus-background-color);
    outline: none;
    color: var(--focus-color);
}


.el-main {
    padding: 0px;
    overflow: hidden;
}
</style>