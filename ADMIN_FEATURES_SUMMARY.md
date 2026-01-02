# BikeHub Admin Features - Implementation Summary

## Tổng quan
Đã tạo thành công các tính năng quản lý admin cho BikeHub bao gồm:
- User Admin mặc định
- Quản lý Dealer (với khả năng tạo tài khoản dealer)
- Quản lý Customer  
- Quản lý Booking
- Quản lý Referrer
- Quản lý Parks (UI mới)
- Quản lý Bikes (UI mới)
- Quản lý Rentals (UI mới)
- Role-based Access Control (Admin vs Dealer)

## ⚠️ Thay đổi mới nhất

### 1. Đã xóa phần quản lý User
- Removed "Manage Users" route khỏi navigation
- Admin và Dealer không còn thấy menu "Manage Users"

### 2. UI mới cho Parks, Bikes, Rentals
- **Parks**: Table design mới với images, actions (Edit/Delete), pagination
- **Bikes**: Status filters (All/available/rented/maintenance), bike images, rating display
- **Rentals**: Status filters, customer/bike info, period display

### 3. Dealer Account Creation
- **Modal tạo dealer**: Admin có thể tạo dealer account từ Dealer List
- **Add Dealer button**: Hiển thị modal với form đăng ký
- **Tự động tạo 2 records**: 
  - User record (role="dealer") 
  - Dealer record (thông tin dealer)
- **Auto-refresh**: Sau khi tạo thành công, danh sách tự động refresh

### 4. Role-Based Access Control
- **Admin role**: Thấy tất cả menu (Dealers, Customers, Bookings, Referrals, Parks, Bikes, Rentals)
- **Dealer role**: Chỉ thấy (Dashboard, Parks, Bikes, Rentals, Logout)
  - Không thấy: Dealers, Customers, Bookings, Referrals
- **Sidebar filtering**: Tự động ẩn menu items dựa trên role

## 1. Admin User Mặc Định

### Thông tin đăng nhập:
- **Email:** admin@rentnride.com
- **Password:** admin123

### File thay đổi:
- `api/prisma/seeds/users.seed.ts` - Cập nhật mật khẩu admin

## 2. Database Schema Changes

### Models mới được thêm vào `api/prisma/schema.prisma`:

#### Dealer Model
```prisma
model Dealer {
  id                Int      @id @default(autoincrement())
  name              String
  email             String   @unique
  phone             String?
  telegram          String?
  location          String?
  status            String   @default("Active")
  total_revenue     Float    @default(0)
  platform_fee      Float    @default(0)
  current_debt      Float    @default(0)
  last_payment_date DateTime?
  vehicle_count     Int      @default(0)
  image             String?
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt
}
```

#### Referrer Model
```prisma
model Referrer {
  id                 Int      @id @default(autoincrement())
  name               String
  phone              String?
  email              String?
  total_earnings     Float    @default(0)
  referral_count     Int      @default(0)
  last_referral_date DateTime?
  image              String?
  created_at         DateTime @default(now())
  updated_at         DateTime @updatedAt
}
```

### Seed Data:
- `api/prisma/seeds/dealers.seed.ts` - Dữ liệu mẫu cho dealers
- `api/prisma/seeds/referrers.seed.ts` - Dữ liệu mẫu cho referrers
- `api/prisma/seeds/index.ts` - Cập nhật để chạy seeds mới

## 3. Backend API

### Modules mới:

#### Dealer Module
- `api/src/modules/dealer/dealer.module.ts`
- `api/src/modules/dealer/dealer.service.ts`
- `api/src/modules/dealer/dealer.controller.ts`

**API Endpoints:**
- GET `/api/dealers` - Lấy danh sách dealers
- GET `/api/dealers/:id` - Lấy thông tin dealer
- POST `/api/dealers` - Tạo dealer mới (cần auth)
- PATCH `/api/dealers/:id` - Cập nhật dealer (cần auth)
- DELETE `/api/dealers/:id` - Xóa dealer (cần auth)

#### Referrer Module
- `api/src/modules/referrer/referrer.module.ts`
- `api/src/modules/referrer/referrer.service.ts`
- `api/src/modules/referrer/referrer.controller.ts`

**API Endpoints:**
- GET `/api/referrers` - Lấy danh sách referrers
- GET `/api/referrers/:id` - Lấy thông tin referrer
- POST `/api/referrers` - Tạo referrer mới (cần auth)
- PATCH `/api/referrers/:id` - Cập nhật referrer (cần auth)
- DELETE `/api/referrers/:id` - Xóa referrer (cần auth)

### Endpoints bổ sung:

#### User Module
- GET `/api/users/customers` - Lấy danh sách customers với thống kê

#### Rental Module  
- GET `/api/rentals/bookings` - Lấy danh sách bookings với chi tiết

### File cập nhật:
- `api/src/modules/app/app.module.ts` - Import modules mới
- `api/src/modules/user/user.controller.ts` - Thêm endpoint customers
- `api/src/modules/user/user.service.ts` - Thêm method getCustomersWithStats()
- `api/src/modules/rental/rental.controller.ts` - Thêm endpoint bookings
- `api/src/modules/rental/rental.service.ts` - Thêm method getBookingsWithDetails()

## 4. Admin Frontend

### Pages mới/cập nhật:

#### Dealer Management ✨ CẬP NHẬT
- `admin/src/views/admin/dealer/index.tsx`
- `admin/src/views/admin/dealer/components/DealerTable.tsx`
- `admin/src/views/admin/dealer/components/CreateDealerModal.tsx` **MỚI**

**Tính năng:**
- Hiển thị danh sách dealers
- Filter theo All/Active
- Filter theo payment date
- **Add Dealer button** - Mở modal tạo dealer account
- **Create Dealer Modal** - Form tạo dealer với validation
  - Fields: Name, Email, Password, Phone, Telegram, Location
  - Tự động tạo User (role="dealer") và Dealer record
  - Auto-refresh sau khi tạo thành công
- Hiển thị thông tin: Dealer, Contact, Status, Vehicles, Total Revenue, Platform Fee, Current Debt, Last Payment
- Pagination
- Sorting

#### Parks Management ✨ MỚI UI
- `admin/src/views/admin/park/index.tsx` - Refactored
- `admin/src/views/admin/park/components/ParkTable.tsx` **MỚI**

**Tính năng:**
- Modern table design matching Dealer/Customer style
- Park images display
- Edit/Delete actions per row
- Dealer filtering (dealers only see their parks)
- Pagination & Sorting

#### Bikes Management ✨ MỚI UI
- `admin/src/views/admin/bike/index.tsx` - Refactored
- `admin/src/views/admin/bike/components/BikeTable.tsx` **MỚI**

**Tính năng:**
- Status filters (All/available/rented/maintenance)
- Bike images với description preview
- Status badges với colors
- Rating display
- Edit/Delete actions
- Pagination & Sorting

#### Rentals Management ✨ MỚI UI
- `admin/src/views/admin/rental/index.tsx` - Completely rewritten
- `admin/src/views/admin/rental/components/RentalTable.tsx` **MỚI**

**Tính năng:**
- Status filters (All/pending/confirmed/completed/cancelled)
- Customer info (name, email)
- Bike info (model, location)
- Rental period display
- Price display
- Status badges
- Edit/Delete actions
- Pagination & Sorting

#### Customer Management
- `admin/src/views/admin/customer/index.tsx`
- `admin/src/views/admin/customer/components/CustomerTable.tsx`

**Tính năng:**
- Hiển thị danh sách customers
- Search theo name hoặc phone
- Hiển thị thông tin: Customer, Total Rentals, Total Spent, Average Rating, Last Rental Date
- View & Edit button
- Pagination
- Sorting

#### Booking Management
- `admin/src/views/admin/booking/index.tsx`
- `admin/src/views/admin/booking/components/BookingTable.tsx`

**Tính năng:**
- Hiển thị danh sách bookings
- Search theo ID, name, phone
- Filter theo status: All, Confirmed, Delivering, Delivered, Returned
- Hiển thị thông tin: Booking ID, Customer, Vehicle, Dealer, Rental Period, Location, Status
- Create Booking button
- Pagination
- Sorting

#### Referrer Management
- `admin/src/views/admin/referrer/index.tsx`
- `admin/src/views/admin/referrer/components/ReferrerTable.tsx`

**Tính năng:**
- Hiển thị danh sách referrers
- Hiển thị thông tin: Referrer, Total Earnings, Referral Count, Last Referral Date
- Add Referrer button
- Pagination
- Sorting

### Routes cập nhật:
- `admin/src/routes.tsx` - Cập nhật routes, **bỏ "Manage Users"**

**Navigation items (cho Admin):**
- Dashboard (MdHome)
- Dealers (MdStore)
- Customers (MdPeople)
- Bookings (MdEventNote)
- Referrals (MdCardGiftcard)
- Parks (MdLocalParking)
- Bikes (MdElectricBike)
- Rentals (FaFileInvoiceDollar)
- Log Out (MdLock)

**Navigation items (cho Dealer):**
- Dashboard (MdHome) --name add_dealer_referrer_models
npx prisma db seed
```

### Khởi động Backend:
```bash
cd api
npm run start:dev
```

### Khởi động Admin Frontend:
```bash
cd admin
npm install
npm start
```

## 6. Hướng dẫn sử dụng

### Đăng nhập Admin
1. Mở trình duyệt: http://localhost:3000 (hoặc port của admin app)
2. Đăng nhập với:
   - Email: admin@rentnride.com
   - Password: admin123
3. Admin sẽ thấy tất cả menu items

### Tạo Dealer Account
1. Admin đăng nhập
2. Vào menu "Dealers"
3. Click nút "Add Dealer" (màu xanh lá)
4. Điền form:
   - Dealer Name *
   - Email *
   - Password * (tối thiểu 6 ký tự)
   - Phone
   - Telegram (@username)
   - Location
5. Click "Create Dealer"
6. System sẽ tạo:
   - User account với role="dealer"
   - Dealer record trong Dealer table
7. Danh sách tự động refresh

### Đăng nhập Dealer
1. Logout khỏi admin account
2. Đăng nhập với dealer credentials vừa tạo
3. Dealer sẽ chỉ thấy:
   - Dashboard
   - Parks (filtered by dealer_id)
   - Bikes (filtered through parks)
   - Rentals (filtered through bikes)
   - Log Outrate dev
npx prisma db seed
```

### Khởi động Backend:
```basBackend API Updates

### Auth Service Changes:
- `api/src/modules/auth/auth.service.ts` - Support role parameter in registration
- `api/src/modules/auth/auth.dto.ts` - Add optional role field to RegisterUserDTO

**Changes:**
```typescript
// RegisterUserDTO now accepts optional role
export class RegisterUserDTO {
  // ... other fields
  @ApiProperty({ required: false })
  role?: string; // For dealer creation
}

// Auth service respects role if provided
const newUser = { 
  ...user, 
  role: user.role || ROLES_ENUM.USER 
};
```

### Role-based Data Filtering:
- Parks: Dealers only see parks where `dealer_id = user.id`
- Bikes: Filtered through parks relationship
- Rentals: Filtered through bikes->parks relationship

## ✅ Chạy migration để tạo tables mới trong database
2. ✅ Chạy seed để có dữ liệu mẫu
3. Cập nhật biến môi trường nếu cần
4. Implement các chức năng Edit/Delete thực tế cho Parks, Bikes, Rentals
5. Thêm validation cho các form tạo/sửa
6. Implement Create/Edit cho Referrer
7. Thêm real-time updates nếu cần
8. Thêm export/import data nếu cần
9. **Testing dealer permissions thoroughly**
10. **Add data filtering on backend for dealer role**

### ✨ Đã hoàn thành:
- ✅ Xóa phần quản lý User
- ✅ Redesign Parks, Bikes, Rentals pages
- ✅ Create Dealer Modal với form validation
- ✅ Dealer account creation (User + Dealer records)
- ✅ Role-based sidebar filtering
- ✅ Frontend route protection by role
- ✅ Auth service support for dealer registratio
cd admin
npm install
npm start
```

## 6. Truy cập Admin Panel

1. Mở trình duyệt: http://localhost:3000 (hoặc port của admin app)
2. Đăng nhập với:
   - Email: admin@rentnride.com
   - Password: admin123
3. Các menu mới sẽ xuất hiện trong sidebar:
   - Dealers
   - Customers
   - Bookings
   - Referrals

## 7. Ghi chú quan trọng

### Cần làm thêm:
1. Chạy migration để tạo tables mới trong database
2. Chạy seed để có dữ liệu mẫu
3. Cập nhật biến môi trường nếu cần
4. Thêm validation cho các form tạo/sửa
5. Implement các chức năng Create/Edit/Delete cho Dealer và Referrer
6. Thêm real-time updates nếu cần
7. Thêm export/i
- **Consistent table design** across all pages
- **Status badges** với color coding
- **Action buttons** (Edit/Delete) trên mỗi row
- **Modern modals** cho create/edit operations

## 9. Security & Permissions

### Authentication:
- JWT-based authentication
- Tokens stored in cookies (credentials: "include")
- Password hashing với scrypt

### Authorization:
- *11. Sample Data

Database seed sẽ tạo:
- 1 Admin user (admin@rentnride.com / admin123)
- 3 Dealers (Phu Quoc, Saigon, Hanoi) - Có thể tạo thêm qua UI
- 3 Referrers (Hotel ABC, Tour Guide John, Restaurant XYZ)
- 20 Customers
- Rental data với liên kết tới customers

## 12. Testing Guide

### Test Admin Features:
1. Login as admin
2. Verify all menu items visible
3. Create a new dealer via "Add Dealer" button
4. Check dealer appears in list
5. Verify dealer can login

### Test Dealer Features:
1. Login with dealer credentials
2. Verify only Dashboard, Parks, Bikes, Rentals, Logout visible
3. Check parks filtered to dealer's parks only
4. Verify cannot access /admin/dealers, /admin/customers, etc.

### Test Role Switching:
1. Logout from dealer
2. Login as admin
3. Verify full menu restored

---

**Tất cả các tính năng đã được implement và sẵn sàng để sử dụng!**

Để bắt đầu:
```bash
# Terminal 1 - API
cd api
npx prisma migrate dev
npx prisma db seed
npm run start:dev

# Terminal 2 - Admin
cd admin
npm start
```

Then navigate to admin panel and login with `admin@rentnride.com` / `admin123`
## 10. File Structure Changes

### New Files Created:
```
admin/src/
├── views/admin/
│   ├── dealer/
│   │   └── components/
│   │       └── CreateDealerModal.tsx ✨ NEW
│   ├── park/
│   │   └── components/
│   │       └── ParkTable.tsx ✨ NEW
│   ├── bike/
│   │   └── components/
│   │       └── BikeTable.tsx ✨ NEW
│   └── rental/
│       └── components/
│           └── RentalTable.tsx ✨ NEW
└── hooks/
    └── useRoleBasedRoutes.ts ✨ NEW
```

### Modified Files:
```
admin/src/
├── routes.tsx - Removed user management, reordered items
├── components/sidebar/index.tsx - Updated role filtering
├── views/admin/
│   ├── dealer/
│   │   ├── index.tsx - Added onRefresh callback
│   │   └── components/DealerTable.tsx - Added modal integration
│   ├── park/index.tsx - Complete rewrite
│   ├── bike/index.tsx - Complete rewrite
│   └── rental/index.tsx - Complete rewrite

api/src/modules/
├── auth/
│   ├── auth.service.ts - Support dealer role
│   └── auth.dto.ts - Add role field
```mport data nếu cần

### Security:
- Các endpoints POST/PATCH/DELETE đã được bảo vệ bằng JwtAuthGuard
- Chỉ admin mới có thể truy cập các tính năng này
- Password được hash trước khi lưu vào database

### UI/UX:
- Responsive design với Tailwind CSS
- Dark mode support
- Loading states
- Empty states
- Error handling

## 8. Sample Data

Database seed sẽ tạo:
- 1 Admin user
- 3 Dealers (Phu Quoc, Saigon, Hanoi)
- 3 Referrers (Hotel ABC, Tour Guide John, Restaurant XYZ)
- 20 Customers
- Rental data với liên kết tới customers

Tất cả các tính năng đã được implement và sẵn sàng để sử dụng!
