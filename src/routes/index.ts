import { Router } from 'express';
import { setMatchRoutes } from './matchRoutes';
import { setPlayerRoutes } from './playerRoutes';

export function setRoutes(app: Router) {
    const router = Router();
    
    setMatchRoutes(router);
    setPlayerRoutes(router);
    
    app.use('/api', router);
}