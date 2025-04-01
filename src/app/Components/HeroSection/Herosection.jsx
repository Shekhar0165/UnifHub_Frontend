'use client'
import { useIntersectionObserver } from '@/app/Useintersectionobserver';
import { useRouter } from 'next/navigation';


export default function Herosection() {
    const { elementRef, isVisible } = useIntersectionObserver();
    const router = useRouter();
    return (
        <div ref={elementRef} className="relative overflow-hidden pb-44">
            {/* Main content with enhanced shadows */}
            <div className="relative container mx-auto px-4 md:px-6">
                <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center py-10 text-center">
                    {/* Tagline with enhanced shadow */}
                    <div className={`mb-8 transform transition-all duration-1000 ease-in-out 
                        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'}`}>
                        <span className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-100 to-purple-100 px-6 py-2 text-sm font-medium text-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 dark:from-blue-900/30 dark:to-purple-900/30 dark:text-blue-400">
                            Transform Your College Journey into Career Success
                        </span>
                    </div>

                    {/* Main heading with enhanced depth */}
                    <h1 className={` mb-6 max-w-4xl font-bold text-4xl md:text-5xl lg:text-6xl tracking-tight text-gray-900 drop-shadow-2xl dark:text-white transition-all duration-1000 ease-in-out ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-32'}`}>
                        Showcase Your College{' '}
                        <span className="bg-gradient-to-r from-blue-600 via-purple-500 to-blue-500 bg-clip-text text-transparent dark:from-blue-400 dark:via-purple-400 dark:to-blue-300">
                            Activities & Achievements
                        </span>
                    </h1>

                    {/* Description with subtle shadow */}
                    <p className={`animate-fade-in-up mb-8 max-w-2xl text-lg text-gray-600 drop-shadow-md dark:text-gray-300 transition-all duration-1000 ease-in-out ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
                        Track your college events, competitions, and achievements while we craft 
                        your professional resume using AI. Turn every college experience into a 
                        career advantage with our smart event management and resume building platform.
                    </p>

                    {/* Enhanced CTA Buttons with dynamic shadows */}
                    <div className="animate-fade-in-up flex flex-col gap-4 sm:flex-row sm:justify-center">
                        <button onClick={()=>{router.push('/about')}} className={`group inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-3 text-base font-semibold text-white shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)]  hover:shadow-[0_20px_60px_rgba(8,_112,_184,_0.5)] hover:translate-y-[-2px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:shadow-[0_20px_50px_rgba(8,_112,_184,_0.3)] transition-all duration-1000 ease-in-out ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
                        Know More
                            <svg className="ml-2 h-5 w-5 transform transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </button>
                        <button onClick={()=>{router.push('/events')}} className={`inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white/80 backdrop-blur-sm px-8 py-3 text-base font-semibold text-gray-700 shadow-lg  hover:shadow-xl hover:translate-y-[-2px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-gray-800/80 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700/80 transition-all duration-1000 ease-in-out ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
                            Events
                        </button>
                    </div>

                    {/* Stats section with glass effect */}
                    {/* <div className="animate-fade-in-up mt-12 grid grid-cols-2 gap-8 md:grid-cols-3 lg:gap-12">
                        {['500+', '10,000+', '95%'].map((stat, index) => (
                            <div key={index} className={`group relative overflow-hidden rounded-2xl  bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-6 backdrop-blur-sm  hover:scale-105 shadow-xl dark:bg-gray-800/50 transition-all duration-1000 ease-in-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}>
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                <div className="relative">
                                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stat}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        {index === 0 && 'College Events Managed'}
                                        {index === 1 && 'Student Resumes Created'}
                                        {index === 2 && 'Satisfaction Rate'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div> */}

                    {/* Enhanced decorative elements */}
                    <div className="absolute left-0 -z-20 top-2/3 h-96 w-96 -translate-y-1/2 transform rounded-full bg-gradient-to-br from-blue-100 via-purple-100 to-blue-200 opacity-20 blur-3xl dark:from-blue-900 dark:via-purple-900 dark:to-blue-800" />
                    <div className="absolute right-0 -z-20 top-2/3 h-96 w-96 -translate-y-1/2 transform rounded-full bg-gradient-to-br from-purple-200 via-blue-200 to-purple-300 opacity-20 blur-3xl dark:from-purple-800 dark:via-blue-800 dark:to-purple-700" />
                </div>
            </div>
        
        </div>
    );
}