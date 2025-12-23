This documentation describes how to integrate and synchronize **Leads** from the Property Finder Enterprise API into your CRM.

Leads are the "contact inquiries" generated when a user clicks a button on your listing. To sync them, you can use **Polling** (fetching updates every few minutes) or **Webhooks** (receiving data instantly).

## ---

**1\. Fetching Leads (Polling Method)**

To pull leads from Property Finder into your CRM, use the GET /v1/leads endpoint.

### **Endpoint Details**

* **Method:** GET  
* **URL:** https://atlas.propertyfinder.com/v1/leads  
* **Authentication:** Bearer Token (OAuth 2.0)

### **Query Parameters**

| Parameter | Type | Description |
| :---- | :---- | :---- |
| since | ISO-8601 | Fetch only leads created after this date (e.g., 2025-01-01T10:00:00Z). |
| perPage | integer | Number of leads per request (Max 50). |
| page | integer | The page number for pagination. |
| channel | string | Filter by type: email, whatsapp, call, chat. |

## ---

**2\. The Lead Data Structure (Field Mapping)**

When you fetch a lead, you receive a JSON object. Below are the key fields you must map to your CRM:

### **Contact Details**

* **name**: The full name of the potential customer.  
* **email**: Customer's email address (for email/chat leads).  
* **phone**: Customer's mobile number (critical for WhatsApp and Call leads).

### **Context & Assignment**

* **channel**: Defines how the lead arrived.  
  * email: Traditional form inquiry.  
  * whatsapp: Customer clicked the WhatsApp button.  
  * call: Customer called the agent's number.  
  * chat: In-app/In-web direct chat.  
* **listing.reference**: **Crucial.** This is the "Reference Number" you sent from your CRM. Use this to find which property the lead is interested in.  
* **assignedTo.id**: The Property Finder User ID of the agent who received the lead.

## ---

**3\. Sample JSON Response**

This is exactly how the data looks when you fetch it. Your developer should use this to build the "Importer" logic.

JSON

{  
  "data": \[  
    {  
      "id": "lead\_987654",  
      "name": "John Doe",  
      "email": "johndoe@example.com",  
      "phone": "+971501234567",  
      "message": "I am interested in this apartment, please call me.",  
      "channel": "whatsapp",  
      "createdAt": "2025-12-19T10:30:00Z",  
      "listing": {  
        "id": 554433,  
        "reference": "APT-DOWNTOWN-101",   
        "title": "Luxury 2BR in Downtown"  
      },  
      "assignedTo": {  
        "id": 1234,  
        "name": "Agent Sarah"  
      }  
    }  
  \],  
  "pagination": {  
    "total": 1,  
    "count": 1,  
    "perPage": 50,  
    "currentPage": 1,  
    "totalPages": 1  
  }  
}

## ---

**4\. How to "Sync" & Assign Agents**

To successfully automate this in your CRM, follow this logic:

1. **Search by Reference:** When a lead arrives, look at the listing.reference.  
   * *CRM Logic:* SELECT agent\_id FROM properties WHERE internal\_ref \= 'APT-DOWNTOWN-101'  
2. **Auto-Assign:** If the reference matches a property in your CRM, automatically assign the lead to the agent who owns that property.  
3. **Handle "Call" Leads:** For leads with channel: call, Property Finder sometimes provides a link to a **call recording**. Store this URL in your CRM so the manager can listen to the agent's performance.  
4. **Prevent Duplicates:** Always store the Property Finder id (e.g., lead\_987654) in your CRM. Before creating a new lead, check if that ID already exists to avoid duplicate entries.

## ---

**5\. Real-Time Sync (Webhooks)**

If you want the lead to appear in your CRM **instantly** (without waiting for a poll), you should ask Property Finder to enable a **Webhook URL**.

* Property Finder will send a POST request to your CRM endpoint as soon as a lead is created.  
* The payload will be almost identical to the sample JSON above.  
* **Benefit:** Your agents can call the client within seconds of the inquiry, greatly increasing the chance of a sale.

**Would you like me to create a flowchart or a diagram showing how the data moves from the Property Finder website to your CRM database?**