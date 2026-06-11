# COMPONENTS

## 1. Navigation Architecture

### 1.1 Root

- `app/_layout.tsx`
  - global providers (`SafeAreaProvider`, `StripeProvider`)
  - font loading
  - auth bootstrap
  - global feedback host

### 1.2 Auth Branch

- `app/(auth)/_layout.tsx`
- `app/(auth)/sign-in.tsx`
- `app/(auth)/sign-up.tsx`

### 1.3 User Branch

- `app/(tabs)/_layout.tsx`
  - `index.tsx`
  - `search.tsx`
  - `cart.tsx`
  - `profile.tsx`

Related stack screens:
- `app/item/[id].tsx`
- `app/orders.tsx`
- `app/order-tracking.tsx`
- `app/order-delivered.tsx`

### 1.4 Admin Branch

- `app/(admin-tabs)/admin/_layout.tsx`
  - `add.tsx`
  - `edit.tsx`
  - `logout.tsx`

Related admin stack screens:
- `add-product.tsx`
- `add-customization.tsx`
- `edit-product.tsx`
- `edit-product-item/[id].tsx`
- `edit-customization.tsx`
- `edit-customization-item/[id].tsx`

## 2. Reusable UI Components

1. `CustomHeader` - header with a back button and an optional right-side slot.
2. `CustomButton` - central button component with a loading state.
3. `CustomInput` - auth input display.
4. `FormActions` - shared button row for admin forms (Save/Cancel/Delete).
5. `BottomSheetModal` - consistent bottom-up selection panel.
6. `AppKeyboardAwareScrollView` - central keyboard-aware scroll wrapper.
7. `CartButton` - cart icon with a badge counter.
8. `SearchBar` - search UI.
9. `Filter` - category filter chip row.
10. `FeedbackHost` - global toast/dialog display.
11. `SkeletonBlock`, `SkeletonItemCard`, `SkeletonCustomizationRow` - loading states.

## 3. List and Domain Components

1. `ItemCard` - user-facing product card.
2. `AdminProductCard` - admin product card.
3. `CartItem` - cart item UI.
4. `ItemSearchList` - shared search/filter/sort list (user view + admin edit product view).

## 4. State Management (Zustand)

1. `auth.store.ts` - session, user, admin status calculated from the admin label.
2. `cart.store.ts` - cart items, quantity operations, aggregated prices.
3. `delivery.store.ts` - active delivery persistence (`persist` + AsyncStorage).
4. `navigation.store.ts` - back-navigation flow state between screens.
5. `feedback.store.ts` - centralized feedback state.

## 5. Service Layer

1. `lib/appwrite.ts`
   - auth (create/signIn/signOut/getCurrentUser)
   - user profile and avatar
   - item/category/customization CRUD and listing
   - orders query
2. `lib/checkout.ts` - Stripe Appwrite Function call (`/checkout`, `/payment-sheet`).
3. `lib/cloudinary.ts` - admin image upload.
4. `lib/ors.ts` - geocoding and route points.
5. `lib/promotions.ts` - cart promotion calculation.
6. `lib/opening-hours.ts` - opening hours logic.
7. `lib/useAppwrite.ts` - generic async query hook.
8. `lib/useKeyboardAwareScroll.ts` - scroll helper related to keyboard focus.

## 6. Screen-Component Relationships

1. `search.tsx` -> `ItemSearchList` -> `SearchBar` + `Filter` + `BottomSheetModal` + `ItemCard`.
2. `item/[id].tsx` -> `CustomHeader` + `CartButton` + `BottomSheetModal` + `CustomButton`.
3. `cart.tsx` -> `CustomHeader` + `CartItem` + checkout components.
4. `profile.tsx` -> `AppKeyboardAwareScrollView` + `BottomSheetModal` + profile action buttons.
5. `admin/edit-product.tsx` -> `ItemSearchList` + `AdminProductCard`.
6. `admin/edit-customization.tsx` -> custom list + sorting + editor screen.
