"use client"

import * as React from "react"
import { Display, H1, H2, H3, Body, Caption, Mono } from "@/components/ui/Typography"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { PostCard } from "@/components/ui/PostCard"
import { ReadingProgress } from "@/components/ui/ReadingProgress"
import { USDCBadge } from "@/components/ui/USDCBadge"
import { WalletAddress } from "@/components/ui/WalletAddress"
import { ThemeToggle } from "@/components/ui/ThemeToggle"

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-6">
      <div className="border-b border-border-default pb-4">
        <H2>{title}</H2>
        {description && (
          <Body className="text-text-muted mt-1">{description}</Body>
        )}
      </div>
      {children}
    </section>
  )
}

export default function DesignSystemPage() {
  return (
    <>
      <ReadingProgress />

      <div className="min-h-screen bg-surface-primary">
        {/* Hero */}
        <div className="relative overflow-hidden border-b border-border-default">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-100/40 via-transparent to-brand-500/5 dark:from-brand-900/30 dark:to-brand-500/10" />
          <div className="relative mx-auto max-w-5xl px-6 py-16 md:py-24">
            <div className="flex items-center justify-between mb-8">
              <Badge variant="new">Design System v1.0</Badge>
              <ThemeToggle />
            </div>
            <Display className="text-text-primary mb-4">
              Solscribe Design System
            </Display>
            <Body className="text-text-secondary max-w-2xl text-lg">
              The complete collection of tokens, typography, and core components
              that power the Solscribe platform. Every element is designed for
              premium aesthetics, accessibility, and seamless dark mode support.
            </Body>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-5xl px-6 py-12 space-y-20">
          {/* ───────── COLOR TOKENS ───────── */}
          <Section
            title="Color Tokens"
            description="Brand purple ramp and semantic color tokens for surfaces, text, and borders."
          >
            <div className="space-y-8">
              {/* Brand Ramp */}
              <div>
                <H3 className="mb-4">Brand Purple</H3>
                <div className="grid grid-cols-7 gap-2">
                  {[
                    { key: "50", color: "#EEEDFE" },
                    { key: "100", color: "#CECBF6" },
                    { key: "200", color: "#AFA9EC" },
                    { key: "400", color: "#7F77DD" },
                    { key: "500", color: "#534AB7" },
                    { key: "600", color: "#3C3489" },
                    { key: "900", color: "#26215C" },
                  ].map((swatch) => (
                    <div key={swatch.key} className="space-y-2 text-center">
                      <div
                        className="h-16 rounded-xl border border-border-default shadow-sm"
                        style={{ backgroundColor: swatch.color }}
                      />
                      <Caption>{swatch.key}</Caption>
                      <Mono className="text-[10px]">{swatch.color}</Mono>
                    </div>
                  ))}
                </div>
              </div>

              {/* Semantic Surfaces */}
              <div>
                <H3 className="mb-4">Semantic Surfaces</H3>
                <div className="grid grid-cols-3 gap-3">
                  {["primary", "secondary", "tertiary"].map((name) => (
                    <div
                      key={name}
                      className={`h-20 rounded-xl border border-border-default flex items-end p-3 bg-surface-${name}`}
                    >
                      <Caption className="font-medium">surface-{name}</Caption>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* ───────── TYPOGRAPHY ───────── */}
          <Section
            title="Typography"
            description="Type scale using Inter (sans), Lora (serif), and JetBrains Mono (mono)."
          >
            <div className="space-y-6">
              <Card variant="flat" padding="default">
                <div className="space-y-5">
                  <Display>Display — The future of writing</Display>
                  <H1>Heading 1 — Welcome to Solscribe</H1>
                  <H2>Heading 2 — Publication Settings</H2>
                  <H3>Heading 3 — Subscriber Count</H3>
                  <Body>Body — The decentralised publishing platform for writers, thinkers, and creators on Solana.</Body>
                  <Body className="text-sm">Body Small — Last updated 3 minutes ago.</Body>
                  <Caption>Caption — tx: 4xK9...q2m9 · 12 confirmations</Caption>
                  <Mono>Mono — 7xKXtg2CW87d97TXJSDpbD5jBkheTqA</Mono>
                </div>
              </Card>
            </div>
          </Section>

          {/* ───────── BUTTONS ───────── */}
          <Section
            title="Buttons"
            description="Primary, secondary, ghost, and danger variants with multiple sizes."
          >
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" size="sm">Small</Button>
                <Button variant="primary" size="default">Default</Button>
                <Button variant="primary" size="lg">Large</Button>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" disabled>Disabled</Button>
                <Button variant="secondary" disabled>Disabled</Button>
              </div>
            </div>
          </Section>

          {/* ───────── BADGES ───────── */}
          <Section
            title="Badges"
            description="Status badges for content and subscription states."
          >
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="free">Free</Badge>
              <Badge variant="paid">Paid</Badge>
              <Badge variant="new">New</Badge>
              <Badge variant="active">Active</Badge>
              <Badge variant="expired">Expired</Badge>
              <Badge variant="pending">Pending</Badge>
            </div>
          </Section>

          {/* ───────── CARDS ───────── */}
          <Section
            title="Cards"
            description="Container variants: flat, elevated, and interactive."
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card variant="flat">
                <CardHeader>
                  <CardTitle>Flat Card</CardTitle>
                  <CardDescription>
                    Subtle background with border. Used for secondary content.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Elevated Card</CardTitle>
                  <CardDescription>
                    White surface with shadow. The default card style.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card variant="interactive">
                <CardHeader>
                  <CardTitle>Interactive Card</CardTitle>
                  <CardDescription>
                    Hover to see the border and shadow transitions.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </Section>

          {/* ───────── INPUTS ───────── */}
          <Section
            title="Inputs"
            description="Styled form inputs with label and error support."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
              <Input label="Email" placeholder="creator@solscribe.xyz" type="email" />
              <Input label="Publication Name" placeholder="My Web3 Journal" />
              <Input
                label="Wallet Address"
                placeholder="7xKXtg2CW87d97TXJSDpbD5..."
                error="Invalid Solana address"
              />
              <Input label="Price (USDC)" placeholder="5.00" type="number" />
            </div>
          </Section>

          {/* ───────── AVATARS ───────── */}
          <Section
            title="Avatars"
            description="Image-based and initial-fallback avatars in four sizes."
          >
            <div className="flex flex-wrap items-end gap-4">
              <div className="text-center space-y-2">
                <Avatar displayName="Vitalik Buterin" size="xs" />
                <Caption>xs</Caption>
              </div>
              <div className="text-center space-y-2">
                <Avatar displayName="Satoshi Nakamoto" size="sm" />
                <Caption>sm</Caption>
              </div>
              <div className="text-center space-y-2">
                <Avatar displayName="Anatoly Yakovenko" size="md" />
                <Caption>md</Caption>
              </div>
              <div className="text-center space-y-2">
                <Avatar displayName="Raj Gokal" size="lg" />
                <Caption>lg</Caption>
              </div>
            </div>
          </Section>

          {/* ───────── USDC BADGE ───────── */}
          <Section
            title="USDC Badge"
            description="Currency display for subscription pricing and earnings."
          >
            <div className="flex flex-wrap items-center gap-6">
              <div className="space-y-1">
                <Caption>Small</Caption>
                <USDCBadge amount={5} size="sm" />
              </div>
              <div className="space-y-1">
                <Caption>Medium</Caption>
                <USDCBadge amount={10} size="md" />
              </div>
              <div className="space-y-1">
                <Caption>Large</Caption>
                <USDCBadge amount={25.5} size="lg" showLabel />
              </div>
              <div className="space-y-1">
                <Caption>Brand</Caption>
                <USDCBadge amount={99.99} variant="brand" />
              </div>
              <div className="space-y-1">
                <Caption>Success</Caption>
                <USDCBadge amount={1250} variant="success" size="lg" showLabel />
              </div>
            </div>
          </Section>

          {/* ───────── WALLET ADDRESS ───────── */}
          <Section
            title="Wallet Address"
            description="Truncated Solana address with click-to-copy."
          >
            <div className="flex flex-wrap items-center gap-4">
              <WalletAddress address="7xKXtg2CW87d97TXJSDpbD5jBkheTqA8bY3q2m9Q" />
              <WalletAddress address="DRpbCBMxVnDK7maPMoGR6N4zTS4qSw1wSzAfyo6tY7KH" chars={6} />
            </div>
          </Section>

          {/* ───────── THEME TOGGLE ───────── */}
          <Section
            title="Theme Toggle"
            description="Dark/light mode switch with smooth icon crossfade."
          >
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Body className="text-text-secondary">
                Click the toggle to switch between light and dark mode.
              </Body>
            </div>
          </Section>

          {/* ───────── POST CARDS ───────── */}
          <Section
            title="Post Cards"
            description="Universal feed card in default, compact, and featured variants."
          >
            <div className="space-y-8">
              {/* Default */}
              <div>
                <H3 className="mb-4">Default</H3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
                  <PostCard
                    variant="default"
                    title="The Future of Decentralised Publishing"
                    description="How blockchain technology is reshaping the creator economy and giving writers true ownership."
                    publicationName="Solscribe Blog"
                    authorName="Alex Rivera"
                    createdAt="2026-05-20T10:00:00Z"
                    readingTime={8}
                  />
                  <PostCard
                    variant="default"
                    title="Understanding Solana Token Extensions"
                    description="A deep dive into the new token standard and what it means for NFT gating."
                    publicationName="Web3 Weekly"
                    authorName="Maya Chen"
                    createdAt="2026-05-18T14:30:00Z"
                    readingTime={12}
                    isPaid
                  />
                </div>
              </div>

              {/* Compact */}
              <div>
                <H3 className="mb-4">Compact</H3>
                <div className="max-w-xl space-y-3">
                  <PostCard
                    variant="compact"
                    title="Solana DeFi Volume Hits New ATH"
                    authorName="DeFi Dispatch"
                    createdAt="2026-05-25T08:00:00Z"
                  />
                  <PostCard
                    variant="compact"
                    title="How to Set Up NFT-Gated Content"
                    authorName="Solscribe Team"
                    createdAt="2026-05-22T16:00:00Z"
                    isPaid
                  />
                </div>
              </div>

              {/* Featured */}
              <div>
                <H3 className="mb-4">Featured</H3>
                <PostCard
                  variant="featured"
                  title="The Writer's Manifesto: Why Decentralisation Matters"
                  description="In an era of content censorship and platform risk, Web3 publishing offers a radical alternative. Here's why it matters for every creator."
                  authorName="Jordan Blake"
                  createdAt="2026-05-15T09:00:00Z"
                  readingTime={15}
                />
              </div>
            </div>
          </Section>

          {/* ───────── READING PROGRESS ───────── */}
          <Section
            title="Reading Progress"
            description="Scroll this page to see the purple gradient progress bar at the very top of the viewport."
          >
            <Card variant="flat" padding="sm">
              <Body className="text-text-muted">
                ↑ Look at the top of the browser window — the thin purple bar
                tracks your scroll progress as you move through this page.
              </Body>
            </Card>
          </Section>

          {/* Footer */}
          <div className="border-t border-border-default pt-8 pb-16">
            <Caption className="text-center">
              Solscribe Design System · Built with Tailwind CSS, CVA, and
              next-themes
            </Caption>
          </div>
        </div>
      </div>
    </>
  )
}
