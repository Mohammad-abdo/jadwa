import React from 'react'
import { CalendarOutlined } from '@ant-design/icons'

/**
 * Modern Page Wrapper Component
 * Provides consistent modern design for all dashboard pages
 */
export const ModernPageHeader = ({ title, description, language, extra = null }) => {
  return (
    <div className="relative min-h-screen pb-8 dashboard-bg">
      {/* Modern Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 md:w-[600px] md:h-[600px] bg-gradient-to-br from-olive-green-100/40 to-turquoise-100/40 rounded-full blur-3xl opacity-30 -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 md:w-[600px] md:h-[600px] bg-gradient-to-tr from-teal-100/40 to-olive-green-100/40 rounded-full blur-3xl opacity-30 -z-10" />

      {/* Modern Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 relative z-10">
        <div className="flex-1">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold gradient-text mb-3">
            {title}
          </h1>
          {description && (
            <p className="text-base sm:text-lg text-gray-600 font-medium">
              {description}
            </p>
          )}
        </div>
        {extra || (
          <div className="text-sm sm:text-base text-gray-700 glass-card px-4 py-3 rounded-xl shadow-professional whitespace-nowrap font-medium">
            <div className="flex items-center gap-2">
              <CalendarOutlined className="text-olive-green-600" />
              {new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export const ModernCard = ({ children, className = '', ...props }) => {
  return (
    <div className={`glass-card shadow-professional-xl rounded-2xl border-0 relative z-10 ${className}`} {...props}>
      {children}
    </div>
  )
}

