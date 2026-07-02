import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import MobileNav from '@/components/MobileNav'
import { articles } from '@/lib/blog'
import styles from './blog.module.css'

export const metadata: Metadata = {
  title: 'Blog — Meeting productivity, recap workflows, and AI tips',
  description: 'Tips and best practices for running better meetings, writing effective notes, and getting more done after every call.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'MeetingFlash Blog',
    description: 'Practical guides for teams who want to get more done after every meeting.',
    url: 'https://www.meetingflash.work/blog',
    type: 'website',
  },
}

export default function BlogIndex() {
  return (
    <div className={styles.page}>
      <MobileNav />

      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.pill}>Blog</div>
          <h1 className={styles.title}>Better meetings, better execution.</h1>
          <p className={styles.sub}>Practical guides for teams who want to get more done after every meeting.</p>
        </div>

        <div className={styles.grid}>
          {articles.map(article => (
            <Link key={article.slug} href={`/blog/${article.slug}`} className={styles.card}>
              <div className={styles.cardMeta}>
                <span className={styles.cardCategory}>{article.category}</span>
                <span className={styles.cardDot}>·</span>
                <span className={styles.cardRead}>{article.readTime} read</span>
              </div>
              <h2 className={styles.cardTitle}>{article.title}</h2>
              <p className={styles.cardDesc}>{article.description}</p>
              <div className={styles.cardFooter}>
                <span className={styles.cardDate}>
                  {new Date(article.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <span className={styles.cardArrow}>→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <footer className={styles.footer}>
        <Link href="/" className={styles.footerLogo}>
          <Image src="/logo.png" alt="MeetingFlash" width={22} height={22} style={{ borderRadius: 5 }} />
          MeetingFlash
        </Link>
        <p className={styles.footerSub}>Turn meeting notes into execution — instantly.</p>
        <Link href="/app" className={styles.footerCta}>Try free →</Link>
      </footer>
    </div>
  )
}
