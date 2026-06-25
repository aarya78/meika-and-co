import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Suspense, lazy } from "react";

import Layout from "./components/layout/Layout";
import ScrollToTop from "./hooks/ScrollToTop";
import ScrollToTopOnRouteChange from "./hooks/ScrollToTopOnRouteChange";
import PrivateRoute from "./auth/PrivateRoute";
import PublicRoute from "./auth/PublicRoute";
import { SettingsProvider } from "./contexts/SettingsContext";
import AboutSection from "./components/layout/AboutSectionProps";

const Home = lazy(() => import("./pages/Home"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));

const AdminLayout = lazy(() => import("./admin/AdminLayout"));
const AdminProducts = lazy(() => import("./admin/components/AdminProducts"));
const Categories = lazy(() => import("./admin/components/Categories"));
const AddProduct = lazy(() => import("./admin/components/AddProduct"));
const Settings = lazy(() => import("./admin/components/Settings"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));

function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <ScrollToTopOnRouteChange />
        <ScrollToTop />
        <Suspense fallback={<div className="min-h-screen">Loading…</div>}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<AboutSection />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            <Route element={<PublicRoute />}>
              <Route path="/admin-login" element={<AdminLogin />} />
            </Route>

            <Route element={<PrivateRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminProducts />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="categories" element={<Categories />} />
                <Route path="add-product" element={<AddProduct />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </SettingsProvider>
    </BrowserRouter>
  );
}

export default App;
