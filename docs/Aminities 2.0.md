This documentation provides the finalized mapping and process for sending **Amenities** and **Property Data** for Rent and Sale listings to Property Finder.

### **1\. The Two-Step Submission Process**

Property Finder’s API does not publish instantly. You must follow this mandatory flow:

1. **Draft Creation:** POST /v1/listings (This creates the property in your portal but it is **not live** yet).  
2. **Publication:** POST /v1/listings/{id}/publish (This moves the property from Draft to **Live**).

### ---

**2\. Residential Amenities: Sale vs. Rent**

In the Property Finder system, amenities are generally universal for **Residential** properties, whether they are for Sale or Rent. The system validates them based on the **Property Type** (Apartment vs. Villa).

**Mandatory Mapping Table (Use Slugs Only):**

| Category | Slug to send (Sale & Rent) | CRM Display Name |
| :---- | :---- | :---- |
| **Cooling** | central-ac | Central A/C |
| **Storage** | built-in-wardrobes, walk-in-closet | Wardrobes / Closets |
| **Kitchen** | kitchen-appliances | Kitchen Appliances |
| **Extra Rooms** | maids-room, study, driver-room, laundry-room | Specific Rooms |
| **Outdoor** | balcony, private-garden, private-pool, private-jacuzzi | Private Features |
| **Building** | shared-pool, shared-gym, shared-spa, security, concierge | Community Features |
| **Views** | view-of-water, view-of-landmark | Sea/Landmark Views |
| **Lifestyle** | pets-allowed, childrens-play-area, barbecue-area | Family/Pets |

**Note:** For **Rentals**, pets-allowed is one of the most filtered amenities by users. Ensure this is mapped correctly from your CRM.

### ---

**3\. Commercial Amenities (Rent & Sale)**

If your property is a **Warehouse, Office, or Retail** space, you must use these specific slugs. **Do not** send residential slugs like maids-room for an office, or the API will reject the data.

* conference-room  
* networked (For IT/Internet cabling)  
* dining-in-building  
* shared-pantry  
* visitor-parking

### ---

**4\. How to Send the Data (JSON Format)**

When you push the data from your CRM, the amenities must be a clean array of the slugs listed above.

**Example Request Body:**

JSON

{  
  "reference": "SALE-101",  
  "offeringType": "sale",   // Use "rent" or "sale"  
  "type": "apartment",  
  "price": 2500000,  
  "amenities": \[  
    "central-ac",  
    "balcony",  
    "shared-pool",  
    "security"  
  \],  
  "compliance": {  
    "type": "rera",  
    "issuingClientLicenseNumber": "12345", // Your ORN  
    "listingAdvertisementNumber": "651234567" // Permit Number  
  }  
}

### ---

**5\. Final Documentation Checklist**

* **Case Sensitivity:** All slugs must be **lowercase**.  
* **Format:** Amenities must be an **Array of Strings** (not a single string separated by commas).  
* **Validation:** If you send a slug that Property Finder does not recognize (like your internal CRM ID cmj8...), the **entire list of amenities will be ignored** by the portal.  
* **ORN:** Ensure issuingClientLicenseNumber is your **ORN**, not your trade license number.