<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import {
  checkEmailCodeApi,
  phoneVerifyApi,
  resetPwdApi,
  sendPhoneCodeApi,
} from '#/api/core/auth';

defineOptions({ name: 'ForgetPassword' });

const router = useRouter();

const activeTab = ref<'email' | 'phone'>('email');
const step = ref(1);
const loading = ref(false);

// Step 1: 账号
const account = ref('');

// Step 2: 验证码 + 新密码
const code = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const codeSending = ref(false);
const countdown = ref(0);
let countdownTimer: null | ReturnType<typeof setInterval> = null;

const title = '忘记密码?';
const subTitle = '输入您的电子邮件，我们将向您发送重置密码的连接';

function goToLogin() {
  router.push('/auth/login');
}

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

async function handleSendCode() {
  if (!account.value) {
    return;
  }
  codeSending.value = true;
  try {
    if (activeTab.value === 'email') {
      await resetPwdApi({ type: 'email', account: account.value });
    } else {
      await resetPwdApi({ type: 'phone', account: account.value });
      await sendPhoneCodeApi(account.value);
    }
    step.value = 2;
    startCountdown();
  } catch {
    // error handled by interceptor
  } finally {
    codeSending.value = false;
  }
}

async function handleResetPwd() {
  if (!code.value || !newPassword.value || !confirmPassword.value) {
    return;
  }
  if (newPassword.value !== confirmPassword.value) {
    return;
  }
  loading.value = true;
  try {
    activeTab.value === 'email'
      ? await checkEmailCodeApi(account.value, code.value, newPassword.value)
      : await phoneVerifyApi({
          phoneNumber: account.value,
          code: code.value,
        });
    step.value = 3;
  } catch {
    // error handled by interceptor
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div>
    <!-- 标题 -->
    <div class="mb-6 text-center">
      <h3 class="text-foreground mb-2 text-2xl font-bold">{{ title }}</h3>
      <p class="text-muted-foreground text-sm">{{ subTitle }}</p>
    </div>

    <!-- Step 1: 输入账号 -->
    <div v-if="step === 1">
      <!-- Tab 切换 -->
      <div class="mb-6 flex justify-center gap-8 border-b">
        <button
          :class="
            activeTab === 'email'
              ? 'border-primary text-primary'
              : 'text-muted-foreground'
          "
          class="border-b-2 pb-2 text-sm font-medium transition-colors"
          @click="activeTab = 'email'"
        >
          邮箱重置
        </button>
        <button
          :class="
            activeTab === 'phone'
              ? 'border-primary text-primary'
              : 'text-muted-foreground'
          "
          class="border-b-2 pb-2 text-sm font-medium transition-colors"
          @click="activeTab = 'phone'"
        >
          手机号重置
        </button>
      </div>

      <!-- 输入框 -->
      <div class="mb-4">
        <input
          v-model="account"
          :placeholder="
            activeTab === 'email' ? 'example@example.com' : '请输入手机号'
          "
          :type="activeTab === 'email' ? 'email' : 'tel'"
          class="border-border bg-background text-foreground placeholder:text-muted-foreground h-10 w-full rounded-md border px-3 text-sm outline-none focus:border-blue-500"
          @keyup.enter="handleSendCode"
        />
      </div>

      <!-- 重置密码按钮 -->
      <button
        :disabled="!account || codeSending"
        class="bg-primary text-primary-foreground hover:bg-primary/90 h-10 w-full rounded-md text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        @click="handleSendCode"
      >
        {{ codeSending ? '发送中...' : '重置密码' }}
      </button>

      <!-- 返回 -->
      <div class="mt-4 text-center">
        <button
          class="text-muted-foreground hover:text-foreground text-sm"
          @click="goToLogin"
        >
          返回
        </button>
      </div>
    </div>

    <!-- Step 2: 输入验证码 + 新密码 -->
    <div v-if="step === 2">
      <div class="mb-4">
        <input
          v-model="code"
          class="border-border bg-background text-foreground placeholder:text-muted-foreground h-10 w-full rounded-md border px-3 text-sm outline-none focus:border-blue-500"
          placeholder="请输入验证码"
          @keyup.enter="handleResetPwd"
        />
      </div>

      <div class="mb-4">
        <input
          v-model="newPassword"
          class="border-border bg-background text-foreground placeholder:text-muted-foreground h-10 w-full rounded-md border px-3 text-sm outline-none focus:border-blue-500"
          placeholder="请输入新密码"
          type="password"
          @keyup.enter="handleResetPwd"
        />
      </div>

      <div class="mb-4">
        <input
          v-model="confirmPassword"
          class="border-border bg-background text-foreground placeholder:text-muted-foreground h-10 w-full rounded-md border px-3 text-sm outline-none focus:border-blue-500"
          placeholder="请再次输入新密码"
          type="password"
          @keyup.enter="handleResetPwd"
        />
      </div>

      <button
        :disabled="!code || !newPassword || !confirmPassword || loading"
        class="bg-primary text-primary-foreground hover:bg-primary/90 h-10 w-full rounded-md text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        @click="handleResetPwd"
      >
        {{ loading ? '重置中...' : '确认重置' }}
      </button>

      <div class="mt-4 text-center">
        <button
          class="text-muted-foreground hover:text-foreground text-sm"
          @click="step = 1"
        >
          返回
        </button>
      </div>
    </div>

    <!-- Step 3: 成功 -->
    <div v-if="step === 3" class="text-center">
      <div class="mb-4 text-5xl">✅</div>
      <h4 class="text-foreground mb-2 text-lg font-medium">密码重置成功</h4>
      <p class="text-muted-foreground mb-6 text-sm">请使用新密码重新登录</p>
      <button
        class="bg-primary text-primary-foreground hover:bg-primary/90 h-10 w-full rounded-md text-sm font-medium transition-colors"
        @click="goToLogin"
      >
        返回登录
      </button>
    </div>
  </div>
</template>
