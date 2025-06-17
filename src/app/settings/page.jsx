'use client'
import React, { useState } from 'react';
import { Settings, User, Bell, Lock, Trash2, LogOut, Camera, Mail, Phone, Globe, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Header from '../Components/Header/Header';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('notifications');
  const [notifications, setNotifications] = useState({
    likes: true,
    comments: true,
    follows: true,
    messages: true,
    posts: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [privateAccount, setPrivateAccount] = useState(false);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'account', label: 'Account', icon: Settings }
  ];

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleLogout = () => {
    // Handle logout logic here
    alert('Logged out successfully!');
  };

  const handleDeleteAccount = () => {
    if (showDeleteConfirm) {
      // Handle account deletion logic here
      alert('Account deletion requested!');
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">Settings</h1>
            <p className="text-muted-foreground">Manage your account settings and preferences</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Navigation */}
            <div className="lg:w-1/4">
              <nav className="bg-card rounded-lg border border-border p-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
                
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 mt-2"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </nav>
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4">
              <div className="bg-card rounded-lg border border-border p-6">
                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-foreground mb-4">Notification Settings</h2>
                    
                    <div className="space-y-4">
                      {Object.entries(notifications).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
                          <div>
                            <h3 className="font-medium text-foreground capitalize">
                              {key === 'posts' ? 'New Posts from Friends' : `${key.charAt(0).toUpperCase() + key.slice(1)} Notifications`}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {key === 'likes' && 'Get notified when someone likes your posts'}
                              {key === 'comments' && 'Get notified when someone comments on your posts'}
                              {key === 'follows' && 'Get notified when someone follows you'}
                              {key === 'messages' && 'Get notified when you receive new messages'}
                              {key === 'posts' && 'Get notified when your friends share new posts'}
                            </p>
                          </div>
                          <button
                            onClick={() => handleNotificationChange(key)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              value ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                                value 
                                  ? 'translate-x-6 bg-white' 
                                  : 'translate-x-1 bg-white dark:bg-gray-200'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4">
                      <h3 className="font-medium text-foreground mb-3">Notification Methods</h3>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-3">
                          <input type="checkbox" defaultChecked className="rounded border-border" />
                          <span className="text-foreground">Email notifications</span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <input type="checkbox" defaultChecked className="rounded border-border" />
                          <span className="text-foreground">Push notifications</span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <input type="checkbox" className="rounded border-border" />
                          <span className="text-foreground">SMS notifications</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Password Tab */}
                {activeTab === 'password' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-foreground mb-4">Change Password</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Current Password</label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            className="w-full px-3 py-2 pr-10 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">New Password</label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Confirm New Password</label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium text-foreground mb-2">Password Requirements:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• At least 8 characters long</li>
                        <li>• Contains at least one uppercase letter</li>
                        <li>• Contains at least one lowercase letter</li>
                        <li>• Contains at least one number</li>
                      </ul>
                    </div>

                    <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium">
                      Update Password
                    </button>
                  </div>
                )}

                {/* Account Tab */}
                {activeTab === 'account' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-foreground mb-4">Account Settings</h2>
                    
                    {/* Privacy Settings */}
                    <div className="space-y-4">
                      <h3 className="font-medium text-foreground">Privacy</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-foreground">Private Account</p>
                            <p className="text-sm text-muted-foreground">Only approved followers can see your posts</p>
                          </div>
                          <button 
                            onClick={() => setPrivateAccount(!privateAccount)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              privateAccount ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                              privateAccount 
                                ? 'translate-x-6 bg-white' 
                                : 'translate-x-1 bg-white dark:bg-gray-200'
                            }`} />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-foreground">Show Online Status</p>
                            <p className="text-sm text-muted-foreground">Let others see when you're active</p>
                          </div>
                          <button 
                            onClick={() => setShowOnlineStatus(!showOnlineStatus)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              showOnlineStatus ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                              showOnlineStatus 
                                ? 'translate-x-6 bg-white' 
                                : 'translate-x-1 bg-white dark:bg-gray-200'
                            }`} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between py-2">
                          <div>
                            <p className="font-medium text-foreground">Allow Story Mentions</p>
                            <p className="text-sm text-muted-foreground">Let others mention you in their stories</p>
                          </div>
                          <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary">
                            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Security Settings */}
                    <div className="space-y-4">
                      <h3 className="font-medium text-foreground">Security</h3>
                      <div className="space-y-2">
                        <button className="w-full text-left px-4 py-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <span className="text-foreground">Two-Factor Authentication</span>
                            <span className="text-green-600 text-sm">Enabled</span>
                          </div>
                        </button>
                        <button className="w-full text-left px-4 py-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <span className="text-foreground">Login Activity</span>
                            <span className="text-muted-foreground">→</span>
                          </div>
                        </button>
                        <button className="w-full text-left px-4 py-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <span className="text-foreground">Blocked Users</span>
                            <span className="text-muted-foreground">→</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Data & Privacy */}
                    <div className="space-y-4">
                      <h3 className="font-medium text-foreground">Data & Privacy</h3>
                      <div className="space-y-2">
                        <button className="w-full text-left px-4 py-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <span className="text-foreground">Privacy Policy</span>
                            <span className="text-muted-foreground">→</span>
                          </div>
                        </button>
                        <button className="w-full text-left px-4 py-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <span className="text-foreground">Terms of Service</span>
                            <span className="text-muted-foreground">→</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="space-y-4 pt-4 border-t border-border">
                      <h3 className="font-medium text-red-600">Danger Zone</h3>
                      
                      {showDeleteConfirm && (
                        <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
                          <AlertDescription className="text-red-800 dark:text-red-200">
                            Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      <button
                        onClick={handleDeleteAccount}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                          showDeleteConfirm
                            ? 'bg-red-600 text-white border-red-600 hover:bg-red-700'
                            : 'border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>{showDeleteConfirm ? 'Confirm Delete Account' : 'Delete Account'}</span>
                      </button>
                      
                      {showDeleteConfirm && (
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          className="ml-2 px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}