<script setup lang="ts">
import {ref, reactive, onMounted, watch} from "vue";
import {useRouter} from "#app";

const router = useRouter()

const current = reactive({
  parent: null,
  name: ''
})

watch(()=>router.currentRoute.value, ()=>{
  Object.assign(current, router.currentRoute.value.meta)
})

onMounted(()=>{
  Object.assign(current, router.currentRoute.value.meta)
})

const unit = ref('/')
</script>

<template>
  <div>
    <NuxtLink style="text-decoration: none;color: var(--n-text-color)" to="/user/files">首页</NuxtLink> <span v-if="current.name != '仪表板'"> {{unit}} </span> <span v-if="current.parent != null"> {{ current.parent }} {{unit}} </span> <span v-if="current.name != '仪表板'">{{ current.name }}</span v-if>
  </div>
</template>

<style scoped>

</style>
