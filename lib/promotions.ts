import { CartItemType } from "@/type";

export const HUNGARY_TIMEZONE = "Europe/Budapest";
const MIDWEEK_DISCOUNT_RATE = 0.1;
const PAIR_DEAL_PROMO_CODE = "pair-deal-coca";
const COCA_COLA_NORMAL_IMAGE_URL =
  "https://res.cloudinary.com/ddvst2gen/image/upload/v1773230227/cola_original_ar7wtc.webp";

const isWednesdayInHungary = (date: Date = new Date()) => {
  const weekday = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: HUNGARY_TIMEZONE,
  }).format(date);

  return weekday.toLowerCase() === "wed";
};

export const isMidweekDealActive = (date: Date = new Date()) =>
  isWednesdayInHungary(date);

export const calculateCartSubtotal = (items: CartItemType[]) =>
  items.reduce((sum, item) => {
    const extrasTotal =
      item.customizations?.reduce((extraSum, extra) => extraSum + extra.price, 0) ?? 0;
    const unitPrice = item.price + extrasTotal;
    return sum + unitPrice * item.quantity;
  }, 0);

export const calculateMidweekDealDiscount = (
  subtotal: number,
  date: Date = new Date()
) => {
  if (!isMidweekDealActive(date) || subtotal <= 0) return 0;
  return Math.round(subtotal * MIDWEEK_DISCOUNT_RATE);
};

const isLargePizza = (item: CartItemType) => {
  const selectedSize = (item.customizations ?? []).find(
    (customization) => customization.type === "size"
  );

  if (!selectedSize) return false;

  return selectedSize.name.trim().toLowerCase() === "nagy";
};

export const calculatePairDealGiftQuantity = (items: CartItemType[]) => {
  const largePizzaCount = items.reduce((sum, item) => {
    if (!isLargePizza(item)) return sum;
    return sum + item.quantity;
  }, 0);

  const pairCount = Math.floor(largePizzaCount / 2);
  return pairCount * 2;
};

export const getPromotionalItems = (items: CartItemType[]): CartItemType[] => {
  const cocaGiftQuantity = calculatePairDealGiftQuantity(items);
  if (cocaGiftQuantity === 0) return [];

  return [
    {
      id: "promo-coca-normal",
      name: "Ajándék Coca-Cola",
      price: 0,
      image_url: COCA_COLA_NORMAL_IMAGE_URL,
      quantity: cocaGiftQuantity,
      customizations: [],
      note: "Páros akció ajándék",
      isPromoGift: true,
      promoCode: PAIR_DEAL_PROMO_CODE,
    },
  ];
};

export const calculateCartPricing = (items: CartItemType[], date: Date = new Date()) => {
  const promotionalItems = getPromotionalItems(items);
  const subtotal = calculateCartSubtotal(items);
  const deliveryFee = 0;
  const discount = calculateMidweekDealDiscount(subtotal, date);
  const total = subtotal + deliveryFee - discount;

  return {
    promotionalItems,
    subtotal,
    deliveryFee,
    discount,
    total,
    midweekDealActive: isMidweekDealActive(date),
    pairDealGiftQuantity: promotionalItems.reduce((sum, item) => sum + item.quantity, 0),
  };
};
