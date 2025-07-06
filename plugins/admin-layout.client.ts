export default defineNuxtPlugin(async () => {
    const route = useRoute()
    if (route.path.startsWith('/admin/')) {
        setPageLayout('admin')
    }
}) 