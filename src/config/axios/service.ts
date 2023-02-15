import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosResponse,
  AxiosError
} from 'axios'
import { layer } from "@layui/layer-vue";
import { ElMessage } from 'element-plus'

import { useCache } from '@/hooks/web/useCache'

import qs from 'qs'
import { config } from '@/config/axios/config'
import { useAppStoreWithOut } from '@/store/modules/app'
import { loginOut } from '@/router'
const appStore = useAppStoreWithOut()
const { result_code, base_url } = config

export const PATH_URL = base_url[import.meta.env.VITE_API_BASEPATH]

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: PATH_URL, // api 的 base_url
  timeout: config.request_timeout // 请求超时时间
})




// request拦截器
service.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    var loadid = layer.load(1, { time: 5000 });
    if (
      config.method === 'post' &&
      (config.headers as AxiosRequestHeaders)['Content-Type'] ===
      'application/x-www-form-urlencoded'
    ) {
      config.data = qs.stringify(config.data)
    }
    // get参数编码
    if (config.method === 'get' && config.params) {
      let url = config.url as string
      url += '?'
      const keys = Object.keys(config.params)
      for (const key of keys) {
        if (config.params[key] !== void 0 && config.params[key] !== null) {
          url += `${key}=${encodeURIComponent(config.params[key])}&`
        }
      }

      url = url.substring(0, url.length - 1)
      config.params = {}
      config.url = url



    }
    config.loadid = loadid
    const { wsCache } = useCache()
    var token = wsCache.get(appStore.getUserInfo)
    if (token) {
      (config.headers as AxiosRequestHeaders)['XJ-Token'] = token
    } else {
      delete (config.headers as AxiosRequestHeaders)['XJ-Token']
    }



    return config
  },
  (error: AxiosError) => {
    //layer.close(loadid.value);
    // layer.notifiy({
    //   title: "参数错误",
    //   content: error.message || error,
    //   icon: 2,
    // });
    // Do something with request error
    console.log(error) // for debug
    Promise.reject(error)
  }
)

// response 拦截器
service.interceptors.response.use(
  (response: AxiosResponse<Recordable>) => {

    (response.config.loadid) && (layer.close(response.config.loadid))
    if (response.data.status === result_code) {

      (response.data?.message) && ElMessage.error(response.data.message)

      return response.data
    } else if (response?.status === 200 && response.config.responseType === 'blob') {
      (response.data?.message) && ElMessage.error(response.data.message)
      return response
    } else {

      (response.data?.message) && ElMessage.error(response.data.message)
    }
  },
  (error: AxiosError) => {
    (error.config.loadid) && (layer.close(error.config.loadid))
    //layer.close(loadid.value);
    console.log('err' + error) // for debug
    error.message && ElMessage.error(error.message)

    loginOut('/login');


    // return Promise.reject(error)
  }
)

export { service }
