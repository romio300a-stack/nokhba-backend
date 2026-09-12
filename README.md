# Nokhba Backend — سيرفر واحد لـ 3 مواقع

Backend مركزي (Node.js Serverless على Vercel) يخدم مواقع site1, site2, site3 ويستخدم Neon Postgres واحدة، مع عزل كامل للبيانات بين المواقع.

## 1) نشر الباك إند على Vercel

1. اعمل Repo جديد على GitHub (مثلاً `nokhba-backend`) وارفع محتوى هذا المجلد فيه.
2. من Vercel: New Project → استورد الـ Repo ده.
3. في Project Settings → Environment Variables ضيف:

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | connection string من Neon (لازم فيها `sslmode=require`) |
   | `JWT_SECRET` | نص عشوائي طويل، مثلاً نتيجة `openssl rand -hex 32` |
   | `FRONTEND_ORIGINS` | روابط المواقع التلاتة مفصولة بفاصلة، بدون `/` في الآخر |
   | `SITE1_PASSWORD` | باسورد أدمن site1 |
   | `SITE2_PASSWORD` | باسورد أدمن site2 |
   | `SITE3_PASSWORD` | باسورد أدمن site3 |

4. Deploy. هتاخد رابط زي `https://nokhba-backend.vercel.app`.

⚠️ لازم تحدّث `FRONTEND_ORIGINS` بعد ما تعرف الروابط النهائية للمواقع التلاتة على Vercel (أو دومين مخصص لو هتستخدم).

## 2) تجهيز قاعدة بيانات Neon

1. على [neon.tech](https://neon.tech) اعمل مشروع جديد (أو استخدم مشروع موجود).
2. من الـ SQL Editor بتاع Neon، شغّل محتوى `schema.sql` بالكامل مرة واحدة.
3. انسخ الـ **Connection string** (Pooled connection) وحطه في `DATABASE_URL` في Vercel.

## 3) التأكد إن كل حاجة شغالة

بعد النشر افتح في المتصفح:
```
https://<backend-domain>/api/health
```
المفروض يرجع `{"ok":true,"db":"connected"}`. لو رجع `"db":"connected"` غلط، يبقى المشكلة في `DATABASE_URL`.

## 4) الـ API

| Method | Endpoint | يحتاج تسجيل دخول؟ | الوصف |
|---|---|---|---|
| GET | `/api/links?site=site1` | لا | كل روابط موقع معيّن |
| POST | `/api/links` | نعم | إضافة رابط (للـ site بتاع الجلسة الحالية) |
| PUT | `/api/links/:id` | نعم | تعديل رابط (لازم يكون بتاع نفس site الجلسة) |
| DELETE | `/api/links/:id` | نعم | حذف رابط (لازم يكون بتاع نفس site الجلسة) |
| POST | `/api/auth/login` | لا | body: `{ "site": "site1", "password": "..." }` |
| POST | `/api/auth/logout` | لا | تسجيل خروج |
| GET | `/api/auth/me` | لا | يرجع `{ authenticated, site }` |

كل طلبات الـ Auth والـ CRUD لازم تتبعت بـ `credentials: "include"` من الفرونت إند عشان الكوكي (JWT) يتبعت ويترجع.

## 5) الأمان

- الجلسة عبارة عن JWT في كوكي `httpOnly` (مش قابل للقراءة من JavaScript في المتصفح) و`Secure` و`SameSite=None`.
- كل عملية تعديل/حذف بتتحقق من إن `site_id` بتاع الرابط في قاعدة البيانات يطابق `site` المشفّر جوه الـ JWT — يعني حتى لو حد عدّل الطلب يدويًا، مش هيقدر يلمس بيانات موقع تاني.
- كلمات المرور موجودة فقط كـ Environment Variables في الباك إند، مش موجودة في أي كود Frontend.
