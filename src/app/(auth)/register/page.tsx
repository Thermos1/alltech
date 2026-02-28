import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Вход — АЛТЕХ',
}

export default function RegisterPage() {
  redirect('/login')
}
