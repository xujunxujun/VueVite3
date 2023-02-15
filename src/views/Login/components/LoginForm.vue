<script setup lang="ts">
import { reactive, ref, unref, watch } from 'vue'
import { Form } from '@/components/Form'
import { useI18n } from '@/hooks/web/useI18n'
import { ElButton, ElCheckbox, ElLink } from 'element-plus'
import { required } from '@/utils/formRules'
import { useForm } from '@/hooks/web/useForm'
import { Login } from '@/api/login'
import type { UserLoginType } from '@/api/login/types'
import { useCache } from '@/hooks/web/useCache'
import { usePermissionStore } from '@/store/modules/permission'
import { useRouter } from 'vue-router'
import type { RouteLocationNormalizedLoaded, RouteRecordRaw } from 'vue-router'
import { useAppStore } from '@/store/modules/app'
import { layer } from '@layui/layer-vue'
import { useTagsViewStore } from '@/store/modules/tagsView'
import { resetRouter } from '@/router'
import { FormSchema } from '@/types/form'

const appStore = useAppStore()
const tagsViewStore = useTagsViewStore()
const permissionStore = usePermissionStore()

const { currentRoute, addRoute, push } = useRouter()

const { t } = useI18n()

// 自定义验证

const validateCode = (_rule: any, _value: any, callback: any) => {
  if (!CodeNumber.value) {
    callback(new Error(t('common.required')))
  }

  callback()
}
// 表单验证
const rules = {
  username: [required],
  password: [required],
  code: [{ validator: validateCode, trigger: 'blur' }]
}
// 验证码
const CodeNumber = ref()
const schema = reactive<FormSchema[]>([
  {
    field: 'title',
    colProps: {
      span: 24
    }
  },
  {
    field: 'username',
    label: t('login.username'),
    value: 'admin',
    component: 'Input',
    colProps: {
      span: 24
    },
    componentProps: {
      placeholder: t('login.usernamePlaceholder')
    }
  },
  {
    field: 'password',
    label: t('login.password'),
    value: 'admin',
    component: 'InputPassword',
    colProps: {
      span: 24
    },
    componentProps: {
      style: {
        width: '100%'
      },
      placeholder: t('login.passwordPlaceholder')
    }
  },

  {
    field: 'tool',
    colProps: {
      span: 24
    }
  },
  {
    field: 'login',
    colProps: {
      span: 24
    }
  }
  // {
  //   field: 'other',
  //   component: 'Divider',
  //   label: t('login.otherLogin'),
  //   componentProps: {
  //     contentPosition: 'center'
  //   }
  // },
  // {
  //   field: 'otherIcon',
  //   colProps: {
  //     span: 24
  //   }
  // }
])

const remember = ref(false)

const { register, elFormRef, methods } = useForm()

const loading = ref(false)

const redirect = ref<string>('')

watch(
  () => currentRoute.value,
  (route: RouteLocationNormalizedLoaded) => {
    redirect.value = route?.query?.redirect as string
  },
  {
    immediate: true
  }
)
//表单数据
const formData = ref<UserLoginType>({
  username: '',
  password: ''
})

// 登录
const signIn = async () => {
  tagsViewStore.delAllViews()
  resetRouter() // 重置静态路由表
  const formRef = unref(elFormRef)
  await formRef?.validate(async (isValid) => {
    if (isValid) {
      const { wsCache } = useCache()
      wsCache.clear()

      loading.value = true
      const { getFormData } = methods
      formData.value = await getFormData<UserLoginType>()

      Login(formData.value)
        .then(async (res) => {
          if (res && res?.status === 200) {
            await permissionStore.generateRoutes().catch(() => {})
            permissionStore.getAddRouters.forEach((route) => {
              addRoute(route as RouteRecordRaw) // 动态添加可访问路由表
            })
            permissionStore.setIsAddRouters(true)
            // wsCache.set(appStore.getUserInfo, res.data)

            wsCache.set(appStore.getUserInfo, res.data.token, { exp: 60 * res.data.expires * 1000 })

            push({ path: redirect.value || permissionStore.addRouters[0].path })

            layer.notifiy({
              title: 'Success',
              content: t('message.result.loginsuccess'),
              icon: 1,
              time: 2000
            })
          }
        })
        .catch((_err) => {})
        .finally(() => (loading.value = false))
    }
  })
}

defineExpose({})
</script>

<template>
  <Form
    :schema="schema"
    :rules="rules"
    label-position="top"
    hide-required-asterisk
    size="large"
    @register="register"
  >
    <template #title>
      <h2 class="text-2xl font-bold text-center w-[100%]">{{ t('login.login') }}</h2>
    </template>

    <template #tool>
      <div class="flex justify-between items-center w-[100%]">
        <ElCheckbox v-model="remember" :label="t('login.remember')" size="small" />
        <ElLink type="primary" :underline="false">{{ t('login.forgetPassword') }}</ElLink>
      </div>
    </template>

    <template #login>
      <ElButton :loading="loading" type="primary" class="w-[100%]" @click="signIn">
        {{ t('login.login') }}
      </ElButton>
    </template>
  </Form>
</template>

<style lang="less" scoped>
:deep(.anticon) {
  &:hover {
    color: var(--el-color-primary) !important;
  }
}

.code {
  cursor: pointer;
  margin-left: 10px;
}
</style>
