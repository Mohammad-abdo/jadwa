import React, { useState, useEffect } from 'react'
import { 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Checkbox, 
  Space, 
  message, 
  Tag, 
  Alert, 
  Tabs,
  Row,
  Col,
  Statistic,
  Badge,
  Divider,
  Tooltip,
  Popconfirm
} from 'antd'
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ReloadOutlined, 
  UserOutlined,
  SafetyOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LockOutlined,
  UnlockOutlined
} from '@ant-design/icons'
import { useLanguage } from '../../contexts/LanguageContext'
import { permissionsAPI } from '../../services/api'

const AdminPermissions = () => {
  const { t, language } = useLanguage()
  const [permissions, setPermissions] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(false)
  const [roleModalVisible, setRoleModalVisible] = useState(false)
  const [editingRole, setEditingRole] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchPermissions()
    fetchRoles()
  }, [])

  const fetchPermissions = async () => {
    try {
      setLoading(true)
      const response = await permissionsAPI.getPermissions()
      setPermissions(response.permissions || [])
    } catch (err) {
      console.error('Error fetching permissions:', err)
      message.error(language === 'ar' ? 'فشل تحميل الصلاحيات' : 'Failed to load permissions')
    } finally {
      setLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      const response = await permissionsAPI.getRoles()
      setRoles(response.roles || [])
    } catch (err) {
      console.error('Error fetching roles:', err)
      message.error(language === 'ar' ? 'فشل تحميل الأدوار' : 'Failed to load roles')
    }
  }

  const handleInitializePermissions = async () => {
    try {
      await permissionsAPI.initializePermissions()
      message.success(language === 'ar' ? 'تم تهيئة الصلاحيات بنجاح' : 'Permissions initialized successfully')
      fetchPermissions()
    } catch (err) {
      message.error(err.message || (language === 'ar' ? 'فشل تهيئة الصلاحيات' : 'Failed to initialize permissions'))
    }
  }

  const handleRoleSubmit = async (values) => {
    try {
      if (editingRole) {
        await permissionsAPI.updateRole(editingRole.id, values)
        message.success(language === 'ar' ? 'تم تحديث الدور بنجاح' : 'Role updated successfully')
      } else {
        await permissionsAPI.createRole(values)
        message.success(language === 'ar' ? 'تم إنشاء الدور بنجاح' : 'Role created successfully')
      }
      setRoleModalVisible(false)
      setEditingRole(null)
      form.resetFields()
      fetchRoles()
    } catch (err) {
      message.error(err.message || (language === 'ar' ? 'فشل حفظ الدور' : 'Failed to save role'))
    }
  }

  const handleDeleteRole = async (id) => {
    try {
      await permissionsAPI.deleteRole(id)
      message.success(language === 'ar' ? 'تم حذف الدور بنجاح' : 'Role deleted successfully')
      fetchRoles()
    } catch (err) {
      message.error(err.message || (language === 'ar' ? 'فشل حذف الدور' : 'Failed to delete role'))
    }
  }

  // Calculate statistics
  const stats = {
    totalPermissions: permissions.length,
    totalRoles: roles.length,
    systemRoles: roles.filter(r => r.isSystem).length,
    customRoles: roles.filter(r => !r.isSystem).length,
  }

  const permissionColumns = [
    {
      title: language === 'ar' ? 'الاسم' : 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div className="flex items-center gap-2">
          <SafetyOutlined className="text-olive-green-600" />
          <span className="font-semibold">{text}</span>
          {record.nameAr && (
            <Tag color="blue" className="text-xs">{record.nameAr}</Tag>
          )}
        </div>
      ),
    },
    {
      title: language === 'ar' ? 'المورد' : 'Resource',
      dataIndex: 'resource',
      key: 'resource',
      render: (text) => <Tag color="purple">{text}</Tag>,
    },
    {
      title: language === 'ar' ? 'الإجراء' : 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (text) => <Tag color="orange">{text}</Tag>,
    },
    {
      title: language === 'ar' ? 'الوصف' : 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          {text || '-'}
        </Tooltip>
      ),
    },
  ]

  const roleColumns = [
    {
      title: language === 'ar' ? 'الدور' : 'Role',
      key: 'role',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-olive-green-400 to-turquoise-400 rounded-lg flex items-center justify-center">
            <TeamOutlined className="text-white text-lg" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">{record.name}</div>
            {record.nameAr && (
              <div className="text-sm text-gray-500">{record.nameAr}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: language === 'ar' ? 'الصلاحيات' : 'Permissions',
      key: 'permissions',
      render: (_, record) => (
        <Badge 
          count={record.permissions?.length || 0} 
          showZero
          style={{ backgroundColor: '#52c41a' }}
        >
          <Tag color="green" icon={<CheckCircleOutlined />}>
            {record.permissions?.length || 0} {language === 'ar' ? 'صلاحية' : 'permissions'}
          </Tag>
        </Badge>
      ),
    },
    {
      title: language === 'ar' ? 'المستخدمون' : 'Users',
      key: 'users',
      render: (_, record) => (
        <Badge 
          count={record._count?.userRoles || 0} 
          showZero
          style={{ backgroundColor: '#1890ff' }}
        >
          <Tag color="blue" icon={<UserOutlined />}>
            {record._count?.userRoles || 0} {language === 'ar' ? 'مستخدم' : 'users'}
          </Tag>
        </Badge>
      ),
    },
    {
      title: language === 'ar' ? 'النوع' : 'Type',
      key: 'type',
      render: (_, record) => (
        <Tag 
          color={record.isSystem ? 'blue' : 'default'}
          icon={record.isSystem ? <LockOutlined /> : <UnlockOutlined />}
        >
          {record.isSystem ? (language === 'ar' ? 'نظام' : 'System') : (language === 'ar' ? 'مخصص' : 'Custom')}
        </Tag>
      ),
    },
    {
      title: language === 'ar' ? 'الإجراءات' : 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title={language === 'ar' ? 'تعديل' : 'Edit'}>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingRole(record)
                form.setFieldsValue({
                  name: record.name,
                  nameAr: record.nameAr,
                  description: record.description,
                  permissionIds: record.permissions?.map(p => p.permissionId) || [],
                })
                setRoleModalVisible(true)
              }}
            />
          </Tooltip>
          {!record.isSystem && (
            <Popconfirm
              title={language === 'ar' ? 'حذف الدور' : 'Delete Role'}
              description={language === 'ar' ? 'هل أنت متأكد من حذف هذا الدور؟' : 'Are you sure you want to delete this role?'}
              onConfirm={() => handleDeleteRole(record.id)}
              okText={language === 'ar' ? 'نعم' : 'Yes'}
              cancelText={language === 'ar' ? 'لا' : 'No'}
            >
              <Tooltip title={language === 'ar' ? 'حذف' : 'Delete'}>
                <Button
                  danger
                  icon={<DeleteOutlined />}
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ]

  const tabItems = [
    {
      key: 'permissions',
      label: (
        <span>
          <SafetyOutlined className="mr-2" />
          {language === 'ar' ? 'الصلاحيات' : 'Permissions'}
        </span>
      ),
      children: (
        <div>
          <div className="mb-6 flex justify-between items-center">
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchPermissions}
              loading={loading}
            >
              {language === 'ar' ? 'تحديث' : 'Refresh'}
            </Button>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={handleInitializePermissions}
              className="bg-olive-green-600 hover:bg-olive-green-700 border-0"
            >
              {language === 'ar' ? 'تهيئة الصلاحيات الافتراضية' : 'Initialize Default Permissions'}
            </Button>
          </div>
          <Card className="shadow-sm">
            <Table
              columns={permissionColumns}
              dataSource={permissions}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 20 }}
            />
          </Card>
        </div>
      ),
    },
    {
      key: 'roles',
      label: (
        <span>
          <TeamOutlined className="mr-2" />
          {language === 'ar' ? 'الأدوار' : 'Roles'}
        </span>
      ),
      children: (
        <div>
          <div className="mb-6 flex justify-end">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="bg-olive-green-600 hover:bg-olive-green-700 border-0"
              onClick={() => {
                setEditingRole(null)
                form.resetFields()
                setRoleModalVisible(true)
              }}
            >
              {language === 'ar' ? 'إضافة دور' : 'Add Role'}
            </Button>
          </div>
          <Card className="shadow-sm">
            <Table
              columns={roleColumns}
              dataSource={roles}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </div>
      ),
    },
  ]

  return (
    <div>
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-olive-green-600 to-turquoise-500 bg-clip-text text-transparent mb-2">
          {language === 'ar' ? 'الصلاحيات والأدوار' : 'Permissions & Roles'}
        </h1>
        <p className="text-gray-500 text-lg">
          {language === 'ar' ? 'إدارة الصلاحيات والأدوار للمستخدمين والتحكم في الوصول' : 'Manage user permissions and roles, control access'}
        </p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm border-l-4 border-l-blue-500">
            <Statistic
              title={language === 'ar' ? 'إجمالي الصلاحيات' : 'Total Permissions'}
              value={stats.totalPermissions}
              prefix={<SafetyOutlined className="text-blue-500" />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm border-l-4 border-l-green-500">
            <Statistic
              title={language === 'ar' ? 'إجمالي الأدوار' : 'Total Roles'}
              value={stats.totalRoles}
              prefix={<TeamOutlined className="text-green-500" />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm border-l-4 border-l-purple-500">
            <Statistic
              title={language === 'ar' ? 'أدوار النظام' : 'System Roles'}
              value={stats.systemRoles}
              prefix={<LockOutlined className="text-purple-500" />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm border-l-4 border-l-orange-500">
            <Statistic
              title={language === 'ar' ? 'أدوار مخصصة' : 'Custom Roles'}
              value={stats.customRoles}
              prefix={<UnlockOutlined className="text-orange-500" />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Card className="shadow-lg rounded-xl border-0">
        <Tabs 
          items={tabItems}
          size="large"
        />
      </Card>

      {/* Role Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <TeamOutlined className="text-olive-green-600" />
            <span>
              {editingRole 
                ? (language === 'ar' ? 'تعديل الدور' : 'Edit Role') 
                : (language === 'ar' ? 'إضافة دور' : 'Add Role')
              }
            </span>
          </div>
        }
        open={roleModalVisible}
        onCancel={() => {
          setRoleModalVisible(false)
          setEditingRole(null)
          form.resetFields()
        }}
        maskClosable={true}
        keyboard={true}
        footer={null}
        width={800}
        destroyOnClose={true}
        className="modern-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleRoleSubmit}
          className="mt-4"
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="name"
                label={language === 'ar' ? 'الاسم' : 'Name'}
                rules={[{ required: true, message: language === 'ar' ? 'الرجاء إدخال الاسم' : 'Please enter name' }]}
              >
                <Input 
                  placeholder={language === 'ar' ? 'اسم الدور' : 'Role name'}
                  prefix={<TeamOutlined />}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="nameAr"
                label={language === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)'}
              >
                <Input 
                  placeholder={language === 'ar' ? 'اسم الدور بالعربية' : 'Role name in Arabic'}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="description"
            label={language === 'ar' ? 'الوصف' : 'Description'}
          >
            <Input.TextArea 
              rows={3}
              placeholder={language === 'ar' ? 'وصف الدور' : 'Role description'}
            />
          </Form.Item>
          <Divider orientation="left">
            <SafetyOutlined className="mr-2" />
            {language === 'ar' ? 'الصلاحيات' : 'Permissions'}
          </Divider>
          <Form.Item
            name="permissionIds"
            label={language === 'ar' ? 'اختر الصلاحيات' : 'Select Permissions'}
          >
            <Checkbox.Group className="w-full">
              <Row gutter={[16, 16]}>
                {permissions.map((perm) => (
                  <Col xs={24} sm={12} lg={8} key={perm.id}>
                    <Checkbox value={perm.id} className="w-full">
                      <div className="flex items-center gap-2">
                        <SafetyOutlined className="text-olive-green-600" />
                        <span className="font-medium">{perm.nameAr || perm.name}</span>
                        <Tag color="purple" className="text-xs">{perm.resource}</Tag>
                      </div>
                    </Checkbox>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
          </Form.Item>
          <Divider />
          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button 
                onClick={() => {
                  setRoleModalVisible(false)
                  setEditingRole(null)
                  form.resetFields()
                }}
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                className="bg-olive-green-600 hover:bg-olive-green-700 border-0"
                icon={editingRole ? <EditOutlined /> : <PlusOutlined />}
              >
                {editingRole 
                  ? (language === 'ar' ? 'تحديث' : 'Update') 
                  : (language === 'ar' ? 'إنشاء' : 'Create')
                }
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default AdminPermissions
