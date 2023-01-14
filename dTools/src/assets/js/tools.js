
import { ElMessage } from 'element-plus';
import { invoke } from '@tauri-apps/api/tauri';
import { appWindow } from '@tauri-apps/api/window'

const clipLockKey = appWindow.label + ":current_cb_md5"

export async function mousePosition() {
    const pos = await invoke("mouse_position", {});
    return pos;
}

export async function paste() {
    const cMd5 = localStorage.getItem(clipLockKey);
    const clipboard = await invoke('read_clipboard', { currentMd5: cMd5 == null ? "" : cMd5 });
    if (clipboard.clip_type == 1) {
        return {
            content: clipboard.text_content,
            type: clipboard.clip_type,
            md5: clipboard.content_md5,
        }
    } else if (clipboard.clip_type == 2) {
        // console.log(clipboard.image_content.length);
        return {
            content: clipboard.file_path,
            type: clipboard.clip_type,
            md5: clipboard.content_md5,
        }
    } else {
        return {
            content: "",
            type: -1,
            md5: ""
        }
    }
}

export async function copied(content, type, showContent=false) {
    try {
        await invoke('write_clipboard', { content: content, clipType: type });
        ElMessage({
            message: "复制成功" + (showContent ? `: ${content}`: ""),
            grouping: true,
            type: "success",
            offset: 60,
        });
    } catch (e) {
        ElMessage({
            message: "失败: " + e,
            type: "error",
            grouping: true,
            offset: 60
        })
    }
}

export function isColor(colorStr) {
    var s = new Option().style;
    s.color = colorStr;
    const hasColor = s.color !== '';
    s = null;
    if (hasColor) {
        return /^rgb/.test(colorStr) || /^hsl/.test(colorStr) || /(^#[0-9A-Fa-f]{6}$)|(^#[0-9A-Fa-f]{3}$)/.test(colorStr);
    } else {
        return false;
    }
}

export function perferColor(hexColor) {
    return hexColor=='#808080' ? '#797979': hexColor
}

