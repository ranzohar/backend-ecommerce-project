export const NON_ADMIN_USERNAME = "john";
export const NON_ADMIN_PASSWORD = "password123";
export const ADMIN_USERNAME = "ran";
export const ADMIN_PASSWORD = "123123";

export const MOCK_USER_ID = "507f1f77bcf86cd799439011";

export const MOCK_PRODUCTS = [
  { id: "prod-1", title: "Product 1", price: 10, category: "cat1", description: "desc1" },
  { id: "prod-2", title: "Product 2", price: 20, category: "cat2", description: "desc2" },
];

function calculateTotalPrice(products) {
  return products.reduce((sum, { title, quantity }) => {
    const product = MOCK_PRODUCTS.find((p) => { return p.title === title; });
    return sum + product.price * quantity;
  }, 0);
}

export const MOCK_ORDER_1 = { products: [{ title: "Product 1", quantity: 2 }] };
export const MOCK_ORDER_2 = { products: [{ title: "Product 2", quantity: 1 }] };

export const MOCK_ORDER_1_RESPONSE = {
  products: MOCK_ORDER_1.products,
  totalPrice: calculateTotalPrice(MOCK_ORDER_1.products),
};
export const MOCK_ORDER_2_RESPONSE = {
  products: MOCK_ORDER_2.products,
  totalPrice: calculateTotalPrice(MOCK_ORDER_2.products),
};

const STORED_ORDER_1_PRODUCTS = [{ title: "Product 1", quantity: 2 }];
const STORED_ORDER_2_PRODUCTS = [{ title: "Product 2", quantity: 1 }];

export const MOCK_STORED_ORDERS = [
  {
    totalPrice: calculateTotalPrice(MOCK_ORDER_1.products),
    id: "order-1",
    createdAt: "2026-01-01T00:00:00.000Z",
    products: STORED_ORDER_1_PRODUCTS,
  },
  {
    totalPrice: calculateTotalPrice(MOCK_ORDER_2.products),
    id: "order-2",
    createdAt: "2026-01-01T00:00:00.000Z",
    products: STORED_ORDER_2_PRODUCTS,
  },
];

const USER1_ORDER_1_PRODUCTS = [{ title: "Product 1", quantity: 2 }];
const USER1_ORDER_2_PRODUCTS = [{ title: "Product 2", quantity: 1 }];
const USER2_ORDER_1_PRODUCTS = [{ title: "Product 1", quantity: 3 }];
const USER2_ORDER_2_PRODUCTS = [{ title: "Product 2", quantity: 2 }];

export const MOCK_USER1_ORDERS = [
  {
    totalPrice: calculateTotalPrice(USER1_ORDER_1_PRODUCTS),
    id: "order-1",
    createdAt: "2026-01-01T00:00:00.000Z",
    products: [{ title: "Product 1", quantity: 2 }],
    user: { username: "user1" },
  },
  {
    totalPrice: calculateTotalPrice(USER1_ORDER_2_PRODUCTS),
    id: "order-2",
    createdAt: "2026-01-01T00:00:00.000Z",
    products: [{ title: "Product 2", quantity: 1 }],
    user: { username: "user1" },
  },
];

export const MOCK_USER2_ORDERS = [
  {
    totalPrice: calculateTotalPrice(USER2_ORDER_1_PRODUCTS),
    id: "order-3",
    createdAt: "2026-01-01T00:00:00.000Z",
    products: [{ title: "Product 1", quantity: 3 }],
    user: { username: "user2" },
  },
  {
    totalPrice: calculateTotalPrice(USER2_ORDER_2_PRODUCTS),
    id: "order-4",
    createdAt: "2026-01-01T00:00:00.000Z",
    products: [{ title: "Product 2", quantity: 2 }],
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

export const MOCK_NEW_PRODUCT_ID = "mock-new-id";

export const MOCK_NEW_PRODUCT = {
  title: "New Product",
  price: 30,
  category: "cat3",
  description: "desc3",
};

export const MOCK_CATEGORIES = [
  { id: "507f1f77bcf86cd799439020", name: "Electronics" },
  { id: "507f1f77bcf86cd799439021", name: "Clothing" },
];
