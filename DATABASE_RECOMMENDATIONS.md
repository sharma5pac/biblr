# Database Recommendations for App Expansion

Since your app is currently built with **React (Vite)** and works **Offline-First**, moving to a real cloud database is the next step to allow users to:
*   Sync their data across devices.
*   See *other* users' prayer requests and groups in real-time.
*   Securely log in.

Here are the top 3 recommendations for your specific tech stack:

## 1. Supabase (Top Recommendation) 🏆
**Best for:** React apps that need Scale, SQL power, and Real-time features.

*   **Type:** Relational (PostgreSQL).
*   **Why:** It gives you a full backend (Database, Auth, Real-time APIs, Storage) without writing backend code. It uses PostgreSQL, which is excellent for structured data like Bible Books, Chapters, and Users.
*   **Key Features:**
    *   **Real-time:** You can subscribe to database changes (perfect for "Prayed" counts updating live).
    *   **Auth:** Built-in email, Google, Apple login.
    *   **Row Level Security:** You can easily say "Only the user who created this prayer request can edit it."
*   **Free Tier:** Generous (500MB data, unlimited API requests).

## 2. Firebase (Easiest to Start)
**Best for:** Rapid prototyping and simple real-time chatting.

*   **Type:** NoSQL (Document Store).
*   **Why:** It's very popular with React developers. If you like how JavaScript objects look (JSON), you will like Firebase.
*   **Key Issues:** Complex queries (like "Find all prayer requests with tag 'Healing' sorted by date") can be harder than in SQL.
*   **Free Tier:** Good, but can get expensive if your app goes viral.

## 3. PocketBase
**Best for:** Simple, self-hosted, all-in-one solution.

*   **Type:** SQLite (embedded).
*   **Why:** It's a single binary you can run anywhere. It's incredibly simple and fast.
*   **Trade-off:** You usually host it yourself (e.g., on a cheap VPS for \$5/mo), whereas Supabase/Firebase manage the servers for you.

---

## Migration Plan (How to switch)

You currently use `CommunityService.js` which talks to `IndexedDB`. To switch to Supabase, you would simply:

1.  **Install Client:** `npm install @supabase/supabase-js`
2.  **Create Project:** Go to supabase.com and create a project.
3.  **Update Service:** Rewrite `CommunityService.js`:

```javascript
// OLD (IndexedDB)
async addRequest(text) {
    const db = await dbPromise
    // ... saves to browser ...
}

// NEW (Supabase)
async addRequest(text) {
    const { data, error } = await supabase
        .from('prayer_requests')
        .insert([{ content: text, user_id: currentUser.id }])
}
```

## Summary Recommendation
Go with **Supabase**. It automates the "Hard stuff" (Auth, Real-time) but keeps your data structured and queryable (SQL), which is crucial for a Bible app where you might want to do complex searching or filtering later.
