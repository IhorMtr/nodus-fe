import { describe, expect, it } from 'vitest';

import { createLoginSchema } from './login-schema';

const schema = createLoginSchema(key => key);

describe('createLoginSchema', () => {
  // ==================== VALIDATION ====================

  it('accepts a valid email and password', async () => {
    const result = await schema.validate({
      email: 'person@example.com',
      password: 'correct horse battery staple',
    });

    expect(result.email).toBe('person@example.com');
  });

  it('trims and lowercases the email before validation', async () => {
    const result = await schema.validate({
      email: '  PERSON@EXAMPLE.COM  ',
      password: 'password',
    });

    expect(result.email).toBe('person@example.com');
  });

  it('rejects a missing email and password with required messages', async () => {
    await expect(
      schema.validate({ email: '', password: '' }, { abortEarly: false })
    ).rejects.toMatchObject({ errors: ['emailRequired', 'passwordRequired'] });
  });

  it('rejects malformed email addresses', async () => {
    await expect(
      schema.validate({ email: 'not-an-email', password: 'password' })
    ).rejects.toMatchObject({ errors: ['emailInvalid'] });
  });

  it('accepts the maximum email and password lengths', async () => {
    const email = `${'a'.repeat(242)}@example.com`;
    const password = 'p'.repeat(128);

    await expect(schema.isValid({ email, password })).resolves.toBe(true);
  });

  it('rejects values beyond the configured maximum lengths', async () => {
    const email = `${'a'.repeat(243)}@example.com`;

    await expect(
      schema.validate(
        { email, password: `${'p'.repeat(128)}x` },
        { abortEarly: false }
      )
    ).rejects.toMatchObject({ errors: ['emailTooLong', 'passwordTooLong'] });
  });
});
