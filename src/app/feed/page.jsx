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
import Header from '../Components/Header/Header';
import axios from 'axios';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { refreshTokens } from '@/utils/authUtils';
import { useRouter } from 'next/navigation';
import { CreatePost } from '../Components/UserProfile/CreatePost';
import PostCard from '../Components/UserProfile/PostCard';
import UserSuggestions from '../Components/UserProfile/UserSuggestions';

export default function LinkedInFeed() {
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [viewedPosts, setViewedPosts] = useState([]);
    const [user, setUser] = useState(null);
    const loaderRef = useRef(null);
    const [suggestions] = useState([
        { id: 1, name: "Alex Morgan", role: "UX Designer at Google", image: "https://unifhub.s3.ap-south-1.amazonaws.com/users/coverImage-1743570589257-638798549.png" },
        { id: 2, name: "Sarah Johnson", role: "Product Manager at Meta", image: "https://unifhub.s3.ap-south-1.amazonaws.com/users/coverImage-1743570589257-638798549.png" },
        { id: 3, name: "Michael Chen", role: "Software Engineer at Amazon", image: "https://unifhub.s3.ap-south-1.amazonaws.com/users/coverImage-1743570589257-638798549.png" },
        { id: 4, name: "Priya Patel", role: "Data Scientist at Netflix", image: "https://unifhub.s3.ap-south-1.amazonaws.com/users/coverImage-1743570589257-638798549.png" },
    ]);

    const router = useRouter();

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
                setPosts(response.data.feed || []);
                setHasMore(response.data.hasMore);
                setPage(1);
            } catch (error) {
                console.error("Error fetching posts:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts()
    }, [])




    // Function to fetch initial posts


    // Function to load more posts (infinite scrolling)
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
                    <div className="w-64 flex-shrink-0 hidden md:block">
                        <div className="rounded-lg shadow-md overflow-hidden sticky top-20">
                            {/* Profile header with background and profile image */}
                            <div className="h-24 relative">
                                {user?.backgroundImage && (
                                    <img
                                        src={user.backgroundImage}
                                        alt="Cover"
                                        className="w-full h-full object-cover"
                                    />
                                )}
                                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                                    <div className="p-1 rounded-full">
                                        <div className="rounded-full h-24 w-24 overflow-hidden border-2 border-white dark:border-gray-800">
                                            {user?.profileImage ? (
                                                <img
                                                    src={user.profileImage}
                                                    alt={user?.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <UserCircle className="w-full h-full" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Profile information */}
                            <div className="pt-14 pb-4 px-4 text-center">
                                <h2 className="font-semibold text-lg">{user?.name || "Loading..."}</h2>
                                <p className="text-sm mt-1">{user?.headline || user?.bio || "Add a headline"}</p>
                            </div>

                            {/* Location and other details */}
                            <div className="border-t px-4 py-3">
                                {user?.location && (
                                    <div className="flex items-center gap-2 text-sm mb-2">
                                        <MapPin className="h-4 w-4" />
                                        <span>{user.location}</span>
                                    </div>
                                )}

                                {user?.website && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <LinkIcon className="h-4 w-4" />
                                        <a href={user.website} className="hover:underline" target="_blank" rel="noreferrer">
                                            {user.website}
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Stats section */}
                            <div className="border-t px-4 py-3">
                                <div className="flex justify-between text-sm">
                                    <span className="flex items-center gap-1">
                                        <Users className="h-4 w-4" />
                                        Connections
                                    </span>
                                    <span className="font-medium">{user?.followers || 0}</span>
                                </div>
                                <div className="flex justify-between text-sm mt-2">
                                    <span className="flex items-center gap-1">
                                        <Eye className="h-4 w-4" />
                                        Profile views
                                    </span>
                                    <span className="font-medium">{user?.views || 0} this week</span>
                                </div>
                            </div>

                            {/* Call to action */}
                            <div className="border-t p-4">
                                <button
                                    onClick={() => { router.push(`/user/${user?.userid}`) }}
                                    className="w-full font-medium py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    View Complete Profile
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Feed */}
                    <div className="flex-1 max-w-2xl mx-auto">
                        {/* Create Post Box */}
                        <CreatePost user={user} />

                        {/* Posts */}
                        {posts?.length > 0 ? (
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
                            <LoadingSpinner fullScreen={true} />
                        )}

                        {/* Loading indicator */}
                        {loading && (
                            <div className="flex justify-center py-4">
                                <LoadingSpinner fullScreen={false} />
                            </div>
                        )}

                        {/* No more posts message */}
                        {!hasMore && posts.length > 0 && (
                            <div className="text-center py-4 rounded-lg shadow-md mt-4">
                                <p>You've reached the end of your feed</p>
                                <button className="mt-2 hover:underline font-medium">Discover more connections</button>
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar - Suggestions */}
                            <UserSuggestions/>
                </div>
            </main>
        </div>
    );
}