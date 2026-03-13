
export default function Footer() {
    return (
<footer className="bg-card border-t border-border pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-primary text-3xl">health_and_safety</span>
                <span className="text-2xl font-bold tracking-tight">CareFind</span>
              </div>
              <p className="text-text-muted mb-6 max-w-sm">
                Revolutionizing healthcare accessibility through AI-driven symptom analysis and intelligent doctor matching.
              </p>
              <div className="flex gap-4">
                <a className="w-10 h-10 rounded-full bg-section-teal flex items-center justify-center text-text-muted hover:bg-primary hover:text-white transition-colors" href="#">
                  <span className="sr-only">Twitter</span>
                  <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a className="w-10 h-10 rounded-full bg-section-teal flex items-center justify-center text-text-muted hover:bg-primary hover:text-white transition-colors" href="#">
                  <span className="sr-only">LinkedIn</span>
                  <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path clipRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" fillRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            {[
              { title: 'Product', links: ['Symptom Checker', 'Find a Doctor', 'Book Appointment', 'Pricing'] },
              { title: 'Company', links: ['About Us', 'Careers', 'Press', 'Contact'] },
              { title: 'Legal', links: ['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'Accessibility'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-bold text-text-base mb-4">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a className="text-text-muted hover:text-primary transition-colors text-sm" href="#">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-text-muted">© 2026 CareFind Inc. All rights reserved.</p>
            <p className="text-sm text-text-muted flex items-center gap-1">
              Made with{' '}
              <span className="material-symbols-outlined text-error text-sm">favorite</span>
              {' '}for better health
            </p>
          </div>
        </div>
      </footer>
    )
}