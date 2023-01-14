import { open } from '@tauri-apps/api/dialog';
import { emit } from '@tauri-apps/api/event';
import { BaseDirectory, copyFile, readDir, createDir, removeDir, readTextFile } from '@tauri-apps/api/fs'
import { compile } from 'vue';
import {
    insertPlugin, deletePlugin, selectPluginUnique, selectPluginByNameAndIdentifier,
    create, insertCommand, deleteCommand,
} from "./db";
import { dToolsEvent } from "./events";

export function importPluginFromLocal() {
    open({
        directory: true,
        multiple: false,
    }).then(selected => {
        if (null != selected) {
            readDir(selected, { recursive: true }).then((files) => {
                const fileMap = {}
                for (const file of files) {
                    fileMap[file.name] = file
                }
                // 获取配置文件
                const configFile = fileMap['dtools.json'];
                if (configFile != null) {
                    // 读取配置文件内容
                    readTextFile(configFile.path).then((text) => {
                        // 解析配置文件
                        const config = resolveConfig(text);
                        // 校验插件目录接口合法性
                        const checkReuslt = checkPluginStruct(fileMap, config);
                        if (checkReuslt != null) {
                            // 发送失败通知
                            sendError(checkReuslt)
                            return;
                        }
                        // 判断当前插件唯一性
                        selectPluginUnique(config).then(result => {
                            if (result.length > 0) {
                                sendError("插件已存在，请勿重复安装")
                                return;
                            }
                            // 转移文件
                            transferFiles(fileMap, config).then(() => {
                                // 数据入库
                                savePluginMetadata(config);
                            }).catch((err) => {
                                console.error(err);
                                sendError('无法初始化')
                            });
                        }).catch((e) => {
                            console.error(e);
                        })
                    }).catch((e) => {
                        sendError('无法读取配置文件')
                    });
                } else {
                    sendError('配置文件不存在')
                }
            }).catch((e) => {
                sendError('无法读取插件目录')
            });
        }
    });
}
/**
 * 发送错误消息
 * @param {*} errorMsg 
 */
function sendError(errorMsg) {
    emit(dToolsEvent.PLUGIN_INSTALL, { 'success': false, 'msg': `插件安装失败: ${errorMsg}` });
}

function sendSuccess(name) {
    emit(dToolsEvent.PLUGIN_INSTALL, { 'success': true, 'msg': `插件 ${name} 安装成功` })
}


/**
 * 将json文本转换成javascript对象
 * @param {*} fileContent 
 * @returns 
 */
function resolveConfig(fileContent) {
    try {
        return JSON.parse(fileContent);
    } catch (e) {
        console.log(e);
        return null;
    }
}

/**
 * todo 校验配置文件格式
 * @param {*} config 
 */
function checkConfig(config) {
    if (config != null) {

    }
}

/**
 * 校验插件目录结构是否正确
 * @param {*} fileMap 
 * @param {*} config 
 * @returns 
 */
function checkPluginStruct(fileMap, config) {
    const checkReuslt = checkConfig(config);
    if (checkReuslt == null) {
        if (fileMap['icon.png'] == null) {
            return "缺少文件[icon.png]";
        }
        if (fileMap['src'] == null) {
            return "缺少目录[src]";
        } else {
            const srcSubFiles = fileMap['src'].children;
            if (null == srcSubFiles) {
                return "src目录文件缺失";
            } else {
                const subFileMap = {}
                for (const file of srcSubFiles) {
                    subFileMap[file.name] = file
                }
                const supportModes = config['support-modes'];
                if (subFileMap[`window.js`] == null || subFileMap[`window.js`] == null) {
                    return `缺少文件[${mode}.js/css]`;
                }
            }
        }
        // todo 校验command icon 文件
        return null;
    } else {
        return `配置文件格式不正确: ${checkReuslt}`;
    }
}

/**
 * 卸载插件
 * @param {*} pluginMetadata 
 */
export function uninstallPlugin(pluginMetadata) {
    // 删除游戏目录，
    removeDir(`plugins/${pluginMetadata.identifier}/${encodeURI(pluginMetadata.name)}`, { dir: BaseDirectory.AppData, recursive: true }).then(() => {
        // 删除db中的记录，
        deletePlugin(pluginMetadata.id).then(() => {
            // 删除插件的指令，如果有的话
            deleteCommand(pluginMetadata.id);
            emit('plugin-uninstall', { 'success': true, 'msg': '插件卸载成功' })
        }).catch(err => {
            emit('plugin-uninstall', { 'success': false, 'msg': '插件卸载失败' })
        })
    }).catch(err => {
        console.error(err);
        emit('plugin-uninstall', { 'success': false, 'msg': '插件卸载失败' })
    });
}

/**
 * 迁移文件到置顶目录
 * @param {*} fileMap 
 * @param {*} config 
 */
async function transferFiles(fileMap, config) {
    const srcPath = `plugins/${config.identifier}/${encodeURI(config.name)}/${config.version}`;
    const iconPath = `plugins/${config.identifier}/${encodeURI(config.name)}`;
    await createDir(srcPath, { dir: BaseDirectory.AppData, recursive: true });
    await createDir(iconPath, { dir: BaseDirectory.AppData, recursive: true });
    // 复制src文件
    for (const file of fileMap['src'].children) {
        await copyFile(`${file.path}`, `${srcPath}/${file.name}`, { dir: BaseDirectory.AppData });
    }
    // todo 复制asset文件

    // 复制icon文件
    const iconFile = fileMap['icon.png'];
    await copyFile(`${iconFile.path}`, `${iconPath}/${iconFile.name}`, { dir: BaseDirectory.AppData });
}
// 窗口模式
const MODE_WINDOW = 1;
// 命令模式
const MODE_COMMAND = 2;
function savePluginMetadata(config) {
    var modeFlag = 0;
    const supportModes = config['support-modes'];
    for (const mode of supportModes) {
        if (mode === 'window') {
            modeFlag += MODE_WINDOW;
        }
        if (mode === 'command') {
            modeFlag += MODE_COMMAND;
        }
    }
    // 插件存在历史版本
    selectPluginByNameAndIdentifier(config.name, config.identifier).then((result) => {
        if (result.length > 0) {
            // 删除旧记录
            deletePlugin(result[0].ID);
        }
        // plugin元数据
        const metadata = {
            name: config.name,
            author: config.author,
            desc: config.desc,
            searchable: config.searchable ? 1 : 0,
            repository: config.repository,
            version: config.version,
            installFlag: 1,
            modeFlag: modeFlag,
            identifier: config.identifier
        };
        // 设置一些初始属性createTime、updateTime等等
        create(metadata);
        insertPlugin(metadata, () => {
            if ((modeFlag | MODE_COMMAND) == MODE_COMMAND) {
                // 插入command数据
                saveCommandMetadata(config).then(() => {
                    sendSuccess(metadata.name);
                }).catch(err => {
                    console.error(err);
                    sendError('无法初始化');
                })
            } else {
                sendSuccess(metadata.name)
            }
        }, (e) => {
            // 回滚操作
            // 发送错误通知
            console.error(e);
            sendError('无法初始化');
        });
    }).catch(e => {
        console.error(e);
        sendError('无法初始化');
    })
}
/**
 * 保存命令元数据
 * @param {*} config 
 * @returns 
 */
function saveCommandMetadata(config) {
    return new Promise((resolve, reject) => {
        selectPluginUnique(config).then((result) => {
            if (result.length > 0) {
                const pId = result[0].ID;
                try {
                    for (const command of config.commands) {
                        const metadata = {
                            name: command.name,
                            iconName: command.icon,
                            event: command.event,
                            pId: pId,
                        };
                        create(metadata);
                        insertCommand(metadata);
                    }
                    resolve(1);
                } catch (e) {
                    reject(e);
                }
            }
        }).catch(e => {
            reject(e);
        })
    });
}