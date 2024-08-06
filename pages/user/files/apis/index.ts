import {service} from "assets/utils/request";
import {genQueryParam} from "assets/utils/commons";
import fileDownload from 'js-file-download';

export const load_files = (data) => {
    return new Promise(r => {
        service.get(`/stream?${genQueryParam(data)}`).then(res => {
            r(res)
        })
    })
}

export const download_file = (file)=>{
    service.post(`/stream/download_file?file_id=${file.fileId}&type=common`,{responseType:'blob'}).then(res => {
        console.log(res)
        const blob = new Blob([res.data]);//处理文档流
        const fileName = '资产列表.xlsx';
        const elink = document.createElement('a');
        elink.download = fileName;
        elink.style.display = 'none';
        elink.href = URL.createObjectURL(blob);
        document.body.appendChild(elink);
        elink.click();
        URL.revokeObjectURL(elink.href); // 释放URL 对象
        document.body.removeChild(elink);
    })
}
