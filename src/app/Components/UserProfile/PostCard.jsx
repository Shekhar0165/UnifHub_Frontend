import { Heart, MessageCircle, MoreHorizontal, Share2, UserCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react'

export default function PostCard({ post, isLastPost, lastPostElementRef, handleLike, user }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLongContent, setIsLongContent] = useState(false);
    const [timeAgo, setTimeAgo] = useState('');
    const contentMaxHeight = 300; // Max height in pixels for collapsed content
    const router = useRouter()
    
    // Check if the post is liked by the current user
    const isLiked = user && post.data.likes?.includes(user.email);
    
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

    useEffect(()=>{
        const HandleCheckUserLikedPost = async () =>{
            const likeResponse = await axios.get(`${process.env.NEXT_PUBLIC_API}/post/check-like/${post._id}`, {
                withCredentials: true
            });
            console.log(likeResponse)

        }
        HandleCheckUserLikedPost();

    },[])
    
    // Check if content is long (after component mounts)
    useEffect(() => {
        const contentEl = document.getElementById(`post-content-${post.data._id}`);
        if (contentEl && contentEl.scrollHeight > contentMaxHeight) {
            setIsLongContent(true);
        }
    }, [post.data._id]);
    
    // Handle like button click
    const onLikeClick = () => {
        handleLike(post.data._id);
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
                    <div className="rounded-full  overflow-hidden h-10 w-10 flex-shrink-0">
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
                    <span>{post.data.likes?.length || 0} likes</span>
                </div>
                <div>
                    <span>{post.data.comments?.length || 0} comments</span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="px-4 py-1 flex justify-between">
                <button
                    className={`flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        isLiked ? 'text-red-500' : ''
                    }`}
                    onClick={onLikeClick}
                >
                    <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                    <span className="text-sm font-medium">Like</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                    <MessageCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">Comment</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Share2 className="h-5 w-5" />
                    <span className="text-sm font-medium">Share</span>
                </button>
            </div>

            {/* Comments Section */}
            {post.data.comments?.length > 0 && (
                <div className="px-4 pb-3 pt-1 border-t">
                    {post.data.comments.map((comment, idx) => (
                        <div key={idx} className="flex gap-2 mt-3">
                            <div className="rounded-full overflow-hidden h-8 w-8 flex-shrink-0">
                                <UserCircle className="h-8 w-8" />
                            </div>
                            <div className="rounded-lg bg-gray-100 dark:bg-gray-700 px-3 py-2 w-full">
                                <div className="flex justify-between">
                                    <h4 className="font-medium text-sm">{comment.user}</h4>
                                    <span className="text-xs text-gray-500">{comment.timestamp}</span>
                                </div>
                                <p className="text-sm mt-1">{comment.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}