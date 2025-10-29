# Facebook SDK Integration Guide

## 🚀 Facebook SDK Setup for ads169th System

### 📋 วิธีการตั้งค่า Facebook App

#### 1. สร้าง Facebook App
1. ไปที่ [Facebook Developers](https://developers.facebook.com/)
2. คลิก "My Apps" > "Create App"
3. เลือก "Consumer" หรือ "Business"
4. กรอกข้อมูล:
   - **App Display Name:** ads169th System
   - **Contact Email:** your-email@domain.com

#### 2. ตั้งค่า Facebook Login
1. ในแดชบอร์ด App ไปที่ "Add Product"
2. เลือก "Facebook Login" > "Set Up"
3. เลือก "Web" platform
4. กรอก Site URL: `https://yourdomain.com/`

#### 3. ตั้งค่า OAuth Redirect URIs
ใน Facebook Login Settings เพิ่ม Valid OAuth Redirect URIs:
```
https://yourdomain.com/
https://yourdomain.com/login
https://yourdomain.com/dashboard
```

#### 4. ตั้งค่า App Domains
ใน Basic Settings เพิ่ม App Domains:
```
yourdomain.com
```

### 🔧 Environment Variables

ในไฟล์ `.env.local` เพิ่ม:
```bash
# Facebook SDK Configuration
NEXT_PUBLIC_FACEBOOK_APP_ID="your-facebook-app-id"
NEXT_PUBLIC_FACEBOOK_API_VERSION="v18.0"
```

**ตัวอย่าง:**
```bash
NEXT_PUBLIC_FACEBOOK_APP_ID="1234567890123456"
NEXT_PUBLIC_FACEBOOK_API_VERSION="v18.0"
```

### 📁 ไฟล์ที่เกี่ยวข้อง

1. **`src/components/facebook-sdk.tsx`** - Facebook SDK component
2. **`src/components/facebook-login-button.tsx`** - Facebook Login button
3. **`src/app/api/auth/facebook/route.ts`** - Facebook authentication API
4. **`src/app/layout.tsx`** - รวม Facebook SDK ในแอป

### 🔑 การใช้งาน Facebook Login

#### ในหน้า Login
Facebook Login Button จะปรากฏในหน้า `/login` โดยอัตโนมัติ

#### การทำงาน
1. ผู้ใช้คลิกปุ่ม "เข้าสู่ระบบด้วย Facebook"
2. เปิดหน้าต่าง Facebook Login popup
3. ผู้ใช้อนุญาตสิทธิ์ (email, public_profile)
4. ระบบรับ access token จาก Facebook
5. ตรวจสอบ token กับ Facebook API
6. สร้าง/อัปเดตผู้ใช้ในฐานข้อมูล
7. สร้าง session และ redirect ไป dashboard

### 🔐 สิทธิ์ที่ขอจาก Facebook

- **`email`** - อีเมลของผู้ใช้
- **`public_profile`** - ชื่อ, รูปโปรไฟล์, Facebook ID

### 📊 ข้อมูลที่เก็บในฐานข้อมูล

เมื่อผู้ใช้เข้าสู่ระบบด้วย Facebook ครั้งแรก ระบบจะสร้าง User record ใหม่:

```sql
User {
  username: "fb_1234567890" หรือ email
  email: "user@email.com"
  name: "ชื่อจริงจาก Facebook"
  facebookId: "1234567890"
  profilePicture: "https://graph.facebook.com/photo.jpg"
  role: "EMPLOYEE" (default)
  isActive: true
  password: "" (ไม่ใช้รหัสผ่าน)
}
```

### 🎯 การทดสอบ

#### 1. การทดสอบในโหมด Development
```bash
npm run dev
```
เปิดเบราว์เซอร์ไปที่ `http://localhost:3000/login`

#### 2. การทดสอบ Facebook Login
1. คลิกปุ่ม "เข้าสู่ระบบด้วย Facebook"
2. ตรวจสอบ popup Facebook
3. อนุญาตสิทธิ์
4. ตรวจสอบการ redirect ไป dashboard

### 🛡️ Security Notes

1. **App Secret:** ห้ามเปิดเผย App Secret ในโค้ด frontend
2. **Token Validation:** ระบบจะตรวจสอบ access token กับ Facebook ทุกครั้ง
3. **HTTPS:** ใช้ HTTPS ใน production เท่านั้น
4. **Domain Validation:** Facebook จะตรวจสอบ domain ที่ลงทะเบียน

### 🔍 การ Debug

#### 1. เช็ค Console Logs
```javascript
// ใน browser console
console.log(window.FB) // ตรวจสอบ Facebook SDK
```

#### 2. Facebook Debug Tools
- [Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken/)
- [Sharing Debugger](https://developers.facebook.com/tools/debug/)

#### 3. Common Issues

**Facebook SDK not loading:**
- ตรวจสอบ App ID ใน environment variables
- ตรวจสอบ internet connection
- ตรวจสอบ browser blocking scripts

**Login failed:**
- ตรวจสอบ OAuth Redirect URIs
- ตรวจสอบ App Domains
- ตรวจสอบ App Review status (ถ้าใช้สิทธิ์พิเศษ)

### 📱 Mobile Testing

สำหรับการทดสอบบนมือถือ ต้องใช้ HTTPS domain จริง:
```
https://yourdomain.com/login
```

### 🚀 Production Deployment

1. อัปเดต environment variables บน server
2. ตั้งค่า OAuth redirect URIs ให้ตรงกับ production domain
3. ทดสอบ Facebook Login ใน production
4. ตรวจสอบ SSL certificate

---

## 📞 Support

หากพบปัญหาในการตั้งค่า Facebook SDK:
1. ตรวจสอบ Facebook Developer Console
2. ดู browser console สำหรับ error messages
3. ตรวจสอบ server logs ใน API route `/api/auth/facebook`

**🎉 Facebook SDK พร้อมใช้งานใน ads169th System แล้ว!**