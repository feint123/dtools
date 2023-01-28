
import { ElMessage } from 'element-plus';
import { writeClipboard } from 'dtools-api/dist/clipboard';


export async function copied(content) {
    try {
        await writeClipboard(1, content);
        ElMessage({
            message: `复制成功: ${content}`,
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