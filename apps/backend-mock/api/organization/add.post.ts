import { MOCK_ORGANIZATIONS } from '~/utils/mock-data';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const newOrg = {
    id: MOCK_ORGANIZATIONS.length + 1,
    name: body.name,
    parentId: body.parentId || 0,
    level: body.level || 1,
    isLeaf: true,
    orderNum: MOCK_ORGANIZATIONS.length + 1,
    createTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
    updateTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
    operator: '系统管理员',
  };
  MOCK_ORGANIZATIONS.push(newOrg);
  return useResponseSuccess(newOrg);
});
