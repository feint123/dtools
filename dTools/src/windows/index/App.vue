<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import { DocumentCopy, Reading, MagicStick, SwitchFilled, Search } from '@element-plus/icons-vue'
import { ref, reactive, onMounted, onUnmounted, computed, StyleValue } from 'vue'
// import { listen, TauriEvent } from '@tauri-apps/api/event';
// import { appWindow } from '@tauri-apps/api/window';
import { useRouter } from 'vue-router';
import { useDark, useIntervalFn } from "@vueuse/core";
import { closeDb } from '../../assets/js/db';
import { dToolsEvent } from '../../assets/js/events';
import { platformStyle } from '../../assets/js/styles';
import { shortcuts } from '../../assets/js/shortcuts';
import { init } from '../../assets/js/init';
import { appWindow } from '@tauri-apps/api/window';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { listen } from '@tauri-apps/api/event';



useDark()

class LastPluginItem {
    pluginId: number|string;
    name:string;
    icon:string;
}

const { innerAsideStyle, mainStyle, headerStyle, asideStyle, toggleAside, asideSwitchStyle } = platformStyle()!;
const router = useRouter();
const lastUsedPlugins:LastPluginItem[] = [{
    pluginId: '',
    icon: convertFileSrc('/Users/feint/Library/Application Support/com.feint.dev/plugins/com.feint.plugins/%E7%BC%96%E7%A0%81%E8%BD%AC%E6%8D%A2/icon.png'),
    name: '剪切板',
},{
    pluginId: '',
    icon: convertFileSrc('/Users/feint/Library/Application Support/com.feint.dev/plugins/com.feint.plugins/%E7%BC%96%E7%A0%81%E8%BD%AC%E6%8D%A2/icon.png'),
    name: '剪切板',
},{
    pluginId: '',
    icon: convertFileSrc('/Users/feint/Library/Application Support/com.feint.dev/plugins/com.feint.plugins/%E7%BC%96%E7%A0%81%E8%BD%AC%E6%8D%A2/icon.png'),
    name: '剪切板',
}];
const PLUGIN_MENU = '/plugin'
// const selectedMenu = ref(PLUGIN_MENU)
const unListens = reactive({
    close: () => { },
    selectPlugin: () => { },
})

router.replace(PLUGIN_MENU);

onMounted(async () => {
    // 注册快捷键　
    shortcuts();
    // 点击关闭窗口按钮只隐藏，不关闭
    unListens.close = await appWindow.onCloseRequested(async (event) => {
        event.preventDefault();
        appWindow.hide();
    });
    // 监听插件选择事件，用于记录最近使用的插件
    unListens.selectPlugin = await listen<any>(dToolsEvent.PLUGIN_SELECT_CHANGED,(payload => {
        
    }))
    init()
});

onUnmounted(async () => {
    closeDb();
    unListens.close();
    unListens.selectPlugin();
})

function updateSelectMenu(index) {
    // selectedMenu.value = index;
    router.replace(index);
}

</script>

<template>
    <el-container class="window-bordered">
        <!-- 菜单栏 -->
        <el-aside :style="asideStyle">
            <el-container>
                <el-header data-tauri-drag-region :style="headerStyle">
                    <div class="toolbar-left" :style="asideSwitchStyle">
                        <el-icon @click="toggleAside()" size="20">
                            <SwitchFilled />
                        </el-icon>
                    </div>
                </el-header>
                <el-main :style="innerAsideStyle">
                    <el-menu default-active="plugin" class="unselectable" @select="updateSelectMenu">
                        <el-menu-item-group title="最近使用">
                            <el-menu-item index="1-1" v-for="item in lastUsedPlugins">
                                <el-avatar class="plugin-icon" shape="square" :size="25" fit="fit" :src="item.icon" />
                                <div class="plugin-line">
                                    <span class="multi-text plugin-name">{{ item.name }}</span>
                                </div>
                            </el-menu-item>
                        </el-menu-item-group>
                        <el-menu-item-group title="我的最爱">
                            <el-menu-item index="1-1" disabled>开发中...</el-menu-item>
                        </el-menu-item-group>
                        <el-menu-item-group title="插件管理">
                            <el-menu-item index="plugin">
                                <el-icon>
                                    <Search />
                                </el-icon>
                                我的插件
                            </el-menu-item>
                        </el-menu-item-group>
                    </el-menu>
                </el-main>
            </el-container>
        </el-aside>

        <!-- 功能区 -->
        <el-main :style="mainStyle">
            <router-view></router-view>
        </el-main>


    </el-container>

</template>

<style scoped>
.el-aside {
    transition: 0.3s width ease;
}

.toolbar-left {
    transition: 0.3s left ease;
    z-index: 2000;
}

.el-header {
    border: none;
    border-right: 1px solid var(--el-border-color-light);
}

.el-main {
    padding: 0px;
}

.el-menu {
    padding: 8px;
    background-color: var(--transparent-bg);
    height: 100%;
}

.el-menu-item {
    height: 30px;
    margin-bottom: 4px;
}

.el-menu-item.is-active {
    background-color: var(--focus-background-color);
    color: #E5EAF3;
    font-weight: bold;
    border-radius: 5px;
}

.el-menu-item:hover {
    border-radius: 5px;
}
.plugin-icon {
    height: 25px;
    margin-right: 8px;
}
</style>
