<script setup>
import { onMounted, ref, h, reactive, onBeforeUnmount } from "vue";
import { renderToString } from "vue/server-renderer";
import { platformStyle } from '../../../assets/js/styles'
import { selectLocalWindowPlugin } from '../../../assets/js/db'
import { dToolsIPC } from '../../../assets/js/dtoosIPC';
import { dToolsEvent } from '../../../assets/js/events'
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { appDataDir, resolve } from '@tauri-apps/api/path';
import { importPluginFromLocal, uninstallPlugin } from "../../../assets/js/plugin";
import NomalPanel from "../../../components/NomalPanel.vue";
import PluginItem from "../components/PluginItem.vue";
import { useToggle } from "@vueuse/shared";
import { computed } from "@vue/reactivity";
import { message } from '@tauri-apps/api/dialog';
import { emit, listen } from '@tauri-apps/api/event';
import { Delete, Search } from '@element-plus/icons-vue'


const { innerMainStyle, innerAsideStyle } = platformStyle();
const pluginFrame = ref(null);
const searchKeywords = ref("");
const pluginList = ref([]);
const cssHref = ref("");
const scriptSrc = ref("");
const [isOpenAside, toggleAside] = useToggle()
const pluginListStyle = computed(() => {
    return { width: '280px' }
})

const activeNames = ref(['1']);

const unlisten = reactive({
    pluginLoaded: () => { },
    uninstallPlugin: () => { },
})

// 初始化插件
async function initPlugin() {
    pluginFrame.value.contentWindow.__DTOOLS_IPC__ = dToolsIPC();
    const frameDoc = pluginFrame.value.contentWindow.document;
    const pluginNode = h('div', { id: 'plugin-container' }, [
        h('div', { id: 'plugin' }),
        h('link', { href: cssHref.value, rel: 'stylesheet' })
    ])
    const script = document.createElement("script");
    script.type = "module";
    script.src = scriptSrc.value;
    frameDoc.body.appendChild(script);
    frameDoc.body.innerHTML = await renderToString(pluginNode);
    // 初始化消息通信
    pluginFrame.value.contentWindow.__DTOOLS_IPC__.init();
}

onMounted(async () => {
    unlisten.pluginLoaded = await listen(dToolsEvent.PLUGIN_INSTALL, (event) => {
        if (event.payload.success) {
            message(event.payload.msg, { title: '安装插件', type: 'info' })
            pluginList.value = [];
            loadLocalWindowPlugins();
        } else {
            message(event.payload.msg, { title: '安装插件', type: 'error' })
        }
    });

    unlisten.uninstallPlugin = await listen('plugin-uninstall', (event) => {
        if (event.payload.success) {
            pluginList.value = [];
            loadLocalWindowPlugins();
        } else {
            message(event.payload.msg, { title: '安装插件', type: 'error' })
        }
    })
    loadLocalWindowPlugins();
    isOpenAside.value = true;
})

onBeforeUnmount(() => {
    unlisten.pluginLoaded();
    unlisten.uninstallPlugin();
})

function loadLocalWindowPlugins() {
    selectLocalWindowPlugin().then((result) => {
        console.log(result);
        result.forEach(async row => {
            const basePath = await resolve(await appDataDir(), 'plugins', row.IDENTIFIER, encodeURI(row.NAME));
            const iconPath = convertFileSrc(await resolve(basePath, 'icon.png'));
            const windowCSS = convertFileSrc(await resolve(basePath, row.VERSION, 'window.css'));
            const windowJS = convertFileSrc(await resolve(basePath, row.VERSION, 'window.js'));
            pluginList.value.push({
                id: row.ID,
                name: row.NAME,
                version: row.VERSION,
                identifier: row.IDENTIFIER,
                desc: row.DESC,
                author: row.AUTHOR,
                icon: iconPath,
                windowCSS: windowCSS,
                windowJS: windowJS,
            })
        });
    }).catch( (e) => { });
}

function choosePlugin(item) {
    emit(dToolsEvent.PLUGIN_SELECT_CHANGED, item);
    pluginFrame.value.contentWindow.location.reload();
    setTimeout(() => {
        cssHref.value = item.windowCSS;
        scriptSrc.value = item.windowJS;
        initPlugin();
    }, 20)

}


function startDrag(event) {

}

function startMove() {

}


</script>


<template>

    <NomalPanel>
        <template #header>
        </template>
        <template #main>
            <el-container :style="innerAsideStyle">
                <el-aside class="plugin-drawer" :style="pluginListStyle">
                    <el-button @click="importPluginFromLocal" :text="true" size="small" style="margin-top: 4px;">
                        从本地安装插件
                    </el-button>
                    <div class="search-container">

                        <el-input v-model="searchKeywords" placeholder="在应用商店中搜索插件（开发中）" :prefix-icon="Search"
                            size="small" clearable />
                    </div>
                    <el-collapse v-model="activeNames" @change="" style="width: 100%;">
                        <el-collapse-item title="已安装" name="1">
                            <template #title>
                                已安装 &nbsp<el-tag size="small" round>{{ pluginList.length }}</el-tag>
                            </template>
                            <PluginItem v-for="item in pluginList" :model="item" @click="choosePlugin(item)"/>
                        </el-collapse-item>
                        <el-collapse-item title="推荐" name="2">

                        </el-collapse-item>
                    </el-collapse>
                </el-aside>
                <div class="dragable-line"></div>
                <el-main style="overflow: hidden;">
                    <iframe ref="pluginFrame" id="__plugin_container__" sandbox="allow-scripts allow-same-origin"
                        :style="innerMainStyle" class="plugin-container"></iframe>
                </el-main>
            </el-container>
        </template>
    </NomalPanel>

</template>

<style scoped>

.el-main,
:deep().el-main {
    padding: 0;
}

.plugin-drawer {
    width: 280px;
    background-color: var(--el-bg-color);
    /* border-right: var(--window-border); */
    transition: 0.3s width ease-in;
    overflow-y: auto;
    --el-collapse-header-height: 16px;
    background-color: var(--el-fill-color-lighter);
}

.dragable-line {
    background-color: var(--el-border-color-light);
    width: 1px;
    height: 100%;
    outline-width: 5px;
}

.dragable-line:hover {
    cursor: ew-resize;
}

/* .placeholder-header {
  position: fixed;
  background-color: var(--el-fill-color-light);
} */


.plugin-container {
    width: 100%;
    border: none;
    background-color: var(--el-bg-color);
    overflow: hidden;
}

:deep() .el-collapse {
    border-top: none;
}

:deep() .el-collapse-item__header {
    height: 25px;
    padding-left: 8px;
    padding-bottom: 4px;
    background-color: var(--el-fill-color-lighter);
}

:deep() .el-collapse-item__content {
    padding-bottom: 0;
}

.search-container {
    justify-content: center;
    display: flex;
    background-color: var(--el-fill-color-lighter);
    ;
}

:deep() .el-input__wrapper {
    background-color: var(--el-fill-color-dark);
}

.el-input {
    margin: 10px 8px;
}
</style>