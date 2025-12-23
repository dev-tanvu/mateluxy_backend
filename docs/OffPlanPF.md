\# Off-Plan Property Synchronization Between CRM and Property Finder

\#\# Overview  
This document explains how to synchronize \*\*off-plan property listings\*\* between your CRM and Property Finder's Enterprise API. The integration supports creating, updating, deleting, and publishing off-plan properties with specific requirements for project status and compliance.

\#\# Prerequisites

\#\#\# Authentication Setup  
\`\`\`http  
POST /v1/auth/token  
Content-Type: application/json

{  
  "apiKey": "your\_api\_key\_here",  
  "apiSecret": "your\_api\_secret\_here"  
}  
\`\`\`

\#\#\# Required Information  
1\. \*\*Public Profile ID\*\* \- From \`/v1/users\` endpoint  
2\. \*\*Location ID\*\* \- From \`/v1/locations\` endpoint    
3\. \*\*Project Details\*\* \- Developer and project information  
4\. \*\*Compliance Data\*\* (Dubai/UAE only) \- From \`/v1/compliances/{permitNumber}/{licenseNumber}\`

\#\# Off-Plan Property Specific Configuration

\#\#\# Project Status Field  
For off-plan properties, you must set the \`projectStatus\` field to either:  
\- \`"off\_plan"\` \- Standard off-plan properties  
\- \`"off\_plan\_primary"\` \- Primary market off-plan properties

\#\#\# Key Off-Plan Requirements  
\- \*\*No age specification\*\* (property not yet built)  
\- \*\*Developer information\*\* is crucial  
\- \*\*Project association\*\* recommended  
\- \*\*Completion timeline\*\* should be in description

\#\# Property Synchronization Flow for Off-Plan

\#\#\# 1\. Create Off-Plan Property in Property Finder

\`\`\`http  
POST /v1/listings  
Authorization: Bearer {accessToken}  
Content-Type: application/json

{  
  "reference": "CRM-OFFPLAN-001",  
  "category": "residential",  
  "type": "apartment",  
  "projectStatus": "off\_plan",  // Critical for off-plan  
  "title": {  
    "en": "Luxury Off-Plan Apartment in Downtown",  
    "ar": "شقة تحت الإنشاء فاخرة في وسط المدينة"  
  },  
  "description": {  
    "en": "Premium off-plan apartment with expected completion in Q4 2025\. Featuring modern amenities and premium finishes...",  
    "ar": "شقة فاخرة تحت الإنشاء متوقعة التسليم الربع الأخير ٢٠٢٥. تتميز بوسائل راحة حديثة وتشطيبات فاخرة..."  
  },  
  "price": {  
    "type": "sale",  // Off-plan is typically for sale  
    "amounts": {  
      "sale": 2000000  
    },  
    "downpayment": 10,  // Common for off-plan  
    "paymentMethods": \["installments"\]  // Common payment method  
  },  
  "size": 120,  
  "bedrooms": "2",  
  "bathrooms": "2",  
  "furnishingType": "unfurnished",  // Typically unfurnished for off-plan  
  "location": {  
    "id": 12345  
  },  
  "assignedTo": {  
    "id": 67890  
  },  
  "developer": "Premium Developers LLC",  // Important for off-plan  
  "media": {  
    "images": \[  
      {  
        "original": {  
          "url": "https://your-crm.com/images/offplan-rendering1.jpg"  
        }  
      },  
      {  
        "original": {  
          "url": "https://your-crm.com/images/floor-plan.jpg"  
        }  
      }  
    \]  
  },  
  "amenities": \["central-ac", "shared-gym", "shared-pool", "concierge"\],  
  "availableFrom": "2025-10-01",  // Expected completion date  
  "uaeEmirate": "dubai",  
  "compliance": {  
    "listingAdvertisementNumber": "DLD-OFFPLAN-123",  
    "type": "rera",  
    "userConfirmedDataIsCorrect": true  
  }  
}  
\`\`\`

\#\#\# 2\. Check Publishing Price (Optional)  
Before publishing, you can check the cost:

\`\`\`http  
GET /v1/listings/{listing\_id}/publish/prices  
Authorization: Bearer {accessToken}  
\`\`\`

\#\#\# 3\. Publish the Off-Plan Property  
\`\`\`http  
POST /v1/listings/{listing\_id}/publish  
Authorization: Bearer {accessToken}  
\`\`\`

\#\# Region-Specific Off-Plan Requirements

\#\#\# Dubai/UAE Compliance for Off-Plan  
Off-plan properties in Dubai have strict compliance requirements:

1\. \*\*Get Off-Plan Permit Details:\*\*  
\`\`\`http  
GET /v1/compliances/{offplanPermitNumber}/{licenseNumber}?permitType=rera  
Authorization: Bearer {accessToken}  
\`\`\`

2\. \*\*Required Compliance Fields:\*\*  
\`\`\`json  
"compliance": {  
  "listingAdvertisementNumber": "DLD-OFFPLAN-123456",  
  "type": "rera",  
  "userConfirmedDataIsCorrect": true,  
  "advertisementLicenseIssuanceDate": "2024-01-15T00:00:00Z"  
}  
\`\`\`

\#\#\# Allowed Property Types for Off-Plan  
\*\*Residential Off-Plan:\*\*  
\- Apartments, Hotel Apartments  
\- Villas, Townhouses  
\- Penthouses, Duplexes  
\- Whole Building (for bulk sales)

\*\*Commercial Off-Plan:\*\*  
\- Office Spaces  
\- Retail Units  
\- Showrooms  
\- Business Centers

\#\# Update Scenarios for Off-Plan Properties

\#\#\# 1\. Update Construction Progress  
When construction milestones are reached:

\`\`\`http  
PUT /v1/listings/{listing\_id}  
Authorization: Bearer {accessToken}  
Content-Type: application/json

{  
  "description": {  
    "en": "Updated: Foundation work completed, now starting structural framework. 40% sold. Expected completion Q4 2025.",  
    "ar": "محدث: اكتمل العمل في الأساسات، بدأ العمل في الهيكل الإنشائي. تم بيع ٤٠٪. متوقع التسليم الربع الأخير ٢٠٢٥."  
  },  
  "availableFrom": "2025-12-01"  // Updated completion date  
}  
\`\`\`

\#\#\# 2\. Price Update for Off-Plan  
\`\`\`http  
PUT /v1/listings/{listing\_id}  
Authorization: Bearer {accessToken}  
Content-Type: application/json

{  
  "price": {  
    "type": "sale",  
    "amounts": {  
      "sale": 2200000  // Price increase due to construction progress  
    }  
  }  
}  
\`\`\`

\#\#\# 3\. Change from Off-Plan to Completed  
When construction is complete:

\`\`\`http  
PUT /v1/listings/{listing\_id}  
Authorization: Bearer {accessToken}  
Content-Type: application/json

{  
  "projectStatus": "completed",  // Change status  
  "availableFrom": "2024-03-01",  // Actual handover date  
  "description": {  
    "en": "NOW COMPLETED\! Ready for immediate handover. This premium apartment features...",  
    "ar": "تم الانتهاء من البناء\! جاهز للتسليم الفوري. هذه الشقة الفاخرة تتميز..."  
  }  
}  
\`\`\`

\#\# Webhook Integration for Off-Plan Properties

Subscribe to relevant events:

\`\`\`http  
POST /v1/webhooks  
Authorization: Bearer {accessToken}  
Content-Type: application/json

{  
  "eventId": "listing.published",  
  "callbackUrl": "https://your-crm.com/webhooks/propertyfinder/offplan",  
  "secret": "your\_webhook\_secret"  
}  
\`\`\`

\#\# Field Mapping Guide for Off-Plan

| CRM Field | Property Finder Field | Required | Off-Plan Specific |  
|-----------|---------------------|----------|-------------------|  
| Property ID | \`reference\` | Yes | Must be unique |  
| Project Status | \`projectStatus\` | Yes | Must be "off\_plan" or "off\_plan\_primary" |  
| Title | \`title.en\` / \`title.ar\` | Yes | Include "Off-Plan" in title |  
| Description | \`description.en\` / \`description.ar\` | Yes | Include completion timeline |  
| Price | \`price.amounts.sale\` | Yes | Sale price (not rental) |  
| Developer | \`developer\` | Highly Recommended | Developer company name |  
| Expected Completion | \`availableFrom\` | Recommended | Expected handover date |  
| Payment Plan | \`price.paymentMethods\` | Optional | \["installments", "cash"\] |  
| Down Payment | \`price.downpayment\` | Optional | Percentage required |  
| Location | \`location.id\` | Yes | Project location |  
| Property Type | \`type\` | Yes | Must match off-plan allowed types |  
| Images | \`media.images\` | Yes | Renderings, floor plans, site photos |

\#\# Best Practices for Off-Plan Properties

\#\#\# 1\. Content Strategy  
\- Use "Off-Plan" or "Under Construction" in titles  
\- Include expected completion dates prominently  
\- Describe developer track record and reputation  
\- Highlight unique selling points of the project

\#\#\# 2\. Media Requirements  
\- High-quality architectural renderings  
\- Floor plans with dimensions  
\- Site progress photos (if available)  
\- Location maps and master plans

\#\#\# 3\. Compliance Management  
\- Keep permit information updated  
\- Verify RERA/DLD compliance regularly  
\- Update license issuance dates when renewed  
\- Ensure all claims match official documentation

\#\#\# 4\. Price Transparency  
\- Clearly state if prices are starting from  
\- Include payment plan details  
\- Specify what's included in the price  
\- Mention any service charges or fees

\#\# Error Handling for Off-Plan

\#\#\# Common Off-Plan Specific Errors  
1\. \*\*Invalid projectStatus\*\* \- Use only "off\_plan" or "off\_plan\_primary"  
2\. \*\*Missing developer information\*\* \- Crucial for off-plan credibility  
3\. \*\*Future availableFrom dates\*\* \- Must be in the future for off-plan  
4\. \*\*Rental price for off-plan\*\* \- Off-plan should typically be for sale

\#\#\# Compliance Validation  
\`\`\`javascript  
// Pseudo-code for off-plan validation  
function validateOffPlanListing(listing) {  
  if (listing.projectStatus \!== 'off\_plan' && listing.projectStatus \!== 'off\_plan\_primary') {  
    throw new Error('Off-plan properties must have projectStatus: off\_plan or off\_plan\_primary');  
  }  
    
  if (listing.price.type \!== 'sale') {  
    throw new Error('Off-plan properties should typically be for sale, not rent');  
  }  
    
  if (\!listing.developer) {  
    console.warn('Developer information is highly recommended for off-plan properties');  
  }  
    
  // Dubai-specific compliance  
  if (listing.uaeEmirate \=== 'dubai' && \!listing.compliance) {  
    throw new Error('Dubai off-plan properties require compliance data');  
  }  
}  
\`\`\`

\#\# Example Integration Scenarios

\#\#\# Scenario 1: New Off-Plan Launch  
1\. Get RERA/DLD permit for the project  
2\. Create listing with \`projectStatus: "off\_plan"\`  
3\. Set realistic completion date  
4\. Include developer credentials  
5\. Publish with proper pricing strategy

\#\#\# Scenario 2: Construction Milestone Update  
1\. Update description with progress percentage  
2\. Add new construction photos  
3\. Adjust pricing if applicable  
4\. Maintain compliance data accuracy

\#\#\# Scenario 3: Project Completion  
1\. Change \`projectStatus\` to \`"completed"\`  
2\. Update \`availableFrom\` to actual handover date  
3\. Replace renderings with actual photos  
4\. Update description to reflect completion

\#\# Support  
For off-plan property integration support, contact: integration.support@propertyfinder.ae

\*\*Note:\*\* Off-plan properties may have additional regulatory requirements depending on the emirate/country. Always verify with local authorities before listing.  
