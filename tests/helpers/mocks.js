export const NON_ADMIN_USERNAME = "john";
export const NON_ADMIN_PASSWORD = "password123";
export const NEW_USER_USERNAME = "newuser";
export const NEW_USER_PASSWORD = "newpassword123";
export const ADMIN_USERNAME = "ran";
export const ADMIN_PASSWORD = "123123";

export const MOCK_USER_ID = "507f1f77bcf86cd799439011";

export const MOCK_ORDER_1 = { price: 10 };
export const MOCK_ORDER_2 = { price: 20 };

export const MOCK_STORED_ORDERS = [
  { price: 10, id: "order-1", createdAt: "2026-01-01T00:00:00.000Z" },
  { price: 20, id: "order-2", createdAt: "2026-01-01T00:00:00.000Z" },
];

export const MOCK_USER1_ORDERS = [
  {
    price: 10,
    id: "order-1",
    createdAt: "2026-01-01T00:00:00.000Z",
    user: { username: "user1" },
  },
  {
    price: 20,
    id: "order-2",
    createdAt: "2026-01-01T00:00:00.000Z",
    user: { username: "user1" },
  },
];

export const MOCK_USER2_ORDERS = [
  {
    price: 30,
    id: "order-3",
    createdAt: "2026-01-01T00:00:00.000Z",
    user: { username: "user2" },
  },
  {
    price: 40,
    id: "order-4",
    createdAt: "2026-01-01T00:00:00.000Z",
    user: { username: "user2" },
  },
];

export const MOCK_ALL_ORDERS = [...MOCK_USER1_ORDERS, ...MOCK_USER2_ORDERS];

export const MOCK_ORDER = { productId: "prod-1", quantity: 2 };

export const MOCK_USER_WITH_ORDERS = {
  username: ADMIN_USERNAME,
  isAdmin: true,
  orders: [MOCK_ORDER],
};
