import { BrowserRouter, Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Products from "./pages/Products";
import Layout from "./components/layout/Layout";
import ProductDetails from "./pages/ProductDetails";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import AdminLayout from "./admin/AdminLayout";
import AdminProducts from "./admin/components/AdminProducts";
import Categories from "./admin/components/Categories";
import AddProduct from "./admin/components/AddProduct";
import Settings from "./admin/components/Settings";
import ScrollToTop from "./hooks/ScrollToTop";
import ScrollToTopOnRouteChange from "./hooks/ScrollToTopOnRouteChange";
import AdminLogin from "./pages/AdminLogin";
import PrivateRoute from "./auth/PrivateRoute";
import PublicRoute from "./auth/PublicRoute";
import { SettingsProvider } from "./contexts/SettingsContext";

function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
      <ScrollToTopOnRouteChange />
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route element={<PublicRoute />}>
          <Route
            path="/admin-login"
            element={<AdminLogin />}
          />
        </Route>

        <Route element={<PrivateRoute />}>
          <Route
            path="/admin"
            element={<AdminLayout />}
          >
            <Route
              index
              element={<AdminProducts />}
            />

            <Route
              path="products"
              element={<AdminProducts />}
            />

            <Route
              path="categories"
              element={<Categories />}
            />

            <Route
              path="add-product"
              element={<AddProduct />}
            />

            <Route
              path="settings"
              element={<Settings />}
            />
          </Route>
        </Route>
      </Routes>
      </SettingsProvider>
    </BrowserRouter>
  );
}

export default App;
