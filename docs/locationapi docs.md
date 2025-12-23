## **Technical Documentation: Property Finder Location System**

To list a property on Property Finder, you cannot use external location data (like Google Places ID or raw strings). You **must** use an ID from Property Finder’s internal "Location Tree."

### **1\. Key Concept: The Location Tree**

Property Finder organizes locations in a strict parent-child hierarchy:  
Country \> City \> Community \> Sub-community \> Building/Project

* **Requirement:** Every listing must include a valid location.id.  
* **Restriction:** If the location.id does not exist in the PF database, the API will reject the listing.

### ---

**2\. The Location Search Endpoint**

Use this endpoint to find the correct location.id for your listing.

| Method | Endpoint | Query Parameters |
| :---- | :---- | :---- |
| GET | /v1/locations | search (string), perPage (max 50), page |

**Example Search Request:**

HTTP

GET https://atlas.propertyfinder.com/v1/locations?search=Burj+Khalifa\&perPage=5  
Authorization: Bearer \<YOUR\_ACCESS\_TOKEN\>

**Standard Response Body:**

JSON

{  
  "data": \[  
    {  
      "id": 12345,  
      "name": "Burj Khalifa",  
      "path": "UAE \> Dubai \> Downtown Dubai \> Burj Khalifa",  
      "type": "BUILDING",  
      "coordinates": { "lat": 25.1972, "lng": 55.2744 }  
    }  
  \]  
}

### ---

**3\. Mandatory Rules for Locations**

#### **Rule A: The "Highest Specificity" Rule**

You must always select the **deepest (most granular)** level available in the location tree.

* **Bad:** Listing a Burj Khalifa apartment under "Downtown Dubai" (Community level).  
* **Good:** Listing it under "Burj Khalifa" (Building level).  
* **Impact:** Using specific buildings increases your **Listing Quality Score**, which ranks your listing higher in search results.

#### **Rule B: Dubai Compliance (DLD Alignment)**

In Dubai, Property Finder's locations are strictly mapped to **Dubai Land Department (DLD)** data.

* If you are listing a property with a RERA/Trakheesi permit, the location.id you choose must match the location stated on the permit.  
* **Off-Plan Rule:** For primary (off-plan) listings, the location must match the **Project Name** as registered with the DLD.

#### **Rule C: No "Custom" Locations**

You cannot create new locations through the API. If a new building or project is missing from the tree:

1. Contact **integration.support@propertyfinder.ae**.  
2. Provide the official project name and DLD documents.  
3. Wait for PF to update their tree before attempting to sync that listing.

### ---

**4\. How to Structure the Listing Payload**

When sending your listing via POST /v1/listings, only the id is required within the location object.

**Correct Implementation:**

JSON

{  
  "reference": "AGENT-REF-001",  
  "type": "apartment",  
  "location": {  
    "id": 12345  // Use the ID fetched from /v1/locations  
  },  
  "price": 2500000,  
  ...  
}

### ---

**5\. Summary Checklist for Your CRM**

1. **Remove Google Maps Dependency:** Stop sending Google Place IDs to Property Finder.  
2. **Add a "PF Location" Lookup:** Create a search box in your CRM that calls the PF /v1/locations API as the user types.  
3. **Local Storage:** Store the id, name, and path in your own database so you don't have to call the API every time you view the property.  
4. **Audit Existing Listings:** If you have active listings that are only at the "City" or "Community" level, search for their specific buildings and update them to improve visibility.