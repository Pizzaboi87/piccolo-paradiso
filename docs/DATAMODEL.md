# DATAMODEL

The application uses Appwrite-based persistent data storage. The data model below follows the current implementation.

## 1. Entities

### 1.1 User

**Table:** `User`  
**Role:** source of profile data and order data

Fields:
1. `accountId` (string, required)
2. `email` (email, required)
3. `avatar` (url, required)
4. `firstName` (string, required)
5. `lastName` (string, required)
6. `city` (string)
7. `street` (string)
8. `houseNumber` (string)
9. `floorDoor` (string, optional)
10. `phone` (string)

### 1.2 Category

**Table:** `Category`  
**Role:** product and customization categories

Fields:
1. `name` (string, required)
2. `$id` (system)

### 1.3 Item

**Table:** `Item`  
**Role:** orderable products

Fields:
1. `name` (string, required)
2. `description` (string, required)
3. `image_url` (url, required)
4. `price` (integer, required)
5. `category` (relationship, many-to-one -> `Category`)
6. `$createdAt`, `$updatedAt` (system)

### 1.4 Customization

**Table:** `Customization`  
**Role:** selectable product options

Fields:
1. `name` (string, required)
2. `price` (double, required)
3. `type` (enum, required): `size | topping | side`
4. `category` (relationship, many-to-one -> `Category`)
5. `$createdAt`, `$updatedAt` (system)

### 1.5 orders

**Table:** `orders`  
**Role:** logging orders created from payments

Fields:
1. `userId` (string, required)
2. `orderId` (string, required)
3. `status` (string, required)
4. `customerName` (string, required)
5. `phone` (string, required)
6. `city` (string, required)
7. `street` (string, required)
8. `houseNumber` (string, required)
9. `floorDoor` (string, optional)
10. `itemCount` (integer, required)
11. `itemsJson` (string/text, required)
12. `subtotalHuf` (integer, required)
13. `discountHuf` (integer, required)
14. `deliveryFeeHuf` (integer, required)
15. `totalHuf` (integer, required)
16. `$createdAt`, `$updatedAt` (system)

## 2. Relationships

1. `Category (1) -> (N) Item`
2. `Category (1) -> (N) Customization`
3. `User (1) -> (N) orders` (logical relationship through the `userId` field)
4. `Item (N) <-> (M) Customization`, denormalized at order time and stored in the `itemsJson` field.

## 3. Implementation Notes

1. Order items are saved as snapshots, so the actual checkout state can be reviewed later even if prices change.
2. Admin permission is not stored in the `User` table, but is based on the Appwrite account label (`admin`).
3. Field-level validation is enforced on the server side with the Appwrite schema (required, type, URL, enum, numeric range).
4. Backend write permissions for Item/Customization are restricted to the admin label.
