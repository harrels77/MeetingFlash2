import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { articles, getArticle } from '@/lib/blog'
import styles from '../blog.module.css'

export function generateStaticParams() {
  return articles.map(a => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = getArticle(params.slug)
  if (!article) return {}
  return {
    title: `${article.title} — MeetingFlash`,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      type: 'article',
      publishedTime: article.date,
    },
  }
}

function renderContent(content: string) {
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let key = 0

  for (const line of lines) {
    if (line.startsWith('## ')) {
      elements.push(<h2 key={key++} className={styles.articleH2}>{line.slice(3)}</h2>)
    } else if (line.startsWith('**') && line.endsWith('**')) {
      elements.push(<p key={key++} className={styles.articleBold}>{line.slice(2, -2)}</p>)
    } else if (line.startsWith('> ')) {
      elements.push(<blockquote key={key++} className={styles.articleQuote}>{line.slice(2)}</blockquote>)
    } else if (line.startsWith('- ')) {
      elements.push(<li key={key++} className={styles.articleLi}>{line.slice(2)}</li>)
    } else if (line.startsWith('• ')) {
      elements.push(<li key={key++} className={styles.articleLi}>{line.slice(2)}</li>)
    } else if (line.match(/^\d+\. \*\*/)) {
      const text = line.replace(/^\d+\. \*\*(.+?)\*\*(.*)/, (_, bold, rest) => `${bold}${rest}`)
      elements.push(<p key={key++} className={styles.articleP}><strong>{text.split('**')[0]}</strong>{text.split('**')[1] || ''}</p>)
    } else if (line.trim() === '') {
      elements.push(<div key={key++} className={styles.articleSpacer} />)
    } else if (line.trim()) {
      // Handle inline bold (**text**)
      const parts = line.split(/\*\*(.+?)\*\*/g)
      if (parts.length > 1) {
        elements.push(
          <p key={key++} className={styles.articleP}>
            {parts.map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}
          </p>
        )
      } else {
        elements.push(<p key={key++} className={styles.articleP}>{line}</p>)
      }
    }
  }
  return elements
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = getArticle(params.slug)
  if (!article) notFound()

  return (
    <div className={styles.page}>
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
      </div>

      <footer className={styles.footer}>
        <Link href="/" className={styles.footerLogo}>⚡ MeetingFlash</Link>
        <p className={styles.footerSub}>Turn meeting notes into execution — instantly.</p>
        <Link href="/app" className={styles.footerCta}>Try free →</Link>
      </footer>
    </div>
  )
}
