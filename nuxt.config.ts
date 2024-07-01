import {defineNuxtConfig} from 'nuxt/config';
import Components from 'unplugin-vue-components/vite';
import {NaiveUiResolver} from 'unplugin-vue-components/resolvers';
// https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
export default defineNuxtConfig({
  app:{
    head: {
      title: '致飞网盘 1.0'
    }
  },
  css:[
    '/assets/base.scss'
  ],
  build: {
    transpile: process.env.NODE_ENV === 'production' ? ['naive-ui', 'vueuc', '@css-render/vue3-ssr', '@juggle/resize-observer', 'date-fns', '@css-render/plugin-bem',] : ['@juggle/resize-observer']
  },
  vite: {
    plugins: [
      Components({
        dts: true,
        resolvers: [NaiveUiResolver()], // Automatically register all components in the `components` directory
      }),
    ],
  }
})