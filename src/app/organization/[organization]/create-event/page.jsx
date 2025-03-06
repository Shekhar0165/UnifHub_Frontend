'use client'

import React, { useState } from 'react'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import { ImagePlus, X } from 'lucide-react'
import Footer from '@/app/Components/Footer/Footer'
import Header from '@/app/Components/Header/Header'


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

  // Initialize the form with useForm
  const form = useForm({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      organization_id: '',
      eventName: '',
      description: '',
      content: '',
      image: undefined,
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
          title: 'Error',
          description: 'Invalid file type. Please upload JPEG, PNG, or GIF.',
          variant: 'destructive'
        })
        return
      }

      if (file.size > maxSize) {
        toast({
          title: 'Error',
          description: 'File is too large. Maximum size is 5MB.',
          variant: 'destructive'
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
      // Create FormData for file upload
      const token = localStorage.getItem('accessToken');
      const formData = new FormData()
      
      // Append all text fields
      Object.keys(values).forEach(key => {
        if (key !== 'image') {
          formData.append(key, values[key])
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
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        }
      )
      
      // Success toast
      toast({
        title: 'Success',
        description: 'Event created successfully',
        variant: 'default'
      })

      // Reset the form
      form.reset()
      setImagePreview(null)

    } catch (error) {
      // Error toast
      toast({
        title: 'Error',
        description: 'Failed to create event',
        variant: 'destructive'
      })
      console.error('Error creating event:', error)
    }
  }

  return (
    <>
    <Header/>
    <div className="flex justify-center items-center min-h-screen p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create New Event</CardTitle>
        </CardHeader>
        <CardContent>
          <FormProvider {...form}>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Image Upload Section */}
                <div className="flex flex-col items-center mb-4">
                  <div className="w-full max-w-md">
                    {/* Image Preview or Upload Button */}
                    {imagePreview ? (
                      <div className="relative">
                        <img 
                          src={imagePreview} 
                          alt="Event Preview" 
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
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
                          <ImagePlus className="h-10 w-10 text-gray-400 mb-2" />
                          <p className="text-gray-600">
                            Click to upload event image (Max 5MB)
                          </p>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Organization ID */}
                  <FormField
                    control={form.control}
                    name="organization_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter Organization ID" {...field} />
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
                        <FormLabel>Event Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter Event Name" {...field} />
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
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Event Description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Content */}
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Event Content" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Image Path */}
                  <FormField
                    control={form.control}
                    name="image_path"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image Path</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter Image Path" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Event Date */}
                  <FormField
                    control={form.control}
                    name="eventDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Time */}
                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Venue */}
                  <FormField
                    control={form.control}
                    name="venue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Venue</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter Venue" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Category */}
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter Category" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Max Team Members */}
                  <FormField
                    control={form.control}
                    name="maxTeamMembers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Team Members</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Min Team Members */}
                  <FormField
                    control={form.control}
                    name="minTeamMembers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Min Team Members</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full">
                  Add Event
                </Button>
              </form>
            </Form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
    <Footer/>
    </>
  )
}

export default AddEventForm