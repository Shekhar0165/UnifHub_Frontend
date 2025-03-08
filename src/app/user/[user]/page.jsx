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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-6">
          {/* Profile Picture and Basic Info */}
          <div className="p-6">
            <div className="flex flex-col items-center">
              <img
                src={`${process.env.NEXT_PUBLIC_API}${user?.profileImage}`}
                alt={user?.name}
                className="h-32 w-32 rounded-full border-4 border-white dark:border-gray-800 shadow-xl mb-4"
              />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.name}</h1>
              <p className="text-blue-600 dark:text-blue-400">{user?.university}</p>
              <div className="flex items-center mt-2 text-gray-600 dark:text-gray-400">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="text-sm">{user?.location}</span>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <p className="text-gray-700 dark:text-gray-300 text-sm">{user?.bio}</p>

              <div className="flex justify-center space-x-4 pt-4">
                <a
                  href={user?.socialLinks?.github}
                  className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors"
                >
                  <Github className="h-5 w-5" />
                </a>
                <a
                  href={user?.socialLinks?.linkedin}
                  className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a
                  href={user?.socialLinks?.twitter}
                  className="text-gray-500 hover:text-blue-400 dark:text-gray-400 dark:hover:text-blue-300 transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 divide-y divide-gray-200 dark:divide-gray-700">
              <div className="flex items-center p-4">
                <Mail className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                <span className="text-sm text-gray-600 dark:text-gray-300">{user?.email}</span>
              </div>

            </div>
          </div>

          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {user?.skills?.map((skill, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button className="w-full flex justify-center items-center py-2 px-4 border border-blue-600 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 dark:bg-transparent dark:text-blue-400 dark:hover:bg-blue-900/20 transition-colors">
              <Share2 className="h-4 w-4 mr-2" />
              Share Profile
            </button>
          </div>
        </div>

        {/* Upcoming Events Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="p-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
              Upcoming Events
            </h3>

            {user?.upcomingEvents?.length > 0 ? (
              <div className="space-y-4">
                {user?.upcomingEvents?.map((event, index) => (
                  <div key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">{event.title}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${event.status === 'Registered'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                        }`}>
                        {event.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      {event.date}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <MapPin className="h-3 w-3 inline mr-1" />
                      {event.location}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-2">
                      Organized by {event.organizer}
                    </p>
                    <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                      View details <ChevronRight className="h-3 w-3 ml-1" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No upcoming events.</p>
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


  const EventsList = () => {
    const [visibleEvents, setVisibleEvents] = useState(3);
    const [isLoading, setIsLoading] = useState(false);

    // Function to handle showing more events
    const handleShowMore = () => {
      setIsLoading(true);

      // Simulate loading with a slight delay for better UX
      setTimeout(() => {
        setVisibleEvents(prev => Math.min(prev + 3, user?.events?.length));
        setIsLoading(false);
      }, 300);
    };

    // Get medal icon and color based on position
    const getMedalInfo = (position) => {
      if (position === 0) return { icon: <Award className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />, bg: "bg-yellow-100 dark:bg-yellow-900/30" };
      if (position === 1) return { icon: <Award className="h-6 w-6 text-gray-600 dark:text-gray-400" />, bg: "bg-gray-100 dark:bg-gray-700/50" };
      if (position === 2) return { icon: <Award className="h-6 w-6 text-amber-600 dark:text-amber-400" />, bg: "bg-amber-100 dark:bg-amber-900/30" };
      return { icon: <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />, bg: "bg-blue-100 dark:bg-blue-900/30" };
    };

    return (
      <div className="space-y-2">
        <div className="space-y-3">
          {user?.events?.slice(0, visibleEvents).map((event, index) => {
            const { icon, bg } = getMedalInfo(index);

            return (
              <div
                onClick={() => handleEventClick(event)}
                key={index}
                className="cursor-pointer flex items-start space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/10 group transform transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:shadow-md"
                style={{
                  animation: `fadeSlideIn 0.5s ease-out ${index * 0.1}s both`
                }}
              >
                <div className={`flex-shrink-0 p-3 ${bg} rounded-full group-hover:scale-110 transition-transform`}>
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {event.title}
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    Position:{event.position}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {event.date}
                  </p>
                </div>
                <div className="flex-shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <a
                    href={event.certificate}
                    className="inline-flex items-center px-3 py-1.5 border border-blue-600 text-xs font-medium rounded-lg text-blue-600 bg-white hover:bg-blue-50 dark:bg-transparent dark:text-blue-400 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Certificate
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {visibleEvents < user?.events?.length && (
          <div className="py-4 flex justify-center">
            <button
              onClick={handleShowMore}
              disabled={isLoading}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium rounded-lg transition-colors group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              {isLoading ? (
                <span className="animate-spin h-5 w-5 border-2 border-blue-600 dark:border-blue-400 border-t-transparent dark:border-t-transparent rounded-full"></span>
              ) : (
                <>
                  <span>Show More</span>
                  <ChevronDown className="h-5 w-5 group-hover:translate-y-1 transition-transform duration-300" />
                </>
              )}
            </button>
          </div>
        )}

        {visibleEvents >= user?.events?.length && user?.events?.length > 3 && (
          <div className="py-3 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No more events to show
            </p>
          </div>
        )}

        <style jsx>{`
                @keyframes fadeSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
      </div>
    );
  };


  return (
    <>
      <div className="w-full lg:w-2/3">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-6">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('achievements')}
              className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'achievements'
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
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
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
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
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
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
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Latest Achievements</h2>
                <div className="space-y-6">
                  {/* {user.events.map((event, index) => (
                        <div key={index} className="flex items-start space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                          <div className="flex-shrink-0 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                            <Award className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-lg font-medium text-gray-900 dark:text-white">
                              {event.title}
                            </p>
                            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                              {event.position}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {event.date}
                            </p>
                          </div>
                          <a
                            href={event.certificate}
                            className="inline-flex items-center px-3 py-1.5 border border-blue-600 text-xs font-medium rounded-lg text-blue-600 bg-white hover:bg-blue-50 dark:bg-transparent dark:text-blue-400 dark:hover:bg-blue-900/20 transition-colors"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Certificate
                          </a>
                        </div>
                      ))} */}
                  <EventsList />
                </div>
              </div>
            )}

            {activeTab === 'resume' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Resume</h2>
                  <button className="inline-flex items-center px-4 py-2 border border-blue-600 text-sm font-medium rounded-lg text-blue-600 bg-white hover:bg-blue-50 dark:bg-transparent dark:text-blue-400 dark:hover:bg-blue-900/20 transition-colors">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </button>
                </div>

                {/* Education Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                    Education
                  </h3>

                  {user?.education?.map((edu, index) => (
                    <div key={index} className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <h4 className="text-md font-medium text-gray-900 dark:text-white">{edu.degree}</h4>
                      <p className="text-blue-600 dark:text-blue-400">{edu.institution}</p>
                      <div className="flex justify-between mt-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">{edu.duration}</span>

                      </div>
                    </div>
                  ))}
                </div>

                {/* Experience Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                    <Briefcase className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                    Work Experience
                  </h3>

                  {user?.experience?.map((exp, index) => (
                    <div key={index} className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <h4 className="text-md font-medium text-gray-900 dark:text-white">{exp.role}</h4>
                      <p className="text-blue-600 dark:text-blue-400">{exp.company}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{exp.duration}</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'certificates' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Certificates</h2>
                  <button className="inline-flex items-center px-4 py-2 border border-blue-600 text-sm font-medium rounded-lg text-blue-600 bg-white hover:bg-blue-50 dark:bg-transparent dark:text-blue-400 dark:hover:bg-blue-900/20 transition-colors">
                    <Download className="h-4 w-4 mr-2" />
                    Download All
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {user?.events?.map((event, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">{event.title}</h3>
                      </div>

                      <div className="p-4">
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                          <span className="font-medium">Position:</span> {event.position}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                          <span className="font-medium">Date:</span> {event.date}
                        </p>

                        <div className="flex items-center justify-between mt-4">
                          <span className="text-xs text-gray-500 dark:text-gray-400">Certificate ID: #{index + 1001}</span>
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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="p-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
              Activity Overview
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">This Month</p>
                <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">{user?.activities?.thisMonth}</p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">Last Month</p>
                <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">{user?.activities?.lastMonth}</p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">Current Streak</p>
                <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                  {user?.activities?.streakDays} days
                </p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">Longest Streak</p>
                <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                  {user?.activities?.longestStreak} days
                </p>
              </div>
            </div>
            {/* Monthly Activity Graph */}
            <div className="mt-8">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Monthly Activity</h4>
              <div className="flex items-end h-32 gap-1 relative">
                {user?.activities?.contributions?.map((count, index) => (
                  <div key={index} className="relative group flex-1">
                    <div
                      style={{ height: `${(count / Math.max(...user.activities.contributions)) * 100}%` }}
                      className="w-full bg-blue-600 dark:bg-blue-500 rounded-t opacity-80 hover:opacity-100 transition-opacity"
                    ></div>
                    <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-0.5 px-1.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {count} activities
                    </div>
                  </div>
                ))}
                {/* Grid lines for readability */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  <div className="border-t border-gray-200 dark:border-gray-700 w-full h-0"></div>
                  <div className="border-t border-gray-200 dark:border-gray-700 w-full h-0"></div>
                  <div className="border-t border-gray-200 dark:border-gray-700 w-full h-0"></div>
                </div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                <span>Jan</span>
                <span>Mar</span>
                <span>May</span>
                <span>Jul</span>
                <span>Sep</span>
                <span>Nov</span>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <a href={user?.socialLinks?.github} className="text-blue-600 dark:text-blue-400 text-sm hover:underline flex items-center">
                View full activity on GitHub
                <ChevronRight className="h-4 w-4 ml-1" />
              </a>
            </div>
          </div>
        </div>
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