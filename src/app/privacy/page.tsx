import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import styles from '../legal.module.css'

export default function Privacy() {
  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.back}>← MeetingFlash</Link>
        <ThemeToggle />
      </nav>

      <div className={styles.content}>
        <div className={styles.header}>
          <p className={styles.date}>Last updated: April 2026</p>
          <h1 className={styles.title}>Privacy Policy</h1>
          <p className={styles.intro}>
            This Privacy Policy explains how MeetingFlash ("we", "our", or "us")
            collects, uses, and protects your information when you use our
            website and services.
          </p>
        </div>

        <section className={styles.section}>
          <h2>1. Information We Collect</h2>

          <p>We may collect the following categories of information:</p>

          <ul>
            <li>
              <strong>Account Information</strong> — When you create an account,
              we collect your name, email address, and authentication details.
            </li>

            <li>
              <strong>Meeting Content</strong> — When you paste meeting notes or
              transcripts into MeetingFlash, the content is temporarily sent to
              our AI processing provider in order to generate your Execution
              Pack.
            </li>

            <li>
              <strong>Generated Content</strong> — Execution Packs and summaries
              generated through the platform may be stored in your account so
              you can access them later.
            </li>

            <li>
              <strong>Usage Information</strong> — We may collect limited
              information about how the service is used, including number of
              packs generated, feature usage, and timestamps.
            </li>

            <li>
              <strong>Payment Information</strong> — Payments are processed
              securely through Stripe. We do not store credit card details.
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>2. How We Use Your Information</h2>

          <p>Your information is used only to operate and improve the service.</p>

          <ul>
            <li>Provide and operate the MeetingFlash platform</li>
            <li>Generate Execution Packs using AI processing</li>
            <li>Maintain your account and saved packs</li>
            <li>Process subscriptions and billing</li>
            <li>Send essential service emails (login, password reset, billing)</li>
            <li>Improve product functionality and reliability</li>
          </ul>

          <p>We do <strong>not</strong> sell your personal data.</p>
        </section>

        <section className={styles.section}>
          <h2>3. AI Processing</h2>

          <p>
            MeetingFlash uses third-party AI services to analyze meeting
            transcripts and generate structured summaries.
          </p>

          <p>
            Meeting transcripts submitted to the platform are transmitted to
            the AI provider solely for the purpose of generating your Execution
            Pack.
          </p>

          <ul>
            <li>We do not use your meeting data to train AI models.</li>
            <li>Transcripts are processed only to generate results.</li>
            <li>MeetingFlash does not permanently store raw transcripts.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>4. Third-Party Services</h2>

          <p>We rely on trusted third-party providers to operate the service.</p>

          <ul>
            <li>
              <strong>Supabase</strong> — authentication and database hosting
            </li>
            <li>
              <strong>Anthropic</strong> — AI processing of meeting transcripts
            </li>
            <li>
              <strong>Stripe</strong> — payment processing
            </li>
          </ul>

          <p>
            Each provider processes data according to their own privacy
            policies.
          </p>
        </section>

        <section className={styles.section}>
          <h2>5. Data Retention</h2>

          <ul>
            <li>
              Meeting transcripts submitted to generate Execution Packs are not
              permanently stored.
            </li>

            <li>
              Generated Execution Packs may be stored in your account until you
              delete them.
            </li>

            <li>
              Account information is retained as long as your account remains
              active.
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>6. Data Security</h2>

          <p>
            We implement industry-standard security measures to protect your
            information, including encrypted connections (HTTPS), secure
            authentication, and controlled access to stored data.
          </p>

          <p>
            However, no internet service can be guaranteed to be completely
            secure.
          </p>
        </section>

        <section className={styles.section}>
          <h2>7. International Data Transfers</h2>

          <p>
            Your information may be processed in different countries depending
            on the location of our infrastructure providers.
          </p>

          <p>
            We ensure that any such transfers comply with applicable data
            protection laws.
          </p>
        </section>

        <section className={styles.section}>
          <h2>8. Your Rights</h2>

          <p>
            Depending on your location, you may have rights under data
            protection laws including:
          </p>

          <ul>
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Request a copy of your data</li>
            <li>Object to certain types of processing</li>
          </ul>

          <p>
            To exercise these rights, contact us at
            <strong> privacy@meetingflash.app</strong>.
          </p>
        </section>

        <section className={styles.section}>
          <h2>9. Cookies</h2>

          <p>
            MeetingFlash uses only essential cookies required for
            authentication, security, and core functionality. We do not use
            advertising cookies.
          </p>
        </section>

        <section className={styles.section}>
          <h2>10. Children's Privacy</h2>

          <p>
            MeetingFlash is not intended for use by individuals under the age
            of 13. We do not knowingly collect personal information from
            children.
          </p>
        </section>

        <section className={styles.section}>
          <h2>11. Changes to this Policy</h2>

          <p>
            We may update this Privacy Policy from time to time. Updates will
            be posted on this page with a revised "Last updated" date.
          </p>
        </section>

        <section className={styles.section}>
          <h2>12. Contact</h2>

          <p>
            If you have questions about this Privacy Policy, contact us at:
          </p>

          <p>
            <strong>privacy@meetingflash.app</strong>
          </p>
        </section>

      </div>
    </div>
  )
}