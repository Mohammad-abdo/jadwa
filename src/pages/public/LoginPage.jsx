import React, { useState } from 'react'
import { Layout, Card, Form, Input, Button, Divider } from 'antd'
import { LockOutlined, MailOutlined } from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { useAuth } from '../../contexts/AuthContext'

const { Content } = Layout

const LoginPage = () => {
  const { language } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated } = useAuth()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const onFinish = async (values) => {
    setLoading(true)
    try {
      const result = await login(values.email, values.password)
      
      if (result.success) {
        // Navigate based on user role
        const userRole = result.user.role
        const from = location.state?.from?.pathname
        
        if (from) {
          navigate(from, { replace: true })
        } else if (userRole === 'CLIENT') {
          navigate('/client', { replace: true })
        } else if (userRole === 'CONSULTANT') {
          navigate('/consultant', { replace: true })
        } else if (['ADMIN', 'SUPER_ADMIN', 'ANALYST', 'SUPPORT', 'FINANCE'].includes(userRole)) {
          navigate('/admin', { replace: true })
        } else {
          navigate('/', { replace: true })
        }
      }
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout className="min-h-screen bg-gradient-to-br from-olive-green-50 to-turquoise-50">
      <Content className="flex items-center justify-center py-8 px-4">
        <Card className="w-full max-w-md shadow-xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-olive-green-600 to-turquoise-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-3xl">ج</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Jadwa</h1>
            <p className="text-gray-600">
              {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
            </p>
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-left text-sm">
                <p className="font-semibold text-blue-800 mb-1">
                  {language === 'ar' ? 'بيانات الدخول الافتراضية:' : 'Default Login:'}
                </p>
                <p className="text-blue-700">
                  <strong>Admin:</strong> admin@jadwa.com / Admin@123
                </p>
                <p className="text-blue-700">
                  <strong>Consultant:</strong> consultant@jadwa.com / Consultant@123
                </p>
                <p className="text-blue-700">
                  <strong>Client:</strong> client@jadwa.com / Client@123
                </p>
              </div>
            )}
          </div>

          <Form
            form={form}
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="email"
              label={language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
              rules={[
                { required: true, message: language === 'ar' ? 'مطلوب' : 'Required' },
                { type: 'email', message: language === 'ar' ? 'بريد إلكتروني غير صحيح' : 'Invalid email' },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder={language === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={language === 'ar' ? 'كلمة المرور' : 'Password'}
              rules={[{ required: true, message: language === 'ar' ? 'مطلوب' : 'Required' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder={language === 'ar' ? 'أدخل كلمة المرور' : 'Enter your password'}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                className="bg-olive-green-600 hover:bg-olive-green-700 border-0 w-full"
                loading={loading}
                disabled={loading}
              >
                {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
              </Button>
            </Form.Item>
          </Form>

          <Divider>
            {language === 'ar' ? 'أو' : 'OR'}
          </Divider>

          <div className="space-y-3">
            <Button
              type="default"
              size="large"
              className="border-turquoise-500 text-turquoise-600 hover:bg-turquoise-50 w-full"
              onClick={() => navigate('/register')}
            >
              {language === 'ar' ? 'إنشاء حساب جديد' : 'Create New Account'}
            </Button>

            <Button
              type="text"
              size="large"
              className="w-full"
              onClick={() => navigate('/')}
            >
              {language === 'ar' ? 'العودة للصفحة الرئيسية' : 'Back to Home'}
            </Button>
          </div>
        </Card>
      </Content>
    </Layout>
  )
}

export default LoginPage

