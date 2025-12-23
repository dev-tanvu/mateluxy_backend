To integrate amenities into your CRM for syncing with the Property Finder Enterprise API, you must use a standardized list of **slugs**.

The API will only accept an **array of strings**. If you send a name like "Swimming Pool" instead of the slug shared-pool, the listing will fail to sync.

### ---

**1\. Residential Amenities List**

These are the allowed slugs for properties like Apartments, Villas, Townhouses, and Penthouses.

| Slug | Display Name |
| :---- | :---- |
| central-ac | Central A/C |
| built-in-wardrobes | Built-in Wardrobes |
| kitchen-appliances | Kitchen Appliances |
| security | Security |
| concierge | Concierge |
| maid-service | Maid Service |
| balcony | Balcony |
| private-gym | Private Gym |
| shared-gym | Shared Gym |
| private-jacuzzi | Private Jacuzzi |
| shared-spa | Shared Spa |
| covered-parking | Covered Parking |
| maids-room | Maid's Room |
| study | Study |
| walk-in-closet | Walk-in Closet |
| childrens-play-area | Children's Play Area |
| pets-allowed | Pets Allowed |
| barbecue-area | Barbecue Area |
| shared-pool | Shared Pool |
| childrens-pool | Children's Pool |
| private-garden | Private Garden |
| private-pool | Private Pool |
| view-of-water | View of Water |
| view-of-landmark | View of Landmark |
| lobby-in-building | Lobby in Building |
| vastu-compliant | Vastu Compliant |

### ---

**2\. Commercial Amenities List**

Commercial listings (Offices, Retail, Warehouses) use a different set of specialized slugs.

| Slug | Display Name |
| :---- | :---- |
| networked | Networked |
| conference-room | Conference Room |
| dining-in-building | Dining in Building |
| shared-gym | Shared Gym |
| shared-pool | Shared Pool |
| covered-parking | Covered Parking |
| lobby-in-building | Lobby in Building |
| central-ac | Central A/C |
| security | Security |
| concierge | Concierge |

### ---

**3\. Infrastructure Slugs (Land & Farms)**

For Land and Farm property types, the amenities list is restricted to utility services:

| Slug | Display Name |
| :---- | :---- |
| electricity | Electricity |
| waters | Water Service |
| sanitation | Sanitation |
| fibre-optics | Fibre Optics |
| fixed-phone | Fixed Phone Line |

### ---

**4\. Technical Implementation Rules**

* **Property Type Restrictions:** You cannot mix slugs. For example, if your property type is land, sending private-pool will cause an error. **Land properties only accept infrastructure slugs.**  
* **Case Sensitivity:** Always send slugs in **lowercase** with hyphens (e.g., built-in-wardrobes).  
* **No Duplicates:** Ensure your CRM logic removes duplicate slugs before sending the array.  
* **Payload Example:**  
  JSON  
  "amenities": \[  
    "central-ac",  
    "balcony",  
    "shared-pool",  
    "security"  
  \]

### **Developer Recommendation**

In your CRM, create a "Property Finder Amenities" mapping section. Let your users check boxes for "Balcony" or "Central AC," and have your code map those checkmarks to the slugs in the tables above.

**Would you like me to help you map any specific custom fields from your CRM to these standard Property Finder slugs?**