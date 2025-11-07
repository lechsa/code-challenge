# Express.js + TypeScript + SQLite CRUD API

A full-featured RESTful API built with Express.js, TypeScript, and SQLite for managing resources with CRUD operations.

## Features

✅ **Full CRUD Operations** - Create, Read, Update, Delete  
✅ **TypeScript** - Type-safe development  
✅ **SQLite Database** - Lightweight embedded database  
✅ **Filtering** - Search and filter resources by category, status, or text  
✅ **Pagination** - Efficient data retrieval with page and limit controls  
✅ **Input Validation** - Request validation with Joi  
✅ **Error Handling** - Centralized error handling middleware  
✅ **Rate Limiting** - API protection (100 req/15min)  
✅ **Health Check** - Monitor API and database status  
✅ **Security** - Protection against SQL injection, XSS, HPP, and more  
✅ **RESTful API** - Standard HTTP methods and status codes  
✅ **CORS Enabled** - Ready for frontend integration

## Security Features

🔒 **SQL Injection Protection** - Parameterized queries  
🔒 **XSS Prevention** - Input sanitization and CSP headers  
🔒 **Security Headers** - Helmet middleware (HSTS, CSP, etc.)  
🔒 **Rate Limiting** - Prevents abuse and DoS attacks  
🔒 **Input Validation** - Joi schemas with security checks  
🔒 **HPP Protection** - HTTP Parameter Pollution prevention  
🔒 **Request Size Limits** - 10kb payload limit  
🔒 **CORS Configuration** - Controlled cross-origin access  

See [SECURITY.md](./SECURITY.md) for detailed security documentation.  

## Project Structure

```
src/
├── config/
│   └── database.ts          # Database configuration and initialization
├── models/
│   └── resource.model.ts    # TypeScript interfaces and DTOs
├── services/
│   └── resource.service.ts  # Business logic layer
├── controllers/
│   └── resource.controller.ts # Request handlers
├── routes/
│   └── resource.routes.ts   # API route definitions
├── middleware/
│   ├── validation.ts        # Joi validation schemas
│   └── errorHandler.ts      # Error handling middleware
├── utils/
│   └── security.ts          # Security utility functions
├── types/
│   └── xss-clean.d.ts       # Type declarations
└── server.ts                # Application entry point
```

## Installation

1. **Navigate to the project directory:**
   ```bash
   cd src/problem5
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

4. **Seed the database with dummy data (optional):**
   ```bash
   npm run seed
   ```

## Usage

### Seed Database with Dummy Data
```bash
npm run seed
```
This will populate the database with 20 sample resources across different categories and statuses.

### Clear Database
```bash
npm run clear
```
This will delete all resources from the database.

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Run Production Build
```bash
npm start
```

The server will start on `http://localhost:3400` by default.

## API Testing

### Using REST Client Extension (VS Code)

This project includes comprehensive test files for the REST Client extension:

1. **Install REST Client extension** in VS Code:
   - Extension ID: `humao.rest-client`
   - Or search for "REST Client" in VS Code extensions

2. **Test Files Included:**
   - `api-test.http` - Complete API testing suite (13 sections, 60+ tests)
   - `security-test.http` - Security vulnerability testing (10 sections, 40+ tests)

3. **How to Use:**
   - Open `api-test.http` or `security-test.http` in VS Code
   - Click "Send Request" above any request
   - View responses in a new tab

4. **Test Coverage in `api-test.http`:**
   - ✅ Health check endpoint
   - ✅ CRUD operations (Create, Read, Update, Delete)
   - ✅ Filtering (category, status, name, date, search)
   - ✅ Pagination (page, limit parameters)
   - ✅ Validation errors
   - ✅ Edge cases and error handling
   - ✅ Rate limiting tests

5. **Security Tests in `security-test.http`:**
   - 🔒 SQL injection attempts
   - 🔒 XSS (Cross-Site Scripting) attacks
   - 🔒 HTTP Parameter Pollution
   - 🔒 Large payload attacks
   - 🔒 NoSQL injection (defense in depth)
   - 🔒 Path traversal attempts
   - 🔒 Security headers validation

### Using cURL

All examples in the API Endpoints section below can be run with cURL from your terminal.

## API Endpoints

### Base URL
```
http://localhost:3400/api/resources
```

### 1. Create a Resource
**POST** `/api/resources`

**Request Body:**
```json
{
  "name": "My Resource",
  "description": "A detailed description",
  "category": "technology",
  "status": "active"
}
```

**Validation Rules:**
- `name`: Required, 3-100 characters
- `description`: Required, 10-500 characters
- `category`: Required, string
- `status`: Optional, must be one of: active, inactive, archived

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "My Resource",
    "description": "A detailed description",
    "category": "technology",
    "status": "active",
    "created_at": "2025-11-07 10:30:00",
    "updated_at": "2025-11-07 10:30:00"
  }
}
```

**Validation Error (400):**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    "\"name\" length must be at least 3 characters long",
    "\"description\" is required"
  ]
}
```

### 2. List All Resources (with Pagination)
**GET** `/api/resources`

**Query Parameters:**

**Pagination (optional):**
- `page` - Page number (default: 1, min: 1)
- `limit` - Items per page (default: 10, min: 1, max: 100)

**Filters (all optional):**
- `name` - Filter by resource name (partial match)
- `category` - Filter by exact category
- `status` - Filter by status (active, inactive, archived)
- `created_at` - Filter by creation date (format: YYYY-MM-DD)
- `search` - Search in both name and description (partial match)

**Note:** You can combine pagination with filters for advanced data retrieval.

**Examples:**
```bash
# Get all resources (default: page 1, limit 10)
curl http://localhost:3400/api/resources

# Get page 2 with 5 items per page
curl "http://localhost:3400/api/resources?page=2&limit=5"

# Get page 1 with 20 items per page
curl "http://localhost:3400/api/resources?page=1&limit=20"

# Filter by name (partial match)
curl http://localhost:3400/api/resources?name=API

# Filter by category
curl http://localhost:3400/api/resources?category=technology

# Filter by status
curl http://localhost:3400/api/resources?status=active

# Filter by creation date
curl http://localhost:3400/api/resources?created_at=2025-11-07

# Search in name and description
curl http://localhost:3400/api/resources?search=resource

# Combine filters with pagination
curl "http://localhost:3400/api/resources?category=technology&status=active&page=1&limit=5"

# Filter by name and date with pagination
curl "http://localhost:3400/api/resources?name=Web&created_at=2025-11-07&page=2&limit=10"
```

**Response (200):**
```json
{
  "success": true,
  "filters": {
    "category": "technology",
    "status": "active"
  },
  "data": [
    {
      "id": 1,
      "name": "My Resource",
      "description": "A detailed description",
      "category": "technology",
      "status": "active",
      "created_at": "2025-11-07 10:30:00",
      "updated_at": "2025-11-07 10:30:00"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

### 3. Get Resource by ID
**GET** `/api/resources/:id`

**Example:**
```bash
curl http://localhost:3400/api/resources/1
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "My Resource",
    "description": "A detailed description",
    "category": "technology",
    "status": "active",
    "created_at": "2025-11-07 10:30:00",
    "updated_at": "2025-11-07 10:30:00"
  }
}
```

### 4. Update a Resource
**PUT** `/api/resources/:id`

**Request Body (all fields optional, but at least one required):**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "category": "business",
  "status": "inactive"
}
```

**Validation Rules:**
- At least one field must be provided
- `name`: If provided, 3-100 characters
- `description`: If provided, 10-500 characters
- `status`: If provided, must be one of: active, inactive, archived

**Example:**
```bash
curl -X PUT http://localhost:3400/api/resources/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Resource","status":"inactive"}'
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Updated Resource",
    "description": "A detailed description",
    "category": "technology",
    "status": "inactive",
    "created_at": "2025-11-07 10:30:00",
    "updated_at": "2025-11-07 11:00:00"
  }
}
```

### 5. Delete a Resource
**DELETE** `/api/resources/:id`

**Example:**
```bash
curl -X DELETE http://localhost:3400/api/resources/1
```

**Response (200):**
```json
{
  "success": true,
  "message": "Resource deleted successfully"
}
```

## Testing with cURL

Here's a complete test flow:

```bash
# 1. Create resources
curl -X POST http://localhost:3400/api/resources \
  -H "Content-Type: application/json" \
  -d '{"name":"Web API","description":"RESTful API service","category":"technology","status":"active"}'

curl -X POST http://localhost:3400/api/resources \
  -H "Content-Type: application/json" \
  -d '{"name":"Mobile App","description":"iOS application","category":"mobile","status":"active"}'

# 2. Get all resources
curl http://localhost:3400/api/resources

# 3. Get specific resource
curl http://localhost:3400/api/resources/1

# 4. Filter resources
curl http://localhost:3400/api/resources?category=technology

# 5. Update resource
curl -X PUT http://localhost:3400/api/resources/1 \
  -H "Content-Type: application/json" \
  -d '{"status":"inactive"}'

# 6. Delete resource
curl -X DELETE http://localhost:3400/api/resources/1
```

## Additional Endpoints

### Health Check
**GET** `/health`

Check the API and database status.

**Example:**
```bash
curl http://localhost:3400/health
```

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2025-11-08T10:30:00.000Z",
  "database": "connected",
  "uptime": 3600,
  "memory": {
    "used": "45.2 MB",
    "total": "128.0 MB"
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    "\"name\" length must be at least 3 characters long"
  ]
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "error": "Too many requests, please try again later."
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

## Resource Schema

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | number | auto | - | Unique identifier |
| name | string | yes | - | Resource name |
| description | string | yes | - | Resource description |
| category | string | yes | - | Resource category |
| status | enum | no | active | Status: active, inactive, or archived |
| created_at | datetime | auto | now | Creation timestamp |
| updated_at | datetime | auto | now | Last update timestamp |

## Technologies Used

- **Express.js** - Web framework
- **TypeScript** - Type-safe JavaScript
- **better-sqlite3** - SQLite database driver
- **Joi** - Schema validation
- **express-rate-limit** - Rate limiting middleware
- **Helmet** - Security HTTP headers
- **express-mongo-sanitize** - NoSQL injection prevention
- **xss-clean** - XSS attack prevention
- **hpp** - HTTP Parameter Pollution prevention
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## Database

The SQLite database file (`database.sqlite`) is automatically created in the project root on first run. The database includes:
- Automatic table creation
- Indexes on category, status, and name for better performance
- WAL (Write-Ahead Logging) mode for better concurrency

## Development

The project uses:
- `ts-node-dev` for development with auto-reload
- TypeScript strict mode for type safety
- Separated layers: Models → Services → Controllers → Routes
