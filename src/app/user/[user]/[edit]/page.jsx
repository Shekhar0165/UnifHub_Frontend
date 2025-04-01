'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Github, Linkedin, Twitter, User, GraduationCap, MapPin, Phone, Upload, X, Plus } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from '@/app/Components/Header/Header';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

const ProfileEditForm = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [user, setUser] = useState({
    name: '',
    phone: '',
    university: '',
    location: '',
    bio: '',
    skills: [],
    education: [],
    socialLinks: {
      github: '',
      linkedin: '',
      twitter: ''
    }
  });

  const [profileImage, setProfileImage] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [newSkill, setNewSkill] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // For education fields
  const [educationField, setEducationField] = useState({
    institution: '',
    degree: '',
    duration: ''
  });

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/user/one`, {
            headers: {
                'Content-Type': 'application/json',
              },
              withCredentials: true,
        });
        
        setUser(response.data);
      } catch (error) {
        if (error.response?.status === 401) {
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');
          Cookies.remove('UserType');
          Cookies.remove('UserId');
          router.push('/');
          return;
        }
        
        toast({
          title: "Error",
          description: "Failed to load user data. Please try again.",
          variant: "destructive",
        });
      }
    };
    
    fetchUserData();
  }, [toast, router]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested objects (socialLinks)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setUser({
        ...user,
        [parent]: {
          ...user[parent],
          [child]: value
        }
      });
    } else {
      setUser({
        ...user,
        [name]: value
      });
    }
  };

  // Handle file changes
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === 'profileImage') {
      setProfileImage(files[0]);
      user.profileImage = files[0].name
    } else if (name === 'coverImage') {
      setCoverImage(files[0]);
      user.coverImage = files[0].name
    }
  };

  // Handle adding a new skill
  const handleAddSkill = () => {
    if (newSkill.trim() !== '' && !user.skills.includes(newSkill.trim())) {
      setUser({
        ...user,
        skills: [...user.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  // Handle removing a skill
  const handleRemoveSkill = (skillToRemove) => {
    setUser({
      ...user,
      skills: user.skills.filter(skill => skill !== skillToRemove)
    });
  };

  // Handle adding education
  const handleAddEducation = () => {
    if (educationField.institution.trim() !== '' && 
        educationField.degree.trim() !== '') {
      setUser({
        ...user,
        education: [...user.education, { ...educationField }]
      });
      setEducationField({
        institution: '',
        degree: '',
        duration: ''
      });
    }
  };

  // Handle education field changes
  const handleEducationChange = (e) => {
    const { name, value } = e.target;
    setEducationField({
      ...educationField,
      [name]: value
    });
  };

  // Handle removing education
  const handleRemoveEducation = (index) => {
    const updatedEducation = [...user.education];
    updatedEducation.splice(index, 1);
    setUser({
      ...user,
      education: updatedEducation
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create FormData for file uploads
      const formData = new FormData();
      
      // Add all user data fields to FormData
      // Converting the object to JSON string since FormData doesn't handle nested objects well
      formData.append('userData', JSON.stringify(user));
      
      // Append files if selected
      if (profileImage) {
        formData.append('profileImage', profileImage);
      }
      
      if (coverImage) {
        formData.append('coverImage', coverImage);
      }
      
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API}/user/${user._id}`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true
        }
      );

      
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
      
      // Reset file states after successful upload
      setProfileImage(null);
      setCoverImage(null);
      
    } catch (error) {
      if (error.response?.status === 401) {
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        Cookies.remove('UserType');
        Cookies.remove('UserId');
        router.push('/');
        return;
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

  return (
    <>
    <Header/>
    <div className="container max-w-6xl mx-auto py-6">
      <Card className="border-none shadow-lg">

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <div className="px-6 pt-2">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="social">Social</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
                <TabsTrigger value="education">Education</TabsTrigger>
              </TabsList>
            </div>

            {/* Cover Image - Outside tabs as it's always visible */}
            <div className="px-6 pt-6">
              <div className="relative h-48 rounded-lg overflow-hidden bg-muted">
                {user?.coverImage && !coverImage && (
                  <img 
                    src={user?.coverImage} 
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
                  <Label htmlFor="coverImage" className="bg-background text-foreground py-2 px-4 rounded-md cursor-pointer flex items-center gap-2">
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
            </div>

            {/* Profile Image - Also outside tabs */}
            <div className="flex justify-center -mt-16 mb-4 relative z-10">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-background">
                  {user?.profileImage && !profileImage ? (
                    <AvatarImage src={user?.profileImage} 
                    alt={user?.name} />
                  ) : profileImage ? (
                    <AvatarImage src={URL.createObjectURL(profileImage)} alt={user?.name} />
                  ) : (
                    <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                  )}
                </Avatar>
                <Label 
                  htmlFor="profileImage" 
                  className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
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

            <CardContent>
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={user?.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={user.phone || ''}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="university" className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      University
                    </Label>
                    <Input
                      id="university"
                      name="university"
                      value={user.university || ''}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location
                    </Label>
                    <Input
                      id="location"
                      name="location"
                      value={user.location || ''}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={user.bio || ''}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Tell us about yourself..."
                    className="resize-none"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="social" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="github" className="flex items-center gap-2">
                    <Github className="h-4 w-4" />
                    GitHub URL
                  </Label>
                  <Input
                    id="github"
                    name="socialLinks.github"
                    value={user.socialLinks?.github || ''}
                    onChange={handleChange}
                    placeholder="https://github.com/username"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="linkedin" className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn URL
                  </Label>
                  <Input
                    id="linkedin"
                    name="socialLinks.linkedin"
                    value={user.socialLinks?.linkedin || ''}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="twitter" className="flex items-center gap-2">
                    <Twitter className="h-4 w-4" />
                    Twitter URL
                  </Label>
                  <Input
                    id="twitter"
                    name="socialLinks.twitter"
                    value={user.socialLinks?.twitter || ''}
                    onChange={handleChange}
                    placeholder="https://twitter.com/username"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="skills" className="space-y-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  {user.skills?.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1 pl-3 pr-2 py-1.5">
                      {skill}
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5 rounded-full hover:bg-destructive/20" 
                        onClick={() => handleRemoveSkill(skill)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill..."
                    className="flex-grow"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={handleAddSkill}
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="education" className="space-y-4">
                <div className="space-y-3">
                  {user.education?.map((edu, index) => (
                    <Card key={index} className="relative border border-muted">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 hover:bg-destructive/20"
                        onClick={() => handleRemoveEducation(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <CardContent className="p-4">
                        <div className="font-semibold">{edu.institution}</div>
                        <div>{edu.degree}</div>
                        {edu.duration && <div className="text-muted-foreground text-sm">{edu.duration}</div>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <Card className="border border-dashed border-muted">
                  <CardContent className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="institution">Institution</Label>
                        <Input
                          id="institution"
                          name="institution"
                          value={educationField.institution}
                          onChange={handleEducationChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="degree">Degree</Label>
                        <Input
                          id="degree"
                          name="degree"
                          value={educationField.degree}
                          onChange={handleEducationChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="duration">Duration</Label>
                        <Input
                          id="duration"
                          name="duration"
                          value={educationField.duration}
                          onChange={handleEducationChange}
                          placeholder="e.g. 2018-2022"
                        />
                      </div>
                    </div>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddEducation}
                      className="w-full flex items-center justify-center gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Add Education
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </CardContent>

            <CardFooter className="flex justify-end p-6 border-t bg-muted/20">
              <Button
                type="submit"
                disabled={isLoading}
                className="px-8"
              >
                {isLoading ? 'Saving...' : 'Save Profile'}
              </Button>
            </CardFooter>
          </Tabs>
        </form>
      </Card>
    </div>
    </>
  );
};

export default ProfileEditForm;