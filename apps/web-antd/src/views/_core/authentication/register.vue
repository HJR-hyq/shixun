<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';
import type { Recordable } from '@vben/types';

import { computed, h, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { AuthenticationRegister, VbenButton, z } from '@vben/common-ui';
// import { $t } from '@vben/locales';

import {
  getCompanyRegionalsApi,
  getOrganizationsApi,
  registerApi,
  sendEmailCodeApi,
} from '#/api/core/auth';

defineOptions({ name: 'Register' });

const router = useRouter();
const loading = ref(false);
const codeLoading = ref(false);
const countdown = ref(0);
const countdownTimer = ref<null | ReturnType<typeof setInterval>>(null);
const registerRef = ref<InstanceType<typeof AuthenticationRegister> | null>(
  null,
);

const organizationOptions = ref<{ label: string; value: number }[]>([]);
const regionOptions = ref<{ label: string; value: number }[]>([]);

async function loadOrganizations() {
  try {
    const data = await getOrganizationsApi();
    if (data && Array.isArray(data)) {
      organizationOptions.value = data.map((item) => ({
        label: item.name,
        value: item.id,
      }));
    }
  } catch {
    // ignore
  }
}

async function loadRegions() {
  try {
    const data = await getCompanyRegionalsApi(0);
    if (data && Array.isArray(data)) {
      regionOptions.value = data.map((item) => ({
        label: item.name,
        value: item.id,
      }));
    }
  } catch {
    // ignore
  }
}

onMounted(() => {
  loadOrganizations();
  loadRegions();
});

function startCountdown() {
  countdown.value = 60;
  countdownTimer.value = setInterval(() => {
    countdown.value -= 1;
    if (countdown.value <= 0 && countdownTimer.value) {
      clearInterval(countdownTimer.value);
      countdownTimer.value = null;
    }
  }, 1000);
}

async function handleSendCode(email: string) {
  if (!email || countdown.value > 0) return;
  codeLoading.value = true;
  try {
    await sendEmailCodeApi(email);
    startCountdown();
  } catch {
    // ignore
  } finally {
    codeLoading.value = false;
  }
}

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: '请输入用户名',
      },
      fieldName: 'username',
      label: '用户名',
      rules: z.string().min(1, { message: '请输入用户名' }),
    },
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: '请输入邮箱',
      },
      fieldName: 'email',
      label: '邮箱',
      rules: z
        .string()
        .min(1, { message: '请输入邮箱' })
        .email({ message: '邮箱格式不正确' }),
    },
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: '请输入验证码',
      },
      fieldName: 'code',
      label: '验证码',
      rules: z.string().min(1, { message: '请输入验证码' }),
      suffix: () =>
        h(
          VbenButton,
          {
            type: 'button',
            variant: 'outline',
            size: 'sm',
            disabled: countdown.value > 0 || codeLoading.value,
            onClick: async () => {
              const formApi = registerRef.value?.getFormApi();
              if (formApi) {
                const values = await formApi.getValues();
                const email = values?.email;
                if (email) {
                  handleSendCode(email);
                }
              }
            },
          },
          () => {
            if (countdown.value > 0) {
              return `${countdown.value}s后重新获取`;
            }
            return codeLoading.value ? '发送中...' : '获取验证码';
          },
        ),
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        passwordStrength: true,
        placeholder: '请输入密码',
      },
      fieldName: 'password',
      label: '密码',
      renderComponentContent() {
        return {
          strengthText: () => '使用 8 个或更多字符，混合字母、数字和符号',
        };
      },
      rules: z.string().min(8, { message: '密码至少8个字符' }),
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: '请确认密码',
      },
      dependencies: {
        rules(values) {
          const { password } = values;
          return z
            .string({ required_error: '请确认密码' })
            .min(1, { message: '请确认密码' })
            .refine((value) => value === password, {
              message: '两次输入的密码不一致',
            });
        },
        triggerFields: ['password'],
      },
      fieldName: 'confirmPassword',
      label: '确认密码',
    },
    {
      component: 'VbenSelect',
      componentProps: {
        options: organizationOptions.value,
        placeholder: '请选择上级组织',
      },
      fieldName: 'organizationId',
      label: '上级组织',
      rules: z.number().min(1, { message: '请选择上级组织' }),
    },
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: '请输入公司名称',
      },
      fieldName: 'companyName',
      label: '公司名称',
      rules: z.string().optional(),
    },
    {
      component: 'VbenSelect',
      componentProps: {
        options: regionOptions.value,
        placeholder: '请选择公司地区',
      },
      fieldName: 'regionId',
      label: '公司地区',
      rules: z.number().optional(),
    },
  ];
});

async function handleSubmit(values: Recordable<any>) {
  loading.value = true;
  try {
    await registerApi({
      account: values.email,
      code: values.code,
      password: values.password,
      username: values.username,
      organizationId: values.organizationId
        ? [[values.organizationId]]
        : undefined,
    });
    router.push('/auth/login');
  } catch {
    // ignore
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div>
    <AuthenticationRegister
      ref="registerRef"
      :form-schema="formSchema"
      :loading="loading"
      :show-label="true"
      submit-button-text="注册"
      title="创建一个账号"
      @submit="handleSubmit"
    />
  </div>
</template>
