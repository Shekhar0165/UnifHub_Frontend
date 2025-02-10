import React from 'react';

export default function Herosection() {
    return (
        <div className='container mx-auto px-4 md:px-6 '>
            <div className='my-8 md:my-16 md:px-10 md:flex md:items-center md:justify-center md:gap-12'>
                <div className='flex-1 '>
                    <div className='text-red-600 font-semibold mb-6'>
                        <span className='bg-red-100 px-4 py-2 rounded-full text-sm md:text-base'>
                            __Your Knowledge is Our Priority
                        </span>
                    </div>
                    
                    <h1 className='font-bold text-3xl md:w-[80%] md:text-4xl lg:text-5xl leading-tight mb-4'>
                        Learn Without Limits{' '}
                        <span className='text-red-600'>
                            Grow Your Knowledge
                        </span>
                    </h1>
                    
                    <p className='text-gray-500 text-base md:text-lg mb-8 max-w-xl'>
                        Lorem ipsum dolor sit, amet consectetur adipisicing elit. 
                        Odio iste, earum iure perferendis excepturi assumenda.
                    </p>
                    
                    <div className='flex gap-4 max-w-xl'>
                        <button className='bg-primary text-background px-6 py-3 rounded-lg 
                            font-semibold hover:bg-primary/90 transition-all duration-200 
                            shadow-lg hover:shadow-xl'>
                            Get Started
                        </button>
                        <button className='px-6 py-3 rounded-lg font-semibold 
                            border border-gray-300 hover:bg-gray-50 transition-all duration-200'>
                            Learn More
                        </button>
                    </div>
                </div>

                <div className='mt-12 md:mt-0 '>
                    
                        <img 
                            className='relative bg-cover w-96 '
                            src="/HeroSection.jpg" 
                            alt="Learning illustration"
                        />
                    
                </div>
            </div>
        </div>
    );
}