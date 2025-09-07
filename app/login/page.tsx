import { login, signup } from './actions'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form className="space-y-4 bg-white p-6 rounded shadow" method="post">
        <h2 className="text-2xl font-bold">Admin Login</h2>
        <div>
          <label htmlFor="email" className="block font-medium">Email:</label>
          <input id="email" name="email" type="email" required className="border p-2 w-full"/>
        </div>
        <div>
          <label htmlFor="password" className="block font-medium">Password:</label>
          <input id="password" name="password" type="password" required className="border p-2 w-full"/>
        </div>
        <div className="flex space-x-2">
          <button type="submit" formAction={login} className="px-4 py-2 bg-blue-600 text-white rounded">
            Log In
          </button>
          <button type="submit" formAction={signup} className="px-4 py-2 bg-green-600 text-white rounded">
            Sign Up
          </button>
        </div>
      </form>
    </div>
  )
}
