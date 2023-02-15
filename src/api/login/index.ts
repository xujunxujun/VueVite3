import request from '@/config/axios'

import type { UserLoginType } from './types'

const api = {
  Login: "/api/Login", // 获取设备分类
  logout: '/api/Login/loginOut' // 退出系统
};

// 获取设备分类
export function Login(param: UserLoginType) {

  return request.post({
    url: api.Login,
    data: {
      user: param.username,
      password: param.password,
    },
  });
}


export const loginOutApi = () => {
  return request.get({ url: api.logout })
}




