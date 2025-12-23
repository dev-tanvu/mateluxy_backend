# OTP Error Handling Middleware - Documentation

## Overview

This document describes the comprehensive error handling middleware implemented for OTP (One-Time Password) validation in the password reset flow. The system provides robust protection against brute force attacks, clear error messages, and proper user feedback.

## Features

### 1. **Custom Exception Classes**
Located in: `src/common/exceptions/otp-exceptions.ts`

- **InvalidOtpException**: Thrown when user enters wrong OTP (displays remaining attempts)
- **ExpiredOtpException**: Thrown when OTP has passed its expiration time
- **MissingOtpException**: Thrown when no OTP found in database
- **TooManyOtpAttemptsException**: Thrown when max attempts exceeded (account locked)
- **InvalidOtpFormatException**: Thrown when OTP format is invalid

### 2. **Global HTTP Exception Filter**
Located in: `src/common/filters/http-exception.filter.ts`

Provides standardized error responses with:
- Status code
- Timestamp
- Request path and method
- Error message
- Error type/code
- Additional context (attempts remaining, lockout duration, etc.)
- Logging for monitoring

### 3. **Enhanced DTO Validation**
Located in: `src/modules/auth/dto/reset-password.dto.ts`

Validates OTP format before it reaches the service layer:
- Must be exactly 6 digits
- Must be numeric only
- Custom error messages for each validation rule

### 4. **Failed Attempt Tracking**
Database fields added to User model:
- **otpAttempts**: Tracks number of failed OTP verification attempts
- **otpLockedUntil**: Timestamp until which account is locked

### 5. **Security Features**

#### Rate Limiting
- **Max Attempts**: 5 failed attempts before lockout
- **Lockout Duration**: 15 minutes
- **Auto-Reset**: Attempts reset when new OTP requested or password successfully reset

#### Progressive Feedback
- Shows remaining attempts after each failed attempt
- Clear messages about lockout status and duration
- Expired OTPs are automatically cleared from database

## Error Response Format

All errors follow this standardized format:

```json
{
  "statusCode": 401,
  "timestamp": "2025-11-21T17:19:00.000Z",
  "path": "/api/auth/reset-password",
  "method": "POST",
  "message": "Invalid OTP. You have 3 attempt(s) remaining.",
  "error": "INVALID_OTP",
  "attemptsRemaining": 3
}
```

## Error Types and Status Codes

| Error Type | Status Code | Error Code | Additional Fields |
|------------|-------------|------------|-------------------|
| Invalid OTP | 401 | INVALID_OTP | attemptsRemaining |
| Expired OTP | 401 | OTP_EXPIRED | - |
| Missing OTP | 401 | OTP_NOT_FOUND | - |
| Too Many Attempts | 429 | TOO_MANY_ATTEMPTS | lockoutDuration |
| Invalid OTP Format | 400 | INVALID_OTP_FORMAT | - |
| User Not Found | 401 | Unauthorized | - |

## Flow Diagram

```
User Requests Password Reset
         ↓
OTP Generated & Sent
otpAttempts = 0
         ↓
User Enters OTP
         ↓
    Is Account Locked? ──YES→ Return TOO_MANY_ATTEMPTS (429)
         ↓ NO
    Does OTP Exist? ──NO→ Return OTP_NOT_FOUND (401)
         ↓ YES
    Is OTP Expired? ──YES→ Clear OTP & Return OTP_EXPIRED (401)
         ↓ NO
    Is OTP Valid? ──NO→ Increment Attempts
         │             ↓
         │        Attempts >= 5? ──YES→ Lock Account & Return TOO_MANY_ATTEMPTS
         │             ↓ NO
         │        Return INVALID_OTP with attemptsRemaining
         ↓ YES
Reset Password
Clear OTP Data
Reset otpAttempts = 0
         ↓
    Return Success
```

## Usage Examples

### Backend Service Logic

The `resetPassword` method in `AuthService` handles all error scenarios:

```typescript
async resetPassword(usernameOrEmail: string, otp: string, newPassword: string) {
    // 1. Check if account is locked
    // 2. Validate OTP exists
    // 3. Check if OTP expired
    // 4. Verify OTP correctness
    // 5. Track failed attempts
    // 6. Lock account after max attempts
    // 7. Reset password on success
    // 8. Clear OTP data and reset attempts
}
```

### Frontend Error Handling Example

```typescript
try {
  const response = await resetPassword({ usernameOrEmail, otp, newPassword });
  // Success - redirect to login
  router.push('/login');
} catch (error) {
  const errorData = error.response?.data;
  
  switch (errorData?.error) {
    case 'INVALID_OTP':
      setError(`Invalid OTP. ${errorData.attemptsRemaining} attempts remaining.`);
      break;
    
    case 'TOO_MANY_ATTEMPTS':
      setError(`Too many failed attempts. Try again in ${errorData.lockoutDuration} minutes.`);
      setIsLocked(true);
      break;
    
    case 'OTP_EXPIRED':
      setError('OTP has expired. Please request a new one.');
      break;
    
    case 'OTP_NOT_FOUND':
      setError('No OTP found. Please request a new one.');
      break;
    
    default:
      setError('An error occurred. Please try again.');
  }
}
```

## Configuration

### Customizable Parameters

In `auth.service.ts`:

```typescript
const maxAttempts = 5;                    // Maximum failed attempts
const lockoutDuration = 15 * 60 * 1000;   // 15 minutes in milliseconds
const otpValidity = 10 * 60 * 1000;       // 10 minutes OTP validity
```

### Development vs Production

- **Development**: Static OTP `'123456'` for testing
- **Production**: Random 6-digit OTP sent via email

## Database Schema

```prisma
model User {
  // ... other fields
  otp            String?
  otpExpiresAt   DateTime?
  otpAttempts    Int       @default(0)
  otpLockedUntil DateTime?
  // ... other fields
}
```

## API Endpoints

### POST /api/auth/forgot-password
Request OTP for password reset
- Generates OTP
- Resets attempt counter
- Clears any existing lockout

### POST /api/auth/reset-password
Verify OTP and reset password
- Validates OTP
- Tracks failed attempts
- Implements lockout mechanism

## Security Best Practices Implemented

✅ **Rate Limiting**: Prevents brute force attacks with attempt tracking  
✅ **Account Lockout**: Temporary lockout after max failed attempts  
✅ **OTP Expiration**: Time-limited OTPs (10 minutes)  
✅ **Clear OTP on Expiry**: Prevents replay attacks  
✅ **Progressive Disclosure**: Shows remaining attempts  
✅ **Secure Logging**: Errors logged for monitoring  
✅ **Format Validation**: DTO-level validation before processing  
✅ **Type Safety**: Strong TypeScript typing throughout  

## Testing Recommendations

1. **Valid OTP**: Test successful password reset
2. **Invalid OTP**: Verify attempts counter works
3. **Lockout**: Test account locks after 5 failed attempts
4. **Expired OTP**: Verify expiration handling
5. **Multiple Users**: Ensure attempt tracking is per-user
6. **Lockout Recovery**: Test new OTP request clears lockout
7. **Edge Cases**: Empty OTP, wrong format, SQL injection attempts

## Monitoring & Logging

The `HttpExceptionFilter` logs all errors with:
- Request method and path
- Status code
- Error message
- Timestamp

Example log:
```
[HttpExceptionFilter] POST /api/auth/reset-password - Status: 401 - "Invalid OTP. You have 3 attempt(s) remaining."
```

## Future Enhancements

- [ ] Email notifications on lockout
- [ ] IP-based rate limiting
- [ ] CAPTCHA after multiple failures
- [ ] SMS-based OTP as alternative
- [ ] Admin dashboard for lockout management
- [ ] Configurable lockout duration based on user role
