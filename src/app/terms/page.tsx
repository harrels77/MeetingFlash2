import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import styles from '../legal.module.css'

export default function Terms() {
  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.back}>← MeetingFlash</Link>
        <ThemeToggle />
      </nav>

      <div className={styles.content}>
        <div className={styles.header}>
          <p className={styles.date}>Last updated: April 2026</p>
          <h1 className={styles.title}>Terms of Service</h1>
          <p className={styles.intro}>
            These Terms of Service ("Terms") govern your use of the MeetingFlash
            website and services. By accessing or using MeetingFlash, you agree
            to be bound by these Terms.
          </p>
        </div>

        <section className={styles.section}>
          <h2>1. The Service</h2>
          <p>
            MeetingFlash is a software platform that transforms meeting notes
            and transcripts into structured summaries and action plans
            ("Execution Packs") using artificial intelligence.
          </p>

          <p>
            The service may include both free and paid subscription plans.
            Features, limits, and pricing may change over time.
          </p>
        </section>

        <section className={styles.section}>
          <h2>2. Accounts</h2>

          <ul>
            <li>You must provide accurate information when creating an account.</li>
            <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
            <li>You must be at least 16 years old to use the service.</li>
            <li>You may not create multiple accounts to bypass usage limits.</li>
          </ul>

          <p>
            You are responsible for all activity that occurs under your account.
          </p>
        </section>

        <section className={styles.section}>
          <h2>3. Acceptable Use</h2>

          <p>You agree not to use MeetingFlash to:</p>

          <ul>
            <li>Upload illegal, harmful, or abusive content</li>
            <li>Process confidential third-party information without proper authorization</li>
            <li>Attempt to reverse engineer or exploit the service</li>
            <li>Use bots or automated scripts to abuse the platform</li>
            <li>Resell or redistribute the service without permission</li>
          </ul>

          <p>
            We reserve the right to suspend or terminate accounts that violate
            these rules.
          </p>
        </section>

        <section className={styles.section}>
          <h2>4. Subscriptions and Payments</h2>

          <ul>
            <li>MeetingFlash may offer free and paid subscription plans.</li>
            <li>Paid plans are billed on a recurring basis.</li>
            <li>Subscriptions renew automatically unless cancelled before the renewal date.</li>
            <li>Payments are processed securely through Stripe.</li>
          </ul>

          <p>
            We do not store or process credit card information directly.
          </p>

          <p>
            Refunds may be granted at our discretion within a limited time
            period after a charge.
          </p>
        </section>

        <section className={styles.section}>
          <h2>5. User Content</h2>

          <p>
            You retain ownership of all content you submit to MeetingFlash,
            including meeting transcripts and notes.
          </p>

          <p>
            By using the service, you grant MeetingFlash a limited license to
            process this content for the sole purpose of generating summaries
            and providing the service functionality.
          </p>

          <p>
            We do not claim ownership of your meeting data.
          </p>
        </section>

        <section className={styles.section}>
          <h2>6. AI-Generated Output</h2>

          <p>
            MeetingFlash uses artificial intelligence to generate summaries and
            action plans.
          </p>

          <ul>
            <li>AI-generated results may contain inaccuracies.</li>
            <li>You are responsible for reviewing all generated content.</li>
            <li>MeetingFlash is not responsible for decisions made based on AI output.</li>
          </ul>

          <p>
            The service is intended as a productivity aid and not as a
            substitute for professional judgment.
          </p>
        </section>

        <section className={styles.section}>
          <h2>7. Intellectual Property</h2>

          <p>
            The MeetingFlash platform, including its design, software,
            branding, and content, is the property of MeetingFlash and is
            protected by applicable intellectual property laws.
          </p>

          <p>
            You may not copy, reproduce, distribute, or modify any part of the
            service without written permission.
          </p>
        </section>

        <section className={styles.section}>
          <h2>8. Service Availability</h2>

          <p>
            We strive to provide reliable access to the platform but do not
            guarantee uninterrupted availability.
          </p>

          <p>
            The service may occasionally be unavailable due to maintenance,
            updates, or external factors.
          </p>
        </section>

        <section className={styles.section}>
          <h2>9. Termination</h2>

          <ul>
            <li>You may stop using the service at any time.</li>
            <li>You may delete your account through your dashboard.</li>
            <li>We may suspend or terminate accounts that violate these Terms.</li>
          </ul>

          <p>
            After account deletion, stored data may be removed from our systems
            within a reasonable period.
          </p>
        </section>

        <section className={styles.section}>
          <h2>10. Limitation of Liability</h2>

          <p>
            MeetingFlash is provided on an "as-is" and "as-available" basis.
          </p>

          <p>
            To the maximum extent permitted by law, MeetingFlash shall not be
            liable for indirect, incidental, or consequential damages arising
            from the use of the service.
          </p>
        </section>

        <section className={styles.section}>
          <h2>11. Changes to the Terms</h2>

          <p>
            We may update these Terms from time to time. Significant changes
            will be communicated through the website or via email.
          </p>

          <p>
            Continued use of the service after changes take effect constitutes
            acceptance of the updated Terms.
          </p>
        </section>

        <section className={styles.section}>
          <h2>12. Governing Law</h2>

          <p>
            These Terms shall be governed by and interpreted in accordance with
            the laws applicable in the jurisdiction where the company operating
            MeetingFlash is established.
          </p>
        </section>

        <section className={styles.section}>
          <h2>13. Contact</h2>

          <p>
            For questions regarding these Terms, please contact:
          </p>

          <p>
            <strong>legal@meetingflash.app</strong>
          </p>
        </section>
      </div>
    </div>
  )
}