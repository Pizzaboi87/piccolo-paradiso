jest.mock('@/lib/appwrite', () => ({
  appwriteConfig: {},
  functions: {
    createExecution: jest.fn(),
  },
}));

import {
  getCheckoutValidationMessage,
  validateCheckoutProfile,
} from '@/lib/checkout';

describe('checkout profile validation', () => {
  it('valid, ha cím és telefonszám is megvan', () => {
    const result = validateCheckoutProfile({
      street: 'Kölcsey utca',
      houseNumber: '26',
      phone: '+36702066450',
    } as any);

    expect(result).toEqual({
      isValid: true,
      missingAddress: false,
      missingPhone: false,
    });
  });

  it('invalid, ha hiányzik a cím', () => {
    const result = validateCheckoutProfile({
      street: '',
      houseNumber: '',
      phone: '+36702066450',
    } as any);

    expect(result.isValid).toBe(false);
    expect(result.missingAddress).toBe(true);
    expect(result.missingPhone).toBe(false);
  });

  it('invalid, ha hiányzik a telefonszám', () => {
    const result = validateCheckoutProfile({
      street: 'Kölcsey utca',
      houseNumber: '26',
      phone: '   ',
    } as any);

    expect(result.isValid).toBe(false);
    expect(result.missingAddress).toBe(false);
    expect(result.missingPhone).toBe(true);
  });

  it('hibaszöveg felsorolja a hiányzó mezőket', () => {
    const message = getCheckoutValidationMessage({
      isValid: false,
      missingAddress: true,
      missingPhone: true,
    });

    expect(message).toContain('szállítási cím');
    expect(message).toContain('telefonszám');
  });
});
