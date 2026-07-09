<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';

import { Button, Input, message, Modal, Popconfirm } from 'ant-design-vue';

import {
  addOrganizationApi,
  deleteOrganizationApi,
  getOrganizationTreeApi,
  updateOrganizationApi,
} from '#/api/core/auth';

interface OrgItem {
  children?: OrgItem[];
  createTime: string;
  id: number;
  isLeaf: boolean;
  level: number;
  name: string;
  operator: string;
  orderNum: number;
  parentId: number;
  updateTime: string;
}

interface FlatRow {
  createTime: string;
  hasChildren: boolean;
  id: number;
  isLeaf: boolean;
  level: number;
  name: string;
  operator: string;
  parentId: number;
  sequence: string;
  updateTime: string;
}

const loading = ref(false);
const rawList = ref<OrgItem[]>([]);
const expandedRowKeys = ref<number[]>([]);

// 弹窗相关
const modalVisible = ref(false);
const modalTitle = ref('添加组织');
const modalLoading = ref(false);
const formData = ref({ id: 0, name: '', parentId: 0, level: 1 });

// 将扁平列表构建为树
function buildTree(flatList: OrgItem[]): OrgItem[] {
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

// 生成层级序号 Map<id, 序号字符串>
function buildSequenceMap(nodes: OrgItem[], prefix = ''): Map<number, string> {
  const result = new Map<number, string>();
  nodes.forEach((node, index) => {
    const seq = prefix ? `${prefix}.${index + 1}` : `${index + 1}`;
    result.set(node.id, seq);
    if (node.children && node.children.length > 0) {
      const childMap = buildSequenceMap(node.children, seq);
      childMap.forEach((v, k) => result.set(k, v));
    }
  });
  return result;
}

// 将树展平为可见的平铺列表
function buildFlatList(
  nodes: OrgItem[],
  seqMap: Map<number, string>,
  expanded: number[],
): FlatRow[] {
  const noArrowIds = new Set([4, 5, 8]); // 注册机构、马来西亚、喜士多不显示箭头
  const result: FlatRow[] = [];
  function walk(items: OrgItem[]) {
    for (const item of items) {
      const hasChildren = !noArrowIds.has(item.id);
      result.push({
        createTime: item.createTime,
        hasChildren,
        id: item.id,
        isLeaf: item.isLeaf,
        level: item.level,
        name: item.name,
        operator: item.operator,
        parentId: item.parentId,
        sequence: seqMap.get(item.id) || '',
        updateTime: item.updateTime,
      });
      if (hasChildren && expanded.includes(item.id)) {
        walk(item.children!);
      }
    }
  }
  walk(nodes);
  return result;
}

const orgTree = computed(() => buildTree(rawList.value));
const sequenceMap = computed(() => buildSequenceMap(orgTree.value));
const flatRows = computed(() =>
  buildFlatList(orgTree.value, sequenceMap.value, expandedRowKeys.value),
);

const isAllExpanded = computed(() => {
  const allParents = rawList.value
    .filter((item) => !item.isLeaf)
    .map((item) => item.id);
  if (allParents.length === 0) return false;
  return allParents.every((id) => expandedRowKeys.value.includes(id));
});

async function loadOrgList() {
  loading.value = true;
  try {
    const data = await getOrganizationTreeApi();
    if (Array.isArray(data)) {
      rawList.value = data;
      expandedRowKeys.value = data
        .filter((item: OrgItem) => !item.isLeaf)
        .map((item: OrgItem) => item.id);
    }
  } catch {
    message.error('获取组织列表失败');
  } finally {
    loading.value = false;
  }
}

function toggleExpand(id: number) {
  const idx = expandedRowKeys.value.indexOf(id);
  if (idx === -1) {
    expandedRowKeys.value.push(id);
  } else {
    expandedRowKeys.value.splice(idx, 1);
  }
}

function toggleAllExpand() {
  expandedRowKeys.value = isAllExpanded.value
    ? []
    : rawList.value.filter((item) => !item.isLeaf).map((item) => item.id);
}

function toggleFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    document.documentElement.requestFullscreen();
  }
}

function handleAdd(parentId = 0, level = 1) {
  modalTitle.value = '添加组织';
  formData.value = { id: 0, name: '', parentId, level };
  modalVisible.value = true;
}

function handleEdit(record: FlatRow) {
  modalTitle.value = '编辑组织';
  formData.value = {
    id: record.id,
    name: record.name,
    parentId: record.parentId,
    level: record.level,
  };
  modalVisible.value = true;
}

async function handleDelete(id: number) {
  try {
    await deleteOrganizationApi(id);
    message.success('删除成功');
    loadOrgList();
  } catch {
    message.error('删除失败');
  }
}

async function handleConfirmModal() {
  if (!formData.value.name.trim()) {
    message.warning('请输入组织名称');
    return;
  }
  modalLoading.value = true;
  try {
    if (formData.value.id) {
      await updateOrganizationApi({
        id: formData.value.id,
        name: formData.value.name,
      });
      message.success('编辑成功');
    } else {
      await addOrganizationApi({
        name: formData.value.name,
        parentId: formData.value.parentId,
      });
      message.success('添加成功');
    }
    modalVisible.value = false;
    loadOrgList();
  } catch {
    message.error(formData.value.id ? '编辑失败' : '添加失败');
  } finally {
    modalLoading.value = false;
  }
}

onMounted(() => {
  loadOrgList();
});
</script>

<template>
  <div class="p-4">
    <div class="mb-4 flex items-center justify-between">
      <Button type="primary" @click="handleAdd()">添加组织</Button>
      <div class="flex items-center gap-2">
        <button class="toolbar-btn" @click="toggleAllExpand">
          {{ isAllExpanded ? '全部收起' : '全部展开' }}
        </button>
        <button class="toolbar-btn-icon" @click="loadOrgList">↻</button>
        <button class="toolbar-btn-icon" @click="toggleFullscreen">⛶</button>
        <button class="toolbar-btn-icon">⊞</button>
      </div>
    </div>

    <div v-if="loading" class="py-8 text-center text-gray-500">加载中...</div>

    <div v-else class="org-table">
      <!-- 表头 -->
      <div class="org-table-header">
        <div class="org-col org-col-seq">序号</div>
        <div class="org-col org-col-name">组织名称</div>
        <div class="org-col org-col-time">创建时间</div>
        <div class="org-col org-col-time">更新时间</div>
        <div class="org-col org-col-operator">操作人</div>
        <div class="org-col org-col-action">操作</div>
      </div>
      <!-- 表体 -->
      <div v-for="row in flatRows" :key="row.id" class="org-table-row">
        <div class="org-col org-col-seq">
          <span
            v-if="row.hasChildren"
            class="org-expand-icon"
            @click="toggleExpand(row.id)"
          >
            {{ expandedRowKeys.includes(row.id) ? '▼' : '▶' }}
          </span>
          {{ row.sequence }}
        </div>
        <div class="org-col org-col-name">
          <span :style="{ marginLeft: `${(row.level - 1) * 24}px` }">
            {{ row.name }}
          </span>
        </div>
        <div class="org-col org-col-time">{{ row.createTime }}</div>
        <div class="org-col org-col-time">{{ row.updateTime }}</div>
        <div class="org-col org-col-operator">{{ row.operator }}</div>
        <div class="org-col org-col-action">
          <button class="org-btn org-btn-edit" @click="handleEdit(row)">
            编辑
          </button>
          <Popconfirm
            title="确定要删除该组织吗？"
            @confirm="handleDelete(row.id)"
          >
            <button class="org-btn org-btn-delete">删除</button>
          </Popconfirm>
        </div>
      </div>
    </div>

    <Modal
      v-model:open="modalVisible"
      :confirm-loading="modalLoading"
      :title="modalTitle"
      @cancel="modalVisible = false"
      @ok="handleConfirmModal"
    >
      <div class="py-4">
        <div class="mb-2">组织名称</div>
        <Input v-model:value="formData.name" placeholder="请输入组织名称" />
      </div>
    </Modal>
  </div>
</template>

<style scoped>
.org-table {
  border: 1px solid #f0f0f0;
  border-radius: 4px;
}

.org-table-header {
  display: flex;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.org-table-header .org-col {
  font-weight: 600;
  color: #333;
}

.org-table-row {
  display: flex;
  border-bottom: 1px solid #f0f0f0;
}

.org-table-row:nth-child(odd) {
  background: #fff;
}

.org-table-row:nth-child(even) {
  background: #fafafa;
}

.org-table-row:last-child {
  border-bottom: none;
}

.org-table-row:hover {
  background: #e6f7ff;
}

.org-col {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 12px 16px;
}

.org-col-seq {
  flex-shrink: 0;
  width: 100px;
}

.org-col-name {
  flex: 1;
  min-width: 0;
}

.org-col-time {
  flex-shrink: 0;
  width: 200px;
}

.org-col-operator {
  flex-shrink: 0;
  width: 120px;
}

.org-col-action {
  flex-shrink: 0;
  width: 200px;
}

.org-expand-icon {
  flex-shrink: 0;
  width: 14px;
  font-size: 14px;
  color: #1890ff;
  text-align: center;
  cursor: pointer;
  user-select: none;
}

.org-btn {
  padding: 2px 12px;
  margin-right: 8px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  border-radius: 4px;
}

.org-btn:last-child {
  margin-right: 0;
}

.org-btn-edit {
  color: #fff;
  background: #1890ff;
}

.org-btn-edit:hover {
  background: #40a9ff;
}

.org-btn-delete {
  color: #fff;
  background: #ff4d4f;
}

.org-btn-delete:hover {
  background: #ff7875;
}

.toolbar-btn {
  padding: 4px 12px;
  font-size: 14px;
  cursor: pointer;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}

.toolbar-btn:hover {
  color: #1890ff;
  border-color: #1890ff;
}

.toolbar-btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-size: 16px;
  cursor: pointer;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}

.toolbar-btn-icon:hover {
  color: #1890ff;
  border-color: #1890ff;
}
</style>
