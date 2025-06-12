'use client';

import { LinkIcon, MapPin, UserCircle } from 'lucide-react'
import React from 'react'
import { useRouter } from "next/navigation";



export default function UserProfile({user}) {
    return (
        <>
            <div className="w-64 flex-shrink-0 hidden md:block">
                <div className="rounded-lg shadow-md overflow-hidden sticky top-20 border border-primary/10">
                    {/* Profile header with background and profile image */}
                    <div className="h-24 relative">
                        {user?.backgroundImage && (
                            <img
                                src={user.backgroundImage}
                                alt="Cover"
                                className="w-full h-full object-cover"
                            />
                        )}
                        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                            <div className="p-1 rounded-full">
                                <div className="rounded-full h-24 w-24 overflow-hidden border-2 border-white dark:border-gray-800">
                                    {user?.profileImage ? (
                                        <img
                                            src={user.profileImage}
                                            alt={user?.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <UserCircle className="w-full h-full" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Profile information */}
                    <div className="pt-14 pb-4 px-4 text-center">
                        <h2 className="font-semibold text-lg">{user?.name || "Loading..."}</h2>
                        <p className="text-sm mt-1">{user?.bio || "Add a headline"}</p>
                    </div>

                    {/* Location and other details */}
                    <div className="border-t px-4 py-3">
                        {user?.location && (
                            <div className="flex items-center gap-2 text-sm mb-2">
                                <MapPin className="h-4 w-4" />
                                <span>{user.location}</span>
                            </div>
                        )}

                        {user?.website && (
                            <div className="flex items-center gap-2 text-sm">
                                <LinkIcon className="h-4 w-4" />
                                <a href={user.website} className="hover:underline" target="_blank" rel="noreferrer">
                                    {user.website}
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Stats section */}
                    {/* <div className="border-t px-4 py-3">
                                <div className="flex justify-between text-sm">
                                    <span className="flex items-center gap-1">
                                        <Users className="h-4 w-4" />
                                        Connections
                                    </span>
                                    <span className="font-medium">{user?.followers || 0}</span>
                                </div>
                                <div className="flex justify-between text-sm mt-2">
                                    <span className="flex items-center gap-1">
                                        <Eye className="h-4 w-4" />
                                        Profile views
                                    </span>
                                    <span className="font-medium">{user?.views || 0} this week</span>
                                </div>
                            </div> */}

                    {/* Call to action */}
                    <div className="border-t p-4">
                        <button
                            onClick={() => { router.push(`/user/${user.userid}`) }}
                            className="w-full font-medium py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            View Complete Profile
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
