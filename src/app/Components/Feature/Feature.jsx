'use client'
import React, { useState } from 'react';
import { 
  GraduationCap, 
  Building2, 
  BookOpen, 
  Users, 
  BarChart3, 
  Shield, 
  Award, 
  Presentation,
  Calendar,
  FileSpreadsheet,
  UserCheck,
  Bell
} from 'lucide-react';
import { useIntersectionObserver } from '@/app/Useintersectionobserver';

const TabButton = ({ isActive, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300
      ${isActive 
        ? 'bg-blue-600 text-white shadow-lg' 
        : 'bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'}`}
  >
    {children}
  </button>
);

const FeatureCard = ({ icon: Icon, title, description, delay }) => {
  const { elementRef, isVisible } = useIntersectionObserver();
  
  return (
    <div
      ref={elementRef}
      className={`flex gap-4 p-6 rounded-xl bg-primary shadow-md hover:shadow-lg transition-all duration-500 dark:bg-gray-800
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex-shrink-0">
        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30">
          <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300">{description}</p>
      </div>
    </div>
  );
};

export default function OfferingsSection() {
  const [activeTab, setActiveTab] = useState('students');

  const studentFeatures = [
    {
      icon: BookOpen,
      title: "Learning Resources",
      description: "Access verified study materials, notes, and AI-powered study planners to excel in your academics."
    },
    {
      icon: Users,
      title: "Network Building",
      description: "Connect with peers, seniors, and alumni for guidance, mentorship, and collaboration opportunities."
    },
    {
      icon: Calendar,
      title: "Events & Activities",
      description: "Participate in college fests, hackathons, workshops, and cultural events all from one platform."
    },
    {
      icon: BarChart3,
      title: "Career Development",
      description: "Get internships, job opportunities, resume reviews, and interview preparation support."
    },
    {
      icon: Award,
      title: "Skill Enhancement",
      description: "Access courses, workshops, and certification programs to build industry-relevant skills."
    },
    {
      icon: Shield,
      title: "Verified Profile",
      description: "Build a verified academic profile that showcases your achievements and credentials."
    }
  ];

  const orgFeatures = [
    {
      icon: Presentation,
      title: "Event Management",
      description: "Organize and manage college events, track participation, and gather feedback efficiently."
    },
    {
      icon: FileSpreadsheet,
      title: "Analytics Dashboard",
      description: "Get insights into student engagement, event performance, and resource utilization."
    },
    {
      icon: UserCheck,
      title: "Student Verification",
      description: "Automated student verification system with university email integration."
    },
    {
      icon: Bell,
      title: "Announcement System",
      description: "Share important updates, notices, and announcements directly with verified students."
    },
    {
      icon: Users,
      title: "Alumni Network",
      description: "Build and maintain a strong alumni network for mentorship and recruitment."
    },
    {
      icon: Shield,
      title: "Data Security",
      description: "Enterprise-grade security for student data and communication."
    }
  ];

  return (
    <section className="py-0">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white mb-4">
            Empowering Education Ecosystem
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Tailored solutions for students and organizations
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
          <TabButton 
            isActive={activeTab === 'students'} 
            onClick={() => setActiveTab('students')}
          >
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              <span>For Students</span>
            </div>
          </TabButton>
          <TabButton 
            isActive={activeTab === 'organizations'} 
            onClick={() => setActiveTab('organizations')}
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              <span>For Organizations</span>
            </div>
          </TabButton>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(activeTab === 'students' ? studentFeatures : orgFeatures).map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index * 100}
            />
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="inline-block rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-1">
            <div className="rounded-xl bg-white px-8 py-4 dark:bg-gray-900">
              <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {activeTab === 'students' 
                  ? "Ready to Transform Your College Journey?" 
                  : "Want to Revolutionize Your Institution?"}
              </h3>
              <button className="mt-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2 text-white font-semibold hover:opacity-90 transition-opacity">
                {activeTab === 'students' ? "Join UnifHub Today" : "Schedule a Demo"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}