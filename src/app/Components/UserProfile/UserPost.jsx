import { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronDown, ChevronUp, Heart, MessageCircle, MoreHorizontal, Share2, ThumbsUp, Award, Share, UserCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';


export const CommentForm = ({ postId, onCommentSubmit }) => {
    const [comment, setComment] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (comment.trim()) {
            onCommentSubmit(postId, comment);
            setComment('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-3 px-2 sm:px-4 pb-3">
            <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 rounded-full bg-gray-100 dark:bg-gray-700 px-3 sm:px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
                type="submit"
                disabled={!comment.trim()}
                className="p-2 rounded-full bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Send className="h-4 w-4" />
            </button>
        </form>
    );
};

export const Comment = ({ comment }) => {
    return (
        <div className="flex gap-2 mt-3">
            <div className="rounded-full overflow-hidden h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
                {comment.user?.profileImage ? (
                    <img
                        src={comment.user.profileImage}
                        alt={comment.user.name || "User"}
                        className="h-full w-full object-cover"
                    />
                ) : <UserCircle className="h-full w-full" />}
            </div>
            <div className="rounded-lg bg-gray-100 dark:bg-gray-700 px-2 sm:px-3 py-2 w-full text-xs sm:text-sm">
                <div className="flex justify-between flex-wrap gap-1">
                    <h4 className="font-medium">{comment.user?.name || comment.user}</h4>
                    <span className="text-gray-500 text-xs">
                        {comment.timestamp || new Date(comment.createdAt).toLocaleDateString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </span>
                </div>
                <p className="mt-1 break-words">{comment.comment || comment.content}</p>
            </div>
        </div>
    );
};

export const UserPosts = ({ user }) => {
    // State to track expanded posts and visible posts count
    const [expandedPosts, setExpandedPosts] = useState({});
    const [visiblePostsCount, setVisiblePostsCount] = useState(3);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [showComments, setShowComments] = useState({});
    const [Newcommets, setComment] = useState([]);

    // Fetch posts
    const fetchPosts = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/post/user/${user._id}`, {
                headers: {
                    "Content-Type": "application/json",
                },
                withCredentials: true,
            });

            if (!response.data.posts || !response.data.posts.post) {
                setPosts([]);
                setLoading(false);
                return;
            }

            const fetchedPosts = response.data.posts;

            // For each post, check if the current user has liked it
            const postsWithLikeStatus = {
                ...fetchedPosts,
                post: await Promise.all(fetchedPosts.post.map(async (post) => {
                    try {
                        const likeResponse = await axios.get(`${process.env.NEXT_PUBLIC_API}/post/check-like/${post._id}`, {
                            withCredentials: true
                        });
                        return {
                            ...post,
                            likedByUser: likeResponse.data.liked
                        };
                    } catch (err) {
                        console.error(`Error checking like status for post ${post._id}:`, err);
                        return post;
                    }
                }))
            };

            setPosts(postsWithLikeStatus);
            setHasMore(postsWithLikeStatus.post.length > visiblePostsCount);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?._id) {
            fetchPosts();
        }
    }, [user]);

    // Function to toggle post expansion
    const togglePostExpansion = (postId) => {
        setExpandedPosts(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };

    const HandleFetchCommets = async (postid) => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API}/post/comments/${postid}`, {
                headers: {
                    "Content-Type": "application/json",
                },
                withCredentials: true,
            });
            setComment(res.data);
        } catch (error) {
            console.error('Error fetching comments:', error);
            setComment({ comments: [] });
        }
    };

    // Function to toggle comments visibility
    const toggleComments = (postId) => {
        setShowComments(prev => {
            const newState = {
                ...prev,
                [postId]: !prev[postId]
            };
            
            if (newState[postId]) {
                HandleFetchCommets(postId);
            }
            
            return newState;
        });
    };

    // Function to show more posts
    const showMorePosts = () => {
        const newCount = visiblePostsCount + 3;
        setVisiblePostsCount(newCount);
        setHasMore(posts.length > newCount);
    };

    // Handle like post
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
                return {
                    ...prevPosts,
                    post: prevPosts.post.map(post => {
                        if (post._id === postId) {
                            // Toggle the liked status based on the response
                            return {
                                ...post,
                                likedByUser: response.data.liked,
                                likes: response.data.liked ?
                                    // If now liked, ensure user ID is in likes array
                                    [...(post.likes || []), user._id] :
                                    // If now unliked, remove user ID from likes array
                                    (post.likes || []).filter(id => id !== user._id)
                            };
                        }
                        return post;
                    })
                };
            });
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    const handleCommentSubmit = async (postId, comment) => {
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API}/post/comment/${postId}`,
                { comment },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    withCredentials: true,
                }
            );

            if (response.data.success) {
                // Refresh comments after posting
                HandleFetchCommets(postId);
            } else {
                throw new Error(response.data.message || "Failed to add comment");
            }
        } catch (error) {
            console.error('Error commenting on post:', error);
        }
    };

    // Function to format post date to show how long ago it was posted
    const formatTimeAgo = (dateString) => {
        if (!dateString) return 'Recently';

        const postDate = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - postDate) / 1000);

        if (diffInSeconds < 60) {
            return 'Just now';
        } else if (diffInSeconds < 3600) {
            return `${Math.floor(diffInSeconds / 60)}m ago`;
        } else if (diffInSeconds < 86400) {
            return `${Math.floor(diffInSeconds / 3600)}h ago`;
        } else {
            return `${Math.floor(diffInSeconds / 86400)}d ago`;
        }
    };

    if (loading && posts.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                Loading posts...
            </div>
        );
    }

    if (!loading && (!posts.post || posts.post.length === 0)) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                No posts to display. Create your first post above!
            </div>
        );
    }

    return (
        <div className="space-y-4 md:space-y-6 max-w-full overflow-hidden">
            {posts?.post?.slice(0, visiblePostsCount).map((post) => (
                <div
                    key={post._id}
                    className="rounded-lg shadow-md overflow-hidden post-item border border-primary/10"
                    data-post-id={post._id}
                >
                    {/* Post Header with User Info */}
                    <div className="p-3 sm:p-4 flex justify-between items-start">
                        <div className="flex gap-2 sm:gap-3 cursor-pointer hover:scale-105 transition-all duration-300 ease-in-out">
                            <div className="rounded-full overflow-hidden h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                                {user?.profileImage ? (
                                    <img
                                        src={user.profileImage}
                                        alt={user.name || "User"}
                                        className="h-full w-full object-cover"
                                    />
                                ) : <UserCircle className="h-full w-full" />}
                            </div>
                            <div>
                                <h3 className="font-medium text-sm sm:text-base">{user?.name}</h3>
                                <p className="text-xs text-gray-500">{formatTimeAgo(post.createdAt)}</p>
                            </div>
                        </div>
                        <button className="hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-full">
                            <MoreHorizontal className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                    </div>

                    {/* Post Title & Content */}
                    <div className="px-3 sm:px-4 pb-3">
                        {post.title && (
                            <h2 className="font-semibold text-sm sm:text-base mb-2">{post.title}</h2>
                        )}

                        {/* Post content with show more/less functionality */}
                        <div className={`overflow-hidden ${!expandedPosts[post._id] && post.content?.length > 300 ? 'max-h-72' : ''}`}>
                            <div className="text-sm sm:text-base break-words" dangerouslySetInnerHTML={{ __html: post.content }} />
                        </div>

                        {/* Show more/less button */}
                        {post.content?.length > 300 && (
                            <button
                                onClick={() => togglePostExpansion(post._id)}
                                className="mt-2 text-xs sm:text-sm font-medium flex items-center gap-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                {expandedPosts[post._id] ? (
                                    <>Show less <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" /></>
                                ) : (
                                    <>Show more <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" /></>
                                )}
                            </button>
                        )}
                    </div>

                    {/* Post Image (if available) */}
                    {post.image_path && (
                        <div className="aspect-video relative">
                            <img
                                src={post.image_path}
                                alt={post.title || "Post image"}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* Engagement Stats */}
                    <div className="px-3 sm:px-4 py-2 border-t border-b flex justify-between items-center text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                            <Heart className="h-3 w-3 fill-current" />
                            <span>{post.likes?.length || 0} likes</span>
                        </div>
                        <div className="cursor-pointer" onClick={() => toggleComments(post._id)}>
                            <span>{post.comments?.length || 0} comments</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="px-1 sm:px-4 py-1 flex justify-between">
                        <button
                            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${post.likedByUser ? 'text-red-500' : ''
                                }`}
                            onClick={() => handleLikePost(post._id)}
                        >
                            <Heart className={`h-4 w-4 sm:h-5 sm:w-5 ${post.likedByUser ? 'fill-current' : ''}`} />
                            <span className="text-xs sm:text-sm font-medium">Like</span>
                        </button>
                        <button
                            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => toggleComments(post._id)}
                        >
                            <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="text-xs sm:text-sm font-medium">Comment</span>
                        </button>
                        <button className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                            <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="text-xs sm:text-sm font-medium">Share</span>
                        </button>
                    </div>

                    {/* Comments Section */}
                    {showComments[post._id] && (
                        <div className="px-3 sm:px-4 pb-3 pt-1 border-t max-h-96 overflow-y-auto">
                            {Newcommets.comments && Newcommets.comments.length > 0 ? (
                                Newcommets.comments.map((comment, idx) => (
                                    <Comment key={comment._id || idx} comment={comment} />
                                ))
                            ) : (
                                <div className="text-center py-2 text-xs sm:text-sm text-gray-500">
                                    No comments yet. Be the first to comment!
                                </div>
                            )}

                            {/* Comment Form */}
                            <CommentForm
                                postId={post._id}
                                onCommentSubmit={handleCommentSubmit}
                            />
                        </div>
                    )}
                </div>
            ))}

            {posts?.post?.length > 0 && (
                <div className="text-center">
                    {visiblePostsCount < posts.post.length ? (
                        <Button variant="outline" className="text-xs sm:text-sm font-medium" onClick={showMorePosts}>
                            Show more posts ({posts.post.length - visiblePostsCount} more)
                        </Button>
                    ) : visiblePostsCount > 3 ? (
                        <Button variant="outline" className="text-xs sm:text-sm font-medium" onClick={() => setVisiblePostsCount(3)}>
                            Show less posts
                        </Button>
                    ) : null}
                </div>
            )}
        </div>
    );
};