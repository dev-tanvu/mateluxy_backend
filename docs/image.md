The Property Finder API expects the agent's profile image to be provided as a publicly accessible **URL** in the imageUrl field of the publicProfile object1.

The format for the data is a standard **JSON string** containing a URI (Uniform Resource Identifier)2.

Based on your experience hosting the image on Amazon AWS, here is the official requirement and common troubleshooting steps, as the issue is typically related to accessibility rather than the field format:

### **1\. API Field Requirement**

The agent's image URL is submitted in the request body for user creation (POST /v1/users/) or public profile update (PATCH /v1/public-profiles/{id}):

| Field | Location | Format | Description |
| :---- | :---- | :---- | :---- |
| imageUrl | publicProfile object | string \<uri\> | URL of the profile image3.  |

### **2\. AWS Troubleshooting (The Most Likely Problem)**

Since you are not receiving an error upon submission, but the image doesn't appear, the API likely accepts the URL string but cannot retrieve the actual image file. The most common reasons when using AWS are related to public accessibility:

| Potential Issue | Fix |
| :---- | :---- |
| **Non-Public Access** | **Ensure the image is publicly readable.** If your S3 bucket is set to private, the Property Finder server cannot access the image. The URL must be accessible directly via HTTP GET request without any authentication headers. |
| **HTTPS/SSL Requirement** | **Use https:// in the URL.** Although the documentation might show http:// examples, modern APIs often require all image and media URLs to be served over a secure **HTTPS** connection for security and reliability. |
| **Pre-Signed/Temporary URLs** | **Use a permanent URL.** If you are using AWS pre-signed URLs, they expire. The API needs a permanent, non-expiring link to the image file. |
| **URL Redirects** | **Link directly to the image file.** Ensure the imageUrl points directly to the file (e.g., ...s3.amazonaws.com/bucket-name/image.jpg) and is not a URL that redirects to the file. |

**Action:** Test the imageUrl you are submitting by pasting it into a new incognito browser window. If the image doesn't load immediately and directly, Property Finder's server won't be able to fetch it either.