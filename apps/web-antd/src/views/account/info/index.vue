<script setup lang="ts">
import { computed, ref } from 'vue';

import { useUserStore } from '@vben/stores';

import { Button, Card } from 'ant-design-vue';

const userStore = useUserStore();
const activeTab = ref('account');

const userInfo = computed(() => userStore.userInfo);

const tabs = [
  { key: 'profile', label: '个人资料', icon: '📋' },
  { key: 'account', label: '账号设置', icon: '👤' },
];
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
            <Button type="link">修改密码</Button>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>
