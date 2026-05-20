import swaggerJSDoc from 'swagger-jsdoc';
import { API_BASE_URL, SERVER_URL } from './index';

const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'MentWel API',
    description: `
# MentWel Digital Mental Health Platform API

A secure, production-ready REST API powering the MentWel mental health platform.

## Modules
- **Authentication** — Registration, login, password reset, email verification, JWT refresh
- **Assessments** — Mental health self-assessments with scoring and history
- **Chat** — Real-time messaging between users and counselors
- **Mood Tracking** — Daily mood logging and history
- **Therapy Sessions** — Booking, cancellation, and completion of therapy sessions
- **Therapists** — Directory listing, search, and filtering
- **Users** — Profile management and profile picture uploads
- **Resources** — Articles, videos, podcasts, and bookmarks
- **Admin** — Dashboard statistics and user management

## Security Features
- JWT bearer token authentication with refresh tokens
- Rate limiting (5 registration attempts/hour, 100 req/15 min default)
- Nigerian phone number validation (+234XXXXXXXXX)
- Password complexity requirements
- Age verification (18+ only)
- CORS and Helmet security headers

## Supported Regions
- Primary: Nigeria (with local phone validation)
- Additional: Ghana, Kenya, South Africa
    `,
    version: '1.0.0',
    contact: {
      name: 'MentWel Team',
    },
    license: {
      name: 'ISC',
    },
  },
  servers: [
    {
      url: SERVER_URL,
      description: 'Configured server',
    },
    {
      url: 'http://localhost:5000',
      description: 'Local development server',
    },
  ],
  tags: [
    { name: 'Health', description: 'Health check and system diagnostics' },
    { name: 'Auth', description: 'User authentication, registration, and token management' },
    { name: 'Users', description: 'User profile operations' },
    { name: 'Assessments', description: 'Mental health self-assessments' },
    { name: 'Chat', description: 'Counselor messaging sessions' },
    { name: 'Mood', description: 'Daily mood tracking' },
    { name: 'Sessions', description: 'Therapy session management' },
    { name: 'Therapists', description: 'Therapist directory and search' },
    { name: 'Resources', description: 'Educational resources and bookmarks' },
    { name: 'Admin', description: 'Administrative operations' },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"',
      },
    },
    schemas: {
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { type: 'object' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Error message' },
          errors: { type: 'array', items: { type: 'object' } },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 20 },
          total: { type: 'integer', example: 100 },
          totalPages: { type: 'integer', example: 5 },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['password', 'confirmPassword', 'firstName', 'lastName', 'dateOfBirth', 'gender', 'acceptTerms'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com',
            description: 'Valid email address. Provide either email OR phoneNumber (not both).',
          },
          phoneNumber: {
            type: 'string',
            pattern: '^\\+234[789][01]\\d{8}$',
            example: '+2348012345678',
            description: 'Valid Nigerian phone number with country code +234 (11 digits total).',
          },
          password: {
            type: 'string',
            minLength: 8,
            example: 'SecurePass123!',
            description: 'At least 8 characters with: 1 uppercase, 1 lowercase, 1 number, 1 special character',
          },
          confirmPassword: { type: 'string', minLength: 8, example: 'SecurePass123!' },
          firstName: { type: 'string', example: 'John' },
          lastName: { type: 'string', example: 'Doe' },
          dateOfBirth: { type: 'string', format: 'date', example: '1990-01-01' },
          gender: { type: 'string', enum: ['male', 'female', 'other', 'prefer_not_to_say'], example: 'male' },
          country: {
            type: 'string',
            enum: ['Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Other'],
            default: 'Nigeria',
            example: 'Nigeria',
          },
          role: { type: 'string', enum: ['user', 'therapist'], default: 'user' },
          acceptTerms: { type: 'boolean', example: true },
          recaptchaToken: { type: 'string' },
        },
        additionalProperties: false,
      },
      RefreshRequest: {
        type: 'object',
        required: ['refreshToken'],
        properties: { refreshToken: { type: 'string' } },
      },
      LogoutRequest: {
        type: 'object',
        required: ['refreshToken'],
        properties: { refreshToken: { type: 'string' } },
      },
      ForgotPasswordRequest: {
        type: 'object',
        required: ['email'],
        properties: { email: { type: 'string', format: 'email' } },
      },
      ResetPasswordRequest: {
        type: 'object',
        required: ['token', 'password'],
        properties: {
          token: { type: 'string' },
          password: { type: 'string', minLength: 8 },
        },
      },
      ResendVerificationRequest: {
        type: 'object',
        required: ['email'],
        properties: { email: { type: 'string', format: 'email' } },
      },
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          email: { type: 'string', format: 'email', example: 'user@example.com' },
          firstName: { type: 'string', example: 'John' },
          lastName: { type: 'string', example: 'Doe' },
          role: { type: 'string', enum: ['user', 'therapist', 'admin'], example: 'user' },
          phoneNumber: { type: 'string', example: '+2348012345678' },
          isPhoneVerified: { type: 'boolean', example: false },
          isEmailVerified: { type: 'boolean', example: true },
          status: { type: 'string', enum: ['active', 'inactive', 'suspended', 'pending_verification'] },
          dateOfBirth: { type: 'string', format: 'date', example: '1990-01-01' },
          gender: { type: 'string', enum: ['male', 'female', 'other', 'prefer_not_to_say'] },
          country: { type: 'string', enum: ['Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Other'] },
          profilePicture: { type: 'string', example: 'http://localhost:5000/uploads/profile-pictures/abc.png' },
          acceptedTermsAt: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      AuthTokens: {
        type: 'object',
        properties: {
          access: {
            type: 'object',
            properties: {
              token: { type: 'string', example: 'eyJhbGciOi...' },
              expiresIn: { type: 'string', example: '15m' },
            },
          },
          refresh: {
            type: 'object',
            properties: {
              token: { type: 'string', example: 'eyJhbGciOi...' },
              expiresIn: { type: 'string', example: '7d' },
            },
          },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'object',
            properties: {
              user: { $ref: '#/components/schemas/User' },
              tokens: { $ref: '#/components/schemas/AuthTokens' },
            },
          },
        },
      },

      // Assessment schemas
      QuestionOption: {
        type: 'object',
        properties: {
          value: { type: 'integer', example: 1 },
          label: { type: 'string', example: 'Several days' },
        },
      },
      Question: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'q1' },
          text: { type: 'string', example: 'Little interest or pleasure in doing things' },
          type: { type: 'string', enum: ['likert', 'multiple_choice'], example: 'likert' },
          options: { type: 'array', items: { $ref: '#/components/schemas/QuestionOption' } },
        },
      },
      Assessment: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          title: { type: 'string', example: 'PHQ-9 Depression Screening' },
          description: { type: 'string' },
          category: { type: 'string', example: 'depression' },
          questionCount: { type: 'integer', example: 9 },
          estimatedMinutes: { type: 'integer', example: 5 },
          questions: { type: 'array', items: { $ref: '#/components/schemas/Question' } },
        },
      },
      AssessmentSubmitRequest: {
        type: 'object',
        required: ['answers'],
        properties: {
          answers: {
            type: 'object',
            additionalProperties: { type: 'integer' },
            example: { q1: 2, q2: 1, q3: 3 },
          },
        },
      },
      AssessmentResult: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          assessmentId: { type: 'string' },
          assessmentTitle: { type: 'string' },
          score: { type: 'integer', example: 12 },
          maxScore: { type: 'integer', example: 27 },
          percentage: { type: 'integer', example: 44 },
          severity: { type: 'string', enum: ['minimal', 'mild', 'moderate', 'severe'] },
          interpretation: { type: 'string' },
          recommendations: { type: 'array', items: { type: 'string' } },
          completedAt: { type: 'string', format: 'date-time' },
        },
      },

      // Chat schemas
      ChatSession: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          userId: { type: 'string' },
          counselorId: { type: 'string' },
          status: { type: 'string', enum: ['active', 'ended', 'pending'] },
          startedAt: { type: 'string', format: 'date-time' },
          lastMessageAt: { type: 'string', format: 'date-time' },
          counselor: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              avatar: { type: 'string' },
              isOnline: { type: 'boolean' },
            },
          },
          unreadCount: { type: 'integer' },
          lastMessage: { type: 'string' },
        },
      },
      ChatMessage: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          sessionId: { type: 'string' },
          senderId: { type: 'string' },
          senderType: { type: 'string', enum: ['user', 'counselor'] },
          content: { type: 'string' },
          timestamp: { type: 'string', format: 'date-time' },
          read: { type: 'boolean' },
          type: { type: 'string', enum: ['text', 'image', 'file'] },
        },
      },
      SendMessageRequest: {
        type: 'object',
        required: ['content'],
        properties: {
          content: { type: 'string', example: 'Hello, I need some advice.' },
          type: { type: 'string', enum: ['text', 'image', 'file'], default: 'text' },
        },
      },
      StartChatRequest: {
        type: 'object',
        required: ['counselorId'],
        properties: { counselorId: { type: 'string', example: '507f1f77bcf86cd799439011' } },
      },
      AvailableCounselor: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          avatar: { type: 'string' },
          isOnline: { type: 'boolean' },
          lastSeen: { type: 'string', format: 'date-time' },
          specialties: { type: 'array', items: { type: 'string' } },
          rating: { type: 'number' },
          experience: { type: 'integer' },
        },
      },

      // Mood schemas
      MoodEntry: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          mood: { type: 'integer', minimum: 1, maximum: 5, example: 4 },
          note: { type: 'string', example: 'Feeling productive today' },
          date: { type: 'string', example: '2025-05-20' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      MoodEntryRequest: {
        type: 'object',
        required: ['mood', 'date'],
        properties: {
          mood: { type: 'integer', minimum: 1, maximum: 5, example: 4 },
          note: { type: 'string' },
          date: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$', example: '2025-05-20' },
        },
      },

      // Therapy session schemas
      TherapySession: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          user_id: { type: 'string' },
          therapist_id: { type: 'string' },
          scheduled_at: { type: 'string', format: 'date-time' },
          duration: { type: 'integer', example: 60 },
          session_type: { type: 'string', enum: ['text', 'voice', 'video'] },
          status: { type: 'string', enum: ['scheduled', 'completed', 'cancelled'] },
          notes: { type: 'string' },
        },
      },
      CreateSessionRequest: {
        type: 'object',
        required: ['therapist_id', 'scheduled_at'],
        properties: {
          therapist_id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          scheduled_at: { type: 'string', format: 'date-time', example: '2025-06-01T14:00:00.000Z' },
          duration: { type: 'integer', example: 60 },
          session_type: { type: 'string', enum: ['text', 'voice', 'video'], example: 'video' },
        },
      },
      CompleteSessionRequest: {
        type: 'object',
        properties: { notes: { type: 'string' } },
      },

      // Therapist schema
      Therapist: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          first_name: { type: 'string' },
          last_name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          specializations: { type: 'array', items: { type: 'string' } },
          bio: { type: 'string' },
          experience_years: { type: 'integer', example: 8 },
          rating: { type: 'number', example: 4.7 },
          availability: { type: 'boolean' },
          profile_image: { type: 'string' },
        },
      },

      // User profile schemas
      UpdateProfileRequest: {
        type: 'object',
        properties: {
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          phoneNumber: { type: 'string' },
          country: { type: 'string' },
        },
      },
      ChangePasswordRequest: {
        type: 'object',
        required: ['currentPassword', 'newPassword'],
        properties: {
          currentPassword: { type: 'string' },
          newPassword: { type: 'string', minLength: 8 },
        },
      },

      // Resource schemas
      Resource: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          category: { type: 'string' },
          type: { type: 'string', enum: ['article', 'video', 'podcast', 'guide'] },
          url: { type: 'string' },
          thumbnail: { type: 'string' },
          duration: { type: 'string' },
          author: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          isBookmarked: { type: 'boolean' },
        },
      },

      // Admin schemas
      DashboardStats: {
        type: 'object',
        properties: {
          totalUsers: { type: 'integer' },
          activeUsers: { type: 'integer' },
          totalSessions: { type: 'integer' },
          totalAssessments: { type: 'integer' },
          userGrowth: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                date: { type: 'string', example: '2025-05-01' },
                count: { type: 'integer' },
              },
            },
          },
          platformHealth: {
            type: 'object',
            properties: {
              serverStatus: { type: 'string', example: 'ok' },
              responseTime: { type: 'number' },
              errorRate: { type: 'number' },
            },
          },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'System health check',
        description: 'Check if the API server is running and responsive.',
        responses: {
          200: {
            description: 'Server is healthy and operational',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ==================== AUTH ====================
    '/api/v1/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login user',
        description: 'Authenticate a user with email and password.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } },
        },
        responses: {
          200: {
            description: 'Login successful — returns user data and JWT tokens',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } },
          },
          401: { description: 'Invalid email or password' },
          403: { description: 'Email verification required' },
          429: { description: 'Too many login attempts — rate limited' },
        },
      },
    },
    '/api/v1/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        description: 'Create a new user account with email or Nigerian phone number.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } },
        },
        responses: {
          201: {
            description: 'Registration successful',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } },
          },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          409: { description: 'Account already exists' },
          429: { description: 'Rate limit exceeded — 5 registration attempts per hour per IP' },
        },
      },
    },
    '/api/v1/auth/refresh-token': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh access token',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RefreshRequest' } } },
        },
        responses: {
          200: { description: 'New access token issued' },
          401: { description: 'Invalid refresh token' },
        },
      },
    },
    '/api/v1/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout user (invalidate refresh token)',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LogoutRequest' } } },
        },
        responses: { 204: { description: 'Logged out' } },
      },
    },
    '/api/v1/auth/forgot-password': {
      post: {
        tags: ['Auth'],
        summary: 'Request password reset',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ForgotPasswordRequest' } } },
        },
        responses: { 200: { description: 'If email exists, a reset link will be sent' } },
      },
    },
    '/api/v1/auth/reset-password': {
      post: {
        tags: ['Auth'],
        summary: 'Reset password',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ResetPasswordRequest' } } },
        },
        responses: {
          200: { description: 'Password reset successful' },
          400: { description: 'Invalid or expired token' },
        },
      },
    },
    '/api/v1/auth/verify-email/{token}': {
      get: {
        tags: ['Auth'],
        summary: 'Verify email',
        parameters: [{ name: 'token', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          302: { description: 'Redirect to client success/failure page' },
          400: { description: 'Invalid verification token' },
        },
      },
    },
    '/api/v1/auth/resend-verification': {
      post: {
        tags: ['Auth'],
        summary: 'Resend verification email',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ResendVerificationRequest' } } },
        },
        responses: {
          200: { description: 'Verification email sent if account exists and is not verified' },
          400: { description: 'Email already verified' },
        },
      },
    },

    // ==================== ASSESSMENTS ====================
    '/api/v1/assessments': {
      get: {
        tags: ['Assessments'],
        summary: 'Get all assessments',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'List of assessments',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Assessment' } },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/assessments/history': {
      get: {
        tags: ['Assessments'],
        summary: 'Get assessment history for the authenticated user',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'List of assessment results',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/AssessmentResult' } },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/assessments/results/{resultId}': {
      get: {
        tags: ['Assessments'],
        summary: 'Get a single assessment result',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'resultId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Assessment result',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/AssessmentResult' },
                  },
                },
              },
            },
          },
          404: { description: 'Result not found' },
        },
      },
    },
    '/api/v1/assessments/{id}': {
      get: {
        tags: ['Assessments'],
        summary: 'Get an assessment by ID',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Assessment object',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/Assessment' },
                  },
                },
              },
            },
          },
          404: { description: 'Assessment not found' },
        },
      },
    },
    '/api/v1/assessments/{assessmentId}/submit': {
      post: {
        tags: ['Assessments'],
        summary: 'Submit answers for an assessment',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'assessmentId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/AssessmentSubmitRequest' } } },
        },
        responses: {
          200: {
            description: 'Submission processed; returns computed result',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/AssessmentResult' },
                  },
                },
              },
            },
          },
          400: { description: 'Invalid answers' },
          404: { description: 'Assessment not found' },
        },
      },
    },

    // ==================== CHAT ====================
    '/api/v1/chat/sessions': {
      get: {
        tags: ['Chat'],
        summary: 'Get chat sessions for the authenticated user',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'List of chat sessions',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/ChatSession' } },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Chat'],
        summary: 'Start a new chat session with a counselor',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/StartChatRequest' } } },
        },
        responses: {
          201: {
            description: 'Chat session created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/ChatSession' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/chat/sessions/{sessionId}/messages': {
      get: {
        tags: ['Chat'],
        summary: 'Get all messages for a chat session',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'sessionId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'List of messages',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/ChatMessage' } },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Chat'],
        summary: 'Send a message in a chat session',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'sessionId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/SendMessageRequest' } } },
        },
        responses: {
          200: {
            description: 'Message sent',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/ChatMessage' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/chat/sessions/{sessionId}/end': {
      post: {
        tags: ['Chat'],
        summary: 'End a chat session',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'sessionId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Session ended' } },
      },
    },
    '/api/v1/chat/sessions/{sessionId}/read': {
      post: {
        tags: ['Chat'],
        summary: 'Mark messages in a session as read',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'sessionId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Messages marked as read' } },
      },
    },
    '/api/v1/chat/counselors/available': {
      get: {
        tags: ['Chat'],
        summary: 'Get list of available counselors',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'List of available counselors',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/AvailableCounselor' } },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ==================== MOOD ====================
    '/api/v1/mood': {
      get: {
        tags: ['Mood'],
        summary: 'Get mood logs for the authenticated user',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'days',
            in: 'query',
            required: false,
            schema: { type: 'integer', minimum: 1, maximum: 365, default: 30 },
            description: 'Number of days to fetch',
          },
        ],
        responses: {
          200: {
            description: 'List of mood entries',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/MoodEntry' } },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Mood'],
        summary: 'Save a mood entry (upsert by date)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/MoodEntryRequest' } } },
        },
        responses: {
          201: {
            description: 'Mood entry saved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/MoodEntry' },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ==================== THERAPY SESSIONS ====================
    '/api/v1/sessions': {
      get: {
        tags: ['Sessions'],
        summary: 'Get all therapy sessions for the authenticated user',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'List of sessions',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/TherapySession' } },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Sessions'],
        summary: 'Book a new therapy session',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateSessionRequest' } } },
        },
        responses: {
          201: {
            description: 'Session created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/TherapySession' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/sessions/{id}': {
      get: {
        tags: ['Sessions'],
        summary: 'Get a therapy session by ID',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Session object',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/TherapySession' },
                  },
                },
              },
            },
          },
          404: { description: 'Session not found' },
        },
      },
    },
    '/api/v1/sessions/{id}/cancel': {
      patch: {
        tags: ['Sessions'],
        summary: 'Cancel a therapy session',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Session cancelled' } },
      },
    },
    '/api/v1/sessions/{id}/complete': {
      patch: {
        tags: ['Sessions'],
        summary: 'Mark a therapy session as completed',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: false,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CompleteSessionRequest' } } },
        },
        responses: { 200: { description: 'Session completed' } },
      },
    },

    // ==================== THERAPISTS ====================
    '/api/v1/therapists': {
      get: {
        tags: ['Therapists'],
        summary: 'Get all therapists',
        responses: {
          200: {
            description: 'List of therapists',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Therapist' } },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/therapists/search': {
      get: {
        tags: ['Therapists'],
        summary: 'Search therapists by name, specialization, or bio',
        parameters: [
          { name: 'q', in: 'query', required: false, schema: { type: 'string' }, description: 'Search query' },
        ],
        responses: {
          200: {
            description: 'List of matching therapists',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Therapist' } },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/therapists/filter': {
      get: {
        tags: ['Therapists'],
        summary: 'Filter therapists',
        parameters: [
          { name: 'specialization', in: 'query', schema: { type: 'string' } },
          { name: 'minRating', in: 'query', schema: { type: 'number' } },
          { name: 'availability', in: 'query', schema: { type: 'boolean' } },
        ],
        responses: {
          200: {
            description: 'Filtered therapists',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Therapist' } },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/therapists/{id}': {
      get: {
        tags: ['Therapists'],
        summary: 'Get a therapist by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Therapist object',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/Therapist' },
                  },
                },
              },
            },
          },
          404: { description: 'Therapist not found' },
        },
      },
    },

    // ==================== USERS ====================
    '/api/v1/users/profile': {
      put: {
        tags: ['Users'],
        summary: 'Update authenticated user profile',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateProfileRequest' } } },
        },
        responses: {
          200: {
            description: 'Updated user',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/users/change-password': {
      post: {
        tags: ['Users'],
        summary: 'Change password for the authenticated user',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ChangePasswordRequest' } } },
        },
        responses: {
          200: { description: 'Password changed successfully' },
          400: { description: 'Current password incorrect or weak new password' },
        },
      },
    },
    '/api/v1/users/profile-picture': {
      post: {
        tags: ['Users'],
        summary: 'Upload profile picture (jpeg, png, webp, gif up to 5 MB)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: { file: { type: 'string', format: 'binary' } },
                required: ['file'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Profile picture uploaded',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: { profilePicture: { type: 'string' } },
                    },
                  },
                },
              },
            },
          },
          400: { description: 'No file uploaded or invalid file type' },
        },
      },
    },

    // ==================== RESOURCES ====================
    '/api/v1/resources': {
      get: {
        tags: ['Resources'],
        summary: 'List resources (optionally filtered)',
        parameters: [
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'List of resources',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Resource' } },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/resources/bookmarked': {
      get: {
        tags: ['Resources'],
        summary: 'Get all resources bookmarked by the authenticated user',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'List of bookmarked resources',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Resource' } },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/resources/{resourceId}/bookmark': {
      post: {
        tags: ['Resources'],
        summary: 'Bookmark a resource',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'resourceId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Resource bookmarked' } },
      },
      delete: {
        tags: ['Resources'],
        summary: 'Remove a resource bookmark',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'resourceId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Bookmark removed' } },
      },
    },

    // ==================== ADMIN ====================
    '/api/v1/admin/dashboard': {
      get: {
        tags: ['Admin'],
        summary: 'Get dashboard statistics (admin only)',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Dashboard stats',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/DashboardStats' },
                  },
                },
              },
            },
          },
          403: { description: 'Insufficient permissions' },
        },
      },
    },
    '/api/v1/admin/users': {
      get: {
        tags: ['Admin'],
        summary: 'Get paginated list of users (admin only)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Paginated users list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        users: { type: 'array', items: { $ref: '#/components/schemas/User' } },
                        pagination: { $ref: '#/components/schemas/Pagination' },
                      },
                    },
                  },
                },
              },
            },
          },
          403: { description: 'Insufficient permissions' },
        },
      },
    },
  },
};

const options = {
  definition: swaggerDefinition as any,
  apis: ['src/routes/**/*.ts', 'src/controllers/**/*.ts'],
} as any;

export const swaggerSpec = swaggerJSDoc(options);

// API_BASE_URL is exported by ../config for client use; reference here to avoid unused-import warnings.
void API_BASE_URL;
