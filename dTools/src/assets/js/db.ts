import Database,{QueryResult} from 'tauri-plugin-sql-api';
import { useDateFormat } from '@vueuse/shared';

// 测试阶段暂定为test.db
const dbName = "test.db";

/**
 * @typedef {Database} 
 */

var db = Database.load(`sqlite:${dbName}`);


export function closeDb() {
    db.then((database) => {
        database.close(dbName);
    })
}

export async function initTables(createSqls:string[]) {
    const database = await db;
    for (var index in createSqls) {
        database.execute(createSqls[index])
    }
}

export async function initSqls(tableName: string, insertSqls: string[]) {
    const database = await db;
    await database.execute(`DELETE FROM ${tableName} WHERE 1=1;`);
    for (var index in insertSqls) {
        database.execute(insertSqls[index])
    }
}

class BaseEntity {
    createTime?: string;
    updateTime?: string;
}

export function create(data:BaseEntity) {
    const currentData = useDateFormat(new Date().getTime(), 'YYYY-MM-DD HH:mm:ss').value;
    data.createTime = currentData;
    data.updateTime = currentData;
}

export function update(data:BaseEntity) {
    const currentData = useDateFormat(new Date().getTime(), 'YYYY-MM-DD HH:mm:ss').value;
    data.updateTime = currentData;
}

//-------------------PLUGIN---------------------//

export class PluginMetadata extends BaseEntity {
    id?: string|number;
    name!: string;
    author!: string;
    identifier!: string;
    repository!: string;
    desc!: string;
    modeFlag!: number;
    searchable!: number;
    installFlag!: number;
    version!: string;
}

export class PluginEntity {
    ID!: string|number;
    NAME!: string;
    AUTHOR!: string;
    IDENTIFIER!: string;
    REPOSITORY!: string;
    DESC!: string;
    MODE_FLAG!: number;
    SEARCHABLE!: number;
    INSTALL_FLAG!: number;
    VERSION!: string;
    CREATE_TIME!: string;
    UPDATE_TIME!: string;
}

// todo 更改为使用 promise
export function insertPlugin(pluginMetadata: PluginMetadata) {
    return new Promise((resolve, reject) => {
        db.then((database) => {
            database.execute(`INSERT INTO PLUGINS(NAME, AUTHOR, IDENTIFIER, REPOSITORY, DESC, MODE_FLAG, SEARCHABLE, INSTALL_FLAG, VERSION, CREATE_TIME, UPDATE_TIME) 
            VALUES ($1,$2,$3, $4, $5, $6, $7, $8, $9, $10, $11);`,
                [pluginMetadata.name, pluginMetadata.author, pluginMetadata.identifier,
                pluginMetadata.repository, pluginMetadata.desc, pluginMetadata.modeFlag,
                pluginMetadata.searchable, pluginMetadata.installFlag, pluginMetadata.version,
                pluginMetadata.createTime, pluginMetadata.updateTime]).then((result) => {
                    resolve(result);
                }).catch((e) => {
                    reject(e);
                })
        }).catch((e) => {
            reject(e);
        })
    });
    
}
// todo 更改为使用 promise
export function deletePlugin(pluginId: string|number) {
    return new Promise((resolve, reject) => {
        db.then((database) => {
            database.execute('DELETE FROM PLUGINS WHERE ID=$1;', [pluginId]).then((result) => {
                resolve(result);
            }).catch((e) => {
                reject(e);
            })
        }).catch((e) => {
            reject(e);
        })
    })
}
// todo 更改为使用 promise
export function selectLocalWindowPlugin():Promise<PluginEntity[]> {
    return new Promise((resolve, reject) => {
        db.then((database) => {
            database.select<PluginEntity[]>('SELECT * FROM PLUGINS WHERE INSTALL_FLAG = 1;').then((result) => {
                console.log(result);
                if (result.length > 0) {
                    resolve(result);
                }
            }).catch((e) => {
                reject(e);
            })
        }).catch((e) => {
            reject(e);
        })
    });
}

export function selectPluginsById(pId: string|number) {
    return new Promise((resolve, reject) => {
        db.then((database) => {
            database.select<PluginEntity[]>(`SELECT * FROM PLUGINS WHERE ID = $1 AND INSTALL_FLAG = 1;`,[pId]).then((result) => {
                if (result.length > 0) {
                    resolve(result);
                }
            }).catch((e) => {
                reject(e);
            })
        }).catch((e) => {
            reject(e);
        })
    });
}

export function selectPluginsByName(pName: string) {
    return new Promise((resolve, reject) => {
        db.then((database) => {
            database.select<PluginEntity[]>(`SELECT * FROM PLUGINS WHERE NAME like '%${pName}%' AND INSTALL_FLAG = 1;`).then((result) => {
                if (result.length > 0) {
                    resolve(result);
                }
            }).catch((e) => {
                reject(e);
            })
        }).catch((e) => {
            reject(e);
        })
    });
}

export function selectPluginUnique(pluginMetadata: PluginMetadata): Promise<PluginEntity[]> {
    return new Promise((resolve, reject) => {
        db.then((database) => {
            database.select<PluginEntity[]>(`SELECT * FROM PLUGINS WHERE NAME = $1 AND VERSION = $2 AND IDENTIFIER = $3`,
                [pluginMetadata.name, pluginMetadata.version, pluginMetadata.identifier]).then((result) => {
                    // console.log(result)
                    resolve(result);
                }).catch((e) => {
                    reject(e);
                })
        }).catch((e) => {
            reject(e);
        })
    });
}

export function selectPluginByNameAndIdentifier(name: string, identifier: string): Promise<PluginEntity[]> {
    return new Promise((resolve, reject) => {
        db.then((database) => {
            database.select<PluginEntity[]>(`SELECT * FROM PLUGINS WHERE NAME = $1 AND IDENTIFIER = $2`,
                [name, identifier]).then((result) => {
                    resolve(result);
                }).catch((e) => {
                    reject(e);
                })
        }).catch((e) => {
            reject(e);
        })
    });
}

//-------------------PLUGIN_COMMAND---------------------//
export class CommandMetadata extends BaseEntity {
    name!: string;
    pId!: string | number;
    event!: string;
    iconName!: string;
}
export function insertCommand(commandMetadata:CommandMetadata) {
    return new Promise((resolve, reject) => {
        db.then((database) => {
            database.execute(`INSERT INTO PLUGIN_COMMANDS(NAME, P_ID, EVENT, ICON_NAME, CREATE_TIME, UPDATE_TIME) 
        VALUES ($1,$2,$3, $4, $5, $6);`,
                [commandMetadata.name, commandMetadata.pId, commandMetadata.event, commandMetadata.iconName,
                commandMetadata.createTime, commandMetadata.updateTime]).then((result) => {
                    resolve(result);
                }).catch((e) => {
                    reject(e);
                })
        }).catch((e) => {
            reject(e);
        })
    });
}

export function deleteCommand(pluginId: string|number) {
    return new Promise((resolve, reject) => {
        db.then((database) => {
            database.execute('DELETE FROM PLUGIN_COMMANDS WHERE P_ID=$1;', [pluginId]).then((result) => {
                resolve(result);
            }).catch((e) => {
                reject(e);
            })
        }).catch((e) => {
            reject(e);
        })
    })
}

export function selectCommand(topn: number) {
    return new Promise((resolve, reject) => {
        db.then((database) => {
            database.select<CommandMetadata[]>('SELECT * FROM PLUGIN_COMMANDS ORDER BY CREATE_TIME limit $1',[topn]).then((result) => {
                if(result.length > 0) {
                    resolve(result);
                }
            }).catch((e) => {
                reject(e);
            })
        }).catch((e) => {
            reject(e);
        })
    })
}