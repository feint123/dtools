import { register, isRegistered } from '@tauri-apps/api/globalShortcut';
import { WebviewWindow, LogicalPosition} from '@tauri-apps/api/window';
import { mousePosition } from './tools';
const shortKeys = [
{
    key: 'Option+Space',
    action: async () => {
        const spotlight_window = WebviewWindow.getByLabel('spotlight');
        if(null != spotlight_window) {
            spotlight_window.show();
            spotlight_window.setFocus();
        }
    }
}]

export async function shortcuts() {
    shortKeys.forEach(async (row, index, arr) => {
        const isReg = await isRegistered(row.key);
        if (!isReg) {
            await register(row.key, row.action);
        }
    })

}