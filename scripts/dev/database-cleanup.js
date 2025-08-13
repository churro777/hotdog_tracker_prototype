/**
 * Database cleanup script
 * Run with: node scripts/database-cleanup.js [action]
 * 
 * Actions:
 * - check: Show current database contents
 * - clean: Remove demo data only (safe)
 * - clear: Remove ALL data (dangerous!)
 */

// This script can be run from the project root to clean up Firestore data
// Usage examples:
// npm run dev (then in browser console):
// > import('./src/utils/clearFirebaseData.js').then(m => m.checkFirestoreData())
// > import('./src/utils/clearFirebaseData.js').then(m => m.cleanupDemoData())

const action = process.argv[2] || 'check'

console.log('🔧 Database Cleanup Utility')
console.log('==========================')
console.log('')
console.log('To use this utility:')
console.log('1. Start the dev server: npm run dev')
console.log('2. Open browser console on http://localhost:5173')
console.log('3. Run one of these commands:')
console.log('')
console.log('📊 Check current data:')
console.log('import("./src/utils/clearFirebaseData.js").then(m => m.checkFirestoreData())')
console.log('')
console.log('🧹 Clean demo data only (safe):')
console.log('import("./src/utils/clearFirebaseData.js").then(m => m.cleanupDemoData())')
console.log('')
console.log('⚠️ Clear ALL data (dangerous):')
console.log('import("./src/utils/clearFirebaseData.js").then(m => m.clearAllFirestoreData())')
console.log('')
console.log('🎛️ Interactive cleanup:')
console.log('import("./src/utils/clearFirebaseData.js").then(m => m.interactiveCleanup())')
console.log('')

switch (action) {
  case 'check':
    console.log('✅ Use the browser console commands above to check database contents')
    break
  case 'clean':
    console.log('✅ Use the browser console commands above to clean demo data')
    break
  case 'clear':
    console.log('⚠️ Use the browser console commands above to clear ALL data (be careful!)')
    break
  default:
    console.log(`❌ Unknown action: ${action}`)
    console.log('Valid actions: check, clean, clear')
}