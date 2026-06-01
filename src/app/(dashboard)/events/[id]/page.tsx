import { notFound } from 'next/navigation'
import { EventDetailView } from './event-detail'
import { getEvent } from '../actions'

type Props = { params: Promise<{ id: string }> }

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params
  const event = await getEvent(id)
  if (!event) notFound()
  return <EventDetailView event={event} />
}
