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

import { changePwdApi } from '#/api/core/auth';
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
  oldPassword: '',
  newPassword: '',
  confirmNewPassword: '',
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
              <Button type="link">换绑</Button>
              <Button danger type="link">解绑</Button>
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
  </div>
</template>
