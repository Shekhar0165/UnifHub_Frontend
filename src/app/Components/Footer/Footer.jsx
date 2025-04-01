'use client'
import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">UnifHub</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Transform your college journey into career success with our comprehensive event management and resume building platform.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-4 sm:mt-0">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <a href="/" className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors">Home</a>
              </li>
              <li>
                <a href="/about" className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors">About Us</a>
              </li>
              <li>
                <a href="/events" className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors">Events</a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors">Clubs</a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="mt-4 sm:mt-0">
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors">Resume Builder</a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors">Event Management</a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors">Career Tips</a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors">Blog</a>
              </li>
            </ul>
          </div>

          {/* Contact - Removed email sending functionality */}
          <div className="mt-4 sm:mt-0">
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Reach out to us through our social media channels or visit our contact page for more information.
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-6 md:mt-12 md:pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              © {new Date().getFullYear()} UnifHub. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              <a href="#" className="text-sm text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="text-sm text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="text-sm text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors">Cookies Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}