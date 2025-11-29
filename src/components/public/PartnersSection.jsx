import React from 'react'
import { useLanguage } from '../../contexts/LanguageContext'

const PartnersSection = () => {
  const { t, language } = useLanguage()

  const partners = [
    { id: 1, name: 'Partner 1', logo: 'https://placehold.co/150x80/7a8c66/ffffff?text=Partner+1' },
    { id: 2, name: 'Partner 2', logo: 'https://placehold.co/150x80/14b8a6/ffffff?text=Partner+2' },
    { id: 3, name: 'Partner 3', logo: 'https://placehold.co/150x80/7a8c66/ffffff?text=Partner+3' },
    { id: 4, name: 'Partner 4', logo: 'https://placehold.co/150x80/14b8a6/ffffff?text=Partner+4' },
    { id: 5, name: 'Partner 5', logo: 'https://placehold.co/150x80/7a8c66/ffffff?text=Partner+5' },
    { id: 6, name: 'Partner 6', logo: 'https://placehold.co/150x80/14b8a6/ffffff?text=Partner+6' },
  ]

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="section-title">{t('partners')}</h2>
          <p className="section-subtitle">
            {language === 'ar'
              ? 'نفتخر بشراكاتنا مع المؤسسات الرائدة'
              : 'We are proud of our partnerships with leading institutions'}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
          {partners.map((partner) => (
            <div
              key={partner.id}
              className="flex items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <img
                src={partner.logo}
                alt={partner.name}
                className="max-w-full h-auto opacity-60 hover:opacity-100 transition-opacity duration-200"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PartnersSection

