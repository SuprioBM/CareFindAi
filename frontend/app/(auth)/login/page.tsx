export const dynamic = "force-dynamic";

import { Suspense } from 'react'
import LoginForm from './component/LoginForm'

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}