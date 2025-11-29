import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Table, Button, Tag, Space, Rate, Input, Select, message, Alert, Modal, Form } from 'antd'
import { CheckOutlined, CloseOutlined, EditOutlined, SearchOutlined, ReloadOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons'
import { useLanguage } from '../../contexts/LanguageContext'
import { adminAPI } from '../../services/api'

const AdminConsultants = () => {
  const { t, language } = useLanguage()
  const navigate = useNavigate()
  const [consultants, setConsultants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedConsultant, setSelectedConsultant] = useState(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [consultantModal, setConsultantModal] = useState({ visible: false, editing: null })
  const [consultantForm] = Form.useForm()

  useEffect(() => {
    fetchConsultants()
  }, [searchText, statusFilter])

  const fetchConsultants = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = {}
      if (searchText) params.search = searchText
      if (statusFilter !== 'all') params.status = statusFilter

      const response = await adminAPI.getConsultants(params)
      const formattedConsultants = response.consultants.map(consultant => ({
        id: consultant.id,
        userId: consultant.user.id,
        name: `${consultant.firstName} ${consultant.lastName}`,
        email: consultant.user.email,
        phone: consultant.user.phone,
        rating: consultant.averageRating || 0,
        sessions: consultant._count?.bookings || 0,
        status: consultant.isVerified ? 'approved' : 'pending',
        isVerified: consultant.isVerified,
        specialization: consultant.specialization,
        bio: consultant.bio,
        isAvailable: consultant.isAvailable,
      }))
      setConsultants(formattedConsultants)
    } catch (err) {
      console.error('Error fetching consultants:', err)
      setError(err.message || 'Failed to load consultants')
      message.error(language === 'ar' ? 'فشل تحميل المستشارين' : 'Failed to load consultants')
    } finally {
      setLoading(false)
    }
  }

  const handleReviewConsultant = async (id, action) => {
    try {
      await adminAPI.reviewConsultant(id, action)
      message.success(
        language === 'ar' 
          ? `تم ${action === 'approve' ? 'الموافقة على' : 'رفض'} المستشار بنجاح`
          : `Consultant ${action}d successfully`
      )
      fetchConsultants()
    } catch (err) {
      message.error(err.message || (language === 'ar' ? 'فشل تحديث الحالة' : 'Failed to update status'))
    }
  }

  const handleConsultantSubmit = async (values) => {
    try {
      if (consultantModal.editing) {
        await adminAPI.updateConsultant(consultantModal.editing.id, values)
        message.success(language === 'ar' ? 'تم تحديث المستشار بنجاح' : 'Consultant updated successfully')
      } else {
        await adminAPI.createConsultant(values)
        message.success(language === 'ar' ? 'تم إنشاء المستشار بنجاح' : 'Consultant created successfully')
      }
      setConsultantModal({ visible: false, editing: null })
      consultantForm.resetFields()
      fetchConsultants()
    } catch (err) {
      message.error(err.message || (language === 'ar' ? 'فشل حفظ المستشار' : 'Failed to save consultant'))
    }
  }

  const handleDeleteConsultant = async (id) => {
    try {
      await adminAPI.deleteConsultant(id)
      message.success(language === 'ar' ? 'تم حذف المستشار بنجاح' : 'Consultant deleted successfully')
      fetchConsultants()
    } catch (err) {
      message.error(err.message || (language === 'ar' ? 'فشل حذف المستشار' : 'Failed to delete consultant'))
    }
  }

  const columns = [
    {
      title: language === 'ar' ? 'الاسم' : 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: language === 'ar' ? 'البريد الإلكتروني' : 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: language === 'ar' ? 'التخصص' : 'Specialization',
      dataIndex: 'specialization',
      key: 'specialization',
      render: (text) => text || (language === 'ar' ? 'غير محدد' : 'Not specified'),
    },
    {
      title: language === 'ar' ? 'التقييم' : 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => rating > 0 ? (
        <Space>
          <Rate disabled defaultValue={rating} allowHalf />
          <span>({rating.toFixed(1)})</span>
        </Space>
      ) : (
        <span className="text-gray-400">{language === 'ar' ? 'لا يوجد تقييم' : 'No rating'}</span>
      ),
      sorter: (a, b) => a.rating - b.rating,
    },
    {
      title: language === 'ar' ? 'الجلسات' : 'Sessions',
      dataIndex: 'sessions',
      key: 'sessions',
      sorter: (a, b) => a.sessions - b.sessions,
    },
    {
      title: language === 'ar' ? 'الحالة' : 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => {
        const colors = {
          approved: 'green',
          pending: 'orange',
          rejected: 'red',
        }
        const labels = {
          approved: language === 'ar' ? 'موافق عليه' : 'Approved',
          pending: language === 'ar' ? 'قيد المراجعة' : 'Pending',
          rejected: language === 'ar' ? 'مرفوض' : 'Rejected',
        }
        return (
          <Space>
            <Tag color={colors[status]}>{labels[status]}</Tag>
            {record.isAvailable && (
              <Tag color="blue">{language === 'ar' ? 'متاح' : 'Available'}</Tag>
            )}
          </Space>
        )
      },
      filters: [
        { text: language === 'ar' ? 'موافق عليه' : 'Approved', value: 'approved' },
        { text: language === 'ar' ? 'قيد المراجعة' : 'Pending', value: 'pending' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: language === 'ar' ? 'الإجراءات' : 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={() => navigate(`/admin/consultants/${record.id}`)}
          >
            {language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
          </Button>
          <Button
        icon={<EditOutlined />}
        onClick={async () => {
          try {
            const consultantData = await adminAPI.getConsultantById(record.id)
            const consultant = consultantData.consultant
            consultantForm.setFieldsValue({
              firstName: consultant?.firstName || '',
              lastName: consultant?.lastName || '',
              phone: consultant?.user?.phone || '',
              academicDegree: consultant?.academicDegree || '',
              specialization: consultant?.specialization || '',
              bio: consultant?.bio || '',
              pricePerSession: consultant?.pricePerSession || '',
              isVerified: consultant?.isVerified || false,
              isAvailable: consultant?.isAvailable || false,
            })
            setConsultantModal({ visible: true, editing: record })
          } catch (err) {
            message.error(language === 'ar' ? 'فشل تحميل بيانات المستشار' : 'Failed to load consultant data')
          }
        }}
      >
        {language === 'ar' ? 'تعديل' : 'Edit'}
      </Button>
      {record.status === 'pending' && (
            <>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                className="bg-green-600"
                onClick={() => handleReviewConsultant(record.id, 'approve')}
              >
                {language === 'ar' ? 'موافقة' : 'Approve'}
              </Button>
          <Button
            danger
            icon={<CloseOutlined />}
            onClick={() => handleReviewConsultant(record.id, 'reject')}
          >
            {language === 'ar' ? 'رفض' : 'Reject'}
          </Button>
        </>
      )}
      <Button
        danger
        onClick={() => {
          if (window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا المستشار؟' : 'Are you sure you want to delete this consultant?')) {
            handleDeleteConsultant(record.id)
          }
        }}
      >
        {language === 'ar' ? 'حذف' : 'Delete'}
      </Button>
    </Space>
  ),
},
  ]

  if (error && !loading) {
    return (
      <Alert
        message={language === 'ar' ? 'خطأ في تحميل البيانات' : 'Error Loading Data'}
        description={error}
        type="error"
        showIcon
        action={
          <Button size="small" onClick={fetchConsultants}>
            {language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
          </Button>
        }
      />
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-olive-green-600 to-turquoise-500 bg-clip-text text-transparent mb-2">
            {language === 'ar' ? 'المستشارون' : 'Consultants'}
          </h1>
          <p className="text-gray-500">
            {language === 'ar' ? 'إدارة جميع المستشارين المسجلين' : 'Manage all registered consultants'}
          </p>
        </div>
        <Space>
          <Input
            placeholder={language === 'ar' ? 'بحث بالاسم أو البريد...' : 'Search by name or email...'}
            prefix={<SearchOutlined />}
            className="w-64"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 150 }}
          >
            <Select.Option value="all">{language === 'ar' ? 'الكل' : 'All'}</Select.Option>
            <Select.Option value="approved">{language === 'ar' ? 'موافق عليه' : 'Approved'}</Select.Option>
            <Select.Option value="pending">{language === 'ar' ? 'قيد المراجعة' : 'Pending'}</Select.Option>
          </Select>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchConsultants}
            loading={loading}
          >
            {language === 'ar' ? 'تحديث' : 'Refresh'}
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="bg-olive-green-600 hover:bg-olive-green-700 border-0"
            onClick={() => {
              consultantForm.resetFields()
              setConsultantModal({ visible: true, editing: null })
            }}
          >
            {language === 'ar' ? 'إضافة مستشار جديد' : 'Add New Consultant'}
          </Button>
        </Space>
      </div>
      <Card className="shadow-lg rounded-xl border-0">
        <Table
          columns={columns}
          dataSource={consultants}
          rowKey="id"
          loading={loading}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => (language === 'ar' ? `إجمالي ${total} مستشار` : `Total ${total} consultants`)
          }}
        />
      </Card>

      <Modal
        title={language === 'ar' ? 'تفاصيل المستشار' : 'Consultant Details'}
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false)
          setSelectedConsultant(null)
        }}
        maskClosable={true}
        keyboard={true}
        footer={null}
        width={600}
        destroyOnHidden={true}
        className="modern-modal"
      >
        {selectedConsultant && (
          <div className="space-y-4">
            <div>
              <strong>{language === 'ar' ? 'الاسم:' : 'Name:'}</strong> {selectedConsultant.name}
            </div>
            <div>
              <strong>{language === 'ar' ? 'البريد الإلكتروني:' : 'Email:'}</strong> {selectedConsultant.email}
            </div>
            <div>
              <strong>{language === 'ar' ? 'رقم الهاتف:' : 'Phone:'}</strong> {selectedConsultant.phone || (language === 'ar' ? 'غير متوفر' : 'Not available')}
            </div>
            <div>
              <strong>{language === 'ar' ? 'التخصص:' : 'Specialization:'}</strong> {selectedConsultant.specialization || (language === 'ar' ? 'غير محدد' : 'Not specified')}
            </div>
            <div>
              <strong>{language === 'ar' ? 'التقييم:' : 'Rating:'}</strong> 
              <Rate disabled defaultValue={selectedConsultant.rating} allowHalf className="ml-2" />
              <span className="ml-2">({selectedConsultant.rating.toFixed(1)})</span>
            </div>
            <div>
              <strong>{language === 'ar' ? 'عدد الجلسات:' : 'Sessions:'}</strong> {selectedConsultant.sessions}
            </div>
            <div>
              <strong>{language === 'ar' ? 'الحالة:' : 'Status:'}</strong> 
              <Tag color={selectedConsultant.status === 'approved' ? 'green' : 'orange'} className="ml-2">
                {selectedConsultant.status === 'approved' 
                  ? (language === 'ar' ? 'موافق عليه' : 'Approved')
                  : (language === 'ar' ? 'قيد المراجعة' : 'Pending')
                }
              </Tag>
            </div>
            {selectedConsultant.bio && (
              <div>
                <strong>{language === 'ar' ? 'السيرة الذاتية:' : 'Bio:'}</strong>
                <p className="mt-2 text-gray-600">{selectedConsultant.bio}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        title={consultantModal.editing ? (language === 'ar' ? 'تعديل المستشار' : 'Edit Consultant') : (language === 'ar' ? 'إضافة مستشار جديد' : 'Add New Consultant')}
        open={consultantModal.visible}
        onCancel={() => {
          setConsultantModal({ visible: false, editing: null })
          consultantForm.resetFields()
        }}
        maskClosable={true}
        keyboard={true}
        footer={null}
        width={700}
        destroyOnHidden={true}
        className="modern-modal"
      >
        <Form
          form={consultantForm}
          layout="vertical"
          onFinish={handleConsultantSubmit}
        >
          {!consultantModal.editing && (
            <>
              <Form.Item
                name="email"
                label={language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                rules={[
                  { required: true, message: language === 'ar' ? 'يرجى إدخال البريد الإلكتروني' : 'Please enter email' },
                  { type: 'email', message: language === 'ar' ? 'البريد الإلكتروني غير صحيح' : 'Invalid email' }
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="password"
                label={language === 'ar' ? 'كلمة المرور' : 'Password'}
                rules={[
                  { required: !consultantModal.editing, message: language === 'ar' ? 'يرجى إدخال كلمة المرور' : 'Please enter password' },
                  { min: 8, message: language === 'ar' ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters' }
                ]}
              >
                <Input.Password />
              </Form.Item>
            </>
          )}
          <Form.Item
            name="firstName"
            label={language === 'ar' ? 'الاسم الأول' : 'First Name'}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="lastName"
            label={language === 'ar' ? 'اسم العائلة' : 'Last Name'}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label={language === 'ar' ? 'رقم الهاتف' : 'Phone'}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="academicDegree"
            label={language === 'ar' ? 'الدرجة العلمية' : 'Academic Degree'}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="specialization"
            label={language === 'ar' ? 'التخصص' : 'Specialization'}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="bio"
            label={language === 'ar' ? 'السيرة الذاتية' : 'Bio'}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="pricePerSession"
            label={language === 'ar' ? 'سعر الجلسة' : 'Price Per Session'}
            rules={[{ required: true }]}
          >
            <Input type="number" />
          </Form.Item>
          {consultantModal.editing && (
            <>
              <Form.Item
                name="isVerified"
                valuePropName="checked"
                label={language === 'ar' ? 'موافق عليه' : 'Verified'}
              >
                <Switch checkedChildren={language === 'ar' ? 'نعم' : 'Yes'} unCheckedChildren={language === 'ar' ? 'لا' : 'No'} />
              </Form.Item>
              <Form.Item
                name="isAvailable"
                valuePropName="checked"
                label={language === 'ar' ? 'متاح' : 'Available'}
              >
                <Switch checkedChildren={language === 'ar' ? 'نعم' : 'Yes'} unCheckedChildren={language === 'ar' ? 'لا' : 'No'} />
              </Form.Item>
            </>
          )}
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" className="bg-olive-green-600">
                {language === 'ar' ? 'حفظ' : 'Save'}
              </Button>
              <Button onClick={() => {
                setConsultantModal({ visible: false, editing: null })
                consultantForm.resetFields()
              }}>
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default AdminConsultants

