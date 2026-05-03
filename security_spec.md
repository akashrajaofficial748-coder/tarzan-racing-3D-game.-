# Security Specification - Tarzan Supercar Racer

## Data Invariants
1. A user can only write to their own profile and leaderboard entry.
2. High scores and distances must be positive numbers.
3. Timestamps must be server-generated.
4. User IDs in the document data must match the auth UID.

## The Dirty Dozen Payloads (Rejection Targets)
1. **Identity Spoofing**: Attempt to update `userId` to a different user's UID.
2. **Score Inflation**: Attempt to set a score of `999,999,999` without verification (though rules can't verify 'skill', they can enforce range).
3. **Ghost Fields**: Adding `isAdmin: true` to a profile.
4. **ID Poisoning**: Using a 2KB string as a document ID.
5. **Timestamp Forge**: Sending a client-side `updatedAt` instead of `request.time`.
6. **Relational Break**: Updating a leaderboard entry without owning the corresponding user record (ensured by path matching).
7. **Type Mismatch**: Sending a string for `highScore`.
8. **Negative Stats**: Sending `-100` for `totalDistance`.
9. **Blanket Read**: Attempting to list all user private data (if any existed, but we have public profiles).
10. **State Shortcut**: Updating `updatedAt` without changing anything else (less severe but still validated).
11. **Malicious Regex**: Creating IDs with special shell characters (though Firestore handles most, we enforce valid ID pattern).
12. **Recursive Cost Attack**: Triggering multiple `get()` calls in a loop (rules are limited anyway, but we avoid excessive lookups).
