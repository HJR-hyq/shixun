import { MOCK_USER_LIST } from '~/utils/mock-data';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const orgId = query.orgId ? Number(query.orgId) : undefined;
  const nickname = query.nickname as string | undefined;
  const status = query.status as string | undefined;
  const currentPage = Number(query.currentPage || 1);
  const pageSize = Number(query.pageSize || 10);

  let filtered = [...MOCK_USER_LIST];

  if (orgId) {
    filtered = filtered.filter((item) => item.orgId === orgId);
  }
  if (nickname) {
    filtered = filtered.filter(
      (item) =>
        item.nickname.includes(nickname) || item.account.includes(nickname),
    );
  }
  if (status) {
    filtered = filtered.filter((item) => item.status === status);
  }

  const start = (currentPage - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  return useResponseSuccess({
    items,
    total: filtered.length,
  });
});
