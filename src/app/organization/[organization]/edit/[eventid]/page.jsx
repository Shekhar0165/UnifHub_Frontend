'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { ImagePlus, X, Calendar, Clock, Users, MapPin, Tag, AlertCircle, Share2, BookmarkPlus } from 'lucide-react'
import Footer from '@/app/Components/Footer/Footer'
import Header from '@/app/Components/Header/Header'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert"
import { Separator } from '@/components/ui/separator'
import dynamic from 'next/dynamic'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog"
import { useParams, useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

// Import rich text editor with dynamic import (no SSR)
const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
    ssr: false
})

// Zod validation schema
const eventFormSchema = z.object({
    organization_id: z.string().min(1, 'Organization ID is required'),
    eventName: z.string().min(1, 'Event Name is required'),
    description: z.string().optional(),
    content: z.string().optional(),
    image: z.union([z.instanceof(File), z.string()]).optional(),
    eventDate: z.string().min(1, 'Event Date is required'),
    time: z.string().optional(),
    venue: z.string().min(1, 'Venue is required'),
    category: z.string().min(1, 'Category is required'),
    maxTeamMembers: z.coerce.number().min(1, 'Max Team Members is required'),
    minTeamMembers: z.coerce.number().min(1, 'Min Team Members is required')
})

const EditEventForm = () => {
    const [imagePreview, setImagePreview] = useState(null)
    const [imageLoading, setImageLoading] = useState(false)
    const [imageError, setImageError] = useState(false)
    const [organizations, setOrganizations] = useState([])
    const [event, setEvent] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [contentHtml, setContentHtml] = useState('')
    const [showEditPanel, setShowEditPanel] = useState(false)
    const { toast } = useToast()
    const router = useRouter()
    const params = useParams();
    const eventId = params.eventid;

    // Event categories with icons - enhanced presentation
    const eventCategories = [
        'Conference', 'Workshop', 'Seminar', 'Hackathon',
        'Networking', 'Competition', 'Cultural', 'Sports', 'Other'
    ]

    // Initialize the form with useForm
    const form = useForm({
        resolver: zodResolver(eventFormSchema),
        defaultValues: {
            organization_id: '',
            eventName: '',
            description: '',
            content: '',
            eventDate: '',
            time: '',
            venue: '',
            category: '',
            maxTeamMembers: 1,
            minTeamMembers: 1
        },
        mode: 'onChange'
    });

    // Fetch event data with improved error handling
    useEffect(() => {
        const fetchEventData = async () => {
            if (!eventId) return;

            try {
                setIsLoading(true);
                const response = await axios.post(
                    `${process.env.NEXT_PUBLIC_API}/events/one`,
                    { _id: eventId },
                    {
                        headers: {
                            "Content-Type": "application/json",
                        },
                        withCredentials: true,
                    }
                );

                if (!response.data || response.data.length === 0) {
                    throw new Error("No event data received");
                }

                const eventData = response.data[0];
                setEvent(eventData);

                // Format event date if necessary
                const formattedDate = eventData.eventDate ?
                    new Date(eventData.eventDate).toISOString().split('T')[0] : '';

                // Update form values
                form.reset({
                    organization_id: eventData.organization_id || '',
                    eventName: eventData.eventName || '',
                    description: eventData.description || '',
                    content: eventData.content || '',
                    eventDate: formattedDate,
                    time: eventData.time || '',
                    venue: eventData.venue || '',
                    category: eventData.category || '',
                    maxTeamMembers: eventData.maxTeamMembers || 1,
                    minTeamMembers: eventData.minTeamMembers || 1
                });

                // Set content HTML for the rich text editor
                setContentHtml(eventData.content || '');

                // Set image preview if available
                if (eventData.image_path) {
                    setImageLoading(true);
                    const imageUrl = `${eventData.image_path}`;

                    // Preload image to ensure it's loaded properly
                    const img = new Image();
                    img.onload = () => {
                        setImagePreview(imageUrl);
                        setImageLoading(false);
                        setImageError(false);
                    };
                    img.onerror = () => {
                        console.error("Failed to load image:", imageUrl);
                        setImageError(true);
                        setImageLoading(false);
                    };
                    img.src = imageUrl;
                }

            } catch (error) {
                console.error("Error fetching event:", error);
                if (error.response?.status === 401) {
                    Cookies.remove('accessToken');
                    Cookies.remove('refreshToken');
                    Cookies.remove('UserType');
                    Cookies.remove('UserId');
                    router.push('/');
                    return;
                }
                toast({
                    variant: "destructive",
                    title: "Failed to load event data",
                    description: error.message || "Please try again or contact support.",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchEventData();
    }, [eventId, form, toast, router]);

    // Fetch organizations
    useEffect(() => {
        const fetchOrganizationData = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/org`, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true,
                });

                if (response.data) {
                    setOrganizations(Array.isArray(response.data) ? response.data : [response.data]);
                } else {
                    throw new Error("No organization data received");
                }
            } catch (error) {
                console.error("Error fetching organizations:", error);
                if (error.response?.status === 401) {
                    Cookies.remove('accessToken');
                    Cookies.remove('refreshToken');
                    Cookies.remove('UserType');
                    Cookies.remove('UserId');
                    router.push('/');
                    return;
                }
                toast({
                    variant: "destructive",
                    title: "Failed to load organizations",
                    description: error.message || "Please try again or contact support.",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrganizationData();
    }, [toast, router]);

    // Handle image selection with improved validation
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Reset error state
        setImageError(false);

        // Validate file type and size
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!allowedTypes.includes(file.type)) {
            setImageError(true);
            toast({
                variant: "destructive",
                title: "Invalid file type",
                description: "Please upload JPEG, PNG, GIF, or WebP file formats only.",
            });
            return;
        }

        if (file.size > maxSize) {
            setImageError(true);
            toast({
                variant: "destructive",
                title: "File too large",
                description: "Maximum file size is 5MB. Please upload a smaller image.",
            });
            return;
        }

        // Create image preview
        const reader = new FileReader();
        reader.onloadstart = () => {
            setImageLoading(true);
        };
        reader.onloadend = () => {
            setImagePreview(reader.result);
            setImageLoading(false);
        };
        reader.onerror = () => {
            setImageError(true);
            setImageLoading(false);
            toast({
                variant: "destructive",
                title: "Failed to process image",
                description: "Please try another image file.",
            });
        };
        reader.readAsDataURL(file);

        // Set image in form
        form.setValue('image', file);
    };

    // Handle rich text editor content change
    const handleContentChange = (html) => {
        setContentHtml(html);
        form.setValue('content', html);
    };

    // Remove image
    const handleRemoveImage = () => {
        setImagePreview(null);
        setImageError(false);
        form.setValue('image', undefined);
        // Reset file input
        const fileInput = document.getElementById('image-upload');
        if (fileInput) fileInput.value = '';
    };

    // Form submission handler with improved error handling and user experience
    const onSubmit = async (values) => {
        try {
            setIsSubmitting(true);

            // Create FormData for file upload
            const formData = new FormData();

            // Add event ID for update
            formData.append('_id', eventId);

            // Append all text fields
            Object.keys(values).forEach(key => {
                if (key !== 'image') {
                    // Make sure content is in HTML format
                    if (key === 'content') {
                        formData.append(key, contentHtml || values[key] || '');
                    } else {
                        formData.append(key, values[key] || '');
                    }
                }
            });

            // Append image if it's a new file
            if (values.image && values.image instanceof File) {
                formData.append('image', values.image);
            }

            // Send to backend - using update endpoint
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API}/events/update/${eventId}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    withCredentials: true
                }
            );

            // Success toast
            toast({
                title: "Event updated successfully",
                description: "Your event has been updated in the system.",
            });

            // Redirect to event page after short delay to allow toast to be seen
            setTimeout(() => {
                router.push(`/events/${values.eventName}`);
            }, 1500);

        } catch (error) {
            console.error('Error updating event:', error);
            if (error.response?.status === 401) {
                Cookies.remove('accessToken');
                Cookies.remove('refreshToken');
                Cookies.remove('UserType');
                Cookies.remove('UserId');
                router.push('/');
                return;
            }
            // Error toast with more specific messages
            toast({
                variant: "destructive",
                title: "Failed to update event",
                description: error.response?.data?.message || error.message || "An unexpected error occurred. Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Go back function
    const handleGoBack = () => {
        router.back();
    };

    // Get today's date in YYYY-MM-DD format for min date attribute
    const today = new Date().toISOString().split('T')[0];
    return (
        <>
            <Header />
            <div className="flex justify-center items-start min-h-screen p-4 pt-8 pb-16 ">
                <Card className="w-full border-0 overflow-hidden">
                    <CardHeader className="rounded-t-lg py-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <CardTitle className="text-3xl font-bold tracking-tight">Edit Event</CardTitle>
                                <CardDescription className="mt-2 text-lg">Update your event information</CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-6 md:p-8">
                        {isLoading ? (
                            <div className="flex justify-center items-center py-20">
                                <LoadingSpinner size={32} text="Loading event data..." />
                            </div>
                        ) : organizations.length === 0 ? (
                            <Alert variant="destructive" className="mb-6">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>No organizations found</AlertTitle>
                                <AlertDescription>
                                    You need to create an organization before you can edit events.
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <FormProvider {...form}>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                        {/* Modified Two Column Layout */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 relative">
                                            {/* Left Column - Content Editor (Fixed) */}
                                            <div className="space-y-8 lg:sticky lg:top-10 lg:self-start">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center mb-4">
                                                        <div className="w-1 h-6 bg-foreground rounded mr-3"></div>
                                                        <h3 className="text-xl font-semibold">Event Content</h3>
                                                    </div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                                        Write detailed information about your event. Use formatting to organize content clearly.
                                                    </p>

                                                    {/* Rich Text Editor */}
                                                    <div className="rounded-md overflow-hidden">
                                                        <RichTextEditor
                                                            value={contentHtml}
                                                            onChange={handleContentChange}
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-3">
                                                        <div className="w-2 h-2 rounded-full"></div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right Column - Other Details (Scrollable) */}
                                            <div className="space-y-8 overflow-y-auto pr-2 h-[calc(100vh-40px)]">
                                                {/* Image Upload Section */}
                                                {/* Image Upload Section - Redesigned */}
                                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
                                                    {imageLoading ? (
                                                        <div className="flex flex-col items-center justify-center h-72 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-800">
                                                            <LoadingSpinner size={40} text="Loading image..." />
                                                        </div>
                                                    ) : imagePreview ? (
                                                        <div className="relative group">
                                                            {/* Image Container with Overlay */}
                                                            <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
                                                                <img
                                                                    src={imagePreview}
                                                                    alt="Event preview"
                                                                    className="w-full h-72 object-cover"
                                                                />

                                                                {/* Overlay with Actions - Visible on Hover */}
                                                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-5">
                                                                    <div className="flex flex-wrap gap-3 mb-3">
                                                                        <input
                                                                            type="file"
                                                                            id="image-upload-replacement"
                                                                            accept="image/jpeg,image/png,image/gif,image/webp"
                                                                            onChange={handleImageChange}
                                                                            className="hidden"
                                                                        />
                                                                        <label
                                                                            htmlFor="image-upload-replacement"
                                                                            className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 text-gray-800 rounded-lg hover:bg-white transition-colors cursor-pointer font-medium text-sm shadow-md"
                                                                        >
                                                                            <ImagePlus className="h-4 w-4" />
                                                                            Replace Image
                                                                        </label>

                                                                        <button
                                                                            type="button"
                                                                            onClick={handleRemoveImage}
                                                                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/90 text-white rounded-lg hover:bg-red-600 transition-colors font-medium text-sm shadow-md"
                                                                        >
                                                                            <X className="h-4 w-4" />
                                                                            Remove
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Current Image Info */}
                                                            <div className="flex items-center justify-between mt-3">
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                    Current event image
                                                                </p>
                                                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                                                    Hover to manage
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors">
                                                            <div className="p-8">
                                                                <input
                                                                    type="file"
                                                                    id="image-upload"
                                                                    accept="image/jpeg,image/png,image/gif,image/webp"
                                                                    onChange={handleImageChange}
                                                                    className="hidden"
                                                                />
                                                                <label
                                                                    htmlFor="image-upload"
                                                                    className="cursor-pointer flex flex-col items-center"
                                                                >
                                                                    <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-full p-5 mb-5">
                                                                        <ImagePlus className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
                                                                    </div>
                                                                    <p className="text-gray-700 dark:text-gray-300 font-medium text-lg mb-2">
                                                                        Click to upload event image
                                                                    </p>
                                                                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                                                                        Drag and drop or click to browse
                                                                    </p>
                                                                    <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">
                                                                        JPEG, PNG, GIF or WebP (Max 5MB)
                                                                    </p>
                                                                </label>
                                                            </div>

                                                            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/30 rounded-b-lg border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                                                <span className="text-sm text-gray-500 dark:text-gray-400">Images will be optimized for web</span>
                                                                <span className="text-xs text-indigo-500 dark:text-indigo-400 font-medium">Required</span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {imageError && (
                                                        <Alert variant="destructive" className="mt-4">
                                                            <AlertCircle className="h-4 w-4" />
                                                            <AlertTitle>Image Error</AlertTitle>
                                                            <AlertDescription>
                                                                There was a problem with the selected image. Please try another file.
                                                            </AlertDescription>
                                                        </Alert>
                                                    )}
                                                </div>
                                                <Separator className="my-6" />

                                            {/* Rest of the form elements */}
                                            <div className="space-y-5">
                                                <div className="flex items-center mb-2">
                                                    <div className="w-1 h-6 bg-foreground rounded mr-3"></div>
                                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Event Details</h3>
                                                </div>

                                                {/* Organization ID */}
                                                <FormField
                                                    control={form.control}
                                                    name="organization_id"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
                                                                <Users className="h-4 w-4" /> Organization
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Select
                                                                    onValueChange={field.onChange}
                                                                    value={field.value}
                                                                    disabled={isSubmitting}
                                                                >
                                                                    <SelectTrigger className="border-gray-300 dark:border-gray-600 dark:bg-gray-800 h-11">
                                                                        <SelectValue placeholder="Select organization" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {organizations.map(org => (
                                                                            <SelectItem key={org._id} value={org._id}>
                                                                                {org.name || org.organizationName || org._id}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                {/* Event Name */}
                                                <FormField
                                                    control={form.control}
                                                    name="eventName"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">Event Name</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="Enter a catchy event name"
                                                                    className="focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600 h-11"
                                                                    disabled={isSubmitting}
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                {/* Description */}
                                                <FormField
                                                    control={form.control}
                                                    name="description"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">Short Description</FormLabel>
                                                            <FormControl>
                                                                <Textarea
                                                                    placeholder="Brief summary of your event (max 200 characters)"
                                                                    className="focus-visible:ring-2 focus-visible:ring-indigo-500 resize-none dark:bg-gray-800 dark:border-gray-600"
                                                                    rows={3}
                                                                    maxLength={200}
                                                                    disabled={isSubmitting}
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                {/* Event Date and Time */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="eventDate"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
                                                                    <Calendar className="h-4 w-4" /> Event Date
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        type="date"
                                                                        className="focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600 h-11"
                                                                        disabled={isSubmitting}
                                                                        {...field}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="time"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
                                                                    <Clock className="h-4 w-4" /> Start Time
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        type="time"
                                                                        className="focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600 h-11"
                                                                        disabled={isSubmitting}
                                                                        {...field}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>

                                                {/* Venue and Category */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="venue"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
                                                                    <MapPin className="h-4 w-4" /> Venue
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder="Location of the event"
                                                                        className="focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600 h-11"
                                                                        disabled={isSubmitting}
                                                                        {...field}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="category"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
                                                                    <Tag className="h-4 w-4" /> Category
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Select
                                                                        onValueChange={field.onChange}
                                                                        value={field.value}
                                                                        disabled={isSubmitting}
                                                                    >
                                                                        <SelectTrigger className="dark:bg-gray-800 dark:border-gray-600 h-11">
                                                                            <SelectValue placeholder="Select category" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {eventCategories.map(category => (
                                                                                <SelectItem key={category} value={category}>
                                                                                    {category}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>

                                                {/* Team Members Range */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="minTeamMembers"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">Min Team Members</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        type="number"
                                                                        min="1"
                                                                        className="focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600 h-11"
                                                                        disabled={isSubmitting}
                                                                        {...field}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="maxTeamMembers"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">Max Team Members</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        type="number"
                                                                        min="1"
                                                                        className="focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600 h-11"
                                                                        disabled={isSubmitting}
                                                                        {...field}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                            </div>

                                            
                                        </div>

                                        <CardFooter className="px-0 pt-6 pb-0 flex justify-end gap-4">
                                            <Button
                                                type="submit"
                                                className="py-6 px-8 text-lg font-semibold shadow-lg rounded-lg"
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? (
                                                    <div className="flex items-center gap-2">
                                                        <LoadingSpinner size={20} text="Updating Event..." className="text-white" />
                                                    </div>
                                                ) : (
                                                    "Update Event"
                                                )}
                                            </Button>
                                        </CardFooter>
                                    </form>
                                </Form>
                            </FormProvider>
                        )}
                    </CardContent>
                </Card>
            </div>
            <Toaster />
            <Footer />
        </>
    )
}

export default EditEventForm