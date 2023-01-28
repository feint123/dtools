<script setup>
import { onMounted, ref, h, reactive, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { renderToString } from "vue/server-renderer";
import { platformStyle } from '../../../assets/js/styles'
import { appDataDir, resolve } from '@tauri-apps/api/path';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { dToolsIPC } from '../../../assets/js/dtoosIPC';

const route = useRoute()
const { innerMainStyle, innerAsideStyle } = platformStyle();
const pluginFrame = ref(null);
const cssHref = ref("");
const scriptSrc = ref("");

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
    pluginFrame.value.contentWindow.__DTOOLS_IPC__.init();
}

onMounted(async () => {
    const row = route.query;
    const basePath = await resolve(await appDataDir(), 'plugins', row.identifier, encodeURI(row.name));
    // const iconPath = convertFileSrc(await resolve(basePath, 'icon.png'));
    const windowCSS = convertFileSrc(await resolve(basePath, row.version, 'window.css'));
    const windowJS = convertFileSrc(await resolve(basePath, row.version, 'window.js'));
    scriptSrc.value = windowJS;
    cssHref.value = windowCSS;
    initPlugin();
})


onBeforeUnmount(() => {

})


</script>


<template>
    <iframe ref="pluginFrame" id="__plugin_container__" sandbox="allow-scripts allow-same-origin" class="plugin-container"></iframe>
</template>

<style scoped>
.el-main,
:deep().el-main {
    padding: 0;
}

.plugin-container {
    width: 100%;
    height: calc(100% - 8px);
    border: none;
    border-radius: var(--window-border-radius);
    background-color: var(--el-bg-color);
    overflow: hidden;
    box-shadow: var(--el-box-shadow-light);
}
</style>