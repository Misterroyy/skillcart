import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '@/redux/features/user/userSlice';
import useQuery from '@/hooks/useQuery';
import useMutation from '@/hooks/useMutation';
import { 
  GET_DISCUSSIONS_BY_STEP,
  CREATE_DISCUSSION,
  REPLY_TO_DISCUSSION,
  GET_ALL_ROADMAPS
} from '@/imports/api';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  MessageSquare, 
  Send,
  ChevronDown,
  ChevronUp,
  Search
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function Discussions() {
  const user = useSelector(selectUser);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState(null);
  const [selectedStepId, setSelectedStepId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newDiscussion, setNewDiscussion] = useState('');
  const [newReply, setNewReply] = useState({});
  const [expandedDiscussions, setExpandedDiscussions] = useState({});

  // Fetch all roadmaps
  const { data: roadmapsData, loading: roadmapsLoading } = useQuery(GET_ALL_ROADMAPS);

  // Fetch discussions for selected step
  const { data: discussionsData, loading: discussionsLoading, refetch: refetchDiscussions } = useQuery(
    selectedStepId ? `${GET_DISCUSSIONS_BY_STEP}/${selectedStepId}` : null,
    !selectedStepId
  );

  // Mutations for discussions
  const { mutate: createDiscussion } = useMutation();
  const { mutate: replyToDiscussion } = useMutation();

  // Handle creating a new discussion
  const handleCreateDiscussion = async () => {
    if (!newDiscussion.trim() || !selectedStepId) return;

    try {
      await createDiscussion({
        url: CREATE_DISCUSSION,
        method: 'POST',
        data: {
          step_id: selectedStepId,
          user_id: user.id,
          content: newDiscussion
        }
      });

      setNewDiscussion('');
      refetchDiscussions();
    } catch (error) {
      console.error('Failed to create discussion:', error);
    }
  };

  // Handle replying to a discussion
  const handleReplyToDiscussion = async (discussionId) => {
    if (!newReply[discussionId]?.trim()) return;

    try {
      await replyToDiscussion({
        url: REPLY_TO_DISCUSSION,
        method: 'POST',
        data: {
          discussion_id: discussionId,
          user_id: user.id,
          reply: newReply[discussionId]
        }
      });

      setNewReply(prev => ({ ...prev, [discussionId]: '' }));
      refetchDiscussions();
    } catch (error) {
      console.error('Failed to reply to discussion:', error);
    }
  };

  // Toggle discussion expansion
  const toggleDiscussionExpansion = (discussionId) => {
    setExpandedDiscussions(prev => ({
      ...prev,
      [discussionId]: !prev[discussionId]
    }));
  };

  // Get steps from roadmap
  const getStepsFromRoadmap = (roadmapId) => {
    if (!roadmapsData?.data?.roadmaps) return [];
    
    const roadmap = roadmapsData.data.roadmaps.find(r => r.id === roadmapId);
    return roadmap?.steps || [];
  };

  // Filter discussions by search query
  const filterDiscussions = (discussions) => {
    if (!searchQuery.trim()) return discussions;
    
    return discussions.filter(discussion => 
      discussion.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discussion.user_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Community Discussions</CardTitle>
          <CardDescription>
            Engage with other learners and ask questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="browse">
            <TabsList className="mb-4">
              <TabsTrigger value="browse">Browse Discussions</TabsTrigger>
              <TabsTrigger value="my">My Discussions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="browse">
              <div className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row">
                  <div className="md:w-1/3">
                    <div className="space-y-4">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search discussions..."
                          className="pl-8"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      
                      {roadmapsLoading ? (
                        <p>Loading roadmaps...</p>
                      ) : roadmapsData?.data?.roadmaps ? (
                        <div className="space-y-2">
                          <h3 className="font-medium">Select Roadmap</h3>
                          <div className="space-y-1">
                            {roadmapsData.data.roadmaps.map(roadmap => (
                              <Button
                                key={roadmap.id}
                                variant={selectedRoadmapId === roadmap.id ? "default" : "ghost"}
                                className="w-full justify-start"
                                onClick={() => {
                                  setSelectedRoadmapId(roadmap.id);
                                  setSelectedStepId(null);
                                }}
                              >
                                {roadmap.title || `Roadmap ${roadmap.id}`}
                              </Button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p>No roadmaps found</p>
                      )}
                      
                      {selectedRoadmapId && (
                        <div className="space-y-2">
                          <h3 className="font-medium">Select Step</h3>
                          <div className="space-y-1 max-h-[300px] overflow-y-auto">
                            {getStepsFromRoadmap(selectedRoadmapId).map(step => (
                              <Button
                                key={step.id}
                                variant={selectedStepId === step.id ? "default" : "ghost"}
                                className="w-full justify-start text-sm"
                                onClick={() => setSelectedStepId(step.id)}
                              >
                                {step.title || `Step ${step.id}`}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="md:w-2/3">
                    {selectedStepId ? (
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Ask a question or share your thoughts..."
                            value={newDiscussion}
                            onChange={(e) => setNewDiscussion(e.target.value)}
                          />
                          <Button 
                            onClick={handleCreateDiscussion}
                            disabled={!newDiscussion.trim()}
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Post
                          </Button>
                        </div>
                        
                        <div className="space-y-4 mt-4">
                          {discussionsLoading ? (
                            <p>Loading discussions...</p>
                          ) : discussionsData?.data?.length > 0 ? (
                            filterDiscussions(discussionsData.data).map(discussion => (
                              <Card key={discussion.id}>
                                <CardHeader className="pb-2">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <CardTitle className="text-base">{discussion.user_name || 'Anonymous'}</CardTitle>
                                      <CardDescription>
                                        {new Date(discussion.created_at).toLocaleString()}
                                      </CardDescription>
                                    </div>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => toggleDiscussionExpansion(discussion.id)}
                                    >
                                      {expandedDiscussions[discussion.id] ? (
                                        <ChevronUp className="h-4 w-4" />
                                      ) : (
                                        <ChevronDown className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  <p>{discussion.content}</p>
                                  
                                  {expandedDiscussions[discussion.id] && (
                                    <div className="mt-4 space-y-3">
                                      <div className="border-t pt-3">
                                        <h4 className="font-medium text-sm mb-2">
                                          {discussion.replies?.length || 0} Replies
                                        </h4>
                                        
                                        {discussion.replies && discussion.replies.length > 0 ? (
                                          <div className="space-y-3 pl-4 border-l-2">
                                            {discussion.replies.map(reply => (
                                              <div key={reply.id} className="bg-muted/20 p-3 rounded-md">
                                                <div className="flex justify-between">
                                                  <p className="font-medium">{reply.user_name || 'Anonymous'}</p>
                                                  <p className="text-xs text-muted-foreground">
                                                    {new Date(reply.created_at).toLocaleString()}
                                                  </p>
                                                </div>
                                                <p className="mt-1 text-sm">{reply.content}</p>
                                              </div>
                                            ))}
                                          </div>
                                        ) : (
                                          <p className="text-sm text-muted-foreground">No replies yet</p>
                                        )}
                                        
                                        <div className="flex gap-2 mt-3">
                                          <Input
                                            placeholder="Write a reply..."
                                            value={newReply[discussion.id] || ''}
                                            onChange={(e) => setNewReply({
                                              ...newReply,
                                              [discussion.id]: e.target.value
                                            })}
                                          />
                                          <Button 
                                            size="sm"
                                            onClick={() => handleReplyToDiscussion(discussion.id)}
                                            disabled={!newReply[discussion.id]?.trim()}
                                          >
                                            Reply
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ))
                          ) : (
                            <div className="text-center py-8">
                              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                              <h3 className="text-lg font-medium">No Discussions Found</h3>
                              <p className="text-sm text-muted-foreground mt-2">
                                Be the first to start a discussion in this topic!
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">Select a Topic</h3>
                        <p className="text-sm text-muted-foreground mt-2">
                          Choose a roadmap and step to view or start discussions
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="my">
              <div className="text-center py-12">
                <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">My Discussions</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  This feature is coming soon! You'll be able to view all your discussions here.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default Discussions;
