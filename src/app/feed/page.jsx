'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import {
    Heart,
    MessageCircle,
    Share2,
    MoreHorizontal,
    UserCircle,
    MapPin,
    Link as LinkIcon,
    Users,
    Eye,
    Briefcase
} from 'lucide-react';
import Header from '@/app/Components/Header/Header';
import axios from 'axios';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { refreshTokens } from '@/utils/authUtils';
import { useRouter } from 'next/navigation';
import { CreatePost } from '@/app/Components/UserProfile/CreatePost';
import PostCard from '@/app/Components/UserProfile/PostCard';
import UserSuggestions from '@/app/Components/UserProfile/UserSuggestions';
import UserProfile from '@/app/Components/Feed/UserProfile';
import { io } from "socket.io-client";

// Create socket connection only once
let socket;

export default function page() {
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [viewedPosts, setViewedPosts] = useState([]);
    const [user, setUser] = useState(null);
    const loaderRef = useRef(null);
    const router = useRouter();

    if (!socket) {
        socket = io(process.env.NEXT_PUBLIC_API);
    }

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                const userid = localStorage.getItem('UserId');
                const response = await fetch(`${process.env.NEXT_PUBLIC_API}/user/profile/${userid}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });

                if (response.ok) {
                    const data = await response.json();
                    setUser(data);
                } else {
                    console.error('Failed to fetch user data');
                    if (response.status === 401) {
                        const newAccessToken = await refreshTokens();

                        if (newAccessToken) {
                            // Retry fetching data with new token
                            const retryResponse = await fetch(`${process.env.NEXT_PUBLIC_API}/user/profile/${userid}`, {
                                method: 'GET',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                credentials: 'include',
                            });
                            if (retryResponse.ok) {
                                const retryData = await retryResponse.json();
                                setUser(retryData);
                            } else {
                                console.error('Failed to fetch user data after refreshing token');
                            }
                        }
                    } else {
                        console.error('Failed to fetch user data');
                    }
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);


 

    // First, update the initial fetch posts function to properly handle empty responses
    useEffect(() => {
        const fetchPosts = async (pageNum = 1) => {
            try {
                setLoading(true);
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/feed`, {
                    headers: {
                        "Content-Type": "application/json"
                    },
                    withCredentials: true
                });

                console.log("Response from feed API:", response.data); // Debugging line

                const feedData = response.data.feed || [];
                setPosts(feedData);

                // If the initial fetch returns no posts, set hasMore to false immediately
                setHasMore(feedData.length > 0 && response.data.hasMore);
                setPage(1);
            } catch (error) {
                console.error("Error fetching posts:", error);
                setHasMore(false); // Set hasMore to false on error too
            } finally {
                setLoading(false);
            }
        };
        fetchPosts()
    }, [])

    // Similarly update the loadMorePosts function
    const loadMorePosts = async () => {
        if (loading || !hasMore) return;

        try {
            setLoading(true);
            const nextPage = page + 1;

            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API}/feed/more`,
                {
                    page: nextPage,
                    limit: 10,
                    viewedPosts: viewedPosts
                },
                {
                    headers: {
                        "Content-Type": "application/json"
                    },
                    withCredentials: true
                }
            );

            const newPosts = response.data.feed || [];

            if (newPosts.length > 0) {
                setPosts(prevPosts => [...prevPosts, ...newPosts]);
                setPage(nextPage);
                setHasMore(response.data.hasMore);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Error loading more posts:", error);
            setHasMore(false); // Set hasMore to false on error too
        } finally {
            setLoading(false);
        }
    };
    // Set up infinite scrolling with Intersection Observer
    const lastPostElementRef = useCallback(node => {
        if (loading) return;
        if (loaderRef.current) loaderRef.current.disconnect();

        loaderRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMorePosts();
            }
        });

        if (node) loaderRef.current.observe(node);
    }, [loading, hasMore]);

    // Record impressions using Intersection Observer
    const observePostImpressions = useCallback(() => {
        const postElements = document.querySelectorAll('.post-item');

        const impressionObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const postId = entry.target.dataset.postId;

                        // If we haven't recorded this impression yet
                        if (postId && !viewedPosts.includes(postId)) {
                            // Record impression to backend
                            axios.post(
                                `${process.env.NEXT_PUBLIC_API}/feed/impression/${postId}`,
                                {},
                                {
                                    headers: { "Content-Type": "application/json" },
                                    withCredentials: true
                                }
                            ).catch(error => {
                                console.error("Error recording impression:", error);
                            });

                            // Add to viewed posts
                            setViewedPosts(prev => [...prev, postId]);
                        }

                        // Once we've recorded the impression, stop observing this element
                        impressionObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.5 } // Element is considered visible when 50% is in view
        );

        // Start observing all post elements
        postElements.forEach(element => {
            impressionObserver.observe(element);
        });

        // Cleanup function
        return () => {
            impressionObserver.disconnect();
        };
    }, [viewedPosts]);

    // Set up impression observer whenever posts change
    useEffect(() => {
        const cleanup = observePostImpressions();
        return cleanup;
    }, [posts, observePostImpressions]);



    // Improved handleLike function as per the suggestion
    const handleLikePost = async (postId) => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/post/like/${postId}`, {
                headers: {
                    "Content-Type": "application/json",
                },
                withCredentials: true,
            });

            // Update local state to reflect new like status
            setPosts(prevPosts => {
                return prevPosts.map(post => {
                    if (post.data._id === postId) {
                        // Toggle the liked status based on the response
                        return {
                            ...post,
                            data: {
                                ...post.data,
                                likedByUser: response.data.liked,
                                likes: response.data.liked ?
                                    // If now liked, ensure user email is in likes array
                                    [...(post.data.likes || []), user.email] :
                                    // If now unliked, remove user email from likes array
                                    (post.data.likes || []).filter(id => id !== user.email)
                            }
                        };
                    }
                    return post;
                });
            });
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    return (
        <div className="min-h-screen">
            <Header />

            <main className="container mx-auto px-4 py-6">
                <div className="flex gap-4">
                    {/* Left Sidebar - Profile */}
                    <UserProfile user={user} />

                    {/* Feed */}
                    <div className="flex-1 max-w-2xl mx-auto">
                        {/* Create Post Box */}
                        <CreatePost user={user} />

                        {/* Posts */}
                        {loading ? (
                            <LoadingSpinner fullScreen={true} />
                        ) : posts?.length > 0 ? (
                            posts.map((post, index) => {
                                // Check if this is the last post for ref callback
                                const isLastPost = index === posts.length - 1;

                                return (
                                    <PostCard
                                        key={`${post.data._id}-${index}`} // Ensure uniqueness by combining ID and index
                                        isLastPost={isLastPost}
                                        post={post}
                                        lastPostElementRef={lastPostElementRef}
                                        handleLike={handleLikePost}
                                        user={user}
                                    />
                                );
                            })
                        ) : (
                            <div className="text-center py-8 border rounded-lg shadow-md mt-4">
                                <h3 className="text-xl font-semibold mb-2">No Posts Yet</h3>
                                <p className="text-gray-600 dark:text-gray-400">There are no posts in your feed right now.</p>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">Start following people or create your first post!</p>
                            </div>
                        )}

                        {/* Loading indicator */}
                        {loading && (
                            <div className="flex justify-center py-4">
                                <LoadingSpinner fullScreen={false} />
                            </div>
                        )}

                        {/* No more posts message */}
                        {/* No more posts message */}
                        {!loading && !hasMore && (
                            <div className="text-center py-4 rounded-lg shadow-md mt-4">
                                <p>You've reached the end of your feed</p>
                                <button className="mt-2 hover:underline font-medium">Discover more connections</button>
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar - Suggestions */}
                    <UserSuggestions />
                </div>
            </main>
        </div>
    );
}