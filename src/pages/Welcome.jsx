import LOGO from "../assets/images/logo.png";

const Welcome = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
            <img src={LOGO} className="w-32 md:w-40 lg:w-48 mb-8 md:mb-10" alt="Logo" />
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 text-center font-Poppins">
                Welcome to Our Platform!
            </h1>
        </div>
    );
};

export default Welcome;