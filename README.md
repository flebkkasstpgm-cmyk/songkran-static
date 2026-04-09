# 💦 Songkran Online Static 2569 (Office Edition)

ระบบส่งคำอวยพรสงกรานต์ออนไลน์แบบ Static Website 100% พัฒนาโดย **JARVIS V2.1** สำหรับใช้งานบน GitHub Pages หรือ Static Hosting ทั่วไป

## ✨ คุณสมบัติ (Features)
- **Static Content**: ไม่ต้องใช้ Node.js/Backend รันได้ทันทีผ่าน Browser
- **LocalStorage Persistence**: เก็บข้อมูลคำอวยพรไว้ในเครื่องผู้ใช้ (ไม่ต้องมี Database)
- **Premium UI**: ดีไซน์ขันเงิน-ขันทองแบบ Metallic ลายไทย พร้อมอนิเมชั่นลอยนิ่งๆ ด้วย GPU Acceleration
- **Responsive**: รองรับการเปิดผ่านมือถือและคอมพิวเตอร์

---

## 🚀 ขั้นตอนการ Deploy ขึ้น GitHub Pages (Step-by-Step)

หากเจ้านายต้องการนำระบบนี้ขึ้นออนไลน์เพื่อให้เพื่อนๆ เข้ามาเล่นได้ ให้ทำตามนี้ครับ:

### 1. เตรียมบัญชี GitHub
- เข้าไปที่ [GitHub.com](https://github.com/) และ Log in เข้าใช้งาน (หากยังไม่มีให้สมัครสมาชิกก่อนครับ)

### 2. สร้าง Repository ใหม่
- คลิกปุ่ม **"+"** มุมขวาบน เลือก **"New repository"**
- ตั้งชื่อ Repository เช่น `songkran-2569`
- เลือกเป็น **Public**
- คลิกปุ่ม **"Create repository"**

### 3. อัปโหลดไฟล์ (แบบง่ายที่สุดผ่านหน้าเว็บ)
- ในหน้า Repository ที่สร้างใหม่ ให้คลิกลิงก์ **"uploading an existing file"**
- ลากไฟล์ทั้ง 3 ไฟล์จากเครื่องเจ้านายไปวาง:
  - `index.html`
  - `style.css`
  - `script.js`
- เมื่ออัปโหลดเสร็จ ให้เลื่อนลงมาพิมพ์ Commit message (เช่น `Initial deploy`) แล้วคลิก **"Commit changes"**

### 4. เปิดใช้งาน GitHub Pages
- ไปที่แถบเมนู **Settings** (รูปฟันเฟืองด้านบน)
- ที่เมนูด้านซ้าย เลือกหัวข้อ **Pages**
- ในส่วนของ **Build and deployment** ให้ตรวจสอบว่า:
  - Source: `Deploy from a branch`
  - Branch: เลือก `main` (หรือ `master`) และโฟลเดอร์ `/ (root)`
- คลิกปุ่ม **Save**

### 5. รับลิงก์ออนไลน์
- รอประมาณ 1-2 นาที ให้รีเฟรชหน้า Pages นั้น
- จะมีแถบสีฟ้าปรากฏขึ้นพร้อมข้อความ **"Your site is live at..."**
- เจ้านายสามารถคัดลอกลิงก์นั้นส่งให้เพื่อนๆ หรือเจ้านายท่านอื่นเข้ามาอวยพรได้ทันทีครับ! 💦

---
*จัดทำโดย JARVIS - ผู้ช่วย AI ส่วนตัวของคุณ*
