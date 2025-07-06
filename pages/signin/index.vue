<template>
  <div class="min-h-screen flex items-center justify-center bg-background">
    <div class="w-full max-w-md space-y-6 px-4">
      <div class="text-center space-y-2">
        <h1 class="text-3xl font-bold tracking-tight">Welcome back</h1>
        <p class="text-muted-foreground">Enter your credentials to access your account</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Enter your email and password to sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form @submit.prevent="handleLogin" class="space-y-4">
            <FormField v-slot="{ componentField }" name="email">
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    v-bind="componentField"
                    type="email"
                    placeholder="Enter your email"
                    :disabled="isLoading"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="password">
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    v-bind="componentField"
                    type="password"
                    placeholder="Enter your password"
                    :disabled="isLoading"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <Button type="submit" class="w-full" :disabled="isLoading">
              <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
              {{ isLoading ? 'Signing in...' : 'Sign in' }}
            </Button>
          </form>

          <div v-if="error" class="mt-4">
            <Alert variant="destructive">
              <AlertCircle class="h-4 w-4" />
              <AlertDescription>{{ error }}</AlertDescription>
            </Alert>
          </div>
        </CardContent>
        <CardFooter class="flex flex-col space-y-2">
          <div class="text-center text-sm text-muted-foreground">
            Don't have an account?
            <NuxtLink to="/signup" class="text-primary hover:underline">
              Sign up
            </NuxtLink>
          </div>
        </CardFooter>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { Loader2, AlertCircle } from 'lucide-vue-next'

// Form validation schema
const loginSchema = toTypedSchema(z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
}))

// Form setup
const { handleSubmit, errors } = useForm({
  validationSchema: loginSchema
})

// Supabase client
const { supabase } = useSupabase()

// Reactive state
const isLoading = ref(false)
const error = ref('')

// Login handler
const handleLogin = handleSubmit(async (values) => {
  try {
    isLoading.value = true
    error.value = ''

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password
    })

    if (authError) {
      error.value = authError.message
      return
    }

    if (data.user) {
      // Redirect to dashboard or home page after successful login
      await navigateTo('/')
    }
  } catch (err) {
    error.value = 'An unexpected error occurred. Please try again.'
    console.error('Login error:', err)
  } finally {
    isLoading.value = false
  }
})

// Check if user is already logged in
onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await navigateTo('/')
  }
})
</script>