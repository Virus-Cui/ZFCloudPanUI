import {defineStore} from "pinia";
import {ref, type Ref, type UnwrapRef} from 'vue'

type DOWNLOAD_TASK = {
    file_id: string,
    file_name: string,
    percent: number,
    speed: number,
    total: number
}

export const useDownloadTaskStore = defineStore('useDownloadStore', () => {
    const task: Ref<UnwrapRef<DOWNLOAD_TASK[]>> = ref([])

    return {task}
})
