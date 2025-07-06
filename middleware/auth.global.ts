export default defineNuxtRouteMiddleware(async (to, from) => {

    if (import.meta.server) return

    const {supabase} = useSupabase()
    const {data: {user}} = await supabase.auth.getUser()

    const protectedRoutes = ['/dashboard', '/profile', '/settings', '/admin']
    const publicRoutes = ['/login', '/register', '/forgot-password', '/']

    const isProtectedRoute = protectedRoutes.some(route =>
        to.path.startsWith(route)
    )

    const isPublicAuthRoute = ['/login', '/register', '/forgot-password'].includes(to.path)
    if (isProtectedRoute && !user) {
        // return navigateTo('/signin')
        window.location.pathname = '/signin'
    }
    // if (isPublicAuthRoute && !user) {
    //     return navigateTo('/si')
    // }
})