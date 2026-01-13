# تعليمات رفع المشروع على Vercel

## الخطوات السريعة

### 1. إعداد متغيرات البيئة في Vercel

1. اذهب إلى [Vercel Dashboard](https://vercel.com/dashboard)
2. اختر مشروعك أو أنشئ مشروع جديد
3. اذهب إلى **Settings** > **Environment Variables**
4. أضف المتغير التالي:

```
VITE_API_URL=https://your-backend-api-url.com/api
```

**مهم:** استبدل `https://your-backend-api-url.com/api` بعنوان API الخاص بالخادم الخلفي.

### 2. إعدادات البناء في Vercel

عند استيراد المشروع، تأكد من الإعدادات التالية:

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`
- **Root Directory:** `front-end` (إذا كان المشروع في مجلد فرعي)

### 3. طرق الرفع

#### الطريقة الأولى: عبر GitHub (موصى بها)

1. ارفع الكود إلى GitHub
2. في Vercel، اضغط **Add New Project**
3. اختر المستودع من GitHub
4. تأكد من الإعدادات المذكورة أعلاه
5. أضف متغيرات البيئة
6. اضغط **Deploy**

#### الطريقة الثانية: عبر Vercel CLI

```bash
# تثبيت Vercel CLI
npm i -g vercel

# تسجيل الدخول
vercel login

# الانتقال إلى مجلد المشروع
cd front-end

# الرفع
vercel

# للبيئة الإنتاجية
vercel --prod
```

### 4. التحقق من الرفع

بعد الرفع:
1. تأكد من أن الموقع يعمل
2. تحقق من أن API calls تعمل بشكل صحيح
3. تأكد من أن جميع الصفحات تعمل

## ملاحظات مهمة

- ✅ ملف `vercel.json` جاهز ومضبوط
- ✅ ملف `.vercelignore` موجود لتجاهل الملفات غير الضرورية
- ✅ البناء تم بنجاح في مجلد `dist`
- ⚠️ تأكد من إضافة `VITE_API_URL` في Vercel Environment Variables

## استكشاف الأخطاء

إذا واجهت مشاكل:

1. **خطأ في البناء:**
   - تحقق من أن Node.js version هو 18 أو أحدث
   - تحقق من أن جميع dependencies مثبتة

2. **خطأ في API calls:**
   - تأكد من أن `VITE_API_URL` مضبوط بشكل صحيح
   - تحقق من أن الخادم الخلفي يعمل ومتاح

3. **مشاكل في Routing:**
   - ملف `vercel.json` يحتوي على rewrite rules للتعامل مع React Router

## الملفات المهمة

- `vercel.json` - إعدادات Vercel
- `.vercelignore` - ملفات يتم تجاهلها
- `dist/` - مجلد البناء النهائي
- `README-VERCEL.md` - دليل تفصيلي بالإنجليزية

