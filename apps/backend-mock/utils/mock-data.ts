export interface UserInfo {
  id: number;
  password: string;
  realName: string;
  roles: string[];
  username: string;
  homePath?: string;
}

export const MOCK_USERS: UserInfo[] = [
  {
    id: 0,
    password: '123456',
    realName: 'Vben',
    roles: ['super'],
    username: 'vben',
  },
  {
    id: 1,
    password: '123456',
    realName: 'Admin',
    roles: ['admin'],
    username: 'admin',
    homePath: '/workspace',
  },
  {
    id: 2,
    password: '123456',
    realName: 'Jack',
    roles: ['user'],
    username: 'jack',
    homePath: '/analytics',
  },
];

export const MOCK_CODES = [
  // super
  {
    codes: ['AC_100100', 'AC_100110', 'AC_100120', 'AC_100010'],
    username: 'vben',
  },
  {
    // admin
    codes: ['AC_100010', 'AC_100020', 'AC_100030'],
    username: 'admin',
  },
  {
    // user
    codes: ['AC_1000001', 'AC_1000002'],
    username: 'jack',
  },
];

const dashboardMenus = [
  {
    component: 'BasicLayout',
    meta: {
      order: -1,
      title: 'page.dashboard.title',
    },
    name: 'Dashboard',
    path: '/',
    redirect: '/analytics',
    children: [
      {
        name: 'Analytics',
        path: '/analytics',
        component: '/dashboard/analytics/index',
        meta: {
          affixTab: true,
          title: 'page.dashboard.analytics',
        },
      },
      {
        name: 'Workspace',
        path: '/workspace',
        component: '/dashboard/workspace/index',
        meta: {
          title: 'page.dashboard.workspace',
        },
      },
    ],
  },
];

const createDemosMenus = (role: 'admin' | 'super' | 'user') => {
  const roleWithMenus = {
    admin: {
      component: '/demos/access/admin-visible',
      meta: {
        icon: 'mdi:button-cursor',
        title: 'demos.access.adminVisible',
      },
      name: 'AccessAdminVisibleDemo',
      path: '/demos/access/admin-visible',
    },
    super: {
      component: '/demos/access/super-visible',
      meta: {
        icon: 'mdi:button-cursor',
        title: 'demos.access.superVisible',
      },
      name: 'AccessSuperVisibleDemo',
      path: '/demos/access/super-visible',
    },
    user: {
      component: '/demos/access/user-visible',
      meta: {
        icon: 'mdi:button-cursor',
        title: 'demos.access.userVisible',
      },
      name: 'AccessUserVisibleDemo',
      path: '/demos/access/user-visible',
    },
  };

  return [
    {
      component: 'BasicLayout',
      meta: {
        icon: 'ic:baseline-view-in-ar',
        keepAlive: true,
        order: 1000,
        title: 'demos.title',
      },
      name: 'Demos',
      path: '/demos',
      redirect: '/demos/access',
      children: [
        {
          name: 'AccessDemos',
          path: '/demosaccess',
          meta: {
            icon: 'mdi:cloud-key-outline',
            title: 'demos.access.backendPermissions',
          },
          redirect: '/demos/access/page-control',
          children: [
            {
              name: 'AccessPageControlDemo',
              path: '/demos/access/page-control',
              component: '/demos/access/index',
              meta: {
                icon: 'mdi:page-previous-outline',
                title: 'demos.access.pageAccess',
              },
            },
            {
              name: 'AccessButtonControlDemo',
              path: '/demos/access/button-control',
              component: '/demos/access/button-control',
              meta: {
                icon: 'mdi:button-cursor',
                title: 'demos.access.buttonControl',
              },
            },
            {
              name: 'AccessMenuVisible403Demo',
              path: '/demos/access/menu-visible-403',
              component: '/demos/access/menu-visible-403',
              meta: {
                authority: ['no-body'],
                icon: 'mdi:button-cursor',
                menuVisibleWithForbidden: true,
                title: 'demos.access.menuVisible403',
              },
            },
            roleWithMenus[role],
          ],
        },
      ],
    },
  ];
};

const userManagementMenus = [
  {
    component: 'BasicLayout',
    meta: {
      icon: 'lucide:users',
      order: 2,
      title: '用户管理',
    },
    name: 'UserManagement',
    path: '/system',
    children: [
      {
        name: 'Organization',
        path: '/system/organization',
        component: '/system/organization/index',
        meta: {
          icon: 'lucide:building-2',
          title: '组织管理',
        },
      },
      {
        name: 'UserList',
        path: '/system/user-list',
        component: '/system/user-list/index',
        meta: {
          icon: 'lucide:users',
          title: '用户管理',
        },
      },
    ],
  },
];

export const MOCK_MENUS = [
  {
    menus: [
      ...dashboardMenus,
      ...userManagementMenus,
      ...createDemosMenus('super'),
    ],
    username: 'vben',
  },
  {
    menus: [
      ...dashboardMenus,
      ...userManagementMenus,
      ...createDemosMenus('admin'),
    ],
    username: 'admin',
  },
  {
    menus: [
      ...dashboardMenus,
      ...userManagementMenus,
      ...createDemosMenus('user'),
    ],
    username: 'jack',
  },
];

export interface Organization {
  id: number;
  name: string;
  parentId: number;
  level: number;
  isLeaf: boolean;
  orderNum: number;
  createTime: string;
  updateTime: string;
  operator: string;
}

export const MOCK_ORGANIZATIONS: Organization[] = [
  {
    id: 1,
    name: '总节点',
    parentId: 0,
    level: 1,
    isLeaf: false,
    orderNum: 1,
    createTime: '2026-07-09 14:05:54',
    updateTime: '2026-08-09 10:02:40',
    operator: '系统管理员',
  },
  {
    id: 2,
    name: '中百罗森',
    parentId: 1,
    level: 2,
    isLeaf: false,
    orderNum: 2,
    createTime: '2026-07-09 14:06:08',
    updateTime: '2026-08-09 10:02:40',
    operator: '系统管理员',
  },
  {
    id: 3,
    name: '顾翔',
    parentId: 1,
    level: 2,
    isLeaf: false,
    orderNum: 3,
    createTime: '2026-07-09 14:06:08',
    updateTime: '2025-11-07 20:10:11',
    operator: '系统管理员',
  },
  {
    id: 4,
    name: '注册机构',
    parentId: 1,
    level: 2,
    isLeaf: true,
    orderNum: 4,
    createTime: '2026-07-09 14:06:08',
    updateTime: '2026-01-14 19:31:12',
    operator: '系统管理员',
  },
  {
    id: 5,
    name: '马来西亚',
    parentId: 1,
    level: 2,
    isLeaf: true,
    orderNum: 5,
    createTime: '2026-07-09 14:06:08',
    updateTime: '2026-05-13 13:00:59',
    operator: '系统管理员',
  },
  {
    id: 6,
    name: '可好便利店',
    parentId: 1,
    level: 2,
    isLeaf: false,
    orderNum: 6,
    createTime: '2026-07-09 14:06:08',
    updateTime: '2026-05-26 11:23:19',
    operator: '系统管理员',
  },
  {
    id: 7,
    name: '橙子便利店',
    parentId: 1,
    level: 2,
    isLeaf: false,
    orderNum: 7,
    createTime: '2026-07-09 14:06:08',
    updateTime: '2026-05-29 10:55:30',
    operator: '系统管理员',
  },
  {
    id: 8,
    name: '喜士多',
    parentId: 1,
    level: 2,
    isLeaf: true,
    orderNum: 8,
    createTime: '2026-07-09 14:06:08',
    updateTime: '2026-06-05 16:55:14',
    operator: '系统管理员',
  },
  {
    id: 9,
    name: '新佳宜',
    parentId: 1,
    level: 2,
    isLeaf: false,
    orderNum: 9,
    createTime: '2026-07-09 14:06:08',
    updateTime: '2026-06-10 14:39:33',
    operator: '系统管理员',
  },
  {
    id: 10,
    name: '美宜佳',
    parentId: 1,
    level: 2,
    isLeaf: false,
    orderNum: 10,
    createTime: '2026-07-09 14:06:08',
    updateTime: '2026-06-10 14:40:12',
    operator: '系统管理员',
  },
  {
    id: 11,
    name: '可多',
    parentId: 1,
    level: 2,
    isLeaf: false,
    orderNum: 11,
    createTime: '2026-07-09 14:06:08',
    updateTime: '2026-07-06 15:42:58',
    operator: '系统管理员',
  },
];

export interface MockUser {
  id: number;
  nickname: string;
  account: string;
  gender: string;
  orgId: number;
  orgName: string;
  email: string;
  phone: string;
  createTime: string;
  status: string;
  operator?: string;
}

export const MOCK_USER_LIST: MockUser[] = [
  {
    id: 1,
    nickname: '蔡小姐',
    account: '蔡小姐',
    gender: '女',
    orgId: 1,
    orgName: '总节点',
    email: '',
    phone: '13533142729',
    createTime: '2026-07-06 14:00:00',
    status: '同意',
  },
  {
    id: 2,
    nickname: '美宜佳管理员',
    account: '美宜佳管…',
    gender: '保密',
    orgId: 10,
    orgName: '美宜佳',
    email: '13100000000@…',
    phone: '13100000000',
    createTime: '2026-07-06 11:00:00',
    status: '同意',
  },
  {
    id: 3,
    nickname: '新佳宜管理员',
    account: '新佳宜管…',
    gender: '保密',
    orgId: 9,
    orgName: '新佳宜',
    email: '13200000000@…',
    phone: '13200000000',
    createTime: '2026-07-06 11:00:00',
    status: '同意',
  },
  {
    id: 4,
    nickname: '喜士多管理员',
    account: '喜士多管…',
    gender: '保密',
    orgId: 8,
    orgName: '喜士多',
    email: '13300000000@…',
    phone: '13300000000',
    createTime: '2026-07-06 11:00:00',
    status: '同意',
  },
  {
    id: 5,
    nickname: '橙子便利店管理员',
    account: '橙子便利…',
    gender: '保密',
    orgId: 7,
    orgName: '橙子便利店',
    email: '13400000000@…',
    phone: '13400000000',
    createTime: '2026-07-06 11:00:00',
    status: '同意',
  },
  {
    id: 6,
    nickname: '可好便利店管理员',
    account: '可好便利…',
    gender: '保密',
    orgId: 6,
    orgName: '可好便利店',
    email: '13500000000@…',
    phone: '13500000000',
    createTime: '2026-07-06 11:00:00',
    status: '同意',
  },
  {
    id: 7,
    nickname: '中百罗森管理员',
    account: '中百罗森…',
    gender: '保密',
    orgId: 2,
    orgName: '中百罗森',
    email: '13600000000@…',
    phone: '13600000000',
    createTime: '2026-07-06 10:00:00',
    status: '同意',
  },
  {
    id: 8,
    nickname: '苏02843',
    account: '苏02843',
    gender: '男',
    orgId: 3,
    orgName: '天门顾翔',
    email: '',
    phone: '13104459010',
    createTime: '2026-06-15 15:00:00',
    status: '同意',
    operator: '王静静',
  },
  {
    id: 9,
    nickname: '杨晋刚',
    account: '杨晋刚',
    gender: '男',
    orgId: 1,
    orgName: '总节点',
    email: '2922001251@qq…',
    phone: '',
    createTime: '2026-06-06 09:00:00',
    status: '同意',
  },
  {
    id: 10,
    nickname: '申宏春',
    account: '申宏春',
    gender: '男',
    orgId: 1,
    orgName: '总节点',
    email: 'cc_0820@163.c…',
    phone: '19086883310',
    createTime: '2026-06-03 08:00:00',
    status: '同意',
  },
  {
    id: 11,
    nickname: 'stone',
    account: 'stone',
    gender: '男',
    orgId: 1,
    orgName: '总节点',
    email: '87168663@qq.…',
    phone: '',
    createTime: '2026-05-29 08:00:00',
    status: '同意',
  },
  {
    id: 12,
    nickname: '石鸿源',
    account: '石鸿源',
    gender: '男',
    orgId: 1,
    orgName: '总节点',
    email: 'stoneshi@guxia…',
    phone: '',
    createTime: '2026-05-28 10:00:00',
    status: '同意',
  },
  {
    id: 13,
    nickname: '可好便利店',
    account: '可好便利店',
    gender: '男',
    orgId: 6,
    orgName: '可好便利店',
    email: '2922001252@qq…',
    phone: '',
    createTime: '2026-05-26 11:00:00',
    status: '同意',
  },
  {
    id: 14,
    nickname: '周先生',
    account: '周先生',
    gender: '男',
    orgId: 3,
    orgName: '顾翔',
    email: '295235883@qq…',
    phone: '13301660335',
    createTime: '2026-05-13 10:00:00',
    status: '同意',
  },
  {
    id: 15,
    nickname: '马银立',
    account: '马银立',
    gender: '男',
    orgId: 5,
    orgName: '马来西亚',
    email: '13621148652@…',
    phone: '13621148652',
    createTime: '2026-04-26 17:00:00',
    status: '同意',
  },
];
