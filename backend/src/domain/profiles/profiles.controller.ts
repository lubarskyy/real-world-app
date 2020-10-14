import { Router, RequestHandler } from 'express';
import { Controller } from '../../interfaces';
import { NotFoundException } from '../../exceptions';
import { User } from '../users';
import { Follow } from './follow.model';
import { ProfileParams, ProfileResponse } from './profile.types';

export class ProfilesController implements Controller {
  public path: Controller['path'] = '/profiles';
  public router: Controller['router'] = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(`${this.path}/:username`, this.getProfile);
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
        const follows = currentUser
          ? Boolean(await Follow.findOne({ where: { followerId: currentUser.id, followingId: user.id } }))
          : false;

        response.send({
          profile: {
            ...user.createProfilePayload(),
            following: follows,
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
