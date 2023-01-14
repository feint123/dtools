<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup


import { useDark } from "@vueuse/core";
import { platformStyle } from "../../assets/js/styles";
import { dToolsEvent } from "../../assets/js/events";
import { selectPluginsByName, selectCommand, selectPluginsById } from "../../assets/js/db";
import { shortcuts } from '../../assets/js/shortcuts';
import { listen, TauriEvent } from '@tauri-apps/api/event';
import { appDataDir, resolve } from '@tauri-apps/api/path';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { appWindow } from '@tauri-apps/api/window';
import { emit } from '@tauri-apps/api/event';
import { reactive, onMounted, ref, watch, onBeforeUnmount } from "vue";
import { Search } from '@element-plus/icons-vue';
import { useRouter } from "vue-router";
import { computed } from "@vue/reactivity";
import SearchResult from "./components/SearchResult.vue";



useDark()
const pluginType = {
    WINDOW: 1,
    COMMAND: 2,
}
const router = useRouter();

const { mainStyle } = platformStyle();
const searchKeywords = ref("");
const searchInput = ref(null);
const pluginKeywords = ref("");
const searchResult = ref([])
const pluginSelected = ref(false);
const currentPlugin = ref({});
const isPreSearch = computed(() => {
    return searchKeywords.value.length > 0;
});
const unListens = reactive({
    blur: () => { },
    change: () => { },
})


const currentWindowSize = computed(() => {
    if (searchKeywords.value.length > 0) {
        // const autoFitHeight = 60 + 16 + 2 + searchResult.value.length * 38;
        // return autoFitHeight > 600 ? 600 : autoFitHeight;
        return 600;
    } else {
        return 60;
    }
})


watch(currentWindowSize, async (newVal, oldVal) => {
    const innerSize = await appWindow.innerSize();
    const scaleFactor = await appWindow.scaleFactor();
    innerSize.height = newVal * scaleFactor;
    await appWindow.setSize(innerSize);
    appWindow.center();
});



function search(value) {
    searchResult.value = []
    if (value.length > 0) {
        // 查询名称符合条件的插件
        selectPluginsByName(value).then(result => {
            result.forEach(async row => {
                const basePath = await resolve(await appDataDir(), 'plugins', row.IDENTIFIER, encodeURI(row.NAME));
                const iconPath = convertFileSrc(await resolve(basePath, 'icon.png'));
                searchResult.value.push({
                    id: row.ID,
                    name: row.NAME,
                    version: row.VERSION,
                    identifier: row.IDENTIFIER,
                    desc: row.DESC,
                    icon: iconPath,
                    author: row.AUTHOR,
                    type: pluginType.WINDOW,
                })
            })
        })
        // 查询top5的command
        selectCommand(5).then(result => {
            result.forEach(async row => {
                selectPluginsById(row.P_ID).then((result) => {
                    searchResult.value.push({
                        id: result[0].ID,
                        name: result[0].NAME,
                        version: result[0].VERSION,
                        identifier: result[0].IDENTIFIER,
                        cId: row.ID,
                        cName: row.NAME,
                        event: row.EVENT,
                        icon: "",
                        type: pluginType.COMMAND,
                    })
                })
            })
        })
    }

}

function removeCurrentPlugin() {
    searchKeywords.value = "";
    searchResult.value = [];
    pluginSelected.value = false;
    currentPlugin.value = {};
    // 延迟50ms，等待元素挂在完成
    setTimeout(() => {
        searchInput.value.focus();
    }, 50)
}


onMounted(async () => {
    unListens.blur = await listen(TauriEvent.WINDOW_BLUR, async (event) => {
        if (event.windowLabel == 'spotlight') {
            appWindow.hide();
        }
    });
    unListens.change = await listen(dToolsEvent.PLUGIN_SELECT_CHANGED, (event) => {
        if (event.payload.type == pluginType.COMMAND) {
            setTimeout(()=> {
                emit(dToolsEvent.COMMAND_CALL, {content:searchKeywords.value, event: event.payload.event,
            name: event.payload.name, identifier: event.payload.identifier});
            },500);
        }
        // 路由到插件页面
        router.push({ path: "plugin", query: event.payload });
        setTimeout(() => {
            pluginSelected.value = true;
        }, 50)
        currentPlugin.value = event.payload;
    })
    shortcuts();
})

onBeforeUnmount(() => {
    unListens.blur();
    unListens.change();
})

</script>

<template>
    <el-container data-tauri-drag-region :style="mainStyle">
        <el-header v-if="pluginSelected">
            <div class="current-plugin">
                <div class="plugin-icon">
                    <el-avatar shape="circle" :size="25" fit="cover" :src="currentPlugin.icon" />
                </div>
                <span class="multi-text">{{ currentPlugin.name }}</span>
            </div>
            <el-input v-model="pluginKeywords" placeholder="" @keyup.backspace="removeCurrentPlugin"
                :input-style="{ border: 'none' }" clearable />
        </el-header>
        <el-header v-else>
            <el-input ref="searchInput" v-model="searchKeywords" placeholder="dTools 搜索" clearable :autofocus="true"
                :input-style="{ border: 'none' }" @input="search" :prefix-icon="Search" />
        </el-header>
        <el-main v-if="isPreSearch" class="unselectable">
            <router-view v-if="pluginSelected"></router-view>
            <SearchResult v-else :result="searchResult" :plugin-selected="false" />
        </el-main>
    </el-container>
</template>

<style scoped>
.multi-text {
    -webkit-line-clamp: 1;
}

.current-plugin {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    background-color: var(--focus-background-color);
    color: var(--focus-color);
    font-size: var(--el-font-size-small);
    font-weight: bold;
    border-radius: 18px;
    margin-left: 8px;
    padding: 4px;
}

.el-container {
    border: var(--window-border);
    border-radius: var(--window-border-radius);
}

.el-header {
    justify-content: center;
    background-color: transparent;
    width: 100%;
    height: 60px;
    padding: 0;
}

.el-input {
    font-size: x-large;
    height: 60px;
    --el-input-hover-border-color: var(--transparent-bg);
    --el-input-border-color: var(--transparent-bg);
    --el-input-focus-border-color: var(--transparent-bg);
    background-color: transparent;
    transition: 0.3s width ease;
}

:deep() .el-input__wrapper {
    background-color: transparent;
}

.el-main {
    padding: 8px;
}

.plugin-icon {
    height: 25px;
    margin-right: 0.2em;
}
</style>
