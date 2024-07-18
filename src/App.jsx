import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider } from 'react-redux';
import { store } from './app/store.js';

import Login from "./pages/Login.jsx";
import Users from "./pages/Users.jsx";
import Layout from "./components/Layout.jsx";
import Orders from "./pages/Orders.jsx";
import Services from "./pages/Services.jsx";
import Gallery from "./pages/Gallery.jsx";

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
    path: "/orders-details",
    element: <Layout><div>Orders details</div></Layout>,
  },
  {
    path: "/services",
    element: <Layout><Services /></Layout>,
  },
  {
    path: "/gallery",
    element: <Layout><Gallery /></Layout>,
  },
  {
    path: "/samples",
    element: <Layout><div>Samples page</div></Layout>,
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
