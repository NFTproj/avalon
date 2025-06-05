'use client'

import { useContext, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, X, ChevronDown, ChevronRight } from 'lucide-react'

import ImageFromJSON from '../core/ImageFromJSON'
import { ConfigContext } from '@/contexts/ConfigContext'
import { useAuth } from '@/contexts/AuthContext'
import { useOutsideClick } from '@/utils/useOutsideClick'

function Header() {
  /* ────── contextos ────── */
  const { colors, texts, locale, setLocale } = useContext(ConfigContext)
  const { user, loading, logout } = useAuth()
  const router = useRouter()

  /* ────── atalhos de texto ────── */
  // JSON-EN: landing-page.header
  const lpHeader = texts?.['landing-page']?.header
  // JSON-EN: landing-page.header.navigations
  const nav = lpHeader?.navigations
  const [hovered, setHovered] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const aboutRef = useRef<HTMLDetailsElement>(null)
  const productsRef = useRef<HTMLDetailsElement>(null)
  const langRef = useRef<HTMLDetailsElement>(null)
  const outRef = useRef<HTMLDetailsElement>(null)
  useOutsideClick(aboutRef, () => aboutRef.current?.removeAttribute('open'))
  useOutsideClick(productsRef, () =>
    productsRef.current?.removeAttribute('open'),
  )
  useOutsideClick(langRef, () => langRef.current?.removeAttribute('open'))
  useOutsideClick(outRef, () => outRef.current?.removeAttribute('open'))

  /* ────── item de troca de idioma (usado em mobile & desktop) ────── */
  const LangItem = ({ idx, code }: { idx: 0 | 1; code: 'pt-BR' | 'en-US' }) => (
    <li
      onClick={() => setLocale(code)}
      className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer
                  ${locale === code ? 'bg-gray-200 font-semibold' : 'hover:bg-gray-200'}`}
    >
      {/* JSON-EN: landing-page.header.navigations.navThree[0].items[idx].image */}
      <ImageFromJSON
        src={nav?.navThree[0].items[idx].image}
        alt={nav?.navThree[0].items[idx].alt}
        width={20}
        height={20}
        className="w-4 h-4 rounded-full"
      />
      {/* JSON-EN: landing-page.header.navigations.navThree[0].items[idx].title */}
      {nav?.navThree[0].items[idx].title}
    </li>
  )

  /* ──────────────── JSX ──────────────── */
  return (
    <header
      className="w-full grid grid-cols-3 items-center md:py-6 py-4 md:px-28 px-4 border-b-3"
      style={{
        backgroundColor: colors?.header['header-primary'],
        borderColor: colors?.border['border-primary'],
      }}
    >
      {/* ╭─────────────────────── HAMBURGUER (mobile) ───────────────────────╮ */}
      <div className="lg:hidden flex items-center">
        <button onClick={() => setIsMenuOpen(true)} className="text-gray-600">
          <Menu className="w-6 h-6" />
        </button>
      </div>
      {/* ╰────────────────────────────────────────────────────────────────────╯ */}

      {/* ╭──────────────────────────── MENU MOBILE ───────────────────────────╮ */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-between"
          style={{
            backgroundColor: colors?.background['background-primary'],
            color: colors?.colors['color-primary'],
          }}
        >
          {/* logo central */}
          <div className="flex justify-center p-4 ">
            <button onClick={() => router.push('/')}>
              {/* JSON-EN: images.logos.main-logo */}
              <ImageFromJSON
                src={texts?.images.logos['main-logo']}
                alt={
                  lpHeader?.alts[
                    'main-logo'
                  ] /* JSON-EN: landing-page.header.alts.main-logo */
                }
                width={120}
                height={40}
              />
            </button>
          </div>

          {/* botão fechar */}
          <button
            onClick={() => setIsMenuOpen(false)}
            className="absolute top-4 right-4 text-white"
          >
            <X className="w-6 h-6 bg-gray-400" />
          </button>

          {/* navegação mobile */}
          <nav className="flex flex-col items-center gap-4 mt-16 w-full">
            {/* About Bloxify */}
            <details ref={aboutRef} className="group">
              <summary className="flex items-center justify-center cursor-pointer px-4 py-2">
                <ChevronRight className="w-4 h-4 mr-2 transition group-open:rotate-90" />
                {/* JSON-EN: landing-page.header.navigations.navOne */}
                {nav?.navOne}
              </summary>
            </details>

            {/* Products > TBIO Token */}
            <details className="group w-full">
              <summary className="flex items-center justify-center cursor-pointer px-4 py-2">
                <ChevronRight className="w-4 h-4 mr-2 transition group-open:rotate-90" />
                {/* JSON-EN: landing-page.header.navigations.navTwo[0].title */}
                {nav?.navTwo[0].title}
              </summary>
              <ul className="flex flex-col p-2 space-y-2 w-full items-center ml-7">
                <li className="flex items-center gap-2 hover:bg-gray-200 px-2 py-1 rounded">
                  {/* JSON-EN: landing-page.header.navigations.navTwo[0].items[0].title */}
                  {nav?.navTwo[0].items[0].title}
                </li>
              </ul>
            </details>

            {/* Language (lista) */}
            <details className="group w-full">
              <summary className="flex items-center justify-center cursor-pointer px-4 py-2 mr-5">
                <ChevronRight className="w-4 h-4 mr-2 transition group-open:rotate-90" />
                {/* JSON-EN: landing-page.header.navigations.navThree[0].title */}
                {nav?.navThree[0].title}
              </summary>
              <ul className="flex flex-col p-2 space-y-2 w-full items-center ml-6">
                <LangItem idx={0} code="pt-BR" />
                <LangItem idx={1} code="en-US" />
              </ul>
            </details>
          </nav>

          {/* area login/signup mobile */}
          <div className="flex flex-col items-center gap-4 p-4">
            {loading ? null : user ? (
              <>
                <span className="text-sm">{`Olá, ${user.email}`}</span>
                <button
                  onClick={() => {
                    logout()
                    setIsMenuOpen(false)
                  }}
                  className="w-full text-blue-500 py-2 rounded-lg border border-blue-500"
                >
                  {lpHeader?.buttons.buttonLogout}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    router.push('/register')
                    setIsMenuOpen(false)
                  }}
                  className="w-full bg-blue-500 text-white py-2 rounded-lg"
                >
                  {/* JSON-EN: landing-page.header.buttons.button */}
                  {lpHeader?.buttons.button}
                </button>
                <button
                  onClick={() => {
                    router.push('/login')
                    setIsMenuOpen(false)
                  }}
                  className="w-full text-blue-500 py-2 rounded-lg border border-blue-500"
                >
                  {/* JSON-EN: landing-page.header.buttons.buttonLogin */}
                  {lpHeader?.buttons.buttonLogin}
                </button>
              </>
            )}
          </div>
        </div>
      )}
      {/* ╰────────────────────────────────────────────────────────────────────╯ */}

      {/* ╭────────────────────────── LOGO + NAV (desktop) ────────────────────╮ */}
      <div className="col-span-2 flex items-center gap-10">
        <button onClick={() => router.push('/')} className="cursor-pointer">
          <ImageFromJSON
            src={texts?.images.logos['main-logo']}
            alt={lpHeader?.alts['main-logo']}
            width={120}
            height={40}
          />
        </button>

        <nav
          className="hidden lg:flex gap-8"
          style={{
            borderColor: colors?.border['border-primary'],
            color: colors?.colors['color-primary'],
          }}
        >
          {/* About Bloxify */}
          <details ref={aboutRef} className="group">
            <summary className="flex items-center cursor-pointer">
              {nav?.navOne}
              <ChevronDown className="w-4 h-4 ml-2 transition group-open:rotate-180" />
            </summary>
          </details>

          {/* Products */}
          <details ref={productsRef} className="group relative">
            <summary className="flex items-center cursor-pointer">
              {nav?.navTwo[0].title}
              <ChevronDown className="w-4 h-4 ml-2 transition group-open:rotate-180" />
            </summary>
            <div className="absolute left-0 mt-2 min-w-[8rem] bg-white shadow-lg rounded-b-lg z-40">
              <ul className="flex flex-col p-2 space-y-2">
                <li className="flex items-center gap-2 hover:bg-gray-200 px-2 py-1 rounded">
                  {nav?.navTwo[0].items[0].title}
                </li>
              </ul>
            </div>
          </details>

          {/* Language (desktop) */}
          <details ref={langRef} className="group relative">
            <summary className="flex items-center cursor-pointer">
              {nav?.navThree[0].title}
              <ChevronDown className="w-4 h-4 ml-2 transition group-open:rotate-180" />
            </summary>
            <div className="absolute left-0 mt-2 min-w-[8rem] bg-white shadow-lg rounded-b-lg z-40">
              <ul className="flex flex-col p-2 space-y-2">
                <LangItem idx={0} code="pt-BR" />
                <LangItem idx={1} code="en-US" />
              </ul>
            </div>
          </details>
        </nav>
      </div>
      {/* ╰────────────────────────────────────────────────────────────────────╯ */}

      {/* ╭──────────────────────── BOTÕES à direita ──────────────────────────╮ */}
      <div className="flex justify-end items-center gap-4">
        {loading ? null : user ? (
          <>
            <details ref={outRef} className="relative group hidden lg:block">
              <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-black list-none">
                {`Olá, ${user.email}`}
                <ChevronDown className="w-4 h-4 transition group-open:rotate-180" />
              </summary>

              <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg z-50 min-w-[8rem]">
                <ul className="flex flex-col p-2 space-y-1 text-left">
                  <li
                    onClick={logout}
                    className="cursor-pointer text-sm text-red-600 px-4 py-2 rounded hover:bg-gray-100"
                  >
                    {lpHeader?.buttons.buttonLogout}
                  </li>
                </ul>
              </div>
            </details>
          </>
        ) : (
          <>
            <button
              onClick={() => router.push('/register')}
              className="border rounded-xl px-4 py-2 text-sm font-medium hidden lg:block
                          transition-all duration-200 ease-in-out 
                          hover:scale-[1.03] hover:shadow-md active:scale-95 
                          cursor-pointer"
              style={{
                backgroundColor: colors?.buttons['button-secondary'],
                borderColor: colors?.border['border-primary'],
                color: colors?.colors['color-primary'],
              }}
            >
              {lpHeader?.buttons.button}
            </button>
            <button
              onClick={() => router.push('/login')}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              className="hidden lg:block px-4 py-2 text-sm font-medium rounded-xl
                        transition-all duration-200 ease-in-out
                        active:scale-95 cursor-pointer"
              style={{
                backgroundColor: hovered ? '#e0e7ff' : 'transparent', // cor de fundo ao hover
                color: hovered ? '#1d4ed8' : colors?.colors['color-primary'], // cor do texto ao hover
                border: '1px solid transparent',
              }}
            >
              {lpHeader?.buttons.buttonLogin}
            </button>
          </>
        )}
      </div>
      {/* ╰────────────────────────────────────────────────────────────────────╯ */}
    </header>
  )
}

export default Header
