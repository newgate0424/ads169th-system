# แก้ปัญหา Facebook Login หมุนค้าง

## 🔧 วิธีแก้ปัญหาเบื้องต้น

### 1. ตรวจสอบการตั้งค่า App ID

**ปัญหา:** Facebook SDK ไม่โหลดหรือ App ID ไม่ถูกต้อง

**วิธีแก้:**
1. เปิดไฟล์ `.env.local`
2. ตรวจสอบว่ามีการตั้งค่า:
   ```bash
   NEXT_PUBLIC_FACEBOOK_APP_ID="ใส่ App ID จริงของคุณ"
   NEXT_PUBLIC_FACEBOOK_API_VERSION="v18.0"
   ```
3. **ห้าม** ใช้ `"your-facebook-app-id"` (ต้องเป็น App ID จริง)

### 2. สร้าง Facebook App

**ถ้ายังไม่มี Facebook App:**
1. ไปที่ [Facebook Developers](https://developers.facebook.com/)
2. สร้าง App ใหม่
3. เลือก "Consumer" หรือ "Business"
4. คัดลอก App ID มาใส่ใน `.env.local`

### 3. ตรวจสอบสถานะด้วย Debug Panel

**ใน Development Mode:**
1. เปิดหน้า `/login`
2. คลิกปุ่ม **"FB Debug"** ที่มุมล่างขวา
3. ดูสถานะ:
   - ✅ **SDK Loaded:** Facebook SDK โหลดแล้ว
   - ✅ **App ID:** App ID ถูกต้อง (ไม่ใช่ your-facebook-app-id)
   - ✅ **Script:** Script โหลดแล้ว
   - ✅ **fbAsyncInit:** Facebook initialized แล้ว

### 4. แก้ปัญหาการโหลดช้า

**ปัญหา:** Facebook SDK โหลดช้าหรือไม่โหลด

**วิธีแก้:**
1. **ตรวจสอบ Internet Connection**
2. **ปิด Ad Blocker** (อาจบล็อก Facebook SDK)
3. **ล้าง Browser Cache**
4. **ลองใช้ Incognito Mode**

### 5. ปิด Facebook Login (ถ้าไม่ต้องการใช้)

**ถ้าไม่ต้องการ Facebook Login:**
1. ลบหรือเปลี่ยน environment variable:
   ```bash
   # ใน .env.local
   NEXT_PUBLIC_FACEBOOK_APP_ID="your-facebook-app-id"
   ```
2. Facebook Login จะซ่อนอัตโนมัติ

### 6. วิธีการทดสอบ

**ทดสอบแบบเต็ม:**
1. เปิด Developer Console (F12)
2. คลิกปุ่ม **"Test FB Login"** ใน Debug Panel
3. ดูข้อความใน Console

**สิ่งที่ควรเห็น:**
```
Facebook SDK script loaded
Facebook SDK initialized successfully
```

### 7. Common Error Messages

**"Facebook SDK ยังไม่พร้อม"**
- รอให้ SDK โหลดเสร็จ (ประมาณ 2-5 วินาที)
- ตรวจสอบ internet connection

**"Facebook App ID ไม่ถูกต้อง"**
- ตั้ค่า App ID ใหม่ใน `.env.local`
- Restart development server (`npm run dev`)

**"หมดเวลาการเชื่อมต่อ"**
- ตรวจสอบ internet connection
- ลองใหม่อีกครั้ง

### 8. Production Deployment

**สำหรับ Production:**
1. อัปเดต `.env.production` หรือ environment variables บน server
2. ตั้งค่า Domain Validation ใน Facebook App:
   - App Domains: `yourdomain.com`
   - Valid OAuth Redirect URIs: `https://yourdomain.com/login`

### 9. Alternative Login

**ถ้า Facebook Login ไม่ทำงาน:**
- ใช้ Username/Password login ปกติ
- Credentials: `admin/admin123` หรือ `employee/employee123`

---

## 🔍 Debug Steps

1. **เปิด Browser Console** (F12)
2. **ดู Network Tab** - ตรวจสอบการโหลด Facebook SDK
3. **ดู Console Tab** - ตรวจสอบ error messages
4. **ใช้ Facebook Debug Panel** - ดูสถานะ real-time

## 📞 ติดต่อ Support

หากยังพบปัญหา:
1. Screenshot หน้า Debug Panel
2. Copy error messages จาก Console
3. ระบุขั้นตอนที่ทำให้เกิดปัญหา

**🎯 หลังจากแก้ไขแล้ว ระบบจะไม่หมุนค้างอีกต่อไป!**