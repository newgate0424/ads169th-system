# วิธีการเปิดใช้งาน Facebook App สำหรับ Production

## 🚀 ขั้นตอนการเปิดใช้งาน Facebook App

### 1. เปลี่ยนสถานะแอพเป็น Live

**ใน Facebook Developers Console:**

1. **ไปที่ Basic Settings**
   - คลิก "Settings" > "Basic" ในเมนูซ้าย
   - ดูที่ส่วน "App Mode"
   - ถ้าขึ้น "Development" ให้เปลี่ยนเป็น "Live"

2. **กดปุ่ม "Switch to Live Mode"**
   - จะมี popup ขึ้นมาให้ยืนยัน
   - อ่านข้อกำหนดและกด "Switch Mode"

### 2. ตั้งค่า Privacy Policy URL (บังคับ)

**สำคัญมาก:** Facebook ต้องการ Privacy Policy URL

```
Privacy Policy URL: https://yourdomain.com/privacy
Terms of Service URL: https://yourdomain.com/terms
```

**ใน Basic Settings:**
- เพิ่ม Privacy Policy URL: `https://yourdomain.com/privacy`
- เพิ่ม Terms of Service URL: `https://yourdomain.com/terms` (optional แต่แนะนำ)

### 3. ตั้งค่า App Domains

**ใน Basic Settings > App Domains:**
```
yourdomain.com
```

**ห้ามใส่ http:// หรือ https://** - ใส่แค่ domain name เท่านั้น

### 4. ตั้งค่า Facebook Login

**ไปที่ Products > Facebook Login > Settings:**

**Valid OAuth Redirect URIs:**
```
https://yourdomain.com/
https://yourdomain.com/login
https://yourdomain.com/dashboard
```

**Valid Deauthorize Callback URL:**
```
https://yourdomain.com/api/auth/facebook/deauthorize
```

### 5. ตั้งค่า Data Deletion Request URL

**สำหรับ GDPR Compliance (บังคับ):**
```
Data Deletion Request URL: https://yourdomain.com/api/auth/facebook/delete-data
```

### 6. ข้อมูลที่ต้องกรอกให้ครบ

**ใน Basic Settings:**
- **Display Name:** ads169th System
- **Contact Email:** your-email@domain.com
- **Privacy Policy URL:** https://yourdomain.com/privacy
- **Terms of Service URL:** https://yourdomain.com/terms
- **App Icon:** อัปโหลดโลโก้ขนาด 1024x1024 px
- **Category:** Business

### 7. การตรวจสอบก่อน Go Live

**ใน App Review > Current Submissions:**
- ตรวจสอบว่าทุก requirement ผ่านแล้ว
- ไม่ควรมี warning หรือ error

### 8. สิทธิ์ที่ต้องการ (Basic Permissions)

**สิทธิ์เหล่านี้ไม่ต้อง Review:**
- `email` ✅
- `public_profile` ✅

**ถ้าต้องการสิทธิ์เพิ่มเติม ต้องขอ App Review**

## 🔧 ไฟล์ที่ต้องเพิ่มในเว็บไซต์

### 1. Data Deletion Callback API

สร้างไฟล์ `src/app/api/auth/facebook/delete-data/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { signed_request } = await request.json()
    
    // Process data deletion request
    // Log the request for compliance
    console.log('Facebook data deletion request:', signed_request)
    
    return NextResponse.json({
      url: 'https://yourdomain.com/privacy#data-deletion',
      confirmation_code: 'deletion-' + Date.now()
    })
  } catch (error) {
    console.error('Data deletion error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
```

### 2. Deauthorize Callback API

สร้างไฟล์ `src/app/api/auth/facebook/deauthorize/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { signed_request } = await request.json()
    
    // Process app deauthorization
    // Remove user's data or mark as deauthorized
    console.log('Facebook app deauthorized:', signed_request)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Deauthorization error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
```

## ⚠️ Common Issues และแก้ไข

### 1. "App Not Available" Error
**สาเหตุ:** App ยังอยู่ใน Development Mode
**แก้ไข:** เปลี่ยนเป็น Live Mode ใน Basic Settings

### 2. "Invalid Domain" Error
**สาเหตุ:** App Domains ไม่ตรงกับเว็บไซต์
**แก้ไข:** ตรวจสอบ App Domains ใน Basic Settings

### 3. "Privacy Policy Required" Error
**สาเหตุ:** ไม่ได้ใส่ Privacy Policy URL
**แก้ไข:** เพิ่ม Privacy Policy URL ที่ใช้งานได้จริง

### 4. "Redirect URI Mismatch" Error
**สาเหตุ:** OAuth Redirect URI ไม่ตรง
**แก้ไข:** ตรวจสอบ Valid OAuth Redirect URIs

## 📋 Checklist ก่อน Go Live

- [ ] App Mode = "Live"
- [ ] Privacy Policy URL ใช้งานได้
- [ ] App Domains ถูกต้อง
- [ ] OAuth Redirect URIs ครบถ้วน
- [ ] App Icon อัปโหลดแล้ว
- [ ] Contact Email ถูกต้อง
- [ ] Data Deletion Request URL ตั้งค่าแล้ว
- [ ] Deauthorize Callback URL ตั้งค่าแล้ว

## 🔍 การทดสอบหลัง Go Live

1. **ลองเข้าสู่ระบบด้วย Facebook** จากเว็บไซต์จริง
2. **ตรวจสอบใน Facebook > Settings > Apps and Websites**
3. **ทดสอบ Data Deletion Request**

---

**🎯 หลังจากทำขั้นตอนเหล่านี้แล้ว Facebook App จะเปิดใช้งานได้แล้ว!**