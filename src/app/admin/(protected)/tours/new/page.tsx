import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/admin/auth'
import CreateTourWizard from './CreateTourWizard'

export const metadata = { title: 'Create New Tour — ACE Voyages Admin' }

export default async function NewTourPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')
  return <CreateTourWizard />
}
