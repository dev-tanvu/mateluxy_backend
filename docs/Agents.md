## **Initial Agent Creation (CRM to PF)**

When a new agent is created in your CRM, you must use the API to create the corresponding User and Public Profile on Property Finder.

| Step | Action in CRM | API Endpoint | Details |
| :---- | :---- | :---- | :---- |
| **1\. Authenticate** | Your CRM system retrieves an **Access Token** using the **API Key** and **API Secret** credentials you obtained from PF Expert. | POST /oauth/token (or similar for JWT) | The token must be passed in the Authorization: Bearer \<ACCESS\_TOKEN\> header for all subsequent calls. |
| **2\. Create User** | Your CRM prepares a JSON payload with the agent's details and makes a POST request. | **POST /v1/users** | This single call creates both the private Property Finder **User** record and the associated **Public Profile** record (which is displayed on the website). |

### **Key Data to Include in the `POST /v1/users` Payload:**

You must ensure the payload includes all the necessary public profile fields, which includes the language data you previously asked about:

* **`name`** (Full name)  
* **`email`** (The agent's primary email address)  
* **`phone`**  
* **`whatsappPhone`**  
* **`position`** (e.g., "Senior Sales Consultant")  
* **`experienceSince`** (Year the agent started their career)  
* **`spokenLanguages`** (The array of language codes, e.g., `["en", "ar"]`)

The response to this `POST` request will return the **PF User ID** and the **Public Profile ID**. You **must store both IDs** in your CRM to reference the agent for all future updates and when assigning them to listings.

---

## **2\. Agent Data Synchronization (Updates)**

To keep the agent's profile up-to-date across both systems, your CRM should use the following `PATCH` endpoints whenever an agent's information changes.

| Synchronization Use Case | API Endpoint | Details |
| :---- | :---- | :---- |
| **Update Public Profile** (e.g., name, photo, languages, phone number, bio, experience) | **PATCH /v1/public-profiles/{id}** | Use the **Public Profile ID** stored in your CRM. This updates the information visible to the public on Property Finder. |
| **Update Private User Data** (e.g., status, internal data) | **PATCH /v1/users/{id}** | Use the **PF User ID** stored in your CRM. |

## **Deactivation/Archiving (CRM to PF)**

If an agent leaves your company, you cannot delete their record, but you must deactivate their public presence.

| Action in CRM | API Endpoint | Details |
| :---- | :---- | :---- |
| **Deactivate User** | **PATCH /v1/users/{id}** | Set the agent's **status** field to a value like inactive or archived. This will automatically remove them from all public listings and hide their profile on the website. |

