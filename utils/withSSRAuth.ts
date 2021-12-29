import { AuthTokenError } from './../errors/AuthTokenError';
import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { destroyCookie, parseCookies } from "nookies";
import decode from 'jwt-decode';
import { validateUserPermissions } from './validateUserPermissions';

interface WithSSRAuthOptions {
  permissions?: string[];
  roles?: string[];
}

export function withSSRAuth<P>(fn: GetServerSideProps<P>, options?: WithSSRAuthOptions) {
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
    const cookies = parseCookies(ctx);
    const token = cookies['nextauth.token'];

    if (!token) {
      return {
        redirect: {
          destination: '/',
          permanent: false
        }
      }
    }

    if(options){
      const user = decode<{permissions: string[], roles: string[] }>(token);

      const { permissions, roles } = options
      const userHasValidPermissions = validateUserPermissions({
        user,
        permissions,
        roles
      })

      if(!userHasValidPermissions){
        return{
          redirect:{
            destination : '/dashboard',
            permanent: false
          }
        }
      }
    }

    try {
      return fn(ctx);
    } catch (error) {
      if (error instanceof AuthTokenError) {
        destroyCookie(ctx, 'nextauth.token')
        destroyCookie(ctx, 'nextauth.refreshToken')
        return {
          redirect: {
            destination: '/',
            permanent: false,
          }
        }
      }
    }
  }
}