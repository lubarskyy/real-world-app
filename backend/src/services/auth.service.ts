import { sign, verify } from 'jsonwebtoken';
import { isObject } from '../helpers';
import { User } from '../users';

type TokenPayloadBase = {
  sub: User['id'];
  iat: number;
  exp: number;
};

type TokenPayload = {
  username: User['username'];
};

type TokenPayloadSign = Pick<TokenPayloadBase, 'sub'> & TokenPayload;

type TokenPayloadDecode = TokenPayloadBase & TokenPayload;

const isToken = (value: any): value is TokenPayloadDecode => isObject(value) && 'sub' in value && 'username' in value;

export class AuthenticationService {
  public static createJWTToken(payload: TokenPayloadSign): Promise<string> {
    return new Promise((resolve, reject) => {
      sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (error, encoded) => {
        return error ? reject(error) : resolve(encoded);
      });
    });
  }

  public static decodeJWTToken(token: string): Promise<TokenPayloadDecode | null> {
    return new Promise((resolve, reject) => {
      verify(token, process.env.JWT_SECRET, (error, decoded) => {
        const payload = isToken(decoded) ? decoded : null;

        return error ? reject(error) : resolve(payload);
      });
    });
  }
}
