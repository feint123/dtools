
import { ElMessage } from 'element-plus';
import { checkClipExsits, updateCLipAddTimeByMd5, insertClip } from './db';
import { useDateFormat } from "@vueuse/shared";
import { readClipboard, writeClipboard } from 'dtools-api/dist/clipboard';
import { useArrayFind } from "@vueuse/shared";
import { exists } from 'dtools-api/dist/fs';
import { convertFileSrc } from 'dtools-api/dist/ipc';

const clipLockKey = "current_cb_md5"

// export async function mousePosition() {
//     const pos = await invoke("mouse_position", {});
//     return pos;
// }

export async function paste() {
    const cMd5 = localStorage.getItem(clipLockKey);
    const clipboard = await readClipboard();
    if (clipboard.clipType == 1) {
        return {
            content: clipboard.textContent,
            type: clipboard.clipType,
            md5: clipboard.contentMd5,
        }
    } else if (clipboard.clipType == 2) {
        // console.log(clipboard.image_content.length);
        return {
            content: clipboard.filePath,
            type: clipboard.clipType,
            md5: clipboard.contentMd5,
        }
    } else {
        return {
            content: "",
            type: -1,
            md5: ""
        }
    }
}

export function insertClipContent(content, md5, clipType, handleFunc) {

    if (content == null || content.length == 0) {
        handleFunc(false);
    } else {
        if (md5 == localStorage.getItem(clipLockKey)) {
            handleFunc(false);
        } else {
            checkClipExsits(md5, (exists) => {
                // console.log("feint-debug: exsits" + exists);
                if (exists) {
                    updateCLipAddTimeByMd5(md5, useDateFormat(new Date().getTime(), 'YYYY-MM-DD HH:mm:ss').value, (res) => {
                        handleFunc(true);
                    })
                } else {
                    insertClip({
                        content: content,
                        addTime: useDateFormat(new Date().getTime(), 'YYYY-MM-DD HH:mm:ss').value,
                        md5: md5,
                        clipType: clipType,
                    }, (res) => {
                        handleFunc(true);
                    })
                }
                localStorage.setItem(clipLockKey, md5);

            })
        }
    }
}

export function insertToClipArr(result, arrRef) {
    result.forEach((row, index, arr) => {
        if (row.CLIP_TYPE == 2) {
            exists(row.CONTENT).then((result) => {
                if (result) {
                    // readBinaryFile(row.CONTENT).then((content) => {
                    //     var imgUrl = URL.createObjectURL(
                    //         new Blob([content.buffer], { type: 'image/png' })
                    //     );
                    //     content = null;
                    //     useArrayFind(arrRef, val => val.id == row.ID).value.imgUrl = imgUrl;
                    // });
                    const assetUrl = convertFileSrc(row.CONTENT);
                    useArrayFind(arrRef, val => val.id == row.ID).value.imgUrl = assetUrl;
                }
            })
        }
        arrRef.value.unshift({
            timestamp: row.ADD_TIME,
            content: row.CONTENT,
            type: row.CLIP_TYPE,
            imgUrl: "",
            id: row.ID
        })
    })
}

export async function copied(content, type, showContent=false) {
    try {
        writeClipboard(type, content);
        ElMessage({
            message: "复制成功" + (showContent ? `: ${content}`: ""),
            grouping: true,
            type: "success",
        });
    } catch (e) {
        ElMessage({
            message: "失败: " + e,
            type: "error",
            grouping: true
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

