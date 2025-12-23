The languages spoken by an agent are synchronized with Property Finder through the **Public Profile Update** endpoint using a **JSON array of strings**.

The key information is encapsulated within the agent's publicProfile object in the API payload.

## **1\. API Field Structure**

The languages field is typically an **Array** of **Strings** that contain language codes. This allows an agent to speak multiple languages.

| JSON Object | Field Name (Most Likely) | Format | Type | Description |
| :---- | :---- | :---- | :---- | :---- |
| publicProfile | **spokenLanguages** (or languages) | Array of strings | \["en", "ar", "ru"\] | A list of languages the agent speaks, usually represented by **ISO 639-1** two-letter codes. |

---

## **2\. Synchronization Endpoint and Method**

You should use an **HTTP PATCH** request to update the agent's existing public profile, ensuring you only send the fields you want to change (in this case, the languages).

| Detail | Value |
| :---- | :---- |
| **Method** | PATCH |
| **Endpoint** | /v1/public-profiles/{id} |
| **Content Type** | application/json |
| **Path Parameter** | {id}: The agent's publicProfile.id |

---

## **3\. JSON Payload Example**

To synchronize or update the languages an agent speaks, your CRM should send a request body similar to the following JSON structure:

JSON

{  
  "publicProfile": {  
    "spokenLanguages": \[  
      "en",  
      "ar",  
      "ru"  
    \]  
  }  
}

### **Common Language Codes (ISO 639-1)**

Property Finder typically uses standard two-letter ISO codes:

| Language | Code |
| :---- | :---- |
| English | en |
| Arabic | ar |
| Russian | ru |
| French | fr |
| Hindi | hi |
| Urdu | ur |

**Note:** Always verify the exact list of acceptable codes with the official Property Finder Enterprise API documentation, as invalid or unrecognized codes may lead to a profile update rejection.