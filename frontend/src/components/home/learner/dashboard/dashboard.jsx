import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectUser } from '@/redux/features/user/userSlice';
import { toast } from 'sonner';
import useQuery from '@/hooks/useQuery';
import useMutation from '@/hooks/useMutation';
import { 
  GET_RECOMMENDED_ROADMAPS,
  GET_TRENDING_ROADMAPS,
  GET_USER_PROGRESS, 
  UPDATE_PROGRESS, 
  GET_ALL_ROADMAPS,
  GET_USER_GAMIFICATION,
  UPDATE_GAMIFICATION,
  JOIN_ROADMAP,
  GET_USER_ROADMAPS,
  GET_GAMIFICATION_LEADERBOARD,
  GET_ACHIEVEMENTS_LIST
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
  Sparkles,
  Medal,
  Users,
  Flame,
  Share2,
  MessageCircle,
  Footprints,
  HandHelping
} from 'lucide-react';

function Dashboard() {
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [completedSteps, setCompletedSteps] = useState(0);
  const [inProgressSteps, setInProgressSteps] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  // Removed personalizedRoadmap state as it's no longer needed
  const [availableRoadmaps, setAvailableRoadmaps] = useState([]);
  const [userRoadmaps, setUserRoadmaps] = useState([]);
  const [recommendedRoadmaps, setRecommendedRoadmaps] = useState([]);
  const [trendingRoadmaps, setTrendingRoadmaps] = useState([]);
  const [joinedRoadmapIds, setJoinedRoadmapIds] = useState(new Set());
  const [selectedRoadmapId, setSelectedRoadmapId] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [joiningRoadmap, setJoiningRoadmap] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [achievementsList, setAchievementsList] = useState([]);
  
  // Personalized roadmap query removed as it's no longer needed
  
  // Fetch recommended roadmaps
  const { data: recommendedData, loading: recommendedLoading } = 
    useQuery(`${GET_RECOMMENDED_ROADMAPS}/${user?.id}`, !user?.id);
  
  // Fetch trending roadmaps
  const { data: trendingData, loading: trendingLoading } = 
    useQuery(GET_TRENDING_ROADMAPS, false);
  
  // Fetch data
  const { data: progressData, loading: progressLoading } = useQuery(
    user?.id ? `${GET_USER_PROGRESS}/${user.id}` : null,
    !user?.id
  );
  
  const { data: roadmapDataById, loading: roadmapLoadingById } = useQuery(
    selectedRoadmapId ? `${GET_ROADMAP_BY_ID}/${selectedRoadmapId}` : null,
    !selectedRoadmapId
  );
  
  const { data: allRoadmapsData, loading: allRoadmapsLoading } = useQuery(
    GET_ALL_ROADMAPS,
    false
  );
  
  const { data: gamificationData, loading: gamificationLoading, refetch: refetchGamification } = useQuery(
    user?.id ? `${GET_USER_GAMIFICATION}/${user.id}` : null,
    !user?.id
  );
  
  // Temporarily disabled leaderboard fetching
  const leaderboardLoading = false;
  // Using static empty array instead of an object to avoid infinite loop
  const leaderboardData = [];
  
  const { data: achievementsListData, loading: achievementsListLoading } = useQuery(
    GET_ACHIEVEMENTS_LIST,
    false
  );
  
  const { data: userRoadmapsData, loading: userRoadmapsLoading, refetch: refetchUserRoadmaps } = useQuery(
    user?.id ? `${GET_USER_ROADMAPS}/${user.id}` : null,
    !user?.id
  );
  
  // Mutations
  const { mutate: updateProgress } = useMutation();
  const { mutate: updateGamification } = useMutation();
  const { mutate: joinRoadmap } = useMutation();
  
  // Set up gamification state
  const [gamification, setGamification] = useState({
    xp: 0,
    badge: 'Beginner',
    nextBadge: 'Explorer',
    xpToNextBadge: 50,
    badgeProgress: 0,
    streak: 0,
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
        streak: gamificationData.data.streak || 0,
      });
      
      if (gamificationData.data.recent_activities) {
        setRecentActivities(gamificationData.data.recent_activities);
      }
      
      if (gamificationData.data.achievements) {
        setAchievements(gamificationData.data.achievements);
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
  
  // Personalized roadmap data processing removed as it's no longer needed
  
  // Process all roadmaps data when it loads
  useEffect(() => {
    if (allRoadmapsData?.data) {
      // Ensure we're setting an array to availableRoadmaps
      const roadmapsArray = Array.isArray(allRoadmapsData.data) 
        ? allRoadmapsData.data 
        : allRoadmapsData.data.roadmaps || [];
      
      setAvailableRoadmaps(roadmapsArray);
      console.log('Available roadmaps:', roadmapsArray);
    }
  }, [allRoadmapsData]);
  
  // Process user roadmaps data when it loads
  useEffect(() => {
    if (userRoadmapsData?.data) {
      // Handle different possible data structures
      const roadmapsArray = Array.isArray(userRoadmapsData.data) 
        ? userRoadmapsData.data 
        : userRoadmapsData.data.roadmaps || [];
      
      setUserRoadmaps(roadmapsArray);
      
      // Create a set of roadmap IDs that the user has already joined
      const joinedIds = new Set(roadmapsArray.map(roadmap => roadmap.roadmap_id || roadmap.id));
      setJoinedRoadmapIds(joinedIds);
      
      console.log('User roadmaps:', roadmapsArray);
    }
  }, [userRoadmapsData]);
  
  // Process recommended roadmaps data when it loads
  useEffect(() => {
    if (recommendedData?.data?.recommendations) {
      setRecommendedRoadmaps(recommendedData.data.recommendations);
    }
  }, [recommendedData]);
  
  // Process trending roadmaps data when it loads
  useEffect(() => {
    if (trendingData?.data?.trending) {
      setTrendingRoadmaps(trendingData.data.trending);
    }
  }, [trendingData]);
  
  // Leaderboard data processing is disabled for now
  useEffect(() => {
    // Initialize with empty array
    setLeaderboard([]);
  }, []);
  
  // Process achievements list data when it loads
  useEffect(() => {
    if (achievementsListData?.data) {
      setAchievementsList(achievementsListData.data);
    }
  }, [achievementsListData]);
  
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
      case 'share_resource': return 'Shared a learning resource';
      case 'help_peer': return 'Helped a fellow learner';
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
    if (!roadmapId) {
      console.error('No roadmap ID provided');
      return;
    }
    
    // Store the selected roadmap ID in localStorage for persistence
    localStorage.setItem('selectedRoadmapId', roadmapId);
    
    console.log('Starting roadmap with ID:', roadmapId);
    navigate(`/home/learner/roadmap?id=${roadmapId}`);
  };
  
  // Join a roadmap
  const handleJoinRoadmap = async (roadmapId) => {
    if (!roadmapId || !user?.id) {
      console.error('Missing roadmap ID or user ID');
      return;
    }
    
    try {
      // Call the API to join the roadmap
      const response = await joinRoadmap({
        url: JOIN_ROADMAP,
        method: 'POST',
        data: {
          user_id: user.id,
          roadmap_id: roadmapId
        }
      });
      
      console.log('Joined roadmap:', response);
      
      // Show success message
      toast.success('Joined roadmap successfully!');
      
      // Refresh user roadmaps
      refetchUserRoadmaps();
      
      // Update the set of joined roadmap IDs
      setJoinedRoadmapIds(prev => new Set([...prev, roadmapId]));
    } catch (error) {
      console.error('Failed to join roadmap:', error);
      toast.error('Failed to join roadmap. Please try again.');
    }
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
            <Tabs defaultValue="overview" className="mt-1">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
                <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-5">
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
                
                {/* Login Streak */}
                <div className="flex items-center gap-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <div className="p-2 rounded-full bg-amber-500 text-white">
                    <Flame className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Login Streak</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xl font-bold">{gamification.streak} {gamification.streak === 1 ? 'day' : 'days'}</p>
                      {gamification.streak >= 3 && (
                        <Badge variant="secondary" className="text-xs">On Fire! 🔥</Badge>
                      )}
                    </div>
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
              </TabsContent>
              
              <TabsContent value="achievements" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {achievements.length > 0 ? (
                    achievements.map((achievement) => {
                      const achievementDetails = achievementsList.find(a => a.id === achievement.achievement_id) || {};
                      return (
                        <div key={achievement.achievement_id} className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="p-2 rounded-full bg-green-500 text-white">
                            {achievementDetails.icon === 'Trophy' && <Trophy className="h-5 w-5" />}
                            {achievementDetails.icon === 'Star' && <Star className="h-5 w-5" />}
                            {achievementDetails.icon === 'Award' && <Award className="h-5 w-5" />}
                            {achievementDetails.icon === 'Calendar' && <Calendar className="h-5 w-5" />}
                            {achievementDetails.icon === 'MessageCircle' && <MessageCircle className="h-5 w-5" />}
                            {achievementDetails.icon === 'Footprints' && <Footprints className="h-5 w-5" />}
                            {achievementDetails.icon === 'HandHelping' && <HandHelping className="h-5 w-5" />}
                            {achievementDetails.icon === 'Share2' && <Share2 className="h-5 w-5" />}
                            {achievementDetails.icon === 'Zap' && <Zap className="h-5 w-5" />}
                            {!achievementDetails.icon && <Medal className="h-5 w-5" />}
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{achievementDetails.name || 'Achievement'}</p>
                            <p className="text-xs text-muted-foreground">{achievementDetails.description || 'Unlocked achievement'}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-2 text-center py-6 bg-muted/20 rounded-lg">
                      <Medal className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                      <h3 className="text-base font-semibold mb-1">No Achievements Yet</h3>
                      <p className="text-sm text-muted-foreground">
                        Complete learning activities to earn achievements
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-semibold mb-3">Available Achievements</h4>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                    {achievementsList.length > 0 ? (
                      achievementsList.map((achievement) => {
                        const isUnlocked = achievements.some(a => a.achievement_id === achievement.id);
                        return (
                          <div key={achievement.id} className="flex items-center gap-2 text-sm py-2 border-b border-muted last:border-0">
                            <div className={`p-1 rounded-full ${isUnlocked ? 'bg-green-500' : 'bg-muted'} text-white`}>
                              {achievement.icon === 'Trophy' && <Trophy className="h-3.5 w-3.5" />}
                              {achievement.icon === 'Star' && <Star className="h-3.5 w-3.5" />}
                              {achievement.icon === 'Award' && <Award className="h-3.5 w-3.5" />}
                              {achievement.icon === 'Calendar' && <Calendar className="h-3.5 w-3.5" />}
                              {achievement.icon === 'MessageCircle' && <MessageCircle className="h-3.5 w-3.5" />}
                              {achievement.icon === 'Footprints' && <Footprints className="h-3.5 w-3.5" />}
                              {achievement.icon === 'HandHelping' && <HandHelping className="h-3.5 w-3.5" />}
                              {achievement.icon === 'Share2' && <Share2 className="h-3.5 w-3.5" />}
                              {achievement.icon === 'Zap' && <Zap className="h-3.5 w-3.5" />}
                              {!achievement.icon && <Medal className="h-3.5 w-3.5" />}
                            </div>
                            <span className="flex-1">{achievement.name}</span>
                            {isUnlocked ? (
                              <Badge variant="success" className="text-xs">Unlocked</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">{achievement.threshold} to unlock</Badge>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-muted-foreground">No achievements available</p>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="leaderboard" className="space-y-4">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" /> Top Learners
                </h4>
                
                <div className="text-center py-6 bg-muted/20 rounded-lg">
                  <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-base font-semibold mb-1">Leaderboard Coming Soon</h3>
                  <p className="text-sm text-muted-foreground">
                    The leaderboard feature is currently under development.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
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
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview" onClick={() => setActiveTab('overview')}>Overview</TabsTrigger>
              <TabsTrigger value="explore" onClick={() => setActiveTab('explore')}>Explore</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">Your Joined Roadmaps</h3>
                
                {userRoadmapsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : userRoadmaps && userRoadmaps.length > 0 ? (
                  <div className="space-y-6">
                    {userRoadmaps.map((roadmap) => (
                      <Card key={roadmap.id || roadmap.roadmap_id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <CardTitle>{roadmap.title || 'Learning Path'}</CardTitle>
                            <Badge variant={roadmap.progress >= 100 ? "success" : "secondary"} className="gap-1">
                              {roadmap.progress >= 100 ? (
                                <CheckCircle className="h-3.5 w-3.5" />
                              ) : (
                                <Clock className="h-3.5 w-3.5" />
                              )}
                              <span>{roadmap.progress || 0}% Complete</span>
                            </Badge>
                          </div>
                          <CardDescription>{roadmap.description || 'No description available'}</CardDescription>
                        </CardHeader>
                        
                        <CardContent>
                          <div className="space-y-4">
                            <Progress value={roadmap.progress || 0} className="h-2" />
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>{roadmap.duration_weeks || roadmap.weeks || '8'} weeks</span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>{roadmap.weekly_hours || '5-10'} hours/week</span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-sm">
                                <Trophy className="h-4 w-4 text-muted-foreground" />
                                <span>{roadmap.difficulty || 'Intermediate'}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                        
                        <CardFooter className="bg-muted/20 pt-2">
                          <Button 
                            className="w-full md:w-auto"
                            onClick={() => {
                              // Determine the correct ID to use
                              const roadmapId = roadmap.roadmap_id || roadmap.id;
                              console.log('Starting roadmap with ID:', roadmapId, 'Full roadmap:', roadmap);
                              handleStartRoadmap(roadmapId);
                            }}
                          >
                            {roadmap.progress > 0 ? 'Continue Learning' : 'Start Learning'} <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-muted/20 rounded-lg">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Roadmaps Joined Yet</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      You haven't joined any learning roadmaps yet. Explore available roadmaps to get started.
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
              <div className="space-y-10">
                {/* Recommended for You Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" /> Recommended for You
                  </h3>
                  
                  {recommendedLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Array.isArray(recommendedRoadmaps) && recommendedRoadmaps.length > 0 ? (
                        recommendedRoadmaps.map((roadmap) => (
                          <Card key={roadmap.id || Math.random()} className="overflow-hidden border-l-4 border-l-primary">
                            <CardHeader className="pb-2">
                              <CardTitle>{roadmap.title || 'Roadmap'}</CardTitle>
                              <CardDescription>
                                <div className="flex items-center gap-1 mb-1">
                                  <Badge variant="outline" className="text-xs">{roadmap.skill_name}</Badge>
                                </div>
                                {roadmap.description || 'No description available'}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-2 mb-4">
                                <Badge variant="secondary">{roadmap.difficulty || 'Intermediate'}</Badge>
                                <Badge variant="outline">{roadmap.duration_weeks || '8'} weeks</Badge>
                                <Badge variant="outline">{roadmap.weekly_hours || '5-10'} hours/week</Badge>
                              </div>
                            </CardContent>
                            <CardFooter className="bg-muted/20 pt-2 flex gap-2">
                              <Button 
                                variant="secondary" 
                                className="flex-1"
                                onClick={() => handleStartRoadmap(roadmap.id)}
                              >
                                Start This Path
                              </Button>
                              
                              {!joinedRoadmapIds.has(roadmap.id) ? (
                                <Button 
                                  variant="outline" 
                                  className="flex-1"
                                  onClick={() => handleJoinRoadmap(roadmap.id)}
                                >
                                  Join
                                </Button>
                              ) : (
                                <Button 
                                  variant="outline" 
                                  className="flex-1"
                                  disabled
                                >
                                  Joined
                                </Button>
                              )}
                            </CardFooter>
                          </Card>
                        ))
                      ) : (
                        <div className="col-span-2 text-center py-8 bg-muted/20 rounded-lg">
                          <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No Recommendations Yet</h3>
                          <p className="text-sm text-muted-foreground mb-6">
                            Complete some roadmaps to get personalized recommendations based on your interests.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Trending Roadmaps Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <BarChart className="h-5 w-5 text-primary" /> Trending Now
                  </h3>
                  
                  {trendingLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Array.isArray(trendingRoadmaps) && trendingRoadmaps.length > 0 ? (
                        trendingRoadmaps.map((roadmap) => (
                          <Card key={roadmap.id || Math.random()} className="overflow-hidden">
                            <CardHeader className="pb-2">
                              <CardTitle className="flex justify-between items-center">
                                <span>{roadmap.title || 'Roadmap'}</span>
                                {roadmap.join_count && (
                                  <Badge variant="secondary" className="text-xs">
                                    {roadmap.join_count} learners
                                  </Badge>
                                )}
                              </CardTitle>
                              <CardDescription>
                                <div className="flex items-center gap-1 mb-1">
                                  <Badge variant="outline" className="text-xs">{roadmap.skill_name}</Badge>
                                </div>
                                {roadmap.description || 'No description available'}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-2 mb-4">
                                <Badge variant="secondary">{roadmap.difficulty || 'Intermediate'}</Badge>
                                <Badge variant="outline">{roadmap.duration_weeks || '8'} weeks</Badge>
                                <Badge variant="outline">{roadmap.weekly_hours || '5-10'} hours/week</Badge>
                              </div>
                            </CardContent>
                            <CardFooter className="bg-muted/20 pt-2 flex gap-2">
                              <Button 
                                variant="secondary" 
                                className="flex-1"
                                onClick={() => handleStartRoadmap(roadmap.id)}
                              >
                                Start This Path
                              </Button>
                              
                              {!joinedRoadmapIds.has(roadmap.id) ? (
                                <Button 
                                  variant="outline" 
                                  className="flex-1"
                                  onClick={() => handleJoinRoadmap(roadmap.id)}
                                >
                                  Join
                                </Button>
                              ) : (
                                <Button 
                                  variant="outline" 
                                  className="flex-1"
                                  disabled
                                >
                                  Joined
                                </Button>
                              )}
                            </CardFooter>
                          </Card>
                        ))
                      ) : (
                        <div className="col-span-2 text-center py-8 bg-muted/20 rounded-lg">
                          <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No Trending Roadmaps</h3>
                          <p className="text-sm text-muted-foreground mb-6">
                            There are no trending roadmaps at the moment. Check back later for popular learning paths.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* All Available Roadmaps Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" /> All Learning Paths
                  </h3>
                  
                  {allRoadmapsLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Array.isArray(availableRoadmaps) && availableRoadmaps.length > 0 ? (
                        availableRoadmaps.map((roadmap) => (
                          <Card key={roadmap.id || Math.random()} className="overflow-hidden">
                            <CardHeader className="pb-2">
                              <CardTitle>{roadmap.title || 'Roadmap'}</CardTitle>
                              <CardDescription>{roadmap.description || 'No description available'}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-2 mb-4">
                                <Badge variant="secondary">{roadmap.difficulty || 'Intermediate'}</Badge>
                                <Badge variant="outline">{roadmap.duration_weeks || '8'} weeks</Badge>
                                <Badge variant="outline">{roadmap.weekly_hours || '5-10'} hours/week</Badge>
                              </div>
                            </CardContent>
                            <CardFooter className="bg-muted/20 pt-2 flex gap-2">
                              <Button 
                                variant="secondary" 
                                className="flex-1"
                                onClick={() => handleStartRoadmap(roadmap.id)}
                              >
                                Start This Path
                              </Button>
                              
                              {!joinedRoadmapIds.has(roadmap.id) ? (
                                <Button 
                                  variant="outline" 
                                  className="flex-1"
                                  onClick={() => handleJoinRoadmap(roadmap.id)}
                                >
                                  Join
                                </Button>
                              ) : (
                                <Button 
                                  variant="outline" 
                                  className="flex-1"
                                  disabled
                                >
                                  Joined
                                </Button>
                              )}
                            </CardFooter>
                          </Card>
                        ))
                      ) : (
                        <div className="col-span-2 text-center py-8">
                          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No Roadmaps Available</h3>
                          <p className="text-sm text-muted-foreground mb-6">
                            There are currently no learning roadmaps available. Please check back later.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default Dashboard;
