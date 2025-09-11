import { login, signup } from "~/app/login/actions";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-blue-900 to-purple-900 text-white">
      <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Welcome to <span className="text-blue-300">People Met</span>
          </h1>
          <p className="mt-4 text-xl text-blue-100">
            Sign in to manage your connections and encounters
          </p>
        </div>

        {/* Login Form */}
        <div className="w-full max-w-md rounded-lg bg-white/10 p-8 backdrop-blur-sm">
          <form className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-blue-100"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-2 block w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-blue-200 backdrop-blur-sm focus:border-blue-300 focus:ring-2 focus:ring-blue-300 focus:outline-none"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-blue-100"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-2 block w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-blue-200 backdrop-blur-sm focus:border-blue-300 focus:ring-2 focus:ring-blue-300 focus:outline-none"
                placeholder="Enter your password"
              />
            </div>

            <div className="space-y-4">
              <button
                formAction={login}
                className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent focus:outline-none"
              >
                Sign In
              </button>

              <button
                formAction={signup}
                className="w-full rounded-md border border-white/20 bg-white/10 px-4 py-2 font-medium text-white transition-colors hover:bg-white/20 focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent focus:outline-none"
              >
                Create Account
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-blue-200">
            Secure authentication powered by Supabase
          </p>
        </div>
      </div>
    </main>
  );
}
