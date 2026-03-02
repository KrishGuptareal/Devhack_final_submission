# 📚 Frontend API Documentation Guide

> **Base URL**: `from .env`

## 🔐 Authentication

All endpoints (except `/sign-in` and `/healthcheck`) require a **Bearer Token** from Clerk.

```
Authorization: Bearer <clerk_session_token>
```

---

## 📦 Response Format

All API responses follow this standard format:

```json
{
  "statusCode": 200,
  "data": { /* response data */ },
  "message": "Success message",
  "success": true
}
```

### Error Response Format

```json
{
  "status": "error",
  "message": "Error message",
  "errors": []
}
```

---

## 🔹 Core Routes

### Health Check
| Endpoint | Method | Auth |
|----------|--------|------|
| `/healthcheck` | `GET` | ❌ No |

**Response:**
```json
{
  "status": "success",
  "message": "Router is working!"
}
```

---

## 👤 User Routes

**Base Path**: `/api/v1/users`

### 1. Sync User (Login)

| Endpoint | Method | Auth |
|----------|--------|------|
| `/users/login` | `GET` | ✅ Yes |

**Request Body**: None (reads from Clerk token)

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "ObjectId",
      "clerkId": "user_xxxxx",
      "email": "user@email.com",
      "username": "johndoe",
      "preferences": {
        "defaultStudyMode": "focus",
        "defaultSessionDuration": 45,
        "timezone": "UTC",
        "theme": "auto",
        "notifications": {
          "tasks": true,
          "deadlines": true,
          "dailySummary": true,
          "xpMilestones": true
        }
      },
      "onboardingCompleted": false,
      "createdAt": "ISO Date",
      "updatedAt": "ISO Date"
    }
  },
  "message": "User synced successfully"
}
```

---

### 2. Get Current User

| Endpoint | Method | Auth |
|----------|--------|------|
| `/users/me` | `GET` | ✅ Yes |

**Request Body**: None

**Response:** Same as Sync User

---

### 3. Update Current User

| Endpoint | Method | Auth |
|----------|--------|------|
| `/users/me` | `PATCH` | ✅ Yes |

**Request Body:**
```json
{
  "onboardingCompleted": true,
  "preferences": {
    "defaultMode": "focus",
    "defaultSessionDuration": 60
  }
}
```

> ⚠️ All fields are **optional**

**Response:**
```json
{
  "statusCode": 200,
  "data": { "user": { /* updated user object */ } },
  "message": "User updated successfully"
}
```

---

## 📘 Subject Routes

**Base Path**: `/api/v1/subjects`

### 1. Get All Subjects

| Endpoint | Method | Auth |
|----------|--------|------|
| `/subjects/get-subjects` | `GET` | ✅ Yes |

**Request Body**: None

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "subjects": [
      {
        "_id": "ObjectId",
        "userId": "user_xxxxx",
        "name": "Mathematics",
        "color": "#FF5733",
        "icon": "📐",
        "dailyTimeCommitment": 45,
        "deadline": {
          "date": "2026-03-15T00:00:00.000Z",
          "type": "exam"
        },
        "workloadMultiplier": 1.0,
        "minWorkloadThreshold": 0.5,
        "isActive": true,
        "isArchived": false,
        "createdAt": "ISO Date",
        "updatedAt": "ISO Date"
      }
    ]
  },
  "message": "Subjects fetched successfully"
}
```

---

### 2. Get Subject by ID

| Endpoint | Method | Auth |
|----------|--------|------|
| `/subjects/get-subject/:id` | `GET` | ✅ Yes |

**URL Params:**
- `id` (string) - MongoDB ObjectId of the subject

**Response:**
```json
{
  "statusCode": 200,
  "data": { "subject": { /* subject object */ } },
  "message": "Subject fetched successfully"
}
```

---

### 3. Create Subject

| Endpoint | Method | Auth |
|----------|--------|------|
| `/subjects/create-subject` | `POST` | ✅ Yes |

**Request Body:**
```json
{
  "name": "Physics",
  "color": "#3498DB",
  "icon": "⚛️",
  "dailyTimeCommitment": 60,
  "deadline": {
    "date": "2026-05-20T00:00:00.000Z",
    "type": "exam"
  },
  "workloadMultiplier": 1.2,
  "minWorkloadThreshold": 0.5
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Subject name |
| `color` | string | ❌ | Hex color (auto-generated if not provided) |
| `icon` | string | ❌ | Emoji or icon |
| `dailyTimeCommitment` | number | ✅ | Minutes per day (min: 15) |
| `deadline.date` | Date | ✅ | ISO date string |
| `deadline.type` | string | ✅ | `"exam"` or `"assignment"` |
| `workloadMultiplier` | number | ❌ | 0.5 to 1.5 (default: 1.0) |
| `minWorkloadThreshold` | number | ❌ | Default: 0.5 |

**Response:**
```json
{
  "statusCode": 201,
  "data": { "subject": { /* created subject object */ } },
  "message": "Subject created successfully"
}
```

---

### 4. Update Subject

| Endpoint | Method | Auth |
|----------|--------|------|
| `/subjects/update-subject/:id` | `PUT` | ✅ Yes |

**URL Params:**
- `id` (string) - MongoDB ObjectId

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Subject Name",
  "color": "#E74C3C",
  "icon": "🔬",
  "dailyTimeCommitment": 90,
  "deadline": {
    "date": "2026-06-01T00:00:00.000Z",
    "type": "assignment"
  },
  "workloadMultiplier": 1.3,
  "minWorkloadThreshold": 0.6,
  "isActive": true,
  "isArchived": false
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": { "subject": { /* updated subject object */ } },
  "message": "Subject updated successfully"
}
```

---

### 5. Delete Subject

| Endpoint | Method | Auth |
|----------|--------|------|
| `/subjects/delete-subject/:id` | `DELETE` | ✅ Yes |

**URL Params:**
- `id` (string) - MongoDB ObjectId

**Response:**
```json
{
  "statusCode": 200,
  "data": { "subject": { /* deleted subject object */ } },
  "message": "Subject deleted successfully"
}
```

---

## 🃏 FlashCard Routes

**Base Path**: `/api/v1/flashcards` *(Note: Route not mounted in app.js - add if needed)*

Assuming base path `/api/v1/flashcards`:

### 1. Create FlashCard

| Endpoint | Method | Auth |
|----------|--------|------|
| `/flashcards/create-flashcard` | `POST` | ✅ Yes |

**Request Body:**
```json
{
  "subjectId": "ObjectId",
  "question": "What is Newton's First Law?",
  "answer": "An object at rest stays at rest...",
  "difficulty": "medium"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `subjectId` | ObjectId | ✅ | Reference to a Subject |
| `question` | string | ✅ | Max 500 characters |
| `answer` | string | ✅ | Max 1000 characters |
| `difficulty` | string | ❌ | `"easy"`, `"medium"`, `"hard"` (default: `"medium"`) |

**Response:**
```json
{
  "statusCode": 201,
  "data": {
    "_id": "ObjectId",
    "userId": "user_xxxxx",
    "subjectId": "ObjectId",
    "question": "What is Newton's First Law?",
    "answer": "An object at rest stays at rest...",
    "difficulty": "medium",
    "reviewCount": 0,
    "lastReviewed": null,
    "nextReviewDate": null,
    "createdAt": "ISO Date",
    "updatedAt": "ISO Date"
  },
  "message": "Flash card created successfully"
}
```

---

### 2. Get FlashCards (with Filter)

| Endpoint | Method | Auth |
|----------|--------|------|
| `/flashcards/get-flashcards` | `GET` | ✅ Yes |

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `subjectId` | string | ❌ | Filter by subject |
| `difficulty` | string | ❌ | `"easy"`, `"medium"`, `"hard"` |

**Example**: `/flashcards/get-flashcards?subjectId=123&difficulty=hard`

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "flashCards": [ /* array of flashcard objects */ ]
  },
  "message": "Found 5 flashcards"
}
```

---

### 3. Get FlashCard by ID

| Endpoint | Method | Auth |
|----------|--------|------|
| `/flashcards/get-flashcard/:id` | `GET` | ✅ Yes |

**Response:**
```json
{
  "statusCode": 200,
  "data": { /* flashcard object */ },
  "message": "Flash card fetched successfully"
}
```

---

### 4. Update FlashCard

| Endpoint | Method | Auth |
|----------|--------|------|
| `/flashcards/update-flashcard/:id` | `PUT` | ✅ Yes |

**Request Body:** (all optional)
```json
{
  "question": "Updated question?",
  "answer": "Updated answer.",
  "difficulty": "hard"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": { /* updated flashcard object */ },
  "message": "Flash card updated successfully"
}
```

---

### 5. Delete FlashCard

| Endpoint | Method | Auth |
|----------|--------|------|
| `/flashcards/delete-flashcard/:id` | `DELETE` | ✅ Yes |

**Response:**
```json
{
  "statusCode": 200,
  "data": { /* deleted flashcard object */ },
  "message": "Flash card deleted successfully"
}
```

---

## ✅ Task Routes

**Base Path**: `/api/v1/tasks`

### 1. Generate Daily Tasks

| Endpoint | Method | Auth |
|----------|--------|------|
| `/tasks/generate` | `POST` | ✅ Yes |

**Request Body**: None

> Auto-generates tasks for all active subjects based on their `dailyTimeCommitment` and deadlines.

**Response:**
```json
{
  "statusCode": 201,
  "data": {
    "tasks": [
      {
        "_id": "ObjectId",
        "userId": "user_xxxxx",
        "subjectId": "ObjectId",
        "title": "Mathematics - Study Session",
        "description": "Daily study task for Mathematics",
        "estimatedMinutes": 45,
        "scheduledDate": "2026-01-22T00:00:00.000Z",
        "priority": "high",
        "urgencyScore": 86,
        "status": "pending",
        "completionPercentage": 0,
        "actualMinutesSpent": 0,
        "generatedBy": "system",
        "isRecurring": false,
        "createdAt": "ISO Date",
        "updatedAt": "ISO Date"
      }
    ]
  },
  "message": "Generated 3 tasks for today"
}
```

**Error (if tasks already exist):**
```json
{
  "status": "error",
  "message": "Tasks already generated for today. Use force=true to regenerate."
}
```

---

### 2. Get Today's Tasks

| Endpoint | Method | Auth |
|----------|--------|------|
| `/tasks/today` | `GET` | ✅ Yes |

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | string | ❌ | `"all"`, `"pending"`, `"in_progress"`, `"completed"`, `"skipped"` (default: `"all"`) |

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "tasks": [
      {
        "_id": "ObjectId",
        "subjectId": {
          "_id": "ObjectId",
          "name": "Mathematics",
          "color": "#FF5733"
        },
        "title": "Mathematics - Study Session",
        "estimatedMinutes": 45,
        "priority": "high",
        "status": "pending"
        /* ...other fields */
      }
    ]
  },
  "message": "Found 3 tasks for today"
}
```

---

### 3. Get Task by ID

| Endpoint | Method | Auth |
|----------|--------|------|
| `/tasks/:taskId` | `GET` | ✅ Yes |

**Response:**
```json
{
  "statusCode": 200,
  "data": { "task": { /* task with populated subjectId */ } },
  "message": "Task found"
}
```

---

### 4. Create Custom Task

| Endpoint | Method | Auth |
|----------|--------|------|
| `/tasks/` | `POST` | ✅ Yes |

**Request Body:**
```json
{
  "title": "Review Chapter 5",
  "description": "Go through all examples",
  "estimatedMinutes": 30,
  "scheduledDate": "2026-01-22T00:00:00.000Z",
  "subjectId": "ObjectId"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | ✅ | Task title |
| `description` | string | ❌ | Task description |
| `estimatedMinutes` | number | ✅ | Estimated duration |
| `scheduledDate` | Date | ✅ | ISO date string |
| `subjectId` | ObjectId | ✅ | Reference to Subject |

**Response:**
```json
{
  "statusCode": 201,
  "data": { "task": { /* created task */ } },
  "message": "Task created successfully"
}
```

---

### 5. Update Task

| Endpoint | Method | Auth |
|----------|--------|------|
| `/tasks/:taskId` | `PUT` | ✅ Yes |

**Request Body:** (all optional)
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "estimatedMinutes": 60,
  "scheduledDate": "2026-01-23T00:00:00.000Z",
  "subjectId": "ObjectId"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": { "task": { /* updated task */ } },
  "message": "Task updated successfully"
}
```

---

### 6. Delete Task

| Endpoint | Method | Auth |
|----------|--------|------|
| `/tasks/:taskId` | `DELETE` | ✅ Yes |

**Response:**
```json
{
  "statusCode": 200,
  "data": { "task": { /* deleted task */ } },
  "message": "Task deleted successfully"
}
```

---

### 7. Update Task Status

| Endpoint | Method | Auth |
|----------|--------|------|
| `/tasks/:taskId/status` | `PATCH` | ✅ Yes |

**Request Body:**
```json
{
  "status": "in_progress"
}
```

| Value | Description |
|-------|-------------|
| `pending` | Not started |
| `in_progress` | Currently working |
| `completed` | Finished |
| `skipped` | Skipped for the day |

**Response:**
```json
{
  "statusCode": 200,
  "data": { "task": { /* updated task */ } },
  "message": "Task status updated successfully"
}
```

---

### 8. Update Task Completion Percentage

| Endpoint | Method | Auth |
|----------|--------|------|
| `/tasks/:taskId/completion` | `PATCH` | ✅ Yes |

**Request Body:**
```json
{
  "completionPercentage": 75
}
```

> Value must be between 0 and 100

**Response:**
```json
{
  "statusCode": 200,
  "data": { "task": { /* updated task */ } },
  "message": "Task completion percentage updated successfully"
}
```

---

## ⏱️ Session Routes

**Base Path**: `/api/v1/sessions`

### 1. Start Session

| Endpoint | Method | Auth |
|----------|--------|------|
| `/sessions/start` | `POST` | ✅ Yes |

**Request Body:**
```json
{
  "subjectId": "ObjectId",
  "taskId": "ObjectId",
  "mode": "focus"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `subjectId` | ObjectId | ✅ | Subject to study |
| `taskId` | ObjectId | ❌ | Associated task (optional) |
| `mode` | string | ✅ | `"focus"` or `"free"` |

**Response:**
```json
{
  "statusCode": 201,
  "data": {
    "session": {
      "_id": "ObjectId",
      "userId": "user_xxxxx",
      "subjectId": "ObjectId",
      "taskId": "ObjectId",
      "mode": "focus",
      "startTime": "2026-01-22T10:30:00.000Z",
      "endTime": null,
      "durationMinutes": 0,
      "xpEarned": 0,
      "notes": "",
      "isAbandoned": false,
      "createdAt": "ISO Date",
      "updatedAt": "ISO Date"
    }
  },
  "message": "Session started successfully"
}
```

**Error (already active session):**
```json
{
  "status": "error",
  "message": "You already have an active session!"
}
```

---

### 2. End Session

| Endpoint | Method | Auth |
|----------|--------|------|
| `/sessions/:sessionId/end` | `POST` | ✅ Yes |

**URL Params:**
- `sessionId` (string) - MongoDB ObjectId of the session

**Request Body:**
```json
{
  "notes": "Covered chapters 3-5, need to review integration"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `notes` | string | ❌ | Session notes |

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "session": {
      "_id": "ObjectId",
      "endTime": "2026-01-22T11:15:00.000Z",
      "durationMinutes": 45,
      "xpEarned": 150,
      "notes": "Covered chapters 3-5..."
      /* ...other fields */
    },
    "xpEarned": 150,
    "bonusXP": 25,
    "newLevel": 5
  },
  "message": "Session completed! XP Awarded."
}
```

**Error (session too short):**
```json
{
  "status": "error",
  "message": "Session too short to count!"
}
```
> ⚠️ Minimum 1 minute required

---

### 3. Get Active Session

| Endpoint | Method | Auth |
|----------|--------|------|
| `/sessions/active` | `GET` | ✅ Yes |

**Response (active session exists):**
```json
{
  "statusCode": 200,
  "data": {
    "session": {
      "_id": "ObjectId",
      "subjectId": {
        "_id": "ObjectId",
        "name": "Mathematics",
        "color": "#FF5733"
      },
      "mode": "focus",
      "startTime": "2026-01-22T10:30:00.000Z",
      "endTime": null
      /* ...other fields */
    }
  },
  "message": "Active session check"
}
```

**Response (no active session):**
```json
{
  "statusCode": 200,
  "data": { "session": null },
  "message": "Active session check"
}
```

---

## ⚠️ Common Error Codes

| Status Code | Description |
|-------------|-------------|
| `400` | Bad Request - Invalid input or ID format |
| `401` | Unauthorized - Missing or invalid token |
| `404` | Not Found - Resource doesn't exist or user unauthorized |
| `500` | Internal Server Error |

---

## 🔧 Quick Reference Table

| Module | Endpoint | Method | Description |
|--------|----------|--------|-------------|
| **User** | `/users/login` | GET | Sync/Login user |
| | `/users/me` | GET | Get current user |
| | `/users/me` | PATCH | Update user preferences |
| **Subject** | `/subjects/get-subjects` | GET | Get all subjects |
| | `/subjects/get-subject/:id` | GET | Get subject by ID |
| | `/subjects/create-subject` | POST | Create subject |
| | `/subjects/update-subject/:id` | PUT | Update subject |
| | `/subjects/delete-subject/:id` | DELETE | Delete subject |
| **FlashCard** | `/flashcards/get-flashcards` | GET | Get filtered flashcards |
| | `/flashcards/get-flashcard/:id` | GET | Get flashcard by ID |
| | `/flashcards/create-flashcard` | POST | Create flashcard |
| | `/flashcards/update-flashcard/:id` | PUT | Update flashcard |
| | `/flashcards/delete-flashcard/:id` | DELETE | Delete flashcard |
| **Task** | `/tasks/generate` | POST | Generate daily tasks |
| | `/tasks/today` | GET | Get today's tasks |
| | `/tasks/:taskId` | GET | Get task by ID |
| | `/tasks/` | POST | Create custom task |
| | `/tasks/:taskId` | PUT | Update task |
| | `/tasks/:taskId` | DELETE | Delete task |
| | `/tasks/:taskId/status` | PATCH | Update task status |
| | `/tasks/:taskId/completion` | PATCH | Update completion % |
| **Session** | `/sessions/active` | GET | Get active session |
| | `/sessions/start` | POST | Start session |
| | `/sessions/:sessionId/end` | POST | End session |

---

> 📝 **Note**: FlashCard routes need to be mounted in `app.js`. Add:
> ```javascript
> import flashCardRouter from "./src/routes/flashCard.route.js"
> app.use("/api/v1/flashcards", flashCardRouter)
> ```
