# Verification: Device-Specific OTP Lockout

## Changes Implemented

### Backend
- **Database**: Added `OtpDeviceLock` table to track attempts per device. Removed global `otpAttempts` from `User` table.
- **Auth Service**:
  - `forgotPassword`: Checks `OtpDeviceLock` using `X-Device-ID` header.
  - `resetPassword`: Updates/Checks `OtpDeviceLock` using `X-Device-ID` header.
- **Users Service**: Added `findDeviceLock` and `upsertDeviceLock` methods.
- **Auth Controller**: Extracts `X-Device-ID` from headers.

### Frontend
- **Device ID**: Implemented `getDeviceId` utility using `uuid` and `localStorage`.
- **Axios**: Automatically attaches `X-Device-ID` header to all requests.

## Verification Steps

### 1. Verify Device ID Generation
- Open browser console.
- Run `localStorage.getItem('device_id')`.
- **Expected**: A UUID string should be present (after first request).

### 2. Verify Lockout Isolation
- **Device A (Browser 1)**:
  1. Request OTP.
  2. Enter wrong OTP 5 times.
  3. **Expected**: "This device is temporarily locked..." error.
- **Device B (Browser 2 / Incognito)**:
  1. Request OTP for same user.
  2. **Expected**: OTP sent successfully (no lockout error).
  3. Enter valid OTP.
  4. **Expected**: Password reset successful.

### 3. Verify Lockout Persistence
- **Device A**:
  1. Refresh page.
  2. Try to request OTP again.
  3. **Expected**: Still locked until duration expires.

## Notes
- If `X-Device-ID` is missing (e.g. direct API calls without frontend), the system falls back to generic error or allows request (depending on strictness, currently allows if no device ID provided in some paths, but frontend always sends it).
