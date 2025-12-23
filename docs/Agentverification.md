# **Property Finder Agent Public Visibility Guide (API Workflow)**

When an agent is created via the /v1/users API endpoint, they are active within the PF Expert system, but their profile is not automatically public. To be visible on the Property Finder website and link to listings, the agent's **Public Profile must be explicitly submitted for verification and subsequently approved**.

## **1\. Prerequisites (Agent Creation)**

It is assumed the following API call was already successful:

* **API Endpoint:** POST /v1/users/ 1

* **Result:** A 201 User Created response containing the agent's unique id and publicProfile.id222.

  * **Action:** Retrieve and store the agent's **publicProfile.id** from this response.

## **2\. Submitting the Public Profile for Verification (The Missing Step)**

This is the critical step required to move the agent's profile from an internal active state to a public, verifiable state.

| Detail | Description |
| :---- | :---- |
| **Endpoint** |  POST /v1/public-profiles/{id}/submit-verification 3  |
| **Path Parameter** |  {id}: The agent's publicProfile.id (not the user ID) 4  |
| **Action** | Submits the public profile details (like license) to Property Finder for review. |

### **Request Body Schema (application/json)**

| Field | Type | Description |
| :---- | :---- | :---- |
| phone | string | The agent's public profile phone number to be used for verification. 5  |
| documentUrl | string \<uri\> |  **Required URL** to the agent's verification document (e.g., their RERA/broker license). 6  |

### **Example Request (cURL)**

Bash

curl \--location \--request POST 'https://atlas.propertyfinder.com/v1/public-profiles/{publicProfileId}/submit-verification' \\  
\--header 'Authorization: Bearer \<ACCESS\_TOKEN\>' \\  
\--header 'Content-Type: application/json' \\  
\--data-raw '{  
    "phone": "+971501234567",  
    "documentUrl": "https://yourserver.com/documents/agent-license-123.pdf"  
}'

## **3\. Monitoring for Approval**

The agent's public profile is not visible until the verification process is complete and approved by Property Finder's team.

* **Public Visibility:** The agent will become publicly visible on the Property Finder website only after the profile is **approved**.  
* **Best Practice (Webhooks):** Set up webhooks to monitor the following events to automatically track the profile's status:  
  * publicProfile.verification.approved 7

  * publicProfile.verification.rejected 8

* **Verification Status:** The user response object also contains a publicProfile.verification field9. You can check this status by calling:

  * **Endpoint:** GET /v1/users/ (and filtering by the agent's ID or email)10101010.

---

***Note on Agent Compliance***: The compliance field in the agent's publicProfile object is generally an array of objects or null 1111and is **optional** when updating the public profile12. However, **DLD compliance is mandatory for Dubai-based listings** themselves, which must include compliance.listingAdvertisementNumber and compliance.type13.

