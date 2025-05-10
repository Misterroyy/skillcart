import React, { useState } from 'react';
import useQuery from '@/hooks/useQuery';
import useMutation from '@/hooks/useMutation';
import { 
  GET_ALL_ROADMAPS, 
  GET_STEPS_BY_ROADMAP, 
  GET_RESOURCES_BY_STEP,
  ADD_RESOURCE,
  DELETE_RESOURCE
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
import { Select } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Trash, Video, FileText, HelpCircle, BookOpen, ExternalLink } from 'lucide-react';

function ResourceManager() {
  const [selectedRoadmapId, setSelectedRoadmapId] = useState(null);
  const [selectedStepId, setSelectedStepId] = useState(null);
  const [showAddResourceForm, setShowAddResourceForm] = useState(false);
  
  // Form states
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  const [resourceType, setResourceType] = useState('article');
  
  // Fetch all roadmaps
  const { data: roadmapsData, loading: roadmapsLoading } = useQuery(GET_ALL_ROADMAPS);
  
  // Fetch steps for selected roadmap
  const { data: stepsData, loading: stepsLoading } = useQuery(
    selectedRoadmapId ? `${GET_STEPS_BY_ROADMAP}/${selectedRoadmapId}` : null,
    !selectedRoadmapId
  );
  
  // Fetch resources for selected step
  const { data: resourcesData, loading: resourcesLoading, refetch: refetchResources } = useQuery(
    selectedStepId ? `${GET_RESOURCES_BY_STEP}/${selectedStepId}` : null,
    !selectedStepId
  );
  
  // Mutations
  const { mutate: addResource, loading: addResourceLoading } = useMutation();
  const { mutate: deleteResource, loading: deleteResourceLoading } = useMutation();
  
  // Handle adding a new resource
  const handleAddResource = async (e) => {
    e.preventDefault();
    if (!resourceTitle.trim() || !resourceUrl.trim() || !selectedStepId) return;
    
    try {
      await addResource({
        url: ADD_RESOURCE,
        method: 'POST',
        data: {
          step_id: selectedStepId,
          type: resourceType,
          title: resourceTitle,
          url: resourceUrl
        }
      });
      
      // Reset form
      setResourceTitle('');
      setResourceUrl('');
      setResourceType('article');
      setShowAddResourceForm(false);
      refetchResources();
    } catch (error) {
      console.error('Failed to add resource:', error);
    }
  };
  
  // Handle deleting a resource
  const handleDeleteResource = async (resourceId) => {
    if (!resourceId) return;
    
    try {
      await deleteResource({
        url: `${DELETE_RESOURCE}/${resourceId}`,
        method: 'DELETE'
      });
      
      refetchResources();
    } catch (error) {
      console.error('Failed to delete resource:', error);
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Learning Resources</h1>
          <p className="text-muted-foreground">
            Manage learning resources for each roadmap step.
          </p>
        </div>
        {selectedStepId && (
          <Button onClick={() => setShowAddResourceForm(true)} disabled={showAddResourceForm}>
            <Plus className="mr-2 h-4 w-4" /> Add Resource
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Select Content</CardTitle>
            <CardDescription>
              Choose a roadmap and step to manage resources
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Roadmaps</h3>
              {roadmapsLoading ? (
                <div className="text-center py-2">Loading...</div>
              ) : roadmapsData?.data?.roadmaps?.length > 0 ? (
                <div className="space-y-1">
                  {roadmapsData.data.roadmaps.map(roadmap => (
                    <Button
                      key={roadmap.id}
                      variant={selectedRoadmapId === roadmap.id ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => {
                        setSelectedRoadmapId(roadmap.id);
                        setSelectedStepId(null);
                        setShowAddResourceForm(false);
                      }}
                    >
                      {roadmap.title || `Roadmap ${roadmap.id}`}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-sm text-muted-foreground">No roadmaps found</p>
                </div>
              )}
            </div>
            
            {selectedRoadmapId && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Steps</h3>
                {stepsLoading ? (
                  <div className="text-center py-2">Loading...</div>
                ) : stepsData?.data?.steps?.length > 0 ? (
                  <div className="space-y-1 max-h-[300px] overflow-y-auto">
                    {stepsData.data.steps.map(step => (
                      <Button
                        key={step.id}
                        variant={selectedStepId === step.id ? "default" : "ghost"}
                        className="w-full justify-start text-sm"
                        onClick={() => {
                          setSelectedStepId(step.id);
                          setShowAddResourceForm(false);
                        }}
                      >
                        {step.title || `Step ${step.id}`}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-sm text-muted-foreground">No steps found</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="md:col-span-9">
          <CardHeader>
            <CardTitle>
              {selectedStepId ? 'Learning Resources' : 'Select a Step'}
            </CardTitle>
            <CardDescription>
              {selectedStepId 
                ? 'Manage the learning resources for this step' 
                : 'Please select a roadmap and step from the left panel'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showAddResourceForm && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Add New Resource</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddResource} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="resource-title">Resource Title</Label>
                        <Input
                          id="resource-title"
                          placeholder="e.g., Introduction to UI Design"
                          value={resourceTitle}
                          onChange={(e) => setResourceTitle(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="resource-type">Resource Type</Label>
                        <select
                          id="resource-type"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={resourceType}
                          onChange={(e) => setResourceType(e.target.value)}
                        >
                          <option value="article">Article</option>
                          <option value="video">Video</option>
                          <option value="quiz">Quiz</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="resource-url">Resource URL</Label>
                      <Input
                        id="resource-url"
                        placeholder="https://example.com/resource"
                        value={resourceUrl}
                        onChange={(e) => setResourceUrl(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowAddResourceForm(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={!resourceTitle.trim() || !resourceUrl.trim() || addResourceLoading}
                      >
                        {addResourceLoading ? 'Adding...' : 'Add Resource'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
            
            {selectedStepId ? (
              resourcesLoading ? (
                <div className="text-center py-4">Loading resources...</div>
              ) : resourcesData?.data?.resources?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resourcesData.data.resources.map(resource => (
                      <TableRow key={resource.id}>
                        <TableCell>
                          <div className="flex items-center">
                            {getResourceIcon(resource.type)}
                            <span className="ml-2 capitalize">{resource.type}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{resource.title}</TableCell>
                        <TableCell>
                          <a 
                            href={resource.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center text-blue-600 hover:underline"
                          >
                            <span className="truncate max-w-[200px]">{resource.url}</span>
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteResource(resource.id)}
                            disabled={deleteResourceLoading}
                            title="Delete Resource"
                          >
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Resources Found</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Start by adding learning resources to this step.
                  </p>
                </div>
              )
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Step Selected</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Please select a roadmap and step from the left panel to manage resources.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ResourceManager;
