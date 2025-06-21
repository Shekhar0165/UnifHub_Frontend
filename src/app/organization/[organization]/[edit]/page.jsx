'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Github, Linkedin, Twitter, Upload, MapPin, Phone, Building, GraduationCap, Mail } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from '@/app/Components/Header/Header';
import TeamManagement from '@/app/Components/Team/Team';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

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

const OrganizationProfileEditForm = () => {
    const { toast } = useToast();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("basic");
    const [organization, setOrganization] = useState({
        name: '',
        email: '',
        phone: '',
        university: '',
        location: '',
        bio: '',
        teams: [],
        socialLinks: {
            github: '',
            linkedin: '',
            twitter: ''
        }
    });

    const [profileImage, setProfileImage] = useState(null);
    const [coverImage, setCoverImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [imageUploading, setImageUploading] = useState(false);

    // Fetch organization data on component mount
    useEffect(() => {
        const fetchOrganizationData = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/org`, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true
                });

                setOrganization(response.data);
            } catch (error) {
                if (error.response?.status === 401) {
                    router.push('/');
                }
                toast({
                    title: "Error",
                    description: "Failed to load organization data. Please try again.",
                    variant: "destructive",
                });
            }
        };

        fetchOrganizationData();
    }, [toast, router]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;


        // Handle nested objects (socialLinks)
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setOrganization({
                ...organization,
                [parent]: {
                    ...organization[parent],
                    [child]: value
                }
            });
        } else {
            setOrganization({
                ...organization,
                [name]: value
            });
        }
    };

    // Handle file changes with mobile image preprocessing
    const handleFileChange = async (e) => {
      const { name, files } = e.target;
      if (!files || files.length === 0) return;
      const file = files[0];
      // Accept HEIC/HEIF and convert to JPEG
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
      if (!validTypes.includes(file.type) && !/\.(heic|heif)$/i.test(file.name)) {
        toast({
          title: "Invalid File Type",
          description: "Please select a valid image file (JPG, PNG, WebP, HEIC)",
          variant: "destructive",
        });
        return;
      }
      setImageUploading(true);
      try {
        const processedFile = await preprocessMobileImage(file);
        if (name === 'profileImage') {
          setProfileImage(processedFile);
          setOrganization(prevOrg => ({ ...prevOrg, profileImage: processedFile.name }));
        } else if (name === 'coverImage') {
          setCoverImage(processedFile);
          setOrganization(prevOrg => ({ ...prevOrg, coverImage: processedFile.name }));
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to process image. Try a different image.",
          variant: "destructive",
        });
      } finally {
        setImageUploading(false);
      }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const formData = new FormData();;
            formData.append('organizationData', JSON.stringify(organization));


            if (profileImage) {
                formData.append('profileImage', profileImage);
            }

            if (coverImage) {
                formData.append('coverImage', coverImage);
            }


            await axios.put(
                `${process.env.NEXT_PUBLIC_API}/org/${organization._id}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    withCredentials: true
                }
            );

            toast({
                title: "Success",
                description: "Organization profile updated successfully!",
            });

            setProfileImage(null);
            setCoverImage(null);
            // window.location.href = `/organization/${organization.userid}`;
        } catch (error) {
            if (error.response?.status === 401) {
                router.push('/');
            }
            toast({
                title: "Error",
                description: error.response?.data?.message || 'Failed to update profile. Please try again.',
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleTabChange = (value) => {
        setActiveTab(value);
    };

    return (
        <>
            <Header />
            <div className="container max-w-6xl mx-auto py-8 px-4">
                <Card className="border-none shadow-xl rounded-xl overflow-hidden">
                    <form onSubmit={handleSubmit}>
                        {/* Cover Image */}
                        <div className="relative h-60 bg-muted">
                            {organization?.coverImage && !coverImage && (
                                <img
                                    src={organization?.coverImage}
                                    alt="Cover"
                                    className="w-full h-full object-cover"
                                />
                            )}
                            {coverImage && (
                                <img
                                    src={URL.createObjectURL(coverImage)}
                                    alt="Cover Preview"
                                    className="w-full h-full object-cover"
                                />
                            )}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                                <Label htmlFor="coverImage" className="bg-white text-black py-2 px-4 rounded-md cursor-pointer flex items-center gap-2 hover:bg-gray-100 transition-colors">
                                    <Upload className="h-4 w-4" />
                                    Change Cover
                                    <Input
                                        id="coverImage"
                                        type="file"
                                        name="coverImage"
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                </Label>
                            </div>
                        </div>

                        {/* Profile Image */}
                        <div className="flex justify-center -mt-20 mb-4 relative z-10">
                            <div className="relative">
                                <Avatar className="h-36 w-36 border-4 border-white shadow-lg">
                                    {organization?.profileImage && !profileImage ? (
                                        <AvatarImage src={organization?.profileImage}
                                            alt={organization?.name} />
                                    ) : profileImage ? (
                                        <AvatarImage src={URL.createObjectURL(profileImage)} alt={organization?.name} />
                                    ) : (
                                        <AvatarFallback className="text-3xl font-bold">{organization?.name?.charAt(0) || "O"}</AvatarFallback>
                                    )}
                                </Avatar>
                                <Label
                                    htmlFor="profileImage"
                                    className="absolute bottom-1 right-1 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-md"
                                >
                                    <Upload className="h-4 w-4" />
                                    <Input
                                        id="profileImage"
                                        type="file"
                                        name="profileImage"
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                </Label>
                            </div>
                        </div>

                        {/* Organization Name */}
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold">{organization?.name || 'Your Organization'}</h1>
                            <p className="text-gray-500">{organization?.university || 'University'}</p>
                        </div>

                        <Tabs defaultValue="basic" className="w-full" onValueChange={handleTabChange}>
                            <div className="px-6 py-2 border-b">
                                <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 gap-2">
                                    <TabsTrigger value="basic" className="rounded-lg">Basic Info</TabsTrigger>
                                    <TabsTrigger value="social" className="rounded-lg">Social</TabsTrigger>
                                    <TabsTrigger value="teams" className="rounded-lg">Teams</TabsTrigger>
                                </TabsList>
                            </div>

                            <CardContent className="p-6">
                                <TabsContent value="basic" className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
                                                <Building className="h-4 w-4" />
                                                Organization Name
                                            </Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                value={organization?.name || ''}
                                                onChange={handleChange}
                                                required
                                                className="rounded-lg"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                                                <Mail className="h-4 w-4" />
                                                Email
                                            </Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                value={organization?.email || ''}
                                                onChange={handleChange}
                                                required
                                                className="rounded-lg"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium">
                                                <Phone className="h-4 w-4" />
                                                Phone Number
                                            </Label>
                                            <Input
                                                id="phone"
                                                name="phone"
                                                value={organization?.phone || ''}
                                                onChange={handleChange}
                                                className="rounded-lg"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="university" className="flex items-center gap-2 text-sm font-medium">
                                                <GraduationCap className="h-4 w-4" />
                                                University
                                            </Label>
                                            <Input
                                                id="university"
                                                name="university"
                                                value={organization?.university || ''}
                                                onChange={handleChange}
                                                className="rounded-lg"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="location" className="flex items-center gap-2 text-sm font-medium">
                                                <MapPin className="h-4 w-4" />
                                                Location
                                            </Label>
                                            <Input
                                                id="location"
                                                name="location"
                                                value={organization?.location || ''}
                                                onChange={handleChange}
                                                className="rounded-lg"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
                                        <Textarea
                                            id="bio"
                                            name="bio"
                                            value={organization?.bio || ''}
                                            onChange={handleChange}
                                            rows="4"
                                            placeholder="Tell us about your organization..."
                                            className="resize-none rounded-lg"
                                        />
                                    </div>
                                </TabsContent>

                                <TabsContent value="social" className="space-y-6">
                                    <div className="max-w-md mx-auto space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="github" className="flex items-center gap-2 text-sm font-medium">
                                                <Github className="h-4 w-4" />
                                                GitHub URL
                                            </Label>
                                            <Input
                                                id="github"
                                                name="socialLinks.github"
                                                value={organization?.socialLinks?.github || ''}
                                                onChange={handleChange}
                                                placeholder="https://github.com/organization"
                                                className="rounded-lg"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="linkedin" className="flex items-center gap-2 text-sm font-medium">
                                                <Linkedin className="h-4 w-4" />
                                                LinkedIn URL
                                            </Label>
                                            <Input
                                                id="linkedin"
                                                name="socialLinks.linkedin"
                                                value={organization?.socialLinks?.linkedin || ''}
                                                onChange={handleChange}
                                                placeholder="https://linkedin.com/company/organization"
                                                className="rounded-lg"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="twitter" className="flex items-center gap-2 text-sm font-medium">
                                                <Twitter className="h-4 w-4" />
                                                Twitter URL
                                            </Label>
                                            <Input
                                                id="twitter"
                                                name="socialLinks.twitter"
                                                value={organization?.socialLinks?.twitter || ''}
                                                onChange={handleChange}
                                                placeholder="https://twitter.com/organization"
                                                className="rounded-lg"
                                            />
                                        </div>
                                    </div>
                                </TabsContent>

                            </CardContent>
                                <TabsContent value="teams" className="space-y-4">
                                    <TeamManagement OrgId={organization._id} />
                                </TabsContent>

                            {activeTab !== "teams" && (
                                <CardFooter className="flex justify-end p-6 border-t bg-muted/10">
                                    <Button
                                        disabled={isLoading}
                                        className="px-8 py-2 rounded-lg shadow-md hover:shadow-lg transition-all"
                                    >
                                        {isLoading ? 'Saving...' : 'Save Profile'}
                                    </Button>
                                </CardFooter>
                            )}
                        </Tabs>
                    </form>
                    <Tabs>
                        
                    </Tabs>
                </Card>
            </div>
        </>
    );
};

export default OrganizationProfileEditForm;