import 'dotenv/config';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import mongoose from 'mongoose';

const migrationId = '2026-roles-v1';
const dryRun = process.argv.includes('--dry-run');
const mongoUri = process.env.MONGODB_LOCAL || process.env.MONGODB_URI;
const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

if (!mongoUri) throw new Error('MONGODB_LOCAL or MONGODB_URI is required');
if (!adminEmail) throw new Error('ADMIN_EMAIL is required');

const run = async () => {
    await mongoose.connect(mongoUri);
    const users = mongoose.connection.collection('users');
    const migrations = mongoose.connection.collection('system_migrations');

    const appliedMigration = await migrations.findOne({ _id: migrationId });
    if (appliedMigration) {
        console.log(`Migration ${migrationId} is already applied. No changes were made.`);
        return;
    }

    const matchingAdmins = await users.find({ email: adminEmail }).project({ _id: 1, email: 1 }).toArray();
    if (matchingAdmins.length !== 1) {
        throw new Error(`ADMIN_EMAIL must match exactly one existing user; matches found: ${matchingAdmins.length}`);
    }

    const allUsers = await users.find({}).project({
        _id: 1,
        email: 1,
        role: 1,
        active: 1,
        passwordChangeRequired: 1
    }).toArray();
    if (!allUsers.length) throw new Error('No users were found; migration was not applied');

    console.log(`Preflight OK: ${allUsers.length} user(s), administrator: ${adminEmail}`);
    if (dryRun) {
        console.log('Dry run completed. No changes were made.');
        return;
    }

    const backupDirectory = path.resolve('backups', 'migrations');
    await mkdir(backupDirectory, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDirectory, `${migrationId}-${timestamp}.json`);
    const backup = {
        migrationId,
        createdAt: new Date().toISOString(),
        adminEmail,
        users: allUsers.map((user) => ({
            id: user._id.toString(),
            role: user.role,
            hasRole: Object.hasOwn(user, 'role'),
            active: user.active,
            hasActive: Object.hasOwn(user, 'active'),
            passwordChangeRequired: user.passwordChangeRequired,
            hasPasswordChangeRequired: Object.hasOwn(user, 'passwordChangeRequired')
        }))
    };
    await writeFile(backupPath, JSON.stringify(backup, null, 2), { flag: 'wx' });

    const administratorId = matchingAdmins[0]._id;
    await users.updateMany({}, { $set: { role: 'editor', active: true } });
    await users.updateOne({ _id: administratorId }, { $set: { role: 'admin', active: true } });
    await users.updateMany(
        { passwordChangeRequired: { $exists: false } },
        { $set: { passwordChangeRequired: false } }
    );
    await migrations.insertOne({
        _id: migrationId,
        appliedAt: new Date(),
        adminEmail,
        userCount: allUsers.length,
        backupPath
    });

    console.log(`Migration applied successfully to ${allUsers.length} user(s).`);
    console.log(`Rollback metadata saved at ${backupPath}`);
};

run()
    .catch((error) => {
        console.error(`Migration failed: ${error.message}`);
        process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
