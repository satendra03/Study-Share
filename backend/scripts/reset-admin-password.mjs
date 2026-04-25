// One-off script to reset an admin user's password.
// Run from backend/ with: node scripts/reset-admin-password.mjs
//
// Optional overrides:
//   node scripts/reset-admin-password.mjs other@mail.com "NewP@ssw0rd"

import "dotenv/config";
import admin from "firebase-admin";

const email = (process.argv[2] || "admin@studyshare.com").trim().toLowerCase();
const newPassword = process.argv[3] || "Admin@123";

async function main() {
    const adminKey = process.env.FIREBASE_ADMIN_KEY;
    if (!adminKey) {
        console.error("❌ FIREBASE_ADMIN_KEY not found in backend/.env");
        process.exit(1);
    }

    let serviceAccount;
    try {
        serviceAccount = JSON.parse(adminKey);
    } catch (err) {
        console.error("❌ FIREBASE_ADMIN_KEY is not valid JSON:", err.message);
        process.exit(1);
    }

    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    console.log(`🔐 Connected to Firebase project: ${serviceAccount.project_id}`);

    let user;
    try {
        user = await admin.auth().getUserByEmail(email);
    } catch (err) {
        if (err.code === "auth/user-not-found") {
            console.error(`❌ No Firebase user with email "${email}".`);
            console.error("   If you meant to create the admin fresh, tell me and I'll write a different script.");
        } else {
            console.error("❌ Lookup failed:", err.message);
        }
        process.exit(1);
    }

    console.log(`👤 Found user: ${user.uid} (display: ${user.displayName || "—"})`);

    await admin.auth().updateUser(user.uid, { password: newPassword });
    console.log(`✅ Password reset for ${email}`);

    // Revoke existing sessions so any stale tokens stop working immediately.
    await admin.auth().revokeRefreshTokens(user.uid);
    console.log("🔄 Old refresh tokens revoked — any existing logins are now invalidated.");

    // Safety check: confirm Firestore shows this user as admin role.
    try {
        const db = admin.firestore();
        const doc = await db.collection("users").doc(user.uid).get();
        const data = doc.data();
        if (!doc.exists) {
            console.warn(`⚠️  No Firestore /users/${user.uid} document. The login middleware will reject this account.`);
            console.warn("   If you want me to create the admin Firestore doc too, say so and I'll extend the script.");
        } else if (data?.role !== "admin") {
            console.warn(`⚠️  Firestore role is "${data?.role}" — admin middleware expects "admin".`);
        } else {
            console.log(`✅ Firestore role confirmed as "admin".`);
        }
    } catch (err) {
        console.warn("⚠️  Couldn't verify Firestore user doc:", err.message);
    }

    console.log(`\n🎉 Done. Sign in at /admin/login with:`);
    console.log(`    email:    ${email}`);
    console.log(`    password: ${newPassword}`);
    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Unexpected error:", err);
    process.exit(1);
});
