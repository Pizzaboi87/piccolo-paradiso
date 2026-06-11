import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import Cart from '@/app/(tabs)/cart';

const mockReplace = jest.fn();
const mockConsumeBackTarget = jest.fn(() => '/');
const mockStartDelivery = jest.fn();
const mockIsDeliveryInProgress = jest.fn(() => false);
const mockClearCart = jest.fn();
const mockInitPaymentSheet = jest.fn();
const mockPresentPaymentSheet = jest.fn();
const mockCreatePaymentSheetSession = jest.fn();

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: (...args: any[]) => mockReplace(...args),
    back: jest.fn(),
    setParams: jest.fn(),
  },
}));

jest.mock('@/store/navigation.store', () => ({
  __esModule: true,
  default: (selector: any) =>
    selector({
      consumeBackTarget: mockConsumeBackTarget,
    }),
}));

jest.mock('@/store/delivery.store', () => ({
  __esModule: true,
  default: (selector: any) =>
    selector({
      startDelivery: mockStartDelivery,
      isDeliveryInProgress: mockIsDeliveryInProgress,
    }),
}));

jest.mock('@/store/auth.store', () => ({
  __esModule: true,
  default: () => ({
    user: {
      $id: 'u1',
      firstName: 'Péter',
      lastName: 'Weiser',
      city: 'Kisvárda',
      street: 'Csillag utca',
      houseNumber: '26',
      floorDoor: '1/2',
      phone: '+36701234567',
    },
  }),
}));

jest.mock('@/store/cart.store', () => ({
  __esModule: true,
  useCartStore: () => ({
    items: [
      {
        id: 'item-1',
        name: 'Margherita',
        price: 2200,
        image_url: 'https://example.com/m.jpg',
        quantity: 1,
        customizations: [],
        note: '',
      },
    ],
    getTotalItems: () => 1,
    clearCart: mockClearCart,
  }),
}));

jest.mock('@/lib/promotions', () => ({
  calculateCartPricing: (items: any[]) => ({
    promotionalItems: [],
    subtotal: 2200,
    deliveryFee: 0,
    discount: 0,
    total: 2200,
    midweekDealActive: false,
    pairDealGiftQuantity: 0,
  }),
}));

jest.mock('@/lib/checkout', () => ({
  validateCheckoutProfile: () => ({ isValid: true, missingAddress: false, missingPhone: false }),
  getCheckoutValidationMessage: () => '',
  createPaymentSheetSession: (...args: any[]) => mockCreatePaymentSheetSession(...args),
}));

jest.mock('@/lib/appwrite', () => ({
  appwriteConfig: {
    stripeCheckoutFunctionId: 'fn_123',
    stripeMerchantName: 'Piccolo Paradiso Pizzéria',
  },
}));

jest.mock('@stripe/stripe-react-native', () => ({
  useStripe: () => ({
    initPaymentSheet: (...args: any[]) => mockInitPaymentSheet(...args),
    presentPaymentSheet: (...args: any[]) => mockPresentPaymentSheet(...args),
  }),
}));

jest.mock('@/components/CartItem', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/components/CustomHeader', () => ({
  __esModule: true,
  default: ({ title }: { title: string }) => <>{title}</>,
}));

describe('Cart checkout integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreatePaymentSheetSession.mockResolvedValue({
      paymentIntentClientSecret: 'pi_secret_123',
      customerId: 'cus_123',
      customerEphemeralKeySecret: 'eph_123',
    });
    mockInitPaymentSheet.mockResolvedValue({});
    mockPresentPaymentSheet.mockResolvedValue({});
  });

  it('sikeres fizetésnél elindítja a kiszállítást, üríti a kosarat és trackingre navigál', async () => {
    const { getByText } = render(<Cart />);

    fireEvent.press(getByText('Rendelés leadása'));

    await waitFor(() => {
      expect(mockCreatePaymentSheetSession).toHaveBeenCalledWith(
        expect.objectContaining({
          amountHuf: 2200,
          orderPayload: expect.objectContaining({
            customerName: 'Weiser Péter',
            itemCount: 1,
          }),
        })
      );
    });

    await waitFor(() => expect(mockInitPaymentSheet).toHaveBeenCalled());
    await waitFor(() => expect(mockPresentPaymentSheet).toHaveBeenCalled());
    await waitFor(() => expect(mockStartDelivery).toHaveBeenCalled());
    await waitFor(() => expect(mockClearCart).toHaveBeenCalled());
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/order-tracking'));
  });
});
