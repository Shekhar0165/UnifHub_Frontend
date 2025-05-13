'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ChatList from '../Components/Chat/ChatList';
import ChatBox from '../Components/Chat/ChatBox';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import Header from '../Components/Header/Header';

// Single mock chat for testing - you'll replace this with real data
const mockChats = [
    {
        id: '1',
        user: {
            name: 'Alice Johnson',
            profileImage: '/Profile.webp',
            isOnline: true,
            status: 'Online'
        },
        lastMessage: {
            text: 'Hey, how are you doing?',
            timestamp: new Date(Date.now() - 1000 * 60 * 5)
        },
        unreadCount: 2
    }
];

export default function MessagesPage() {
    const [selectedChat, setSelectedChat] = useState(null);
    const [showChatList, setShowChatList] = useState(true);
    const searchParams = useSearchParams();
    const router = useRouter();

    // Handle initial load and URL changes

    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);


    // Fetch user data on component mount
    useEffect(() => {
        const Usertype = localStorage.getItem('UserType');

        const endpoint = Usertype === 'individual'
            ? `${process.env.NEXT_PUBLIC_API}/user/one`
            : `${process.env.NEXT_PUBLIC_API}/org`;
        const fetchUserData = async () => {
            try {
                // Check if user is authenticated (has token)

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
                    // Handle authentication error (e.g., token expired)
                    if (response.status === 401) {
                        // Clear tokens and redirect to login
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
        if (tabId) {
            // Find the chat that matches the URL parameter
            const chatFromUrl = mockChats.find(chat => chat.id === tabId);
            if (chatFromUrl) {
                setSelectedChat(chatFromUrl);
                if (window.innerWidth < 768) {
                    setShowChatList(false);
                }
            }
        }
    }, [searchParams]);

    const handleChatSelect = (chat) => {
        setSelectedChat(chat);
        if (window.innerWidth < 768) {
            setShowChatList(false);
        }
    };

    console.log("message", selectedChat);

    return (
        <>
            <Header />
            <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
                {/* Mobile toggle button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden fixed top-20 left-4 z-30 rounded-full bg-background shadow-md"
                    onClick={() => setShowChatList(!showChatList)}
                >
                    <Menu className="h-5 w-5" />
                </Button>

                {/* Chat List */}
                <div className={`
        fixed md:relative  left-0 z-20 w-full md:w-80 lg:w-96
        transform transition-transform duration-300 ease-in-out
        ${showChatList ? 'translate-x-0' : '-translate-x-full'}
        md:transform-none
      `}>
                    <ChatList
                        chats={mockChats}
                        activeChat={selectedChat}
                        onChatSelect={handleChatSelect}
                    />
                </div>

                {/* Chat Box or Empty State */}
                <div className="flex-1 md:ml-0">
                    {selectedChat ? (
                        <ChatBox recipientUser={selectedChat} currentUser={userData} />
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