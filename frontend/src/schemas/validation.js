import * as yup from 'yup';

// Common field validations
export const emailSchema = yup
  .string()
  .email('Please enter a valid email')
  .required('Email is required');

export const passwordSchema = yup
  .string()
  .min(6, 'Password must be at least 6 characters')
  .required('Password is required');

export const nameSchema = yup
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters')
  .required('Name is required');

export const phoneSchema = yup
  .string()
  .matches(/^[0-9]+$/, 'Phone number must only contain digits')
  .min(10, 'Phone number must be at least 10 digits')
  .max(15, 'Phone number must be less than 15 digits');

// Form Schemas
export const loginSchema = yup.object().shape({
  email: emailSchema,
  password: passwordSchema,
});

export const registerSchema = yup.object().shape({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  role: yup
    .string()
    .oneOf(['learner', 'curator'], 'Please select a valid role')
    .required('Role is required'),
  interests: yup.string().when('role', {
    is: 'learner',
    then: () => yup.string().required('Interests are required for learners')
  }),
  goals: yup.string().when('role', {
    is: 'learner',
    then: () => yup.string().required('Goals are required for learners')
  }),
  weekly_time: yup.number().when('role', {
    is: 'learner',
    then: () => yup.number().min(1, 'Weekly time must be at least 1 hour').required('Weekly time is required for learners')
  }),
});

export const forgotPasswordSchema = yup.object().shape({
  email: emailSchema,
});

export const resetPasswordSchema = yup.object().shape({
  password: passwordSchema,
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

