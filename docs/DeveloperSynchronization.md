# **Developer Synchronization API Documentation**

This document outlines the API for managing Developer Synchronization Records. These records are used to track and synchronize developer-specific metadata, configuration settings, and state across services.

## **1\. Data Model: DeveloperSyncRecord**

A DeveloperSyncRecord represents a single synchronization entry associated with a developer and an external resource or configuration.

### **1.1. Core Fields (Schema)**

| Field Name | Type | Description | Constraints | Fetchable | Writable (POST) | Updatable (PATCH) |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| id | UUID (String) | Unique identifier for the synchronization record. | Read-Only, System Generated | Yes | No | No |
| developerId | String | The ID of the developer associated with this record. | Required, Immutable after creation. | Yes | Yes | No |
| resourceType | String | Defines the type of external resource being synchronized (e.g., PROJECT\_CONFIG, FEATURE\_FLAG\_STATE, EXTERNAL\_API\_KEY). | Required | Yes | Yes | No |
| resourceKey | String | A unique identifier or slug for the specific resource instance (e.g., a project name, flag ID). | Required | Yes | Yes | No |
| data | JSON Object | The payload containing the actual synchronization data (settings, state, metadata). | Required, Must be valid JSON. | Yes | Yes | Yes |
| lastSyncedAt | ISO 8601 String | Timestamp of the last successful synchronization. | System Generated | Yes | No | No |
| createdAt | ISO 8601 String | Timestamp when the record was created. | System Generated | Yes | No | No |
| updatedAt | ISO 8601 String | Timestamp of the last modification to the record (via POST or PATCH). | System Generated | Yes | No | No |
| status | String (Enum) | Current synchronization status (e.g., ACTIVE, PENDING\_UPDATE, ERROR). | Optional | Yes | Yes | Yes |
| metadata | JSON Object | Arbitrary, non-critical metadata for tracking purposes. | Optional, Max size 1KB. | Yes | Yes | Yes |

## **2\. API Endpoints (CRUD Operations)**

The base URL for all endpoints is assumed to be /api/v1/sync/records.

### **2.1. FETCH (READ)**

#### **A. List All Records (Filtered)**

Retrieves a list of synchronization records, often filtered by developerId and/or resourceType.

| Method | Endpoint | Description |
| :---- | :---- | :---- |
| GET | /api/v1/sync/records | Returns a paginated list of all records matching query parameters. |

**Query Parameters:**

| Parameter | Type | Required | Description |
| :---- | :---- | :---- | :---- |
| developerId | String | No | Filters records for a specific developer. **Recommended.** |
| resourceType | String | No | Filters records by the defined resource type. |
| status | String | No | Filters records by synchronization status. |
| limit | Integer | No | Maximum number of results per page (Default: 50, Max: 100). |
| page | Integer | No | The page number to retrieve (Default: 1). |

**Success Response (200 OK):**

{  
  "total": 150,  
  "page": 1,  
  "limit": 50,  
  "data": \[  
    {  
      "id": "a1b2c3d4-e5f6-...",  
      "developerId": "dev-456",  
      "resourceType": "PROJECT\_CONFIG",  
      "resourceKey": "my-backend-service",  
      "data": { /\* ... full data object ... \*/ },  
      "lastSyncedAt": "2025-12-01T10:00:00Z",  
      "status": "ACTIVE",  
      "createdAt": "2025-01-15T09:00:00Z",  
      "updatedAt": "2025-12-01T10:00:00Z",  
      "metadata": {}  
    },  
    // ... more records ...  
  \]  
}

#### **B. Fetch Single Record (Detail)**

Retrieves the full details of a single record using its unique ID.

| Method | Endpoint | Description |
| :---- | :---- | :---- |
| GET | /api/v1/sync/records/{id} | Returns the complete DeveloperSyncRecord object. |

Success Response (200 OK):  
Returns the same JSON object structure as a single item in the list response above, containing all fields.

### **2.2. POST (CREATE)**

Creates a new synchronization record.

| Method | Endpoint | Description |
| :---- | :---- | :---- |
| POST | /api/v1/sync/records | Creates a new record. |

**Request Body (JSON):**

| Field | Required | Description |
| :---- | :---- | :---- |
| developerId | Yes | The ID of the developer. |
| resourceType | Yes | The type of resource (e.g., EXTERNAL\_API\_KEY). |
| resourceKey | Yes | The unique key for the resource instance. |
| data | Yes | The initial synchronization payload. |
| status | No | Initial status (Default: ACTIVE). |
| metadata | No | Optional metadata. |

**Example Request:**

{  
  "developerId": "dev-789",  
  "resourceType": "FEATURE\_FLAG\_STATE",  
  "resourceKey": "flag-migration-v2",  
  "data": {  
    "enabled": false,  
    "lastToggle": "2025-12-01T11:00:00Z",  
    "notes": "Initial state for migration flag."  
  }  
}

Success Response (201 Created):  
Returns the newly created record object, including the generated id, createdAt, and updatedAt fields.

### **2.3. PATCH (UPDATE)**

Updates an existing synchronization record. Only the fields provided in the request body will be modified.

| Method | Endpoint | Description |
| :---- | :---- | :---- |
| PATCH | /api/v1/sync/records/{id} | Partially updates the record identified by {id}. |

**Request Body (JSON):**

The only fields that can be updated are: data, status, and metadata. All other fields (developerId, resourceType, resourceKey, etc.) are immutable.

| Field | Required | Description |
| :---- | :---- | :---- |
| data | No | New synchronization payload. |
| status | No | New synchronization status. |
| metadata | No | Updated metadata object. |

**Example Request (Updating the sync data):**

{  
  "data": {  
    "enabled": true,  
    "lastToggle": "2025-12-01T12:00:00Z"  
  },  
  "status": "PENDING\_SYNC\_CONFIRMATION"  
}

Success Response (200 OK):  
Returns the complete, updated record object.

### **2.4. DELETE**

Deletes a synchronization record.

| Method | Endpoint | Description |
| :---- | :---- | :---- |
| DELETE | /api/v1/sync/records/{id} | Deletes the record identified by {id}. |

Success Response (204 No Content):  
No content is returned, indicating successful deletion.

## **3\. Security and Authentication**

All API endpoints are protected and require the following:

* **Authentication:** A valid API Key or OAuth 2.0 Bearer Token must be provided in the Authorization header.  
* **Authorization:** The token/key must correspond to a developer who has the necessary permissions to read/write the synchronization records (usually scope: sync:write and sync:read).

### **Error Responses**

| Status Code | Description |
| :---- | :---- |
| 400 Bad Request | Malformed request body, invalid JSON, or missing required fields (developerId, resourceType, data). |
| 401 Unauthorized | Missing or invalid API Key/Token. |
| 403 Forbidden | Valid authentication, but the developer lacks permission to access the resource or ID. |
| 404 Not Found | The requested record ID ({id}) does not exist. |
| 409 Conflict | Attempting to create a record (POST) where a unique combination of developerId, resourceType, and resourceKey already exists. |
| 500 Internal Server Error | Unexpected server-side issue. |

