# Entity Relationship Diagram (ERD) - Jadwa Consulting Platform

## Visual ERD Representation

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER (Central)                          │
│  id, email, password, role, emailVerified, phone, isActive     │
└────────────┬────────────────────────────────────────────────────┘
             │
             ├─────────────────┬─────────────────┬──────────────┐
             │                 │                 │              │
             ▼                 ▼                 ▼              ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────┐  ┌──────────────┐
    │   CLIENT     │  │  CONSULTANT  │  │  ADMIN   │  │ NOTIFICATION │
    │ firstName    │  │ firstName    │  │ firstName│  │ type, title  │
    │ lastName     │  │ lastName     │  │ lastName  │  │ message      │
    │ city, sector │  │ degree       │  │ adminRole │  │ isRead       │
    └──────┬───────┘  │ specialization│  │ permissions│  └──────────────┘
           │          │ rating, price│  └──────────┘
           │          └──────┬───────┘
           │                 │
           │                 │
           ▼                 ▼
    ┌──────────────┐  ┌──────────────┐
    │   BOOKING    │◄─┤ AVAILABILITY │
    │ bookingType  │  │    SLOT      │
    │ status       │  │ dayOfWeek    │
    │ scheduledAt  │  │ startTime    │
    │ price        │  │ endTime      │
    └──────┬───────┘  └──────────────┘
           │
           ├──────────┬──────────┬──────────┐
           │          │          │          │
           ▼          ▼          ▼          ▼
    ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
    │ SESSION  │ │  REPORT  │ │ PAYMENT  │ │ SERVICE  │
    │ roomId   │ │ pdfUrl   │ │ amount   │ │ title    │
    │ startTime│ │ wordUrl  │ │ method   │ │ category │
    │ endTime  │ │ status   │ │ status   │ │ price    │
    └────┬─────┘ └──────────┘ └────┬─────┘ └──────────┘
         │                          │
         │                          │
         ▼                          ▼
    ┌──────────┐              ┌──────────┐
    │ MESSAGE  │              │ EARNING  │
    │ content  │              │ amount   │
    │ type     │              │ netAmount│
    │ isRead   │              │ status   │
    └──────────┘              └──────────┘
                                     │
                                     │
                                     ▼
                              ┌──────────────┐
                              │  WITHDRAWAL  │
                              │ amount       │
                              │ bankName     │
                              │ status       │
                              └──────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    CONTENT MANAGEMENT                            │
├──────────────────────┬──────────────────────────────────────────┤
│      ARTICLE         │            CMS PAGE                      │
│ title, slug, content │  title, slug, content                    │
│ status, views        │  isPublished                             │
│ authorId → User      │                                          │
└──────────────────────┴──────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   SMART PLATFORM FEATURES                       │
├──────────────┬──────────────┬───────────────────────────────────┤
│ ECONOMIC     │  DASHBOARD   │         DATASET                  │
│ INDICATOR    │              │                                   │
│ name, value  │ title, config│  title, fileUrl, fileType         │
│ period       │ isPublic     │  downloadCount                   │
└──────────────┴──────────────┴───────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    FEASIBILITY STUDY                            │
│  title, marketStudy, financialStudy, legalStudy, riskAnalysis  │
│  expectedRevenues, expectedCosts, status                        │
│  clientId → Client, consultantId → Consultant                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    SYSTEM SETTINGS                              │
│  key, value, description, category                              │
└─────────────────────────────────────────────────────────────────┘
```

## Relationship Summary

### One-to-One (1:1)
1. **User ↔ Client** - One user can be one client
2. **User ↔ Consultant** - One user can be one consultant
3. **User ↔ Admin** - One user can be one admin
4. **Booking ↔ Session** - One booking has one session
5. **Booking ↔ Report** - One booking generates one report
6. **Booking ↔ Payment** - One booking has one payment

### One-to-Many (1:N)
1. **User → Bookings** (as client) - One client can have many bookings
2. **Consultant → Bookings** - One consultant can have many bookings
3. **Consultant → AvailabilitySlots** - One consultant has many time slots
4. **Consultant → Reports** - One consultant creates many reports
5. **Consultant → Earnings** - One consultant has many earnings
6. **Consultant → Withdrawals** - One consultant can request many withdrawals
7. **Client → FeasibilityStudies** - One client can request many studies
8. **Booking → Messages** (via Session) - One session has many messages
9. **User → Notifications** - One user receives many notifications
10. **User → Articles** - One user (admin) can write many articles
11. **Payment → Earnings** - One payment generates one earning
12. **Service → Bookings** - One service can be booked many times

### Many-to-Many (M:N)
- **Consultant ↔ Services**: Through Bookings (consultants can offer multiple services)
- **Client ↔ Consultants**: Through Bookings (clients can book multiple consultants)

## Key Constraints

1. **Unique Constraints**:
   - User.email (unique)
   - Booking.paymentId (unique, nullable)
   - Payment.transactionId (unique, nullable)
   - Payment.invoiceNumber (unique, nullable)
   - Article.slug (unique)
   - CMSPage.slug (unique)
   - SystemSetting.key (unique)

2. **Foreign Key Constraints**:
   - All foreign keys have `onDelete: Cascade` or appropriate action
   - Ensures referential integrity

3. **Indexes**:
   - All foreign keys are indexed
   - Frequently queried fields are indexed
   - Composite indexes where needed

## Data Flow

1. **Booking Flow**:
   - Client creates Booking → Payment created → Session scheduled → Report generated → Earning created

2. **Consultant Workflow**:
   - Consultant sets AvailabilitySlots → Accepts Booking → Conducts Session → Uploads Report → Receives Earning → Requests Withdrawal

3. **Notification Flow**:
   - System events trigger Notifications → Users receive notifications → Mark as read

4. **Content Flow**:
   - Admin creates Articles/CMS Pages → Published → Visible to users

