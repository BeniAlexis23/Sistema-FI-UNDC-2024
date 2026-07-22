import app from './app.js';
import { PORT } from './config.js';
import { connectDB, disconnectDB } from './db.js';

try {
    await connectDB();
    const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

    const shutdown = (signal) => {
        console.log(`${signal} received; shutting down`);
        server.close(async () => {
            await disconnectDB();
            process.exit(0);
        });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
} catch (error) {
    console.error(`Server startup failed: ${error.message}`);
    process.exit(1);
}
