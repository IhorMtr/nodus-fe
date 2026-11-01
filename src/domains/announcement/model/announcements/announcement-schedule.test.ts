import { describe, expect, it } from 'vitest';

import { localDateTimeToIso, toLocalDateTime } from './announcement-schedule';

describe('announcement schedule conversion', () => {
  it('preserves the chosen local minute and includes its UTC offset', () => {
    const local = '2030-04-10T14:35';
    const iso = localDateTimeToIso(local);

    if (!iso) {
      throw new Error('Expected a valid local date');
    }

    expect(iso).toMatch(/^2030-04-10T14:35:00[+-]\d{2}:\d{2}$/);
    expect(toLocalDateTime(iso)).toBe(local);
  });

  it('rejects invalid calendar dates and times', () => {
    expect(localDateTimeToIso('2030-02-30T12:00')).toBeNull();
    expect(localDateTimeToIso('2030-04-10T25:00')).toBeNull();
    expect(localDateTimeToIso('not-a-date')).toBeNull();
  });
});
