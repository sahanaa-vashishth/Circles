import { Router } from 'express';
import orbitRouter from './orbit.routes.ts';
import communityRouter from './community.routes.ts';
import profileRouter from './profile.routes.ts';

const router = Router();

// Mount Orbit router at /orbit
router.use('/orbit', orbitRouter);

// Mount Community router at /community
router.use('/community', communityRouter);

// Mount Profile router at /profile
router.use('/profile', profileRouter);

export default router;
