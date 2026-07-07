import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'lucide:user',
      order: 9998,
      title: '个人中心',
    },
    name: 'Account',
    path: '/account',
    children: [
      {
        name: 'AccountInfo',
        path: '/account/info',
        component: () => import('#/views/account/info/index.vue'),
        meta: {
          icon: 'lucide:user',
          title: '账号信息',
        },
      },
      {
        name: 'AccountSecurity',
        path: '/account/security',
        component: () => import('#/views/account/security/index.vue'),
        meta: {
          icon: 'lucide:shield-check',
          title: '安全信息',
        },
      },
    ],
  },
];

export default routes;
