This document provides a complete, detailed guide for integrating with the Property Finder Enterprise API to fetch leads. It is structured to provide developers with all the necessary information, including prerequisites, endpoints, request details, and the data model.

## ---

**Property Finder Enterprise API: Leads Retrieval Documentation**

### **1\. Authentication (Prerequisite)**

All requests to the Property Finder Enterprise API are secured using **JSON Web Tokens (JWT)** via the OAuth 2.0 Client Credentials flow. Your system must implement a process to acquire and manage this token.

#### **1.1. Obtaining Client Credentials**

* Your **API Key** and **API Secret** (corresponding to OAuth Client ID and Client Secret) must be retrieved from the PF Expert application under the **Developer Resources** tab.

#### **1.2. Generating the Access Token**

The Access Token is **short-lived** and has a typical validity period of **30 minutes (1800 seconds)**. You must request a new token before the current one expires, as there is **no refresh token mechanism**.

| Detail | Value |
| :---- | :---- |
| **Method** | POST |
| **URL** | \[BASE\_URL\]/v1/auth/token |
| **Content Type** | application/json |

**Request Body Example:**

JSON

{  
  "apiKey": "YOUR\_API\_KEY\_HERE",  
  "apiSecret": "YOUR\_API\_SECRET\_HERE"  
}

**Response Example (200 OK):**

JSON

{  
  "accessToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0a...",  
  "tokenType": "Bearer",  
  "expiresIn": 1800  
}

* **Required Action:** The resulting accessToken must be included in the Authorization header of all subsequent API calls to fetch leads.

### **2\. Leads Retrieval Endpoint**

Use the following endpoint to retrieve a list of all inquiries (Leads) submitted to your listings and profiles.

| Detail | Value |
| :---- | :---- |
| **Method** | GET |
| **URL** | \[BASE\_URL\]/v1/leads |
| **Header** | Authorization: Bearer \<ACCESS\_TOKEN\> |

**Example Request:**

HTTP

GET \[BASE\_URL\]/v1/leads?perPage=50\&page=1\&filter\[createdAtFrom\]=2025-10-01T00:00:00Z  
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0a...

### **3\. Request Parameters and Constraints**

The leads endpoint uses **Query Parameters** for pagination, filtering, and sorting.

#### **3.1. Pagination (Required)**

You must use pagination to iterate through results.

| Parameter | Type | Description | Constraints |
| :---- | :---- | :---- | :---- |
| page | integer | The page number to retrieve. | Starts at 1\. |
| perPage | integer | The number of leads per page. | Maximum is **50**. |

#### **3.2. Time Constraint (Critical)**

Due to data retention policies, the API restricts how far back you can query for leads:

| Parameter | Type | Description | Constraints |
| :---- | :---- | :---- | :---- |
| filter\[createdAtFrom\] | string | The start date/time for lead creation. | **Cannot be older than 3 months** from the current date. Must be in ISO 8601 format (e.g., 2025-10-01T00:00:00Z). |

#### **3.3. Filtering Options**

You can refine the list of leads using the following filters:

| Parameter | Type | Description | Example Value |
| :---- | :---- | :---- | :---- |
| filter\[status\] | string | Filters by the lead's current status. | sent, opened, responded, archived |
| filter\[type\] | string | Filters by the channel the lead was generated through. | call, email, chat, whatsapp |
| filter\[entityType\] | string | Filters by the type of item the lead inquired about. | listing, project, developer |
| filter\[assignedToId\] | integer | Filters by the Public Profile ID of the agent/user the lead was assigned to. | 216582 (Public Profile ID) |
| filter\[listingReference\] | string | Filters by the unique reference number of the listing. | PF-ABC-1234 |
| filter\[projectId\] | integer | Filters by the Project ID. | 12345 |

### **4\. Data Model (What is Fetched)**

The response payload is a JSON object containing an array of lead records, along with pagination metadata.

#### **4.1. Response Structure**

| Field | Type | Description |
| :---- | :---- | :---- |
| data | array | The list of lead objects retrieved for the current page. |
| meta | object | Contains pagination details (currentPage, perPage, totalPages, totalCount). |

#### **4.2. Key Lead Data Fields**

Each object within the data array represents a single lead inquiry and typically includes the following essential fields:

| Field Name | Type | Description |
| :---- | :---- | :---- |
| id | string | The unique ID of the lead. |
| createdAt | string | Timestamp when the lead was generated (ISO 8601). |
| channel | string | The communication channel (email, call, whatsapp, chat). |
| status | string | Current status of the lead. |
| comments | string | Any free-text message or comments left by the enquirer. |
| contactDetails | object | Contains the user's contact information. |
| contactDetails.fullName | string | Full name of the prospect. |
| contactDetails.email | string | Email address of the prospect. |
| contactDetails.phone | string | Phone number of the prospect. |
| listing | object | Details of the listing or project the lead inquired about. |
| listing.id | string | Internal listing ID. |
| listing.externalId | string | Your CRM's ID for the listing (if provided during listing creation). |
| assignedToId | integer | The Public Profile ID of the agent assigned to handle the lead. |
| responseLink | string | A unique link provided for responding to the lead (if applicable for the channel). |

### **Summary of Best Practices for Developers**

1. **Token Management is Key:** Do not hardcode your Access Token. Implement a mechanism to request a new token every 30 minutes, or upon receiving an 401 Unauthorized error.  
2. **Use Filters:** Always use the filter\[createdAtFrom\] parameter to control the date range, and apply other filters (filter\[assignedToId\], filter\[type\]) to narrow down the results and reduce data transfer volume.  
3. **Handle Pagination:** Ensure your integration loops through all pages until the meta.totalPages or the next link (if provided in the response) indicates the end of the data.  
4. **Test Credentials:** Ensure you are using the dedicated **Test API Key** and **API Secret** when calling the test environment. Using Live credentials on the Test environment (or vice-versa) will fail.