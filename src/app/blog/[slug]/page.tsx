import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { articles, getArticle, getRelatedArticles } from '@/lib/blog'
import styles from '../blog.module.css'

export function generateStaticParams() {
  return articles.map(a => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = getArticle(params.slug)
  if (!article) return {}
  const url = `https://meetingflash.work/blog/${article.slug}`
  return {
    title: `${article.title} — MeetingFlash`,
    description: article.description,
    alternates: { canonical: `/blog/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.description,
      url,
      type: 'article',
      publishedTime: article.date,
      authors: ['Simon Harrel'],
      section: article.category,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
    },
  }
}

function articleJsonLd(article: { slug: string; title: string; description: string; date: string; category: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://meetingflash.work/blog/${article.slug}`,
    },
    headline: article.title,
    description: article.description,
    image: 'https://meetingflash.work/opengraph-image',
    datePublished: article.date,
    dateModified: article.date,
    articleSection: article.category,
    author: {
      '@type': 'Person',
      name: 'Simon Harrel',
      url: 'https://meetingflash.work',
    },
    publisher: {
      '@type': 'Organization',
      name: 'MeetingFlash',
      logo: {
        '@type': 'ImageObject',
        url: 'https://meetingflash.work/logo.png',
      },
    },
  }
}

function parseInline(line: string, keyBase: string): React.ReactNode[] {
  // Tokenize a single line for **bold** and [text](url) markdown
  const nodes: React.ReactNode[] = []
  const re = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)]+)\)/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  let i = 0
  while ((match = re.exec(line)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(line.slice(lastIndex, match.index))
    }
    if (match[1] !== undefined) {
      nodes.push(<strong key={`${keyBase}-${i++}`}>{match[1]}</strong>)
    } else if (match[2] !== undefined && match[3] !== undefined) {
      const href = match[3]
      const text = match[2]
      const isInternal = href.startsWith('/') || href.startsWith('#')
      nodes.push(
        isInternal
          ? <Link key={`${keyBase}-${i++}`} href={href} className={styles.articleLink}>{text}</Link>
          : <a key={`${keyBase}-${i++}`} href={href} className={styles.articleLink} rel="noopener">{text}</a>
      )
    }
    lastIndex = re.lastIndex
  }
  if (lastIndex < line.length) {
    nodes.push(line.slice(lastIndex))
  }
  return nodes
}

function renderContent(content: string) {
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let key = 0

  for (const line of lines) {
    if (line.startsWith('## ')) {
      elements.push(<h2 key={key++} className={styles.articleH2}>{line.slice(3)}</h2>)
    } else if (line.startsWith('**') && line.endsWith('**') && !line.slice(2, -2).includes('**')) {
      elements.push(<p key={key++} className={styles.articleBold}>{line.slice(2, -2)}</p>)
    } else if (line.startsWith('> ')) {
      elements.push(<blockquote key={key++} className={styles.articleQuote}>{parseInline(line.slice(2), `q-${key}`)}</blockquote>)
    } else if (line.startsWith('- ') || line.startsWith('• ')) {
      elements.push(<li key={key++} className={styles.articleLi}>{parseInline(line.slice(2), `li-${key}`)}</li>)
    } else if (line.match(/^\d+\. /)) {
      const text = line.replace(/^\d+\. /, '')
      elements.push(<p key={key++} className={styles.articleP}>{parseInline(text, `n-${key}`)}</p>)
    } else if (line.trim() === '') {
      elements.push(<div key={key++} className={styles.articleSpacer} />)
    } else if (line.trim()) {
      elements.push(<p key={key++} className={styles.articleP}>{parseInline(line, `p-${key}`)}</p>)
    }
  }
  return elements
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = getArticle(params.slug)
  if (!article) notFound()
  const related = getRelatedArticles(params.slug, 3)

  return (
    <div className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(article)) }}
      />
      <nav className={styles.nav}>
        <Link href="/" className={styles.navLogo}>⚡ MeetingFlash</Link>
        <Link href="/app" className={styles.navCta}>Try free →</Link>
      </nav>

      <div className={styles.articleContent}>
        <div className={styles.articleMeta}>
          <Link href="/blog" className={styles.backLink}>← Blog</Link>
          <span className={styles.cardDot}>·</span>
          <span className={styles.cardCategory}>{article.category}</span>
          <span className={styles.cardDot}>·</span>
          <span className={styles.cardRead}>{article.readTime} read</span>
        </div>

        <h1 className={styles.articleTitle}>{article.title}</h1>
        <p className={styles.articleLead}>{article.description}</p>

        <div className={styles.articleBody}>
          {renderContent(article.content)}
        </div>

        <div className={styles.articleCta}>
          <div className={styles.articleCtaInner}>
            <div className={styles.articleCtaTitle}>Ready to try it?</div>
            <p className={styles.articleCtaSub}>Paste your meeting notes and get decisions, action items, follow-up email and Slack message in under 20 seconds.</p>
            <Link href="/app" className={styles.articleCtaBtn}>Run your first Flash free →</Link>
          </div>
        </div>

        {related.length > 0 && (
          <div className={styles.relatedBlock}>
            <div className={styles.relatedTitle}>Related reading</div>
            <div className={styles.relatedGrid}>
              {related.map(r => (
                <Link key={r.slug} href={`/blog/${r.slug}`} className={styles.relatedCard}>
                  <div className={styles.relatedCategory}>{r.category}</div>
                  <div className={styles.relatedCardTitle}>{r.title}</div>
                  <div className={styles.relatedCardDesc}>{r.description}</div>
                  <div className={styles.relatedCardMore}>Read →</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className={styles.footer}>
        <Link href="/" className={styles.footerLogo}>⚡ MeetingFlash</Link>
        <p className={styles.footerSub}>Turn meeting notes into execution — instantly.</p>
        <Link href="/app" className={styles.footerCta}>Try free →</Link>
      </footer>
    </div>
  )
}
