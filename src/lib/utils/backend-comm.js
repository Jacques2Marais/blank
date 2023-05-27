import { invoke } from "@tauri-apps/api/tauri"

export default class BackendComm {
    /**
     * Request data from the backend
     */
    static async request(request, options = {}) {
        return await invoke(request, options);
    }
}