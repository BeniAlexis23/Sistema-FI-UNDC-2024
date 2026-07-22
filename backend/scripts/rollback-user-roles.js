import 'dotenv/config';
import { readFile } from 'fs/promises';
import path from 'path';
import mongoose from 'mongoose';

const backupArgument = process.argv.find((argument) => argument.endsWith('.json'));
const confirmed = process.argv.includes('--confirm');
const mongoUri = process.env.MONGODB_LOCAL || process.env.MONGODB_URI;
const backupsRoot = path.resolve('backups', 'migrations');

if (!mongoUri) throw new Error('MONGODB_LOCAL or MONGODB_URI is required');
if (!backupArgument || !confirmed) {
    throw new Error('Usage: npm run migrate:roles:rollback -- <backup.json> --confirm');
}

const backupPath = path.resolve(backupArgument);
if (!backupPath.startsWith(`${backupsRoot}${path.sep}`)) {
    throw new Error('Backup file must be inside backups/migrations');
}

const run = async () => {
    const backup = JSON.parse(await readFile(backupPath, 'utf8'));
    if (backup.migrationId !== '2026-roles-v1' || !Array.isArray(backup.users)) {
        throw new Error('Invalid role migration backup');
    }

    await mongoose.connect(mongoUri);
    const users = mongoose.connection.collection('users');
    const migrations = mongoose.connection.collection('system_migrations');
    const marker = await migrations.findOne({ _id: backup.migrationId });
    if (!marker) throw new Error('Migration marker was not found; rollback was not applied');

    const operations = backup.users.map((user) => {
        const set = {};
        const unset = {};
        for (const [field, hasField] of [
            ['role', user.hasRole],
            ['active', user.hasActive],
            ['passwordChangeRequired', user.hasPasswordChangeRequired]
        ]) {
            if (hasField) set[field] = user[field];
            else unset[field] = '';
        }
        const update = {};
        if (Object.keys(set).length) update.$set = set;
        if (Object.keys(unset).length) update.$unset = unset;
        return { updateOne: { filter: { _id: new mongoose.Types.ObjectId(user.id) }, update } };
    });

    if (operations.length) await users.bulkWrite(operations, { ordered: true });
    await migrations.deleteOne({ _id: backup.migrationId });
    console.log(`Rollback completed for ${operations.length} user(s).`);
};

run()
    .catch((error) => {
        console.error(`Rollback failed: ${error.message}`);
        process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
