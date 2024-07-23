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

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout><div>Home</div></Layout>,
  },
  {
    path: "/users",
    element: <Layout><Users /></Layout>,
  },
  {
    path: "/orders",
    element: <Layout><Orders /></Layout>,
  },
  {
    path: "/labels",
    element: <Layout><Labels /></Layout>,
  },
  {
    path: "/Categories",
    element: <Layout><Categories /></Layout>,
  },
  {
    path: "/orders-details",
    element: <Layout><div>Orders details</div></Layout>,
  },
  {
    path: "/services",
    element: <Layout><Services /></Layout>,
  },
  {
    path: "/service-detail/:id",
    element: <Layout><ServiceDetail /></Layout>,
  },
  {
    path: "/gallery",
    element: <Layout><Gallery /></Layout>,
  },
  {
    path: "/samples",
    element: <Layout><Samples /></Layout>,
  },
  {
    path: "/new-letter",
    element: <Layout><Newsletter /></Layout>,
  },
  {
    path: "/contact-us",
    element: <Layout><ContactForm /></Layout>,
  },
  {
    path: "/order-us",
    element: <Layout><OrderForm /></Layout>,
  },
  {
    path: "/login",
    element: <Login />,
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
