<script lang="ts" setup>
import { computed, onActivated, onMounted, ref } from 'vue';

import {
  Button,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tree,
} from 'ant-design-vue';

import {
  addUserManageApi,
  deleteUserManageApi,
  getOrganizationTreeApi,
  getUserManageListApi,
  resetUserPasswordApi,
  updateUserManageApi,
} from '#/api/core/auth';

interface OrgItem {
  children?: OrgItem[];
  id: number;
  isLeaf: boolean;
  level: number;
  name: string;
  parentId: number;
}

interface UserItem {
  account: string;
  createTime: string;
  email: string;
  gender: string;
  id: number;
  nickname: string;
  operator?: string;
  orgId: number;
  orgName: string;
  phone: string;
  status: string;
}

const loading = ref(false);
const userList = ref<UserItem[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

// 组织树
const orgTree = ref<OrgItem[]>([]);
const selectedOrgId = ref<number | undefined>(undefined);
const expandedOrgKeys = ref<(number | string)[]>([]);

// 搜索
const searchNickname = ref('');
const searchStatus = ref<string | undefined>(undefined);
const searchExpanded = ref(true);
const searchActive = ref(false);

const statusOptions = [
  { label: '全部', value: undefined },
  { label: '同意', value: '同意' },
  { label: '待审核', value: '待审核' },
  { label: '拒绝', value: '拒绝' },
];

// 弹窗
const modalVisible = ref(false);
const modalTitle = ref('添加用户');
const modalLoading = ref(false);
const formData = ref({
  id: 0,
  nickname: '',
  account: '',
  gender: '保密',
  orgId: 0,
  orgName: '',
  email: '',
  phone: '',
});

const columns = [
  {
    title: '序号',
    dataIndex: 'index',
    key: 'index',
    width: 60,
    align: 'center' as const,
  },
  {
    title: '昵称',
    dataIndex: 'nickname',
    key: 'nickname',
    width: 120,
    align: 'center' as const,
  },
  {
    title: '用户账号',
    dataIndex: 'account',
    key: 'account',
    width: 120,
    align: 'center' as const,
  },
  {
    title: '性别',
    dataIndex: 'gender',
    key: 'gender',
    width: 60,
    align: 'center' as const,
  },
  {
    title: '所属组织',
    dataIndex: 'orgName',
    key: 'orgName',
    width: 120,
    align: 'center' as const,
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    key: 'email',
    width: 180,
    align: 'center' as const,
  },
  {
    title: '手机号',
    dataIndex: 'phone',
    key: 'phone',
    width: 130,
    align: 'center' as const,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 160,
    align: 'center' as const,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 80,
    align: 'center' as const,
  },
  { title: '操作', key: 'action', width: 200, align: 'center' as const },
];

// 将扁平列表构建为树
function buildFlatTree(flatList: OrgItem[]): OrgItem[] {
  const map = new Map<number, OrgItem>();
  const roots: OrgItem[] = [];
  for (const item of flatList) {
    map.set(item.id, { ...item, children: [] });
  }
  for (const item of flatList) {
    const node = map.get(item.id)!;
    const parent = map.get(item.parentId);
    if (parent) {
      parent.children!.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

// 组织树转为 Tree 组件数据
const orgTreeData = computed(() => {
  const tree = buildFlatTree(orgTree.value);
  function formatNodes(nodes: OrgItem[]): any[] {
    return nodes.map((node) => ({
      key: node.id,
      title: node.name,
      isLeaf: node.isLeaf,
      children:
        node.children && node.children.length > 0
          ? formatNodes(node.children)
          : [],
    }));
  }
  return formatNodes(tree);
});

function getAllParentKeys(nodes: OrgItem[]): number[] {
  const keys: number[] = [];
  function walk(items: OrgItem[]) {
    for (const item of items) {
      if (item.children && item.children.length > 0) {
        keys.push(item.id);
        walk(item.children);
      }
    }
  }
  walk(nodes);
  return keys;
}

function mapGender(sex: any, fallback?: string): string {
  if (sex === 1 || sex === '1') return '男';
  if (sex === 2 || sex === '2') return '女';
  return fallback || '保密';
}

function mapApprovalStatus(approved: number): string {
  if (approved === 1) return '同意';
  if (approved === 0) return '待审核';
  return '拒绝';
}

async function loadOrgTree() {
  try {
    const data = await getOrganizationTreeApi();
    if (Array.isArray(data)) {
      orgTree.value = data;
      expandedOrgKeys.value = getAllParentKeys(data);
    }
  } catch {
    message.error('获取组织树失败');
  }
}

async function loadUserList() {
  loading.value = true;
  try {
    const data = await getUserManageListApi({
      orgId: selectedOrgId.value,
      nickname: searchNickname.value,
      status: searchStatus.value,
      currentPage: currentPage.value,
      pageSize: pageSize.value,
    });
    if (data && Array.isArray(data.items)) {
      const mapped = data.items.map((item: any) => ({
        id: item.staffId || item.id,
        nickname: item.realName || item.nickname || '',
        account: item.userName || item.account || '',
        gender: mapGender(item.sex, item.gender),
        orgId: item.orgId,
        orgName: item.orgName || '',
        email: item.email || '',
        phone: item.phoneNum || item.phone || '',
        createTime: item.addtime || item.createTime || '',
        status: mapApprovalStatus(item.approved),
        index: 0,
      }));

      mapped.sort((a, b) => {
        const dateA = new Date(a.createTime).getTime();
        const dateB = new Date(b.createTime).getTime();
        return dateB - dateA;
      });

      userList.value = mapped.map((item, index) => ({
        ...item,
        index: (currentPage.value - 1) * pageSize.value + index + 1,
      }));

      total.value = data.total || 0;
    }
  } catch {
    message.error('获取用户列表失败');
  } finally {
    loading.value = false;
  }
}

function handleOrgSelect(selectedKeys: (number | string)[]) {
  selectedOrgId.value =
    selectedKeys.length > 0 ? Number(selectedKeys[0]) : undefined;
  currentPage.value = 1;
  loadUserList();
}

function handleSearch() {
  currentPage.value = 1;
  loadUserList();
}

function handleReset() {
  searchNickname.value = '';
  searchStatus.value = undefined;
  selectedOrgId.value = undefined;
  currentPage.value = 1;
  loadUserList();
}

function handlePageChange(page: number) {
  currentPage.value = page;
  loadUserList();
}

function handleAdd() {
  modalTitle.value = '添加用户';
  formData.value = {
    id: 0,
    nickname: '',
    account: '',
    gender: '保密',
    orgId: selectedOrgId.value || 0,
    orgName: '',
    email: '',
    phone: '',
  };
  modalVisible.value = true;
}

function handleEdit(record: UserItem) {
  modalTitle.value = '编辑用户';
  formData.value = {
    id: record.id,
    nickname: record.nickname,
    account: record.account,
    gender: record.gender,
    orgId: record.orgId,
    orgName: record.orgName,
    email: record.email,
    phone: record.phone,
  };
  modalVisible.value = true;
}

async function handleConfirmModal() {
  if (!formData.value.nickname.trim()) {
    message.warning('请输入昵称');
    return;
  }
  modalLoading.value = true;
  try {
    if (formData.value.id) {
      await updateUserManageApi({
        id: formData.value.id,
        nickname: formData.value.nickname,
        gender: formData.value.gender,
        orgId: formData.value.orgId,
        email: formData.value.email,
        phone: formData.value.phone,
      });
      message.success('编辑成功');
    } else {
      await addUserManageApi({
        nickname: formData.value.nickname,
        account: formData.value.account,
        gender: formData.value.gender,
        orgId: formData.value.orgId,
        email: formData.value.email,
        phone: formData.value.phone,
      });
      message.success('添加成功');
    }
    modalVisible.value = false;
    loadUserList();
  } catch {
    message.error(formData.value.id ? '编辑失败' : '添加失败');
  } finally {
    modalLoading.value = false;
  }
}

async function handleDelete(id: number) {
  try {
    await deleteUserManageApi(id);
    message.success('删除成功');
    loadUserList();
  } catch {
    message.error('删除失败');
  }
}

async function handleResetPassword(id: number) {
  try {
    await resetUserPasswordApi(id);
    message.success('密码已重置');
  } catch {
    message.error('重置密码失败');
  }
}

function toggleFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    document.documentElement.requestFullscreen();
  }
}

onMounted(() => {
  loadOrgTree();
  loadUserList();
});

onActivated(() => {
  loadOrgTree();
});
</script>

<template>
  <div class="flex h-full">
    <!-- 左侧组织树 -->
    <div class="w-60 border-r p-2">
      <div class="mb-2 px-2 py-1 text-sm font-medium">组织列表</div>
      <Tree
        v-if="orgTreeData.length > 0"
        v-model:expanded-keys="expandedOrgKeys"
        :block-node="true"
        :selectable="true"
        :show-line="true"
        :tree-data="orgTreeData"
        class="org-tree"
        @select="handleOrgSelect"
      >
        <template #switcherIcon="{ expanded, isLeaf }">
          <span v-if="isLeaf" class="tree-leaf-icon">
            <svg
              fill="none"
              height="14"
              stroke="currentColor"
              stroke-width="1.2"
              viewBox="0 0 16 16"
              width="14"
            >
              <path
                d="M3 1h7l3 3v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z"
              />
              <path d="M10 1v3h3" />
            </svg>
          </span>
          <span v-else class="tree-switcher-icon">
            <svg
              v-if="expanded"
              fill="none"
              height="14"
              stroke="currentColor"
              stroke-width="1.2"
              viewBox="0 0 16 16"
              width="14"
            >
              <rect height="14" rx="2" width="14" x="1" y="1" />
              <line x1="4" x2="12" y1="8" y2="8" />
            </svg>
            <svg
              v-else
              fill="none"
              height="14"
              stroke="currentColor"
              stroke-width="1.2"
              viewBox="0 0 16 16"
              width="14"
            >
              <rect height="14" rx="2" width="14" x="1" y="1" />
              <line x1="8" x2="8" y1="4" y2="12" />
              <line x1="4" x2="12" y1="8" y2="8" />
            </svg>
          </span>
        </template>
      </Tree>
    </div>

    <!-- 右侧用户列表 -->
    <div class="flex-1 p-4">
      <!-- 搜索栏 -->
      <div
        v-show="searchExpanded"
        class="mb-4 flex items-center justify-between"
      >
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="text-sm">审核状态</span>
            <Select
              v-model:value="searchStatus"
              :options="statusOptions"
              allow-clear
              placeholder="请选择用户状态"
              style="width: 180px"
            />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm">用户名</span>
            <Input
              v-model:value="searchNickname"
              allow-clear
              placeholder="请输入用户名"
              style="width: 200px"
              @press-enter="handleSearch"
            />
          </div>
        </div>
        <Space>
          <Button @click="handleReset">重置</Button>
          <Button type="primary" @click="handleSearch">搜索</Button>
          <Button type="link" @click="searchExpanded = false">收起^</Button>
        </Space>
      </div>

      <!-- 添加用户按钮 + 工具栏 -->
      <div class="mb-4 flex items-center justify-between">
        <div>
          <Button
            v-if="!searchExpanded"
            type="link"
            @click="searchExpanded = true"
          >
            展开搜索
          </Button>
          <Button type="primary" @click="handleAdd">添加用户</Button>
        </div>
        <div class="flex items-center gap-2">
          <button
            :class="{ 'toolbar-btn-icon-active': searchActive }"
            class="toolbar-btn-icon"
            @click="searchActive = !searchActive"
          >
            <svg
              fill="none"
              height="16"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
              width="16"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" x2="16.65" y1="21" y2="16.65" />
            </svg>
          </button>
          <button class="toolbar-btn-icon">
            <svg
              fill="none"
              height="16"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
              width="16"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
          </button>
          <button class="toolbar-btn-icon" @click="loadUserList">
            <svg
              fill="none"
              height="16"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
              width="16"
            >
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          </button>
          <button class="toolbar-btn-icon" @click="toggleFullscreen">
            <svg
              fill="none"
              height="16"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
              width="16"
            >
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <line x1="21" x2="14" y1="3" y2="10" />
              <line x1="3" x2="10" y1="21" y2="14" />
            </svg>
          </button>
          <button class="toolbar-btn-icon">
            <svg
              fill="none"
              height="16"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
              width="16"
            >
              <rect height="7" width="7" x="3" y="3" />
              <rect height="7" width="7" x="14" y="3" />
              <rect height="7" width="7" x="14" y="14" />
              <rect height="7" width="7" x="3" y="14" />
            </svg>
          </button>
        </div>
      </div>

      <!-- 用户表格 -->
      <Table
        :columns="columns"
        :data-source="userList"
        :loading="loading"
        :pagination="{
          current: currentPage,
          pageSize,
          total,
          onChange: handlePageChange,
          showSizeChanger: false,
          showTotal: (t: number) => `共 ${t} 条`,
        }"
        row-key="id"
        size="small"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <Space>
              <Button
                size="small"
                type="primary"
                @click="handleEdit(record as UserItem)"
              >
                编辑
              </Button>
              <Popconfirm
                title="确定要重置密码吗？"
                @confirm="handleResetPassword(record.id)"
              >
                <Button size="small" type="primary"> 重置密码 </Button>
              </Popconfirm>
              <Popconfirm
                title="确定要删除该用户吗？"
                @confirm="handleDelete(record.id)"
              >
                <Button danger size="small" type="primary"> 删除 </Button>
              </Popconfirm>
            </Space>
          </template>
        </template>
      </Table>
    </div>

    <!-- 添加/编辑用户弹窗 -->
    <Modal
      v-model:open="modalVisible"
      :confirm-loading="modalLoading"
      :title="modalTitle"
      @cancel="modalVisible = false"
      @ok="handleConfirmModal"
    >
      <div class="space-y-4 py-4">
        <div>
          <div class="mb-1 text-sm">
            昵称 <span class="text-red-500">*</span>
          </div>
          <Input v-model:value="formData.nickname" placeholder="请输入昵称" />
        </div>
        <div v-if="!formData.id">
          <div class="mb-1 text-sm">
            用户账号 <span class="text-red-500">*</span>
          </div>
          <Input
            v-model:value="formData.account"
            placeholder="请输入用户账号"
          />
        </div>
        <div>
          <div class="mb-1 text-sm">性别</div>
          <Select
            v-model:value="formData.gender"
            :options="[
              { label: '男', value: '男' },
              { label: '女', value: '女' },
              { label: '保密', value: '保密' },
            ]"
            style="width: 100%"
          />
        </div>
        <div>
          <div class="mb-1 text-sm">邮箱</div>
          <Input v-model:value="formData.email" placeholder="请输入邮箱" />
        </div>
        <div>
          <div class="mb-1 text-sm">手机号</div>
          <Input v-model:value="formData.phone" placeholder="请输入手机号" />
        </div>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
.org-tree :deep(.ant-tree-node-content-wrapper) {
  display: flex;
  align-items: center;
}

.org-tree :deep(.ant-tree-title) {
  font-size: 14px;
}

.tree-switcher-icon,
.tree-leaf-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  color: #999;
}

.tree-switcher-icon:hover,
.tree-leaf-icon:hover {
  color: #1890ff;
}

.toolbar-btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-size: 16px;
  color: #666;
  cursor: pointer;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}

.toolbar-btn-icon:hover {
  color: #1890ff;
  border-color: #1890ff;
}

.toolbar-btn-icon-active {
  color: #fff;
  background: #1890ff;
  border-color: #1890ff;
}

.toolbar-btn-icon-active:hover {
  color: #fff;
  background: #40a9ff;
  border-color: #40a9ff;
}
</style>
