import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider } from 'react-redux';
import store from "./store.js";

import Login from "./pages/Login.jsx";
import Users from "./pages/Users.jsx";
import Layout from "./components/Layout.jsx";
import Orders from "./pages/Orders.jsx";
import Services from "./pages/Services.jsx";
import Gallery from "./pages/Gallery.jsx";
import Samples from "./pages/Samples.jsx";
import Labels from "./pages/Labels.jsx";
import Categories from "./pages/Categories.jsx";
import ServiceDetail from "./pages/ServiceDetail.jsx";
import Newsletter from "./pages/Newsletter.jsx";
import ContactForm from "./pages/ContactForm.jsx";
import OrderForm from "./pages/OrderForm.jsx";
import ServiceForm from "./pages/ServiceForm.jsx";
import OrderDetail from "./pages/OrderDetail.jsx";
import Tags from "./pages/Tags.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import ForgetPassword from "./pages/ForgetPassword.jsx";
import Coupons from "./pages/Coupons.jsx";
import Welcome from "./pages/Welcome.jsx";
import RestrictedRoute from "./components/RestrictedRoute";
import CouponForm from "./pages/CouponForm.jsx";
import Engineers from "./pages/Engineers.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <Welcome /> },
      {
        path: "/users",
        element: <RestrictedRoute roles={['admin']} element={Users} />,
      },
      {
        path: "/engineers",
        element: <RestrictedRoute roles={['admin']} element={Engineers} />,
      },
      {
        path: "/orders",
        element: <RestrictedRoute roles={['admin', 'engineer', 'user']} element={Orders} />,
      },
      {
        path: "/labels",
        element: <RestrictedRoute roles={['admin']} element={Labels} />,
      },
      {
        path: "/tags",
        element: <RestrictedRoute roles={['admin']} element={Tags} />,
      },
      {
        path: "/categories",
        element: <RestrictedRoute roles={['admin']} element={Categories} />,
      },
      {
        path: "/coupons",
        element: <RestrictedRoute roles={['admin']} element={Coupons} />,
      },
      {
        path: "/add-coupons",
        element: <RestrictedRoute roles={['admin']} element={CouponForm} />,
      },
      {
        path: "/update-coupons",
        element: <RestrictedRoute roles={['admin']} element={CouponForm} />,
      },
      {
        path: "/order-detail/:id",
        element: <RestrictedRoute roles={['admin', 'engineer']} element={OrderDetail} />,
      },
      {
        path: "/services",
        element: <RestrictedRoute roles={['admin']} element={Services} />,
      },
      {
        path: "/add-service",
        element: <RestrictedRoute roles={['admin']} element={ServiceForm} />,
      },
      {
        path: "/edit-service/:id",
        element: <RestrictedRoute roles={['admin']} element={ServiceForm} />,
      },
      {
        path: "/service-detail/:id",
        element: <RestrictedRoute roles={['admin']} element={ServiceDetail} />,
      },
      {
        path: "/gallery",
        element: <RestrictedRoute roles={['admin']} element={Gallery} />,
      },
      {
        path: "/samples",
        element: <RestrictedRoute roles={['admin']} element={Samples} />,
      },
      {
        path: "/new-letter",
        element: <RestrictedRoute roles={['admin']} element={Newsletter} />,
      },
      {
        path: "/contact-us",
        element: <RestrictedRoute roles={['admin']} element={ContactForm} />,
      },
      {
        path: "/order-us",
        element: <RestrictedRoute roles={['admin']} element={OrderForm} />,
      },
    ]
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/forgot-password",
    element: <ForgetPassword />,
  },
  {
    path: "/reset-password/:token",
    element: <ResetPassword />,
  },
  {
    path: "*",
    element: <div>Not Found</div>,
  }
]);

const App = () => {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
};

export default App;