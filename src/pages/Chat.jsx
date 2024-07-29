import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../reducers/authSlice';
import io from 'socket.io-client';

const socket = io('http://localhost:8000');

const Chat = () => {
    const user = useSelector(selectUser);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [loadingCustomers, setLoadingCustomers] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sendingMessage, setSendingMessage] = useState(false);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                setLoadingCustomers(true);
                const response = await fetch('https://music.zetdigi.com/backend/public/api/chat/list', {
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
                setCustomers(data.chat_list);
            } catch (error) {
                console.error('Error fetching customers:', error);
            } finally {
                setLoadingCustomers(false);
            }
        };

        fetchCustomers();
    }, [user.token]);

    useEffect(() => {
        if (selectedCustomer) {
            socket.emit('joinRoom', { chatId: selectedCustomer.id });

            const fetchMessages = async () => {
                try {
                    setLoadingMessages(true);
                    const response = await fetch(`https://music.zetdigi.com/backend/public/api/massage/fatch?chatId=${selectedCustomer.id}`, {
                        headers: {
                            'Authorization': `Bearer ${user.token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    const data = await response.json();
                    setMessages(data.fetch_message.map((message) => ({ chatId: message.chatId, senderId: message.sender.id, message: message.message, messageType: message.messageType, created_at: message.created_at })) || [] || []);
                } catch (error) {
                    console.error('Error fetching messages:', error);
                } finally {
                    setLoadingMessages(false);
                }
            };

            fetchMessages();

            socket.on('newMessage', (message) => {
                setMessages((prevMessages) => [...prevMessages, message]);
            });

            return () => {
                socket.off('newMessage');
            };
        }
    }, [selectedCustomer, user.token]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (input.trim() && selectedCustomer) {
            try {
                setSendingMessage(true);
                const response = await fetch('https://music.zetdigi.com/backend/public/api/sent/message', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        chatId: selectedCustomer.id,
                        message: input,
                        messageType: 'text'
                    })
                });
                const data = await response.json();
                if (data.success) {
                    const newMessage = {
                        chatId: selectedCustomer.id,
                        senderId: user.id,
                        senderName: user.name,
                        message: input,
                        messageType: 'text',
                        created_at: new Date().toISOString(),
                    };
                    socket.emit('sendMessage', { chatId: selectedCustomer.id, message: input, senderId: user.id, messageType: 'text' });
                    setMessages((prevMessages) => [...prevMessages, newMessage]);
                    setInput('');
                }
            } catch (error) {
                console.error('Error sending message:', error);
            } finally {
                setSendingMessage(false);
            }
        }
    };

    return (
        <div className="flex h-screen">
            <div className="w-1/4 border-r border-gray-200 p-4">
                <h2 className="text-lg font-bold mb-4">Customers</h2>
                {loadingCustomers ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="loader"></div>
                    </div>
                ) : (
                    <ul>
                        {customers.map(customer => (
                            <li
                                key={customer.id}
                                className={`p-2 cursor-pointer ${selectedCustomer?.id === customer.id ? 'bg-gray-200' : ''}`}
                                onClick={() => setSelectedCustomer(customer)}
                            >
                                {customer.senderFirstName}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div className="w-3/4 p-4 flex flex-col">
                {selectedCustomer ? (
                    <>
                        <h2 className="text-lg font-bold mb-4">Chat with {selectedCustomer.senderFirstName}</h2>
                        {loadingMessages ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="loader"></div>
                            </div>
                        ) : (
                            <div className="flex-1 border border-gray-200 p-4 mb-4 overflow-y-auto">
                                {messages.map((message, index) => (
                                    <div key={index} className={`mb-2 ${message.senderId === user.id ? 'text-right' : 'text-left'}`}>
                                        <div className={`inline-block p-2 rounded ${message.senderId === user.id ? 'bg-blue-200' : 'bg-gray-200'}`}>
                                            <p className='text-left'>{message.message}</p>
                                            <span className="text-xs text-gray-600">{new Date(message.created_at).toLocaleTimeString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="flex">
                            <input
                                type="text"
                                className="flex-1 border border-gray-200 p-2 rounded mr-2"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type a message"
                                disabled={sendingMessage}
                            />
                            <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleSendMessage} disabled={sendingMessage}>
                                {sendingMessage ? 'Sending...' : 'Send'}
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