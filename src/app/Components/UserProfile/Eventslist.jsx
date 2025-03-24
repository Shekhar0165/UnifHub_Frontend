'use client'

import axios from "axios";
import { Award, Calendar, Download, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";

const EventsList = ({ user }) => {
  const [visibleEvents, setVisibleEvents] = useState(3);
  const [isLoading, setIsLoading] = useState(false);
  const [eventsList, setEventsList] = useState([]);
  const [downloadingId, setDownloadingId] = useState(null);

  // Function to handle showing more events
  const handleShowMore = () => {
    setIsLoading(true);

    // Simulate loading with a slight delay for better UX
    setTimeout(() => {
      setVisibleEvents(prev => Math.min(prev + 3, eventsList.length));
      setIsLoading(false);
    }, 300);
  };

  // Fetch user events on component mount
  useEffect(() => {
    const fetchEventsList = async () => {
      if (!user?._id) return;
      
      setIsLoading(true);
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/userevent/${user._id}`);
        setEventsList(response.data);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEventsList();
  }, [user?._id]);

  // Handle click on event card
  const handleEventClick = (event) => {
    console.log("Event clicked:", event);
  };

  // Handle certificate download
  const handleDownloadCertificate = async (event, e) => {
    e.stopPropagation(); // Prevent triggering the card click
    
    try {
      setDownloadingId(event._id);
      
      // For image certificates (like JPG)
      const imageUrl = event.certificate_path;
      
      // Fetch the image as a blob
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // Create a blob URL
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element
      const link = document.createElement('a');
      link.href = blobUrl;
      
      // Extract filename from URL or use default
      const filename = imageUrl.split('/').pop() || `${event.title}_certificate.jpg`;
      link.setAttribute('download', filename);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      
    } catch (error) {
      console.error("Error downloading certificate:", error);
    } finally {
      setDownloadingId(null);
    }
  };

  // Get medal icon and color based on position
  const getMedalInfo = (position) => {
    if (position === 1) return { icon: <Award className="h-6 w-6 text-yellow-500" />, bg: "bg-yellow-100 dark:bg-yellow-900/30" };
    if (position === 2) return { icon: <Award className="h-6 w-6 text-gray-400" />, bg: "bg-gray-100 dark:bg-gray-800/70" };
    if (position === 3) return { icon: <Award className="h-6 w-6 text-amber-600" />, bg: "bg-amber-100 dark:bg-amber-900/30" };
    return { icon: <Calendar className="h-6 w-6 text-blue-500" />, bg: "bg-blue-50 dark:bg-blue-900/20" };
  };

  // Format date for better display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="space-y-4">
      {isLoading && eventsList.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-3 border-blue-600 dark:border-blue-400 border-t-transparent dark:border-t-transparent rounded-full"></div>
        </div>
      ) : eventsList.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No events found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {eventsList.slice(0, visibleEvents).map((event, index) => {
            const { icon, bg } = getMedalInfo(event.position);

            return (
              <div
                onClick={() => handleEventClick(event)}
                key={event._id || index}
                className="cursor-pointer flex items-start space-x-4 p-5 rounded-lg bg-white dark:bg-gray-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/10 group transform transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg border border-gray-200 dark:border-gray-700"
                style={{
                  animation: `fadeSlideIn 0.5s ease-out ${index * 0.1}s both`
                }}
              >
                <div className={`flex-shrink-0 p-3 ${bg} rounded-full group-hover:scale-110 transition-transform duration-300`}>
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {event.title}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {event.position && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                        Position: {event.position}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {formatDate(event.event_date)}
                  </p>
                </div>
                <div className="flex-shrink-0 self-center transition-all group-hover:translate-x-0 translate-x-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={(e) => handleDownloadCertificate(event, e)}
                    disabled={downloadingId === event._id}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg text-blue-600 bg-white hover:bg-blue-50 dark:bg-gray-800 dark:text-blue-400 dark:hover:bg-blue-900/20 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900"
                  >
                    {downloadingId === event._id ? (
                      <span className="animate-spin h-4 w-4 border-2 border-blue-600 dark:border-blue-400 border-t-transparent dark:border-t-transparent rounded-full mr-2"></span>
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Certificate
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {eventsList.length > 0 && visibleEvents < eventsList.length && (
        <div className="py-4 flex justify-center">
          <button
            onClick={handleShowMore}
            disabled={isLoading}
            className="flex items-center justify-center space-x-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-70"
          >
            {isLoading ? (
              <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
            ) : (
              <>
                <span>Show More</span>
                <ChevronDown className="h-5 w-5 group-hover:translate-y-1 transition-transform duration-300" />
              </>
            )}
          </button>
        </div>
      )}

      {visibleEvents >= eventsList.length && eventsList.length > 3 && (
        <div className="py-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You've reached the end of your achievements list
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

export default EventsList;