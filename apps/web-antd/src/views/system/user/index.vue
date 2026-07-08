<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import {
  Button,
  Card,
  Input,
  message,
  Select,
  Space,
  Table,
  Tag,
} from 'ant-design-vue';

import {
  getStaffListApi,
  setDisableUserApi,
  updateStaffApi,
} from '#/api/core/auth';

const loading = ref(false);
const userList = ref<any[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const searchUserName = ref('');
const filterApproved = ref<number | undefined>(undefined);

const approvedOptions = [
  { label: '全部', value: undefined },
  { label: '待审核', value: 0 },
  { label: '已审核', value: 1 },
  { label: '已拒绝', value: 2 },
];

const columns = [
  { title: '用户名', dataIndex: 'userName', key: 'userName' },
  { title: '真实姓名', dataIndex: 'realName', key: 'realName' },
  { title: '邮箱', dataIndex: 'email', key: 'email' },
  { title: '手机', dataIndex: 'phoneNum', key: 'phoneNum' },
  { title: '部门', dataIndex: 'orgName', key: 'orgName' },
  { title: '审核状态', dataIndex: 'approved', key: 'approved' },
  { title: '注册时间', dataIndex: 'addtime', key: 'addtime' },
  { title: '操作', key: 'action' },
];

async function loadUserList() {
  loading.value = true;
  try {
    const data = await getStaffListApi({
      currentPage: currentPage.value,
      pageSize: pageSize.value,
      UserName: searchUserName.value,
      Approved: filterApproved.value,
      IsPage: true,
    });
    if (data && Array.isArray(data.items)) {
      data.items.sort(
        (a: any, b: any) =>
          new Date(b.addtime).getTime() - new Date(a.addtime).getTime(),
      );
      userList.value = data.items;
      total.value = data.total || 0;
    }
  } catch {
    message.error('获取用户列表失败');
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  currentPage.value = 1;
  loadUserList();
}

function handlePageChange(page: number) {
  currentPage.value = page;
  loadUserList();
}

function getApprovedTag(approved: number) {
  switch (approved) {
    case 0: {
      return { color: 'orange', text: '待审核' };
    }
    case 1: {
      return { color: 'green', text: '已审核' };
    }
    case 2: {
      return { color: 'red', text: '已拒绝' };
    }
    default: {
      return { color: 'default', text: '未知' };
    }
  }
}

async function handleApprove(record: any) {
  try {
    await updateStaffApi({
      sId: record.staffId,
      realName: record.realName,
      phoneNum: record.phoneNum,
      email: record.email,
      userName: record.userName,
      approved: 1,
    });
    message.success('审核通过');
    loadUserList();
  } catch {
    message.error('审核失败');
  }
}

async function handleReject(record: any) {
  try {
    await updateStaffApi({
      sId: record.staffId,
      realName: record.realName,
      phoneNum: record.phoneNum,
      email: record.email,
      userName: record.userName,
      approved: 2,
    });
    message.success('已拒绝');
    loadUserList();
  } catch {
    message.error('操作失败');
  }
}

async function handleToggleDisable(record: any) {
  try {
    await setDisableUserApi(record.staffId);
    message.success('操作成功');
    loadUserList();
  } catch {
    message.error('操作失败');
  }
}

onMounted(() => {
  loadUserList();
});
</script>

<template>
  <div class="p-4">
    <Card title="用户管理">
      <template #extra>
        <Space>
          <Input
            v-model:value="searchUserName"
            allow-clear
            placeholder="搜索用户名"
            style="width: 200px"
            @press-enter="handleSearch"
          />
          <Select
            v-model:value="filterApproved"
            :options="approvedOptions"
            allow-clear
            placeholder="审核状态"
            style="width: 120px"
            @change="handleSearch"
          />
          <Button type="primary" @click="handleSearch"> 搜索 </Button>
        </Space>
      </template>

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
        row-key="staffId"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'approved'">
            <Tag :color="getApprovedTag(record.approved).color">
              {{ getApprovedTag(record.approved).text }}
            </Tag>
          </template>
          <template v-if="column.key === 'action'">
            <Space>
              <Button
                v-if="record.approved === 0"
                size="small"
                type="link"
                @click="handleApprove(record)"
              >
                通过
              </Button>
              <Button
                v-if="record.approved === 0"
                danger
                size="small"
                type="link"
                @click="handleReject(record)"
              >
                拒绝
              </Button>
              <Button
                danger
                size="small"
                type="link"
                @click="handleToggleDisable(record)"
              >
                禁用
              </Button>
            </Space>
          </template>
        </template>
      </Table>
    </Card>
  </div>
</template>
