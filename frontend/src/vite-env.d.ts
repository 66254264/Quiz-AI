/// <reference types="vite/client" />

// 扩展 ImportMeta 接口以支持 Vite 环境变量
interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly DEV: boolean
  readonly PROD: boolean
  readonly MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// 为浏览器环境定义 NodeJS.Timeout 类型
declare namespace NodeJS {
  type Timeout = ReturnType<typeof setTimeout>
  type Timer = ReturnType<typeof setTimeout>
}
