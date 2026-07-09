import { MOCK_USER_LIST } from '~/utils/mock-data';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const id = Number(query.id);
  const index = MOCK_USER_LIST.findIndex((item) => item.id === id);
  if (index !== -1) {
    MOCK_USER_LIST.splice(index, 1);
  }
  return useResponseSuccess(true);
});
