import { SqlExecuteData, SqlExecuteRequest, SqlLoadData, SqlLoadRequest } from 'dtools-api/dist/database';
import { DToolsIPC, DToolsRequest, DToolsResponse } from 'dtools-api/dist/ipc';
import { FsExistsRequest } from 'dtools-api/dist/fs';
import Database from 'tauri-plugin-sql-api';
import { invoke } from '@tauri-apps/api/tauri';
import { exists } from '@tauri-apps/api/fs';
window.onmessage = (event: MessageEvent) => {
    console.log("init: ",event.data);
    const post2 = event.ports[0];
    post2.onmessage = (e: MessageEvent<DToolsRequest<any>>) => {
        handleMessage(e).then((response: DToolsResponse<any>)=> {
            post2.postMessage(response)
        }).catch((err: any) => {
            post2.postMessage(new DToolsResponse(e.data.messageId, `${err}`, false, null));
        })
        
    }
}
/**
 * 处理插件容器中的消息
 * @param event 
 * @returns 
 */
function handleMessage(event: MessageEvent<DToolsRequest<any>>): Promise<any> {
    if (event.data.api === "sql") {
        return handleDatabase(event.data.messageId, event.data.fn, event.data.params);
    } else if (event.data.api === "invoke") {
        return handleInvoke(event.data.messageId, event.data.fn, event.data.params);
    } else if (event.data.api === "fs") {
        return handleFs(event.data.messageId, event.data.fn, event.data.params);
    } else{
        return new Promise<any>((resolve, reject) => {
            reject("unsupported api");
        });
    }
}

function defaultResponse(messageId: string) {
    return new DToolsResponse(messageId, "unsupported", false, null);
}

async function handleInvoke(messageId: string, fn: string, request: any): Promise<DToolsResponse<any>> {
    const result = await invoke(fn, request);
    return new DToolsResponse(messageId, "", true, result);
}

async function handleDatabase(messageId: string, fn: string, request: any): Promise<DToolsResponse<any>> {
    if (fn === "load") {
        await Database.load((<SqlLoadRequest>request).path)
        return new DToolsResponse(messageId, "", true, new SqlLoadData("1234"));
    } else if (fn === "execute") {
        const result = await Database.get((<SqlExecuteRequest>request).path)
            .execute((<SqlExecuteRequest>request).query, (<SqlExecuteRequest>request).bindValues);
        return new DToolsResponse(messageId, "", true, new SqlExecuteData(result.rowsAffected, result.lastInsertId));
    } else if (fn === "select") {
        const result = await Database.get((<SqlExecuteRequest>request).path)
            .select((<SqlExecuteRequest>request).query, (<SqlExecuteRequest>request).bindValues);
        return new DToolsResponse(messageId, "", true, result);
    } else {
        return defaultResponse(messageId);
    }
} 

async function handleFs(messageId: string, fn: string, request: any): Promise<DToolsResponse<any>> {
    if (fn === "exists") {
        const result = await exists((<FsExistsRequest> request).path, (<FsExistsRequest> request).options)
        return new DToolsResponse(messageId, "", true, result);
    } else {
        return defaultResponse(messageId);
    }
}

export function dToolsIPC(): DToolsIPC {
    return new DToolsIPC(window);
}