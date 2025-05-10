import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { registerSchema } from "../../schemas/validation";
import useMutation from "@/hooks/useMutation";
import useQuery from "@/hooks/useQuery";
import { 
  USERS_REGISTER_REQUEST_OTP, 
  GET_AVAILABLE_INTERESTS, 
  GET_AVAILABLE_GOALS, 
  GET_AVAILABLE_TIME_COMMITMENTS 
} from "@/imports/api";
import { showToast } from '@/utils/toast';
import { BookOpen, GraduationCap, Clock, Target, Sparkles, ChevronRight, Check } from 'lucide-react';

function Signup() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [roleType, setRoleType] = useState('learner');
  const [availableInterests, setAvailableInterests] = useState([]);
  const [availableGoals, setAvailableGoals] = useState([]);
  const [availableTimeCommitments, setAvailableTimeCommitments] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const { mutate, loading } = useMutation();
  const { data: queryData, isLoading: queryLoading, refetch } = useQuery();
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    trigger,
  } = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: "learner",
      interests: "",
      goals: "",
      weekly_time: 5,
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });
  
  // Watch the role field to conditionally render learner fields
  const selectedRole = watch("role");

  // Focus first input on component mount
  useEffect(() => {
    const firstInput = document.querySelector("[data-first-name-input]");
    if (firstInput) {
      firstInput.focus();
    }
  }, []);

  // Set default options for interests, goals, and time commitments
  useEffect(() => {
    if (step === 2 && selectedRole === 'learner') {
      // Since we're having issues with the API, let's use default options for now
      setLoadingOptions(true);
      
      // Set default options
      setTimeout(() => {
        setAvailableInterests([
          { id: 1, name: 'Web Development' },
          { id: 2, name: 'UI/UX Design' },
          { id: 3, name: 'Data Science' },
          { id: 4, name: 'Mobile Development' },
          { id: 5, name: 'DevOps' },
          { id: 6, name: 'Machine Learning' }
        ]);
        
        setAvailableGoals([
          { id: 1, name: 'Career Change' },
          { id: 2, name: 'Skill Enhancement' },
          { id: 3, name: 'Personal Project' },
          { id: 4, name: 'Academic Requirement' }
        ]);
        
        setAvailableTimeCommitments([
          { id: 1, hours: 5, label: '5 hours/week (Casual)' },
          { id: 2, hours: 10, label: '10 hours/week (Part-time)' },
          { id: 3, hours: 20, label: '20 hours/week (Dedicated)' },
          { id: 4, hours: 40, label: '40 hours/week (Full-time)' }
        ]);
        
        setLoadingOptions(false);
      }, 1000); // Simulate API delay
    }
  }, [step, selectedRole]);

  // Handle next step in the form
  const handleNextStep = async () => {
    // Validate current step fields
    let fieldsToValidate = [];
    
    if (step === 1) {
      fieldsToValidate = ['firstName', 'lastName', 'email'];
    } else if (step === 2) {
      fieldsToValidate = ['role'];
      if (selectedRole === 'learner') {
        fieldsToValidate.push('interests', 'goals', 'weekly_time');
      }
    }
    
    const isStepValid = await trigger(fieldsToValidate);
    
    if (isStepValid) {
      setStep(step + 1);
    }
  };

  // Handle going back to previous step
  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const onSubmit = async (data) => {
    // Combine firstName and lastName into a single name field
    const tempData = {
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      password: data.password,
      role: data.role,
    }
    
    // Add learner-specific fields if role is learner
    if (data.role === 'learner') {
      tempData.interests = data.interests;
      tempData.goals = data.goals;
      tempData.weekly_time = data.weekly_time;
    }
    
    const response = await mutate({url: USERS_REGISTER_REQUEST_OTP, method: "POST", data: tempData})
    if (response.success) {
      navigate("/auth/verify", { state: { ...tempData } });
    }
  };



  // Role selection card component
  const RoleCard = ({ type, title, description, icon: Icon, selected, onClick }) => {
    const handleClick = () => {
      // Update the form value directly
      setValue("role", type, { shouldValidate: true });
      // Call the onClick handler
      onClick();
    };
    
    return (
      <div 
        className={`relative p-6 rounded-xl border-2 transition-all cursor-pointer ${selected ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'}`}
        onClick={handleClick}
      >
        <div className="flex items-start space-x-4">
          <div className={`p-3 rounded-full ${selected ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
          {selected && (
            <div className="absolute top-4 right-4 h-4 w-4 rounded-full bg-primary"></div>
          )}
        </div>
        <input 
          type="radio" 
          name="role" 
          value={type} 
          className="sr-only" 
          checked={selected}
          readOnly
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <div className="inline-block p-3 rounded-full bg-primary/10 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Join SkillMastery
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-md mx-auto">
            Your personalized learning journey starts here
          </p>
        </div>

        {/* Progress indicator */}
        <div className="relative">
          <div className="overflow-hidden h-2 mb-4 flex rounded bg-muted">
            <div 
              className="bg-primary transition-all duration-500 ease-in-out" 
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between">
            <span className={`text-sm font-medium ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>Personal Info</span>
            <span className={`text-sm font-medium ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>Role & Preferences</span>
            <span className={`text-sm font-medium ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>Security</span>
          </div>
        </div>

        <div className="bg-card p-8 rounded-xl border shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">Personal Information</h2>
                  <p className="text-sm text-muted-foreground">Let's get to know you better</p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <div className="relative">
                      <Input
                        id="firstName"
                        type="text"
                        autoComplete="given-name"
                        {...register("firstName")}
                        data-first-name-input
                        className={`pl-10 ${errors.firstName ? "border-destructive" : ""}`}
                        placeholder="John"
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="text-muted-foreground">👤</span>
                      </div>
                    </div>
                    {errors.firstName && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <div className="relative">
                      <Input
                        id="lastName"
                        type="text"
                        autoComplete="family-name"
                        {...register("lastName")}
                        className={`pl-10 ${errors.lastName ? "border-destructive" : ""}`}
                        placeholder="Doe"
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="text-muted-foreground">👤</span>
                      </div>
                    </div>
                    {errors.lastName && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="email">Email address</Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        {...register("email")}
                        className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                        placeholder="you@example.com"
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="text-muted-foreground">✉️</span>
                      </div>
                    </div>
                    {errors.email && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Role & Preferences */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">Choose Your Path</h2>
                  <p className="text-sm text-muted-foreground">Select your role and learning preferences</p>
                </div>

                <div className="space-y-4">
                  <Label>I want to join as</Label>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <RoleCard
                      type="learner"
                      title="Learner"
                      description="Access personalized learning paths and track your progress"
                      icon={BookOpen}
                      selected={selectedRole === "learner"}
                      onClick={() => {
                        setRoleType("learner");
                        setValue("role", "learner");
                      }}
                    />
                    <RoleCard
                      type="curator"
                      title="Content Curator"
                      description="Create and manage learning paths and resources"
                      icon={GraduationCap}
                      selected={selectedRole === "curator"}
                      onClick={() => {
                        setRoleType("curator");
                        setValue("role", "curator");
                      }}
                    />
                  </div>
                  {errors.role && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.role.message}
                    </p>
                  )}
                </div>

                {selectedRole === "learner" && (
                  <div className="space-y-6 mt-6 p-6 bg-muted/30 rounded-lg border border-muted">
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Learner Preferences</h3>
                      <p className="text-sm text-muted-foreground">Help us personalize your learning experience</p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" /> Select Your Interests
                        </Label>
                        {loadingOptions ? (
                          <div className="flex justify-center py-4">
                            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2">
                            {availableInterests.map((interest) => (
                              <div 
                                key={interest.id}
                                onClick={() => {
                                  const isSelected = selectedInterests.includes(interest.id);
                                  let newSelected;
                                  if (isSelected) {
                                    newSelected = selectedInterests.filter(id => id !== interest.id);
                                  } else {
                                    newSelected = [...selectedInterests, interest.id];
                                  }
                                  setSelectedInterests(newSelected);
                                  setValue('interests', newSelected.map(id => {
                                    const item = availableInterests.find(i => i.id === id);
                                    return item ? item.name : '';
                                  }).join(', '));
                                }}
                                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${selectedInterests.includes(interest.id) ? 'bg-primary/10 border-primary' : 'bg-card border-muted hover:border-primary/50'}`}
                              >
                                {selectedInterests.includes(interest.id) && (
                                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                                )}
                                <span className={selectedInterests.includes(interest.id) ? 'font-medium' : ''}>
                                  {interest.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                        <input
                          type="hidden"
                          {...register("interests")}
                        />
                        {errors.interests && (
                          <p className="text-sm text-destructive mt-1">
                            {errors.interests.message}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-primary" /> Select Your Learning Goals
                        </Label>
                        {loadingOptions ? (
                          <div className="flex justify-center py-4">
                            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2">
                            {availableGoals.map((goal) => (
                              <div 
                                key={goal.id}
                                onClick={() => {
                                  const isSelected = selectedGoals.includes(goal.id);
                                  let newSelected;
                                  if (isSelected) {
                                    newSelected = selectedGoals.filter(id => id !== goal.id);
                                  } else {
                                    newSelected = [...selectedGoals, goal.id];
                                  }
                                  setSelectedGoals(newSelected);
                                  setValue('goals', newSelected.map(id => {
                                    const item = availableGoals.find(i => i.id === id);
                                    return item ? item.name : '';
                                  }).join(', '));
                                }}
                                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${selectedGoals.includes(goal.id) ? 'bg-primary/10 border-primary' : 'bg-card border-muted hover:border-primary/50'}`}
                              >
                                {selectedGoals.includes(goal.id) && (
                                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                                )}
                                <span className={selectedGoals.includes(goal.id) ? 'font-medium' : ''}>
                                  {goal.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                        <input
                          type="hidden"
                          {...register("goals")}
                        />
                        {errors.goals && (
                          <p className="text-sm text-destructive mt-1">
                            {errors.goals.message}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" /> Available Weekly Time
                        </Label>
                        {loadingOptions ? (
                          <div className="flex justify-center py-4">
                            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {availableTimeCommitments.map((timeOption) => (
                              <div 
                                key={timeOption.id}
                                onClick={() => {
                                  setValue('weekly_time', timeOption.hours);
                                }}
                                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${watch('weekly_time') === timeOption.hours ? 'bg-primary/10 border-primary' : 'bg-card border-muted hover:border-primary/50'}`}
                              >
                                {watch('weekly_time') === timeOption.hours && (
                                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                                )}
                                <span className={watch('weekly_time') === timeOption.hours ? 'font-medium' : ''}>
                                  {timeOption.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                        <input
                          type="hidden"
                          {...register("weekly_time", { valueAsNumber: true })}
                        />
                        {errors.weekly_time && (
                          <p className="text-sm text-destructive mt-1">
                            {errors.weekly_time.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Security */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">Secure Your Account</h2>
                  <p className="text-sm text-muted-foreground">Create a strong password to protect your account</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type="password"
                        autoComplete="new-password"
                        {...register("password")}
                        className={`pl-10 ${errors.password ? "border-destructive" : ""}`}
                        placeholder="••••••••"
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="text-muted-foreground">🔒</span>
                      </div>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        {...register("confirmPassword")}
                        className={`pl-10 ${errors.confirmPassword ? "border-destructive" : ""}`}
                        placeholder="••••••••"
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="text-muted-foreground">🔒</span>
                      </div>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between mt-8">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevStep}
                >
                  Back
                </Button>
              ) : (
                <div></div> 
              )}

              {step < 3 ? (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="gap-2"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="gap-2"
                  disabled={loading}
                >
                  {loading ? "Creating account..." : "Create account"}
                </Button>
              )}
            </div>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            to="/auth/login"
            className="font-medium text-primary hover:text-primary/90 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
