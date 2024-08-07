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
import AddService from "./pages/AddService.jsx";
import Chat from "./pages/Chat.jsx";
import OrderDetail from "./pages/OrderDetail.jsx";
import Tags from "./pages/Tags.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import ForgetPassword from "./pages/ForgetPassword.jsx";
import Coupons from "./pages/Coupons.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <div>Home</div> },
      { path: "/users", element: <Users />, },
      { path: "/orders", element: <Orders />, },
      { path: "/labels", element: <Labels />, },
      { path: "/tags", element: <Tags />, },
      { path: "/Categories", element: <Categories />, },
      { path: "/coupons", element: <Coupons />, },
      { path: "/order-detail/:id", element: <OrderDetail />, },
      { path: "/services", element: <Services />, },
      { path: "/add-service", element: <AddService />, },
      { path: "/service-detail/:id", element: <ServiceDetail />, },
      { path: "/chat", element: <Chat />, },
      { path: "/gallery", element: <Gallery />, },
      { path: "/samples", element: <Samples />, },
      { path: "/new-letter", element: <Newsletter />, },
      { path: "/contact-us", element: <ContactForm />, },
      { path: "/order-us", element: <OrderForm />, },
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
    // <h1>

    //   This code
    // </h1>
  );
};

export default App;
