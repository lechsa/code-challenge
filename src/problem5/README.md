# Express.js + TypeScript + SQLite CRUD API

A full-featured RESTful API built with Express.js, TypeScript, and SQLite for managing resources with CRUD operations.

## Features

✅ **Full CRUD Operations** - Create, Read, Update, Delete  
✅ **TypeScript** - Type-safe development  
✅ **SQLite Database** - Lightweight embedded database  
✅ **Filtering** - Search and filter resources by category, status, or text  
✅ **RESTful API** - Standard HTTP methods and status codes  
✅ **Error Handling** - Comprehensive error handling  
✅ **CORS Enabled** - Ready for frontend integration  

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
└── server.ts                # Application entry point
```

## Installation

1. **Navigate to the project directory:**
   ```bash
   cd src/problem4
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

### 2. List All Resources
**GET** `/api/resources`

**Query Parameters (all optional):**
- `name` - Filter by resource name (partial match)
- `category` - Filter by exact category
- `status` - Filter by status (active, inactive, archived)
- `created_at` - Filter by creation date (format: YYYY-MM-DD)
- `search` - Search in both name and description (partial match)

**Note:** You can combine multiple query parameters for advanced filtering.

**Examples:**
```bash
# Get all resources
curl http://localhost:3400/api/resources

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

# Combine multiple filters
curl "http://localhost:3400/api/resources?category=technology&status=active&search=api"

# Filter by name and date
curl "http://localhost:3400/api/resources?name=Web&created_at=2025-11-07"
```

**Response (200):**
```json
{
  "success": true,
  "count": 2,
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
  ]
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

**Request Body (all fields optional):**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "category": "business",
  "status": "inactive"
}
```

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

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Missing required fields: name, description, and category are required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Resource not found"
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

## License

ISC
