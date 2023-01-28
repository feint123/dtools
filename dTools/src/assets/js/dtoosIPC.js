import { SqlExecuteData, SqlLoadData } from 'dtools-api/dist/database';
import { DToolsIPC, DToolsResponse } from 'dtools-api/dist/ipc';
import Database from 'tauri-plugin-sql-api';
import { invoke } from '@tauri-apps/api/tauri';
import { exists } from '@tauri-apps/api/fs';
window.onmessage = (event) => {
    console.log("init: ", event.data);
    const post2 = event.ports[0];
    post2.onmessage = (e) => {
        handleMessage(e).then((response) => {
            post2.postMessage(response);
        }).catch((err) => {
            post2.postMessage(new DToolsResponse(e.data.messageId, `${err}`, false, null));
        });
    };
};
/**
 * 处理插件容器中的消息
 * @param event
 * @returns
 */
function handleMessage(event) {
    if (event.data.api === "sql") {
        return handleDatabase(event.data.messageId, event.data.fn, event.data.params);
    }
    else if (event.data.api === "invoke") {
        return handleInvoke(event.data.messageId, event.data.fn, event.data.params);
    }
    else if (event.data.api === "fs") {
        return handleFs(event.data.messageId, event.data.fn, event.data.params);
    }
    else {
        return new Promise((resolve, reject) => {
            reject("unsupported api");
        });
    }
}
function defaultResponse(messageId) {
    return new DToolsResponse(messageId, "unsupported", false, null);
}
async function handleInvoke(messageId, fn, request) {
    const result = await invoke(fn, request);
    return new DToolsResponse(messageId, "", true, result);
}
async function handleDatabase(messageId, fn, request) {
    if (fn === "load") {
        await Database.load(request.path);
        return new DToolsResponse(messageId, "", true, new SqlLoadData("1234"));
    }
    else if (fn === "execute") {
        const result = await Database.get(request.path)
            .execute(request.query, request.bindValues);
        return new DToolsResponse(messageId, "", true, new SqlExecuteData(result.rowsAffected, result.lastInsertId));
    }
    else if (fn === "select") {
        const result = await Database.get(request.path)
            .select(request.query, request.bindValues);
        return new DToolsResponse(messageId, "", true, result);
    }
    else {
        return defaultResponse(messageId);
    }
}
async function handleFs(messageId, fn, request) {
    if (fn === "exists") {
        const result = await exists(request.path, request.options);
        return new DToolsResponse(messageId, "", true, result);
    }
    else {
        return defaultResponse(messageId);
    }
}
export function dToolsIPC() {
    return new DToolsIPC(window);
}
