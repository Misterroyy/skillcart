const CommonController = require('./commonController');
const CommonModel = require('../models/CommonModel');
const db = require('../config/db');

const ROADMAP_TABLE = 'roadmaps';
const STEP_TABLE = 'roadmap_steps';
const RESOURCE_TABLE = 'resources';
const USER_STEP_PROGRESS_TABLE = 'user_step_progress';

class RoadmapController {
    // Create a new roadmap
    static async createRoadmap(req, res) {
        try {
            const { user_id, skill_id, duration_weeks } = req.body;

            const roadmapData = {
                user_id,
                skill_id,
                duration_weeks
            };

            const id = await CommonController.insertRecord(ROADMAP_TABLE, roadmapData);
            res.status(201).json({ message: 'Roadmap created', roadmap_id: id });
        } catch (error) {
            console.error('Error creating roadmap:', error);
            res.status(500).json({ error: 'Failed to create roadmap' });
        }
    }

    // Get a roadmap with steps and resources
    static async getRoadmapWithDetails(req, res) {
        try {
            const { roadmapId } = req.params;

            const roadmap = await CommonController.getRecordById(ROADMAP_TABLE, roadmapId);
            if (!roadmap) return res.status(404).json({ error: 'Roadmap not found' });

            const steps = await CommonController.getRecords({
                tableName: STEP_TABLE,
                conditions: { roadmap_id: roadmapId },
                orderBy: 'week_number'
            });

            // Fetch resources for each step
            for (let step of steps) {
                const resources = await CommonController.getRecords({
                    tableName: RESOURCE_TABLE,
                    conditions: { step_id: step.id }
                });
                
                // Fetch quiz data for quiz-type resources
                for (let resource of resources) {
                    if (resource.type === 'quiz') {
                        try {
                            const quiz = await CommonModel.findOne('quizzes', { resource_id: resource.id });
                            if (quiz) {
                                // Parse options from JSON string
                                quiz.options = JSON.parse(quiz.options);
                                
                                // For learners, don't send the correct answer
                                const userRole = req.user?.role || 'learner';
                                if (userRole !== 'curator' && userRole !== 'admin') {
                                    delete quiz.correct_answer;
                                }
                                
                                resource.quiz_data = quiz;
                            }
                        } catch (quizError) {
                            console.error('Error fetching quiz data:', quizError);
                        }
                    }
                }
                
                step.resources = resources;
            }

            res.status(200).json({ roadmap, steps });
        } catch (error) {
            console.error('Error fetching roadmap:', error);
            res.status(500).json({ error: 'Failed to fetch roadmap details' });
        }
    }

    // List all roadmaps (admin)
 

    static async listAllRoadmaps(req, res) {
      try {
        const roadmaps = await CommonModel.findAll('roadmaps');
    
        const roadmapsWithSkillInfo = await Promise.all(
          roadmaps.map(async (roadmap) => {
            const skill = await CommonController.getRecordById('skills', roadmap.skill_id);
            return {
              id: roadmap.id,
              user_id: roadmap.user_id,
              duration_weeks: roadmap.duration_weeks,
              created_at: roadmap.created_at,
              title: skill?.name || 'Unknown Skill',
              description: skill?.description || '',
            };
          })
        );
    
        res.status(200).json({ roadmaps: roadmapsWithSkillInfo });
      } catch (error) {
        console.error('Error listing roadmaps:', error);
        res.status(500).json({ error: 'Failed to list roadmaps' });
      }
    }
    
    // Check if a user has completed all steps in a week and award XP
    static async checkWeekCompletion(req, res) {
      try {
        const { user_id, roadmap_id, week_number } = req.body;
        
        if (!user_id || !roadmap_id || !week_number) {
          return res.status(400).json({ error: 'Missing required parameters' });
        }
        
        // Get all steps for this roadmap and week
        const weekSteps = await db(STEP_TABLE)
          .where({ roadmap_id, week_number })
          .select('id');
          
        if (weekSteps.length === 0) {
          return res.status(404).json({ error: 'No steps found for this week' });
        }
        
        const stepIds = weekSteps.map(step => step.id);
        
        // Check if all steps are completed
        const completedSteps = await db(USER_STEP_PROGRESS_TABLE)
          .whereIn('step_id', stepIds)
          .where({ user_id, status: 'completed' })
          .select('step_id');
          
        // If all steps are completed, award XP for week completion
        if (completedSteps.length === stepIds.length) {
          // Check if user has already been awarded for this week
          const existingAward = await db('gamification_history')
            .where({ 
              user_id, 
              activity_type: 'complete_week',
              roadmap_id
            })
            .whereRaw('JSON_EXTRACT(metadata, "$.week_number") = ?', [week_number])
            .first();
            
          if (!existingAward) {
            // Award XP for completing the week
            // Use the gamification controller directly instead of fetch
            const GamificationController = require('./gamificationController');
            
            // Create a mock request and response for the gamification controller
            const mockReq = {
              body: {
                user_id,
                activity_type: 'complete_week',
                roadmap_id,
                metadata: { week_number }
              }
            };
            
            let result = { data: { xp_earned: 25, badge_upgraded: false } };
            
            // Use a promise to capture the response
            const mockRes = {
              status: (code) => ({
                json: (data) => {
                  result = data;
                  return mockRes;
                }
              })
            };
            
            await GamificationController.updateGamification(mockReq, mockRes);
            
            return res.status(200).json({
              message: 'Week completed! XP awarded.',
              completed: true,
              xp_earned: result.data?.xp_earned || 25,
              badge_upgraded: result.data?.badge_upgraded || false
            });
          }
          
          return res.status(200).json({
            message: 'Week already completed',
            completed: true,
            already_awarded: true
          });
        }
        
        return res.status(200).json({
          message: 'Week not yet completed',
          completed: false,
          completed_steps: completedSteps.length,
          total_steps: stepIds.length,
          progress_percentage: Math.round((completedSteps.length / stepIds.length) * 100)
        });
        
      } catch (error) {
        console.error('Error checking week completion:', error);
        res.status(500).json({ error: 'Failed to check week completion' });
      }
    }
    
    // Check if a user has completed all steps in a roadmap and award XP
    static async checkRoadmapCompletion(req, res) {
      try {
        const { user_id, roadmap_id } = req.body;
        
        if (!user_id || !roadmap_id) {
          return res.status(400).json({ error: 'Missing required parameters' });
        }
        
        // Get all steps for this roadmap
        const allSteps = await db(STEP_TABLE)
          .where({ roadmap_id })
          .select('id');
          
        if (allSteps.length === 0) {
          return res.status(404).json({ error: 'No steps found for this roadmap' });
        }
        
        const stepIds = allSteps.map(step => step.id);
        
        // Check if all steps are completed
        const completedSteps = await db(USER_STEP_PROGRESS_TABLE)
          .whereIn('step_id', stepIds)
          .where({ user_id, status: 'completed' })
          .select('step_id');
          
        // If all steps are completed, award XP for roadmap completion
        if (completedSteps.length === stepIds.length) {
          // Check if user has already been awarded for this roadmap
          const existingAward = await db('gamification_history')
            .where({ 
              user_id, 
              activity_type: 'complete_roadmap',
              roadmap_id
            })
            .first();
            
          if (!existingAward) {
            // Award XP for completing the roadmap
            // Use the gamification controller directly instead of fetch
            const GamificationController = require('./gamificationController');
            
            // Create a mock request and response for the gamification controller
            const mockReq = {
              body: {
                user_id,
                activity_type: 'complete_roadmap',
                roadmap_id
              }
            };
            
            let result = { data: { xp_earned: 100, badge_upgraded: false } };
            
            // Use a promise to capture the response
            const mockRes = {
              status: (code) => ({
                json: (data) => {
                  result = data;
                  return mockRes;
                }
              })
            };
            
            await GamificationController.updateGamification(mockReq, mockRes);
            
            return res.status(200).json({
              message: 'Roadmap completed! XP awarded.',
              completed: true,
              xp_earned: result.data?.xp_earned || 100,
              badge_upgraded: result.data?.badge_upgraded || false
            });
          }
          
          return res.status(200).json({
            message: 'Roadmap already completed',
            completed: true,
            already_awarded: true
          });
        }
        
        return res.status(200).json({
          message: 'Roadmap not yet completed',
          completed: false,
          completed_steps: completedSteps.length,
          total_steps: stepIds.length,
          progress_percentage: Math.round((completedSteps.length / stepIds.length) * 100)
        });
        
      } catch (error) {
        console.error('Error checking roadmap completion:', error);
        res.status(500).json({ error: 'Failed to check roadmap completion' });
      }
    }
}

module.exports = RoadmapController;
