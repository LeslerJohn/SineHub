import Link from 'next/link'
import { Film, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { signup, signInWithProvider } from '@/lib/actions/auth'

export default async function SignupPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams
  const error = searchParams?.error as string | undefined
  const message = searchParams?.message as string | undefined

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Film className="mr-2 h-6 w-6" />
          SineHub
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Join our community to create your own movie collections, rate films, and connect with other moviegoers.&rdquo;
            </p>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Create an account
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email below to create your account
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
              <form action={signup}>
                <div className="grid gap-2">
                  <div className="grid gap-1">
                    <label className="text-sm font-medium leading-none" htmlFor="email">
                      Email
                    </label>
                    <Input
                      id="email"
                      name="email"
                      placeholder="name@example.com"
                      type="email"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      required
                    />
                  </div>
                  <div className="grid gap-1 mt-2">
                    <label className="text-sm font-medium leading-none" htmlFor="password">
                      Password
                    </label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                    />
                  </div>
                  <Button className="mt-4 w-full" type="submit">
                    Sign Up
                  </Button>
                </div>
              </form>
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
            By clicking continue, you agree to our{' '}
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
