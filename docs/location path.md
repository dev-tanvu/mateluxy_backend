## **Retrieving Location Paths for Sale & Rent**

To display the human-readable path in your CRM, you must map the location.id back to the Property Finder Tree.

### **1\. The Lookup Endpoint**

Use this endpoint to search for a specific ID or name. This is where the "Path" data lives.

* **Endpoint:** GET /v1/locations?search={id\_or\_name}  
* **Key Field to Extract:** path\_name or location\_tree.

### **2\. Response Structure Example**

When you call the locations API, the response will look like this for a Rent/Sale property:

JSON

{  
  "data": \[  
    {  
      "id": 50,  
      "name": "Dubai Marina",  
      "type": "COMMUNITY",  
      "path\_name": "Dubai",   
      "location\_tree": \[  
        { "id": "1", "name": "Dubai", "level": 0 },  
        { "id": "50", "name": "Dubai Marina", "level": 1 }  
      \]  
    }  
  \]  
}

### **3\. How to build the Full Path in your CRM**

To get the format Dubai \> Dubai Marina, your CRM logic should:

1. Take the location\_tree array.  
2. Sort it by level (lowest to highest).  
3. Join the name values with a \> separator.

## ---

**Key Data Mapping Table**

| Field | Description | Example Value |
| :---- | :---- | :---- |
| **id** | The unique ID you send in your listing. | 50 |
| **name** | The specific building or sub-community. | Dubai Marina |
| **path\_name** | The immediate parent location. | Dubai |
| **type** | The level in the hierarchy. | CITY, COMMUNITY, BUILDING |

## ---

**Best Practice: The "Location Cache" Strategy**

Since you are dealing with Rent and Sale listings, location IDs rarely change.

* **Don't** call the location API for every single listing fetch (it will slow down your CRM).  
* **Do** download the full location list once and store it in your CRM database as a "Master Location Table."  
* **Refresh** this table once a week to catch any new buildings or towers added by Property Finder.

**Note:** For Rent and Sale listings, always try to use the **Building** or **Sub-community** level ID (the deepest level) to ensure your "Listing Quality Score" remains high.

