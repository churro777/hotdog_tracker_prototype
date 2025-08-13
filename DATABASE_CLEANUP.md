# Database Cleanup Guide

This guide explains how to remove fake/demo data from the Firestore database.

## 🔒 Security Notice

**These cleanup utilities are now PROTECTED and only work in development environment.**

- ✅ **Development**: Full access to all cleanup functions
- 🚨 **Production**: All cleanup functions are blocked with security errors

## 🎯 Problem

When the app was first developed, it included demo data (Joey Chestnut, Takeru Kobayashi, Matt Stonie) that was seeded into the Firebase Firestore database. Now that we're going production-ready, we need to remove this fake data.

## 🧹 Solution

We've created utilities to safely remove demo data while preserving any real user data.

### Option 1: Browser Console (Recommended)

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Open browser at http://localhost:5173**

3. **Open browser console and run one of these commands:**

   **Check what data exists:**
   ```javascript
   import('./src/utils/clearFirebaseData.js').then(m => m.checkFirestoreData())
   ```

   **Remove only demo data (safe):**
   ```javascript
   import('./src/utils/clearFirebaseData.js').then(m => m.cleanupDemoData())
   ```

   **Interactive cleanup with options:**
   ```javascript
   import('./src/utils/clearFirebaseData.js').then(m => m.interactiveCleanup())
   ```

   **⚠️ Remove ALL data (dangerous!):**
   ```javascript
   import('./src/utils/clearFirebaseData.js').then(m => m.clearAllFirestoreData())
   ```

### Option 2: Quick Helper Script

Run the helper script for instructions:
```bash
node scripts/dev/database-cleanup.js
```

## 🎯 What Gets Removed

The cleanup will remove data for these demo user IDs:
- `joey-chestnut-demo`
- `takeru-kobayashi-demo`  
- `matt-stonie-demo`
- `2` (legacy Joey Chestnut ID)
- `3` (legacy Takeru Kobayashi ID)
- `4` (legacy Matt Stonie ID)

**Real user data from Firebase Auth will be preserved!**

## ✅ Verification

After cleanup:
1. Check the Firestore console: https://console.firebase.google.com/project/hotdog-tracker-def59/firestore
2. Run the check command to see remaining data
3. Test the app to ensure it works with clean data

## 🔒 Safety Features

- **Selective removal**: Only removes known demo user IDs
- **Preserves real data**: Any authentic user data stays intact
- **Check before clean**: Always check what exists before removing
- **Confirmation required**: Interactive mode asks before destructive operations

## 🚀 Going Forward

After cleanup:
- New users will create their own authentic contest data
- No more fake/demo data cluttering the database
- Clean slate for production use

## 📝 Files

- `src/utils/clearFirebaseData.ts` - Main cleanup utilities (dev-only)
- `src/utils/seedData.ts` - Demo seeding (dev-only)  
- `scripts/dev/database-cleanup.js` - Helper script with instructions
- `DATABASE_CLEANUP.md` - This documentation

## 🛡️ Security Features

### Environment Protection
- **Development Mode**: `npm run dev` → All cleanup functions available
- **Production Mode**: `npm run build` → All cleanup functions blocked with security errors
- **Check Function**: `isDevelopmentEnvironment()` validates environment
- **Guard Function**: `checkDevelopmentOnly()` blocks production usage

### Error Messages in Production
If someone tries to use cleanup functions in production:
```text
🚨 Security Error: cleanupDemoData is only available in development environment. 
Current environment: production
```

### Safe Deployment
- Cleanup utilities are included in source but protected by environment checks
- No risk of accidental execution in production
- Functions throw errors immediately if called in production environment