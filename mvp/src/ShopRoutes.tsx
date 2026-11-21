import { Route, Routes } from "react-router-dom";
import { Empty } from "./components/Shared";
import { Account } from "./pages/Account";
import { Staff } from "./pages/Staff";
import { Home } from "./pages/Home";
import { Catalog } from "./pages/Catalog";
import { Product } from "./pages/Product";
import { Cart } from "./pages/Cart";
import { Checkout } from "./pages/Checkout";
import { Orders } from "./pages/Orders";
import { OrderDetail } from "./pages/OrderDetail";

export function ShopRoutes({ onAdd }: { onAdd: (id: string) => void }) {
  return (
    <Routes>
      <Route path="/" element={<Home onAdd={onAdd} />} />
      <Route path="/catalog" element={<Catalog onAdd={onAdd} />} />
      <Route path="/product/:id" element={<Product onAdd={onAdd} />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/account" element={<Account />} />
      <Route path="/staff" element={<Staff />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/orders/:id" element={<OrderDetail />} />
      <Route
        path="*"
        element={
          <Empty title="Такой страницы нет">
            Вернитесь в каталог и выберите новый вкус.
          </Empty>
        }
      />
    </Routes>
  );
}
