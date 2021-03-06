import { Router, RequestHandler } from 'express';
import { authMiddleware } from '../../middlewares';
import { NotFoundException, UnprocessableEntityException } from '../../exceptions';
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
    this.router.delete(`${this.path}/:username/follow`, authMiddleware(), this.unfollowUser);
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
          ? Boolean(await Follow.findOne({ where: { followSource: currentUser.id, followTarget: user.id } }))
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

      if (user?.id === currentUser?.id) {
        return next(new UnprocessableEntityException('You cannot follow yourself.'));
      }

      if (user) {
        const follow = await Follow.create({ followSource: currentUser!.id, followTarget: user.id });

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

  private unfollowUser: RequestHandler<ProfileParams, ProfileResponse, never, never> = async (
    request,
    response,
    next,
  ): Promise<void> => {
    const { currentUser } = request;
    const { username } = request.params;

    try {
      const user = await User.findOne({ where: { username } });

      if (user?.id === currentUser?.id) {
        return next(new UnprocessableEntityException('You cannot unfollow yourself.'));
      }

      if (
        user &&
        currentUser &&
        (await Follow.destroy({ where: { followSource: currentUser.id, followTarget: user.id } }))
      ) {
        response.send({
          profile: {
            ...user.createProfilePayload(),
            following: false,
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
