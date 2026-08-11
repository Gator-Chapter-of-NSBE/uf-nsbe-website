import { Hero } from '@/components/home/hero'
import { EventCarousel } from '@/components/home/event-carousel'
import { Overview, Stats } from '@/components/home/overview'
import { ProgramsPreview } from '@/components/home/programs-preview'
import { TrailblazersSpotlight } from '@/components/home/trailblazers-spotlight'
import { JoinCta } from '@/components/home/join-cta'
import { getEventPhotos } from '@/data/photos'

export default function HomePage() {
  const photos = getEventPhotos()

  return (
    <>
      <Hero />
      <Stats />
      <Overview />
      <EventCarousel photos={photos} />
      <ProgramsPreview />
      <TrailblazersSpotlight />
      <JoinCta />
    </>
  )
}
