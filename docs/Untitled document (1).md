### 1\. Endpoint for Fetching Leads

# The main endpoint for retrieving leads is a GET request:

| Method | Endpoint | Description |
| :---- | :---- | :---- |
| GET | /v1/leads | Fetches a paginated list of leads1. |

# This endpoint allows you to pull leads, with the ability to filter them based on type, status, date, and the assigned user or agent2.

### 2\. Rules and Requirements

# To successfully fetch leads, you must adhere to the following rules:

* # Authorization: All requests must include a valid JWT Access Token (Bearer token) in the Authorization header3.

* # Pagination: Results are paginated. You can specify the page number (page) and the number of items per page (perPage), with a maximum limit of 50 items per page444.

* # Time Limit: You can only retrieve leads created within the last 3 months from the current date using the createdAtFrom filter5.

* # Filtering: You can filter the results using various parameters6:

  * # Status: filter\[status\] (e.g., sent, opened, responded, archived)

  * # Type: filter\[type\] (e.g., call, email, chat, whatsapp)

  * # Entity Type: filter\[entityType\] (e.g., listing, project, developer, publicProfile)

  * # Assigned Agent: filter\[assignedToId\] (Public Profile IDs)

  * # Reference: filter\[listingReference\]

  * # Project: filter\[projectId\]

### 3\. Lead Data Provided

# While the full response schema is extensive, the data provided for each lead typically includes details on the interaction and the associated entities. Based on the documented webhook payload (WHPayloadLead), you can expect data fields such as:

* # Channel: The medium through which the lead was generated (e.g., whatsapp, email)7.

* # Status: The current status of the lead (e.g., sent)8.

* # Entity Type: The type of property the lead was interested in (e.g., listing, project, developer)9.

* # Associated Entities: Information about the listing, project, or developer the lead inquired about10.

* # Response Link: A link for responding to the lead11.

* # Sender Details: Information about the person who sent the lead12.

* # Public Profile: Details of the public profile associated with the lead13.

# 

