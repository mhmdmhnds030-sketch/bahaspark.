const emailAddr = 'mhmdmhnds030@gmail.com';
const gmailUrl = 'https://mail.google.com/mail/?view=cm&to=' + emailAddr;


import React, { useState, useEffect } from 'react';


import { Brain, Code2 } from 'lucide-react';

const e = React.createElement;

function SocialIcon({ type, size = 18 }: { type: 'instagram' | 'whatsapp' | 'email'; size?: number }) {
  const paths: Record<string, string> = {
    instagram: 'M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z',
    whatsapp: 'M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2m5.82 14.01c-.24.68-1.41 1.3-1.95 1.38-.5.08-1.13.11-1.82-.11-.42-.13-.96-.31-1.65-.61-2.9-1.25-4.79-4.18-4.94-4.37-.14-.19-1.18-1.57-1.18-3 0-1.43.75-2.13 1.01-2.42.27-.29.58-.36.78-.36.19 0 .39 0 .56.01.18.01.42-.07.66.5.24.58.83 2.02.9 2.17.07.14.12.31.02.5-.1.19-.14.31-.29.48-.14.17-.3.38-.43.51-.14.14-.29.3-.13.58.17.29.74 1.22 1.59 1.98 1.09.97 2.01 1.27 2.3 1.42.29.14.46.12.63-.07.17-.19.72-.84.91-1.13.19-.29.39-.24.65-.14.27.1 1.69.8 1.98.94.29.14.48.22.55.34.07.12.07.69-.17 1.37z',
    email: 'M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z',
  };
  return e('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'currentColor' },
    e('path', { d: paths[type] })
  );
}

export function AboutAndFooter({ t, onNavigate }: any) {
  const [showWhatsapp, setShowWhatsapp] = useState(false);

  useEffect(function () {
    function handleScroll() {
      setShowWhatsapp(window.scrollY > 250);
    }
    window.addEventListener('scroll', handleScroll);
    return function () { window.removeEventListener('scroll', handleScroll); };
  }, []);

  return e(React.Fragment, null,
    e('section', { id: 'about', className: 'about-section' },
      e('div', { className: 'section-header' },
        e('span', { className: 'section-badge' }, e(Code2, { size: 16 }), ' ', t.aboutBadge),
        e('h2', null, t.aboutTitle),
        e('p', null, t.aboutSub)
      ),
      e('div', { className: 'team-grid', dir: 'ltr' },

        e('div', { className: 'team-card' },
          e('div', { className: 'team-avatar-wrapper' }, e('img', { src: '/nael.jpeg', alt: t.bahaaName, className: 'team-avatar' })),
          e('h3', null, t.bahaaName),
          e('span', { className: 'team-role' }, t.bahaaRole),
          e('p', { className: 'team-bio' }, t.bahaaBio),
          e('div', { className: 'team-socials' },
            e('a', { href: 'https://wa.me', target: '_blank', rel: 'noreferrer', title: 'WhatsApp' }, e(SocialIcon, { type: 'whatsapp' })),
            e('a', { href: 'https://instagram.com', target: '_blank', rel: 'noreferrer', title: 'Instagram' }, e(SocialIcon, { type: 'instagram' })),
            e('a', { href: gmailUrl, target: '_blank', rel: 'noreferrer', title: 'Email' }, e(SocialIcon, { type: 'email' }))

          )
        ),
        e('div', { className: 'team-card' },
          e('div', { className: 'team-avatar-wrapper' }, e('img', { src: '/bahaa.jpeg', alt: t.naelName, className: 'team-avatar' })),
          e('h3', null, t.naelName),
          e('span', { className: 'team-role' }, t.naelRole),
          e('p', { className: 'team-bio' }, t.naelBio),
          e('div', { className: 'team-socials' },
            e('a', { href: 'https://wa.me', target: '_blank', rel: 'noreferrer', title: 'WhatsApp' }, e(SocialIcon, { type: 'whatsapp' })),
            e('a', { href: 'https://instagram.com', target: '_blank', rel: 'noreferrer', title: 'Instagram' }, e(SocialIcon, { type: 'instagram' })),
            e('a', { href: gmailUrl, target: '_blank', rel: 'noreferrer', title: 'Email' }, e(SocialIcon, { type: 'email' }))

          )
        )
      )
    ),
    e('footer', { id: 'footer', className: 'pro-footer' },
      e('div', { className: 'footer-grid' },
        e('div', { className: 'footer-brand' },
          e('div', { className: 'brand' }, e(Brain, { className: 'brand-icon', size: 28 }), e('div', null, e('h3', null, 'BahaaSpark'), e('span', null, t.brandSub))),
          e('p', null, t.footerDesc)
        ),
        e('div', { className: 'footer-nav' },
          e('h4', null, t.footerLinks),
          e('ul', null,
            e('li', null, e('button', { type: 'button', onClick: function () { onNavigate('home'); } }, t.navHome)),
            e('li', null, e('button', { type: 'button', onClick: function () { onNavigate('workspace'); } }, t.navWorkspace)),
            e('li', null, e('button', { type: 'button', onClick: function () { onNavigate('about'); } }, t.navAbout))
          )
        ),
        e('div', { className: 'footer-social-col' },
          e('h4', null, t.footerSocial),
          e('div', { className: 'social-icons-row' },
            e('a', { href: 'https://wa.me', target: '_blank', rel: 'noreferrer', title: 'WhatsApp' }, e(SocialIcon, { type: 'whatsapp', size: 20 })),
            e('a', { href: 'https://instagram.com/BAHAA.MAZEN', target: '_blank', rel: 'noreferrer', title: 'Instagram' }, e(SocialIcon, { type: 'instagram', size: 20 })),
            e('a', { href: 'https://google.com', target: '_blank', rel: 'noreferrer', title: 'Email' }, e(SocialIcon, { type: 'email' }))

          )
        )
      ),
      e('div', { className: 'footer-bottom' }, e('p', null, t.rights))
    ),
    e('a', {
      href: 'https://wa.me',
      target: '_blank',
      rel: 'noreferrer',
      className: showWhatsapp ? 'floating-whatsapp-btn visible' : 'floating-whatsapp-btn',

      title: 'WhatsApp'
    }, e(SocialIcon, { type: 'whatsapp', size: 28 }))
  );
}
