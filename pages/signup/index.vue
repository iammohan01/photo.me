<template>
  <div class="min-h-screen flex items-center justify-center bg-background">
    <div class="w-full max-w-md space-y-6 px-4">
      <div class="text-center space-y-2">
        <h1 class="text-3xl font-bold tracking-tight">Create an account</h1>
        <p class="text-muted-foreground">Sign up to get started</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sign up</CardTitle>
          <CardDescription>
            Enter your email and password to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form @submit.prevent="handleSignup" class="space-y-4">
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
              {{ isLoading ? 'Signing up...' : 'Sign up' }}
            </Button>
          </form>

          <div v-if="error" class="mt-4">
            <Alert variant="destructive">
              <AlertCircle class="h-4 w-4" />
              <AlertDescription>{{ error }}</AlertDescription>
            </Alert>
          </div>
          <div v-if="success" class="mt-4">
            <Alert variant="success">
              <AlertDescription>{{ success }}</AlertDescription>
            </Alert>
          </div>
        </CardContent>
        <CardFooter class="flex flex-col space-y-2">
          <div class="text-center text-sm text-muted-foreground">
            Already have an account?
            <NuxtLink to="/signin" class="text-primary hover:underline">
              Sign in
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

const signupSchema = toTypedSchema(z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
}))

const { handleSubmit } = useForm({
  validationSchema: signupSchema
})

const { supabase } = useSupabase()
const isLoading = ref(false)
const error = ref('')
const success = ref('')

const handleSignup = handleSubmit(async (values) => {
  try {
    isLoading.value = true
    error.value = ''
    success.value = ''

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: values.email,
      password: values.password
    })

    if (signUpError) {
      error.value = signUpError.message
      return
    }

    if (data.user) {
      success.value = 'Account created! Please check your email to verify your account.'
      // Optionally, redirect or auto-login
      // await navigateTo('/')
    }
  } catch (err) {
    error.value = 'An unexpected error occurred. Please try again.'
    console.error('Signup error:', err)
  } finally {
    isLoading.value = false
  }
})

// If already logged in, redirect
onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await navigateTo('/')
  }
})
</script> 