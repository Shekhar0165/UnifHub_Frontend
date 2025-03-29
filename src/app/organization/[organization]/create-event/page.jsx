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
import { ImagePlus, X, Calendar, Clock, Users, MapPin, Tag, AlertCircle,Share2, BookmarkPlus } from 'lucide-react'
import Footer from '@/app/Components/Footer/Footer'
import Header from '@/app/Components/Header/Header'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import dynamic from 'next/dynamic'
import { useTheme } from 'next-themes'
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
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

// Import rich text editor with dynamic import (no SSR)
const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  ssr: false
})

// Preview component to display event details
const Preview = ({ preview, open, onOpenChange }) => {
  const [orgName, setOrgName] = useState('');
  
  useEffect(() => {
    // Try to find organization name if organizations are available
    if (preview.organizations && preview.organizations.length > 0) {
      const org = preview.organizations.find(org => org._id === preview.organization_id);
      if (org) {
        setOrgName(org.name || org.organizationName || 'Organization');
      }
    }
  }, [preview.organization_id, preview.organizations]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'bg-green-600'
      case 'ongoing': return 'bg-blue-600'
      case 'completed': return 'bg-gray-600'
      case 'cancelled': return 'bg-red-600'
      default: return 'bg-gray-600'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Event Preview</DialogTitle>
          <DialogDescription>
            This is how your event will appear to users
          </DialogDescription>
        </DialogHeader>
        
        <div className="min-h-screen bg-background">
        {/* Header Section */}
        <div className="border-b bg-background">
          <div className="container max-w-7xl mx-auto py-8 px-6 lg:px-8">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary">{preview?.category}</Badge>
              <Badge variant="default" className={getStatusColor(preview?.status)}>
                {preview?.status}
              </Badge>
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-4">{preview?.eventName}</h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              {preview?.description}
            </p>
          </div>
        </div>

        {/* Main content container with 70-30 split */}
        <div className="container max-w-7xl mx-auto py-8">
          <div className="flex flex-col lg:flex-row gap-8 px-6 lg:px-8">
            {/* Left content area (70%) */}
            <div className="w-full lg:w-[70%]">
              <div className="rounded-lg p-2 border-1 border-primary">
                <img className='rounded-lg shadow-lg h-96 w-[100%]'
                  src={preview.image}
                  alt={preview?.eventName || 'Event image'} />
              </div>
              <Card className="p-6 lg:p-8 shadow-lg">
                {/* Action buttons */}
                <div className="flex gap-4 mb-6">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <BookmarkPlus className="h-4 w-4" />
                    Save
                  </Button>
                </div>

                {/* Event overview section */}
                <div className="space-y-6">
                  <div
                    className="prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: typeof preview?.content === 'string' ? preview.content : JSON.stringify(preview?.content) }}
                  />
                </div>
              </Card>
            </div>

            {/* Right sidebar (30%) */}
            <div className="w-full lg:w-[30%]">
              <div className="lg:sticky lg:top-8">
                <Card className="p-6 shadow-lg border-t-4 border-primary">
                  <div className="space-y-6">
                    {/* Date and Time */}
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 mt-1 text-primary" />
                      <div>
                        <h3 className="font-semibold">Date</h3>
                        <p className="text-muted-foreground">
                          {preview?.eventDate ? new Date(preview.eventDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 'Date not available'}
                        </p>
                        <p className="text-muted-foreground mt-1">{preview?.time}</p>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 mt-1 text-primary" />
                      <div>
                        <h3 className="font-semibold">Location</h3>
                        <p className="text-muted-foreground">{preview?.venue}</p>
                      </div>
                    </div>

                    {/* Participants */}
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 mt-1 text-primary" />
                      <div>
                        <h3 className="font-semibold">Participants</h3>
                        {/* <p className="text-muted-foreground">
                        {preview?.participants?.length || 0} registered
                      </p> */}
                        <p className="text-sm mt-1">Team size: {preview?.minTeamMembers || 1} - {preview?.maxTeamMembers || 1} members</p>
                      </div>
                    </div>

                    {/* Prizes Section */}
                    {(preview?.firstPrize || preview?.secondPrize || preview?.thirdPrize) && (
                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 mt-1 text-primary" />
                        <div>
                          <h3 className="font-semibold">Prizes</h3>
                          {preview?.firstPrize && <p className="text-muted-foreground">🥇 {preview.firstPrize}</p>}
                          {preview?.secondPrize && <p className="text-muted-foreground">🥈 {preview.secondPrize}</p>}
                          {preview?.thirdPrize && <p className="text-muted-foreground">🥉 {preview.thirdPrize}</p>}
                        </div>
                      </div>
                    )}

                    <div className="space-y-3 pt-2">
                      <Button
                        className="w-full"
                        size="lg"
                        disabled={preview?.status === "completed" || preview?.status === "cancelled"}
                      >
                        {preview?.status === "upcoming"
                          ? "Apply Now"
                          : preview?.status === "ongoing"
                            ? "Event In Progress"
                            : preview?.status === "completed"
                              ? "Event Completed"
                              : "Event Cancelled"}
                      </Button>
                      <p className="text-sm text-center text-muted-foreground">
                        {preview?.status === "upcoming" ? "Registration is open" :
                          preview?.status === "ongoing" ? "Registration closed" :
                            preview?.status === "completed" ? "Event has ended" :
                              "Event was cancelled"}
                      </p>
                    </div>
                  </div>
                </Card>

              </div>
            </div>
          </div>
        </div>
      </div>
        
        <div className="flex justify-end">
          <DialogClose asChild>
            <Button variant="outline">Close Preview</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Zod validation schema
const eventFormSchema = z.object({
  organization_id: z.string().min(1, 'Organization ID is required'),
  eventName: z.string().min(1, 'Event Name is required'),
  description: z.string().optional(),
  content: z.string().optional(),
  image: z.instanceof(File).optional(),
  eventDate: z.string().min(1, 'Event Date is required'),
  time: z.string().optional(),
  venue: z.string().min(1, 'Venue is required'),
  category: z.string().min(1, 'Category is required'),
  maxTeamMembers: z.coerce.number().min(1, 'Max Team Members is required'),
  minTeamMembers: z.coerce.number().min(1, 'Min Team Members is required')
})

const AddEventForm = () => {
  // State for image preview
  const [imagePreview, setImagePreview] = useState(null)
  const [organizations, setOrganizations] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [contentHtml, setContentHtml] = useState('')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewData, setPreviewData] = useState({})
  const { toast } = useToast()
  const { theme } = useTheme()
  const router = useRouter()

  // Event categories
  const eventCategories = [
    'Conference', 'Workshop', 'Seminar', 'Hackathon',
    'Networking', 'Competition', 'Cultural', 'Sports', 'Other'
  ]

  // Initialize the form with useForm
  const form = useForm({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      organization_id:'',
      eventName: '',
      description: '',
      content: '',
      eventDate: '',
      time: '',
      venue: '',
      category: '',
      maxTeamMembers: 1,
      minTeamMembers: 1
    }
  })

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type and size
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
      const maxSize = 5 * 1024 * 1024 // 5MB

      if (!allowedTypes.includes(file.type)) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload JPEG, PNG, or GIF file formats only.",
        })
        return
      }

      if (file.size > maxSize) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Maximum file size is 5MB. Please upload a smaller image.",
        })
        return
      }

      // Create image preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)

      // Set image in form
      form.setValue('image', file)
    }
  }

  // Handle rich text editor content change
  const handleContentChange = (html) => {
    setContentHtml(html)
    form.setValue('content', html) // Store HTML content in form
  }

  useEffect(() => {
    const fetchOrganizationData = async () => {
      setIsLoading(true)
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/org`, {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true
        });

        setOrganizations(Array.isArray(response.data) ? response.data : [response.data])

        // Auto-select organization if only one exists
        if (Array.isArray(response.data) && response.data.length === 1) {
          form.setValue('organization_id', response.data[0]._id)
        }
      } catch (error) {
        if (error.response?.status === 401) {
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');
          Cookies.remove('UserType');
          Cookies.remove('UserId');
          router.push('/');
        }
        toast({
          variant: "destructive",
          title: "Failed to load organizations",
          description: "There was a problem loading your organization data. Please try again.",
        });
      } finally {
        setIsLoading(false)
      }
    };

    fetchOrganizationData();
  }, [form, toast, router]);

  // Remove image
  const handleRemoveImage = () => {
    setImagePreview(null)
    form.setValue('image', undefined)
    // Reset file input
    const fileInput = document.getElementById('image-upload')
    if (fileInput) fileInput.value = ''
  }

  // Form submission handler
  const onSubmit = async (values) => {
    try {
      setIsSubmitting(true)
      // Create FormData for file upload
      const formData = new FormData()

      // Append all text fields
      Object.keys(values).forEach(key => {
        if (key !== 'image') {
          // Make sure content is in HTML format
          if (key === 'content') {
            formData.append(key, contentHtml || values[key])
          } else {
            formData.append(key, values[key])
          }
        }
      })

      // Append image if exists
      if (values.image) {
        formData.append('image', values.image)
      }

      // Send to backend
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/events/add`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true
        }
      )

      // Success toast
      toast({
        title: "Event created successfully",
        description: "Your new event has been added to the system.",
      })

      // Reset the form
      form.reset()
      setImagePreview(null)
      setContentHtml('')
      console.log(response.data)
      router.push(`/events/${values.eventName}`)

    } catch (error) {
      if (error.response?.status === 401) {
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        Cookies.remove('UserType');
        Cookies.remove('UserId');
        router.push('/');
      }
      // Error toast
      toast({
        variant: "destructive",
        title: "Failed to create event",
        description: error.response?.data?.message || "An unexpected error occurred. Please try again.",
      })
      console.error('Error creating event:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePreview = () => {
    const values = form.getValues();
    const formattedDate = values.eventDate ? new Date(values.eventDate).toLocaleDateString() : '';
    
    // Create preview data object
    const preview = {
      eventName: values.eventName,
      description: values.description,
      content: contentHtml,
      eventDate: formattedDate,
      time: values.time,
      venue: values.venue,
      category: values.category,
      maxTeamMembers: values.maxTeamMembers,
      minTeamMembers: values.minTeamMembers,
      image: imagePreview,
      organizations: organizations // Pass organizations for name lookup
    };
    
    // Set preview data and open preview modal
    setPreviewData(preview);
    setPreviewOpen(true);
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
                <CardTitle className="text-3xl font-bold tracking-tight">Create New Event</CardTitle>
                <CardDescription className="mt-2 text-lg">Share your next amazing event with the community</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 md:p-8">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <LoadingSpinner size={32} text="Loading organization data..." />
              </div>
            ) : organizations.length === 0 ? (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No organizations found</AlertTitle>
                <AlertDescription>
                  You need to create an organization before you can add events.
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
                        <div>
                          <div className="flex items-center mb-4">
                            <div className="w-1 h-6 bg-foreground rounded mr-3"></div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Event Image</h3>
                          </div>
                          <div className="flex flex-col items-center mb-6">
                            <div className="w-full">
                              {/* Image Preview or Upload Button */}
                              {imagePreview ? (
                                <div className="relative rounded-lg overflow-hidden border-2 border-indigo-200 dark:border-indigo-800 shadow-md">
                                  <img
                                    src={imagePreview}
                                    alt="Event Preview"
                                    className="w-full h-60 object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="absolute top-2 right-2 bg-foreground text-background rounded-full p-1.5 hover:bg-background hover:text-foreground transition-colors shadow-lg"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              ) : (
                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center hover:border-foreground dark:hover:border-foreground transition-colors">
                                  <input
                                    type="file"
                                    id="image-upload"
                                    accept="image/jpeg,image/png,image/gif"
                                    onChange={handleImageChange}
                                    className="hidden"
                                  />
                                  <label
                                    htmlFor="image-upload"
                                    className="cursor-pointer flex flex-col items-center"
                                  >
                                    <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-full p-4 mb-4">
                                      <ImagePlus className="h-8 w-8 text-indigo-500 dark:text-indigo-400" />
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300 font-medium">
                                      Click to upload event image
                                    </p>
                                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                                      JPEG, PNG or GIF (Max 5MB)
                                    </p>
                                  </label>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <Separator className="my-6" />

                        {/* Rest of the form elements remain the same */}
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
                                    defaultValue={field.value}
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
                                      min={today}
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
                                      defaultValue={field.value}
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
                        type="button"
                        variant="secondary"
                        className="py-6 px-8 text-lg font-semibold shadow-lg rounded-lg"
                        onClick={handlePreview}
                        disabled={isSubmitting}
                      >
                        Preview
                      </Button>
                      <Button
                        type="submit"
                        className="py-6 px-8 text-lg font-semibold shadow-lg rounded-lg"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <LoadingSpinner size={20} text="Creating Event..." className="text-white" />
                          </div>
                        ) : (
                          "Create Event"
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
      
      {/* Preview Dialog Component */}
      <Preview 
        preview={previewData} 
        open={previewOpen} 
        onOpenChange={setPreviewOpen} 
      />
      
      <Toaster />
      <Footer />
    </>
  )
}

export default AddEventForm