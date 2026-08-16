import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role;

    if (pathname.startsWith('/teacher') && role !== 'TEACHER') {
      return NextResponse.redirect(new URL('/student', req.url));
    }

    if (pathname.startsWith('/student') && role !== 'STUDENT') {
      return NextResponse.redirect(new URL('/teacher', req.url));
    }
    
    // Notifications route is protected by default by withAuth, both roles can access it
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Protect these routes; requires a valid token
        if (
          pathname.startsWith('/student') || 
          pathname.startsWith('/teacher') || 
          pathname.startsWith('/notifications')
        ) {
          return !!token;
        }
        
        return true;
      }
    }
  }
)

export const config = {
  matcher: ['/student/:path*', '/teacher/:path*', '/notifications/:path*']
}
