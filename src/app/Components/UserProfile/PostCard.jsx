'use client'
import { Heart, MessageCircle, MoreHorizontal, Share2, UserCircle, ChevronDown, ChevronUp, Send } from 'lucide-react'
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react'
import axios from 'axios'

// Comment component
const Comment = ({ comment }) => {
    return (
        <div className="flex gap-2 mt-3">
            <div className="rounded-full overflow-hidden h-8 w-8 flex-shrink-0">
                {comment.user?.profileImage ? (
                    <img
                        src={comment.user.profileImage}
                        alt={comment.user.name || "User"}
                        className="h-full w-full object-cover"
                    />
                ) : <UserCircle className="h-8 w-8" />}
            </div>
            <div className="rounded-lg bg-gray-100 dark:bg-gray-700 px-3 py-2 w-full">
                <div className="flex justify-between">
                    <h4 className="font-medium text-sm">{comment.user?.name || comment.user}</h4>
                    <span className="text-xs text-gray-500">
                        {comment.timestamp || new Date(comment.createdAt).toLocaleDateString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </span>
                </div>
                <p className="text-sm mt-1">{comment.comment || comment.content || comment.text}</p>
            </div>
        </div>
    );
};

// Comment Form component
const CommentForm = ({ postId, onCommentSubmit }) => {
    const [comment, setComment] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (comment.trim()) {
            onCommentSubmit(postId, comment);
            setComment('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-3 px-4 pb-3">
            <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 rounded-full bg-gray-100 dark:bg-gray-700 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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

export default function PostCard({ post, isLastPost, lastPostElementRef, user }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLongContent, setIsLongContent] = useState(false);
    const [timeAgo, setTimeAgo] = useState('');
    const [isLiked, setIsLiked] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([]);
    const [postData, setPostData] = useState(post.data); // Store post data locally
    const contentMaxHeight = 300; // Max height in pixels for collapsed content
    const router = useRouter();
    
    // Format the post date to show how long ago it was posted
    useEffect(() => {
        if (post.data.createdAt) {
            const postDate = new Date(post.data.createdAt);
            const now = new Date();
            const diffInSeconds = Math.floor((now - postDate) / 1000);
            
            if (diffInSeconds < 60) {
                setTimeAgo('Just now');
            } else if (diffInSeconds < 3600) {
                setTimeAgo(`${Math.floor(diffInSeconds / 60)}m ago`);
            } else if (diffInSeconds < 86400) {
                setTimeAgo(`${Math.floor(diffInSeconds / 3600)}h ago`);
            } else {
                setTimeAgo(`${Math.floor(diffInSeconds / 86400)}d ago`);
            }
        } else {
            setTimeAgo('Recently');
        }
    }, [post.data.createdAt]);

    // Update local post data when prop changes
    useEffect(() => {
        setPostData(post.data);
    }, [post.data]);

    // Check if user liked the post on component mount
    useEffect(() => {
        const checkLikeStatus = async () => {
            try {
                const likeResponse = await axios.get(`${process.env.NEXT_PUBLIC_API}/post/check-like/${post.data._id}`, {
                    withCredentials: true
                });
                setIsLiked(likeResponse.data.liked);
            } catch (err) {
                console.error(`Error checking like status for post ${post.data._id}:`, err);
            }
        };
        
        checkLikeStatus();
    }, [post.data._id]);
    
    // Check if content is long (after component mounts)
    useEffect(() => {
        const contentEl = document.getElementById(`post-content-${post.data._id}`);
        if (contentEl && contentEl.scrollHeight > contentMaxHeight) {
            setIsLongContent(true);
        }
    }, [post.data._id]);
    
    // Handle like button click
    const onLikeClick = async (postid) => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/post/like/${postid}`, {
                headers: {
                    "Content-Type": "application/json",
                },
                withCredentials: true,
            });
            
            // Update like status based on response
            setIsLiked(response.data.liked);
            
            // Update local post data to reflect like status change
            setPostData(prevData => {
                const currentLikes = prevData.likes || [];
                
                if (response.data.liked) {
                    // Add user to likes if not already there
                    if (!currentLikes.includes(user?.email || user?._id)) {
                        return {
                            ...prevData,
                            likes: [...currentLikes, user?.email || user?._id]
                        };
                    }
                } else {
                    // Remove user from likes
                    return {
                        ...prevData,
                        likes: currentLikes.filter(id => id !== user?.email && id !== user?._id)
                    };
                }
                
                return prevData;
            });
            
            // Call the parent handleLike function if provided
            if (handleLike) {
                handleLike(post.data._id);
            }
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    // Fetch comments for the post
    const fetchComments = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API}/post/comments/${post.data._id}`, {
                headers: {
                    "Content-Type": "application/json",
                },
                withCredentials: true,
            });
            setComments(res.data);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };
    
    // Toggle comments visibility
    const toggleComments = () => {
        const newShowComments = !showComments;
        setShowComments(newShowComments);
        
        // Fetch comments when showing comments section
        if (newShowComments) {
            fetchComments();
        }
    };
    
    // Handle comment submission
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
            
            // Refresh comments after adding a new one
            fetchComments();
            
            // Update local post data to include new comment count
            setPostData(prevData => {
                const currentComments = prevData.comments || [];
                return {
                    ...prevData,
                    comments: [...currentComments, { 
                        user: user?.name || user?.email, 
                        text: comment,
                        timestamp: 'Just now'
                    }]
                };
            });
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };
    
    return (
        <div
            className="rounded-lg shadow-md mb-6 overflow-hidden post-item bg-white dark:bg-gray-800"
            ref={isLastPost ? lastPostElementRef : null}
            data-post-id={post.data._id}
        >
            {/* Post Header with User Info */}
            <div className="p-4 flex justify-between items-start">
                <div onClick={()=>{router.push(`/user/${post.data.user.userid}`)}} className="flex gap-3 cursor-pointer hover:scale-105 transition-all duration-300 ease-in-out">
                    <div className="rounded-full overflow-hidden h-10 w-10 flex-shrink-0">
                        {post?.data?.user?.profileImage ? (
                            <img 
                                src={post.data.user.profileImage} 
                                alt={post.data.user.name || "User"} 
                                className="h-full w-full object-cover" 
                            />
                        ) : <UserCircle className="h-10 w-10" />}
                    </div>
                    <div>
                        <h3 className="font-medium">{post.data.user?.name}</h3>
                        <p className="text-xs text-gray-500">{timeAgo}</p>
                    </div>
                </div>
                <button className="hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-full">
                    <MoreHorizontal className="h-5 w-5" />
                </button>
            </div>

            {/* Post Title & Content */}
            <div className="px-4 pb-3">
                {post.data.title && (
                    <h2 className="font-semibold text-base mb-2">{post.data.title}</h2>
                )}
                
                {/* Post content with show more/less functionality */}
                <div 
                    id={`post-content-${post.data._id}`}
                    className={`overflow-hidden ${!isExpanded && isLongContent ? 'max-h-72' : ''}`}
                >
                    <div dangerouslySetInnerHTML={{ __html: post.data.description }} />
                </div>
                
                {/* Show more/less button */}
                {isLongContent && (
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="mt-2 text-sm font-medium flex items-center gap-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        {isExpanded ? (
                            <>Show less <ChevronUp className="h-4 w-4" /></>
                        ) : (
                            <>Show more <ChevronDown className="h-4 w-4" /></>
                        )}
                    </button>
                )}
            </div>

            {/* Post Image (if available) */}
            {post.data.image_path && (
                <div className="aspect-video relative">
                    <img 
                        src={post.data.image_path} 
                        alt={post.data.title || "Post image"} 
                        className="w-full h-full object-cover" 
                    />
                </div>
            )}

            {/* Engagement Stats */}
            <div className="px-4 py-2 border-t border-b flex justify-between items-center text-xs text-gray-500">
                <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3 fill-current" />
                    <span>{postData.likes?.length || 0} likes</span>
                </div>
                <div className="cursor-pointer" onClick={toggleComments}>
                    <span>{postData.comments?.length || 0} comments</span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="px-4 py-1 flex justify-between">
                <button
                    className={`flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        isLiked ? 'text-red-500' : ''
                    }`}
                    onClick={()=>onLikeClick(post.data._id)}
                >
                    <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                    <span className="text-sm font-medium">Like</span>
                </button>
                <button 
                    className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={toggleComments}
                >
                    <MessageCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">Comment</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Share2 className="h-5 w-5" />
                    <span className="text-sm font-medium">Share</span>
                </button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="px-4 pb-3 pt-1 border-t">
                    {/* Display comments if available */}
                    {comments.comments && comments.comments.length > 0 ? (
                        comments.comments.map((comment, idx) => (
                            <Comment key={comment._id || idx} comment={comment} />
                        ))
                    ) : postData.comments && postData.comments.length > 0 ? (
                        postData.comments.map((comment, idx) => (
                            <Comment key={comment._id || idx} comment={comment} />
                        ))
                    ) : (
                        <div className="text-center py-2 text-sm text-gray-500">
                            No comments yet. Be the first to comment!
                        </div>
                    )}
                    
                    {/* Comment Form */}
                    <CommentForm
                        postId={post.data._id}
                        onCommentSubmit={handleCommentSubmit}
                    />
                </div>
            )}
        </div>
    );
}