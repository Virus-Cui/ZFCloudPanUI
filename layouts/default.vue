<script setup>
import {h, ref, onMounted, watch} from "vue";
import {
  NIcon,
  darkTheme,
  useOsTheme,
  NConfigProvider,
  useLoadingBar,
  useMessage,
  useDialog,
  useNotification
} from "naive-ui";

import {HddOutlined} from '@vicons/antd'
import swBtn from '@/components/switch.vue'
import text from '~/components/logo-text.vue'
import {useRouter, useRoute} from "#app";
import LogoSmall from "~/components/logo-small.vue";
import {gen_router_paths} from "assets/utils/utils.js";
import NuxtLink from "#app/components/nuxt-link.js";
import {theme} from '~/assets/config/theme'
import {renderIcon} from "assets/utils/icons.js";
import {useUserStore} from "~/store/UseUserStore";
import {useDownloadTaskStore} from "~/store/UseDownloadTaskStore";
import {useStorageStore} from "~/store/UseStorageStore";
import {storeToRefs} from "pinia";
import * as auth_api from '~/layouts/apis'
import {CloseOutlined} from '@vicons/antd'
import {creatWebSocket} from '@/assets/utils/websocket'
import {size2Str} from "../assets/utils/commons.js";
import {get_user_storage} from "~/layouts/apis";

const links = ref([])
const user = storeToRefs(useUserStore()).user_info
const download_tasks = storeToRefs(useDownloadTaskStore()).task
const storage = storeToRefs(useStorageStore()).data
const loading = ref(true)
const router = useRouter();
const percent = ref(0)
const path = ref()
const loadingBar = useLoadingBar();
const options = [
  {
    label: '退出登陆',
    key: 'logout',
    disabled: false
  }
]
// 设置前置路由守卫
router.beforeEach((to, from, next) => {
  // 路由中导入-开始
  loadingBar.start()
  next()
})
// 设置后置路由守卫
router.afterEach((to, from, next) => {
  // 路由中导入-结束
  loadingBar.finish()
})


const themeOverrides = theme
const dark = ref()
const header = {
  label:
      () => h(NuxtLink, {
        to: '/'
      }, renderIcon(text)),
  icon: renderIcon(LogoSmall)
}
const menuOptions = ref([])

const collapsed = ref(false)
let interval = ref()


watch(() => router.currentRoute.value, () => {
  setTimeout(() => {
    path.value = router.currentRoute.value.fullPath
  }, 100)
})

const set_item = () => {
  if (router.currentRoute.value.fullPath == '/') {
    return;
  }
  for (let j = 0; j < links.value.length; j++) {
    let item = links.value[j]
    item.checked = false
  }
  for (let i = 0; i < links.value.length; i++) {
    let element = links.value[i]
    if (element.path == router.currentRoute.value.fullPath) {
      element.checked = true
      return
    }
  }
  links.value.push({
    title: router.currentRoute.value.meta.name,
    path: router.currentRoute.value.fullPath,
    checked: true
  })
}

watch(() => router.currentRoute.value, () => {
  set_item()
})

const handleSelect = (key) => {
  switch (key) {
    case 'logout':
      auth_api.logout()
      break
  }
}

const getStorage = () => {
  percent.value = ((storage.value?.used_storage / storage.value?.total_storage) * 100).toFixed(2);
}

watch(() => storage.value, () => {
  percent.value = ((storage.value?.used_storage / storage.value?.total_storage) * 100).toFixed(2);
})

const init = async () => {
  loading.value = true
  get_user_storage().then(res => {
    getStorage()
  })
  if (process.client) {
    loadingBar.start()
    path.value = router.currentRoute.value.fullPath
  }
  if (user.value == undefined) {
    auth_api.logout()
    return
  }
  let genRouterPaths = await gen_router_paths(user.value.menus);
  genRouterPaths.unshift(header)
  menuOptions.value = genRouterPaths
  loading.value = false
  interval.value = setInterval(() => {
    if (useOsTheme().value == 'dark') {
      dark.value = darkTheme
    } else {
      dark.value = undefined
    }
  }, 100)
  if (process.client) {
    loadingBar.finish()
  }
}

const init_ws = async () => {
  creatWebSocket(`ws://127.0.0.1:8080/wsInterface/${user.value.token}`)
}

onMounted(async () => {
  $mount()
  await init()
  await init_ws()
})


const $mount = () => {
  if (process.client) {
    window.$message = useMessage()
    window.$dialog = useDialog()
    window.$notify = useNotification()
    set_item()
    let interval = setInterval(() => {
      var elementById = document.getElementById('space');
      if (elementById != null) {
        clearInterval(interval)
        document.getElementById('space').addEventListener('wheel', (event) => {
          event.preventDefault();
          document.getElementById('space').scrollBy({
            left: event.deltaY < 0 ? -30 : 30,  // >0 是下滑，<0是上滑
          });
        });
      }
    }, 100)

  }
}

const changeTheme = (mode) => {
  clearInterval(interval.value)
  if (mode.mode) {
    dark.value = darkTheme
  } else {
    dark.value = undefined
  }
}

const change = (e) => {
  if (process.client) {
    localStorage.setItem('path', e.target.innerText)
  }
}

const cancel_download = (id) => {
  for (let i = 0; i < download_tasks.value.length; i++) {
    let ele = download_tasks.value[i]
    if (ele.file_id == id) {
      download_tasks.value = download_tasks.value.filter(item => item !== ele);
    }
  }
}

</script>

<template>
  <ClientOnly>
    <n-config-provider :theme="dark" :theme-overrides="themeOverrides">
      <n-layout has-sider>
        <n-layout-sider
            bordered
            collapse-mode="width"
            :collapsed-width="64"
            width="240px"
            style="height: 100vh"
            :collapsed="collapsed"
            show-trigger="bar"
            @collapse="collapsed = true"
            @expand="collapsed = false"
        >
          <div
              style="display: flex;height: 100vh; width: 100%;  justify-content: space-between;flex-direction: column;">
            <n-skeleton v-if="loading" :width="'100%'" :height="'100%'" size="medium"/>
            <n-menu
                v-else
                v-model:value="path"
                :collapsed="collapsed"
                :collapsed-width="64"
                :collapsed-icon-size="22"
                :options="menuOptions"
                @click="change"
            />
            <div
                :style="{'position': 'relative', 'z-index': '999', 'height': collapsed?'5rem':'6rem'}" class="admin">
              <div v-if="!collapsed"
                   style="display: flex;justify-content: left;align-items: center;width: 100%;flex-wrap: wrap">
                <div style="margin: 0 1rem">
                  <n-dropdown trigger="hover" :options="options" @select="handleSelect">
                    <n-avatar src="https://q1.qlogo.cn/g?b=qq&nk=2437916756&s=640"></n-avatar>
                  </n-dropdown>
                </div>
                <div>
                  {{ user?.username }}
                </div>
                <div style="width: 100%;padding: 0 1rem;display: flex;justify-content: start">
                  <n-tag round :bordered="false" type="success" size="small">
                    剩余空间：{{ size2Str(storage?.total_storage - storage?.used_storage) }}
                    <template #icon>
                      <n-icon>
                        <HddOutlined></HddOutlined>
                      </n-icon>
                    </template>
                  </n-tag>
                </div>
                <div style="width: 100%;padding: 0 1rem">
                  <n-progress
                      style="width: 100%"
                      type="line"
                      :percentage="percent"
                  />
                </div>
              </div>
              <div v-else style="margin-left: 1rem" class="small">
                <n-avatar src="https://q1.qlogo.cn/g?b=qq&nk=2437916756&s=640"></n-avatar>
                <n-progress
                    style="width: 30px;height: 30px;font-size: .2rem"
                    type="circle"
                    :percentage="percent"
                />
              </div>
            </div>
          </div>
        </n-layout-sider>
        <n-layout>
          <n-layout-header bordered style="height: 3rem;display: flex;align-items: center;padding: 0 1rem">
            <div style="display: flex;justify-content: space-between;align-items: center;width: 100%">
              <div>
                <Bread/>
              </div>
              <div style="flex-direction: row;display: flex;">
                <div style="margin-right: 1rem;">
                  <n-popover style="width: 400px;" trigger="click">
                    <template #trigger>
                      <n-badge :value="download_tasks.length">
                        <i style="font-size: 1.2rem;cursor: pointer" class="iconfont icon-download"></i>
                      </n-badge>
                    </template>
                    <template #header>
                      <div
                          style="display: flex;justify-content: center;align-items: center;font-size: 1.2rem;font-weight: 800;">
                        下载任务 {{ storage }}
                      </div>
                    </template>
                    <!--                    {{download_tasks}}-->
                    <n-scrollbar style="max-height: 300px">
                      <n-empty v-if="download_tasks.length == 0" description="当前没有下载任务">
                        <template #extra>

                        </template>
                      </n-empty>
                      <div v-else v-for="item in download_tasks"
                           style="border: 1px solid #dfdfdf;padding: .5rem;border-radius: 4px;margin: .5rem 0">
                        <div style="display: flex;justify-content: space-between">
                          <div>{{ item.file_name }}</div>
                          <div @click="cancel_download(item.file_id)" class="close-btn"><i
                              class="iconfont icon-close"></i></div>
                        </div>
                        <n-progress :show-indicator="false" type="line" :percentage="item.percent"
                                    :processing="item.percent != 100"/>
                        <div style="display: flex;justify-content: space-between">
                          <div>{{ size2Str(item.speed) }}/s</div>
                          <div>{{ item.percent }}%</div>
                        </div>
                      </div>
                    </n-scrollbar>
                    <template #footer>
                    </template>
                  </n-popover>


                </div>
                <swBtn @change="changeTheme"></swBtn>
              </div>
            </div>
          </n-layout-header>
          <n-layout-header bordered style="height: 3rem;display: flex;align-items: center;padding: 0 1rem">
            <n-space id="space" style="flex-flow: nowrap;overflow: auto">
              <n-tag :disabled="item.checked" @click="navigateTo(item.path)" checkable closable round @checkedChange="val=>{
               return false
              }" v-for="item in links" v-model:checked="item.checked" type="info"
                     style="cursor: pointer;">
                {{ item.title }}
                <CloseOutlined style="width: 10px"></CloseOutlined>
              </n-tag>
            </n-space>
          </n-layout-header>
          <n-layout-content bordered
                            style="height: calc(100vh - 9rem);display: flex;align-items: center;padding: 1rem 1rem;width: 100%;">
            <NuxtPage/>
          </n-layout-content>
          <n-layout-footer bordered style="height: 3rem;display: flex;align-items: center;padding: 0 0 0 1rem">Powered
            By Virus_Cui
          </n-layout-footer>
        </n-layout>
      </n-layout>
    </n-config-provider>
  </ClientOnly>
</template>

<style scoped>
:deep(.n-menu > .n-menu-item:first-child > .n-menu-item-content.n-menu-item-content--selected::before) {
  background: none;
}

:deep(.n-layout-scroll-container) {
  width: 100%;
}

:deep(.n-layout-toggle-bar) {
  right: -24px;
}

.admin {
  display: flex;
  justify-content: left;
  align-items: center;
  overflow: hidden;
}

:deep(.n-space) {
  display: inline;
  flex-wrap: nowrap;
  flex-flow: nowrap;
}

/*定义滚动条高宽及背景
 高宽分别对应横竖滚动条的尺寸*/
::-webkit-scrollbar {
  width: 16px;
  height: 0px;
  background-color: #F5F5F5;
}

/*定义滚动条轨道
 内阴影+圆角*/
::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  background-color: #F5F5F5;
}

/*定义滑块
 内阴影+圆角*/
::-webkit-scrollbar-thumb {
  border-radius: 10px;
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, .3);
  background-color: #555;
}

.close-btn {
  width: 20px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  border: 1px solid #dfdfdf;
  transition: all .2s;
  cursor: pointer;
  margin-bottom: .2rem;

  &:hover {
    background: rgba(223, 223, 223, .6);
  }

  i {
    &::before {
      vertical-align: middle;
    }
  }
}

.small {
  :deep(.n-progress-text) {
    font-size: .6rem;
  }
}

</style>
