# Next.js Caching Solution for Portfolio Website

## ปัญหาเดิม
ทุกครั้งที่มีการ insert/update ข้อมูลใน Vercel ต้อง redeploy ถึงจะแสดงผล เพราะ:
- หน้าเว็บสาธารณะ (public pages) ไม่มีการกำหนด caching strategy
- Next.js ใช้ static generation โดยไม่มี mechanism สำหรับการอัพเดทข้อมูลแบบ real-time
- ขาด ISR (Incremental Static Regeneration) configuration

## วิธีแก้ปัญหา
เพิ่ม `export const revalidate = 60` ในแต่ละหน้าเพื่อใช้ ISR (Incremental Static Regeneration)

### หน้าที่แก้ไขแล้ว:

1. **Skills Page** (`app/(public)/skills/page.tsx`)
   - เพิ่ม `export const revalidate = 60`
   - ระบบจะ revalidate ทุก 60 วินาที

2. **Blog Page** (`app/(public)/blog/page.tsx`)
   - เพิ่ม `export const revalidate = 60`
   - ระบบจะ revalidate ทุก 60 วินาที

3. **Blog Detail Page** (`app/(public)/blog/[slug]/page.tsx`)
   - เพิ่ม `export const revalidate = 60`
   - ระบบจะ revalidate ทุก 60 วินาที

4. **About Page** (`app/(public)/about/page.tsx`)
   - เพิ่ม `export const revalidate = 60`
   - ระบบจะ revalidate ทุก 60 วินาที

### หน้าที่มีการตั้งค่าแล้ว (ไม่ต้องแก้):
- **Home Page** (`app/(public)/page.tsx`) - มี `export const revalidate = 0` อยู่แล้ว
- **Projects Page** (`app/(public)/projects/page.tsx`) - มี `export const revalidate = 0` อยู่แล้ว
- **Project Detail Page** (`app/(public)/projects/[id]/page.tsx`) - มี `export const revalidate = 0` อยู่แล้ว

## หลักการทำงานของ ISR

1. **ครั้งแรก**: Next.js สร้าง static page จากข้อมูลใน database
2. **การเรียกดู**: แสดง static page ที่มีอยู่
3. **Revalidation**: หลังจาก 60 วินาที หากมีการเรียกดูหน้าเว็บอีกครั้ง Next.js จะ:
   - แสดง static page เดิมให้ผู้ใช้ทันที
   - สร้างหน้าใหม่ด้วยข้อมูลล่าสุดใน background
   - อัพเดท cache ด้วยหน้าใหม่

## ประโยชน์
- ✅ ไม่ต้อง redeploy เมื่อมีการเปลี่ยนแปลงข้อมูล
- ✅ ผู้ใช้เห็นข้อมูลล่าสุดภายใน 60 วินาที
- ✅ ประสิทธิภาพดีเพราะใช้ static generation
- ✅ รองรับการอัพเดทข้อมูลแบบ real-time

## การทดสอบ
1. เพิ่ม/แก้ไขข้อมูลใน admin panel
2. รอ 60 วินาที
3. รีเฟรชหน้าเว็บสาธารณะ
4. ข้อมูลใหม่จะปรากฎโดยอัตโนมัติ

## หมายเหตุ
- สามารถปรับค่า `revalidate` ได้ตามต้องการ (เช่น 30 วินาที, 120 วินาที)
- หากต้องการ real-time 100% ให้ใช้ `export const revalidate = 0` (แต่จะส่งผลต่อประสิทธิภาพ)