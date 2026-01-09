import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/v1/guides/quick-start">
            Quick Start →
          </Link>
          <Link
            className="button button--outline button--secondary button--lg"
            to="/docs/v1/spec/introduction">
            Read the Spec
          </Link>
        </div>
      </div>
    </header>
  );
}

type FeatureItem = {
  title: string;
  description: JSX.Element;
  icon: string;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Architectural Governance',
    icon: '🏛️',
    description: (
      <>
        Define structural boundaries and invariants that cannot be violated.
        The constitution enforces architectural integrity programmatically.
      </>
    ),
  },
  {
    title: 'Autonomous-Ready',
    icon: '🤖',
    description: (
      <>
        Designed for LLM generation without human-in-the-loop. Formal constraints
        replace process discipline—LLMs simply cannot violate contracts.
      </>
    ),
  },
  {
    title: 'Controlled Evolution',
    icon: '🔄',
    description: (
      <>
        Track every architectural change with full history. Git-native versioning
        provides branching, diffing, and migration paths.
      </>
    ),
  },
  {
    title: 'Stack-Agnostic',
    icon: '🔧',
    description: (
      <>
        Works with any technology stack. Generate TypeScript, Python, Go, or any
        language while maintaining structural integrity.
      </>
    ),
  },
  {
    title: 'Contract Enforcement',
    icon: '🔒',
    description: (
      <>
        Define invariants, temporal constraints, and policies. The validator
        ensures your system's structural integrity is preserved.
      </>
    ),
  },
  {
    title: 'Prevents Degradation',
    icon: '🛡️',
    description: (
      <>
        Protect against architectural erosion over time. Unauthorized coupling,
        contract violations, and schema drift are blocked automatically.
      </>
    ),
  },
];

function Feature({title, icon, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className={styles.featureCard}>
        <div className={styles.featureIcon}>{icon}</div>
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

function HomepageComparison(): JSX.Element {
  return (
    <section className={styles.codeSection}>
      <div className="container">
        <div className="row">
          <div className="col col--6">
            <Heading as="h2">Why Formal Constraints?</Heading>
            <p>
              Traditional specification-driven approaches rely on process discipline
              and human oversight. System Constitution embeds constraints directly
              into the architecture definition.
            </p>
            <table style={{width: '100%', marginBottom: '1rem'}}>
              <thead>
                <tr>
                  <th>Without Constitution</th>
                  <th>With Constitution</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Stability via discipline</td>
                  <td>Stability via constraints</td>
                </tr>
                <tr>
                  <td>Human-in-the-loop required</td>
                  <td>Autonomous generation</td>
                </tr>
                <tr>
                  <td>Process protects system</td>
                  <td>Contracts protect system</td>
                </tr>
              </tbody>
            </table>
            <Link
              className="button button--primary button--lg"
              to="/docs/v1/spec/domain-layer">
              Learn the Syntax
            </Link>
          </div>
          <div className="col col--6">
            <pre className={styles.codeBlock}>
{`spec: sysconst/v1

project:
  id: myapp
  versioning:
    strategy: semver
    current: "1.0.0"

domain:
  nodes:
    - kind: Entity
      id: entity.user
      spec:
        fields:
          id: { type: uuid, required: true }
          email: { type: string, required: true }
      contracts:
        - invariant: "email != ''"
        - type: api-compatibility
          rule: "minor cannot remove fields"`}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomepageCTA(): JSX.Element {
  return (
    <section className={styles.ctaSection}>
      <div className="container">
        <Heading as="h2">Ready to Get Started?</Heading>
        <p>
          Install the CLI and create your first constitution in minutes.
        </p>
        <pre className={styles.installCommand}>
          npm install -g @sysconst/cli
        </pre>
        <div className={styles.buttons}>
          <Link
            className="button button--primary button--lg"
            to="/docs/v1/guides/quick-start">
            Get Started
          </Link>
          <Link
            className="button button--outline button--primary button--lg"
            href="https://github.com/nicholasoxford/system-constitution">
            View on GitHub
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} - Architectural governance for autonomous evolution`}
      description="System Constitution is an architectural governance layer that enforces structural integrity and controls permissible evolution of software systems. Designed for autonomous LLM generation without human-in-the-loop.">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <HomepageComparison />
        <HomepageCTA />
      </main>
    </Layout>
  );
}
