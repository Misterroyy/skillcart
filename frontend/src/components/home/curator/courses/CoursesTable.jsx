import React, { useState } from 'react';
import useQuery from '@/hooks/useQuery';
import useMutation from '@/hooks/useMutation';
import { GET_ALL_SKILLS, CREATE_SKILL, CREATE_ROADMAP } from '@/imports/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { useSelector } from 'react-redux';
import { selectUser } from '@/redux/features/user/userSlice';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

function CoursesTable() {
  const user = useSelector(selectUser);
  const [isSkillDialogOpen, setIsSkillDialogOpen] = useState(false);
  const [isRoadmapDialogOpen, setIsRoadmapDialogOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  
  // Form states
  const [skillName, setSkillName] = useState('');
  const [skillDescription, setSkillDescription] = useState('');
  const [roadmapDuration, setRoadmapDuration] = useState('');
  
  // Fetch all skills
  const { data: skillsData, loading: skillsLoading, refetch: refetchSkills } = 
    useQuery(GET_ALL_SKILLS);
  
  // Mutations
  const { mutate: createSkill, loading: createSkillLoading } = useMutation();
  const { mutate: createRoadmap, loading: createRoadmapLoading } = useMutation();
  
  // Handle creating a new skill
  const handleCreateSkill = async () => {
    if (!skillName.trim()) return;
    
    try {
      await createSkill({
        url: CREATE_SKILL,
        method: 'POST',
        data: {
          name: skillName,
          description: skillDescription
        }
      });
      
      setSkillName('');
      setSkillDescription('');
      setIsSkillDialogOpen(false);
      refetchSkills();
    } catch (error) {
      console.error('Failed to create skill:', error);
    }
  };
  
  // Handle creating a new roadmap
  const handleCreateRoadmap = async () => {
    if (!selectedSkill || !roadmapDuration) return;
    
    try {
      await createRoadmap({
        url: CREATE_ROADMAP,
        method: 'POST',
        data: {
          user_id: user.id,
          skill_id: selectedSkill.id,
          duration_weeks: parseInt(roadmapDuration, 10)
        }
      });
      
      setSelectedSkill(null);
      setRoadmapDuration('');
      setIsRoadmapDialogOpen(false);
      refetchSkills();
    } catch (error) {
      console.error('Failed to create roadmap:', error);
    }
  };
  
  // Open roadmap dialog with selected skill
  const openRoadmapDialog = (skill) => {
    setSelectedSkill(skill);
    setIsRoadmapDialogOpen(true);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Skills Management</h1>
          <p className="text-muted-foreground">
            Create and manage skills and learning roadmaps.
          </p>
        </div>
        <Button onClick={() => setIsSkillDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Skill
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
          <CardDescription>
            Manage the skills available on the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {skillsLoading ? (
            <div className="text-center py-4">Loading skills...</div>
          ) : skillsData?.data?.skills?.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {skillsData.data.skills.map((skill) => (
                  <TableRow key={skill.id}>
                    <TableCell className="font-medium">{skill.name}</TableCell>
                    <TableCell>{skill.description}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openRoadmapDialog(skill)}
                          title="Create Roadmap"
                        >
                          <BookOpen className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          title="Edit Skill"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Skills Found</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Start by adding a new skill to the platform.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Add Skill Dialog */}
      <Dialog open={isSkillDialogOpen} onOpenChange={setIsSkillDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Skill</DialogTitle>
            <DialogDescription>
              Create a new skill for learners to explore.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="skill-name">Skill Name</Label>
              <Input
                id="skill-name"
                placeholder="e.g., UI/UX Design"
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skill-description">Description</Label>
              <Input
                id="skill-description"
                placeholder="Brief description of the skill"
                value={skillDescription}
                onChange={(e) => setSkillDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSkillDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSkill} disabled={!skillName.trim() || createSkillLoading}>
              {createSkillLoading ? 'Creating...' : 'Create Skill'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Roadmap Dialog */}
      <Dialog open={isRoadmapDialogOpen} onOpenChange={setIsRoadmapDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Roadmap</DialogTitle>
            <DialogDescription>
              Create a learning roadmap for {selectedSkill?.name || 'this skill'}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="roadmap-duration">Duration (weeks)</Label>
              <Input
                id="roadmap-duration"
                type="number"
                min="1"
                max="52"
                placeholder="e.g., 10"
                value={roadmapDuration}
                onChange={(e) => setRoadmapDuration(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoadmapDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateRoadmap} 
              disabled={!roadmapDuration || createRoadmapLoading}
            >
              {createRoadmapLoading ? 'Creating...' : 'Create Roadmap'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CoursesTable;