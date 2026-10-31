import { describe, expect, it } from 'vitest';

import { channelNameSchema } from './channel-schema';

const schema = channelNameSchema(key => key);

describe('channelNameSchema', () => {
  it('trims outer whitespace and preserves spaces within a name', async () => {
    await expect(schema.validate({ name: '  Team Chat  ' })).resolves.toEqual({
      name: 'Team Chat',
    });
  });

  it('requires at least one non-whitespace character', async () => {
    await expect(schema.validate({ name: '   ' })).rejects.toThrow(
      'nameRequired'
    );
  });

  it('accepts 80 characters after trim and rejects 81', async () => {
    await expect(
      schema.validate({ name: `  ${'a'.repeat(80)}  ` })
    ).resolves.toBeDefined();
    await expect(schema.validate({ name: 'a'.repeat(81) })).rejects.toThrow(
      'nameTooLong'
    );
  });
});
