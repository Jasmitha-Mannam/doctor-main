import { useNavigate } from 'react-router-dom'
import styles from './Landing.module.css'

const features = [
  { icon: '🩺', title: 'Find Specialists',  desc: 'Browse 20+ specialties and 100+ verified doctors instantly.' },
  { icon: '📅', title: 'Book in Seconds',   desc: 'Pick your slot, choose online or in-clinic, confirm instantly.' },
  { icon: '💻', title: 'Teleconsultation',  desc: 'Skip the commute. Consult top doctors from your home.' },
  { icon: '📋', title: 'Track Everything',  desc: 'All your appointments and records in one place.' },
]

const steps = [
  { n: '01', title: 'Register',      desc: 'Create your free patient account in under a minute.' },
  { n: '02', title: 'Find a Doctor', desc: 'Filter by specialty, mode, and availability.' },
  { n: '03', title: 'Book a Slot',   desc: 'Choose your preferred time and confirm instantly.' },
  { n: '04', title: 'Get Care',      desc: 'Attend online or visit the clinic. Stay healthy.' },
]

export default function Landing() {
  const nav = useNavigate()

  return (
    <div className={styles.page}>

      {/* ── NAV ─────────────────────────────────── */}
      <nav className={styles.nav}>
        <div className={styles.navBrand}>
          <div className={styles.navIcon}>✚</div>
          <span>MediBook</span>
        </div>
        <div className={styles.navLinks}>
          <button className={styles.btnOutline} onClick={() => nav('/login')}>Sign In</button>
          <button className={styles.btnPrimary} onClick={() => nav('/register')}>Get Started</button>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>✦ Healthcare made simple</div>
          <h1 className={styles.heroTitle}>
            Your health,<br />
            <span className={styles.heroAccent}>in good hands.</span>
          </h1>
          <p className={styles.heroSub}>
            Book appointments with top doctors online or in-clinic.
            Real-time availability, instant confirmation, zero waiting.
          </p>
          <div className={styles.heroCtas}>
            <button className={styles.btnPrimary} style={{ padding: '14px 32px', fontSize: '15px' }}
              onClick={() => nav('/register')}>
              Book an Appointment →
            </button>
            <button className={styles.btnOutline} style={{ padding: '14px 28px', fontSize: '15px' }}
              onClick={() => nav('/register?role=doctor')}>
              Join as a Doctor
            </button>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.heroStat}><span>500+</span><p>Doctors</p></div>
            <div className={styles.statDiv}/>
            <div className={styles.heroStat}><span>20+</span><p>Specialties</p></div>
            <div className={styles.statDiv}/>
            <div className={styles.heroStat}><span>10k+</span><p>Patients</p></div>
          </div>
        </div>

        <div className={styles.heroVisual}>
          <div className={styles.floatCard} style={{ top: '12%', left: '6%' }}>
            <div className={styles.fcIcon} style={{ background: '#e8f5f3', color: '#2a9d8f' }}>🩺</div>
            <div>
              <div className={styles.fcTitle}>Dr. Priya Sharma</div>
              <div className={styles.fcSub}>Cardiology · Online</div>
            </div>
          </div>
          <div className={styles.floatCard} style={{ top: '38%', right: '4%' }}>
            <div className={styles.fcIcon} style={{ background: '#eef2ff', color: '#1a56db' }}>✅</div>
            <div>
              <div className={styles.fcTitle}>Appointment confirmed!</div>
              <div className={styles.fcSub}>Today · 10:30 AM</div>
            </div>
          </div>
          <div className={styles.floatCard} style={{ bottom: '14%', left: '10%' }}>
            <div className={styles.fcIcon} style={{ background: '#fef9c3', color: '#d97706' }}>⭐</div>
            <div>
              <div className={styles.fcTitle}>4.9 / 5.0 rating</div>
              <div className={styles.fcSub}>2,400+ reviews</div>
            </div>
          </div>
          <div className={styles.centerCard}>
            <div className={styles.centerCardTop}>
              <div className={styles.docAvatar}>PS</div>
              <div>
                <div className={styles.ccName}>Dr. Priya Sharma</div>
                <div className={styles.ccSpec}>Cardiologist</div>
              </div>
              <div className={styles.onlineDot}/>
            </div>
            <div className={styles.ccSlots}>
              <div className={styles.ccSlotsLabel}>Available today</div>
              <div className={styles.ccSlotRow}>
                {['09:00','10:30','11:00','02:00','03:30'].map(t => (
                  <div key={t} className={styles.slotPill}>{t}</div>
                ))}
              </div>
            </div>
            <button className={styles.ccBook}>Book Now</button>
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────── */}
      <section className={styles.features}>
        <div className={styles.sectionHead}>
          <h2>Everything you need</h2>
          <p>One platform for patients and doctors</p>
        </div>
        <div className={styles.featureGrid}>
          {features.map(f => (
            <div key={f.title} className={styles.featureCard}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────── */}
      <section className={styles.howIt}>
        <div className={styles.sectionHead}>
          <h2>How it works</h2>
          <p>Get care in 4 simple steps</p>
        </div>
        <div className={styles.stepsRow}>
          {steps.map((s, i) => (
            <div key={s.n} className={styles.stepCard}>
              <div className={styles.stepNum}>{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              {i < steps.length - 1 && <div className={styles.stepArrow}>→</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────── */}
      <section className={styles.cta}>
        <h2>Ready to take charge of your health?</h2>
        <p>Join thousands of patients already using MediBook.</p>
        <button className={styles.ctaBtn} onClick={() => nav('/register')}>
          Create Free Account →
        </button>
      </section>

      {/* ── FOOTER ──────────────────────────────── */}
      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <div className={styles.navIcon} style={{ width: 24, height: 24, fontSize: 12 }}>✚</div>
          <span style={{ fontWeight: 600 }}>MediBook</span>
        </div>
        <div className={styles.footerLinks}>
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Help Center</span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-3)' }}>© 2026 MediBook. All rights reserved.</p>
      </footer>

    </div>
  )
}
