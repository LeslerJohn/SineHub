import Link from 'next/link'
import { Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card'
import { signInWithProvider } from '@/lib/actions/auth'
import { getNowPlaying } from '@/lib/tmdb'
import { AuthSlideshow } from '@/components/auth/auth-slideshow'
import { LoginForm } from '@/components/auth/login-form'

export default async function LoginPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams
  const error = searchParams?.error as string | undefined
  const message = searchParams?.message as string | undefined

  const nowPlayingRes = await getNowPlaying().catch(() => ({ results: [] }))
  const movies = (nowPlayingRes.results || []).slice(0, 8)

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <AuthSlideshow movies={movies} />
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email and password to sign in
            </p>
          </div>

          <Card>
            <CardHeader className="p-4 pb-0">
              {error && (
                <div className="flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  <Info className="h-4 w-4" />
                  {error}
                </div>
              )}
              {message && (
                <div className="flex items-center gap-2 rounded-md bg-primary/15 p-3 text-sm text-primary">
                  <Info className="h-4 w-4" />
                  {message}
                </div>
              )}
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <LoginForm />
            </CardContent>
            
            <div className="relative pb-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <CardFooter className="flex flex-col gap-2 p-4 pt-0">
              <form action={signInWithProvider.bind(null, 'google')} className="w-full">
                <Button variant="outline" className="w-full" type="submit">
                  Google
                </Button>
              </form>
            </CardFooter>
          </Card>

          <p className="px-8 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="underline underline-offset-4 hover:text-primary"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
