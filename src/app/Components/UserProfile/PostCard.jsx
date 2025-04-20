'use client'
import { Heart, MessageCircle, MoreHorizontal, Share2, UserCircle, ChevronDown, ChevronUp, Send, Star } from 'lucide-react'
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import Link from 'next/link';

// Comment component with optimized rendering
const Comment = ({ comment }) => {
  // Handle different comment data structures
  const userName = comment.user?.name || comment.user || 'Anonymous';
  const commentContent = comment.comment || comment.content || comment.text || '';
  const commentTime = comment.timestamp || (comment.createdAt ? 
    new Date(comment.createdAt).toLocaleDateString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }) : 'Just now');

  return (
    <div className="flex gap-2 mt-3">
      <div className="rounded-full overflow-hidden h-8 w-8 flex-shrink-0">
        {comment.user?.profileImage ? (
          <img
            src={comment.user.profileImage}
            alt={userName}
            className="h-full w-full object-cover"
          />
        ) : <UserCircle className="h-8 w-8" />}
      </div>
      <div className="rounded-lg bg-gray-100 dark:bg-gray-700 px-3 py-2 w-full">
        <div className="flex justify-between">
          <h4 className="font-medium text-sm">{userName}</h4>
          <span className="text-xs text-gray-500">{commentTime}</span>
        </div>
        <p className="text-sm mt-1">{commentContent}</p>
      </div>
    </div>
  );
};

// Comment Form component with improved validation
const CommentForm = ({ postId, onCommentSubmit }) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (comment.trim() && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await onCommentSubmit(postId, comment);
        setComment('');
        // Focus back on input after submission
        inputRef.current?.focus();
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-3 px-2 sm:px-4 pb-3">
      <input
        ref={inputRef}
        type="text"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write a comment..."
        className="flex-1 rounded-full bg-gray-100 dark:bg-gray-700 px-3 sm:px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        disabled={!comment.trim() || isSubmitting}
        className="p-2 rounded-full bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
      >
        <Send className="h-4 w-4" />
      </button>
    </form>
  );
};

export default function PostCard({ post, isLastPost, lastPostElementRef, user }) {
  // State management
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLongContent, setIsLongContent] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [postData, setPostData] = useState(post.data);
  const [contentPreview, setContentPreview] = useState('');
  const [fullContent, setFullContent] = useState('');
  
  // Constants
  const CONTENT_MAX_LENGTH = 300;
  const contentRef = useRef(null);
  const router = useRouter();
  
  // Format post date on component mount
  useEffect(() => {
    formatTimeAgo();
  }, [post.data.createdAt]);

  // Update local post data when prop changes
  useEffect(() => {
    setPostData(post.data);
    processPostContent();
  }, [post.data]);

  // Check like status on mount
  useEffect(() => {
    checkUserLikeStatus();
  }, [post.data._id]);
  
  // Process post content for preview/full display
  const processPostContent = () => {
    if (!post.data.description) return;
    
    // Create temporary element to parse HTML and get text content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = post.data.description;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    // Set full content
    setFullContent(post.data.description);
    
    // Check if content is long enough to need truncation
    if (textContent.length > CONTENT_MAX_LENGTH) {
      setIsLongContent(true);
      
      // Find a good break point near the max length
      const breakPoint = findBreakPoint(textContent, CONTENT_MAX_LENGTH);
      const previewText = textContent.substring(0, breakPoint) + '...';
      
      // Create preview HTML by replacing text while keeping structure
      const previewHtml = createPreviewHtml(post.data.description, previewText);
      setContentPreview(previewHtml);
    } else {
      setIsLongContent(false);
      setContentPreview(post.data.description);
    }
  };
  
  // Find a good break point for text (at a space after a sentence if possible)
  const findBreakPoint = (text, maxLength) => {
    // Try to find sentence ending within reasonable range
    for (let i = maxLength - 30; i < maxLength; i++) {
      if (['.', '!', '?'].includes(text[i]) && (text[i+1] === ' ' || !text[i+1])) {
        return i + 1;
      }
    }
    
    // Fall back to word boundary
    let breakPoint = maxLength;
    while (breakPoint > maxLength - 50 && text[breakPoint] !== ' ') {
      breakPoint--;
    }
    
    return breakPoint > maxLength - 50 ? breakPoint : maxLength;
  };
  
  // Create preview HTML while preserving overall structure
  const createPreviewHtml = (fullHtml, previewText) => {
    // Simple approach: create the preview div with truncated text
    return `<div>${previewText}</div>`;
  };
  
  // Format relative time (e.g. "2h ago")
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
    } else if (diffInSeconds < 604800) { // 7 days
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    } else {
      // Format as date for older posts
      return postDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  // Check if user has liked this post
  const checkUserLikeStatus = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/post/check-like/${post.data._id}`, 
        { withCredentials: true }
      );
      setIsLiked(response.data.liked);
    } catch (err) {
      console.error(`Error checking like status for post ${post.data._id}:`, err);
    }
  };
  
  // Handle like/unlike action
  const handleLikeClick = async (postId) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/post/like/${postId}`, 
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      
      // Update like status
      setIsLiked(response.data.liked);
      
      // Update local post data
      setPostData(prevData => {
        const currentLikes = prevData.likes || [];
        const userId = user?.email || user?._id;
        
        if (response.data.liked) {
          // Add user to likes if not already there
          if (!currentLikes.includes(userId)) {
            return { ...prevData, likes: [...currentLikes, userId] };
          }
        } else {
          // Remove user from likes
          return {
            ...prevData,
            likes: currentLikes.filter(id => id !== userId)
          };
        }
        
        return prevData;
      });
    } catch (error) {
      console.error('Error handling like action:', error);
    }
  };

  // Fetch post comments
  const fetchComments = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/post/comments/${post.data._id}`,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };
  
  // Toggle comments visibility
  const toggleComments = () => {
    const newState = !showComments;
    setShowComments(newState);
    
    if (newState) {
      fetchComments();
    }
  };
  
  // Submit a new comment
  const handleCommentSubmit = async (postId, commentText) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API}/post/comment/${postId}`,
        { comment: commentText },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      
      // Refresh comments
      fetchComments();
      
      // Optimistically update UI
      setPostData(prevData => {
        const currentComments = prevData.comments || [];
        return {
          ...prevData,
          comments: [
            ...currentComments,
            { 
              user: user?.name || user?.email, 
              text: commentText,
              timestamp: 'Just now'
            }
          ]
        };
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      // Consider showing error message to user
    }
  };
  
  // Toggle content expansion
  const toggleContentExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  // Determine what comments to display
  const displayComments = comments.comments && comments.comments.length > 0 
    ? comments.comments 
    : postData.comments || [];
  
  return (
    <div
      className="rounded-lg shadow-md mb-6 overflow-hidden post-item border border-primary/10"
      ref={isLastPost ? lastPostElementRef : null}
      data-post-id={post.data._id}
    >
      {/* Post Header with User Info */}
      <div className="p-3 sm:p-4 flex justify-between items-start">
        <Link
          href={`/user/${post?.data?.user?.userid}`} 
          className="flex gap-2 sm:gap-3 cursor-pointer hover:scale-105 transition-all duration-300 ease-in-out"
        >
          <div className="rounded-full overflow-hidden h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0">
            {post?.data?.user?.profileImage ? (
              <img 
                src={post.data.user.profileImage} 
                alt={post.data.user.name || "User"} 
                className="h-full w-full object-cover" 
              />
            ) : <UserCircle className="h-9 w-9 sm:h-10 sm:w-10" />}
          </div>
          <div>
            <h3 className="font-medium">{post.data.user?.name}</h3>
            <p className="text-xs text-gray-500">{formatTimeAgo(post.data.createdAt)}</p>
          </div>
        </Link>
        <button className="hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-full transition-colors">
        {post.data.isAchivementPosted && <Star size={20} color='lightblue' />}
        </button>
      </div>

      {/* Post Title & Content */}
      <div className="px-3 sm:px-4 pb-3">
        {post.data.title && (
          <h2 className="font-semibold text-base mb-2">{post.data.title}</h2>
        )}
        
        {/* Post content with show more/less functionality */}
        <div ref={contentRef}>
          {isLongContent ? (
            <div>
              {/* Show either preview or full content */}
              <div dangerouslySetInnerHTML={{ 
                __html: isExpanded ? fullContent : contentPreview 
              }} />
            </div>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: fullContent }} />
          )}
        </div>
        
        {/* Show more/less button */}
        {isLongContent && (
          <button 
            onClick={toggleContentExpansion}
            className="mt-2 text-sm font-medium flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            {isExpanded ? (
              <>See less <ChevronUp className="h-4 w-4" /></>
            ) : (
              <>See more <ChevronDown className="h-4 w-4" /></>
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
            loading="lazy"
          />
        </div>
      )}

      {/* Engagement Stats */}
      <div className="px-3 sm:px-4 py-2 border-t border-b flex justify-between items-center text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Heart className="h-3 w-3 fill-current" />
          <span>{postData.likes?.length || 0} likes</span>
        </div>
        <div className="cursor-pointer hover:underline" onClick={toggleComments}>
          <span>{postData.comments?.length || 0} comments</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-1 sm:px-4 py-1 flex justify-between">
        <button
          className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
            isLiked ? 'text-red-500' : ''
          }`}
          onClick={() => handleLikeClick(post.data._id)}
          aria-label={isLiked ? "Unlike post" : "Like post"}
        >
          <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
          <span className="text-xs sm:text-sm font-medium">Like</span>
        </button>
        <button 
          className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          onClick={toggleComments}
          aria-label="Comment on post"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="text-xs sm:text-sm font-medium">Comment</span>
        </button>
        <button 
          className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Share post"
        >
          <Share2 className="h-5 w-5" />
          <span className="text-xs sm:text-sm font-medium">Share</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-3 sm:px-4 pb-3 pt-1 border-t">
          {/* Display comments if available */}
          {displayComments.length > 0 ? (
            displayComments.map((comment, idx) => (
              <Comment key={comment._id || `comment-${idx}`} comment={comment} />
            ))
          ) : (
            <div className="text-center py-3 text-sm text-gray-500">
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