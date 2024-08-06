<script setup lang="ts">
import {ref, reactive, onMounted, nextTick} from "vue";
import {useHead} from "unhead";
import {definePageMeta} from "#imports";
import {type DropdownOption, NButton} from "naive-ui";
import * as apis from './apis'
import {size2Str} from "assets/utils/commons";
import FileIcon from './components/FileIcon.vue'
import Upload_file_dialog from "~/pages/user/files/dialogs/upload_file_dialog.vue";

const upload_file_dialog = ref()
const loading = ref(false)
const height = ref("400px")
const x = ref(0)
const y = ref(0)
const showDropdown = ref()
const columns = [
  {
    title: '',
    width: "40",
    render(row) {
      return h(FileIcon, {
        row: row
      })
    }
  },
  {title: '文件名称', key: 'fileName'},
  {title: '文件类型', key: 'fileType'},
  {
    title: '文件大小', render(row) {
      return size2Str(row.fileSize)
    }
  },
  {title: '创建时间', key: 'createTime'},
  {
    title: '操作',
    render(row) {
    }
  }
]
const tb_data = ref([{}])
const checkedRowKeys = ref([])
const pagination = reactive({
  page: 1, //受控模式下的当前页
  pageSize: 10, //受控模式下的分页大小,每一页的数据大小
  showSizePicker: true, //是否显示每页条数
  pageSizes: [10, 20, 50], //每页条数,可自定义
  showQuickJumper: true,
  pageCount: 0,
  itemCount: 0, //总条数
  prefix: () => { //分页前缀
    return '共 ' + pagination.itemCount + ' 项';
  },
  onChange: page => { //切换第几页时
    pagination.page = page;
    init();
  },
  onPageSizeChange: pageSize => {
    pagination.pageSize = pageSize;
    pagination.page = 1;
    init();
  },
});

const init = () => {

  loading.value = true
  height.value = `calc(100vh - ${document.querySelector(".n-card").clientHeight}px - 2rem - 6rem - 10rem)`;
  apis.load_files({
    current_page: pagination.page,
    page_size: pagination.pageSize,
    filePid: 0
  }).then(res => {
    loading.value = false
    tb_data.value = res.data.data.data
    pagination.itemCount = res.data.data.total
    if (tb_data.value.length == 0 && pagination.page != 1) {
      pagination.page--;
      init()
    }
  })
}

useHead({
  title: '致飞网盘｜我的文件',
})

definePageMeta({
  name: '我的文件',
  parent: null
});

const current_row = ref()

const options: DropdownOption[] = [
  {
    label: '下载',
    key: 'download'
  },
  {
    label: () => h('span', {style: {color: 'red'}}, '删除'),
    key: 'delete'
  }
]

const onClickoutside = () => {
  showDropdown.value = false
}

const handleSelect = (str) => {
  switch (str){
    case 'download':
      apis.download_file(current_row.value)
      break
    case 'delete':
      break
  }
  showDropdown.value = false
}

interface Song {
  no: number
  title: string
  length: string
}

const rowProps = (row) => {
  return {
    onContextmenu: (e) => {
      // window.$message.success(JSON.stringify(row, null, 2))
      e.preventDefault();
      showDropdown.value = false;
      current_row.value = row
      nextTick().then(() => {
        showDropdown.value = true;
        x.value = e.clientX;
        y.value = e.clientY;
      });
    }
  };
}

onMounted(() => {
  init()
})
</script>

<template>
  <div>
    <n-card id="active">
      <n-button style="margin-right: 1rem;" type="primary" @click="upload_file_dialog.dialog.show()">上传文件</n-button>
      <n-button type="primary">创建文件夹</n-button>
    </n-card>
    <n-card style="margin-top: 1rem;">
      <template #header>
        查询结果
      </template>
      <n-data-table
          :style="{ height: `${height}` }"
          flex-height
          :loading="loading"
          ref="tableRef"
          striped
          :columns="columns"
          :pagination="pagination"
          :bordered="false"
          :data="tb_data"
          :row-key="row => row.id"
          remote
          :row-props="rowProps"
          v-model:checked-row-keys="checkedRowKeys"
      >
      </n-data-table>
      <n-dropdown
          placement="bottom-start"
          trigger="manual"
          :x="x"
          :y="y"
          :options="options"
          :show="showDropdown"
          :on-clickoutside="onClickoutside"
          @select="handleSelect"
      />
    </n-card>
    <upload_file_dialog @upload_success="init()" ref="upload_file_dialog" />
  </div>
</template>

<style scoped>

</style>
