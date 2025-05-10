// Authentication Endpoints
export const USERS_REGISTER_REQUEST_OTP = "auth/register";
export const USERS_REGISTER_RESEND_REQUEST_OTP = "auth/resend-otp";
export const USERS_REGISTER = "auth/verify-otp";
export const USERS_LOGIN = "auth/login";

// User Profile Endpoints
export const USER_PROFILE = "users/profile";
export const UPDATE_USER_PROFILE = "users/profile/update";
export const UPDATE_USER_INTERESTS = "users/interests/update";
export const UPDATE_USER_GOALS = "users/goals/update";
export const UPDATE_USER_WEEKLY_TIME = "users/weekly-time/update";

// Roadmap Endpoints
export const GET_ALL_ROADMAPS = "roadmaps";
export const GET_ROADMAP_BY_ID = "roadmaps"; // + /:id
export const CREATE_ROADMAP = "roadmaps";
export const GET_RECOMMENDED_ROADMAPS = "roadmap-personalized/recommended"; // + /:user_id
export const GET_TRENDING_ROADMAPS = "roadmap-personalized/trending";
export const CHECK_WEEK_COMPLETION = "roadmaps/check-week-completion";
export const CHECK_ROADMAP_COMPLETION = "roadmaps/check-roadmap-completion";

// User Roadmap Endpoints
export const JOIN_ROADMAP = "user-roadmaps/join";
export const GET_USER_ROADMAPS = "user-roadmaps"; // + /:userId

// Roadmap Steps Endpoints
export const GET_STEPS_BY_ROADMAP = "steps/roadmap"; // + /:roadmapId
export const ADD_STEP = "steps";

// Resources Endpoints
export const ADD_RESOURCE = "resources";
export const GET_RESOURCES_BY_STEP = "resources/step"; // + /:stepId
export const DELETE_RESOURCE = "resources"; // + /:resourceId

// Progress Endpoints
export const UPDATE_PROGRESS = "progress";
export const GET_USER_PROGRESS = "progress"; // + /:userId

// Discussion Endpoints
export const CREATE_DISCUSSION = "discussions";
export const REPLY_TO_DISCUSSION = "discussions/reply";
export const GET_DISCUSSIONS_BY_STEP = "discussions/step"; // + /:stepId

// Gamification Endpoints
export const UPDATE_GAMIFICATION = "gamification/update";
export const GET_USER_GAMIFICATION = "gamification"; // + /:userId
export const GET_GAMIFICATION_LEADERBOARD = "gamification/leaderboard/top";
export const GET_ACHIEVEMENTS_LIST = "gamification/achievements/list";

// Skills Endpoints
export const GET_ALL_SKILLS = "skills";
export const GET_SKILL_BY_ID = "skills"; // + /:skillId
export const CREATE_SKILL = "skills";

// Signup Options Endpoints
export const GET_AVAILABLE_INTERESTS = "options/interests";
export const GET_AVAILABLE_GOALS = "options/goals";
export const GET_AVAILABLE_TIME_COMMITMENTS = "options/time-commitments";
