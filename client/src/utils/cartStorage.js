export const cartOwner = (user) => user?.id || user?._id || "guest";
const key = (owner) => `cart:v2:${owner}`;

export function readCart(storage, owner) {
  try {
    const items = JSON.parse(storage.getItem(key(owner)) || "[]");
    return Array.isArray(items)
      ? items.filter((item) => item?.product?._id && Number.isInteger(item.quantity) && item.quantity > 0)
      : [];
  } catch { return []; }
}

export function writeCart(storage, owner, items) {
  storage.setItem(key(owner), JSON.stringify(items));
}
