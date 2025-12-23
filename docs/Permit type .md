This documentation focuses strictly on the two mandatory compliance fields required for listing properties in the UAE via the Property Finder Enterprise API.

## ---

**Compliance Fields Documentation**

In the Property Finder API, legal and regulatory data is grouped inside a single compliance object. These fields are mandatory for all listings in the UAE to meet government standards (such as DLD/Trakheesi).

### **1\. Field Definitions**

| Field Name | Type | Description |
| :---- | :---- | :---- |
| **type** | string | The regulatory body or permit category. Also known as the **Permit Type**. |
| **issuingClientLicenseNumber** | string | The official **Office Registration Number (ORN)** or Trade License number of your agency. |
| **listingAdvertisementNumber** | string | The specific permit or advertisement number (e.g., RERA Permit Number). |

### ---

**2\. Rules for "Permit Type" (type)**

You must send the correct code based on the location and nature of the property:

* **rera**: For all standard residential and commercial properties in **Dubai**.  
* **adrec**: For all properties in **Abu Dhabi** (regulated by the Abu Dhabi Real Estate Centre).  
* **dtcm**: For properties registered as **Holiday Homes** in Dubai.  
* **sharjah\_permit**: For properties in Sharjah (where applicable).

### ---

**3\. Rules for "Company License" (issuingClientLicenseNumber)**

This is the most common point of confusion between the Property Finder UI and the API.

* **API vs. UI:** While the Property Finder Expert portal shows your **Company Name** (e.g., *"Mateluxy Real Estate"*), the API **strictly requires the License Number** (the ORN).  
* **Numeric Value:** This field must be a numeric string (e.g., "12345"). Do not send the text name of your company.  
* **Account Alignment:** The number you send must exactly match the license number registered in your Property Finder Expert account profile. If it doesn't match, the listing will fail to sync.  
* **Data Source:** For Dubai, this number must be the one registered with the Dubai Land Department (DLD).

### ---

**4\. Mandatory Verification Workflow**

Before you submit a listing, the API provides an endpoint to verify that your Permit Number and Company License are valid and "linked" in the government database.

The Verification Endpoint:  
GET /v1/compliances/{permitNumber}/{licenseNumber}?permitType=rera

* **Why use this?** This call returns the official data (Price, Size, Location) registered to that permit.  
* **Sync Requirement:** Property Finder will reject your listing if the price or location in your CRM differs from the official data returned by this compliance check.

### ---

**5\. Implementation Example**

When sending your listing payload to POST /v1/listings, the structure must look like this:

JSON

{  
  "reference": "CRM-101",  
  "compliance": {  
    "type": "rera",   
    "listingAdvertisementNumber": "7112345678",   
    "issuingClientLicenseNumber": "12345"   
  },  
  "price": 1500000,  
  "size": 1200,  
  ...  
}

### **Summary Checklist**

1. **Stop sending Company Names:** Map your CRM's "Company Name" to the numeric "ORN/License Number" before sending it to the API.  
2. **Validate First:** Always use the GET /v1/compliances endpoint to ensure the permit is active and valid for your specific agency license.  
3. **Correct Codes:** Ensure the type field uses the lowercase codes (rera, adrec, dtcm) exactly.

