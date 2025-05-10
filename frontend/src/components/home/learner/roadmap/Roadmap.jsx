import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { selectUser } from '@/redux/features/user/userSlice';
import useQuery from '@/hooks/useQuery';
import useMutation from '@/hooks/useMutation';
import { 
  GET_ROADMAP_BY_ID, 
  GET_RESOURCES_BY_STEP, 
  GET_DISCUSSIONS_BY_STEP,
  CREATE_DISCUSSION,
  REPLY_TO_DISCUSSION,
  UPDATE_PROGRESS,
  UPDATE_GAMIFICATION,
  GET_USER_PROGRESS,
  CHECK_WEEK_COMPLETION,
  CHECK_ROADMAP_COMPLETION
} from '@/imports/api';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  BookOpen, 
  MessageSquare, 
  Video, 
  FileText, 
  HelpCircle,
  Send,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Clock,
  XCircle,
  Zap
} from 'lucide-react';

function Roadmap() {
  const user = useSelector(selectUser);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Define state variables
  const [selectedRoadmapId, setSelectedRoadmapId] = useState(null);
  const [selectedStepId, setSelectedStepId] = useState(null);
  const [newDiscussion, setNewDiscussion] = useState('');
  const [newReply, setNewReply] = useState({});
  const [expandedDiscussions, setExpandedDiscussions] = useState({});
  const [stepProgress, setStepProgress] = useState({});
  const [loadingStepProgress, setLoadingStepProgress] = useState(false);
  
  // Extract roadmap ID from URL query parameters or localStorage
  useEffect(() => {
    // First try to get roadmap ID from URL
    const queryParams = new URLSearchParams(location.search);
    const roadmapId = queryParams.get('id');
    
    if (roadmapId) {
      setSelectedRoadmapId(roadmapId);
      console.log('Roadmap ID from URL:', roadmapId);
      return;
    }
    
    // If not in URL, try to get from localStorage
    const storedRoadmapId = localStorage.getItem('selectedRoadmapId');
    if (storedRoadmapId) {
      setSelectedRoadmapId(storedRoadmapId);
      console.log('Roadmap ID from localStorage:', storedRoadmapId);
      
      // Update URL to include the roadmap ID
      navigate(`/home/learner/roadmap?id=${storedRoadmapId}`, { replace: true });
    }
  }, [location, navigate]);

  // Fetch roadmap data
  const { data: roadmapData, loading: roadmapLoading, error: roadmapError } = useQuery(
    selectedRoadmapId ? `${GET_ROADMAP_BY_ID}/${selectedRoadmapId}` : null,
    !selectedRoadmapId
  );
  
  // Log roadmap data for debugging
  useEffect(() => {
    if (selectedRoadmapId) {
      console.log('Fetching roadmap with ID:', selectedRoadmapId);
      console.log('API endpoint being called:', `${GET_ROADMAP_BY_ID}/${selectedRoadmapId}`);
    }
    
    if (roadmapData) {
      console.log('Roadmap data received:', roadmapData);
      
      // Check if the response has the expected structure
      if (roadmapData.data && roadmapData.data.roadmap) {
        console.log('Roadmap details:', roadmapData.data.roadmap);
        console.log('Steps count:', roadmapData.data.steps?.length || 0);
      } else {
        console.warn('Unexpected roadmap data structure:', roadmapData);
      }
    }
    
    if (roadmapError) {
      console.error('Error fetching roadmap:', roadmapError);
    }
  }, [selectedRoadmapId, roadmapData, roadmapError, GET_ROADMAP_BY_ID]);

  // Fetch resources for selected step
  const { data: resourcesData, loading: resourcesLoading } = useQuery(
    selectedStepId ? `${GET_RESOURCES_BY_STEP}/${selectedStepId}` : null,
    !selectedStepId
  );

  // Fetch discussions for selected step
  const { data: discussionsData, loading: discussionsLoading, refetch: refetchDiscussions } = useQuery(
    selectedStepId ? `${GET_DISCUSSIONS_BY_STEP}/${selectedStepId}` : null,
    !selectedStepId
  );
  
  // Fetch user progress
  const { data: progressData, loading: progressLoading, refetch: refetchProgress } = useQuery(
    user?.id ? `${GET_USER_PROGRESS}/${user.id}` : null,
    !user?.id
  );

  // Mutations for discussions
  const { mutate: createDiscussion } = useMutation();
  const { mutate: replyToDiscussion } = useMutation();
  
  // Mutations for progress and gamification
  const { mutate: updateProgress } = useMutation();
  const { mutate: updateGamification } = useMutation();

  // Set default roadmap ID from first load
  useEffect(() => {
    if (roadmapData?.data?.roadmap?.id && !selectedRoadmapId) {
      setSelectedRoadmapId(roadmapData.data.roadmap.id);
    }
  }, [roadmapData]);
  
  // Process user progress data
  useEffect(() => {
    if (progressData?.data?.progress && Array.isArray(progressData.data.progress)) {
      // Create a map of step IDs to their progress status
      const progressMap = {};
      progressData.data.progress.forEach(item => {
        progressMap[item.step_id] = item.status;
      });
      
      setStepProgress(progressMap);
      console.log('User progress loaded:', progressMap);
    }
  }, [progressData]);

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

  // Group steps by week
  const groupStepsByWeek = () => {
    if (!roadmapData?.data?.steps) return [];
    
    const steps = roadmapData.data.steps;
    const grouped = {};
    
    steps.forEach(step => {
      if (!grouped[step.week_number]) {
        grouped[step.week_number] = [];
      }
      grouped[step.week_number].push(step);
    });
    
    return Object.entries(grouped).map(([week, steps]) => ({
      week: parseInt(week),
      steps
    }));
  };

  // Handle step completion
  const handleStepCompletion = async (stepId, status) => {
    if (!stepId || !user?.id || !selectedRoadmapId) {
      console.error('Missing required data for updating progress');
      return;
    }
    
    setLoadingStepProgress(true);
    
    try {
      // Update progress
      await updateProgress({
        url: UPDATE_PROGRESS,
        method: 'POST',
        data: {
          user_id: user.id,
          step_id: stepId,
          status
        }
      });
      
      console.log(`Step ${stepId} marked as ${status}`);
      
      // If step is completed, update gamification (award XP)
      if (status === 'completed') {
        const gamificationResponse = await updateGamification({
          url: UPDATE_GAMIFICATION,
          method: 'POST',
          data: {
            user_id: user.id,
            activity_type: 'complete_step',
            step_id: stepId,
            roadmap_id: selectedRoadmapId
          }
        });
        
        console.log(`XP awarded for completing step ${stepId}:`, gamificationResponse);
        
        // Get the step to determine its week number
        const step = roadmapData?.data?.steps?.find(s => s.id === stepId);
        if (step?.week_number) {
          // Check if the week is completed
          const weekCompletionResponse = await fetch(`/api/${CHECK_WEEK_COMPLETION}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              user_id: user.id,
              roadmap_id: selectedRoadmapId,
              week_number: step.week_number
            })
          });
          
          const weekCompletionData = await weekCompletionResponse.json();
          console.log('Week completion check:', weekCompletionData);
          
          // If week was just completed, show a notification
          if (weekCompletionData.completed && !weekCompletionData.already_awarded) {
            // Show week completion notification
            toast.success(
              '🎉 Week Completed!',
              {
                description: `You've completed Week ${step.week_number} and earned ${weekCompletionData.xp_earned} XP!`,
                duration: 5000,
              }
            );
          }
        }
        
        // Check if the entire roadmap is completed
        const roadmapCompletionResponse = await fetch(`/api/${CHECK_ROADMAP_COMPLETION}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            user_id: user.id,
            roadmap_id: selectedRoadmapId
          })
        });
        
        const roadmapCompletionData = await roadmapCompletionResponse.json();
        console.log('Roadmap completion check:', roadmapCompletionData);
        
        // If roadmap was just completed, show a notification
        if (roadmapCompletionData.completed && !roadmapCompletionData.already_awarded) {
          // Show roadmap completion notification
          toast.success(
            '🏆 Roadmap Completed!',
            {
              description: `Congratulations! You've completed the entire roadmap and earned ${roadmapCompletionData.xp_earned} XP!`,
              duration: 7000,
            }
          );
        }
      }
      
      // Refresh progress data
      refetchProgress();
      
      // Update local state for immediate UI feedback
      setStepProgress(prev => ({
        ...prev,
        [stepId]: status
      }));
    } catch (error) {
      console.error('Failed to update progress or gamification:', error);
      toast.error(
        'Error',
        {
          description: 'Failed to update progress. Please try again.',
          duration: 3000,
        }
      );
    } finally {
      setLoadingStepProgress(false);
    }
  };
  
  // Helper function to get the current week number of the year
  const getCurrentWeekNumber = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now - start;
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    return Math.floor(diff / oneWeek) + 1;
  };

  // Get step status based on progress data
  const getStepStatus = (stepId) => {
    // If we have progress data for this step, use it
    if (stepProgress[stepId]) {
      return stepProgress[stepId];
    }
    
    // Default fallback logic based on week number
    const step = roadmapData?.data?.steps?.find(s => s.id === stepId);
    if (!step) return 'upcoming';
    
    // Use our helper function to get the current week number
    const currentWeek = getCurrentWeekNumber();
    if (step.week_number < currentWeek) return 'completed';
    if (step.week_number === currentWeek) return 'in-progress';
    return 'upcoming';
  };
  
  // Get step status icon
  const getStepStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };
  
  // Get resource icon based on type
  const getResourceIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'video':
        return <Video className="h-5 w-5 text-blue-500" />;
      case 'article':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'quiz':
        return <HelpCircle className="h-5 w-5 text-purple-500" />;
      default:
        return <BookOpen className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Learning Roadmap</CardTitle>
          <CardDescription>
            Explore your learning path and access resources
          </CardDescription>
        </CardHeader>
        <CardContent>
          {roadmapLoading ? (
            <p>Loading roadmap data...</p>
          ) : roadmapData?.data?.roadmap ? (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  {roadmapData.data.roadmap.title || 'Your Learning Path'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {roadmapData.data.roadmap.description || 'A structured learning path to help you achieve your goals'}
                </p>
              </div>

              <div className="space-y-8">
                {groupStepsByWeek().map(week => (
                  <div key={week.week} className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Week {week.week}</h3>
                    <div className="space-y-4">
                      {week.steps.map(step => (
                        <Card key={step.id} className="overflow-hidden">
                          <CardHeader className="bg-muted/50">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">{step.title}</CardTitle>
                              <div className="flex items-center space-x-2">
                                {getStepStatusIcon(getStepStatus(step.id))}
                                <span className="text-xs capitalize">{getStepStatus(step.id)}</span>
                              </div>
                            </div>
                            {step.description && (
                              <CardDescription>{step.description}</CardDescription>
                            )}
                          </CardHeader>
                          <CardContent className="p-0">
                            <Tabs defaultValue="resources">
                              <div className="flex justify-between items-center border-b">
                                <TabsList className="justify-start rounded-none bg-transparent p-0">
                                  <TabsTrigger 
                                    value="resources" 
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                                    onClick={() => setSelectedStepId(step.id)}
                                  >
                                    Resources
                                  </TabsTrigger>
                                  <TabsTrigger 
                                    value="discussions" 
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                                    onClick={() => setSelectedStepId(step.id)}
                                  >
                                    Discussions
                                  </TabsTrigger>
                                </TabsList>
                                
                                <div className="flex space-x-2 pr-4">
                                  {getStepStatus(step.id) !== 'completed' && (
                                    <button
                                      className="flex items-center space-x-1 text-xs bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded-md transition-colors"
                                      onClick={() => handleStepCompletion(step.id, 'completed')}
                                      disabled={loadingStepProgress}
                                    >
                                      <CheckCircle className="h-3 w-3" />
                                      <span>Mark Complete</span>
                                      {loadingStepProgress && <span className="animate-spin">⟳</span>}
                                    </button>
                                  )}
                                  {getStepStatus(step.id) !== 'in-progress' && getStepStatus(step.id) !== 'completed' && (
                                    <button
                                      className="flex items-center space-x-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded-md transition-colors"
                                      onClick={() => handleStepCompletion(step.id, 'in-progress')}
                                      disabled={loadingStepProgress}
                                    >
                                      <Clock className="h-3 w-3" />
                                      <span>Start</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                              
                              <TabsContent value="resources" className="p-4">
                                {resourcesLoading && selectedStepId === step.id ? (
                                  <p>Loading resources...</p>
                                ) : resourcesData?.data?.resources && selectedStepId === step.id ? (
                                  <div className="space-y-3">
                                    {resourcesData.data.resources.length > 0 ? (
                                      resourcesData.data.resources.map(resource => (
                                        <div key={resource.id} className="flex items-start gap-3 p-3 border rounded-md">
                                          {getResourceIcon(resource.type)}
                                          <div>
                                            <h4 className="font-medium">{resource.title}</h4>
                                            <a 
                                              href={resource.url} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className="text-sm text-blue-600 hover:underline"
                                            >
                                              View Resource
                                            </a>
                                          </div>
                                        </div>
                                      ))
                                    ) : (
                                      <div className="text-center py-6">
                                        <BookOpen className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                                        <p className="text-muted-foreground">No resources available for this step</p>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-center py-6">
                                    <p>Select a step to view resources</p>
                                  </div>
                                )}
                              </TabsContent>
                              
                              <TabsContent value="discussions" className="p-4">
                                {discussionsLoading && selectedStepId === step.id ? (
                                  <p>Loading discussions...</p>
                                ) : selectedStepId === step.id ? (
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
                                      {discussionsData?.data?.length > 0 ? (
                                        discussionsData.data.map(discussion => (
                                          <div key={discussion.id} className="border rounded-md overflow-hidden">
                                            <div className="bg-muted/30 p-3">
                                              <div className="flex justify-between items-start">
                                                <div>
                                                  <p className="font-medium">{discussion.user_name || 'Anonymous'}</p>
                                                  <p className="text-sm text-muted-foreground">
                                                    {new Date(discussion.created_at).toLocaleString()}
                                                  </p>
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
                                              <p className="mt-2">{discussion.content}</p>
                                            </div>
                                            
                                            {expandedDiscussions[discussion.id] && (
                                              <div className="p-3 space-y-3">
                                                {discussion.replies && discussion.replies.length > 0 ? (
                                                  <div className="space-y-3 pl-6 border-l-2">
                                                    {discussion.replies.map(reply => (
                                                      <div key={reply.id} className="bg-muted/20 p-3 rounded-md">
                                                        <div className="flex items-center space-x-2 mb-2">
                                                          <div className="flex-1">
                                                            <div className="flex items-center justify-between">
                                                              <h4 className="text-sm font-medium">
                                                                Week {step.week_number}: {step.title}
                                                              </h4>
                                                              <div className="flex items-center space-x-2">
                                                                {getStepStatusIcon(getStepStatus(step.id))}
                                                                <span className="text-xs capitalize">{getStepStatus(step.id)}</span>
                                                              </div>
                                                            </div>
                                                            <p className="text-sm text-gray-500">{step.description}</p>
                                                          </div>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">{new Date(reply.created_at).toLocaleString()}</p>
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
                                            )}
                                          </div>
                                        ))
                                      ) : (
                                        <div className="text-center py-6">
                                          <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                                          <p className="text-muted-foreground">No discussions yet. Start the conversation!</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-center py-6">
                                    <p>Select a step to view discussions</p>
                                  </div>
                                )}
                              </TabsContent>
                            </Tabs>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Roadmap Found</h3>
              <p className="text-sm text-muted-foreground mt-2">
                We couldn't find a roadmap for you. Please check back later.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Roadmap;
