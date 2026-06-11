import { appwriteConfig, functions } from "@/lib/appwrite";
import { User } from "@/type";
import { ExecutionMethod } from "react-native-appwrite";

export type CheckoutOrderItemPayload = {
  itemId: string;
  name: string;
  quantity: number;
  unitBasePriceHuf: number;
  customizations: {
    id: string;
    name: string;
    type: string;
    priceHuf: number;
  }[];
  note: string;
  lineTotalHuf: number;
  isPromoGift?: boolean;
  promoCode?: string;
};

export type CheckoutOrderPayload = {
  userId?: string;
  customerName: string;
  phone: string;
  address: {
    city: string;
    street: string;
    houseNumber: string;
    floorDoor: string;
  };
  itemCount: number;
  items: CheckoutOrderItemPayload[];
  pricing: {
    subtotalHuf: number;
    discountHuf: number;
    deliveryFeeHuf: number;
    totalHuf: number;
  };
};

type CheckoutValidationResult = {
  isValid: boolean;
  missingAddress: boolean;
  missingPhone: boolean;
};

type ExecutionHeader = {
  name?: string;
  value?: string;
  [key: string]: unknown;
};

type PaymentSheetSession = {
  paymentIntentClientSecret: string;
  customerId?: string;
  customerEphemeralKeySecret?: string;
};

const buildLine1 = (user: User | null) =>
  [user?.street?.trim(), user?.houseNumber?.trim()].filter(Boolean).join(" ").trim();

export const validateCheckoutProfile = (
  user: User | null
): CheckoutValidationResult => {
  const hasAddress = Boolean(buildLine1(user));
  const hasPhone = Boolean(user?.phone?.trim());

  return {
    isValid: hasAddress && hasPhone,
    missingAddress: !hasAddress,
    missingPhone: !hasPhone,
  };
};

export const getCheckoutValidationMessage = (
  validation: CheckoutValidationResult
) => {
  const missing: string[] = [];

  if (validation.missingAddress) missing.push("szállítási cím");
  if (validation.missingPhone) missing.push("telefonszám");

  if (missing.length === 0) return "";

  return `A rendeléshez hiányzik: ${missing.join(", ")}.`;
};

const readHeader = (
  headers: ExecutionHeader[] | undefined,
  headerName: string
) => {
  if (!headers?.length) return "";

  const hit = headers.find(
    (h) => (h.name ?? "").toLowerCase() === headerName.toLowerCase()
  );

  return hit?.value ?? "";
};

export const createTemplateCheckoutUrl = async ({
  successUrl,
  failureUrl,
  amountHuf,
  orderPayload,
}: {
  successUrl: string;
  failureUrl: string;
  amountHuf: number;
  orderPayload?: CheckoutOrderPayload;
}) => {
  if (!appwriteConfig.stripeCheckoutFunctionId) {
    throw new Error(
      "Hiányzik az EXPO_PUBLIC_STRIPE_CHECKOUT_FUNCTION_ID beállítás."
    );
  }

  const execution = await functions.createExecution({
    functionId: appwriteConfig.stripeCheckoutFunctionId,
    async: false,
    method: ExecutionMethod.POST,
    xpath: "/checkout",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      successUrl,
      failureUrl,
      amountHuf,
      currency: "huf",
      orderPayload,
    }),
  });

  if (
    execution.responseStatusCode !== 302 &&
    execution.responseStatusCode !== 303
  ) {
    throw new Error("A Stripe checkout endpoint nem adott redirect választ.");
  }

  const location = readHeader(
    (execution.responseHeaders as unknown as ExecutionHeader[]) ?? [],
    "location"
  );

  if (!location) {
    throw new Error("A Stripe checkout URL hiányzik a function válaszból.");
  }

  return location;
};

export const createPaymentSheetSession = async ({
  amountHuf,
  orderPayload,
}: {
  amountHuf: number;
  orderPayload?: CheckoutOrderPayload;
}): Promise<PaymentSheetSession> => {
  if (!appwriteConfig.stripeCheckoutFunctionId) {
    throw new Error(
      "Hiányzik az EXPO_PUBLIC_STRIPE_CHECKOUT_FUNCTION_ID beállítás."
    );
  }

  const execution = await functions.createExecution({
    functionId: appwriteConfig.stripeCheckoutFunctionId,
    async: false,
    method: ExecutionMethod.POST,
    xpath: "/payment-sheet",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amountHuf,
      currency: "huf",
      orderPayload,
    }),
  });

  if (execution.responseStatusCode < 200 || execution.responseStatusCode >= 300) {
    throw new Error(
      "A Stripe PaymentSheet endpoint hibát adott. Ellenőrizd a function /payment-sheet route-ot."
    );
  }

  const responseBodyRaw = execution.responseBody ?? "";
  let responseBody: Record<string, unknown> = {};

  try {
    responseBody = responseBodyRaw ? JSON.parse(responseBodyRaw) : {};
  } catch {
    throw new Error("A PaymentSheet endpoint válasza nem értelmezhető JSON.");
  }

  const paymentIntentClientSecret = String(
    responseBody.paymentIntentClientSecret ?? ""
  ).trim();

  if (!paymentIntentClientSecret) {
    throw new Error(
      "A PaymentSheet válaszból hiányzik a paymentIntentClientSecret."
    );
  }

  const customerId = String(responseBody.customerId ?? "").trim() || undefined;
  const customerEphemeralKeySecret =
    String(responseBody.customerEphemeralKeySecret ?? "").trim() || undefined;

  return {
    paymentIntentClientSecret,
    customerId,
    customerEphemeralKeySecret,
  };
};
