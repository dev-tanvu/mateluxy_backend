# Property Finder Field Mapping

## Fields Being Synced ✅

### Basic Information
| CRM Field | Property Finder Field | Location | Notes |
|-----------|----------------------|----------|-------|
| `name` | `firstName`, `lastName` | User + Public Profile | Split on space |
| `email` | `email` | User + Public Profile | Direct mapping |
| `password` | `password` | User (private) | Hashed in CRM |

### Contact Information  
| CRM Field | Property Finder Field | Location | Notes |
|-----------|----------------------|----------|-------|
| `phone` | `mobile` | User (private) | Primary phone |
| `phone` | `phone` | Public Profile | Publicly displayed |
| `phoneSecondary` | `phoneSecondary` | Public Profile | Secondary contact number ✅ NEW |
| `whatsapp` | `whatsappPhone` | Public Profile | Falls back to phone if not set |

### Professional Information
| CRM Field | Property Finder Field | Location | Notes |
|-----------|----------------------|----------|-------|
| `position` | `position.primary` | Public Profile | Job title |
| `about` | `bio.primary` | Public Profile | Biography |
| `photoUrl` | `imageUrl` | Public Profile | Profile image URL |

### Personal Information
| CRM Field | Property Finder Field | Location | Notes |
|-----------|----------------------|----------|-------|
| `nationality` | `nationality` | Public Profile | 2-letter country code |
| `languages` | `spokenLanguages` | Public Profile | Array of language codes |
| `linkedinAddress` | `linkedinAddress` | Public Profile | LinkedIn profile URL ✅ NEW |

### Employment Information
| CRM Field | Property Finder Field | Location | Notes |
|-----------|----------------------|----------|-------|
| `experienceSince` | `experienceSince` | Public Profile | Year agent started career ✅ NEW |

### System Fields
| CRM Field | Property Finder Field | Location | Notes |
|-----------|----------------------|----------|-------|
| `isActive` | `status` | User (private) | "active" or "inactive" |
| `pfUserId` | `id` | User | Stored after creation |
| `pfPublicProfileId` | `publicProfile.id` | Public Profile | Stored after creation |

---

## Fields NOT Synced (Not Available in Property Finder) ❌

| CRM Field | Reason |
|-----------|--------|
| `username` | PF uses email for authentication |
| `department` | Not in PF API |
| `address` | Not in PF API |
| `vcardUrl` | Not in PF API |
| `birthdate` | Not in PF API |
| `joinedDate` | Different from PF's `experienceSince` (career start) |
| `visaExpiryDate` | Not in PF API |
| `areasExpertIn` | Not in PF API |
| `createdAt` | System field, not synced |
| `updatedAt` | System field, not synced |

---

## Property Finder Fields Not in CRM ⚠️

| PF Field | Notes |
|----------|-------|
| `compliances` | Regulatory compliance data - could add if needed |

---

## Sync Operations

### 1. Create Agent (CRM → PF)
- **Endpoint:** `POST /v1/users`
- **Syncs:** All available fields above
- **Returns:** `pfUserId` and `pfPublicProfileId` (stored in CRM)

### 2. Update Agent (CRM → PF)
- **Endpoint:** `PATCH /v1/users/{id}` (private fields)
- **Endpoint:** `PATCH /v1/public-profiles/{id}` (public fields)
- **Syncs:** Only changed fields

### 3. Delete Agent (CRM → PF)
- **Endpoint:** `PATCH /v1/users/{id}`
- **Action:** Sets `status: 'inactive'`
- **Note:** Doesn't delete, just deactivates

### 4. Sync from PF (PF → CRM)
- **Endpoint:** `GET /v1/users`
- **Action:** Creates/updates agents in CRM with PF data
- **Syncs:** All available fields above
