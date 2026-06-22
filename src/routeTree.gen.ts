/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

import { Route as rootRouteImport } from './routes/__root'
import { Route as AuthRouteImport } from './routes/auth'
import { Route as AuthenticatedRouteRouteImport } from './routes/_authenticated/route'
import { Route as IndexRouteImport } from './routes/index'
import { Route as AuthResetPasswordRouteImport } from './routes/auth.reset-password'
import { Route as AuthenticatedAppRouteImport } from './routes/_authenticated/app'
import { Route as AuthenticatedAdminRouteImport } from './routes/_authenticated/admin'
import { Route as AuthenticatedAppIndexRouteImport } from './routes/_authenticated/app.index'
import { Route as AuthenticatedAdminIndexRouteImport } from './routes/_authenticated/admin.index'
import { Route as AuthenticatedAppProfileRouteImport } from './routes/_authenticated/app.profile'
import { Route as AuthenticatedAppLoansRouteImport } from './routes/_authenticated/app.loans'
import { Route as AuthenticatedAppKycRouteImport } from './routes/_authenticated/app.kyc'
import { Route as AuthenticatedAdminUsersRouteImport } from './routes/_authenticated/admin.users'
import { Route as AuthenticatedAdminProductsRouteImport } from './routes/_authenticated/admin.products'
import { Route as AuthenticatedAdminLoansRouteImport } from './routes/_authenticated/admin.loans'
import { Route as AuthenticatedAdminKycRouteImport } from './routes/_authenticated/admin.kyc'
import { Route as AuthenticatedAdminCollectionsRouteImport } from './routes/_authenticated/admin.collections'
import { Route as AuthenticatedAdminAuditRouteImport } from './routes/_authenticated/admin.audit'
import { Route as AuthenticatedAdminApplicationsRouteImport } from './routes/_authenticated/admin.applications'
import { Route as AuthenticatedAdminAnalyticsRouteImport } from './routes/_authenticated/admin.analytics'
import { Route as ApiPublicPaymentsProviderRouteImport } from './routes/api/public/payments/$provider'
import { Route as AuthenticatedAppLoansApplyRouteImport } from './routes/_authenticated/app.loans.apply'
import { Route as AuthenticatedAppLoansIdRouteImport } from './routes/_authenticated/app.loans.$id'

const AuthRoute = AuthRouteImport.update({
  id: '/auth',
  path: '/auth',
  getParentRoute: () => rootRouteImport,
} as any)
const AuthenticatedRouteRoute = AuthenticatedRouteRouteImport.update({
  id: '/_authenticated',
  getParentRoute: () => rootRouteImport,
} as any)
const IndexRoute = IndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRouteImport,
} as any)
const AuthResetPasswordRoute = AuthResetPasswordRouteImport.update({
  id: '/reset-password',
  path: '/reset-password',
  getParentRoute: () => AuthRoute,
} as any)
const AuthenticatedAppRoute = AuthenticatedAppRouteImport.update({
  id: '/app',
  path: '/app',
  getParentRoute: () => AuthenticatedRouteRoute,
} as any)
const AuthenticatedAdminRoute = AuthenticatedAdminRouteImport.update({
  id: '/admin',
  path: '/admin',
  getParentRoute: () => AuthenticatedRouteRoute,
} as any)
const AuthenticatedAppIndexRoute = AuthenticatedAppIndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => AuthenticatedAppRoute,
} as any)
const AuthenticatedAdminIndexRoute = AuthenticatedAdminIndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => AuthenticatedAdminRoute,
} as any)
const AuthenticatedAppProfileRoute = AuthenticatedAppProfileRouteImport.update({
  id: '/profile',
  path: '/profile',
  getParentRoute: () => AuthenticatedAppRoute,
} as any)
const AuthenticatedAppLoansRoute = AuthenticatedAppLoansRouteImport.update({
  id: '/loans',
  path: '/loans',
  getParentRoute: () => AuthenticatedAppRoute,
} as any)
const AuthenticatedAppKycRoute = AuthenticatedAppKycRouteImport.update({
  id: '/kyc',
  path: '/kyc',
  getParentRoute: () => AuthenticatedAppRoute,
} as any)
const AuthenticatedAdminUsersRoute = AuthenticatedAdminUsersRouteImport.update({
  id: '/users',
  path: '/users',
  getParentRoute: () => AuthenticatedAdminRoute,
} as any)
const AuthenticatedAdminProductsRoute =
  AuthenticatedAdminProductsRouteImport.update({
    id: '/products',
    path: '/products',
    getParentRoute: () => AuthenticatedAdminRoute,
  } as any)
const AuthenticatedAdminLoansRoute = AuthenticatedAdminLoansRouteImport.update({
  id: '/loans',
  path: '/loans',
  getParentRoute: () => AuthenticatedAdminRoute,
} as any)
const AuthenticatedAdminKycRoute = AuthenticatedAdminKycRouteImport.update({
  id: '/kyc',
  path: '/kyc',
  getParentRoute: () => AuthenticatedAdminRoute,
} as any)
const AuthenticatedAdminCollectionsRoute =
  AuthenticatedAdminCollectionsRouteImport.update({
    id: '/collections',
    path: '/collections',
    getParentRoute: () => AuthenticatedAdminRoute,
  } as any)
const AuthenticatedAdminAuditRoute = AuthenticatedAdminAuditRouteImport.update({
  id: '/audit',
  path: '/audit',
  getParentRoute: () => AuthenticatedAdminRoute,
} as any)
const AuthenticatedAdminApplicationsRoute =
  AuthenticatedAdminApplicationsRouteImport.update({
    id: '/applications',
    path: '/applications',
    getParentRoute: () => AuthenticatedAdminRoute,
  } as any)
const AuthenticatedAdminAnalyticsRoute =
  AuthenticatedAdminAnalyticsRouteImport.update({
    id: '/analytics',
    path: '/analytics',
    getParentRoute: () => AuthenticatedAdminRoute,
  } as any)
const ApiPublicPaymentsProviderRoute =
  ApiPublicPaymentsProviderRouteImport.update({
    id: '/api/public/payments/$provider',
    path: '/api/public/payments/$provider',
    getParentRoute: () => rootRouteImport,
  } as any)
const AuthenticatedAppLoansApplyRoute =
  AuthenticatedAppLoansApplyRouteImport.update({
    id: '/apply',
    path: '/apply',
    getParentRoute: () => AuthenticatedAppLoansRoute,
  } as any)
const AuthenticatedAppLoansIdRoute = AuthenticatedAppLoansIdRouteImport.update({
  id: '/$id',
  path: '/$id',
  getParentRoute: () => AuthenticatedAppLoansRoute,
} as any)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/auth': typeof AuthRouteWithChildren
  '/admin': typeof AuthenticatedAdminRouteWithChildren
  '/app': typeof AuthenticatedAppRouteWithChildren
  '/auth/reset-password': typeof AuthResetPasswordRoute
  '/admin/analytics': typeof AuthenticatedAdminAnalyticsRoute
  '/admin/applications': typeof AuthenticatedAdminApplicationsRoute
  '/admin/audit': typeof AuthenticatedAdminAuditRoute
  '/admin/collections': typeof AuthenticatedAdminCollectionsRoute
  '/admin/kyc': typeof AuthenticatedAdminKycRoute
  '/admin/loans': typeof AuthenticatedAdminLoansRoute
  '/admin/products': typeof AuthenticatedAdminProductsRoute
  '/admin/users': typeof AuthenticatedAdminUsersRoute
  '/app/kyc': typeof AuthenticatedAppKycRoute
  '/app/loans': typeof AuthenticatedAppLoansRouteWithChildren
  '/app/profile': typeof AuthenticatedAppProfileRoute
  '/admin/': typeof AuthenticatedAdminIndexRoute
  '/app/': typeof AuthenticatedAppIndexRoute
  '/app/loans/$id': typeof AuthenticatedAppLoansIdRoute
  '/app/loans/apply': typeof AuthenticatedAppLoansApplyRoute
  '/api/public/payments/$provider': typeof ApiPublicPaymentsProviderRoute
}
export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/auth': typeof AuthRouteWithChildren
  '/auth/reset-password': typeof AuthResetPasswordRoute
  '/admin/analytics': typeof AuthenticatedAdminAnalyticsRoute
  '/admin/applications': typeof AuthenticatedAdminApplicationsRoute
  '/admin/audit': typeof AuthenticatedAdminAuditRoute
  '/admin/collections': typeof AuthenticatedAdminCollectionsRoute
  '/admin/kyc': typeof AuthenticatedAdminKycRoute
  '/admin/loans': typeof AuthenticatedAdminLoansRoute
  '/admin/products': typeof AuthenticatedAdminProductsRoute
  '/admin/users': typeof AuthenticatedAdminUsersRoute
  '/app/kyc': typeof AuthenticatedAppKycRoute
  '/app/loans': typeof AuthenticatedAppLoansRouteWithChildren
  '/app/profile': typeof AuthenticatedAppProfileRoute
  '/admin': typeof AuthenticatedAdminIndexRoute
  '/app': typeof AuthenticatedAppIndexRoute
  '/app/loans/$id': typeof AuthenticatedAppLoansIdRoute
  '/app/loans/apply': typeof AuthenticatedAppLoansApplyRoute
  '/api/public/payments/$provider': typeof ApiPublicPaymentsProviderRoute
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/': typeof IndexRoute
  '/_authenticated': typeof AuthenticatedRouteRouteWithChildren
  '/auth': typeof AuthRouteWithChildren
  '/_authenticated/admin': typeof AuthenticatedAdminRouteWithChildren
  '/_authenticated/app': typeof AuthenticatedAppRouteWithChildren
  '/auth/reset-password': typeof AuthResetPasswordRoute
  '/_authenticated/admin/analytics': typeof AuthenticatedAdminAnalyticsRoute
  '/_authenticated/admin/applications': typeof AuthenticatedAdminApplicationsRoute
  '/_authenticated/admin/audit': typeof AuthenticatedAdminAuditRoute
  '/_authenticated/admin/collections': typeof AuthenticatedAdminCollectionsRoute
  '/_authenticated/admin/kyc': typeof AuthenticatedAdminKycRoute
  '/_authenticated/admin/loans': typeof AuthenticatedAdminLoansRoute
  '/_authenticated/admin/products': typeof AuthenticatedAdminProductsRoute
  '/_authenticated/admin/users': typeof AuthenticatedAdminUsersRoute
  '/_authenticated/app/kyc': typeof AuthenticatedAppKycRoute
  '/_authenticated/app/loans': typeof AuthenticatedAppLoansRouteWithChildren
  '/_authenticated/app/profile': typeof AuthenticatedAppProfileRoute
  '/_authenticated/admin/': typeof AuthenticatedAdminIndexRoute
  '/_authenticated/app/': typeof AuthenticatedAppIndexRoute
  '/_authenticated/app/loans/$id': typeof AuthenticatedAppLoansIdRoute
  '/_authenticated/app/loans/apply': typeof AuthenticatedAppLoansApplyRoute
  '/api/public/payments/$provider': typeof ApiPublicPaymentsProviderRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/auth'
    | '/admin'
    | '/app'
    | '/auth/reset-password'
    | '/admin/analytics'
    | '/admin/applications'
    | '/admin/audit'
    | '/admin/collections'
    | '/admin/kyc'
    | '/admin/loans'
    | '/admin/products'
    | '/admin/users'
    | '/app/kyc'
    | '/app/loans'
    | '/app/profile'
    | '/admin/'
    | '/app/'
    | '/app/loans/$id'
    | '/app/loans/apply'
    | '/api/public/payments/$provider'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/auth'
    | '/auth/reset-password'
    | '/admin/analytics'
    | '/admin/applications'
    | '/admin/audit'
    | '/admin/collections'
    | '/admin/kyc'
    | '/admin/loans'
    | '/admin/products'
    | '/admin/users'
    | '/app/kyc'
    | '/app/loans'
    | '/app/profile'
    | '/admin'
    | '/app'
    | '/app/loans/$id'
    | '/app/loans/apply'
    | '/api/public/payments/$provider'
  id:
    | '__root__'
    | '/'
    | '/_authenticated'
    | '/auth'
    | '/_authenticated/admin'
    | '/_authenticated/app'
    | '/auth/reset-password'
    | '/_authenticated/admin/analytics'
    | '/_authenticated/admin/applications'
    | '/_authenticated/admin/audit'
    | '/_authenticated/admin/collections'
    | '/_authenticated/admin/kyc'
    | '/_authenticated/admin/loans'
    | '/_authenticated/admin/products'
    | '/_authenticated/admin/users'
    | '/_authenticated/app/kyc'
    | '/_authenticated/app/loans'
    | '/_authenticated/app/profile'
    | '/_authenticated/admin/'
    | '/_authenticated/app/'
    | '/_authenticated/app/loans/$id'
    | '/_authenticated/app/loans/apply'
    | '/api/public/payments/$provider'
  fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  AuthenticatedRouteRoute: typeof AuthenticatedRouteRouteWithChildren
  AuthRoute: typeof AuthRouteWithChildren
  ApiPublicPaymentsProviderRoute: typeof ApiPublicPaymentsProviderRoute
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/auth': {
      id: '/auth'
      path: '/auth'
      fullPath: '/auth'
      preLoaderRoute: typeof AuthRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/_authenticated': {
      id: '/_authenticated'
      path: ''
      fullPath: '/'
      preLoaderRoute: typeof AuthenticatedRouteRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/auth/reset-password': {
      id: '/auth/reset-password'
      path: '/reset-password'
      fullPath: '/auth/reset-password'
      preLoaderRoute: typeof AuthResetPasswordRouteImport
      parentRoute: typeof AuthRoute
    }
    '/_authenticated/app': {
      id: '/_authenticated/app'
      path: '/app'
      fullPath: '/app'
      preLoaderRoute: typeof AuthenticatedAppRouteImport
      parentRoute: typeof AuthenticatedRouteRoute
    }
    '/_authenticated/admin': {
      id: '/_authenticated/admin'
      path: '/admin'
      fullPath: '/admin'
      preLoaderRoute: typeof AuthenticatedAdminRouteImport
      parentRoute: typeof AuthenticatedRouteRoute
    }
    '/_authenticated/app/': {
      id: '/_authenticated/app/'
      path: '/'
      fullPath: '/app/'
      preLoaderRoute: typeof AuthenticatedAppIndexRouteImport
      parentRoute: typeof AuthenticatedAppRoute
    }
    '/_authenticated/admin/': {
      id: '/_authenticated/admin/'
      path: '/'
      fullPath: '/admin/'
      preLoaderRoute: typeof AuthenticatedAdminIndexRouteImport
      parentRoute: typeof AuthenticatedAdminRoute
    }
    '/_authenticated/app/profile': {
      id: '/_authenticated/app/profile'
      path: '/profile'
      fullPath: '/app/profile'
      preLoaderRoute: typeof AuthenticatedAppProfileRouteImport
      parentRoute: typeof AuthenticatedAppRoute
    }
    '/_authenticated/app/loans': {
      id: '/_authenticated/app/loans'
      path: '/loans'
      fullPath: '/app/loans'
      preLoaderRoute: typeof AuthenticatedAppLoansRouteImport
      parentRoute: typeof AuthenticatedAppRoute
    }
    '/_authenticated/app/kyc': {
      id: '/_authenticated/app/kyc'
      path: '/kyc'
      fullPath: '/app/kyc'
      preLoaderRoute: typeof AuthenticatedAppKycRouteImport
      parentRoute: typeof AuthenticatedAppRoute
    }
    '/_authenticated/admin/users': {
      id: '/_authenticated/admin/users'
      path: '/users'
      fullPath: '/admin/users'
      preLoaderRoute: typeof AuthenticatedAdminUsersRouteImport
      parentRoute: typeof AuthenticatedAdminRoute
    }
    '/_authenticated/admin/products': {
      id: '/_authenticated/admin/products'
      path: '/products'
      fullPath: '/admin/products'
      preLoaderRoute: typeof AuthenticatedAdminProductsRouteImport
      parentRoute: typeof AuthenticatedAdminRoute
    }
    '/_authenticated/admin/loans': {
      id: '/_authenticated/admin/loans'
      path: '/loans'
      fullPath: '/admin/loans'
      preLoaderRoute: typeof AuthenticatedAdminLoansRouteImport
      parentRoute: typeof AuthenticatedAdminRoute
    }
    '/_authenticated/admin/kyc': {
      id: '/_authenticated/admin/kyc'
      path: '/kyc'
      fullPath: '/admin/kyc'
      preLoaderRoute: typeof AuthenticatedAdminKycRouteImport
      parentRoute: typeof AuthenticatedAdminRoute
    }
    '/_authenticated/admin/collections': {
      id: '/_authenticated/admin/collections'
      path: '/collections'
      fullPath: '/admin/collections'
      preLoaderRoute: typeof AuthenticatedAdminCollectionsRouteImport
      parentRoute: typeof AuthenticatedAdminRoute
    }
    '/_authenticated/admin/audit': {
      id: '/_authenticated/admin/audit'
      path: '/audit'
      fullPath: '/admin/audit'
      preLoaderRoute: typeof AuthenticatedAdminAuditRouteImport
      parentRoute: typeof AuthenticatedAdminRoute
    }
    '/_authenticated/admin/applications': {
      id: '/_authenticated/admin/applications'
      path: '/applications'
      fullPath: '/admin/applications'
      preLoaderRoute: typeof AuthenticatedAdminApplicationsRouteImport
      parentRoute: typeof AuthenticatedAdminRoute
    }
    '/_authenticated/admin/analytics': {
      id: '/_authenticated/admin/analytics'
      path: '/analytics'
      fullPath: '/admin/analytics'
      preLoaderRoute: typeof AuthenticatedAdminAnalyticsRouteImport
      parentRoute: typeof AuthenticatedAdminRoute
    }
    '/api/public/payments/$provider': {
      id: '/api/public/payments/$provider'
      path: '/api/public/payments/$provider'
      fullPath: '/api/public/payments/$provider'
      preLoaderRoute: typeof ApiPublicPaymentsProviderRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/_authenticated/app/loans/apply': {
      id: '/_authenticated/app/loans/apply'
      path: '/apply'
      fullPath: '/app/loans/apply'
      preLoaderRoute: typeof AuthenticatedAppLoansApplyRouteImport
      parentRoute: typeof AuthenticatedAppLoansRoute
    }
    '/_authenticated/app/loans/$id': {
      id: '/_authenticated/app/loans/$id'
      path: '/$id'
      fullPath: '/app/loans/$id'
      preLoaderRoute: typeof AuthenticatedAppLoansIdRouteImport
      parentRoute: typeof AuthenticatedAppLoansRoute
    }
  }
}

interface AuthenticatedAdminRouteChildren {
  AuthenticatedAdminAnalyticsRoute: typeof AuthenticatedAdminAnalyticsRoute
  AuthenticatedAdminApplicationsRoute: typeof AuthenticatedAdminApplicationsRoute
  AuthenticatedAdminAuditRoute: typeof AuthenticatedAdminAuditRoute
  AuthenticatedAdminCollectionsRoute: typeof AuthenticatedAdminCollectionsRoute
  AuthenticatedAdminKycRoute: typeof AuthenticatedAdminKycRoute
  AuthenticatedAdminLoansRoute: typeof AuthenticatedAdminLoansRoute
  AuthenticatedAdminProductsRoute: typeof AuthenticatedAdminProductsRoute
  AuthenticatedAdminUsersRoute: typeof AuthenticatedAdminUsersRoute
  AuthenticatedAdminIndexRoute: typeof AuthenticatedAdminIndexRoute
}

const AuthenticatedAdminRouteChildren: AuthenticatedAdminRouteChildren = {
  AuthenticatedAdminAnalyticsRoute: AuthenticatedAdminAnalyticsRoute,
  AuthenticatedAdminApplicationsRoute: AuthenticatedAdminApplicationsRoute,
  AuthenticatedAdminAuditRoute: AuthenticatedAdminAuditRoute,
  AuthenticatedAdminCollectionsRoute: AuthenticatedAdminCollectionsRoute,
  AuthenticatedAdminKycRoute: AuthenticatedAdminKycRoute,
  AuthenticatedAdminLoansRoute: AuthenticatedAdminLoansRoute,
  AuthenticatedAdminProductsRoute: AuthenticatedAdminProductsRoute,
  AuthenticatedAdminUsersRoute: AuthenticatedAdminUsersRoute,
  AuthenticatedAdminIndexRoute: AuthenticatedAdminIndexRoute,
}

const AuthenticatedAdminRouteWithChildren =
  AuthenticatedAdminRoute._addFileChildren(AuthenticatedAdminRouteChildren)

interface AuthenticatedAppLoansRouteChildren {
  AuthenticatedAppLoansIdRoute: typeof AuthenticatedAppLoansIdRoute
  AuthenticatedAppLoansApplyRoute: typeof AuthenticatedAppLoansApplyRoute
}

const AuthenticatedAppLoansRouteChildren: AuthenticatedAppLoansRouteChildren = {
  AuthenticatedAppLoansIdRoute: AuthenticatedAppLoansIdRoute,
  AuthenticatedAppLoansApplyRoute: AuthenticatedAppLoansApplyRoute,
}

const AuthenticatedAppLoansRouteWithChildren =
  AuthenticatedAppLoansRoute._addFileChildren(
    AuthenticatedAppLoansRouteChildren,
  )

interface AuthenticatedAppRouteChildren {
  AuthenticatedAppKycRoute: typeof AuthenticatedAppKycRoute
  AuthenticatedAppLoansRoute: typeof AuthenticatedAppLoansRouteWithChildren
  AuthenticatedAppProfileRoute: typeof AuthenticatedAppProfileRoute
  AuthenticatedAppIndexRoute: typeof AuthenticatedAppIndexRoute
}

const AuthenticatedAppRouteChildren: AuthenticatedAppRouteChildren = {
  AuthenticatedAppKycRoute: AuthenticatedAppKycRoute,
  AuthenticatedAppLoansRoute: AuthenticatedAppLoansRouteWithChildren,
  AuthenticatedAppProfileRoute: AuthenticatedAppProfileRoute,
  AuthenticatedAppIndexRoute: AuthenticatedAppIndexRoute,
}

const AuthenticatedAppRouteWithChildren =
  AuthenticatedAppRoute._addFileChildren(AuthenticatedAppRouteChildren)

interface AuthenticatedRouteRouteChildren {
  AuthenticatedAdminRoute: typeof AuthenticatedAdminRouteWithChildren
  AuthenticatedAppRoute: typeof AuthenticatedAppRouteWithChildren
}

const AuthenticatedRouteRouteChildren: AuthenticatedRouteRouteChildren = {
  AuthenticatedAdminRoute: AuthenticatedAdminRouteWithChildren,
  AuthenticatedAppRoute: AuthenticatedAppRouteWithChildren,
}

const AuthenticatedRouteRouteWithChildren =
  AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren)

interface AuthRouteChildren {
  AuthResetPasswordRoute: typeof AuthResetPasswordRoute
}

const AuthRouteChildren: AuthRouteChildren = {
  AuthResetPasswordRoute: AuthResetPasswordRoute,
}

const AuthRouteWithChildren = AuthRoute._addFileChildren(AuthRouteChildren)

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  AuthenticatedRouteRoute: AuthenticatedRouteRouteWithChildren,
  AuthRoute: AuthRouteWithChildren,
  ApiPublicPaymentsProviderRoute: ApiPublicPaymentsProviderRoute,
}
export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()
