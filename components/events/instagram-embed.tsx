'use client'

import Script from 'next/script'
import { InstagramIcon } from '@/components/site/brand-icons'
import { site } from '@/data/site'

/**
 * Renders the official Instagram profile embed for @ufnsbe.
 * The blockquote below is Instagram's required embed markup — embed.js
 * (loaded via next/script) finds it on the page and swaps in the live feed.
 */
export function InstagramEmbed() {
  return (
    <>
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={`${site.social.instagram.url}?utm_source=ig_embed&utm_campaign=loading`}
        data-instgrm-version="14"
        style={{
          background: '#FFF',
          border: 0,
          borderRadius: '3px',
          boxShadow: '0 0 1px 0 rgba(0,0,0,0.5), 0 1px 10px 0 rgba(0,0,0,0.15)',
          margin: 0,
          maxWidth: '540px',
          minWidth: '326px',
          padding: 0,
          width: '100%',
        }}
      >
        <div style={{ padding: '24px' }}>
          <a
            href={`${site.social.instagram.url}?utm_source=ig_embed&utm_campaign=loading`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              textAlign: 'center',
              textDecoration: 'none',
            }}
          >
            <InstagramIcon className="size-8" style={{ color: '#3897f0' }} aria-hidden />
            <span style={{ color: '#3897f0', fontFamily: 'Arial, sans-serif', fontSize: '14px', fontWeight: 600 }}>
              View {site.social.instagram.handle} on Instagram
            </span>
          </a>
        </div>
      </blockquote>
      <Script src="https://www.instagram.com/embed.js" strategy="lazyOnload" />
    </>
  )
}
