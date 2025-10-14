# 🚀 DEPLOYMENT CHECKLIST - CLOUD RUN

> **Tài liệu này tổng hợp TẤT CẢ những lưu ý quan trọng để deploy thành công lên Cloud Run.**  
> **Đọc kỹ trước khi deploy để tránh mất thời gian debug!**

---

## ⚠️ CÁC LỖI THƯỜNG GẶP & CÁCH FIX

### 1. ❌ Build Script với `|| true` (CRITICAL)

**Vấn đề**: 
```json
"build:docker": "next build || true"
```
- Script này khiến build **luôn return success** ngay cả khi có lỗi
- Docker sẽ deploy code lỗi lên production mà không báo

**Fix**:
```json
"build:docker": "next build"
```
✅ Bỏ `|| true` để build fail đúng cách khi có lỗi

---

### 2. ❌ useSearchParams() without Suspense

**Vấn đề**:
```tsx
// BAD - Sẽ bị lỗi build
export default function Page() {
  const searchParams = useSearchParams()
  // ...
}
```

**Error Message**:
```
useSearchParams() should be wrapped in a suspense boundary
```

**Fix**:
```tsx
// GOOD - Wrap component trong Suspense
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function PageContent() {
  const searchParams = useSearchParams()
  // ...
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageContent />
    </Suspense>
  )
}
```

✅ Luôn wrap component sử dụng `useSearchParams()` trong `<Suspense>`

---

### 3. ❌ ESLint Warnings - React Hooks Dependencies

**Vấn đề**:
```tsx
// BAD - Missing dependency
useEffect(() => {
  fetchData()
}, []) // ⚠️ Warning: fetchData missing in deps
```

**Fix**:
```tsx
// GOOD - Wrap function với useCallback
import { useCallback } from 'react'

const fetchData = useCallback(async () => {
  // ...
}, [dependencies])

useEffect(() => {
  fetchData()
}, [fetchData]) // ✅ No warning
```

✅ Sử dụng `useCallback` cho functions trong useEffect dependencies

---

### 4. ❌ Dockerfile Copy Public Folder (Not Exists)

**Vấn đề**:
```dockerfile
# BAD - Lỗi nếu folder public không tồn tại
COPY --from=builder /app/public ./public
```

**Error Message**:
```
"/app/public": not found
```

**Fix**:
```dockerfile
# GOOD - Bỏ qua public folder nếu không cần
# Next.js standalone đã include static files trong .next/static
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
```

✅ Không copy folder `public` nếu project không có

---

### 5. ❌ Node Modules Conflicts (pnpm vs npm)

**Vấn đề**:
```
File '...node_modules/.pnpm/...' not found
```

**Fix**:
```bash
# Clean install với npm
rm -rf node_modules package-lock.json
npm install
```

✅ Đảm bảo dùng đúng package manager (npm hoặc pnpm)

---

## 📋 DEPLOYMENT CHECKLIST

### **TRƯỚC KHI DEPLOY**

#### ✅ Phase 1: Code Quality Check

```bash
# 1. Run linter
npm run lint

# Kết quả mong đợi:
# ✔ No ESLint warnings or errors
```

```bash
# 2. Run TypeScript check
npx tsc --noEmit

# Không có errors (warnings OK)
```

```bash
# 3. Build local
npm run build

# Exit code phải = 0
# ✓ Compiled successfully
```

#### ✅ Phase 2: Dockerfile Verification

```dockerfile
# Kiểm tra các điểm sau:

# 1. Multi-stage build
FROM node:18-alpine AS deps
FROM node:18-alpine AS builder  
FROM node:18-alpine AS runner

# 2. PORT configuration
ENV PORT=8080
EXPOSE 8080

# 3. Không copy folder không tồn tại
# ❌ COPY --from=builder /app/public ./public (nếu không có public)
# ✅ COPY --from=builder /app/.next/standalone ./

# 4. Non-root user
USER nextjs

# 5. Correct CMD
CMD ["node", "server.js"]
```

#### ✅ Phase 3: Build Docker Local

```bash
# Build image
docker build -t test-app:latest .

# Kết quả mong đợi:
# Exit code: 0
# Image size: ~200-300MB
```

```bash
# Verify image created
docker images | grep test-app

# Output:
# test-app    latest    <image-id>    <time>    247MB
```

#### ✅ Phase 4: Test Docker Container (Optional)

```bash
# Run container với fake env vars
docker run -p 8080:8080 \
  -e NEXT_PUBLIC_SUPABASE_URL=https://test.supabase.co \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=test_key \
  -e OPENAI_API_KEY=test_key \
  -e SUPABASE_SERVICE_ROLE_KEY=test_key \
  -e UNLOCK_CODE_SECRET=test_secret \
  test-app:latest

# Test: curl http://localhost:8080
# Kết quả: HTTP 200 OK
```

---

### **TRONG QUÁ TRÌNH DEPLOY**

#### ✅ Phase 5: Cloud Run Deployment

```bash
# Deploy command
gcloud run deploy SERVICE_NAME \
  --source . \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --platform managed

# Monitor output:
# ✅ Uploading sources....done
# ✅ Building Container....done
# ✅ Creating Revision....done
# ✅ Routing traffic....done
```

#### ⚠️ Nếu Build Failed

```bash
# 1. Check build logs
gcloud builds list --limit=5

# 2. View specific build log
gcloud builds log <BUILD_ID>

# 3. Common issues:
# - Dockerfile syntax error
# - Missing files
# - Build timeout (>10 phút)
# - Out of memory
```

---

### **SAU KHI DEPLOY**

#### ✅ Phase 6: Health Check

```bash
# 1. Test service URL
curl -I https://YOUR-SERVICE-URL.run.app

# Expected: HTTP/2 200

# 2. Check response time
curl -s -o /dev/null -w "Time: %{time_total}s\n" \
  https://YOUR-SERVICE-URL.run.app

# Expected: < 3s (cold start)
```

#### ✅ Phase 7: Monitor Logs

```bash
# View real-time logs
gcloud run services logs read SERVICE_NAME \
  --region=asia-southeast1 \
  --limit=50

# Check for errors:
# ❌ Environment variable not set
# ❌ Connection refused
# ❌ Module not found
```

---

## 🔧 ENVIRONMENT SETUP CHECKLIST

### **Local Machine**

```bash
# Verify installations
node --version    # v18+ hoặc v20+
docker --version  # Any version
gcloud --version  # Latest

# Verify gcloud config
gcloud config get-value project     # Should return your project ID
gcloud config get-value account     # Should return your email
```

### **Cloud Run Secrets**

```bash
# List secrets
gcloud secrets list

# Required secrets:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - OPENAI_API_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - UNLOCK_CODE_SECRET
```

---

## 📝 COMMON PITFALLS

### ❌ Don't Do This

1. **Không deploy code chưa test local**
   ```bash
   # BAD
   gcloud run deploy ... # Deploy ngay không test
   ```

2. **Không check linter trước khi deploy**
   ```bash
   # BAD - Deploy code có warnings
   npm run build  # Có warnings nhưng vẫn deploy
   ```

3. **Deploy với env vars placeholder**
   ```env
   # BAD
   OPENAI_API_KEY=your_api_key_here
   ```

4. **Không xóa `.next` cache trước build**
   ```bash
   # BAD - Cache cũ có thể gây lỗi
   npm run build
   ```

### ✅ Do This Instead

1. **Test đầy đủ trước deploy**
   ```bash
   # GOOD
   npm run lint
   npm run build
   docker build -t test .
   docker run -p 8080:8080 test
   # Test OK rồi mới deploy
   ```

2. **Clean build**
   ```bash
   # GOOD
   rm -rf .next
   npm run build
   ```

3. **Verify secrets trước deploy**
   ```bash
   # GOOD
   gcloud secrets list
   # Đảm bảo tất cả secrets đã có
   ```

---

## 🎯 QUICK REFERENCE

### Deploy New Service

```bash
cd /path/to/project
npm run lint                    # Check code quality
npm run build                   # Test build local
docker build -t app .          # Build Docker image
gcloud run deploy SERVICE_NAME \
  --source . \
  --region asia-southeast1 \
  --allow-unauthenticated
```

### Update Existing Service

```bash
cd /path/to/project
git pull                        # Get latest code
npm install                     # Update dependencies
npm run lint && npm run build  # Verify
gcloud run deploy SERVICE_NAME \
  --source . \
  --region asia-southeast1
```

### Rollback if Issues

```bash
# List revisions
gcloud run revisions list \
  --service=SERVICE_NAME \
  --region=asia-southeast1

# Rollback to previous revision
gcloud run services update-traffic SERVICE_NAME \
  --to-revisions=REVISION_NAME=100 \
  --region=asia-southeast1
```

---

## 📊 DEPLOYMENT TIME ESTIMATION

| Phase | Time | Notes |
|-------|------|-------|
| Lint check | 10s | Fast |
| Build local | 20-30s | Depends on project size |
| Docker build | 40-60s | First time slower |
| Upload to Cloud Build | 30-60s | Depends on connection |
| Cloud Build | 2-5 min | Building container |
| Deploy revision | 30-60s | Rolling out |
| **TOTAL** | **5-8 phút** | Normal deployment |

---

## 🆘 TROUBLESHOOTING GUIDE

### Issue: "Build failed; check build logs"

**Solution**:
```bash
gcloud builds list --limit=1
gcloud builds log <BUILD_ID>
# Đọc error message và fix theo hướng dẫn trên
```

### Issue: Service deployed nhưng crash

**Solution**:
```bash
gcloud run services logs read SERVICE_NAME --limit=100
# Check error:
# - Missing env vars
# - Database connection failed
# - Module not found
```

### Issue: 502 Bad Gateway

**Possible causes**:
- App không start được (check logs)
- Env vars thiếu
- Database connection failed
- Timeout (app start quá lâu)

**Solution**:
```bash
# Check logs
gcloud run services logs read SERVICE_NAME --limit=50

# Check service config
gcloud run services describe SERVICE_NAME --region=asia-southeast1
```

---

## 📚 USEFUL COMMANDS

```bash
# List all services
gcloud run services list

# Describe service
gcloud run services describe SERVICE_NAME --region=REGION

# View logs
gcloud run services logs read SERVICE_NAME --region=REGION

# Delete service
gcloud run services delete SERVICE_NAME --region=REGION

# Update service settings
gcloud run services update SERVICE_NAME \
  --memory=512Mi \
  --max-instances=10 \
  --region=REGION
```

---

## ✅ SUCCESS CRITERIA

Deploy được coi là thành công khi:

1. ✅ Build exit code = 0
2. ✅ Service status = "✔" (green checkmark)
3. ✅ HTTP status = 200
4. ✅ Response time < 3s
5. ✅ No errors in logs
6. ✅ All routes accessible
7. ✅ Auth flow works
8. ✅ Database queries work

---

## 📅 MAINTENANCE

### Weekly Tasks
- [ ] Check logs for errors
- [ ] Monitor response times
- [ ] Review costs

### Monthly Tasks
- [ ] Update dependencies
- [ ] Rotate secrets
- [ ] Review scaling settings

### After Each Deploy
- [ ] Test all critical flows
- [ ] Check logs for errors
- [ ] Verify performance metrics

---

**LƯU Ý**: Document này được tạo dựa trên kinh nghiệm thực tế deployment. Đọc kỹ và follow checklist để tránh lặp lại các lỗi đã gặp!

**Last Updated**: 2025-10-12  
**Author**: Deployment team  
**Version**: 1.0




