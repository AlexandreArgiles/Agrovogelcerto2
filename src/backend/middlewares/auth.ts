import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'supersecretkey123';

export interface AuthRequest extends Request {
  user?: { id: number; role: string; force_password_change: boolean };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token missing or invalid' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as any;
    req.user = decoded;
    
    // If forcing password change, only allow the change-password route
    if (decoded.force_password_change && !req.path.includes('/change-password')) {
      return res.status(403).json({ message: 'Password change required', forcePasswordChange: true });
    }
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
