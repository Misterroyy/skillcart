import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectUser } from '@/redux/features/user/userSlice';
import useQuery from '@/hooks/useQuery';
import useMutation from '@/hooks/useMutation';
import { 
  GET_PERSONALIZED_ROADMAP, 
  GET_USER_PROGRESS, 
  UPDATE_PROGRESS, 
  GET_ALL_ROADMAPS,
  GET_USER_GAMIFICATION,
  UPDATE_GAMIFICATION
} from '@/imports/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  CheckCircle, 
  Clock, 
  BookOpen, 
  Trophy, 
  Star, 
  Award, 
  ArrowRight, 
  Zap, 
  BookMarked,
  Calendar,
  BarChart,
  Sparkles
} from 'lucide-react';

function Dashboard() {
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [completedSteps, setCompletedSteps] = useState(0);
  const [inProgressSteps, setInProgressSteps] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [availableRoadmaps, setAvailableRoadmaps] = useState([]);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  
  // Fetch personalized roadmap
  const { data: roadmapData, loading: roadmapLoading, refetch: refetchRoadmap } = 
    useQuery(`${GET_PERSONALIZED_ROADMAP}/${user?.id}`, !user?.id);
  
  // Fetch user progress
  const { data: progressData, loading: progressLoading, refetch: refetchProgress } = 
    useQuery(`${GET_USER_PROGRESS}/${user?.id}`, !user?.id);
    
  // Fetch all available roadmaps
  const { data: allRoadmapsData, loading: allRoadmapsLoading } = 
    useQuery(GET_ALL_ROADMAPS, !user?.id);
  
  // Fetch user gamification data
  const { data: gamificationData, loading: gamificationLoading, refetch: refetchGamification } = 
    useQuery(`${GET_USER_GAMIFICATION}/${user?.id}`, !user?.id);
  
  // Mutations
  const { mutate: updateProgress } = useMutation();
  const { mutate: updateGamification } = useMutation();
  
  // Set up gamification state
  const [gamification, setGamification] = useState({
    xp: 0,
    badge: 'Beginner',
    nextBadge: 'Explorer',
    xpToNextBadge: 50,
    badgeProgress: 0,
  });
  
  // Process gamification data when it loads
  useEffect(() => {
    if (gamificationData?.data) {
      setGamification({
        xp: gamificationData.data.xp || 0,
        badge: gamificationData.data.badge || 'Beginner',
        nextBadge: gamificationData.data.next_badge,
        xpToNextBadge: gamificationData.data.xp_to_next_badge,
        badgeProgress: gamificationData.data.badge_progress,
      });
      
      if (gamificationData.data.recent_activities) {
        setRecentActivities(gamificationData.data.recent_activities);
      }
    }
  }, [gamificationData]);
  
  // Process progress data when it loads
  useEffect(() => {
    if (progressData?.data?.progress) {
      const progress = progressData.data.progress;
      const completed = progress.filter(p => p.status === 'completed').length;
      const inProgress = progress.filter(p => p.status === 'in_progress').length;
      
      setCompletedSteps(completed);
      setInProgressSteps(inProgress);
    }
  }, [progressData]);
  
  // Process roadmap data when it loads
  useEffect(() => {
    if (roadmapData?.data) {
      if (roadmapData.data.steps) {
        setTotalSteps(roadmapData.data.steps.length);
      }
      
      if (roadmapData.data.roadmap?.id) {
        setSelectedRoadmapId(roadmapData.data.roadmap.id);
      }
    }
  }, [roadmapData]);
  
  // Process all roadmaps data when it loads
  useEffect(() => {
    if (allRoadmapsData?.data) {
      setAvailableRoadmaps(allRoadmapsData.data);
    }
  }, [allRoadmapsData]);
  
  // Calculate completion percentage
  const completionPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  
  // Format activity type for display
  const formatActivityType = (type) => {
    switch(type) {
      case 'complete_step': return 'Completed a learning step';
      case 'complete_week': return 'Completed a week of learning';
      case 'complete_roadmap': return 'Completed entire roadmap';
      case 'participate_discussion': return 'Participated in discussion';
      case 'daily_login': return 'Daily login bonus';
      default: return type.replace(/_/g, ' ');
    }
  };
  
  // Handle progress update
  const handleProgressUpdate = async (stepId, status) => {
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
      
      // Refetch progress data
      refetchProgress();
      
      // Update gamification if step is completed
      if (status === 'completed') {
        await updateGamification({
          url: UPDATE_GAMIFICATION,
          method: 'POST',
          data: {
            user_id: user.id,
            activity_type: 'complete_step',
            step_id: stepId,
            roadmap_id: selectedRoadmapId
          }
        });
        
        // Refetch gamification data
        refetchGamification();
      }
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };
  
  // Start a new roadmap
  const handleStartRoadmap = (roadmapId) => {
    navigate(`/home/learner/roadmap?id=${roadmapId}`);
  };
  
  // Get badge color based on badge name
  const getBadgeColor = (badgeName) => {
    switch(badgeName) {
      case 'Beginner': return 'bg-slate-500';
      case 'Explorer': return 'bg-blue-500';
      case 'Apprentice': return 'bg-green-500';
      case 'Adept': return 'bg-yellow-500';
      case 'Expert': return 'bg-orange-500';
      case 'Master': return 'bg-purple-500';
      default: return 'bg-slate-500';
    }
  };
  
  return (
    <div className="space-y-8">
      {/* Welcome and Profile Section */}
      <div className="flex flex-col gap-6 md:flex-row">
        {/* Progress Card */}
        <Card className="flex-1">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 border-2 border-primary">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user?.name?.charAt(0) || 'L'}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>Welcome, {user?.name || 'Learner'}!</CardTitle>
                <CardDescription>
                  Track your learning progress and follow your personalized roadmap
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm font-medium">{completionPercentage}%</span>
                </div>
                <Progress value={completionPercentage} className="h-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">Completed</p>
                    <p className="text-xl font-bold">{completedSteps}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <Clock className="h-6 w-6 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-300">In Progress</p>
                    <p className="text-xl font-bold">{inProgressSteps}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Gamification Card */}
        <Card className="flex-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Achievements</CardTitle>
              <Badge variant="outline" className="gap-1">
                <Zap className="h-3.5 w-3.5 text-yellow-500" />
                <span>{gamification.xp} XP</span>
              </Badge>
            </div>
            <CardDescription>
              Your learning milestones and rewards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {/* Current Badge */}
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${getBadgeColor(gamification.badge)} text-white`}>
                  <Trophy className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-base font-semibold">{gamification.badge}</p>
                    <Badge variant="secondary" className="text-xs">{gamification.xp} XP</Badge>
                  </div>
                  {gamification.nextBadge && (
                    <div className="mt-1">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Progress to {gamification.nextBadge}</span>
                        <span>{gamification.badgeProgress}%</span>
                      </div>
                      <Progress value={gamification.badgeProgress} className="h-1.5" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {gamification.xpToNextBadge} XP needed for next badge
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Recent Activity */}
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <BarChart className="h-4 w-4" /> Recent Activity
                </h4>
                <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm py-1 border-b border-muted last:border-0">
                        <Sparkles className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                        <span className="flex-1">{formatActivityType(activity.activity_type)}</span>
                        <Badge variant="outline" className="text-xs">+{activity.xp_earned} XP</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No recent activities</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Learning Roadmap Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Your Learning Journey</CardTitle>
            <Badge variant="outline" className="gap-1">
              <BookMarked className="h-3.5 w-3.5 text-primary" />
              <span>{totalSteps} Steps</span>
            </Badge>
          </div>
          <CardDescription>
            Follow this personalized path to master your skills
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Current Roadmap</TabsTrigger>
              <TabsTrigger value="explore">Explore More</TabsTrigger>
            </TabsList>
            
            {/* Current Roadmap Overview */}
            <TabsContent value="overview">
              <div className="space-y-6">
                {roadmapLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : roadmapData?.data?.roadmap ? (
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <BookOpen className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">{roadmapData.data.roadmap.title || 'Your Learning Path'}</h3>
                        <p className="text-sm text-muted-foreground">
                          {roadmapData.data.roadmap.description || 'A personalized roadmap based on your interests and goals'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Duration</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            <span>
                              {roadmapData.data.roadmap.duration || '8'} weeks
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Weekly Commitment</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-muted-foreground" />
                            <span>
                              {roadmapData.data.roadmap.weekly_hours || '5-10'} hours/week
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Difficulty</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2">
                            <BarChart className="h-5 w-5 text-muted-foreground" />
                            <span>
                              {roadmapData.data.roadmap.difficulty || 'Intermediate'}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <Button 
                      className="mt-6 w-full md:w-auto"
                      onClick={() => handleStartRoadmap(roadmapData.data.roadmap.id)}
                    >
                      Continue Learning <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Roadmap Selected</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      You haven't selected a learning roadmap yet. Explore available roadmaps to get started.
                    </p>
                    <Button onClick={() => setActiveTab('explore')}>
                      Explore Roadmaps
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* Explore More Roadmaps */}
            <TabsContent value="explore">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Available Learning Paths</h3>
                
                {allRoadmapsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableRoadmaps.map((roadmap) => (
                      <Card key={roadmap.id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <CardTitle>{roadmap.title}</CardTitle>
                          <CardDescription>{roadmap.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2 mb-4">
                            <Badge variant="secondary">{roadmap.difficulty || 'Intermediate'}</Badge>
                            <Badge variant="outline">{roadmap.duration || '8'} weeks</Badge>
                            <Badge variant="outline">{roadmap.weekly_hours || '5-10'} hours/week</Badge>
                          </div>
                        </CardContent>
                        <CardFooter className="bg-muted/20 pt-2">
                          <Button 
                            variant="secondary" 
                            className="w-full"
                            onClick={() => handleStartRoadmap(roadmap.id)}
                          >
                            Start This Path
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default Dashboard;
