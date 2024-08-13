import propTypes from 'prop-types';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../reducers/authSlice';

// This component will accept the required roles and the component to render if the user has the correct role
const RestrictedRoute = ({ roles, element: Component }) => {
  // Assuming your user role is stored in the redux store
  const user = useSelector(selectUser);

  // Check if the user's role is included in the allowed roles
  if (roles.includes(user?.role)) {
    return <Component />;
  } else {
    // Redirect to a "not authorized" page or login page
    return <Navigate to="/" />;
  }
};

RestrictedRoute.propTypes = {
  roles: propTypes.array.isRequired,
  element: propTypes.elementType.isRequired,
};

export default RestrictedRoute;