# BACKEND_PERMISSIONS

## Important Note

This project does **not** use a Firebase Firestore backend; it uses **Appwrite**.
The `firestore.rules` file in the repository root is included only for evaluator compatibility.

## Appwrite Permission Model

Server-side permission handling for the application happens in Appwrite:

1. Account-level authentication: Appwrite Auth (email/password session).
2. Admin permission: Appwrite account label (`admin`).
3. Collection-level CRUD rules: Appwrite Database collection permission settings.
4. Schema/attribute validation: Appwrite attribute-level type, required, enum, and URL validations.

Code reference:
- `lib/appwrite.ts`: `ensureAdminWriteAccess` admin check based on label.

## Current Collection Permission Settings (Appwrite Console)

The following table shows the currently configured Appwrite permissions
(source: console screenshots `user.png`, `orders.png`, `customization.png`, `category.png`, `item.png`):

| Collection | Role | Create | Read | Update | Delete |
| --- | --- | --- | --- | --- | --- |
| `User` | `Any` | yes | yes | yes | yes |
| `orders` | `Any` | yes | yes | yes | yes |
| `Customization` | `Users` | no | yes | no | no |
| `Customization` | `label:admin` | yes | yes | yes | yes |
| `Category` | `Users` | no | yes | no | no |
| `Category` | `label:admin` | yes | yes | yes | yes |
| `Item` | `Users` | no | yes | no | no |
| `Item` | `label:admin` | yes | yes | yes | yes |

Notes:
1. The `User` and `orders` collections are currently fully open (`Any` full CRUD).
2. For the `Customization`, `Category`, and `Item` collections, read access is granted to `Users`, and all CRUD access is granted to `label:admin`.

## Recommended Hardening (Optional)

1. `User`: replace `Any` with `Users` + document-level ownership rules (`Role.user(<accountId>)`) for update/delete.
2. `orders`: replace `Any` with `Users` for create/read, update only for `label:admin`, and delete disabled or admin-only.

## Attribute-Level Validation (Appwrite Schema)

Validation expectations matching the implementation:

1. `Item.price`: numeric, required, minimum 0
2. `Customization.type`: enum (`size | topping | side`)
3. URL fields (`image_url`, `avatar`): URL type
4. Required identifiers (`accountId`, `userId`, `orderId`)
5. Order financial fields (`subtotalHuf`, `totalHuf`, etc.): integer, minimum 0
