'use client'
import UserProfile from '@/app/Components/Feed/UserProfile';
import Header from '@/app/Components/Header/Header'
import { CreatePost } from '@/app/Components/UserProfile/CreatePost';
import PostCard from '@/app/Components/UserProfile/PostCard';
import UserSuggestions from '@/app/Components/UserProfile/UserSuggestions';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { refreshTokens } from '@/utils/authUtils';
import { useToast } from '@/hooks/use-toast';
import SharePost from '@/app/Components/Feed/SharePost';

export default function Page() {
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [post, setPost] = useState(null);
    const pathname = usePathname();
    const postId = pathname.split('/')[4]; // Extract the post ID from the URL
    const userId = pathname.split('/')[2]; // Extract the user ID from the URL
    const { toast } = useToast();

    // Fetch user data
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                const userid = localStorage.getItem('UserId');

                try {
                    const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/user/profile/${userid}`, {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        withCredentials: true,
                    });
                    setUser(response.data);
                } catch (error) {
                    if (error.response?.status === 401) {
                        const newAccessToken = await refreshTokens();
                        if (newAccessToken) {
                            const retryResponse = await axios.get(`${process.env.NEXT_PUBLIC_API}/user/profile/${userid}`, {
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                withCredentials: true,
                            });
                            setUser(retryResponse.data);
                        }
                    } else {
                        toast({
                            title: "Error",
                            description: "Failed to fetch user data. Please try again.",
                            variant: "destructive",
                        });
                        console.error('Error fetching user data:', error);
                    }
                }
            } catch (error) {
                console.error('Error in fetchUserData:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [toast]);

    // Fetch post data
    useEffect(() => {
        const fetchPost = async () => {
            if (!postId) return;

            try {
                const response = await axios.post(`${process.env.NEXT_PUBLIC_API}/post/${postId}`, { userid: userId }, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true,
                });
                setPost(response.data);
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to fetch post data. Please try again.",
                    variant: "destructive",
                });
                console.error('Error fetching post data:', error);
            }
        };

        fetchPost();
    }, [postId, toast]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>;
    }

    console.log("post data:", post);

    return (
        <>
            <div className="min-h-screen">
                <Header />

                <main className="container mx-auto px-4 py-6">
                    <div className="flex gap-4">
                        {/* Left Sidebar - Profile */}
                        <UserProfile user={user} />

                        {/* Main Content - Post */}
                        <div className="flex-1 max-w-2xl mx-auto">
                            {/* Create Post Box */}
                            <CreatePost user={user} />
                            <SharePost post={post} user={user} />
                           

                        </div>

                        {/* Right Sidebar - Suggestions */}
                        <UserSuggestions />
                    </div>
                </main>
            </div>
        </>
    )
}
