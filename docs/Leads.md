To manage and assign leads within your CRM, you need to use the **Property Finder Enterprise API** (specifically the leads endpoint). This endpoint allows you to pull contact details directly from Property Finder into your system.

### ---

**1\. The Lead Endpoint**

To fetch a list of your leads, you use the following GET request:

* **Method:** GET  
* **Endpoint:** /v1/leads  
* **Authentication:** OAuth 2.0 (Bearer Token)

### ---

**2\. Key Data Fields (The Details You Need)**

When you call the API, each lead object in the response will contain the specific contact details required for your agents:

| Field | Description | Data Type |
| :---- | :---- | :---- |
| **id** | Unique identifier for the lead. | String |
| **name** | Full name of the person inquiring. | String |
| **email** | The enquirer's email address. | String |
| **phone** | The enquirer's contact number (mobile/landline). | String |
| **message** | The text message sent by the lead (if via email/chat). | String |
| **channel** | How the lead was generated (see list below). | Enum |
| **listing\_reference** | The CRM ID of the property they inquired about. | String |
| **assigned\_to\_id** | The ID of the agent the lead was initially sent to. | Integer |
| **created\_at** | Timestamp of when the lead was generated. | ISO-8601 |

### ---

**3\. Lead Types (Channels)**

Property Finder categorizes leads by **Channel**. Your CRM should handle these differently:

* **email**: Traditional form submissions. Includes a name, email, and message.  
* **phone**: Incoming calls. Note that phone leads often include the "Call Tracking" recording if enabled.  
* **whatsapp**: Leads who clicked the WhatsApp button. These usually provide the phone number immediately.  
* **chat**: Direct messages from the Property Finder app/website.

### ---

**4\. How to Assign Leads to Agents in your CRM**

To ensure the right agent gets the lead, use the **listing\_reference** or **assigned\_to\_id** returned by the API:

1. **Direct Mapping:** Match the assigned\_to\_id from Property Finder to the User ID in your CRM.  
2. **Reference Mapping:** Use the listing\_reference (your CRM property ID) to find out which agent owns that listing, then assign the lead to them automatically.

### ---

**5\. Important Constraints**

* **Historical Limit:** The API typically only allows you to fetch leads from the **last 3 months**.  
* **Real-time Sync (Webhooks):** Instead of "polling" (asking the API every few minutes), it is better to set up a **Webhook**. Property Finder can send a "POST" request to your CRM the exact second a new lead is created.  
* **Pagination:** Use page and per\_page parameters if you are fetching a large volume of historical leads.

### ---

**Next Steps**

**Would you like me to provide a sample JSON response for a "WhatsApp lead" so your developer can see exactly how the phone number is formatted?**