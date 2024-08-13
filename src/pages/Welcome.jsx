import { Link } from 'react-router-dom';
import LOGO from "../assets/images/logo.png";

const Welcome = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <img src={LOGO} className="w-40 mb-10" alt="Logo" />
            <h1 className="text-4xl font-bold mb-4">Welcome to Our Platform!</h1>
        </div>
    );
};

export default Welcome;