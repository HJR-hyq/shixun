<script setup lang="ts">
import { computed, reactive, ref } from 'vue';

import { useUserStore } from '@vben/stores';

import {
  Button,
  Card,
  Form,
  FormItem,
  Input,
  message,
  Modal,
} from 'ant-design-vue';

import {
  bindAccountApi,
  rebindAccountApi,
  sendBindCodeApi,
  unbindAccountApi,
  verifyPasswordApi,
} from '#/api/core/account-binding';
import { changePwdApi } from '#/api/core/auth';
import { getUserInfoApi } from '#/api/core/user';
import { useAuthStore } from '#/store';

const userStore = useUserStore();
const authStore = useAuthStore();
const activeTab = ref('account');

const userInfo = computed(() => userStore.userInfo);

const tabs = [
  { key: 'profile', label: '个人资料', icon: '📋' },
  { key: 'account', label: '账号设置', icon: '👤' },
];

// 修改密码弹窗
const pwdModalVisible = ref(false);
const pwdLoading = ref(false);
const pwdForm = reactive({
  confirmNewPassword: '',
  newPassword: '',
  oldPassword: '',
});

const openPwdModal = () => {
  pwdForm.oldPassword = '';
  pwdForm.newPassword = '';
  pwdForm.confirmNewPassword = '';
  pwdModalVisible.value = true;
};

const handleCancelPwd = () => {
  pwdModalVisible.value = false;
};

const handleConfirmPwd = async () => {
  if (!pwdForm.oldPassword) {
    message.warning('请输入原密码');
    return;
  }
  if (!pwdForm.newPassword) {
    message.warning('请输入新密码');
    return;
  }
  if (pwdForm.newPassword !== pwdForm.confirmNewPassword) {
    message.warning('两次输入的新密码不一致');
    return;
  }
  if (pwdForm.newPassword.length < 6) {
    message.warning('新密码长度不能少于6位');
    return;
  }
  pwdLoading.value = true;
  try {
    await changePwdApi({
      oldPassword: pwdForm.oldPassword,
      newPassword: pwdForm.newPassword,
      confirmNewPassword: pwdForm.confirmNewPassword,
    });
    message.success('密码修改成功，请使用新密码重新登录');
    pwdModalVisible.value = false;
    await authStore.logout(false);
  } catch (error: any) {
    message.error(error?.response?.data?.message || '密码修改失败');
  } finally {
    pwdLoading.value = false;
  }
};

// 邮箱绑定/换绑/解绑
type BindAction = 'bind' | 'rebind' | 'unbind';
const emailModalVisible = ref(false);
const emailAction = ref<BindAction>('bind');
const emailStep = ref(1);
const emailLoading = ref(false);
const emailForm = reactive({
  account: '',
  code: '',
  password: '',
});
const verifyToken = ref('');
const codeSending = ref(false);
const countdown = ref(0);
let countdownTimer: null | ReturnType<typeof setInterval> = null;

function startCountdown() {
  countdown.value = 60;
  countdownTimer = setInterval(() => {
    countdown.value -= 1;
    if (countdown.value <= 0 && countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }, 1000);
}

function openEmailModal(action: BindAction) {
  emailAction.value = action;
  emailStep.value = 1;
  emailForm.account = '';
  emailForm.code = '';
  emailForm.password = '';
  verifyToken.value = '';
  emailModalVisible.value = true;
}

function handleCancelEmail() {
  emailModalVisible.value = false;
}

async function handleSendCode() {
  if (!emailForm.account) {
    message.warning('请输入邮箱地址');
    return;
  }
  codeSending.value = true;
  try {
    const purpose = emailAction.value === 'bind' ? 'bind' : 'rebind';
    await sendBindCodeApi({
      account: emailForm.account,
      purpose,
      type: 'email',
    });
    message.success('验证码已发送');
    startCountdown();
  } catch (error: any) {
    message.error(error?.response?.data?.message || '发送验证码失败');
  } finally {
    codeSending.value = false;
  }
}

async function handleVerifyPassword() {
  if (!emailForm.password) {
    message.warning('请输入当前密码');
    return;
  }
  emailLoading.value = true;
  try {
    const token = await verifyPasswordApi({ password: emailForm.password });
    verifyToken.value = token || '';
    emailStep.value = 2;
  } catch (error: any) {
    message.error(error?.response?.data?.message || '密码验证失败');
  } finally {
    emailLoading.value = false;
  }
}

async function handleConfirmEmail() {
  if (!emailForm.code) {
    message.warning('请输入验证码');
    return;
  }
  emailLoading.value = true;
  try {
    if (emailAction.value === 'bind') {
      await bindAccountApi({
        account: emailForm.account,
        code: emailForm.code,
        type: 'email',
      });
      message.success('邮箱绑定成功');
    } else if (emailAction.value === 'rebind') {
      await rebindAccountApi({
        account: emailForm.account,
        code: emailForm.code,
        type: 'email',
        verifyToken: verifyToken.value,
      });
      message.success('邮箱换绑成功');
    }
    emailModalVisible.value = false;
    const info = await getUserInfoApi();
    userStore.setUserInfo(info);
  } catch (error: any) {
    message.error(error?.response?.data?.message || '操作失败');
  } finally {
    emailLoading.value = false;
  }
}

async function handleConfirmUnbind() {
  if (!emailForm.password) {
    message.warning('请输入当前密码');
    return;
  }
  emailLoading.value = true;
  try {
    const token = await verifyPasswordApi({ password: emailForm.password });
    await unbindAccountApi({ type: 'email', verifyToken: token || '' });
    message.success('邮箱解绑成功');
    emailModalVisible.value = false;
    const info = await getUserInfoApi();
    userStore.setUserInfo(info);
  } catch (error: any) {
    message.error(error?.response?.data?.message || '解绑失败');
  } finally {
    emailLoading.value = false;
  }
}
</script>

<template>
  <div class="flex h-full">
    <!-- 左侧导航 -->
    <div class="bg-background w-48 border-r p-4">
      <div
        v-for="tab in tabs"
        :key="tab.key"
        :class="
          activeTab === tab.key
            ? 'bg-accent text-accent-foreground'
            : 'hover:bg-accent/50'
        "
        class="text-foreground mb-2 flex cursor-pointer items-center rounded-lg px-4 py-3 transition-colors"
        @click="activeTab = tab.key"
      >
        <span class="mr-2">{{ tab.icon }}</span>
        <span>{{ tab.label }}</span>
      </div>
    </div>

    <!-- 右侧内容 -->
    <div class="bg-muted/30 flex-1 overflow-auto p-6">
      <!-- 个人资料 -->
      <div v-show="activeTab === 'profile'">
        <Card title="个人资料">
          <p>个人资料内容</p>
        </Card>
      </div>

      <!-- 账号设置 -->
      <div v-show="activeTab === 'account'">
        <Card title="账号设置">
          <!-- 手机号 -->
          <div
            class="border-border flex items-center justify-between border-b py-4"
          >
            <div>
              <div class="text-foreground font-medium">手机号</div>
              <div class="text-muted-foreground mt-1 text-sm">
                {{ userInfo?.phoneNum || '未绑定' }}
              </div>
            </div>
            <Button type="link">绑定</Button>
          </div>

          <!-- 邮箱 -->
          <div
            class="border-border flex items-center justify-between border-b py-4"
          >
            <div>
              <div class="text-foreground font-medium">邮箱</div>
              <div class="text-muted-foreground mt-1 text-sm">
                {{ userInfo?.email || '未绑定' }}
              </div>
            </div>
            <div>
              <Button type="link" @click="openEmailModal('rebind')">
                换绑
              </Button>
              <Button danger type="link" @click="openEmailModal('unbind')">
                解绑
              </Button>
            </div>
          </div>

          <!-- 微信号 -->
          <div
            class="border-border flex items-center justify-between border-b py-4"
          >
            <div class="flex items-center gap-3">
              <div
                class="bg-muted flex h-10 w-10 items-center justify-center rounded-full"
              >
                <span class="text-lg">🐥</span>
              </div>
              <div>
                <div class="text-foreground font-medium">微信号</div>
                <div class="text-muted-foreground mt-1 text-sm">
                  烧电焊的小黄鸭 · 绑定于 2026-07-06T14:23:03
                </div>
              </div>
            </div>
            <Button danger type="link">解绑</Button>
          </div>

          <!-- 密码 -->
          <div class="flex items-center justify-between py-4">
            <div class="text-foreground font-medium">密码</div>
            <Button type="link" @click="openPwdModal">修改密码</Button>
          </div>
        </Card>
      </div>
    </div>

    <!-- 修改密码弹窗 -->
    <Modal
      v-model:open="pwdModalVisible"
      :confirm-loading="pwdLoading"
      title="修改密码"
      @cancel="handleCancelPwd"
      @ok="handleConfirmPwd"
    >
      <Form class="mt-4" layout="vertical">
        <FormItem label="原密码" required>
          <Input
            v-model:value="pwdForm.oldPassword"
            placeholder="请输入原密码"
            type="password"
          />
        </FormItem>
        <FormItem label="新密码" required>
          <Input
            v-model:value="pwdForm.newPassword"
            placeholder="请输入新密码"
            type="password"
          />
        </FormItem>
        <FormItem label="确认密码" required>
          <Input
            v-model:value="pwdForm.confirmNewPassword"
            placeholder="请再次输入新密码"
            type="password"
          />
        </FormItem>
      </Form>
    </Modal>

    <!-- 邮箱绑定/换绑弹窗 -->
    <Modal
      v-model:open="emailModalVisible"
      :confirm-loading="emailLoading"
      :title="
        emailAction === 'bind'
          ? '绑定邮箱'
          : emailAction === 'rebind'
            ? '换绑邮箱'
            : '解绑邮箱'
      "
      @cancel="handleCancelEmail"
      @ok="
        emailAction === 'unbind'
          ? handleConfirmUnbind
          : emailStep === 1 && emailAction !== 'bind'
            ? handleVerifyPassword
            : emailStep === 1 && emailAction === 'bind'
              ? handleSendCode
              : handleConfirmEmail
      "
    >
      <!-- 解绑：只需输入密码 -->
      <Form v-if="emailAction === 'unbind'" class="mt-4" layout="vertical">
        <FormItem label="当前密码" required>
          <Input
            v-model:value="emailForm.password"
            placeholder="请输入当前密码以验证身份"
            type="password"
          />
        </FormItem>
      </Form>

      <!-- 换绑 Step1：输入密码 -->
      <Form
        v-else-if="emailAction === 'rebind' && emailStep === 1"
        class="mt-4"
        layout="vertical"
      >
        <FormItem label="当前密码" required>
          <Input
            v-model:value="emailForm.password"
            placeholder="请输入当前密码以验证身份"
            type="password"
          />
        </FormItem>
      </Form>

      <!-- 绑定/换绑 Step2：输入邮箱+验证码 -->
      <Form v-else class="mt-4" layout="vertical">
        <FormItem label="新邮箱" required>
          <div class="flex gap-2">
            <Input
              v-model:value="emailForm.account"
              placeholder="请输入新邮箱地址"
              type="email"
            />
            <Button
              :disabled="countdown > 0 || codeSending"
              @click="handleSendCode"
            >
              {{
                countdown > 0
                  ? `${countdown}s后重试`
                  : codeSending
                    ? '发送中'
                    : '发送验证码'
              }}
            </Button>
          </div>
        </FormItem>
        <FormItem label="验证码" required>
          <Input v-model:value="emailForm.code" placeholder="请输入验证码" />
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>
