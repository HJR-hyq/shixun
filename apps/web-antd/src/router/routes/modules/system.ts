import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
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
        component: () => import('#/views/system/organization/index.vue'),
        meta: {
          icon: 'lucide:building-2',
          title: '组织管理',
        },
      },
      {
        name: 'UserList',
        path: '/system/user-list',
        component: () => import('#/views/system/user-list/index.vue'),
        meta: {
          icon: 'lucide:users',
          title: '用户管理',
        },
      },
    ],
  },
];

export default routes;
