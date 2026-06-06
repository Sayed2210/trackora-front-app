import { formatMaskedJson, maskSensitiveValue } from './audit-log.mapper';

describe('audit log mapper masking', () => {
  it('masks nested sensitive keys', () => {
    expect(
      maskSensitiveValue({
        profile: {
          password: 'plain',
          tokens: [{ refreshToken: 'refresh' }, { safe: 'visible' }],
          billing: { cardNumber: '4111111111111111' },
        },
      }),
    ).toEqual({
      profile: {
        password: '[MASKED]',
        tokens: '[MASKED]',
        billing: { cardNumber: '[MASKED]' },
      },
    });
  });

  it('pretty prints old and new value preview safely', () => {
    expect(
      formatMaskedJson({ apiKey: 'secret', nested: { name: 'Acme' } }),
    ).toContain('"apiKey": "[MASKED]"');
    expect(
      formatMaskedJson({ apiKey: 'secret', nested: { name: 'Acme' } }),
    ).toContain('"name": "Acme"');
  });
});
