import { describe, expect, it } from 'vitest';
import { syncHouseholdMembers } from '../../server/infrastructure/repositories/household-repository.mjs';

describe('syncHouseholdMembers', () => {
  it('skips when pool or household is missing', async () => {
    const result = await syncHouseholdMembers(null, { id: 'hh-1', members: [] });
    expect(result.skipped).toBe(true);
    expect(result.reason).toBe('missing_pool_or_household');
  });
});
