import { Container, Eyebrow, ArrowLink } from '@/components/site/primitives'
import { stats } from '@/data/stats'

export function Overview() {
  return (
    <section className="border-b border-border bg-background">
      <Container className="py-20 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Eyebrow>Who we are</Eyebrow>
            <h2 className="mt-4 font-serif text-3xl font-medium leading-[1.1] tracking-tight text-balance sm:text-4xl">
              A community engineering its future at the University of Florida.
            </h2>
          </div>
          <div className="flex flex-col gap-6 lg:col-span-7">
            <p className="text-lg leading-relaxed text-muted-foreground text-pretty">
              UF NSBE is the University of Florida&apos;s home for Black engineers and technologists.
              We exist to increase the number of culturally responsible engineers who excel
              academically, succeed professionally, and give back to their community.
            </p>
            <p className="text-lg leading-relaxed text-muted-foreground text-pretty">
              Through mentorship, professional development, and a tight-knit community, we help
              students thrive from their first semester through graduation and into their careers.
            </p>
            <div className="pt-1">
              <ArrowLink href="/about">Learn more about the chapter</ArrowLink>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}

export function Stats() {
  return (
    <section className="bg-ink text-white">
      <Container className="py-16 sm:py-20">
        <dl className="grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="border-l border-white/15 pl-5">
              <dt className="text-sm font-medium text-white/60">{stat.label}</dt>
              <dd className="mt-2 font-serif text-4xl font-medium tracking-tight sm:text-5xl">
                {stat.value}
                {stat.suffix ? <span className="text-nsbe-green">{stat.suffix}</span> : null}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-8 text-xs text-white/40">
          As of the 2026-2027 academic year.
        </p>
      </Container>
    </section>
  )
}
