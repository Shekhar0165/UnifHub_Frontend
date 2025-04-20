import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ChevronDown, ChevronUp, Heart, MessageCircle, MoreHorizontal, Share2, UserCircle, Send, Edit, Trash2, X, Bold, Italic, Heading, List, AtSign, Image, ImageIcon, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

/**
 * Comment form component for submitting new comments
 */
export const CommentForm = ({ postId, onCommentSubmit }) => {
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

/**
 * Comment component to display individual comments
 */
export const Comment = ({ comment }) => {
  const userName = comment.user?.name || comment.user || 'Anonymous';
  const commentContent = comment.comment || comment.content || '';
  const commentTime = comment.timestamp || (comment.createdAt ?
    new Date(comment.createdAt).toLocaleDateString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }) : 'Just now');

  return (
    <div className="flex gap-2 mt-3">
      <div className="rounded-full overflow-hidden h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
        {comment.user?.profileImage ? (
          <img
            src={comment.user.profileImage}
            alt={userName}
            className="h-full w-full object-cover"
          />
        ) : <UserCircle className="h-full w-full" />}
      </div>
      <div className="rounded-lg bg-gray-100 dark:bg-gray-700 px-2 sm:px-3 py-2 w-full text-xs sm:text-sm">
        <div className="flex justify-between flex-wrap gap-1">
          <h4 className="font-medium">{userName}</h4>
          <span className="text-gray-500 text-xs">{commentTime}</span>
        </div>
        <p className="mt-1 break-words">{commentContent}</p>
      </div>
    </div>
  );
};

/**
 * Post options menu component
 */
const PostOptionsMenu = ({ post, onDelete, onEdit, onClose }) => {



  return (
    <div className="absolute right-3 top-12 z-10 bg-white dark:bg-gray-800 shadow-md rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="py-1">
        <button
          onClick={() => {
            onEdit(post);
            onClose();
          }}
          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Edit className="h-4 w-4" />
          Edit post
        </button>
        <button
          onClick={() => {
            onDelete(post._id);
            onClose();
          }}
          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Trash2 className="h-4 w-4" />
          Delete post
        </button>
      </div>
    </div>
  );
};

/**
 * Main UserPosts component
 */
export const UserPosts = ({ user }) => {
  // State management for posts
  const [expandedPosts, setExpandedPosts] = useState({});
  const [visiblePostsCount, setVisiblePostsCount] = useState(3);
  const [posts, setPosts] = useState({ post: [] });
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [showComments, setShowComments] = useState({});
  const [comments, setComments] = useState({ comments: [] });
  const [activeOptionsMenu, setActiveOptionsMenu] = useState(null);
  const [contentPreviews, setContentPreviews] = useState({});
  const [fullContents, setFullContents] = useState({});

  // State for post creation/editing
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [postContent, setPostContent] = useState('');
  const [postImage, setPostImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Constants
  const CONTENT_MAX_LENGTH = 300;
  const optionsMenuRef = useRef(null);

  const [Userid, SetUserid] = useState('')

  useEffect(() => {
    const UserIDByLocalStorge = localStorage.getItem('UserId')
    SetUserid(UserIDByLocalStorge)
  }, [])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target)) {
        setActiveOptionsMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
        setPosts({ post: [] });
        setLoading(false);
        return;
      }

      const fetchedPosts = response.data.posts;

      // Check like status for each post
      const postsWithLikeStatus = {
        ...fetchedPosts,
        post: await Promise.all(fetchedPosts.post.map(async (post) => {
          try {
            const likeResponse = await axios.get(`${process.env.NEXT_PUBLIC_API}/post/check-like/${post._id}`, {
              withCredentials: true
            });

            // Process content for previews
            processPostContent(post);

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

  // Process post content for preview/full display
  const processPostContent = (post) => {
    if (!post.content) return;

    // Create temporary element to parse HTML and get text content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = post.content;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';

    // Set full content
    setFullContents(prev => ({
      ...prev,
      [post._id]: post.content
    }));

    // Check if content is long enough to need truncation
    if (textContent.length > CONTENT_MAX_LENGTH) {
      // Find a good break point near the max length
      const breakPoint = findBreakPoint(textContent, CONTENT_MAX_LENGTH);
      const previewText = textContent.substring(0, breakPoint) + '...';

      // Create preview HTML
      setContentPreviews(prev => ({
        ...prev,
        [post._id]: `<div>${previewText}</div>`
      }));
    } else {
      setContentPreviews(prev => ({
        ...prev,
        [post._id]: post.content
      }));
    }
  };

  // Find a good break point for text (at a space after a sentence if possible)
  const findBreakPoint = (text, maxLength) => {
    // Try to find sentence ending within reasonable range
    for (let i = maxLength - 30; i < maxLength; i++) {
      if (i >= 0 && i < text.length && ['.', '!', '?'].includes(text[i]) && (text[i + 1] === ' ' || !text[i + 1])) {
        return i + 1;
      }
    }

    // Fall back to word boundary
    let breakPoint = maxLength;
    while (breakPoint > maxLength - 50 && breakPoint > 0 && text[breakPoint] !== ' ') {
      breakPoint--;
    }

    return breakPoint > maxLength - 50 ? breakPoint : maxLength;
  };

  useEffect(() => {
    if (user?._id) {
      fetchPosts();
    }
  }, [user]);

  // Toggle post expansion
  const togglePostExpansion = (postId) => {
    setExpandedPosts(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  // Fetch comments for a post
  const fetchComments = async (postId) => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API}/post/comments/${postId}`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      setComments(res.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments({ comments: [] });
    }
  };

  // Toggle comments visibility
  const toggleComments = (postId) => {
    setShowComments(prev => {
      const newState = {
        ...prev,
        [postId]: !prev[postId]
      };

      if (newState[postId]) {
        fetchComments(postId);
      }

      return newState;
    });
  };

  // Show more posts
  const showMorePosts = () => {
    const newCount = visiblePostsCount + 3;
    setVisiblePostsCount(newCount);
    setHasMore(posts.post.length > newCount);
  };

  // Handle post like/unlike
  const handleLikePost = async (postId) => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/post/like/${postId}`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      // Update local state with new like status
      setPosts(prevPosts => {
        return {
          ...prevPosts,
          post: prevPosts.post.map(post => {
            if (post._id === postId) {
              return {
                ...post,
                likedByUser: response.data.liked,
                likes: response.data.liked ?
                  [...(post.likes || []), user._id] :
                  (post.likes || []).filter(id => id !== user._id)
              };
            }
            return post;
          })
        };
      });
    } catch (error) {
      console.error('Error handling like action:', error);
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (postId, commentText) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/post/comment/${postId}`,
        { comment: commentText },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        // Refresh comments after posting
        fetchComments(postId);

        // Update post comment count in state
        setPosts(prevPosts => {
          return {
            ...prevPosts,
            post: prevPosts.post.map(post => {
              if (post._id === postId) {
                const updatedComments = [...(post.comments || []), {
                  user: user.name || user.email,
                  content: commentText,
                  createdAt: new Date().toISOString()
                }];

                return {
                  ...post,
                  comments: updatedComments
                };
              }
              return post;
            })
          };
        });
      } else {
        throw new Error(response.data.message || "Failed to add comment");
      }
    } catch (error) {
      console.error('Error commenting on post:', error);
    }
  };

  // Format time ago
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

  // Toggle options menu
  const toggleOptionsMenu = (postId) => {
    setActiveOptionsMenu(prev => prev === postId ? null : postId);
  };

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPostImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Remove selected image
  const removeSelectedImage = () => {
    setPostImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Format text in textarea
  const handleFormatText = (formatType) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = postContent.substring(start, end);

    let formattedText = '';
    let cursorPosition = 0;

    switch (formatType) {
      case 'bold':
        formattedText = postContent.substring(0, start) + `**${selectedText}**` + postContent.substring(end);
        cursorPosition = end + 4;
        break;
      case 'italic':
        formattedText = postContent.substring(0, start) + `*${selectedText}*` + postContent.substring(end);
        cursorPosition = end + 2;
        break;
      case 'heading':
        formattedText = postContent.substring(0, start) + `\n# ${selectedText}\n` + postContent.substring(end);
        cursorPosition = end + 4;
        break;
      case 'list':
        formattedText = postContent.substring(0, start) + `\n- ${selectedText}` + postContent.substring(end);
        cursorPosition = end + 3;
        break;
      case 'mention':
        formattedText = postContent.substring(0, start) + `@${selectedText}` + postContent.substring(end);
        cursorPosition = end + 1;
        break;
      default:
        return;
    }

    setPostContent(formattedText);

    // Set cursor position after formatting
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = selectedText ? cursorPosition : start + 2;
      textarea.selectionEnd = selectedText ? cursorPosition : start + 2;
    }, 0);
  };

  // Handle delete post
  const handleDeletePost = async (postId) => {
    try {
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_API}/post/delete/${postId}`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      if (response.data.message === "Post deleted successfully") {
        // Remove the deleted post from state
        setPosts(prevPosts => {
          return {
            ...prevPosts,
            post: prevPosts.post.filter(post => post._id !== postId)
          };
        });

        toast({
          title: "Post Deleted",
          description: "The post has been successfully deleted.",
        });
      } else {
        throw new Error(response.data.message || "Failed to delete post");
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Deletion Failed",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle edit post
  const handleEditPost = (post) => {
    // Set the post being edited
    setEditingPost(post);

    // Set the content (remove HTML tags for editing if needed)
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = post.content;
    setPostContent(tempDiv.textContent || tempDiv.innerText || '');

    // Set image preview if the post has an image
    if (post.image_path) {
      setImagePreview(post.image_path);
    }

    // Open the dialog
    setIsPostDialogOpen(true);
  };

  // Handle regular post submit (create new post)
  const handleRegularPostSubmit = async () => {
    if (!postContent.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('content', postContent);
      if (postImage) {
        formData.append('image', postImage);
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/post/create`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        // Refresh posts or add the new post to the state
        fetchPosts();

        // Reset form
        setPostContent('');
        setPostImage(null);
        setImagePreview(null);
        setIsPostDialogOpen(false);

        toast({
          title: "Post Created",
          description: "Your post has been successfully created.",
        });
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Post Failed",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle update post
  const handleUpdatePost = async () => {
    if (!editingPost || !postContent.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('content', postContent);

      if (postImage) {
        formData.append('image', postImage);
      }

      // If there was an image but it was removed
      if (editingPost.image_path && !imagePreview) {
        formData.append('removeImage', 'true');
      }

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API}/post/update/${editingPost._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        // Update the post in local state
        setPosts(prevPosts => {
          const updatedPost = {
            ...editingPost,
            content: postContent,
            image_path: imagePreview
          };

          // Process content for preview
          processPostContent(updatedPost);

          return {
            ...prevPosts,
            post: prevPosts.post.map(p =>
              p._id === editingPost._id ? updatedPost : p
            )
          };
        });

        // Reset form and state
        setEditingPost(null);
        setPostContent('');
        setPostImage(null);
        setImagePreview(null);
        setIsPostDialogOpen(false);

        toast({
          title: "Post Updated",
          description: "Your post has been successfully updated.",
        });
      }
    } catch (error) {
      console.error('Error updating post:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dialog close handler
  const onDialogClose = () => {
    setEditingPost(null);
    setPostContent('');
    setPostImage(null);
    setImagePreview(null);
  };

  // Loading state
  if (loading && posts.post.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading posts...
      </div>
    );
  }

  // Empty state
  if (!loading && (!posts.post || posts.post.length === 0)) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No posts to display. Create your first post above!
      </div>
    );
  }

  return (
    <>
      <Toaster />
      {/* Post Dialog - For both creating and editing posts */}
      <Dialog
        open={isPostDialogOpen}
        onOpenChange={(open) => {
          if (!open) onDialogClose();
          setIsPostDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-md overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{editingPost ? 'Edit Post' : 'Create Post'}</DialogTitle>
            <DialogDescription>
              {editingPost ? 'Update your post' : 'Share your thoughts with your network'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-start space-x-3 pt-2">
            <Avatar className="h-10 w-10">
              <img src={user?.profileImage || "/api/placeholder/40/40"} alt={user?.name || "User"} />
            </Avatar>
            <div className="flex-1">
              <div className="font-medium">{user?.name || "User Name"}</div>
              <div className="text-xs text-muted-foreground">Public</div>
            </div>
          </div>
          <Textarea
            ref={textareaRef}
            placeholder="What's on your mind?"
            className="min-h-32 focus-visible:ring-0 resize-none"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
          />

          <div className="border rounded-lg p-2">
            <div className="mb-2 text-sm font-medium">Format your post</div>
            <div className="flex flex-wrap gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => handleFormatText('bold')}
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Bold</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => handleFormatText('italic')}
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Italic</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => handleFormatText('heading')}
                    >
                      <Heading className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Heading</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => handleFormatText('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>List</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => handleFormatText('mention')}
                    >
                      <AtSign className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Mention</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex space-x-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageSelect}
                        accept="image/*"
                        className="hidden"
                        id="post-image-upload"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={triggerFileInput}
                      >
                        <ImageIcon className="h-5 w-5 text-green-600" />
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Add Image</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Image preview section */}
          {imagePreview && (
            <div className="mt-3 relative">
              <div className="rounded-lg overflow-hidden border">
                <img
                  src={imagePreview}
                  alt="Selected image"
                  className="w-full max-h-64 object-contain"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-black/30 hover:bg-black/50 text-white rounded-full h-8 w-8"
                onClick={removeSelectedImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              className="w-full"
              onClick={editingPost ? handleUpdatePost : handleRegularPostSubmit}
              disabled={isSubmitting || !postContent.trim()}
            >
              {isSubmitting ? 'Saving...' : editingPost ? 'Update' : 'Post'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Posts List */}
      <div className="space-y-4 md:space-y-6 max-w-full overflow-hidden">
        {/* Current UTC Time Display */}
        {/* <div className="text-sm text-gray-500 mb-4">
          Current UTC Time: {currentUTC}
        </div> */}

        {posts?.post?.slice(0, visiblePostsCount).map((post) => (
          <div
            key={post._id}
            className="rounded-lg shadow-md overflow-hidden post-item border border-primary/10 relative"
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
              {Userid === user?.userid ? <div ref={activeOptionsMenu === post._id ? optionsMenuRef : null}>
                <button
                  className="hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-full transition-colors"
                  onClick={() => toggleOptionsMenu(post._id)}
                >
                  <MoreHorizontal className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>

                {activeOptionsMenu === post._id && (
                  <PostOptionsMenu
                    post={post}
                    onDelete={handleDeletePost}
                    onEdit={handleEditPost}
                    onClose={() => setActiveOptionsMenu(null)}
                  />
                )}
              </div> : <button className="hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-full transition-colors">
                      {post.isAchivementPosted && <Star size={20} color='lightblue' />}
                      </button>}
              {/* {<div ref={activeOptionsMenu === post._id ? optionsMenuRef : null}>
                <button
                  className="hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-full transition-colors"
                  onClick={() => toggleOptionsMenu(post._id)}
                >
                  <MoreHorizontal className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>

                {activeOptionsMenu === post._id && (
                  <PostOptionsMenu
                    post={post}
                    onDelete={handleDeletePost}
                    onEdit={handleEditPost}
                    onClose={() => setActiveOptionsMenu(null)}
                  />
                )}
              </div>} */}
            </div>

            {/* Post Content */}
            <div className="px-3 sm:px-4 pb-3">
              {post.title && (
                <h2 className="font-semibold text-sm sm:text-base mb-2">{post.title}</h2>
              )}

              <div className="text-sm sm:text-base break-words">
                <div dangerouslySetInnerHTML={{
                  __html: expandedPosts[post._id] ?
                    fullContents[post._id] || post.content :
                    contentPreviews[post._id] || post.content
                }} />
              </div>

              {/* Show more/less button */}
              {(fullContents[post._id] && contentPreviews[post._id] && fullContents[post._id] !== contentPreviews[post._id]) && (
                <button
                  onClick={() => togglePostExpansion(post._id)}
                  className="mt-2 text-xs sm:text-sm font-medium flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  {expandedPosts[post._id] ? (
                    <>See less <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" /></>
                  ) : (
                    <>See more <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" /></>
                  )}
                </button>
              )}
            </div>

            {/* Post Image */}
            {post.image_path && (
              <div className="aspect-video relative">
                <img
                  src={post.image_path}
                  alt={post.title || "Post image"}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            )}

            {/* Engagement Stats */}
            <div className="px-3 sm:px-4 py-2 border-t border-b flex justify-between items-center text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Heart className="h-3 w-3 fill-current" />
                <span>{post.likes?.length || 0} likes</span>
              </div>
              <div
                className="cursor-pointer hover:underline"
                onClick={() => toggleComments(post._id)}
              >
                <span>{post.comments?.length || 0} comments</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-1 sm:px-4 py-1 flex justify-between">
              <button
                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${post.likedByUser ? 'text-red-500' : ''
                  }`}
                onClick={() => handleLikePost(post._id)}
                aria-label={post.likedByUser ? "Unlike post" : "Like post"}
              >
                <Heart className={`h-4 w-4 sm:h-5 sm:w-5 ${post.likedByUser ? 'fill-current' : ''}`} />
                <span className="text-xs sm:text-sm font-medium">Like</span>
              </button>
              <button
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => toggleComments(post._id)}
                aria-label="Comment on post"
              >
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm font-medium">Comment</span>
              </button>
              <button
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Share post"
              >
                <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm font-medium">Share</span>
              </button>
            </div>

            {/* Comments Section */}
            {showComments[post._id] && (
              <div className="px-3 sm:px-4 pb-3 pt-1 border-t max-h-96 overflow-y-auto">
                {comments.comments && comments.comments.length > 0 ? (
                  comments.comments.map((comment, idx) => (
                    <Comment key={comment._id || `comment-${idx}`} comment={comment} />
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

        {/* Show more/less posts buttons */}
        {posts?.post?.length > 0 && (
          <div className="text-center">
            {visiblePostsCount < posts.post.length ? (
              <Button
                variant="outline"
                className="text-xs sm:text-sm font-medium"
                onClick={showMorePosts}
              >
                Show more posts ({posts.post.length - visiblePostsCount} more)
              </Button>
            ) : visiblePostsCount > 3 ? (
              <Button
                variant="outline"
                className="text-xs sm:text-sm font-medium"
                onClick={() => setVisiblePostsCount(3)}
              >
                Show less posts
              </Button>
            ) : null}
          </div>
        )}
      </div>
    </>
  );
};