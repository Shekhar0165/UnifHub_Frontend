'use client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  User, Award, FileText, Calendar, Download, Share2, MapPin,
  Briefcase, GraduationCap, Mail, Phone, Star, Activity,
  BarChart2, Github, Linkedin, Twitter, Clock, ChevronRight, ChevronDown, Pencil
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Header from '@/app/Components/Header/Header'
import EventsList from '@/app/Components/UserProfile/Eventslist'
import Resume from '@/app/Components/UserProfile/Resume'
import UserActivityOverview from '@/app/Components/UserProfile/UserActivityOverview'

// Helper function to get activity level color
const getActivityColor = (count) => {
  if (count === 0) return 'bg-gray-100 dark:bg-gray-700';
  if (count < 3) return 'bg-blue-200 dark:bg-blue-900/30';
  if (count < 5) return 'bg-blue-400 dark:bg-blue-800';
  return 'bg-blue-600 dark:bg-blue-600';
};


const LeftComponent = ({ user }) => {
  // const user = sampleUser;
  return (
    <>
      <div className="w-full lg:w-1/3">
        <div className="bg-background rounded-xl shadow-lg overflow-hidden mb-6 border border-border/40">
          {/* Profile Picture and Basic Info */}
          <div className="p-6">
            <div className="flex flex-col items-center">
              <img
                src={`${process.env.NEXT_PUBLIC_API}${user?.profileImage}`}
                alt={user?.name}
                className="h-32 w-32 rounded-full border-4 border-background dark:border-gray-700 shadow-xl mb-4"
              />
              <h1 className="text-2xl font-bold text-foreground">{user?.name}</h1>
              <p className="text-blue-600 dark:text-blue-400">{user?.university}</p>
              <div className="flex items-center mt-2 text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="text-sm">{user?.location}</span>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <p className="text-foreground text-sm">{user?.bio}</p>

              <div className="flex justify-center space-x-4 pt-4">
                <a
                  href={user?.socialLinks?.github}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Github className="h-5 w-5" />
                </a>
                <a
                  href={user?.socialLinks?.linkedin}
                  className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a
                  href={user?.socialLinks?.twitter}
                  className="text-muted-foreground hover:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-border">
            <div className="grid grid-cols-1 divide-y divide-border">
              <div className="flex items-center p-4">
                <Mail className="h-5 w-5 text-muted-foreground mr-3" />
                <span className="text-sm text-foreground">{user?.email}</span>
              </div>

            </div>
          </div>

          <div className="p-6 border-t border-border">
            <h3 className="font-medium text-foreground mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {user?.skills?.map((skill, index) => (
                <span
                  key={index}
                  className="bg-secondary text-secondary-foreground text-xs font-medium px-2.5 py-0.5 rounded"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-border">
            <button className="w-full flex justify-center items-center py-2 px-4 border border-blue-600 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-background hover:bg-secondary transition-colors">
              <Share2 className="h-4 w-4 mr-2" />
              Share Profile
            </button>
          </div>
        </div>

        {/* Upcoming Events Section */}
        <div className="bg-background rounded-xl shadow-lg overflow-hidden mb-6 border border-border/40">
          <div className="p-6">
            <h3 className="font-medium text-foreground mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
              Upcoming Events
            </h3>

            {user?.upcomingEvents?.length > 0 ? (
              <div className="space-y-4">
                {user?.upcomingEvents?.map((event, index) => (
                  <div key={index} className="p-3 border border-border rounded-lg hover:bg-secondary/20 transition-colors">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-medium text-foreground">{event.title}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${event.status === 'Registered'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                        }`}>
                        {event.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      {event.date}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3 inline mr-1" />
                      {event.location}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 mb-2">
                      Organized by {event.organizer}
                    </p>
                    <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                      View details <ChevronRight className="h-3 w-3 ml-1" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming events.</p>
            )}
          </div>
        </div>


      </div>
    </>
  )
}



const RightComponent = ({ user }) => {
  // const user = sampleUser;
  const [activeTab, setActiveTab] = useState('achievements');



  return (
    <>
      <div className="w-full lg:w-2/3">
        <div className="bg-background rounded-xl shadow-lg overflow-hidden mb-6 border border-border/40">
          {/* Tab Navigation */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab('achievements')}
              className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'achievements'
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
            >
              <div className="flex items-center justify-center">
                <Award className="h-5 w-5 mr-2" />
                Achievements
              </div>
            </button>
            <button
              onClick={() => setActiveTab('resume')}
              className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'resume'
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
            >
              <div className="flex items-center justify-center">
                <FileText className="h-5 w-5 mr-2" />
                Resume
              </div>
            </button>
            <button
              onClick={() => setActiveTab('certificates')}
              className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'certificates'
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
            >
              <div className="flex items-center justify-center">
                <Star className="h-5 w-5 mr-2" />
                Certificates
              </div>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'achievements' && (
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-6">Latest Achievements</h2>
                <div className="space-y-6">
                  <EventsList user={user} />
                </div>
              </div>
            )}

            {activeTab === 'resume' && (
              <Resume User={user} />
            )}

            {activeTab === 'certificates' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-foreground">Certificates</h2>
                  <button className="inline-flex items-center px-4 py-2 border border-blue-600 text-sm font-medium rounded-lg text-blue-600 bg-background hover:bg-secondary transition-colors">
                    <Download className="h-4 w-4 mr-2" />
                    Download All
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {user?.events?.map((event, index) => (
                    <div key={index} className="bg-background border border-border rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                      <div className="p-4 border-b border-border bg-blue-50/50 dark:bg-blue-900/20">
                        <h3 className="font-medium text-foreground truncate">{event.title}</h3>
                      </div>

                      <div className="p-4">
                        <p className="text-sm text-muted-foreground mb-1">
                          <span className="font-medium">Position:</span> {event.position}
                        </p>
                        <p className="text-sm text-muted-foreground mb-3">
                          <span className="font-medium">Date:</span> {event.date}
                        </p>

                        <div className="flex items-center justify-between mt-4">
                          <span className="text-xs text-muted-foreground">Certificate ID: #{index + 1001}</span>
                          <a
                            href={event.certificate}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Activity Section */}
        <UserActivityOverview user={user} />
      </div>
    </>
  )
}

export default function ProfilePage() {
  const userId = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  console.log(userId.user)


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Check if user is authenticated (has token)
        const accessToken = localStorage.getItem('accessToken');

        if (!accessToken) {
          setLoading(false);
          return; // User is not authenticated
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API}/user/profile/${userId.user}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          console.error('Failed to fetch user data');
          // Handle authentication error (e.g., token expired)
          if (response.status === 401) {
            // Clear tokens and redirect to login
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            router.push('/');
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);


  return (
    <>
    <Header/>
    <div className="min-h-screen bg-background">
      {/* Header with Cover Image */}
      <div className="relative h-60 w-full overflow-hidden">
        <img
          src={`${process.env.NEXT_PUBLIC_API}${user?.coverImage}`}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      </div>


      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-14 flex flex-col lg:flex-row gap-8">
          {/* Left Column - Profile Info */}
          <LeftComponent user={user} />

          {/* Right Column - Content Area */}
          <RightComponent user={user} />
        </div>
      </div>
    </div>
    </>
  )
}