To fix the issue where your CRM cannot update existing listings on Property Finder, you must align your backend logic with the **Property Finder Enterprise API 2.0** standards.

The reason your updates are failing is likely because you are attempting a **partial update** (sending only the changed fields), which the Property Finder API does not support for listings. It requires a **Full Resource Replacement**.

## ---

**Official Documentation: Updating Published Listings**

### **1\. The Mandatory Update Endpoint**

Property Finder does **not** use PATCH for listings. You must use the PUT method.

* **HTTP Method:** PUT  
* **Endpoint:** https://api.propertyfinder.net/v1/listings/{listing\_id}  
* **Authorization:** Bearer {access\_token}

### **2\. The "Full Object" Rule**

The PUT method replaces the entire listing. If your CRM sends only the title, Property Finder will see that the description, price, and images are "missing" and will **delete them** or **reject the request**.

**The Workflow for your Developer:**

1. **Fetch:** GET /v1/listings/{id} to get the current data from PF.  
2. **Merge:** Replace the old values with the new values from your CRM edit form.  
3. **Push:** PUT /v1/listings/{id} with the **entire** JSON body.

### ---

**3\. Required Validation Rules (2025 Standards)**

If your PUT request contains valid structure but the listing doesn't update, check these three common "silent" killers:

| Field | Rule | Why it fails |
| :---- | :---- | :---- |
| **Description** | **750 – 2,000 characters** | If your edit makes it 749 characters, the update fails. |
| **Title** | **30 – 50 characters** | Over 50 characters causes an API rejection. |
| **Price** | Must be a Number | Sending "2500000" (string) instead of 2500000 (int). |
| **Compliance** | Permit & License | You **must** re-include the compliance object in every PUT. |

### ---

**4\. Correct JSON Payload Structure**

Your PUT request should look exactly like this. Note that even if you only changed the title, the rest of the data **must** be present.

JSON

PUT /v1/listings/123456  
{  
  "reference": "CRM-101",  
  "type": "apartment",  
  "offeringType": "sale",  
  "title": "Updated Title Here (30-50 chars)",  
  "description": "Full description here (must be 750+ chars)...",  
  "price": 2800000,  
  "location": { "id": 50 },  
  "amenities": \["central-ac", "balcony"\],  
  "compliance": {  
    "type": "rera",  
    "issuingClientLicenseNumber": "ORN-12345",  
    "listingAdvertisementNumber": "651234567"  
  }  
}

### ---

**5\. Troubleshooting the "Update to PF" Button**

In your previous message, you mentioned your CRM uses a POST /sync-to-pf command. You need to ensure the developer has written the code inside that command correctly:

* **Bad Logic:** CRM sends only the "edited fields" to PF. → **Result:** PF rejects it with a 400 Bad Request or 422 Unprocessable Entity.  
* **Good Logic:** CRM collects **all** fields for that property from the database and sends a full PUT request. → **Result:** Success.

