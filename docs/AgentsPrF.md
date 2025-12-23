# **Agent and User Management API Documentation**

This document outlines the API endpoints, fields, and processes for managing users (agents) and their public-facing profiles within the Property Finder platform11.

## **1\. Authentication Prerequisite**

All requests to the User API endpoints require a JSON Web Token (JWT) passed as a Bearer token in the Authorization header2.

| Action | Endpoint | Details |
| :---- | :---- | :---- |
| **Obtain Token** | POST /v1/auth/token | Exchange your OAuth 2.0 API Key and API Secret for an access token3333.  |
| **Token Validity** | N/A | Issued access tokens expire in **30 minutes**4. No refresh token flow is supported; a new token must be requested upon expiry5.  |

---

## **2\. User API Endpoints (Private Profile Management)**

The User API (/v1/users) handles the core system profile and access credentials for an agent/user.

### **2.1. Create User**

**Endpoint:** POST /v1/users/ 66**Purpose:** Creates a new user in the system, including their public profile details77.

| Field | Location | Required | Description |
| :---- | :---- | :---- | :---- |
| email | Body | Yes | Email address of the user, used mainly for authentication8.  |
| firstName | Body | Yes | User's first name9.  |
| lastName | Body | Yes | User's last name10.  |
| mobile | Body | Yes | Mobile phone number, used mainly for authentication (e.g., 2FA)11.  |
| roleId | Body | Yes | Access control role ID (e.g., 6 for Decision maker)12.  |
| publicProfile | Nested Object | Yes | Must include the full Public Profile object (see Section 3.1 for fields)13.  |

### **2.2. Search Users**

**Endpoint:** GET /v1/users/ 1414**Purpose:** Retrieves a list of users associated with a specific client or organization15.

| Query Parameter | Optional | Description |
| :---- | :---- | :---- |
| page, perPage | Yes | Pagination controls1616.  |
| search | Yes | Search term1717.  |
| status, roleId | Yes | Filter by user status or role ID1818.  |
| publicProfileId, id, email | Yes | Filter by Public Profile ID, User ID, or email address19191919.  |

### **2.3. Update Private Profile Details**

Endpoint: PATCH /v1/users/{id} 2020  
Purpose: Updates a user's private profile details. The request body should contain only the fields that need to be updated21.

| Updatable Field | Status | Notes |
| :---- | :---- | :---- |
| firstName, lastName | Editable | Basic user details2222.  |
| email | Editable | Private email2323.  |
| phone, mobile | Editable | Contact numbers2424.  |
| roleId | Editable | Updates the user's access control role2525.  |
| isActive | Editable | Boolean field to update user status2626.  |
| password | **Deprecated** | Used for updates, but has been marked as deprecated272727. **Cannot be fetched.**  |

---

## **3\. Public Profile API Endpoints**

The Public Profile API (/v1/public-profiles) manages the identity of the user/agent that is displayed publicly on the Property Finder website28.

### **3.1. Update Public Profile**

**Endpoint:** PATCH /v1/public-profiles/{id} 29**Purpose:** Updates the user's public-facing profile details30.

| Field | Updatable? | Description |
| :---- | :---- | :---- |
| **name** | Yes | Full name of the user, exposed on the PF Website31.  |
| **email** | Yes | Email of the user, exposed on the PF Website32.  |
| **phone** | Yes | Primary phone number, exposed on the PF Website33.  |
| phoneSecondary | Yes | Secondary phone number of the user34.  |
| whatsappPhone | Yes | WhatsApp phone number, exposed on the PF Website35.  |
| imageUrl | Yes | URL of the profile image36.  |
| bio | Yes | Localized brief biography37.  |
| position | Yes | Localized current job title or position38.  |
| linkedinAddress | Yes | LinkedIn URL of the user39.  |
| experienceSince | Yes | Year when the user started their professional career (e.g., 2015\)4040.  |
| nationality | Yes | Nationality of the user (2-letter country code)4141.  |
| spokenLanguages | Yes | Array of the spoken languages42.  |
| compliances | Yes | An array of compliances43.  |

### **3.2. Submit Verification Request**

**Endpoint:** POST /v1/public-profiles/{id}/submit-verification 44**Purpose:** Initiates the verification process for a public profile45.

| Field | Required | Description |
| :---- | :---- | :---- |
| phone | Yes | Private Profile Phone number of the public profile to be used for verification46.  |
| documentUrl | Yes | URL to the verification document \- license47.  |

---

## **4\. Fields Summary (Fetchable vs. Unfetchable)**

The **Search Users API (GET /v1/users/)** returns a combined response of private and public profile data484848.

### **4.1. Fetchable Fields (Returned in GET /v1/users/ Response)**

| Category | Field Name | Notes |
| :---- | :---- | :---- |
| **Private/Core** | id, firstName, lastName | Basic user identification49.  |
|  | email, mobile | Primary contact and authentication details50.  |
|  | status, roleId | User state (e.g., "active") and access level51.  |
| **Public Profile** | id, name, email, phone | Public contact information52.  |
|  | phoneSecondary, whatsappPhone | Secondary contact numbers53.  |
|  | bio, position, linkedinAddress | Localized professional details54.  |
|  | imageVariants, verification, compliances | Profile image URLs and verification status55.  |
|  | isSuperAgent | Boolean flag56.  |
| **Uncertain** | experienceSince, nationality, spokenLanguages | These fields are defined for updates 57575757but are not explicitly shown in the search response sample58.  |

### **4.2. Unfetchable Fields**

| Field Name | Reason |
| :---- | :---- |
| **password** | Not returned when fetching user details due to security595959. It is only used for updating and has been deprecated for that purpose60.  |

---

