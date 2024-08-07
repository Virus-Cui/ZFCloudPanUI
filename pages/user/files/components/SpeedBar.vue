<script setup lang="ts">
import {ref, reactive, onMounted} from "vue";
import {size2Str} from "../../../../assets/utils/commons";

const props = defineProps(['data'])
</script>

<template>
  <!--  <n-progress v-if="props.data" type="circle" status="success" :percentage="props.data?.percent" />-->
  <n-progress
      type="line"
      :percentage="props.data?.percent"
      processing
      indicator-placement="inside"
      status="success"
  />
  <div style="display: flex;justify-content: space-between;align-items: center">
    <div>
      <n-gradient-text type="success">
        {{ size2Str(props.data?.speed) }}/s
      </n-gradient-text>
    </div>
    <div>
      <n-gradient-text type="success">
        {{ size2Str(props.data?.downloaded) }}
      </n-gradient-text>
    </div>
  </div>
</template>

<style scoped>

</style>
