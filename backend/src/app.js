import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import { APP_ORIGIN, IS_PRODUCTION } from './config.js';
import { validateRequestOrigin } from './middlewares/security.js';
import { errorHandler, notFound } from './middlewares/error.middleware.js';
import { uploadsDirectory } from './multer.js';
import authRoutes from './routes/auth.routes.js';
import noticesRoutes from './routes/notices.routes.js';
import rcfsRoutes from './routes/rcfs.routes.js';
import usersRoutes from './routes/users.routes.js';
import categoriesRoutes from './routes/categories.routes.js';
import mongoose from 'mongoose';

const app = express();

if (IS_PRODUCTION) app.set('trust proxy', 1);
// Sin corchetes anidados: evita que ?category[$ne]=x llegue como objeto
app.set('query parser', 'simple');

app.disable('x-powered-by');
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || origin === APP_ORIGIN) return callback(null, true);
        return callback(null, false);
    },
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb', inflate: false }));
app.use(cookieParser());
app.use(validateRequestOrigin);

app.use('/uploads', express.static(uploadsDirectory));

app.get('/api/health', (req, res) => {
    const databaseReady = mongoose.connection.readyState === 1;
    res.status(databaseReady ? 200 : 503).json({
        status: databaseReady ? 'ok' : 'degraded',
        database: databaseReady ? 'connected' : 'disconnected'
    });
});

app.use('/api', authRoutes);
app.use('/api', noticesRoutes);
app.use('/api', rcfsRoutes);
app.use('/api', usersRoutes);
app.use('/api', categoriesRoutes);

app.use(express.static('dist'));
app.use(notFound);
app.use(errorHandler);

export default app;
