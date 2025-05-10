import React, { useState, useEffect } from 'react';
import useQuery from '@/hooks/useQuery';
import useMutation from '@/hooks/useMutation';
import { 
  GET_ALL_ROADMAPS, 
  GET_STEPS_BY_ROADMAP, 
  ADD_STEP 
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
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Pencil, BookOpen } from 'lucide-react';

function RoadmapStepManager() {
  const [selectedRoadmapId, setSelectedRoadmapId] = useState(null);
  const [showAddStepForm, setShowAddStepForm] = useState(false);
  
  // Form states
  const [stepTitle, setStepTitle] = useState('');
  const [stepDescription, setStepDescription] = useState('');
  const [weekNumber, setWeekNumber] = useState('');
  
  // Fetch all roadmaps
  const { data: roadmapsData, loading: roadmapsLoading } = useQuery(GET_ALL_ROADMAPS);
  
  // Fetch steps for selected roadmap
  const { data: stepsData, loading: stepsLoading, refetch: refetchSteps } = useQuery(
    selectedRoadmapId ? `${GET_STEPS_BY_ROADMAP}/${selectedRoadmapId}` : null,
    !selectedRoadmapId
  );
  
  // Mutation for adding steps
  const { mutate: addStep, loading: addStepLoading } = useMutation();
  
  // Handle adding a new step
  const handleAddStep = async (e) => {
    e.preventDefault();
    if (!stepTitle.trim() || !weekNumber || !selectedRoadmapId) return;
    
    try {
      await addStep({
        url: ADD_STEP,
        method: 'POST',
        data: {
          roadmap_id: selectedRoadmapId,
          week_number: parseInt(weekNumber, 10),
          title: stepTitle,
          description: stepDescription
        }
      });
      
      // Reset form
      setStepTitle('');
      setStepDescription('');
      setWeekNumber('');
      setShowAddStepForm(false);
      refetchSteps();
    } catch (error) {
      console.error('Failed to add step:', error);
    }
  };
  
  // Group steps by week
  const groupStepsByWeek = () => {
    if (!stepsData?.data?.steps) return [];
    
    const steps = stepsData.data.steps;
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
    })).sort((a, b) => a.week - b.week);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Roadmap Steps</h1>
          <p className="text-muted-foreground">
            Manage learning steps for each roadmap.
          </p>
        </div>
        {selectedRoadmapId && (
          <Button onClick={() => setShowAddStepForm(true)} disabled={showAddStepForm}>
            <Plus className="mr-2 h-4 w-4" /> Add Step
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Select Roadmap</CardTitle>
            <CardDescription>
              Choose a roadmap to manage its steps
            </CardDescription>
          </CardHeader>
          <CardContent>
            {roadmapsLoading ? (
              <div className="text-center py-4">Loading roadmaps...</div>
            ) : roadmapsData?.data?.roadmaps?.length > 0 ? (
              <div className="space-y-2">
                {roadmapsData.data.roadmaps.map(roadmap => (
                  <Button
                    key={roadmap.id}
                    variant={selectedRoadmapId === roadmap.id ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => {
                      setSelectedRoadmapId(roadmap.id);
                      setShowAddStepForm(false);
                    }}
                  >
                    {roadmap.title || `Roadmap ${roadmap.id}`}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">No roadmaps found</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>
              {selectedRoadmapId ? 'Roadmap Steps' : 'Select a Roadmap'}
            </CardTitle>
            <CardDescription>
              {selectedRoadmapId 
                ? 'Manage the learning steps for this roadmap' 
                : 'Please select a roadmap from the left panel'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showAddStepForm && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Add New Step</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddStep} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="step-title">Step Title</Label>
                        <Input
                          id="step-title"
                          placeholder="e.g., Introduction to UI Design"
                          value={stepTitle}
                          onChange={(e) => setStepTitle(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="week-number">Week Number</Label>
                        <Input
                          id="week-number"
                          type="number"
                          min="1"
                          placeholder="e.g., 1"
                          value={weekNumber}
                          onChange={(e) => setWeekNumber(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="step-description">Description</Label>
                      <Input
                        id="step-description"
                        placeholder="Brief description of this step"
                        value={stepDescription}
                        onChange={(e) => setStepDescription(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowAddStepForm(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={!stepTitle.trim() || !weekNumber || addStepLoading}
                      >
                        {addStepLoading ? 'Adding...' : 'Add Step'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
            
            {selectedRoadmapId ? (
              stepsLoading ? (
                <div className="text-center py-4">Loading steps...</div>
              ) : groupStepsByWeek().length > 0 ? (
                <div className="space-y-6">
                  {groupStepsByWeek().map(weekGroup => (
                    <div key={weekGroup.week} className="space-y-2">
                      <h3 className="text-lg font-medium">Week {weekGroup.week}</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {weekGroup.steps.map(step => (
                            <TableRow key={step.id}>
                              <TableCell className="font-medium">{step.title}</TableCell>
                              <TableCell>{step.description}</TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    title="Edit Step"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Steps Found</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Start by adding steps to this roadmap.
                  </p>
                </div>
              )
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Roadmap Selected</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Please select a roadmap from the left panel to manage its steps.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default RoadmapStepManager;
