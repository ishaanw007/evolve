# Requirements Document

## Introduction

This document defines the requirements for adding Google OAuth login to the Evolve Life Sciences B2B e-commerce platform. The feature integrates Google as an OAuth identity provider within the existing Supabase authentication framework, allowing Buyers and Admins to sign in using their Google accounts as an alternative to email/password credentials. The integration must coexist with the existing email/password registration flow and maintain role-based access controls.

## Glossary

- **Auth_Service**: The Supabase-based authentication and authorisation service managing user sessions and role-based access.
- **Platform**: The Evolve Life Sciences e-commerce web application comprising the React/Next.js frontend, Supabase backend services, and the Spring Boot/Node.js API layer.
- **Buyer**: An authenticated user representing a research institution, university, pharmaceutical company, hospital, diagnostic lab, or CRO who browses, quotes, and orders products.
- **Admin**: An internal Evolve Life Sciences staff member with elevated privileges to manage products, vendors, orders, pricing, and platform configuration.
- **Google_OAuth_Provider**: The Google OAuth 2.0 identity provider configured within the Supabase Auth_Service to authenticate users via their Google accounts.
- **OAuth_Callback**: The redirect endpoint on the Platform that receives the authorisation code from Google after a user grants consent.
- **User_Profile**: The record in the Platform database containing a user's identity information, organisation details, role, and authentication method.
- **Account_Linking**: The process of associating a Google OAuth identity with an existing email/password user account when the email addresses match.
- **Login_Page**: The frontend page presenting authentication options (email/password form and Google OAuth button) to unauthenticated users.

## Requirements

### Requirement 1: Google OAuth Sign-In Initiation

**User Story:** As a Buyer, I want to sign in using my Google account, so that I can access the Platform without managing a separate password.

#### Acceptance Criteria

1. THE Login_Page SHALL display a "Sign in with Google" button alongside the existing email/password login form.
2. WHEN a user clicks the "Sign in with Google" button, THE Auth_Service SHALL initiate the Google OAuth 2.0 authorisation code flow and redirect the user to the Google consent screen.
3. THE Auth_Service SHALL request the OAuth scopes: `openid`, `email`, and `profile` from the Google_OAuth_Provider.
4. WHEN a user is on the registration page, THE Platform SHALL display a "Sign up with Google" button as an alternative to the manual registration form.

### Requirement 2: OAuth Callback and Token Exchange

**User Story:** As a Buyer, I want the sign-in process to complete seamlessly after I authorise with Google, so that I am redirected back to the Platform in an authenticated state.

#### Acceptance Criteria

1. WHEN the Google_OAuth_Provider redirects the user to the OAuth_Callback with a valid authorisation code, THE Auth_Service SHALL exchange the code for access and ID tokens.
2. WHEN the Auth_Service receives valid tokens from Google, THE Auth_Service SHALL extract the user email, name, and profile picture from the ID token claims.
3. IF the Google_OAuth_Provider redirects with an error parameter, THEN THE Auth_Service SHALL redirect the user to the Login_Page and display a descriptive error message.
4. THE Auth_Service SHALL complete the OAuth token exchange and establish a user session within 5 seconds of receiving the callback.

### Requirement 3: New User Account Creation via Google OAuth

**User Story:** As a new Buyer signing in with Google for the first time, I want an account to be created automatically, so that I can begin using the Platform without a separate registration step.

#### Acceptance Criteria

1. WHEN a user authenticates via Google and no existing account matches the Google email, THE Auth_Service SHALL create a new user account with the email, display name, and profile picture obtained from Google.
2. WHEN a new account is created via Google OAuth, THE Auth_Service SHALL assign the default role of Buyer to the account.
3. WHEN a new account is created via Google OAuth, THE Platform SHALL mark the email as verified (since Google has already verified the email address).
4. WHEN a new user completes Google OAuth sign-in for the first time, THE Platform SHALL redirect the user to a profile completion page requesting: organisation name, GST number, and phone number.
5. WHILE a user has not completed the profile completion page, THE Platform SHALL restrict access to ordering and quotation features but permit browsing the product catalogue.

### Requirement 4: Existing Account Linking

**User Story:** As a Buyer who already registered with email/password, I want to link my Google account, so that I can use either method to sign in.

#### Acceptance Criteria

1. WHEN a user authenticates via Google and an existing account with the same email already exists, THE Auth_Service SHALL link the Google identity to the existing account without creating a duplicate.
2. WHEN an account is linked, THE Auth_Service SHALL preserve all existing user data including role, organisation name, GST number, and order history.
3. WHEN an account has been linked to Google, THE Platform SHALL allow the user to sign in using either email/password or Google OAuth.
4. IF an existing account was created with a different email than the Google account email, THEN THE Auth_Service SHALL treat the Google sign-in as a new account and not link to the unmatched account.

### Requirement 5: Session Management for Google OAuth Users

**User Story:** As a Buyer signed in via Google, I want my session to be managed consistently with email/password users, so that I have the same experience across the Platform.

#### Acceptance Criteria

1. WHEN a user signs in via Google OAuth, THE Auth_Service SHALL issue a JWT session token with the same structure and claims as email/password sessions.
2. THE Auth_Service SHALL include the authentication method (Google OAuth or email/password) as a claim in the JWT token.
3. WHEN a Google OAuth session expires, THE Auth_Service SHALL redirect the user to the Login_Page and require re-authentication.
4. WHEN a user clicks the sign-out button, THE Auth_Service SHALL invalidate the session regardless of the authentication method used.

### Requirement 6: Error Handling and Edge Cases

**User Story:** As a Buyer, I want clear feedback when Google sign-in fails, so that I can take corrective action or use an alternative login method.

#### Acceptance Criteria

1. IF a user denies consent on the Google consent screen, THEN THE Platform SHALL redirect the user to the Login_Page and display a message indicating that Google authorisation was not granted.
2. IF the Google_OAuth_Provider is temporarily unavailable, THEN THE Platform SHALL display a message advising the user to try again later or use email/password login.
3. IF the email retrieved from Google is associated with a deactivated account on the Platform, THEN THE Auth_Service SHALL reject the sign-in attempt and display a message indicating the account is deactivated.
4. IF the OAuth state parameter in the callback does not match the original request, THEN THE Auth_Service SHALL reject the authentication attempt and redirect to the Login_Page with a security error message.

### Requirement 7: Security Requirements

**User Story:** As a platform operator, I want the Google OAuth integration to follow security best practices, so that user accounts remain protected.

#### Acceptance Criteria

1. THE Auth_Service SHALL use the OAuth 2.0 authorisation code flow with PKCE (Proof Key for Code Exchange) for the Google sign-in process.
2. THE Auth_Service SHALL validate the Google ID token signature and claims (issuer, audience, expiration) before accepting the authentication.
3. THE Auth_Service SHALL generate and verify a cryptographic state parameter for each OAuth request to prevent CSRF attacks.
4. THE Platform SHALL transmit all OAuth-related data exclusively over HTTPS.
5. THE Auth_Service SHALL store no Google access tokens or refresh tokens on the client side.
