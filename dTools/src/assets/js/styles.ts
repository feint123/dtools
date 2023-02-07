import { ref, computed, StyleValue, Ref } from 'vue';
import { useWindowSize, useToggle } from "@vueuse/core";

const { width, height } = useWindowSize()

const [isOpenAside, toggleAside] = useToggle()
isOpenAside.value = true;

const asideSwitchPos = computed<number>(() => {
    if (isOpenAside.value) {
        return currentAsideWidth.value - 40;
    } else {
        return 80
    }
})

const m_asideSwitchStyle = computed<StyleValue>(() => {
    return { position:'fixed', 'left': asideSwitchPos.value + 'px' }
})


const currentAsideWidth = computed<number>(() => {
    if (isOpenAside.value) {
        return 200
    } else {
        return 0
    }
})

const m_asideStyle = computed<StyleValue>(() => {
    return { height: height.value + 'px', width: currentAsideWidth.value + 'px' }
})

const m_innerAsideStyle = computed<StyleValue>(() => {
    return { height: `calc(${height.value}px - var(--toolbar-height))` , width: '100%' }
})

const m_headerStyle= computed<StyleValue>(() => {
    return { height: 'var(--toolbar-height)', width: '100%' }
});

const m_innerMainStyle = computed<StyleValue>(() => {
    return { height: `calc(${height.value}px - var(--toolbar-height))`, width: '100%' }
})

const m_mainStyle = computed<StyleValue>(() => {
    return { height: height.value + 'px' }
});

const platform = 'darwin';

export function platformStyle() {
    if (platform == 'darwin') {
        return {
            asideStyle: m_asideStyle,
            headerStyle: m_headerStyle,
            innerMainStyle: m_innerMainStyle,
            mainStyle: m_mainStyle,
            innerAsideStyle: m_innerAsideStyle,
            asideSwitchStyle: m_asideSwitchStyle,
            toggleAside: toggleAside,
        }
    } else {
        // TODO: windows style
    }
}

export function platformSize() {
    if (platform == 'darwin') {
        return {
            asideWidth: currentAsideWidth
        }
    }
}