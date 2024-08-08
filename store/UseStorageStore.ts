import {defineStore} from "pinia";

export const useStorageStore = defineStore('useStoreStorage', () => {
    const data = ref()

    return {data}
})
