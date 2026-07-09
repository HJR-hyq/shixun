import { MOCK_ORGANIZATIONS } from '~/utils/mock-data';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const org = MOCK_ORGANIZATIONS.find((item) => item.id === body.id);
  if (org) {
    org.name = body.name;
    org.updateTime = new Date().toISOString().replace('T', ' ').slice(0, 19);
  }
  return useResponseSuccess(org);
});
