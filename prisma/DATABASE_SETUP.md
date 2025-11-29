# Database Setup Guide - Jadwa Consulting Platform

## 📋 Prerequisites

1. **MySQL Server** (version 8.0 or higher)
2. **Node.js** (version 18 or higher)
3. **npm** or **yarn**

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="mysql://username:password@localhost:3306/jadwa_platform?schema=public"
```

Replace:
- `username` with your MySQL username
- `password` with your MySQL password
- `localhost:3306` with your MySQL host and port
- `jadwa_platform` with your desired database name

### 3. Create Database

```sql
CREATE DATABASE jadwa_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Generate Prisma Client

```bash
npm run prisma:generate
```

### 5. Run Migrations

```bash
npm run prisma:migrate
```

This will:
- Create all tables
- Set up all relationships
- Create indexes
- Apply all constraints

### 6. Seed Database (Optional)

```bash
npm run prisma:seed
```

This will create:
- System settings
- Sample services
- Super admin user
- Sample consultant
- Sample client
- CMS pages
- Economic indicators

## 📊 Database Schema Overview

### Core Models (25 total)

1. **User & Authentication** (4 models)
   - User
   - Client
   - Consultant
   - Admin

2. **Services & Bookings** (4 models)
   - Service
   - Booking
   - AvailabilitySlot
   - Session

3. **Communication** (1 model)
   - Message

4. **Reports & Studies** (2 models)
   - Report
   - FeasibilityStudy

5. **Payments & Financials** (3 models)
   - Payment
   - Earning
   - Withdrawal

6. **Notifications** (1 model)
   - Notification

7. **Content Management** (2 models)
   - Article
   - CMSPage

8. **Smart Platform** (3 models)
   - EconomicIndicator
   - Dashboard
   - Dataset

9. **System** (1 model)
   - SystemSetting

## 🔧 Common Commands

### Prisma Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Create new migration
npm run prisma:migrate

# Open Prisma Studio (Database GUI)
npm run prisma:studio

# Seed database
npm run prisma:seed

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# View migration status
npx prisma migrate status

# Format schema
npx prisma format

# Validate schema
npx prisma validate
```

## 📈 Database Statistics

- **Total Tables**: 25
- **Total Enums**: 12
- **Total Indexes**: 50+
- **Total Relations**: 40+

## 🔐 Security Best Practices

1. **Use Environment Variables**: Never commit `.env` file
2. **Connection Pooling**: Configure in Prisma schema
3. **SSL/TLS**: Use in production
4. **Backup Regularly**: Set up automated backups
5. **Monitor Performance**: Use MySQL slow query log
6. **Regular Updates**: Keep Prisma and MySQL updated

## 🐛 Troubleshooting

### Connection Issues

```bash
# Test database connection
npx prisma db pull

# Check connection string format
mysql://user:password@host:port/database
```

### Migration Issues

```bash
# Reset migrations (development only)
npx prisma migrate reset

# Resolve migration conflicts
npx prisma migrate resolve --applied <migration_name>
```

### Schema Issues

```bash
# Validate schema
npx prisma validate

# Format schema
npx prisma format
```

## 📝 Production Checklist

- [ ] Set up database backups
- [ ] Configure connection pooling
- [ ] Enable SSL/TLS connections
- [ ] Set up read replicas (if needed)
- [ ] Configure monitoring
- [ ] Review and optimize indexes
- [ ] Set up automated migrations
- [ ] Test backup and restore procedures
- [ ] Review security settings
- [ ] Performance testing

## 🔄 Migration Workflow

1. **Development**:
   ```bash
   # Make changes to schema.prisma
   npx prisma migrate dev --name description_of_changes
   ```

2. **Production**:
   ```bash
   # Apply migrations
   npx prisma migrate deploy
   ```

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)

