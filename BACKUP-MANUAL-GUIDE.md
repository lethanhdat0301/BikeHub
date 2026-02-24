# Hướng Dẫn Backup Thủ Công BikeHub (Không cần Scripts)

> **🎯 Dành cho**: Production đang chạy trên GCP, không có môi trường local
> 
> **⏱️ Thời gian**: 15-30 phút cho full backup
>
> **🔧 Công cụ**: Chỉ cần trình duyệt web

---

## 📌 CHUẨN BỊ

### Bạn cần có:
- [ ] Quyền truy cập GitHub repository
- [ ] Quyền truy cập GCP Console (Owner hoặc Editor)
- [ ] Folder để lưu backup trên máy (ít nhất 1GB trống)
- [ ] Tool nén/mã hóa: 7-Zip, WinRAR, hoặc Windows built-in

### Tạo Folder Backup

```
Tạo folder trên máy:
D:/BikeHub-Backups/2026-02-05/
│
├── 1-github/
├── 2-database/
├── 3-secrets/
├── 4-configs/
└── BACKUP-LOG.txt
```

---

## BƯỚC 1: BACKUP GITHUB (10 phút)

### A. Download Repository

**Cách 1: Via Release (Khuyến nghị - có version control)**

1. Mở: `https://github.com/YOUR_USERNAME/BikeHub`

2. Click tab **"Releases"** (bên phải trang)

3. Click **"Draft a new release"**

4. Điền thông tin:
   ```
   Tag version:    backup-2026-02-05
   Release title:  Production Backup - Feb 5, 2026
   Description:    Full backup snapshot for disaster recovery
   ```

5. ✅ Check **"Set as a pre-release"**

6. Click **"Publish release"**

7. Download cả 2 files:
   - `Source code (zip)` 
   - `Source code (tar.gz)` (optional)

8. Lưu vào: `D:/BikeHub-Backups/2026-02-05/1-github/`

**Cách 2: Download ZIP trực tiếp**

1. Vào repository main page
2. Click nút **"Code"** (màu xanh)
3. Chọn **"Download ZIP"**
4. Rename file thành: `BikeHub-backup-2026-02-05.zip`
5. Lưu vào folder backup

### B. Backup GitHub Secrets (Quan trọng!)

1. Vào **Settings** (repository)

2. Click **"Secrets and variables"** → **"Actions"**

3. **Copy danh sách secrets** vào file text:
   
   Tạo file: `D:/BikeHub-Backups/2026-02-05/1-github/SECRETS-LIST.txt`
   ```
   GitHub Secrets Backup - 2026-02-05
   ===================================
   
   Repository: YOUR_USERNAME/BikeHub
   
   Secrets (names only - values stored in GCP Secret Manager):
   1. DATABASE_URL
   2. JWT_SECRET
   3. PAYPAL_CLIENT_ID
   4. PAYPAL_CLIENT_SECRET
   5. GCP_PROJECT_ID
   6. [Add others...]
   
   Note: Values are in GCP Secret Manager and will be backed up separately
   ```

4. **Screenshot Branch Protection**:
   - Settings → Branches
   - Chụp màn hình branch protection rules
   - Lưu: `branch-protection.png`

5. **Backup Environment Variables** (nếu có):
   - Settings → Environments
   - Screenshot settings
   - Lưu: `environments-config.png`

### C. Backup GitHub Actions Workflows

Đã có trong code, nhưng để chắc:

1. Download folder `.github/workflows/` từ repository
2. Hoặc check trong ZIP đã download

### ✅ Checklist GitHub Backup

```
✅ Repository code downloaded (ZIP/Release)
✅ Secrets list documented
✅ Branch protection rules saved
✅ Workflows backed up (.github folder)
✅ Files saved in: D:/BikeHub-Backups/2026-02-05/1-github/
```

---

## BƯỚC 2: BACKUP DATABASE (15 phút)

### A. Tạo Cloud SQL Backup

1. Mở [GCP Console](https://console.cloud.google.com)

2. Vào **SQL** (dùng search box hoặc menu bên trái)

3. Click vào instance: **`bikehub-db`**

4. Click tab **"Backups"** (menu bên trái)

5. Click nút **"Create backup"** (góc trên)

6. Cấu hình:
   ```
   Backup type:  On-demand backup
   Description:  Manual production backup - 2026-02-05
   ```

7. Click **"Create"**

8. Đợi backup hoàn thành (5-10 phút)
   - Status sẽ chuyển từ "Running" → "Successful"

9. **Lưu Backup ID**:
   - Copy Backup ID (dãng số dài)
   - Lưu vào file: `2-database/backup-info.txt`
   ```
   Cloud SQL Backup Information
   ============================
   Date: 2026-02-05 14:30:00
   Instance: bikehub-db
   Database: bikehub
   Backup ID: 1234567890123
   Status: Successful
   Size: ~450 MB
   ```

### B. Export Database ra File SQL

**⚠️ Quan trọng: File này chứa TOÀN BỘ data, lưu cẩn thận!**

1. Vẫn ở Cloud SQL instance `bikehub-db`

2. Click **"Export"** (thanh công cụ phía trên)

3. Cấu hình Export:
   
   ```
   File format: SQL
   
   Cloud Storage location:
   - Bucket: bikehub-backups-[YOUR-PROJECT-ID]
     (Nếu chưa có bucket, click "Browse" → "Create bucket")
   
   - File path: backups/manual/bikehub-20260205-143000.sql
   
   Database to export: bikehub
   
   Export options:
   ✅ Offload export to a temporary instance
      (Để không ảnh hưởng production)
   ```

4. Click **"Export"**

5. Đợi export xong (5-15 phút tùy data size)
   - Theo dõi progress trong Notifications (chuông góc phải)

### C. Download SQL File về máy

1. Vào **Cloud Storage** → **Buckets**

2. Click vào bucket: `bikehub-backups-[PROJECT-ID]`

3. Navigate: `backups/manual/`

4. Click vào file: `bikehub-20260205-143000.sql`

5. Click **"Download"** (hoặc ⋮ menu → Download)

6. Lưu vào: `D:/BikeHub-Backups/2026-02-05/2-database/`

7. **Verify file size**: Should be 100-500MB tùy data

### D. Backup Database Schema

1. Download file `api/prisma/schema.prisma` từ GitHub code

2. Lưu vào: `2-database/schema.prisma`

3. Này dùng để hiểu structure database khi restore

### ✅ Checklist Database Backup

```
✅ Cloud SQL on-demand backup created (ID saved)
✅ Database exported to .sql file
✅ SQL file downloaded to local (verify size)
✅ Prisma schema saved
✅ Files in: D:/BikeHub-Backups/2026-02-05/2-database/
```

---

## BƯỚC 3: BACKUP SECRETS & CONFIGS (10 phút)

### A. Backup Secrets từ Secret Manager

1. Vào **Security** → **Secret Manager**

2. Bạn sẽ thấy list secrets:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `PAYPAL_CLIENT_ID`
   - `PAYPAL_CLIENT_SECRET`
   - ...

3. **Với MỖI secret**, làm theo:

   a. Click vào secret name
   
   b. Tab **"Versions"** → Click version "latest"
   
   c. Click **"View secret value"**
   
   d. Copy value
   
   e. Paste vào file text:

4. **Tạo file secrets** (CHƯA mã hóa):
   
   File: `3-secrets/secrets-plaintext.txt`
   ```
   BikeHub Secrets Backup - 2026-02-05
   ====================================
   ⚠️  SENSITIVE - ENCRYPT THIS FILE!
   
   DATABASE_URL=postgresql://user:pass@host/bikehub?host=/cloudsql/...
   
   JWT_SECRET=your-super-secret-jwt-key-here...
   
   PAYPAL_CLIENT_ID=AYL...
   
   PAYPAL_CLIENT_SECRET=EHK...
   
   [Add other secrets...]
   ```

### B. Mã hóa Secrets File (BẮT BUỘC!)

**Dùng 7-Zip (Free):**

1. Chuột phải file `secrets-plaintext.txt`

2. **7-Zip** → **Add to archive...**

3. Settings:
   ```
   Archive:      secrets-ENCRYPTED.7z
   Format:       7z
   Compression:  Ultra
   
   Encryption:
   - Method:     AES-256
   - Password:   [TẠO PASSWORD MẠNH]
   ✅ Encrypt file names
   ```

4. Click **OK**

5. **XÓA file plaintext gốc**: `secrets-plaintext.txt`

6. Chỉ giữ file: `secrets-ENCRYPTED.7z`

7. **Lưu password** ở nơi an toàn:
   - Password manager (1Password, Bitwarden)
   - Ghi giấy, cất két
   - ĐỪNG lưu trong folder backup!

**Dùng WinRAR:**

Tương tự, chọn RAR format, AES-256 encryption

### C. Backup GCP Configurations

#### C1. Cloud Run Services Config

1. Vào **Cloud Run**

2. **Với mỗi service** (`bikehub-api`, `bikehub-admin`, `bikehub-frontend`):

   a. Click vào service name
   
   b. Click tab **"YAML"**
   
   c. Click **"Download"**
   
   d. Save as: `bikehub-api-config.yaml`
   
   e. Lưu vào: `4-configs/cloud-run/`

#### C2. Cloud SQL Configuration

1. Vào **SQL** → Instance `bikehub-db`

2. Tab **"Overview"**:
   - Screenshot configuration
   - Note lại:
     ```
     Instance ID: bikehub-db
     Database version: PostgreSQL 15
     Region: asia-southeast1
     Zone: asia-southeast1-a
     Memory: 3.75 GB
     Storage: 10 GB (auto-increase: Yes)
     Backup enabled: Yes
     Daily backup: 03:00 UTC
     ```

3. Lưu vào: `4-configs/cloud-sql-config.txt`

#### C3. Container Images Manifest

1. Vào **Artifact Registry** (hoặc Container Registry)

2. Click vào repository

3. Copy list images:
   ```
   Container Images - 2026-02-05
   ==============================
   
   asia-southeast1-docker.pkg.dev/PROJECT-ID/bikehub/bikehub-api:latest
   Digest: sha256:abc123...
   Size: 850 MB
   Pushed: 2026-02-04
   
   asia-southeast1-docker.pkg.dev/PROJECT-ID/bikehub/bikehub-admin:latest
   Digest: sha256:def456...
   Size: 750 MB
   Pushed: 2026-02-04
   
   asia-southeast1-docker.pkg.dev/PROJECT-ID/bikehub/bikehub-frontend:latest
   Digest: sha256:ghi789...
   Size: 650 MB
   Pushed: 2026-02-04
   ```

4. Lưu vào: `4-configs/container-images.txt`

**Lưu ý**: Images rất lớn (GB), KHÔNG cần download. Chỉ cần ghi lại để rebuild.

### D. Backup Deployment Files

Download từ GitHub code:

1. `cloudbuild.yaml`
2. `DEPLOYMENT-GUIDE-GCP.md`
3. `api/Dockerfile`
4. `admin/Dockerfile`
5. `frontend/Dockerfile`
6. All `package.json` files

Lưu vào: `4-configs/deployment-files/`

### ✅ Checklist Secrets & Configs

```
✅ All secrets copied and ENCRYPTED
✅ Password saved in secure location
✅ Cloud Run configs exported (3 YAML files)
✅ Cloud SQL settings documented
✅ Container images list saved
✅ Deployment files backed up
✅ Files in: D:/BikeHub-Backups/2026-02-05/3-secrets/ và 4-configs/
```

---

## BƯỚC 4: TẠO BACKUP MANIFEST

Tạo file tổng hợp: `D:/BikeHub-Backups/2026-02-05/BACKUP-MANIFEST.md`

```markdown
# BikeHub Production Backup

## Backup Information
- **Date**: 2026-02-05 14:30:00 (GMT+7)
- **Performed by**: [Your Name]
- **Backup Type**: Full System Backup (Manual)
- **Status**: ✅ Complete

---

## 1. Source Code (GitHub)

### Repository
- **URL**: https://github.com/YOUR_USERNAME/BikeHub
- **Branch**: main
- **Latest Commit**: abc123def (2026-02-05)
- **Release Tag**: backup-2026-02-05

### Files Backed Up
- ✅ `BikeHub-backup-2026-02-05.zip` (125 MB)
- ✅ `SECRETS-LIST.txt`
- ✅ `branch-protection.png`

### Location
`D:/BikeHub-Backups/2026-02-05/1-github/`

---

## 2. Database (Cloud SQL)

### Database Info
- **Instance**: bikehub-db
- **Database**: bikehub
- **Version**: PostgreSQL 15
- **Region**: asia-southeast1

### Backups Created
1. **Cloud SQL Backup**
   - Backup ID: 1234567890123
   - Created: 2026-02-05 14:35:00
   - Status: Successful
   - Retention: 7 days

2. **SQL Dump File**
   - ✅ `bikehub-20260205-143000.sql` (487 MB)
   - Records: ~50,000 rows
   - Tables: 15 tables

### Location
`D:/BikeHub-Backups/2026-02-05/2-database/`

---

## 3. Secrets (ENCRYPTED)

### Secrets Backed Up
- ✅ DATABASE_URL
- ✅ JWT_SECRET
- ✅ PAYPAL_CLIENT_ID
- ✅ PAYPAL_CLIENT_SECRET
- [Total: 4 secrets]

### Files
- ✅ `secrets-ENCRYPTED.7z` (2 KB)
- 🔐 Encrypted with AES-256
- ⚠️  Password stored separately in password manager

### Location
`D:/BikeHub-Backups/2026-02-05/3-secrets/`

---

## 4. GCP Configurations

### Cloud Run Services
- ✅ `bikehub-api-config.yaml`
- ✅ `bikehub-admin-config.yaml`
- ✅ `bikehub-frontend-config.yaml`

### Other Configs
- ✅ Cloud SQL settings
- ✅ Container images manifest
- ✅ Deployment files (Dockerfiles, cloudbuild.yaml)

### Location
`D:/BikeHub-Backups/2026-02-05/4-configs/`

---

## Storage Locations

### Primary
- 📁 **Local**: `D:/BikeHub-Backups/2026-02-05/` (1.2 GB)

### Secondary (Copy to these locations)
- ☁️  **Cloud**: [Google Drive / OneDrive / Dropbox]
- 💾 **External**: [USB Drive / External HDD]
- 🔐 **Off-site**: [Safe location / Another cloud]

---

## Restore Instructions

### Quick Restore
See: `RESTORE-GUIDE.md` in this folder

### Emergency Contact
- GCP Project: [PROJECT-ID]
- Database: bikehub-db
- Region: asia-southeast1

---

## Next Actions

- [ ] Copy backup to cloud storage
- [ ] Copy to external drive
- [ ] Verify backup integrity
- [ ] Test restore procedure (recommended)
- [ ] Schedule next backup: 2026-03-05

---

## Notes

[Add any special notes here]

---

**Backup completed at**: 2026-02-05 15:00:00
**Total time**: 30 minutes
**Total size**: 1.2 GB
```

---

## BƯỚC 5: LƯU TRỮ BACKUP

### A. Copy to Multiple Locations

#### Location 1: Local (Done)
✅ `D:/BikeHub-Backups/2026-02-05/`

#### Location 2: Cloud Storage

**Option A: Google Drive**
1. Mở Google Drive web
2. Tạo folder: `BikeHub-Backups`
3. Upload toàn bộ folder `2026-02-05`
4. Đợi upload xong (có thể mất 30-60 phút)

**Option B: OneDrive / Dropbox**
Tương tự, upload folder backup

#### Location 3: External Drive

1. Cắm USB / External HDD
2. Copy folder `2026-02-05` sang drive
3. Eject safely
4. Cất ở nơi an toàn

#### Location 4: GCP Cloud Storage (Optional)

1. Vào **Cloud Storage** → Buckets
2. Tạo bucket: `bikehub-backups-archive`
3. Upload các file quan trọng:
   - Database SQL file
   - Configs
   - Secrets (encrypted)
4. Set lifecycle rules: giữ 90 ngày

### B. Verify Backup Integrity

```
[ ] Check file sizes (not 0 bytes)
[ ] Unzip GitHub code → check contents
[ ] Try decrypt secrets file → verify password
[ ] Open SQL file in text editor → check structure
[ ] Review YAML configs → verify content
[ ] Total backup size: ~1-2 GB
```

---

## BƯỚC 6: DOCUMENT & SCHEDULE

### Update Backup Log

Tạo file: `D:/BikeHub-Backups/BACKUP-LOG.md`

```markdown
# BikeHub Backup History

| Date       | Type | Size  | Status | Location | Notes |
|------------|------|-------|--------|----------|-------|
| 2026-02-05 | Full | 1.2GB | ✅ OK  | Local + Cloud | Initial manual backup |
| 2026-03-05 | Full | -     | 📅 Scheduled | - | Next backup due |
```

### Set Reminder

- **Next backup**: 2026-03-05 (Monthly)
- **Quick check**: 2026-02-12 (Weekly - verify backup still accessible)

---

## ⚠️ IMPORTANT NOTES

### DO's ✅

- ✅ Mã hóa secrets trước khi lưu
- ✅ Lưu ít nhất 2 nơi (local + cloud)
- ✅ Test restore procedure occasionally
- ✅ Keep backup manifest updated
- ✅ Rotate backups (delete old ones after 3-6 months)

### DON'Ts ❌

- ❌ KHÔNG upload secrets plaintext lên cloud public
- ❌ KHÔNG commit secrets vào GitHub
- ❌ KHÔNG lưu password trong backup folder
- ❌ KHÔNG quên mã hóa file secrets
- ❌ KHÔNG chỉ backup 1 nơi

---

## TROUBLESHOOTING

### "Cannot download SQL file - file too large"

**Solution**: 
1. Download qua gcloud CLI thay vì web UI
2. Hoặc split export thành nhiều tables nhỏ

### "Secrets file encrypted but lost password"

**Problem**: Không restore được secrets
**Prevention**: 
- Lưu password ở password manager
- Ghi backup password ra giấy

### "GitHub code có changes chưa commit"

**Solution**: 
1. Check git status trên production
2. Commit changes trước khi backup
3. Hoặc note lại uncommitted changes

---

## NEXT STEPS AFTER BACKUP

1. **Test Restore** (Khuyến nghị):
   - Tạo GCP project test
   - Thử restore database
   - Verify data integrity

2. **Monitor Automated Backups**:
   - Check Cloud SQL automated backups
   - Set up alerts for backup failures

3. **Update Documentation**:
   - Update deployment guide với backup info
   - Share backup location với team

---

## RESTORE PREVIEW

Khi cần restore, các bước chính:

1. **Restore Code**: Upload lên GitHub mới
2. **Restore Database**: Import SQL file vào Cloud SQL
3. **Restore Secrets**: Add lại vào Secret Manager
4. **Redeploy**: Run Cloud Build hoặc manual deploy
5. **Verify**: Test app functionality

Chi tiết xem: `BACKUP-GUIDE-GCP.md` section "Restore"

---

**🎉 HOÀN THÀNH! Backup của bạn đã sẵn sàng.**

**Total time spent**: 30-45 phút
**Confidence level**: Production-ready ✅
