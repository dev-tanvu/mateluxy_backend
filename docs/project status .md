the **API documentation**, these aren't usually sent as a single "Project Status" field. They are actually a combination of **two different fields** that your CRM needs to send together to achieve that result on the website.

### **1\. The Mapping Table**

To get the specific status you saw on Property Finder, you must send the following values in your JSON body:

| If your CRM user selects: | Field: offering\_type | Field: project\_status |
| :---- | :---- | :---- |
| **Resale \- Ready to move** | sale | completed |
| **Resale \- Off-plan** | sale | off-plan |
| **Primary \- Ready to move** | primary-sale | completed |
| **Primary \- Off-plan** | primary-sale | off-plan |

### **2\. Why the difference?**

* **Primary vs. Resale:** In the API, this is defined by the offering\_type.  
  * sale \= Resale (Secondary market).  
  * primary-sale \= Primary (Direct from developer).  
* **Ready vs. Off-plan:** In the API, this is the project\_status (or sometimes called completion\_status).  
  * completed \= Ready to move.  
  * off-plan \= Under construction.

### **3\. Implementation Example**

When your CRM "Pushes" the data (The PUT request), your JSON should look like this for a **Primary Off-plan** property:

JSON

{  
  "offering\_type": "primary-sale",  
  "project\_status": "off-plan",  
  "price": 2500000,  
  "completion\_date": "2027-06",  
  ...  
}

### **4\. Mandatory "Off-plan" Requirements**

If you choose any of the **Off-plan** options, the API will likely reject the listing unless you also include:

* **completion\_date**: Use the format YYYY-MM.  
* **payment\_plan**: (Optional but highly recommended for Primary/Off-plan) A text or structured field explaining the installmetns (e.g., "20/80").

