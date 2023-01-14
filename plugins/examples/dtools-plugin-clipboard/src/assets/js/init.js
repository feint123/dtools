import { initSqls, initTables } from "./db";

export function init() {
    const init_flag = localStorage.setItem("dtool_app_init", "true");
    if (null != init_flag && "true" === init_flag) {
        return;
    } else {
        // 创建数据表
        initTables(createSqls);
        localStorage.setItem(":dtool_app_init", "true");
    }
}

const createSqls = [
    `CREATE TABLE IF NOT EXISTS CLIPBOARD(
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    CONTENT TEXT NOT NULL,
    ADD_TIME VARCHAR(20) NOT NULL,
    CONTENT_MD5 VARCHAR(40) NOT NULL UNIQUE,
    CLIP_TYPE INTEGER NOT NULL
);`
]

document.addEventListener('mousedown', (e) => {
    if (e.target.hasAttribute('data-tauri-drag-region') && e.buttons === 1) {
        // prevents text cursor
        e.preventDefault()
        // start dragging if the element has a `tauri-drag-region` data attribute and maximize on double-clicking it
        window.__TAURI_INVOKE__('tauri', {
            __tauriModule: 'Window',
            message: {
                cmd: 'manage',
                data: {
                    cmd: {
                        type: e.detail === 2 ? '__toggleMaximize' : 'startDragging'
                    }
                }
            }
        })
    }
})


// var arr = document.getElementsByTagName("tr");
// var result = [];
// for (var index in arr) {
//     if (index > 0) {
//         var cols = arr[index].getElementsByTagName("td");
//         if (cols.length>7) {
//             result.push(`INSERT INTO COLOR(EN_NAME, CN_NAME, HEX_VAL, COLOR_TYPE, COLOR_TYPE_DESC) VALUES ("${cols[1].textContent}","${cols[6].textContent}","${cols[7].textContent}",1,"WEB颜色");`)
//         }
//     }
// }