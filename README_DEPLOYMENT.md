# 🚀 Deployment Guide - Overview

> **Tổng quan tất cả tài liệu và tools để deploy Cloud Run**

---

## 📁 Files Structure

```
ai-learning-platform/
├── 📜 deploy.sh                      (11KB) ← Full deployment script
├── ⚡ quick-deploy.sh                (1.7KB) ← Quick deploy script  
├── 📖 DEPLOYMENT_CHECKLIST.md       (10KB) ← Chi tiết đầy đủ
├── ⚡ DEPLOY_QUICK_GUIDE.md          (2.9KB) ← Quick reference
├── 📜 SCRIPTS_README.md              (5.8KB) ← Scripts documentation
└── 📋 README_DEPLOYMENT.md          (này) ← Overview

.cursor/rules/
└── 🤖 deployment-rules.mdc          (2.8KB) ← AI rules
```

**Total**: 7 files, ~34KB documentation

---

## 🎯 Quick Start - Chọn công cụ phù hợp

### Bạn muốn gì?

| Mục đích | Dùng gì | Thời gian |
|----------|---------|-----------|
| 🆕 **Deploy service mới lần đầu** | `./deploy.sh` | 5-8 phút |
| ⚡ **Deploy update nhanh** | `./quick-deploy.sh` | 3-5 phút |
| 📖 **Đọc hiểu deployment** | `DEPLOYMENT_CHECKLIST.md` | 10-15 phút |
| 🆘 **Fix lỗi deployment** | `DEPLOYMENT_CHECKLIST.md` → Troubleshooting | 5 phút |
| 📜 **Tìm hiểu scripts** | `SCRIPTS_README.md` | 5 phút |

---

## 🚀 Deployment Workflows

### Workflow 1: Lần đầu deploy (Recommended)

```bash
# 1. Đọc checklist (optional nhưng khuyến nghị)
cat DEPLOYMENT_CHECKLIST.md

# 2. Run full deployment script
cd /Users/hung/HOC-CUNG-SONGNHI/ai-learning-platform
./deploy.sh

# Script sẽ tự động:
# ✅ Check môi trường
# ✅ Run lint & build
# ✅ Verify Dockerfile
# ✅ Optional: Test Docker local
# ✅ Deploy to Cloud Run
# ✅ Verify deployment
# ✅ Show summary

# Done! 🎉
```

---

### Workflow 2: Update code thường xuyên

```bash
# Quick deploy - No prompts
cd /Users/hung/HOC-CUNG-SONGNHI/ai-learning-platform
./quick-deploy.sh

# Script sẽ:
# ✅ Lint & build
# ✅ Deploy
# ✅ Health check

# Done in 3-5 minutes! ⚡
```

---

### Workflow 3: Manual deployment (Advanced)

```bash
# Pre-checks
npm run lint
npm run build

# Deploy
gcloud run deploy SERVICE_NAME \
  --source . \
  --region asia-southeast1 \
  --allow-unauthenticated

# Verify
curl -I https://SERVICE_URL
```

---

## 📚 Documentation Guide

### 1. DEPLOYMENT_CHECKLIST.md (Must Read đầu tiên)

**Nội dung**:
- ⚠️ 5 lỗi thường gặp + cách fix chi tiết
- ✅ 7-phase deployment checklist
- 🔧 Environment setup
- 📝 Common pitfalls
- 🆘 Troubleshooting guide
- 📊 Time estimation
- 📚 Useful commands

**Khi nào đọc**: 
- Lần đầu deploy
- Gặp lỗi không biết fix
- Muốn hiểu sâu về deployment process

---

### 2. DEPLOY_QUICK_GUIDE.md (Quick Reference)

**Nội dung**:
- 🚀 Deploy trong 5 phút
- 🔴 Critical points tóm tắt
- ✅ Quick checklist
- 🆘 Quick fix table

**Khi nào đọc**:
- Deploy thường xuyên cần reference nhanh
- Quên command
- Cần quick fix

---

### 3. SCRIPTS_README.md (Scripts Documentation)

**Nội dung**:
- 📜 Chi tiết 2 scripts
- 🎯 Usage examples
- ⚙️ Customization guide
- 🆘 Troubleshooting
- 📊 Comparison table

**Khi nào đọc**:
- Muốn hiểu scripts hoạt động thế nào
- Customize scripts
- Fix script issues

---

### 4. deployment-rules.mdc (AI Rules)

**Nội dung**:
- 🔴 Critical rules
- ❌ KHÔNG BAO GIỜ làm gì
- ✅ Phải làm gì
- ⚠️ Common errors quick fix

**Khi nào dùng**:
- Cursor AI tự động đọc
- Nhắc nhở khi code/deploy

---

## 🛠️ Scripts Details

### deploy.sh - Full Deployment

**Features**:
```bash
./deploy.sh [service-name] [region]

# Phases:
# 1. Pre-checks (Node, Docker, gcloud)
# 2. Code quality (lint, TypeScript, build)
# 3. Dockerfile verification
# 4. Optional Docker test
# 5. Cloud Run deployment
# 6. Post-deployment verification
# 7. Deployment summary
```

**Interactive**: Có prompts confirm
**Time**: 5-8 phút
**Best for**: First deployment

---

### quick-deploy.sh - Quick Deploy

**Features**:
```bash
./quick-deploy.sh [service-name] [region]

# Steps:
# 1. Lint & build (silent)
# 2. Deploy to Cloud Run
# 3. Health check
```

**Interactive**: Không có prompts
**Time**: 3-5 phút
**Best for**: Regular updates

---

## ✅ Pre-Deployment Checklist

Copy checklist này trước mỗi lần deploy:

```
□ Code đã commit (git status clean)
□ Đã test local (npm run dev)
□ Lint pass (npm run lint)
□ Build pass (npm run build)
□ Dockerfile đúng (no || true, no public copy)
□ Environment có đầy đủ
□ Backup nếu cần (optional)
```

---

## 🔴 Critical Rules (Must Follow)

### 1. Build Script
```json
// ✅ ĐÚNG
"build:docker": "next build"

// ❌ SAI - Sẽ hide errors!
"build:docker": "next build || true"
```

### 2. useSearchParams
```tsx
// ✅ ĐÚNG
import { Suspense } from 'react'
export default function Page() {
  return <Suspense><Content /></Suspense>
}

// ❌ SAI - Build error!
export default function Page() {
  const params = useSearchParams()
}
```

### 3. React Hooks
```tsx
// ✅ ĐÚNG
const fetchData = useCallback(async () => {
  // ...
}, [deps])

useEffect(() => {
  fetchData()
}, [fetchData])
```

### 4. Dockerfile
```dockerfile
# ✅ ĐÚNG - Chỉ copy những gì cần
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# ❌ SAI - Lỗi nếu không có public folder
COPY --from=builder /app/public ./public
```

---

## 🆘 Common Issues & Quick Fix

| Issue | Quick Command |
|-------|--------------|
| Script not executable | `chmod +x deploy.sh quick-deploy.sh` |
| Build failed | `npm run build` (xem error) |
| Lint failed | `npm run lint` (fix warnings) |
| Docker failed | `docker build -t test .` (debug) |
| Deploy failed | `gcloud builds list --limit=1` |
| Service unhealthy | `gcloud run services logs read SERVICE` |
| Need rollback | See DEPLOYMENT_CHECKLIST.md |

---

## 📊 Services Currently Deployed

```bash
# List all services
gcloud run services list --region=asia-southeast1
```

**Active services**:
1. `hoc-cung-songnhi` (NEW) - Main application
2. `hhp-aiagent-prod` - Agent prod
3. `hhp-aiagent-fb` - Facebook webhook

---

## 🔗 Quick Commands Reference

```bash
# Deploy
./quick-deploy.sh

# View logs
gcloud run services logs read hoc-cung-songnhi --region=asia-southeast1

# Describe service
gcloud run services describe hoc-cung-songnhi --region=asia-southeast1

# List services
gcloud run services list

# Update service config
gcloud run services update hoc-cung-songnhi \
  --memory=512Mi \
  --max-instances=10 \
  --region=asia-southeast1
```

---

## 🎓 Learning Path

**Nên đọc theo thứ tự**:

1. **README_DEPLOYMENT.md** (này) - Overview (5 phút)
2. **DEPLOY_QUICK_GUIDE.md** - Quick reference (5 phút)
3. **DEPLOYMENT_CHECKLIST.md** - Deep dive (15 phút)
4. **SCRIPTS_README.md** - Scripts details (5 phút)

**Total**: ~30 phút để hiểu đầy đủ deployment process

---

## 💡 Pro Tips

1. **Lần đầu**: Dùng `deploy.sh` với all checks
2. **Updates**: Dùng `quick-deploy.sh` cho nhanh
3. **Test local**: Luôn run `npm run build` trước deploy
4. **Monitor**: Check logs sau mỗi deploy
5. **Backup**: Có kế hoạch rollback

---

## 🎯 Success Criteria

Deploy thành công khi:

- ✅ Script exit code = 0
- ✅ Service status = "✔" 
- ✅ HTTP 200 response
- ✅ Response time < 3s
- ✅ No errors in logs
- ✅ All features work

---

## 📞 Support

**Khi gặp vấn đề**:

1. Check **DEPLOY_QUICK_GUIDE.md** → "Lỗi hay gặp"
2. Read **DEPLOYMENT_CHECKLIST.md** → "Troubleshooting"
3. Check logs: `gcloud run services logs read SERVICE_NAME`
4. Search error trong documentation
5. Review deployment-rules.mdc

---

## 🎉 Deployment History

**2025-10-12**:
- ✅ Created deployment automation
- ✅ Fixed all build issues
- ✅ Successfully deployed `hoc-cung-songnhi`
- ✅ Created comprehensive documentation
- ✅ Created deployment scripts

**Lessons Learned**:
- Always remove `|| true` from build scripts
- Wrap useSearchParams in Suspense
- Use useCallback for hook dependencies
- Don't copy non-existent folders in Dockerfile

---

## 📝 Maintenance

**Weekly**:
- [ ] Check service health
- [ ] Review logs for errors
- [ ] Monitor costs

**Monthly**:
- [ ] Update dependencies
- [ ] Review documentation
- [ ] Update scripts if needed

---

**Happy Deploying! 🚀**

**Version**: 1.0  
**Last Updated**: 2025-10-12  
**Maintainer**: Development Team



