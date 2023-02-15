import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import type { App } from 'vue'
import { Layout } from '@/utils/routerHelper'
import { useI18n } from '@/hooks/web/useI18n'
import { useCache } from '@/hooks/web/useCache'
const { t } = useI18n()

export const constantRouterMap: AppRouteRecordRaw[] = [
  {
    path: '/',
    component: Layout,
    redirect: '/Three',
    name: 'Root',
    meta: {
      hidden: true
    }
  },
  {
    path: '/redirect',
    component: Layout,
    name: 'Redirect',
    children: [
      {
        path: '/redirect/:path(.*)',
        name: 'Redirect',
        component: () => import('@/views/Redirect/Redirect.vue'),
        meta: {}
      }
    ],
    meta: {
      hidden: true,
      noTagsView: true
    }
  },
  {
    path: '/login',
    component: () => import('@/views/Login/Login.vue'),
    name: 'Login',
    meta: {
      hidden: true,
      title: t('router.login'),
      noTagsView: true
    }
  },
  {
    path: '/404',
    component: () => import('@/views/Error/404.vue'),
    name: 'NoFind',
    meta: {
      hidden: true,
      title: '404',
      noTagsView: true
    }
  }
]

export const asyncRouterMap: AppRouteRecordRaw[] = [


  {
    path: '/Three',
    component: Layout,
    redirect: '/Three/edit',
    name: 'Resource',
    meta: {
      title: t('router.threedimensional'),
      icon: 'mdi:rotate-3d'
    },
    children: [

      {
        path: 'edit',
        name: 'Edit',
        component: () => import('@/views/Error/403.vue'),
        meta: {
          title: t('router.edit'),
          icon: 'material-symbols:edit-document-outline'
        }
      },

    ]
  },




]

const router = createRouter({
  history: createWebHashHistory(),
  strict: true,
  routes: asyncRouterMap.concat(constantRouterMap) as RouteRecordRaw[],
  scrollBehavior: () => ({ left: 0, top: 0 })
})

export const resetRouter = (): void => {
  const resetWhiteNameList = ['Redirect', 'Login', 'NoFind', 'Root']
  router.getRoutes().forEach((route) => {
    const { name } = route
    if (name && !resetWhiteNameList.includes(name as string)) {
      router.hasRoute(name) && router.removeRoute(name)
    }
  })
}

const { wsCache } = useCache()
// 退出登陆到登陆页
export const loginOut = (url: string) => {
  wsCache.clear()
  resetRouter()
  router.push({ path: url })
}

export const setupRouter = (app: App<Element>) => {
  app.use(router)

}

export default router
