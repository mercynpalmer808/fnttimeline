import { createFileRoute } from '@tanstack/react-router'
import TimelineCreator from '../components/TimelineCreator'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className="min-h-screen flex py-8 justify-center bg-slate-50">
      <TimelineCreator />
    </div>
  )
}
