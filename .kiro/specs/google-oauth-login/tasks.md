# Implementation Plan: Google OAuth Login

## Overview

Implement Google OAuth login for the Evolve Life Sciences B2B e-commerce platform using the existing Supabase auth infrastructure. The implementation extends the current `useAuth` hook, adds an OAuth callback route, a profile completion page, route guards, error handling utilities, a dedicated login page, and a database trigger for role assignment. The project uses React with TanStack Router (file-based routing), Vite, Vitest, and Supabase.

## Tasks

- [ ] 1. Set up auth utilities and error handling
  - [ ] 1.1 Create OAuth error mapping utility (`src/lib/auth-errors.ts`)
    - Define `OAuthErrorCode` type and `getOAuthErrorMessage` function
    - Define `isDeactivatedAccountError` helper
    - Map error codes (`access_denied`, `server_error`, `temporarily_unavailable`, `invalid_request`) to user-friendly messages
    - Ensure messages do not expose internal details
    - _Requirements: 2.3, 6.1, 6.2, 6.4_

  - [ ] 1.2 Create profile completeness utility (`src/lib/profile.ts`)
    - Implement `isProfileComplete(user: User): boolean` function
    - Check for `organisation_name`, `gst_number`, and `phone` in user metadata
    - Export `ProfileFormData` interface
    - _Requirements: 3.4, 3.5_

  - [ ]* 1.3 Write property test for OAuth error mapping (Property 1)
    - **Property 1: OAuth Error Callback Produces Descriptive Error**
    - For any valid OAuth error code, `getOAuthErrorMessage` returns a non-empty string that does not contain internal identifiers (e.g., no stack traces, no Supabase URLs)
    - Install `fast-check` as a dev dependency
    - **Validates: Requirements 2.3**

  - [ ]* 1.4 Write property test for profile completeness (Property 3)
    - **Property 3: Incomplete Profile Access Control**
    - For any user metadata object missing one or more of (organisation_name, gst_number, phone), `isProfileComplete` returns false; when all three are non-empty strings, it returns true
    - **Validates: Requirements 3.4, 3.5**

- [ ] 2. Extend the useAuth hook
  - [ ] 2.1 Add `isProfileComplete` and `authMethod` to auth context (`src/hooks/useAuth.tsx`)
    - Add `isProfileComplete: boolean` derived from user metadata using the utility from 1.2
    - Add `authMethod: 'google' | 'email' | null` derived from `session.user.app_metadata.provider`
    - Update `AuthContextType` interface
    - Update the context provider value
    - _Requirements: 3.4, 5.2_

  - [ ] 2.2 Enhance `signInWithGoogle` with error handling and proper redirect
    - Catch and surface errors from `supabase.auth.signInWithOAuth`
    - Update `redirectTo` to point to `/auth/callback`
    - Add loading/error state management during OAuth initiation
    - _Requirements: 1.2, 2.3, 6.1, 6.2_

  - [ ]* 2.3 Write unit tests for extended useAuth hook
    - Test that `isProfileComplete` reflects user metadata correctly
    - Test that `authMethod` returns correct provider type
    - Test error handling in `signInWithGoogle`
    - _Requirements: 3.4, 5.2_

- [ ] 3. Create OAuth callback route
  - [ ] 3.1 Create callback route handler (`src/routes/auth/callback.tsx`)
    - Create `src/routes/auth/` directory for TanStack Router file-based routing
    - Parse URL hash/query parameters (code, error, error_description)
    - On error: redirect to `/login` with error message using `getOAuthErrorMessage`
    - On success: let Supabase `onAuthStateChange` handle session, then check profile completeness
    - Redirect to `/complete-profile` if profile incomplete, otherwise redirect to intended page or home
    - Check for deactivated account status and handle appropriately
    - _Requirements: 2.1, 2.2, 2.3, 3.4, 6.3, 6.4_

  - [ ]* 3.2 Write unit tests for callback route
    - Test error parameter parsing and redirect behavior
    - Test successful flow with complete profile → redirects to home
    - Test successful flow with incomplete profile → redirects to /complete-profile
    - Test deactivated account rejection
    - _Requirements: 2.3, 3.4, 6.3_

- [ ] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Create login page and profile completion page
  - [ ] 5.1 Create dedicated login page (`src/routes/login.tsx`)
    - Display email/password login form
    - Display "Sign in with Google" button with Google icon
    - Handle `error` query parameter to display OAuth error messages
    - Support `returnTo` query parameter for post-login redirect
    - Link to registration page
    - _Requirements: 1.1, 1.4, 2.3, 6.1, 6.2_

  - [ ] 5.2 Create profile completion page (`src/routes/complete-profile.tsx`)
    - Display form with fields: organisation name, GST number, phone number
    - Validate GST number format and phone format using zod
    - On submit, update user metadata via `supabase.auth.updateUser`
    - Show toast on save failure, keep form state
    - Redirect to home or intended page on success
    - Only accessible to authenticated users with incomplete profiles
    - _Requirements: 3.4, 3.5_

  - [ ]* 5.3 Write unit tests for login page
    - Test "Sign in with Google" button renders and triggers `signInWithGoogle`
    - Test error message display from query params
    - Test email/password form presence
    - _Requirements: 1.1, 1.4_

  - [ ]* 5.4 Write unit tests for profile completion page
    - Test form validation (invalid GST, invalid phone)
    - Test successful submission updates user metadata
    - Test redirect after completion
    - _Requirements: 3.4, 3.5_

- [ ] 6. Implement route guard
  - [ ] 6.1 Create RouteGuard component (`src/components/auth/RouteGuard.tsx`)
    - Accept `requiresProfile` prop (boolean)
    - If not authenticated → redirect to `/login`
    - If authenticated + profile incomplete + `requiresProfile` is true → redirect to `/complete-profile`
    - Otherwise → render children
    - Use `useAuth` hook for auth state
    - _Requirements: 3.5, 5.3_

  - [ ] 6.2 Integrate RouteGuard with existing routes
    - Wrap ordering/quotation routes with `RouteGuard` (requiresProfile=true)
    - Keep catalogue browsing routes accessible without profile completion
    - _Requirements: 3.5_

  - [ ]* 6.3 Write property test for route guard logic (Property 3)
    - **Property 3: Incomplete Profile Access Control**
    - For any authenticated user with incomplete profile, ordering routes are blocked; catalogue routes remain accessible
    - **Validates: Requirements 3.4, 3.5**

- [ ] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Database trigger and Supabase configuration
  - [ ] 8.1 Create database migration for role assignment trigger
    - Create SQL migration file with `handle_new_user()` function
    - Trigger assigns default `buyer` role to `raw_app_meta_data` on `auth.users` INSERT
    - Only assigns if role not already present
    - _Requirements: 3.2_

  - [ ]* 8.2 Write property test for role assignment logic (Property 2)
    - **Property 2: New Google OAuth Users Receive Buyer Role**
    - For any new user created via Google OAuth, the assigned role should be "buyer"
    - Test the pure logic of role assignment (simulate trigger behavior)
    - **Validates: Requirements 3.2**

- [ ] 9. Wire components together and final integration
  - [ ] 9.1 Update Header component to use login page navigation
    - Replace direct `signInWithGoogle` call in Header with navigation to `/login`
    - Keep sign-out functionality in the header
    - Display user avatar/name when signed in (using Google profile picture)
    - _Requirements: 1.1_

  - [ ] 9.2 Update `signInWithOAuth` redirect configuration
    - Ensure `redirectTo` in `signInWithGoogle` points to the callback route (`/auth/callback`)
    - Verify OAuth scopes include `openid`, `email`, `profile`
    - _Requirements: 1.3, 7.1_

  - [ ] 9.3 Add `onAuthStateChange` event handling for sign-out
    - Ensure sign-out clears all local state regardless of auth method
    - Verify session invalidation works for both Google and email/password sessions
    - _Requirements: 5.4_

  - [ ]* 9.4 Write integration tests for full auth flow
    - Test Google OAuth initiation → callback → profile check → redirect
    - Test sign-out invalidates session
    - Test account linking preserves existing data
    - _Requirements: 4.1, 4.2, 5.4_

- [ ] 10. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The project uses TanStack Router file-based routing — new routes are created as files under `src/routes/`
- `fast-check` needs to be installed as a dev dependency for property-based tests
- Supabase dashboard configuration (enabling Google provider, setting client ID/secret, enabling auto-link) is a manual step not covered by these coding tasks

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["1.3", "1.4", "2.1"] },
    { "id": 2, "tasks": ["2.2", "5.1", "5.2", "8.1"] },
    { "id": 3, "tasks": ["2.3", "3.1", "5.3", "5.4", "8.2"] },
    { "id": 4, "tasks": ["3.2", "6.1"] },
    { "id": 5, "tasks": ["6.2", "6.3", "9.1", "9.2"] },
    { "id": 6, "tasks": ["9.3", "9.4"] }
  ]
}
```
