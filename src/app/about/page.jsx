'use client'
import { useIntersectionObserver } from '@/app/Useintersectionobserver';
import { Users, Target, Award, BookOpen, Rocket, Heart } from 'lucide-react';
import Navbar from '../Components/Navbar/Navbar';
import Footer from '../Components/Footer/Footer';

export default function AboutPage() {
    const { elementRef, isVisible } = useIntersectionObserver();

    return (
        <>        
        <Navbar/>
        <div ref={elementRef} className="relative overflow-hidden pb-24">
            {/* Background Gradients */}
            <div className="absolute left-0 top-1/3 h-96 w-96 -translate-y-1/2 transform rounded-full bg-gradient-to-br from-blue-100 via-purple-100 to-blue-200 opacity-20 blur-3xl dark:from-blue-900 dark:via-purple-900 dark:to-blue-800" />
            <div className="absolute right-0 top-2/3 h-96 w-96 -translate-y-1/2 transform rounded-full bg-gradient-to-br from-purple-200 via-blue-200 to-purple-300 opacity-20 blur-3xl dark:from-purple-800 dark:via-blue-800 dark:to-purple-700" />

            <div className="container mx-auto px-4 py-16 md:px-6">
                {/* Header Section */}
                <div className={`text-center mb-16 transition-all duration-1000 ease-in-out `}>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white mb-4">
                        Empowering Student Success Through 
                        <span className="bg-gradient-to-r from-blue-600 via-purple-500 to-blue-500 bg-clip-text text-transparent dark:from-blue-400 dark:via-purple-400 dark:to-blue-300">
                            {' '}Digital Innovation
                        </span>
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Bridging the gap between academic achievements and professional success with cutting-edge technology and personalized solutions.
                    </p>
                </div>

                {/* Mission & Vision Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
                    {/* Image Section */}
                    <div className={`relative transition-all duration-1000 ease-in-out`}>
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                            <img 
                                src="/About.jpeg" 
                                alt="Students collaborating" 
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-500/10 mix-blend-overlay" />
                        </div>
                    </div>

                    {/* Mission & Vision Cards */}
                    <div className={`space-y-6 transition-all duration-1000 ease-in-out `}>
                        <div className="space-y-6">
                            <div className="p-6 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-lg">
                                <Target className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-4" />
                                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">Our Mission</h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    To empower students by providing innovative tools that transform academic achievements into compelling professional narratives, creating seamless connections between educational experiences and career opportunities.
                                </p>
                            </div>
                            
                            <div className="p-6 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-lg">
                                <BookOpen className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-4" />
                                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">Our Vision</h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    To be the leading platform where every student's academic journey translates into professional success, creating a future where educational achievements and career opportunities align perfectly.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Core Values Section */}
                <div className="mb-24">
                    <h3 className="text-2xl font-semibold text-center text-gray-900 dark:text-white mb-12">Our Core Values</h3>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Award className="w-6 h-6" />,
                                title: "Excellence",
                                description: "Striving for the highest standards in everything we do, ensuring quality in every aspect of our service."
                            },
                            {
                                icon: <Heart className="w-6 h-6" />,
                                title: "Innovation",
                                description: "Continuously evolving and adapting to meet the changing needs of education and career development."
                            },
                            {
                                icon: <Rocket className="w-6 h-6" />,
                                title: "Impact",
                                description: "Creating meaningful change in students' lives through effective tools and solutions."
                            }
                        ].map((value, index) => (
                            <div 
                                key={index}
                                className={`p-6 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300`}
                                style={{ transitionDelay: `${index * 200}ms` }}
                            >
                                <div className="inline-block p-3 bg-blue-50 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 mb-4">
                                    {value.icon}
                                </div>
                                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{value.title}</h4>
                                <p className="text-gray-600 dark:text-gray-300">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Feature Cards */}
                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24 transition-all duration-1000 ease-in-out `}>
                    {[
                        {
                            title: "Smart Event Tracking",
                            description: "Automatically document and organize your college events and achievements"
                        },
                        {
                            title: "AI Resume Builder",
                            description: "Transform your activities into professional resume content"
                        },
                        {
                            title: "Career Insights",
                            description: "Get personalized recommendations for skill development"
                        },
                        {
                            title: "Portfolio Generator",
                            description: "Create impressive digital portfolios from your achievements"
                        }
                    ].map((feature, index) => (
                        <div 
                            key={index} 
                            className="p-6 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-lg hover:transform hover:scale-105 transition-all duration-300"
                        >
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{feature.title}</h4>
                            <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                        </div>
                    ))}
                </div>

                {/* Stats Section */}
                <div className="relative rounded-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 dark:from-blue-900/20 dark:to-purple-900/20" />
                    <div className={`relative grid grid-cols-2 md:grid-cols-4 gap-8 p-8 transition-all duration-1000 ease-in-out `}>
                        {[
                            { number: "10K+", label: "Active Users", icon: <Users className="w-6 h-6" /> },
                            { number: "500+", label: "Partner Colleges", icon: <BookOpen className="w-6 h-6" /> },
                            { number: "50K+", label: "Events Managed", icon: <Target className="w-6 h-6" /> },
                            { number: "95%", label: "Success Rate", icon: <Award className="w-6 h-6" /> }
                        ].map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="inline-block p-2 bg-blue-50 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 mb-3">
                                    {stat.icon}
                                </div>
                                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{stat.number}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
        <Footer/>
        </>

    );
}