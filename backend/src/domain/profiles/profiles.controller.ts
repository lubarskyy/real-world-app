import { Router, RequestHandler } from 'express';
import { authMiddleware } from '../../middlewares';
import { NotFoundException } from '../../exceptions';
import { User } from '../users';
import { Follow } from './follow.model';

import type { Controller } from '../../interfaces';
import type { ProfileParams, ProfileResponse } from './profile.types';

export class ProfilesController implements Controller {
  public path: Controller['path'] = '/profiles';
  public router: Controller['router'] = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(`${this.path}/:username`, authMiddleware({ optional: true }), this.getProfile);
    this.router.post(`${this.path}/:username/follow`, authMiddleware(), this.followUser);
  }

  private getProfile: RequestHandler<ProfileParams, ProfileResponse, never, never> = async (
    request,
    response,
    next,
  ): Promise<void> => {
    const { currentUser } = request;
    const { username } = request.params;

    try {
      const user = await User.findOne({ where: { username } });

      if (user) {
        const isFollowing = currentUser
          ? Boolean(await Follow.findOne({ where: { followerId: currentUser.id, followingId: user.id } }))
          : false;

        response.send({
          profile: {
            ...user.createProfilePayload(),
            following: isFollowing,
          },
        });
      } else {
        next(new NotFoundException("Profile doesn't exist."));
      }
    } catch (error) {
      next(error);
    }
  };

  private followUser: RequestHandler<ProfileParams, ProfileResponse, never, never> = async (
    request,
    response,
    next,
  ): Promise<void> => {
    const { currentUser } = request;
    const { username } = request.params;

    try {
      const user = await User.findOne({ where: { username } });

      if (user) {
        const follow = await Follow.create({ followerId: currentUser!.id, followingId: user.id });

        response.send({
          profile: {
            ...user.createProfilePayload(),
            following: Boolean(follow),
          },
        });
      } else {
        next(new NotFoundException("Profile doesn't exist."));
      }
    } catch (error) {
      next(error);
    }
  };
}
