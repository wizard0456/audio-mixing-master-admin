import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../reducers/authSlice';
import io from 'socket.io-client';
import { Oval } from 'react-loader-spinner';
import ScrollToBottom from 'react-scroll-to-bottom';
import { AiOutlineLoading3Quarters, AiOutlineFile, AiOutlineSend, AiOutlineMessage, AiOutlineClose } from 'react-icons/ai';
import { BiPlus } from 'react-icons/bi';

const socket = io('http://localhost:8000');

const Chat = () => {
    const user = useSelector(selectUser);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [file, setFile] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [allCustomers, setAllCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [loadingCustomers, setLoadingCustomers] = useState(true);
    const [loadingAllCustomers, setLoadingAllCustomers] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [activeTab, setActiveTab] = useState('messages');
    const [showNewMessageModal, setShowNewMessageModal] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [typing, setTyping] = useState(false);
    const [typingUsers, setTypingUsers] = useState([]);
    const typingTimeout = useRef(null);

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

    const fetchAllCustomers = async () => {
        try {
            setLoadingAllCustomers(true);
            const response = await fetch('https://music.zetdigi.com/backend/public/api/chat/list?chat_room=all', {
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            setAllCustomers(data.chat_list);
        } catch (error) {
            console.error('Error fetching all customers:', error);
        } finally {
            setLoadingAllCustomers(false);
        }
    };

    useEffect(() => {
        if (user.token) {
            if (activeTab === 'messages') {
                fetchCustomers();
            } else if (activeTab === 'allCustomers') {
                fetchAllCustomers();
            }
        }
    }, [user.token, activeTab]);

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
                    setMessages(data.fetch_message.map((message) => ({
                        chatId: message.chatId,
                        senderId: message.sender.id,
                        message: message.message,
                        messageType: message.messageType,
                        created_at: message.created_at
                    })) || []);
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

            socket.on('typing', ({ userId, userName }) => {
                setTypingUsers((prevUsers) => [...prevUsers, { userId, userName }]);
            });

            socket.on('stopTyping', ({ userId }) => {
                setTypingUsers((prevUsers) => prevUsers.filter((user) => user.userId !== userId));
            });

            return () => {
                socket.off('newMessage');
                socket.off('typing');
                socket.off('stopTyping');
            };
        }
    }, [selectedCustomer, user.token]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if ((input.trim() || file) && selectedCustomer) {
            try {
                setSendingMessage(true);
                const formData = new FormData();
                formData.append('chatId', selectedCustomer.id);
                formData.append('senderId', user.id);

                formData.append('image_file', file);
                formData.append('messageType', 'file');

                formData.append('message', input);
                formData.append('messageType', 'text');


                const response = await fetch('https://music.zetdigi.com/backend/public/api/sent/message', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                    },
                    body: formData
                });
                const data = await response.json();
                if (data.success) {
                    socket.emit('sendMessage', { chatId: selectedCustomer.id, message: input || file.name, senderId: user.id, messageType: file ? 'file' : 'text' });
                    setInput('');
                    setFile(null);
                    socket.emit('stopTyping', { chatId: selectedCustomer.id, userId: user.id });
                }
            } catch (error) {
                console.error('Error sending message:', error);
            } finally {
                setSendingMessage(false);
            }
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage(e);
        }
    };

    const handleTyping = (e) => {
        setInput(e.target.value);
        if (!typing) {
            setTyping(true);
            socket.emit('typing', { chatId: selectedCustomer.id, userId: user.id, userName: user.name });
        }
        if (typingTimeout.current) {
            clearTimeout(typingTimeout.current);
        }
        typingTimeout.current = setTimeout(() => {
            setTyping(false);
            socket.emit('stopTyping', { chatId: selectedCustomer.id, userId: user.id });
        }, 2000);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            try {
                setLoadingSearch(true);
                const response = await fetch(`https://music.zetdigi.com/backend/public/api/chat/list?smart_searching=${searchQuery}`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
                setSearchResults(data.chat_list);
                console.log(data.chat_list);
            } catch (error) {
                console.error('Error searching users:', error);
            } finally {
                setLoadingSearch(false);
            }
        }
    };

    const handleSelectUser = (user) => {
        setSelectedCustomer(user);
        setShowNewMessageModal(false);
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleCloseModal = () => {
        setShowNewMessageModal(false);
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleCustomerClick = async (customer) => {
        setSelectedCustomer(customer);
        try {
            await fetch(`https://music.zetdigi.com/backend/public/api/massage/fatch?chatId=${customer.id}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json'
                }
            });
            fetchCustomers();
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    };

    return (
        <div className="flex h-screen">
            <div className="w-1/4 border-r border-gray-200 p-4">
                <div className='flex items-center justify-between'>
                    <h2 className="text-lg font-bold mb-4">Customers</h2>

                    <button
                        className="w-fit bg-blue-500 text-white p-2 rounded mb-4 flex items-center justify-center"
                        onClick={() => setShowNewMessageModal(true)}
                    >
                        <BiPlus className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex mb-4">
                    <button
                        className={`flex-1 p-2 ${activeTab === 'messages' ? 'bg-gray-300' : ''}`}
                        onClick={() => setActiveTab('messages')}
                    >
                        Messages
                    </button>
                    <button
                        className={`flex-1 p-2 ${activeTab === 'allCustomers' ? 'bg-gray-300' : ''}`}
                        onClick={() => setActiveTab('allCustomers')}
                    >
                        All Customers
                    </button>
                </div>

                {activeTab === 'messages' && (
                    <>
                        {loadingCustomers ? (
                            <div className='flex justify-center items-center'>
                                <Oval height={40}
                                    width={40}
                                    color="#4fa94d"
                                    wrapperStyle={{}}
                                    wrapperClass=""
                                    visible={true}
                                    ariaLabel='oval-loading'
                                    secondaryColor="#4fa94d"
                                    strokeWidth={2}
                                    strokeWidthSecondary={2} />
                            </div>
                        ) : (
                            <ul>
                                {customers && customers.map(customer => (
                                    <li
                                        key={customer.id}
                                        className={`p-2 cursor-pointer ${selectedCustomer?.id === customer.id ? 'bg-gray-200' : ''}`}
                                        onClick={() => handleCustomerClick(customer)}
                                    >
                                        {customer.senderFirstName} {customer.unread_messages > 0 && (
                                            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs ml-2">
                                                {customer.unread_messages}
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </>
                )}
                {activeTab === 'allCustomers' && (
                    <>
                        {loadingAllCustomers ? (
                            <div className='flex justify-center items-center'>
                                <Oval height={40}
                                    width={40}
                                    color="#4fa94d"
                                    wrapperStyle={{}}
                                    wrapperClass=""
                                    visible={true}
                                    ariaLabel='oval-loading'
                                    secondaryColor="#4fa94d"
                                    strokeWidth={2}
                                    strokeWidthSecondary={2} />
                            </div>
                        ) : (
                            <ul>
                                {allCustomers && allCustomers.map(customer => (
                                    <li
                                        key={customer.id}
                                        className={`p-2 cursor-pointer ${selectedCustomer?.id === customer.id ? 'bg-gray-200' : ''}`}
                                        onClick={() => handleCustomerClick(customer)}
                                    >
                                        {customer.senderFirstName} {customer.unread_messages > 0 && (
                                            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs ml-2">
                                                {customer.unread_messages}
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </>
                )}
            </div>
            <div className="w-3/4 p-4 flex flex-col">
                {selectedCustomer ? (
                    <>
                        <h2 className="text-lg font-bold mb-4">Chat with {selectedCustomer.senderFirstName}</h2>

                        {loadingMessages ? (
                            <div className='flex justify-center items-center flex-1 '>
                                <Oval height={40}
                                    width={40}
                                    color="#4fa94d"
                                    wrapperStyle={{}}
                                    wrapperClass=""
                                    visible={true}
                                    ariaLabel='oval-loading'
                                    secondaryColor="#4fa94d"
                                    strokeWidth={2}
                                    strokeWidthSecondary={2} />
                            </div>
                        ) : (
                            <ScrollToBottom className="flex-1 border border-gray-200 p-4 mb-4 overflow-y-auto">
                                {messages && messages.map((message, index) => (
                                    <div key={index} className={`mb-2 ${message.senderId === user.id ? 'text-right' : 'text-left'}`}>
                                        <div className={`inline-block p-2 rounded ${message.senderId === user.id ? 'bg-blue-200' : 'bg-gray-200'}`}>
                                            <p className='text-left'>{message.message}</p>
                                            <span className="text-xs text-gray-600">{new Date(message.created_at).toLocaleTimeString()}</span>
                                        </div>
                                    </div>
                                ))}
                                {typingUsers.length > 0 && (
                                    <div className="text-gray-500 text-sm italic">
                                        <AiOutlineLoading3Quarters className="inline-block mr-2 animate-spin" />
                                        {typingUsers.length > 1 ? `${typingUsers.map(user => user.userName).join(', ')} are typing...` : `${selectedCustomer.senderFirstName} is typing...`}
                                    </div>
                                )}
                            </ScrollToBottom>
                        )}
                        <div className="flex items-center">
                            <input
                                type="text"
                                className="flex-1 border border-gray-200 p-2 rounded mr-2"
                                value={input}
                                onChange={handleTyping}
                                onKeyPress={handleKeyPress}
                                placeholder="Type a message"
                                disabled={sendingMessage}
                            />
                            <input
                                type="file"
                                className="hidden"
                                id="fileUpload"
                                onChange={(e) => setFile(e.target.files[0])}
                                accept="image/*,audio/*"
                                disabled={sendingMessage}
                            />
                            <label
                                htmlFor="fileUpload"
                                className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer flex items-center justify-center"
                            >
                                <AiOutlineFile className="mr-2" />
                                {file ? file.name : 'Attach File'}
                            </label>
                            <button className="bg-blue-500 text-white px-4 py-2 rounded flex items-center justify-center" onClick={handleSendMessage} disabled={sendingMessage}>
                                <AiOutlineSend className="mr-2" />
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

            {showNewMessageModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold">New Message</h2>
                            <button className="bg-red-500 text-white p-2 rounded-full flex items-center justify-center" onClick={handleCloseModal}>
                                <AiOutlineClose />
                            </button>
                        </div>
                        <form onSubmit={handleSearch} className="mb-4">
                            <input
                                type="text"
                                className="border border-gray-200 p-2 rounded mr-2 w-full"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search users..."
                                disabled={loadingSearch}
                            />
                            <button type="submit" className="w-full bg-blue-500 text-white px-4 py-2 rounded flex items-center justify-center mt-2" disabled={loadingSearch}>
                                <AiOutlineMessage className="mr-2" />
                                {loadingSearch ? 'Searching...' : 'Search'}
                            </button>
                        </form>
                        {loadingSearch ? (
                            <div className='flex justify-center items-center'>
                                <Oval height={40}
                                    width={40}
                                    color="#4fa94d"
                                    wrapperStyle={{}}
                                    wrapperClass=""
                                    visible={true}
                                    ariaLabel='oval-loading'
                                    secondaryColor="#4fa94d"
                                    strokeWidth={2}
                                    strokeWidthSecondary={2} />
                            </div>
                        ) : (
                            <ul>
                                {searchResults && searchResults.map(result => (
                                    <li
                                        key={result.id}
                                        className="p-2 cursor-pointer bg-gray-100 rounded mb-2"
                                        onClick={() => handleSelectUser(result)}
                                    >
                                        {result.senderFirstName}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chat;