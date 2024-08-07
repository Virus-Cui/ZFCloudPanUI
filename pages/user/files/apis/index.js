import {service} from "assets/utils/request";
import {genQueryParam, send_msg, size2Str} from "assets/utils/commons";
import {useDownloadTaskStore} from "~/store/useDownloadTaskStore";
import * as msg from '@/assets/utils/message'
import {storeToRefs} from "pinia";
import {CancelToken} from "axios";

export const load_files = (data) => {
    return new Promise(r => {
        service.get(`/stream?${genQueryParam(data)}`).then(res => {
            r(res)
        })
    })
}

export const download_file = (file, loaded, onPercent, onComplete) => {
    let last = 0;
    let close_fun;
    service.get(`http://127.0.0.1:8080/stream/download_file?file_id=${file.fileId}&type=common`, {
        responseType: 'blob',
        cancelToken: new CancelToken(c=>{
            close_fun = c;
        }),
        onDownloadProgress: event => {
            let speed = event.loaded - last;
            last = event.loaded
            const percentCompleted = Math.round((event.loaded * 100) / event.total);
            let result = onPercent({percent: percentCompleted, downloaded: event.loaded, speed: speed});
            if(result == false){
                close_fun()
            }
        },
    }).then(res => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', file.fileName); // 指定下载文件名
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link); // 移除临时创建的链接
        onComplete(res.data.size)
    })
}

export const add_download_task = (row)=>{
    const downloading = storeToRefs(useDownloadTaskStore()).task;
    for (let i = 0; i < downloading.value.length; i++) {
        let ele = downloading.value[i]
        if(ele.file_id == row.fileId){
            msg.warn(`请勿重复添加任务`)
            return
        }
    }
    msg.success(`开始下载${row.fileName}, 可以在下载任务中查看`)
    downloading.value.push({
        file_id: row.fileId,
        file_name: row.fileName,
        percent: 0,
        speed: 0,
        total: 0
    })
    download_file(row, 0, percent=>{
        for (let i = 0; i < downloading.value.length; i++) {
            let ele = downloading.value[i]
            if(ele.file_id == row.fileId){
                if(ele.percent < percent.percent){
                    ele.percent = percent.percent
                    ele.speed = percent.speed
                    ele.total = percent.downloaded
                }
                return true
            }
        }
        return false;
    }, size=>{
        for (let i = 0; i < downloading.value.length; i++) {
            let ele = downloading.value[i]
            if(ele.file_id == row.fileId){
                ele.percent = 100
                ele.total = size
                send_msg(ele.file_name+'下载完成')
            }
        }
    })
}
