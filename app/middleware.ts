// import { withAuth } from "next-auth/middleware"
// import { NextResponse } from "next/server"

// export default withAuth(
//     function middleware() {
//       return NextResponse.next()
//     },
//     {
//         callbacks: {
//             async authorized({req,token}) {
//              const {pathName} = req.nextUrl
//              if(pathName.startsWith("/api/auth/") || pathName ==='/login' || pathName ==='/register')
//              {
//                 return true
//              }
//              if(pathName ==='/' || pathName ==='/api/videos')
//              {
//                 return true
//              }
//              return !!token
//             }
//         }
//     }
// )

// export const config = {
//     matcher:[
//         /*
//         * Match all request paths except:
//         * - next/static (static files)
//         * - _next/image (image optimization files)
//         * - favicon.ico (favicon file)
//         *  -public folder
//         */
//         "/((?!_next/static|_next/image|favicon.ico|public).*)",
//     ]
// }



import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default withAuth(
  function middleware(req: NextRequest) {
    return NextResponse.next()
  },
  {
    callbacks: {
      async authorized({ req, token }) {
        const { pathname } = req.nextUrl

        if (
          pathname.startsWith("/api/auth/") ||
          pathname === "/login" ||
          pathname === "/register"
        ) {
          return true
        }

        if (pathname === "/" || pathname === "/api/videos") {
          return true
        }

        return !!token
      },
    },
  }
)

export const config = {
    matcher:[
        /*
        * Match all request paths except:
        * - next/static (static files)
        * - _next/image (image optimization files)
        * - favicon.ico (favicon file)
        *  -public folder
        */
        "/((?!_next/static|_next/image|favicon.ico|public).*)",
    ]
}
