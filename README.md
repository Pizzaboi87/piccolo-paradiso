# Piccolo Paradiso - Mobile Project

> **Student name:** Weiser Peter  
> **Project topic:** Online food ordering  
> **Framework:** React Native (Expo + Expo Router)

---

## Short Description

The application is a mobile ordering system for a pizzeria:

1. User view: registration/login, search-filter-sort, cart, payment, order tracking.
2. Admin view: CRUD operations for products and customizations.

Backend: Appwrite (auth + database + function + storage), payment: Stripe, routing: ORS + Google Maps SDK.

---

## Documentation

1. [SPECIFICATION.md](docs/SPECIFICATION.md)
2. [DATAMODEL.md](docs/DATAMODEL.md)
3. [COMPONENTS.md](docs/COMPONENTS.md)
4. [BACKEND_PERMISSIONS.md](docs/BACKEND_PERMISSIONS.md)
5. [AI_PROMPT_LOG.md](docs/AI_PROMPT_LOG.md)
6. [piccolo_design.pdf](docs/piccolo_design.pdf)
7. [piccolo_design.fig](docs/piccolo_design.fig)

---

## Local Setup

### Prerequisites

1. Node.js 20+
2. npm 10+
3. Expo CLI (`npx expo ...`)
4. Android Studio / iOS Simulator (depending on the target platform)
5. Appwrite project and data
6. Stripe project (test keys)
7. OpenRouteService API key
8. Google Maps API key (required for the Android MapView native SDK)

### Installation and Running

```bash
git clone <repo-url>
cd food-order
npm install
npx expo start -c
```

Expo commands:

```bash
npm run android
npm run ios
npm run web
npm run lint
npm test -- --watchman=false
npm run test:coverage -- --watchman=false
```

---

## Environment Variables

Required `EXPO_PUBLIC_*` environment keys:

```
EXPO_PUBLIC_APPWRITE_PROJECT_ID
EXPO_PUBLIC_APPWRITE_PROJECT_NAME
EXPO_PUBLIC_APPWRITE_ENDPOINT
EXPO_PUBLIC_BUNDLE_ID
EXPO_PUBLIC_DATABASE_ID
EXPO_PUBLIC_BUCKET_ID
EXPO_PUBLIC_USERTABLE_ID
EXPO_PUBLIC_CATEGORIES_ID
EXPO_PUBLIC_ITEMS_ID
EXPO_PUBLIC_CUSTOM_ID
EXPO_PUBLIC_ORDERS_ID
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY
EXPO_PUBLIC_STRIPE_CHECKOUT_FUNCTION_ID
EXPO_PUBLIC_STRIPE_MERCHANT_NAME
EXPO_PUBLIC_ORS_API_KEY
EXPO_PUBLIC_GOOGLE_MAPS
EXPO_PUBLIC_CLOUDINARY_KEY
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME
EXPO_PUBLIC_CLOUDINARY_SIGN_FUNCTION_ID
```

Note: for production builds, these must also be added to the EAS environment.

---

## Build and Distribution

EAS build:

```bash
eas build --platform android --profile preview
```

`eas.json` currently uses the `NPM_CONFIG_INCLUDE=optional` setting for build compatibility.

APK/test build distribution:

- [Download the application](https://github.com/Pizzaboi87/piccolo-paradiso/releases/download/release/piccolo.apk)

---

## Demo Video

[![Demo video](assets/images/youtube.jpg)](https://youtu.be/orzJgKPX124)

Watch on YouTube:

- [Open YouTube](https://youtu.be/orzJgKPX124)

---

## Project Structure (Brief)

```text
__tests__/          integration and unit tests
app/                screens, route layouts (auth/user/admin)
components/         reusable UI components
lib/                service layer, hooks, domain logic
store/              Zustand stores
constants/          design tokens, static data, asset exports
docs/               documentation required for submission
assets/             images, icons, and fonts used in the project
```
