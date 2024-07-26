import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../reducers/authSlice';

const Chat = () => {
    const user = useSelector(selectUser);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    useEffect(() => {
        // Fetch customers from an API or state
        // Example: setCustomers([{id: 1, name: 'Customer 1'}, {id: 2, name: 'Customer 2'}]);
    }, []);

    const handleSendMessage = () => {
        if (input.trim() && selectedCustomer) {
            const newMessage = {
                sender: user.name,
                content: input,
                timestamp: new Date().toLocaleTimeString()
            };
            setMessages([...messages, newMessage]);
            setInput('');
        }
    };

    return (
        <div className="flex h-screen">
            <div className="w-1/4 border-r border-gray-200 p-4">
                <h2 className="text-lg font-bold mb-4">Customers</h2>
                <ul>
                    {customers.map(customer => (
                        <li
                            key={customer.id}
                            className={`p-2 cursor-pointer ${selectedCustomer?.id === customer.id ? 'bg-gray-200' : ''}`}
                            onClick={() => setSelectedCustomer(customer)}
                        >
                            {customer.name}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="w-3/4 p-4 flex flex-col">
                {selectedCustomer ? (
                    <>
                        <h2 className="text-lg font-bold mb-4">Chat with {selectedCustomer.name}</h2>
                        <div className="flex-1 border border-gray-200 p-4 mb-4 overflow-y-auto">
                            {messages.map((message, index) => (
                                <div key={index} className="mb-2">
                                    <strong>{message.sender}</strong> <span className="text-xs text-gray-600">{message.timestamp}</span>
                                    <p>{message.content}</p>
                                </div>
                            ))}
                        </div>
                        <div className="flex">
                            <input
                                type="text"
                                className="flex-1 border border-gray-200 p-2 rounded mr-2"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type a message"
                            />
                            <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleSendMessage}>
                                Send
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-gray-500">Select a customer to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;