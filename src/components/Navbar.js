'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import AppIcon from '@/components/AppIcon';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dict, setDict] = useState({});
  const params = useParams();
  const currentLang = params?.lang || 'en';
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Dynamic import to avoid SSR errors with relative files depending on the caller
    import(`@/i18n/dictionaries/${currentLang}.json`)
      .then((module) => setDict(module.default.navigation || {}))
      .catch(() => import('@/i18n/dictionaries/en.json').then((m) => setDict(m.default.navigation || {})));
  }, [currentLang]);

  const switchLanguage = (e) => {
    const newLang = e.target.value;
    // Replace the first occurrence of /currentLang with /newLang
    let newPath = pathname.replace(`/${currentLang}`, `/${newLang}`);
    if (newPath === pathname) {
      newPath = `/${newLang}${pathname}`;
    }
    router.push(newPath);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link href={`/${currentLang}`} className="logo">
          <span className="logo-icon"><AppIcon name="shieldCheck" size={18} /></span>
          <span className="logo-text">PayShield</span>
        </Link>

        <button 
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="hamburger"></span>
          <span className="hamburger"></span>
          <span className="hamburger"></span>
        </button>

        <div className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <Link href={`/${currentLang}`} onClick={() => setMobileMenuOpen(false)}>{dict.home || 'Home'}</Link>
          <Link href={`/${currentLang}/features`} onClick={() => setMobileMenuOpen(false)}>{dict.features || 'Features'}</Link>
          <Link href={`/${currentLang}/about`} onClick={() => setMobileMenuOpen(false)}>{dict.about || 'About'}</Link>
          <Link href={`/${currentLang}/contact`} onClick={() => setMobileMenuOpen(false)}>{dict.contact || 'Contact'}</Link>
          
          <select value={currentLang} onChange={switchLanguage} style={{ backgroundColor: 'transparent', color: 'inherit', border: '1px solid #ccc', padding: '4px', borderRadius: '4px', cursor: 'pointer', margin: '0 8px' }}>
            <option value="en">Eng</option>
            <option value="hi">हिंदी</option>
            <option value="kn">ಕನ್ನಡ</option>
          </select>

          <Link href={`/${currentLang}/login`} className="nav-btn login-btn" onClick={() => setMobileMenuOpen(false)}>
            {dict.login || 'Login'}
          </Link>
          <Link href={`/${currentLang}/register`} className="nav-btn register-btn" onClick={() => setMobileMenuOpen(false)}>
            {dict.register || 'Get Started'}
          </Link>
        </div>
      </div>
    </nav>
  );
}
