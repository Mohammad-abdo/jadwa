import React, { useState, useEffect } from 'react'
import { Spin } from 'antd'
import { useLanguage } from '../../contexts/LanguageContext'
import { partnersAPI } from '../../services/api'

const PartnersSection = () => {
  const { t, language } = useLanguage()
  const [partners, setPartners] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPartners()
  }, [])

  const normalizeImageUrl = (url) => {
    if (!url) return null;
    // If it's already a full URL (http/https), return as is
    if (/^https?:\/\//.test(url)) {
      return url;
    }
    // If it's a file:// path, return null (invalid)
    if (/^file:\/\//.test(url)) {
      return null;
    }
    // If it's a relative path, construct full URL
    const apiBase = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return url.startsWith('/') ? `${apiBase}${url}` : `${apiBase}/${url}`;
  };

  const fetchPartners = async () => {
    try {
      setLoading(true)
      const response = await partnersAPI.getPartners({ isActive: 'true' })
      // Normalize logo URLs to ensure they're proper URLs
      const normalizedPartners = (response.partners || []).map(partner => ({
        ...partner,
        logo: normalizeImageUrl(partner.logo)
      }))
      setPartners(normalizedPartners)
    } catch (err) {
      console.error('Error fetching partners:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-20 md:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex justify-center py-12">
            <Spin size="large" />
          </div>
        </div>
      </section>
    )
  }

  if (partners.length === 0) {
    return null
  }

  return (
    <section className="py-20 md:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900">
            {t('partners')}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            {language === 'ar'
              ? 'نفتخر بشراكاتنا مع المؤسسات الرائدة'
              : 'We are proud of our partnerships with leading institutions'}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
          {partners.map((partner) => (
            <div
              key={partner.id}
              className="flex items-center justify-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              {partner.logo ? (
                <img
                  src={partner.logo}
                  alt={language === 'ar' && partner.nameAr ? partner.nameAr : partner.name}
                  className="max-w-full h-auto max-h-16 opacity-70 hover:opacity-100 transition-opacity duration-300"
                  onError={(e) => {
                    console.error('Failed to load partner logo:', partner.logo);
                    e.target.style.display = 'none'
                  }}
                />
              ) : (
                <span className="text-gray-400 text-sm">
                  {language === 'ar' && partner.nameAr ? partner.nameAr : partner.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PartnersSection

