'use client';

import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Share2,
  UserCircle,
  ChevronDown,
  ChevronUp,
  Send,
  Star,
  Check
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

// Memoized Comment component for better performance
const Comment = memo(({ comment }) => {
  // Safely extract properties with defaults for better error handling
  const userName = comment?.user?.name || comment?.user || 'Anonymous';
  const commentContent = comment?.comment || comment?.content || comment?.text || '';
  const commentTime = comment?.timestamp || (comment?.createdAt ?
    new Date(comment.createdAt).toLocaleDateString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }) : 'Just now');

  return (
    <div className="flex gap-2 mt-3">
      <div className="rounded-full overflow-hidden h-8 w-8 flex-shrink-0">
        {comment?.user?.profileImage ? (
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
});

Comment.displayName = 'Comment';

// Optimized CommentForm with proper form handling and accessibility
const CommentForm = memo(({ postId, onCommentSubmit }) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (comment.trim() && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await onCommentSubmit(postId, comment);
        setComment('');
        inputRef.current?.focus();
      } catch (error) {
        console.error('Error submitting comment:', error);
        // Could add error handling UI here
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [comment, isSubmitting, onCommentSubmit, postId]);

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-3 px-2 sm:px-4 pb-3">
      <input
        ref={inputRef}
        type="text"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write a comment..."
        className="flex-1 rounded-full bg-gray-100 dark:bg-gray-700 px-3 sm:px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Comment text"
      />
      <button
        type="submit"
        disabled={!comment.trim() || isSubmitting}
        className="p-2 rounded-full bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        aria-label="Submit comment"
      >
        <Send className="h-4 w-4" />
      </button>
    </form>
  );
});

CommentForm.displayName = 'CommentForm';

// API service module for better separation of concerns
const postService = {
  baseURL: process.env.NEXT_PUBLIC_API,

  async checkLikeStatus(postId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/post/check-like/${postId}`,
        { 
          headers: { "Content-Type": "application/json" },
          withCredentials: true 
        }
      );
      return response.data.liked;
    } catch (err) {
      console.error('Error checking like status:', err);
      return false;
    }
  },

  async toggleLike(postId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/post/like/${postId}`,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error handling like action:', error);
      throw error;
    }
  },

  async fetchComments(postId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/post/comments/${postId}`,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching comments:', error);
      return { comments: [] };
    }
  },

  async submitComment(postId, commentText) {
    try {
      const response = await axios.post(
        `${this.baseURL}/post/comment/${postId}`,
        { comment: commentText },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }
};

// Utility functions for better code organization
const formatUtils = {
  // Format relative time (e.g. "2h ago")
  formatTimeAgo: (dateString) => {
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
  },

  // Find a good break point for text truncation
  findBreakPoint: (text, maxLength) => {
    // Try to find sentence ending within reasonable range
    for (let i = maxLength - 30; i < maxLength; i++) {
      if (['.', '!', '?'].includes(text[i]) && (text[i + 1] === ' ' || !text[i + 1])) {
        return i + 1;
      }
    }

    // Fall back to word boundary
    let breakPoint = maxLength;
    while (breakPoint > maxLength - 50 && text[breakPoint] !== ' ') {
      breakPoint--;
    }

    return breakPoint > maxLength - 50 ? breakPoint : maxLength;
  },

  // Create preview HTML while preserving structure
  createPreviewHtml: (fullHtml, previewText) => {
    // Simple approach: create the preview div with truncated text
    return `<div>${previewText}</div>`;
  }
};


const convertMarkdownToHtml = (text) => {
  if (!text) return '';
  
  let html = text;
  
  // Convert ****bold**** or **bold** to <strong>bold</strong> (do this first)
  html = html.replace(/\*{4}([^*]+)\*{4}/g, '<strong>$1</strong>');
  html = html.replace(/\*{2}([^*]+)\*{2}/g, '<strong>$1</strong>');
  
  // Convert *italic* to <em>italic</em> (single asterisks only, after bold is processed)
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  
  // Convert __underline__ to <u>underline</u>
  html = html.replace(/__([^_]+)__/g, '<u>$1</u>');
  
  // Convert ~strikethrough~ to <del>strikethrough</del>
  html = html.replace(/~([^~]+)~/g, '<del>$1</del>');
  
  // Convert # Headings (at start of line or after line break)
  html = html.replace(/^#\s+(.+)$/gm, '<h2 class="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">$1</h2>');
  html = html.replace(/^##\s+(.+)$/gm, '<h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">$1</h3>');
  html = html.replace(/^###\s+(.+)$/gm, '<h4 class="text-md font-medium text-gray-600 dark:text-gray-400 mb-1">$1</h4>');
  
  // Convert #hashtags to styled hashtags (only if not at start of line)
  html = html.replace(/(?<!^|\n)#([a-zA-Z0-9_]+)/g, '<span class="text-blue-600 font-medium">#$1</span>');
  
  // Convert @mentions to styled mentions
  html = html.replace(/@([a-zA-Z0-9_]+)/g, '<span class="text-purple-600 font-medium">@$1</span>');
  
  // Convert -lists to styled bullet points
  html = html.replace(/^-\s+(.+)$/gm, '<div class="flex items-start gap-2 my-1"><span class="text-gray-500">•</span><span>$1</span></div>');
  
  // Convert line breaks to <br> tags
  html = html.replace(/\n/g, '<br>');
  
  return html;
};

export default function PostCard({ post, isLastPost, lastPostElementRef, user }) {
  // State management with proper initialization
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLongContent, setIsLongContent] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState({ comments: [] });
  const [postData, setPostData] = useState(post?.data || {});
  const [contentPreview, setContentPreview] = useState('');
  const [fullContent, setFullContent] = useState('');
  const [copied, setCopied] = useState(false);

  // Constants
  const CONTENT_MAX_LENGTH = 300;
  const contentRef = useRef(null);
  const router = useRouter();

  // Validate post data is available
  if (!post?.data) {
    console.error('Post data is missing or invalid');
    return null; // Return null or a fallback UI
  }

  console.log('post copy:', copied);

  // Process post content for preview/full display
  const processPostContent = useCallback(() => {
  if (!postData?.description) return;

  try {
    // First convert markdown to HTML
    const convertedContent = convertMarkdownToHtml(postData.description);
    
    // Create temporary element to parse HTML and get text content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = convertedContent;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';

    // Set full content with converted markdown
    setFullContent(convertedContent);

    // Check if content is long enough to need truncation
    if (textContent.length > CONTENT_MAX_LENGTH) {
      setIsLongContent(true);

      // Find a good break point near the max length
      const breakPoint = formatUtils.findBreakPoint(textContent, CONTENT_MAX_LENGTH);
      const previewText = textContent.substring(0, breakPoint) + '...';

      // Create preview HTML by replacing text while keeping structure
      const previewHtml = formatUtils.createPreviewHtml(convertedContent, previewText);
      setContentPreview(previewHtml);
    } else {
      setIsLongContent(false);
      setContentPreview(convertedContent);
    }
  } catch (error) {
    console.error('Error processing post content:', error);
    // Fallback: still try to convert markdown even if other processing fails
    const fallbackContent = convertMarkdownToHtml(postData.description || '');
    setFullContent(fallbackContent);
    setContentPreview(fallbackContent);
  }
}, [postData]);

  // Format post date on component mount
  useEffect(() => {
    // No need to call formatTimeAgo here since it's used directly in render
  }, [postData?.createdAt]);

  // Update local post data when prop changes
  useEffect(() => {
    if (post?.data) {
      setPostData(post.data);
    }
  }, [post?.data]);

  // Process content when post data changes
  useEffect(() => {
    if (postData?.description) {
      processPostContent();
    }
  }, [postData?.description, processPostContent]);

  // Check like status on mount
  useEffect(() => {
    const fetchLikeStatus = async () => {
      if (postData?._id) {
        const liked = await postService.checkLikeStatus(postData._id);
        setIsLiked(liked);
      }
    };

    fetchLikeStatus();
  }, [postData?._id]);

  // Toggle content expansion
  const toggleContentExpansion = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  // Handle like/unlike action
  const handleLikeClick = useCallback(async (postId) => {
    try {
      const response = await postService.toggleLike(postId);

      // Update like status
      setIsLiked(response.liked);

      // Update local post data
      setPostData(prevData => {
        const currentLikes = prevData.likes || [];
        const userId = user?.email || user?._id;

        if (response.liked) {
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
  }, [user]);

  // Fetch post comments
  const fetchComments = useCallback(async () => {
    if (!postData?._id) return;

    const commentData = await postService.fetchComments(postData._id);
    setComments(commentData);
  }, [postData?._id]);

  // Toggle comments visibility
  const toggleComments = useCallback(() => {
    setShowComments(prev => {
      const newState = !prev;
      if (newState) fetchComments();
      return newState;
    });
  }, [fetchComments]);

  // Submit a new comment
  const handleCommentSubmit = useCallback(async (postId, commentText) => {
    try {
      await postService.submitComment(postId, commentText);

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
  }, [fetchComments, user]);

  const handleCopyLink = (postlink) => {
    console.log('Copying post link:', postlink);
    navigator.clipboard.writeText(postlink)
      .then(() => {
        setCopied(true);
        toast({
          title: "Success",
          description: "post link copied to clipboard!",
          variant: "default",
        });

        // Reset icon after 2 seconds
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        toast({
          title: "Error",
          description: "Failed to copy profile link!",
          variant: "destructive",
        });
      });
  };

  // Determine what comments to display
  const displayComments = comments?.comments?.length > 0
    ? comments.comments
    : postData?.comments || [];


  return (
    <>
      <Toaster />
      <div
        className="rounded-lg shadow-md mb-6 overflow-hidden post-item border border-primary/10"
        ref={isLastPost ? lastPostElementRef : null}
        data-post-id={postData?._id}
      >
        {/* Post Header with User Info */}
        <div className="p-3 sm:p-4 flex justify-between items-start">
          {postData?.user ? (
            <Link
              href={`/user/${postData.user.userid}`}
              className="flex gap-2 sm:gap-3 cursor-pointer hover:scale-105 transition-all duration-300 ease-in-out"
            >
              <div className="rounded-full overflow-hidden h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0">
                {postData.user?.profileImage ? (
                  <img
                    src={postData.user.profileImage}
                    alt={postData.user.name || "User"}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : <UserCircle className="h-9 w-9 sm:h-10 sm:w-10" />}
              </div>
              <div>
                <h3 className="font-medium">{postData.user?.name || "User"}</h3>
                <p className="text-xs text-gray-500">{formatUtils.formatTimeAgo(postData.createdAt)}</p>
              </div>
            </Link>
          ) : (
            <div className="flex gap-2 sm:gap-3">
              <UserCircle className="h-9 w-9 sm:h-10 sm:w-10" />
              <div>
                <h3 className="font-medium">Anonymous</h3>
                <p className="text-xs text-gray-500">{formatUtils.formatTimeAgo(postData.createdAt)}</p>
              </div>
            </div>
          )}
          {postData?.isAchivementPosted && (
            <div className="hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-full transition-colors">
              <Star size={20} color='lightblue' />
            </div>
          )}
        </div>

        {/* Post Title & Content */}
        <div className="px-3 sm:px-4 pb-3">
          {postData?.title && (
            <h2 className="font-semibold text-base mb-2">{postData.title}</h2>
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
              aria-expanded={isExpanded}
              aria-controls="post-content"
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
        {postData?.image_path && (
          <div className="aspect-video relative">
            <img
              src={postData.image_path}
              alt={postData.title || "Post image"}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Engagement Stats */}
        <div className="px-3 sm:px-4 py-2 border-t border-b flex justify-between items-center text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Heart className="h-3 w-3 fill-current" />
            <span>{postData?.likes?.length || 0} likes</span>
          </div>
          <div className="cursor-pointer hover:underline" onClick={toggleComments}>
            <span>{postData?.comments?.length || 0} comments</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-1 sm:px-4 py-1 flex justify-between">
          <button
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${isLiked ? 'text-red-500' : ''
              }`}
            onClick={() => postData?._id && handleLikeClick(postData._id)}
            aria-label={isLiked ? "Unlike post" : "Like post"}
            disabled={!postData?._id}
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
          {postData.user && (
            <button
            onClick={() => handleCopyLink(`${window.location.origin}/user/${postData.user.userid}/post/${postData._id}`)}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Share post"
            >
              {copied ? (
                <Check className="h-5 w-5 text-primary" />
              ) : (
                <Share2 className="h-5 w-5" />
              )}
              <span className="text-xs sm:text-sm font-medium">
                {copied ? "Copied!" : "Share"}
              </span>
            </button>
          )}

        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="px-3 sm:px-4 pb-3 pt-1 border-t">
            {/* Display comments if available */}
            {displayComments.length > 0 ? (
              displayComments.map((comment, idx) => (
                <Comment
                  key={comment._id || `comment-${postData?._id}-${idx}`}
                  comment={comment}
                />
              ))
            ) : (
              <div className="text-center py-3 text-sm text-gray-500">
                No comments yet. Be the first to comment!
              </div>
            )}

            {/* Comment Form */}
            {postData?._id && (
              <CommentForm
                postId={postData._id}
                onCommentSubmit={handleCommentSubmit}
              />
            )}
          </div>
        )}
      </div>
    </>
  );
}