import { Link } from 'react-router-dom';
import LOGO from "../assets/images/logo.png";

const Welcome = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <img src={LOGO} className="w-40 mb-10" alt="Logo" />
            <h1 className="text-4xl font-bold mb-4">Welcome to Our Platform!</h1>
            <p className="text-lg mb-8 text-center px-4">
                Your one-stop solution for managing users, services, orders, and more. Get started by exploring the various features available on the sidebar.
            </p>
            <div className="flex gap-4">
                <Link to="/users" className="text-white font-bold px-4 py-2 bg-green-600 rounded hover:bg-green-700">Manage Users</Link>
                <Link to="/services" className="text-white font-bold px-4 py-2 bg-green-600 rounded hover:bg-green-700">View Services</Link>
                <Link to="/orders" className="text-white font-bold px-4 py-2 bg-green-600 rounded hover:bg-green-700">Track Orders</Link>
            </div>
        </div>
    );
};

export default Welcome;