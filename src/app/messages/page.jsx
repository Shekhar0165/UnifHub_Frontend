'use client';
import React, { useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import ChatList from '../Components/Chat/ChatList';
import ChatBox from '../Components/Chat/ChatBox';
import { Button } from '@/components/ui/button';
import { Menu, MessageCircle, MessageSquare, MessagesSquare } from 'lucide-react';
import Header from '../Components/Header/Header';
import Cookies from 'js-cookie';
import axios from 'axios';

const mockChats = [
    {
        id: '1',
        user: {
            name: 'Alice Johnson',
            profileImage: '/Profile.webp',
            isOnline: true,
            status: 'Online',
        },
        lastMessage: {
            text: 'Hey, how are you doing?',
            timestamp: new Date(Date.now() - 1000 * 60 * 5),
        },
        unreadCount: 2,
    },
];

export default function MessagesPage() {
    const [selectedChat, setSelectedChat] = useState(null);
    const [showChatList, setShowChatList] = useState(true);
    const [recipientUser, setRecipientUser] = useState(null);
    const [recipientLoading, setRecipientLoading] = useState(false);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [OtherUserType,setOtherUserType] = useState('')
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const fetchUserData = async () => {
            const userType = localStorage.getItem('UserType');
            const endpoint =
                userType === 'individual'
                    ? `${process.env.NEXT_PUBLIC_API}/user/one`
                    : `${process.env.NEXT_PUBLIC_API}/org`;

            try {
                const response = await fetch(endpoint, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });

                if (response.ok) {
                    const data = await response.json();
                    setUserData(data);
                } else {
                    console.error('Failed to fetch user data');
                    if (response.status === 401) {
                        Cookies.remove('accessToken');
                        Cookies.remove('refreshToken');
                        Cookies.remove('UserType');
                        Cookies.remove('UserId');
                        router.push('/');
                    }
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [router]);

    useEffect(() => {
        const tabId = searchParams.get('tab');
        if (!tabId) return;

        const fetchRecipientUser = async () => {
            setRecipientLoading(true); 

            try {
                const res = await axios.get(
                    `${process.env.NEXT_PUBLIC_API}/chat/user/${tabId}`,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        withCredentials: true,
                    }
                );
                setRecipientUser(res.data);
                setSelectedChat(res.data);

                if (window.innerWidth < 768) {
                    setShowChatList(false);
                }
            } catch (error) {
                console.error('Error fetching recipient user:', error);
            } finally {
                setRecipientLoading(false); // <-- Stop loading
            }
        };

        fetchRecipientUser();
    }, [searchParams]);

    

    const handleChatSelect = (chat) => {
        setSelectedChat(chat);
        setOtherUserType(chat.type)
        if (window.innerWidth < 768) {
            setShowChatList(false);
        }
    };

    

    

    return (
        <>
            <Header />
            <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden fixed top-20 right-4 z-30 rounded-full bg-background shadow-md"
                    onClick={() => setShowChatList(!showChatList)}
                >
                    <MessagesSquare className="h-5 w-5" />
                </Button>

                <div
                    className={`fixed md:relative left-0 z-20 w-full md:w-80 lg:w-96 transform transition-transform duration-300 ease-in-out ${showChatList ? 'translate-x-0' : '-translate-x-full'
                        } md:transform-none`}
                >
                    <ChatList
                        chats={mockChats}
                        activeChat={selectedChat}
                        onChatSelect={handleChatSelect}
                    />
                </div>

                <div className=" flex-1 md:ml-0 ">
                    {loading || recipientLoading ? (
                        <div className="h-full flex items-center justify-center">
                            <p className="text-lg text-muted-foreground">Loading chat...</p>
                        </div>
                    ) : selectedChat ? (
                        <ChatBox recipientUser={selectedChat} type={OtherUserType} currentUser={userData} />
                    ) : (
                        <div className="h-full flex items-center justify-center p-4">
                            <div className="text-center">
                                <h3 className="text-lg font-medium mb-2">Welcome to Messages</h3>
                                <p className="text-muted-foreground">
                                    Select a conversation or start a new one
                                </p>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </>
    );
}
