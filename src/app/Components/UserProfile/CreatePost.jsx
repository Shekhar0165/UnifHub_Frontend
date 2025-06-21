'use client'
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Image,
    Send,
    Award,
    MessageCircle,
    ThumbsUp,
    Share,
    MoreHorizontal,
    Bold,
    Italic,
    List,
    Heading,
    AtSign,
    LinkIcon,
    ChevronDown,
    X
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { marked } from 'marked';
import axios from 'axios';
import { UserPosts } from './UserPost';

// Helper function to preprocess and compress images for mobile compatibility
const preprocessMobileImage = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new window.Image();
    img.onload = () => {
      // Resize logic (max 1200px)
      let { width, height } = img;
      const maxDim = 1200;
      if (width > height && width > maxDim) {
        height = (height * maxDim) / width;
        width = maxDim;
      } else if (height > maxDim) {
        width = (width * maxDim) / height;
        height = maxDim;
      }
      canvas.width = width;
      canvas.height = height;
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const processedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(processedFile);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        'image/jpeg',
        0.85
      );
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

// Component for creating normal posts and achievement posts
export const CreatePost = ({ user, onPostCreated }) => {
    const [activeTab, setActiveTab] = useState('normal');
    const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
    const [isAchievementDialogOpen, setIsAchievementDialogOpen] = useState(false);
    const [selectedAchievement, setSelectedAchievement] = useState(null);
    const [postContent, setPostContent] = useState('');
    const [showImageUpload, setShowImageUpload] = useState(false);
    const [pendingPosts, setPendingPosts] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageUploading, setImageUploading] = useState(false);
    const fileInputRef = useRef(null);
    const textareaRef = useRef(null);



    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    // Fetch pending achievements
    useEffect(() => {
        const fetchPendingPosts = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/post/pending`, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    withCredentials: true,
                });
                setPendingPosts(response.data.pendingPosts || []);
            } catch (error) {
                console.error('Error fetching pending posts:', error);
            }
        };
        fetchPendingPosts();
    }, []);

    const handleFormatText = (format) => {
        if (!textareaRef.current) return;

        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = postContent.substring(start, end);
        let formattedText = '';
        let cursorPosition = 0;

        switch (format) {
            case 'bold':
                formattedText = postContent.substring(0, start) + `**${selectedText}**` + postContent.substring(end);
                cursorPosition = end + 4;
                break;
            case 'italic':
                formattedText = postContent.substring(0, start) + `*${selectedText}*` + postContent.substring(end);
                cursorPosition = end + 2;
                break;
            case 'heading':
                formattedText = postContent.substring(0, start) + `# ${selectedText}` + postContent.substring(end);
                cursorPosition = end + 2;
                break;
            case 'list':
                formattedText = postContent.substring(0, start) + `- ${selectedText}` + postContent.substring(end);
                cursorPosition = end + 2;
                break;
            case 'mention':
                formattedText = postContent.substring(0, start) + `@${selectedText}` + postContent.substring(end);
                cursorPosition = end + 1;
                break;
            default:
                return;
        }

        setPostContent(formattedText);

        // Set focus back to textarea and restore cursor position
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(cursorPosition, cursorPosition);
        }, 0);
    };

    const handleAchievementSelect = (id) => {
        const achievement = pendingPosts.find(a => a._id.toString() === id);
        setSelectedAchievement(achievement);
        // Open the achievement dialog when an achievement is selected
        setIsAchievementDialogOpen(true);
    };

    const handleImageSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        // Accept HEIC/HEIF and convert to JPEG
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif'];
        if (!validTypes.includes(file.type) && !/\.(heic|heif)$/i.test(file.name)) {
            alert('Please select a valid image file (JPG, PNG, GIF, WebP, HEIC)');
            return;
        }
        setImageUploading(true);
        try {
            const processedFile = await preprocessMobileImage(file);
            setSelectedImage(processedFile);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(processedFile);
            setShowImageUpload(true);
        } catch (error) {
            alert('Failed to process image. Try a different image.');
        } finally {
            setImageUploading(false);
        }
    };

    // Function to remove selected image
    const removeSelectedImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        setShowImageUpload(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleRegularPostSubmit = async () => {
        if (!postContent.trim() && !selectedImage) return;

        setIsSubmitting(true);

        try {
            const htmlContent = marked.parse(postContent); // Convert markdown to HTML

            // Create FormData for multipart/form-data submission
            const formData = new FormData();
            // formData.append('title', "fsasdf");
            formData.append('content', postContent);
            formData.append('description', htmlContent);
            // formData.append('achievementid', null);
            formData.append('isAchivementPosted', false);

            // Add image if selected
            if (selectedImage) {
                formData.append('postImage', selectedImage);
            }

            // Send to backend
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API}/post/add`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                withCredentials: true,
            });

            // Reset form and close dialog
            setPostContent('');
            setSelectedImage(null);
            setImagePreview(null);
            setShowImageUpload(false);
            setIsPostDialogOpen(false);

            // Trigger refresh of posts list
            if (onPostCreated) onPostCreated();
            location.reload();

        } catch (error) {
            console.error('Error creating post:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAchievementPostSubmit = async () => {
        if (!selectedAchievement) return;

        setIsSubmitting(true);

        try {
            const htmlContent = marked.parse(postContent); // Convert markdown to HTML

            // Create FormData for multipart/form-data submission
            const formData = new FormData();
            formData.append('title', selectedAchievement.title);
            formData.append('content', postContent);
            formData.append('description', htmlContent);
            formData.append('achievementid', selectedAchievement._id);
            formData.append('isAchivementPosted', true);

            // Add image if selected
            if (selectedImage) {
                formData.append('postImage', selectedImage);
            }

            // Send to backend
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API}/post/add`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                withCredentials: true,
            });

            // Reset form and close dialog
            setPostContent('');
            setSelectedImage(null);
            setImagePreview(null);
            setShowImageUpload(false);
            setIsPostDialogOpen(false);

            // Trigger refresh of posts list
            if (onPostCreated) onPostCreated();
            location.reload();

        } catch (error) {
            console.error('Error creating achievement post:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="mb-6 shadow-md overflow-hidden">
            <CardHeader className="px-4 py-3 bg-background">
                <Tabs defaultValue="normal" className="w-full" onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-2 w-full">
                        <TabsTrigger value="normal">Regular Post</TabsTrigger>
                        <TabsTrigger value="achievement">Achievement Post</TabsTrigger>
                    </TabsList>
                </Tabs>
            </CardHeader>

            <CardContent className="px-4 py-3">
                {activeTab === 'normal' ? (
                    <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                            <img src={user?.profileImage || "/api/placeholder/40/40"} alt={user?.name || "User"} />
                        </Avatar>
                        <div
                            className="flex-1 bg-secondary rounded-full px-4 py-2.5 text-muted-foreground cursor-pointer hover:bg-secondary/80"
                            onClick={() => setIsPostDialogOpen(true)}
                        >
                            What's on your mind?
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3 overflow-y-auto">
                        <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                                <img src={user?.profileImage || "/api/placeholder/40/40"} alt={user?.name || "User"} />
                            </Avatar>
                            <Select onValueChange={handleAchievementSelect}>
                                <SelectTrigger className="w-full bg-secondary rounded-full hover:bg-secondary/80">
                                    <SelectValue placeholder="Share an achievement..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {pendingPosts.length > 0 ? (
                                        pendingPosts.map(achievement => (
                                            <SelectItem key={achievement._id} value={achievement._id.toString()}>
                                                {achievement.title}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="none" disabled>No achievements to share</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}
            </CardContent>

            {/* {activeTab === 'normal' && (
                <CardFooter className="px-4 py-3 border-t border-border flex justify-between">
                    <div className="flex space-x-1">
                        <Button variant="ghost" size="sm" className="text-muted-foreground">
                            <Image className="h-4 w-4 mr-2" />
                            Photo
                        </Button>
                    </div>
                    <Button size="sm" variant="ghost" className="text-muted-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </CardFooter>
            )} */}

            {/* Normal Post Dialog */}
            <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
                <DialogContent className="sm:max-w-md overflow-y-auto max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>Create Post</DialogTitle>
                        <DialogDescription>
                            Share your thoughts with your network
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

                            {/* <TooltipProvider>
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
                            </TooltipProvider> */}

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

                            {/* <TooltipProvider>
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
                            </TooltipProvider> */}
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex space-x-2">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleImageSelect}
                                                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/heic,image/heif"
                                                className="hidden" // Hide the actual file input
                                                id="post-image-upload"
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-full"
                                                onClick={triggerFileInput}
                                            >
                                                <Image className="h-5 w-5 text-green-600" />
                                            </Button>
                                        </div>
                                    </TooltipTrigger>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>


                    {/* Image preview section */}
                    {imagePreview && (
                        <div className="mt-3 relative">
                            <div className="rounded-lg overflow-hidden border">
                                <img src={imagePreview} alt="Selected image" className="w-full max-h-64 object-contain" />
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
                            onClick={handleRegularPostSubmit}
                            disabled={isSubmitting || !postContent.trim()}
                        >
                            {isSubmitting ? 'Posting...' : 'Post'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Achievement Post Dialog */}
            <Dialog open={isAchievementDialogOpen} onOpenChange={setIsAchievementDialogOpen}>
                <DialogContent className="sm:max-w-md overflow-y-auto max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>Share Achievement</DialogTitle>
                        <DialogDescription>
                            Share your achievement with your network
                        </DialogDescription>
                    </DialogHeader>

                    {selectedAchievement && (
                        <>
                            <div className="flex items-start space-x-3 pt-2">
                                <Avatar className="h-10 w-10">
                                    <img src={user?.profileImage || "/api/placeholder/40/40"} alt={user?.name || "User"} />
                                </Avatar>
                                <div className="flex-1">
                                    <div className="font-medium">{user?.name || "User Name"}</div>
                                    <div className="text-xs text-muted-foreground">Public</div>
                                </div>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-2">
                                <div className="flex items-center space-x-2">
                                    <Award className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    <div className="font-medium">{selectedAchievement.title}</div>
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">
                                    {selectedAchievement.date} • {selectedAchievement.type}
                                </div>
                            </div>

                            <Textarea
                                ref={textareaRef}
                                placeholder="Tell people about your achievement..."
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

                                    {/* <TooltipProvider>
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
                                    </TooltipProvider> */}

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

                                    {/* <TooltipProvider>
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
                                    </TooltipProvider> */}
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="flex space-x-2">
                                                    <input
                                                        type="file"
                                                        ref={fileInputRef}
                                                        onChange={handleImageSelect}
                                                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/heic,image/heif"
                                                        className="hidden" // Hide the actual file input
                                                        id="post-image-upload"
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-full"
                                                        onClick={triggerFileInput}
                                                    >
                                                        <Image className="h-5 w-5 text-green-600" />
                                                    </Button>
                                                </div>
                                            </TooltipTrigger>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </div>
                            {imagePreview && (
                                <div className="mt-3 relative">
                                    <div className="rounded-lg overflow-hidden border">
                                        <img src={imagePreview} alt="Selected image" className="w-full max-h-64 object-contain" />
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
                                    onClick={handleAchievementPostSubmit}
                                    className="w-full"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Sharing...' : 'Share Achievement'}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </Card>
    );
};

// Component to display user posts including achievement posts
// export const UserPosts = ({ user }) => {
//     // State to track expanded posts and visible posts count
//     const [expandedPosts, setExpandedPosts] = useState({});
//     const [visiblePostsCount, setVisiblePostsCount] = useState(3);
//     const [posts, setPosts] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [hasMore, setHasMore] = useState(true);

//     // Fetch posts
//     const fetchPosts = async () => {
//         try {
//             setLoading(true);
//             const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/post/user/${user._id}`, {
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 withCredentials: true,
//             });

//             if (!response.data.posts || !response.data.posts.post) {
//                 setPosts([]);
//                 setLoading(false);
//                 return;
//             }

//             const fetchedPosts = response.data.posts;

//             // For each post, check if the current user has liked it
//             const postsWithLikeStatus = {
//                 ...fetchedPosts,
//                 post: await Promise.all(fetchedPosts.post.map(async (post) => {
//                     try {
//                         const likeResponse = await axios.get(`${process.env.NEXT_PUBLIC_API}/post/check-like/${post._id}`, {
//                             withCredentials: true
//                         });
//                         return {
//                             ...post,
//                             likedByUser: likeResponse.data.liked
//                         };
//                     } catch (err) {
//                         console.error(`Error checking like status for post ${post._id}:`, err);
//                         return post;
//                     }
//                 }))
//             };

//             setPosts(postsWithLikeStatus);
//             setHasMore(postsWithLikeStatus.post.length > visiblePostsCount);
//         } catch (error) {
//             console.error('Error fetching posts:', error);
//         } finally {
//             setLoading(false);
//         }
//     };


//     useEffect(() => {
//         if (user?._id) {
//             fetchPosts();
//         }
//     }, [user]);

//     // Function to toggle post expansion
//     const togglePostExpansion = (postId) => {
//         setExpandedPosts(prev => ({
//             ...prev,
//             [postId]: !prev[postId]
//         }));
//     };

//     // Function to show more posts
//     const showMorePosts = () => {
//         const newCount = visiblePostsCount + 3;
//         setVisiblePostsCount(newCount);
//         setHasMore(posts.length > newCount);
//     };

//     // Handle like post
//     const handleLikePost = async (postId) => {
//         try {
//             const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/post/like/${postId}`, {
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 withCredentials: true,
//             });

//             // Update local state to reflect new like status
//             setPosts(prevPosts => {
//                 return {
//                     ...prevPosts,
//                     post: prevPosts.post.map(post => {
//                         if (post._id === postId) {
//                             // Toggle the liked status based on the response
//                             return {
//                                 ...post,
//                                 likedByUser: response.data.liked,
//                                 likes: response.data.liked ?
//                                     // If now liked, ensure user ID is in likes array
//                                     [...(post.likes || []), user._id] :
//                                     // If now unliked, remove user ID from likes array
//                                     (post.likes || []).filter(id => id !== user._id)
//                             };
//                         }
//                         return post;
//                     })
//                 };
//             });
//         } catch (error) {
//             console.error('Error liking post:', error);
//         }
//     };

//     const HandleCommentUser = async (postId, comment) => {
//         try {
//             const res = await fetch(`${process.env.NEXT_PUBLIC_API}/posts/${postId}/comment`, {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify({ comment }),
//             });
    
//             const data = await res.json();
    
//             if (!res.ok) {
//                 throw new Error(data.message || "Failed to add comment");
//             }
    
//             // You can now update the comment list or count using `data.comment`
//             console.log("Comment added:", data.comment);
//             // optionally update your UI here, maybe set state or trigger re-fetch
    
//         } catch (error) {
//             console.error('Error commenting on post:', error);
//         }
//     };
    
//     // Function to render post content with markdown-like formatting
//     const renderFormattedContent = (content, isExpanded, postId) => {
//         // Simple markdown-like parsing for display
//         let formattedContent = content;

//         // Replace headings
//         formattedContent = formattedContent.replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mb-2">$1</h1>');
//         formattedContent = formattedContent.replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold mb-2">$1</h2>');

//         // Replace bold
//         formattedContent = formattedContent.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

//         // Replace italic
//         formattedContent = formattedContent.replace(/\*(.+?)\*/g, '<em>$1</em>');

//         // Replace lists
//         formattedContent = formattedContent.replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>');

//         // Replace code blocks
//         formattedContent = formattedContent.replace(/```(\w+)?\n([\s\S]+?)\n```/g,
//             '<pre class="bg-secondary p-2 rounded-md overflow-x-auto text-sm my-2"><code>$2</code></pre>');

//         // If post is not expanded and content is long, truncate it
//         if (!isExpanded && content.length > 250) {
//             // Get first 250 characters, preserve any HTML tags
//             const truncatedContent = formattedContent.substring(0, 500);
//             return (
//                 <div>
//                     <div dangerouslySetInnerHTML={{ __html: truncatedContent + '...' }} />
//                     <Button
//                         variant="ghost"
//                         size="sm"
//                         className="text-blue-600 dark:text-blue-400 mt-2 flex items-center"
//                         onClick={() => togglePostExpansion(postId)}
//                     >
//                         See more
//                         <ChevronDown className="h-4 w-4 ml-1" />
//                     </Button>
//                 </div>
//             );
//         }

//         // If post is expanded or content is short
//         return (
//             <div>
//                 <div dangerouslySetInnerHTML={{ __html: formattedContent }} />
//                 {isExpanded && (
//                     <Button
//                         variant="ghost"
//                         size="sm"
//                         className="text-blue-600 dark:text-blue-400 mt-2"
//                         onClick={() => togglePostExpansion(postId)}
//                     >
//                         Show less
//                     </Button>
//                 )}
//             </div>
//         );
//     };

//     if (loading && posts.length === 0) {
//         return (
//             <div className="text-center py-8 text-muted-foreground">
//                 Loading posts...
//             </div>
//         );
//     }

//     if (!loading && posts.length === 0) {
//         return (
//             <div className="text-center py-8 text-muted-foreground">
//                 No posts to display. Create your first post above!
//             </div>
//         );
//     }

//     console.log(posts);

//     return (
//         <div className="space-y-4">
//             {posts?.post?.slice(0, visiblePostsCount).map((post) => (
//                 <Card key={post._id} className="shadow-sm overflow-hidden">
//                     <CardHeader className="px-4 py-3 space-y-3">
//                         <div className="flex justify-between items-start">
//                             <div className="flex items-center space-x-3">
//                                 <Avatar className="h-10 w-10">
//                                     <img src={user?.profileImage} alt={user?.name || "User"} />
//                                 </Avatar>
//                                 <div>
//                                     <div className="font-medium text-foreground">{user?.name || "User Name"}</div>
//                                     <div className="text-xs text-muted-foreground">
//                                         {new Date(post.createdAt || posts.createdAt).toLocaleDateString('en-US', {
//                                             year: 'numeric',
//                                             month: 'short',
//                                             day: 'numeric',
//                                             hour: '2-digit',
//                                             minute: '2-digit'
//                                         })}
//                                     </div>
//                                 </div>
//                             </div>
//                             <Button variant="ghost" size="icon" className="h-8 w-8">
//                                 <MoreHorizontal className="h-4 w-4" />
//                             </Button>
//                         </div>

//                         {post.type === 'achievement' && post.achievement && (
//                             <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-2">
//                                 <div className="flex items-center space-x-2">
//                                     <Award className="h-5 w-5 text-blue-600 dark:text-blue-400" />
//                                     <div className="font-medium">{post.title || post.achievement?.title}</div>
//                                 </div>
//                                 <div className="text-sm text-muted-foreground mt-1">
//                                     {post.date || post.achievement?.date} • {post.type}
//                                 </div>
//                             </div>
//                         )}
//                     </CardHeader>

//                     <CardContent className="px-4 py-2 text-lg">
//                         {post.title}

//                         {(post.hasImage || post.image_path) && (
//                             <div className="mt-3">
//                                 <div className={`rounded-lg overflow-hidden border ${expandedPosts[post._id + '_image'] ? 'h-auto' : 'md:max-h-64 max-h-40'}`}>
//                                     <img
//                                         src={post.image_path || "/api/placeholder/600/300"}
//                                         alt="Post image"
//                                         className="w-full h-64 md:h-auto object-cover"
//                                     />
//                                 </div>
//                                 {post.image_path && (
//                                     <Button
//                                         variant="ghost"
//                                         size="sm"
//                                         className="text-blue-600 dark:text-blue-400 mt-1"
//                                         onClick={() => setExpandedPosts(prev => ({
//                                             ...prev,
//                                             [post._id + '_image']: !prev[post._id + '_image']
//                                         }))}
//                                     >
//                                         {expandedPosts[post._id + '_image'] ? 'Show less' : 'Show more'}
//                                         <ChevronDown
//                                             className={`h-4 w-4 ml-1 transition-transform ${expandedPosts[post._id + '_image'] ? 'rotate-180' : ''}`}
//                                         />
//                                     </Button>
//                                 )}
//                             </div>
//                         )}
//                         <data>
//                             {renderFormattedContent(post.content, expandedPosts[post._id], post._id)}
//                         </data>

//                         <div className="flex items-center justify-between text-xs text-muted-foreground mt-4">
//                             <div>{(post.likes?.length || 0)} likes</div>
//                             <div>{(post.comments?.length || 0)} comments • {(post.shares || 0)} shares</div>
//                         </div>
//                     </CardContent>

//                     <CardFooter className="px-2 py-1 border-t border-border">
//                         <div className="grid grid-cols-3 w-full">
//                             <Button
//                                 variant={"ghost"}
//                                 // className={}
//                                 onClick={() => handleLikePost(post._id)}
//                             >
//                                 <ThumbsUp
//                                     className={`h-4 w-4 mr-2 ${post.likedByUser ? 'text-white fill-white' : 'text-muted-foreground fill-none'}`}
//                                     fill="currentColor"
//                                 />
//                                 {post.likedByUser ? 'Liked' : 'Like'}
//                             </Button>
//                             <Button variant="ghost" className="text-muted-foreground">
//                                 <MessageCircle className="h-4 w-4 mr-2" />
//                                 Comment
//                             </Button>
//                             <Button variant="ghost" className="text-muted-foreground">
//                                 <Share className="h-4 w-4 mr-2" />
//                                 Share
//                             </Button>
//                         </div>
//                     </CardFooter>
//                 </Card>
//             ))}

//             {posts?.post?.length > 0 && (
//                 <div className="text-center">
//                     {visiblePostsCount < posts.post.length ? (
//                         <Button variant="outline" className="font-medium" onClick={showMorePosts}>
//                             Show more posts ({posts.post.length - visiblePostsCount} more)
//                         </Button>
//                     ) : visiblePostsCount > 3 ? (
//                         <Button variant="outline" className="font-medium" onClick={() => setVisiblePostsCount(3)}>
//                             Show less posts
//                         </Button>
//                     ) : null}
//                 </div>
//             )}
//         </div>
//     );
// };

// Main component to integrate CreatePost and UserPosts
const PostsSection = ({ user }) => {
    const [MainUser,SetMainUser] = useState('');
    const UserIDByLocalStorge = localStorage.getItem('UserId')
    useEffect(()=>{
        SetMainUser(UserIDByLocalStorge)
    },[])

    console.log("inside cretaf afkjasb jkfbasfd",MainUser)
    return (
        <div className="space-y-6">
            {MainUser === user?.userid ? <CreatePost user={user} /> : ''}
            <UserPosts user={user} />
        </div>
    );
};

export default PostsSection;