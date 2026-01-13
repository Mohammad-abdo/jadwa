import React, { useState, useEffect } from 'react'
import { Button } from 'antd'
import { ArrowUpOutlined } from '@ant-design/icons'

const ScrollToTop = () => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setVisible(true)
      } else {
        setVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)

    return () => {
      window.removeEventListener('scroll', toggleVisibility)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  if (!visible) {
    return null
  }

  return (
    <Button
      type="primary"
      shape="circle"
      icon={<ArrowUpOutlined />}
      onClick={scrollToTop}
      className="scroll-to-top-btn"
      size="large"
      style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        zIndex: 1000,
        width: '50px',
        height: '50px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        background: 'linear-gradient(135deg, #7a8c66 0%, #14b8a6 100%)',
        border: 'none',
      }}
    />
  )
}

export default ScrollToTop



