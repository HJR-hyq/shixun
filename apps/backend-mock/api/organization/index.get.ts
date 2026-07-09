import { MOCK_ORGANIZATIONS } from '~/utils/mock-data';

export default defineEventHandler(async () => {
  return useResponseSuccess(MOCK_ORGANIZATIONS);
});
