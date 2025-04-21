import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { X, User, Building2 } from 'lucide-react';

const FollowerFollowingPopup = ({ isOpen, onClose, followerList, followingList, router }) => {
  const [activeTab, setActiveTab] = useState('followers');

  if (!isOpen) return null;

  // Helper function to determine profile path based on entity type
  const getProfilePath = (entity) => {
    if (entity.entityType === 'organization') {
      return `/organization/${entity.userid}`;
    } else {
      return `/user/${entity.userid}`;
    }
  };

  console.log('Follower List:', followerList);
  console.log('followingList List:', followingList);

  // Helper function to render entity type icon
  const renderEntityTypeIcon = (entity) => {
    if (entity.entityType === 'organization') {
      return <Building2 className="h-4 w-4 text-muted-foreground" />;
    }
    return <User className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 animate-fadeIn">
      <Card className="w-96 max-h-[80vh] bg-background rounded-lg shadow-lg">
        <CardContent className="p-0">
          <div className="flex justify-between items-center p-4">
            <div className="flex">
              <button
                onClick={() => setActiveTab('followers')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'followers'
                    ? 'text-foreground border-b-2 border-blue-600'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Followers ({followerList?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('following')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'following'
                    ? 'text-foreground border-b-2 border-blue-600'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Following ({followingList?.length || 0})
              </button>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <Separator />

          <div className="overflow-y-auto max-h-[60vh] p-4">
            {activeTab === 'followers' ? (
              followerList?.length > 0 ? (
                followerList.map((follower, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-3 border-b border-border last:border-b-0"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={follower.image_path || follower.profileImage}
                          alt={follower.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
                          {renderEntityTypeIcon(follower)}
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium text-foreground">{follower.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {follower.entityType === 'organization' ? '(Org)' : ''}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                          {follower.bio?.substring(0, 30)}
                          {follower.bio?.length > 30 ? '...' : ''}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        router.push(getProfilePath(follower));
                        onClose();
                      }}
                    >
                      View
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">No followers yet.</p>
              )
            ) : followingList?.length > 0 ? (
              followingList.map((following, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b border-border last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={following.image_path || following.profileImage}
                        alt={following.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
                        {renderEntityTypeIcon(following)}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-foreground">{following.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {following.entityType === 'organization' ? '(Org)' : ''}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                        {following.bio?.substring(0, 30)}
                        {following.bio?.length > 30 ? '...' : ''}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      router.push(getProfilePath(following));
                      onClose();
                    }}
                  >
                    View
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">Not following anyone yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FollowerFollowingPopup;