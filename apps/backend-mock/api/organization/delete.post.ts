import { MOCK_ORGANIZATIONS } from '~/utils/mock-data';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const id = Number(query.id);
  const index = MOCK_ORGANIZATIONS.findIndex((item) => item.id === id);
  if (index !== -1) {
    MOCK_ORGANIZATIONS.splice(index, 1);
  }
  return useResponseSuccess(true);
});
