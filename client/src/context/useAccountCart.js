import { useEffect, useState } from "react";
import { cartOwner, readCart, writeCart } from "../utils/cartStorage.js";

export default function useAccountCart(user) {
  const owner = cartOwner(user);
  const [snapshot, setSnapshot] = useState(() => ({ owner, items: readCart(localStorage, owner) }));

  // Reset during rendering so children never receive the previous account's cart.
  if (snapshot.owner !== owner) {
    setSnapshot({ owner, items: readCart(localStorage, owner) });
  }

  useEffect(() => {
    // Persist with the snapshot's owner, never the identity from a later render.
    writeCart(localStorage, snapshot.owner, snapshot.items);
  }, [snapshot]);

  const setCart = (update) => setSnapshot((current) => {
    // Ignore callbacks retained by an old account, e.g. a checkout finishing after logout.
    if (current.owner !== owner) return current;
    return { owner, items: typeof update === "function" ? update(current.items) : update };
  });

  return [snapshot.owner === owner ? snapshot.items : [], setCart];
}
