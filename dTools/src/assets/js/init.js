import { initSqls, initTables } from "./db";

export function init() {
    const init_flag = localStorage.getItem("dtool_app_init");
    if (null != init_flag && "true" === init_flag) {
        return;
    } else {
        // 创建数据表
        initTables(createSqls);
        // 初始化数据
        localStorage.setItem("dtool_app_init", "true");
    }
}

const createSqls = [
    `CREATE TABLE IF NOT EXISTS PLUGINS(
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        NAME VARCHAR(40) NOT NULL,
        AUTHOR VARCHAR(40) NOT NULL,
        IDENTIFIER VARCHAR(100) NOT NULL,
        REPOSITORY VARCHAR(200) NOT NULL,
        DESC VARCHAR(200) NOT NULL,
        MODE_FLAG INTEGER NOT NULL,
        SEARCHABLE INTEGER NOT NULL,
        VERSION VARCHAR(50) NOT NULL,
        INSTALL_FLAG INTEGER NOT NULL,
        CREATE_TIME TEXT NOT NULL,
        UPDATE_TIME TEXT NOT NULL);`,

    `CREATE TABLE IF NOT EXISTS PLUGIN_COMMANDS(
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        P_ID INTEGER NOT NULL,
        NAME VARCHAR(40) NOT NULL,
        EVENT VARCHAR(100) NOT NULL,
        ICON_NAME VARCHAR(100),
        CREATE_TIME TEXT NOT NULL,
        UPDATE_TIME TEXT NOT NULL);`
]