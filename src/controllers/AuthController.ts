import { NextFunction, Request, Response } from 'express';
import UsersService from '../services/UsersService';
import bcrypt from 'bcrypt';
import jwt, {JwtPayload} from 'jsonwebtoken';
import authConfig from '../config/auth.config';

class AuthController {
  async signin(request: Request, response: Response, next: NextFunction) {
    try {
      const { user } = request.body;

      if (!user) {
        return response.status(400).json({ message: 'User data not found!' });
      }

      const existingUser = await UsersService.getUserByName(user);

      if (!existingUser) {
        return response.status(404).json({
          message: `User with username ${user.username} not found!`,
        });
      }

      const passwordIsValid = bcrypt.compareSync(
        user.password,
        existingUser.password,
      );

      if (!passwordIsValid) {
        return response.status(401).json({
          message: `Password for user ${user.username} is incorrect!`,
        });
      }

      const userRoles = await UsersService.getUserRoles(existingUser.id);
      const token = jwt.sign(
        { id: existingUser.id, username: existingUser.username, roles: userRoles },
        authConfig.secret,
        {
          algorithm: 'HS256',
          allowInsecureKeySizes: true,
          expiresIn: 86400,
        },
      );

      return response.cookie('token', token, {
        secure: false,
        httpOnly: true,
        expires: new Date(Date.now() + 86400000),
      }).status(200).json({
        message: 'You successfully signed in!',
        user: {
          id: existingUser.id,
          username: existingUser.username,
          roles: userRoles
        }
      });
    } catch (e) {
      next(e);
    }
  }

  async signup(request: Request, response: Response, next: NextFunction) {
    try {
      const { user } = request.body;

      if (!user) {
        return response.status(400).json({ message: 'User data not found!' });
      }
      const existingUser = await UsersService.getUserByName(user);
      if (existingUser) {
        return response.status(409).json({
          message: `User with username ${user.username} already exist!`,
        });
      }
      //TODO add signin logic
      const res = await UsersService.createUser(user);
      return response.status(200).json({
        message: 'User was successfully created!',
        user: {
          username: res.username,
          id: res.id,
        },
      });
    } catch (e) {
      next(e);
    }
  }

  async getUserDetails(request: Request, response: Response, next: NextFunction) {
    try {
      const token = request.body.token;

      if (!token || typeof token !== 'string') {
        return response.status(200).json({ message: 'User is not authorized!' });
      }

      jwt.verify(token, authConfig.secret, (error, decoded) => {
        if (error || !decoded)  {
            response.status(200).json({ message: 'User is not authorized!' });
            return;
        }
         response.status(200).json({
          user: decoded as JwtPayload
        });
      });

    } catch (e) {
      next(e);
    }
  }
}

export default new AuthController();
