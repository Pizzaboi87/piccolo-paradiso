# Piccolo Paradiso

**Mobile Application Specification**  
**Mobile Development Frameworks - Project Work**  
**React Native (Expo) - Demonstration Project**  
**Spring 2026**

---

## 1. Introduction

Piccolo Paradiso is a mobile food ordering application that implements the ordering workflow of a pizzeria from end to end.  
The goal of the project is to demonstrate the technologies and mobile development patterns learned in the course through a real backend integration.

The system handles two roles:
1. User (customer).
2. Admin (content manager).

### 1.1. Technology Stack

- **React Native + Expo + Expo Router** - mobile client, navigation
- **Appwrite** - authentication, database, storage, function
- **Zustand** - centralized state management
- **Stripe** - payment flow
- **OpenRouteService + react-native-maps** - geocoding and route visualization
- **Cloudinary** - image upload on the admin side

---

## 2. Roles

### 2.1. Admin

The admin user is identified by the Appwrite account label (`admin`). Permissions:

- Create, edit, and delete products
- Create, edit, and delete toppings/sauces
- Use a dedicated admin tab menu (Add, Edit, Logout)

### 2.2. User

The registered user has the following permissions:

- Browse products
- Search, filter, and sort in the list view
- Customize products and manage the cart
- Start payment
- View order tracking and order history
- Manage profile data and avatar

---

## 3. Functional Requirements

1. The user can register and log in with an email/password pair.
2. The system handles session persistence and logout.
3. The user can search products by name.
4. The user can filter by categories.
5. The user can sort the list by name and price in ascending/descending order.
6. On the product detail page, the user can select size/topping/sauce and add a note.
7. The cart handles quantities, promotions, and summaries.
8. Payment is handled through Stripe with an Appwrite Function in between.
9. After a successful order, map-based delivery tracking and the delivered screen are available.
10. The profile page handles address and phone number management.
11. The user can view previous orders.
12. Product and customization CRUD functions are available in the admin view.

---

## 4. Non-Functional Requirements

1. Persistent data storage with an Appwrite backend.
2. Protected routes and role-based UI.
3. Centralized, reactive state management with Zustand stores.
4. Consistent UI based on design tokens (colors, typography, spacing, radius).
5. Handling of loading/empty/error/success states.
6. Safe Area handling on key screens.
7. The application is intentionally **portrait-only** (landscape mode is not a target).
8. Input validation on both client and server side (client-side form validation + Appwrite schema/permission enforcement).

---

## 5. Client-Side Views

### 5.1. Auth Views

- **Sign In** (`/sign-in`)
- **Sign Up** (`/sign-up`)

### 5.2. User Views

- **Home** (`/(tabs)/index`)
- **Search** (`/(tabs)/search`)
- **Cart** (`/(tabs)/cart`)
- **Profile** (`/(tabs)/profile`)
- **Product Details** (`/item/[id]`)
- **Previous Orders** (`/orders`)
- **Order Tracking** (`/order-tracking`)
- **Order Delivered** (`/order-delivered`)

### 5.3. Admin Views

- **Add Home** (`/admin/add`)
- **Edit Home** (`/admin/edit`)
- **Logout** (`/admin/logout`)
- **New Product** (`/admin/add-product`)
- **New Topping/Sauce** (`/admin/add-customization`)
- **Edit Products List** (`/admin/edit-product`)
- **Edit Product** (`/admin/edit-product-item/[id]`)
- **Edit Toppings List** (`/admin/edit-customization`)
- **Edit Topping** (`/admin/edit-customization-item/[id]`)

---

## 6. Installation and Running

The project is based on Expo. Requirements for local execution:

- Node.js 20+
- npm 10+
- Expo CLI (`npx expo`)
- Appwrite, Stripe, ORS, and Google Maps API configuration

The build process uses EAS Build (preview/production profile).

---

## 7. Folder Structure

| Folder / File | Description |
|---|---|
| `/app` | Screens and route layouts (auth, user, admin) |
| `/components` | Reusable UI components |
| `/lib` | Service layer, domain logic, hooks |
| `/store` | Zustand stores |
| `/constants` | Tokens, static data, asset exports |
| `/docs` | Documentation (SPECIFICATION, DATAMODEL, COMPONENTS) |
| `README.md` | Running and build guide |
