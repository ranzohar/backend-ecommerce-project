let mockIdCounter = 0;
export function createMockId() {
  mockIdCounter += 1;
  return mockIdCounter.toString(16).padStart(24, "0");
}

export const NON_ADMIN_USERNAME = "john";
export const NON_ADMIN_PASSWORD = "password123";
export const ADMIN_USERNAME = "ran";
export const ADMIN_PASSWORD = "123123";

export const MOCK_CATEGORIES = [
  { id: createMockId(), name: "cat1" },
  { id: createMockId(), name: "cat2" },
  { id: createMockId(), name: "cat3" },
];

export const MOCK_PRODUCTS = [
  {
    id: createMockId(),
    title: "Product 1",
    price: 10,
    category: MOCK_CATEGORIES[0].name,
    description: "desc1",
  },
  {
    id: createMockId(),
    title: "Product 2",
    price: 20,
    category: MOCK_CATEGORIES[1].name,
    description: "desc2",
  },
];

export const MOCK_ORDERS = [
  { products: [{ title: MOCK_PRODUCTS[0].title, quantity: 2 }] },
  { products: [{ title: MOCK_PRODUCTS[1].title, quantity: 1 }] },
];

export const MOCK_ORDER_RESPONSES = [
  {
    products: MOCK_ORDERS[0].products,
    totalPrice: calculateTotalPrice(MOCK_ORDERS[0].products),
  },
  {
    products: MOCK_ORDERS[1].products,
    totalPrice: calculateTotalPrice(MOCK_ORDERS[1].products),
  },
];

const MOCK_STORED_ORDER_1_ID = createMockId();
const MOCK_STORED_ORDER_2_ID = createMockId();

export const MOCK_STORED_ORDERS = [
  {
    totalPrice: calculateTotalPrice(MOCK_ORDERS[0].products),
    id: MOCK_STORED_ORDER_1_ID,
    createdAt: "2026-01-01T00:00:00.000Z",
    products: MOCK_ORDERS[0].products,
  },
  {
    totalPrice: calculateTotalPrice(MOCK_ORDERS[1].products),
    id: MOCK_STORED_ORDER_2_ID,
    createdAt: "2026-01-01T00:00:00.000Z",
    products: MOCK_ORDERS[1].products,
  },
];

const USER2_ORDER_1_PRODUCTS = [{ title: MOCK_PRODUCTS[0].title, quantity: 3 }];
const USER2_ORDER_2_PRODUCTS = [{ title: MOCK_PRODUCTS[1].title, quantity: 2 }];

const USER1_ORDER_1_ID = createMockId();
const USER1_ORDER_2_ID = createMockId();
const USER2_ORDER_1_ID = createMockId();
const USER2_ORDER_2_ID = createMockId();

export const MOCK_USER1_ORDERS = [
  {
    totalPrice: calculateTotalPrice(MOCK_ORDERS[0].products),
    id: USER1_ORDER_1_ID,
    createdAt: "2026-01-01T00:00:00.000Z",
    products: MOCK_ORDERS[0].products,
    user: { username: "user1" },
  },
  {
    totalPrice: calculateTotalPrice(MOCK_ORDERS[1].products),
    id: USER1_ORDER_2_ID,
    createdAt: "2026-01-01T00:00:00.000Z",
    products: MOCK_ORDERS[1].products,
    user: { username: "user1" },
  },
];

export const MOCK_USER2_ORDERS = [
  {
    totalPrice: calculateTotalPrice(USER2_ORDER_1_PRODUCTS),
    id: USER2_ORDER_1_ID,
    createdAt: "2026-01-01T00:00:00.000Z",
    products: USER2_ORDER_1_PRODUCTS,
    user: { username: "user2" },
  },
  {
    totalPrice: calculateTotalPrice(USER2_ORDER_2_PRODUCTS),
    id: USER2_ORDER_2_ID,
    createdAt: "2026-01-01T00:00:00.000Z",
    products: USER2_ORDER_2_PRODUCTS,
    user: { username: "user2" },
  },
];

export const MOCK_ALL_ORDERS = [...MOCK_USER1_ORDERS, ...MOCK_USER2_ORDERS];

const ALL_PRODUCT_TITLES = MOCK_PRODUCTS.map(({ title }) => {
  return title;
});

export const MOCK_STATS_RAW = buildStatsRaw(
  MOCK_ALL_ORDERS,
  ALL_PRODUCT_TITLES,
);

export const MOCK_USER1_STATS_RAW = buildStatsRaw(
  MOCK_USER1_ORDERS,
  ALL_PRODUCT_TITLES,
);

export const MOCK_PRODUCT1_STATS_RAW = buildStatsRaw(MOCK_ALL_ORDERS, [
  MOCK_PRODUCTS[0].title,
]);

export const MOCK_STATS = buildStats(MOCK_STATS_RAW);
export const MOCK_USER1_STATS = buildStats(MOCK_USER1_STATS_RAW);
export const MOCK_PRODUCT1_STATS = buildStats(MOCK_PRODUCT1_STATS_RAW);

export const MOCK_USER_WITH_ORDERS = {
  username: ADMIN_USERNAME,
  isAdmin: true,
  orders: [MOCK_ORDERS[0]],
};

function calculateTotalPrice(products) {
  return products.reduce((sum, { title, quantity }) => {
    const product = MOCK_PRODUCTS.find((p) => {
      return p.title === title;
    });
    return sum + product.price * quantity;
  }, 0);
}

function calculateTotalQuantity(orders, title) {
  return orders.reduce((sum, order) => {
    const match = order.products.find((p) => {
      return p.title === title;
    });
    return sum + (match?.quantity ?? 0);
  }, 0);
}

function buildStatsRaw(orders, titles) {
  return titles.map((title) => {
    return { title, totalQuantity: calculateTotalQuantity(orders, title) };
  });
}

function buildStats(raw) {
  return raw.reduce((acc, { title, totalQuantity }) => {
    acc[title] = totalQuantity;
    return acc;
  }, {});
}
