# ⚡ Quick Deploy Guide - Cloud Run

> **3 bước deploy nhanh - dành cho ai đã đọc DEPLOYMENT_CHECKLIST.md**

---

## 🚀 Deploy trong 5 phút

### **Cách 1: Sử dụng Script (Khuyến nghị)** ⭐

```bash
# Quick deploy - Không có prompts
cd /Users/hung/HOC-CUNG-SONGNHI/ai-learning-platform
./quick-deploy.sh

# Hoặc full deploy với checks
./deploy.sh
```

**Done!** ✅ (3-5 phút)

---

### **Cách 2: Manual Commands**

```bash
# Bước 1: Pre-check (30 giây)
cd /Users/hung/HOC-CUNG-SONGNHI/ai-learning-platform
npm run lint && npm run build

# Bước 2: Deploy (4-5 phút)
gcloud run deploy SERVICE_NAME \
  --source . \
  --region asia-southeast1 \
  --allow-unauthenticated

# Bước 3: Verify (10 giây)
curl -I https://SERVICE_URL.run.app
```

**Done!** ✅ (5-8 phút)

---

## 🔴 CRITICAL - Đọc trước khi deploy

### 1. Build Script KHÔNG ĐƯỢC có `|| true`
```json
// package.json
"build:docker": "next build"  // ✅ Đúng
"build:docker": "next build || true"  // ❌ SAI - Sẽ deploy code lỗi!
```

### 2. useSearchParams() PHẢI wrap Suspense
```tsx
// ✅ Đúng
import { Suspense } from 'react'
export default function Page() {
  return <Suspense><Content /></Suspense>
}
```

### 3. Dockerfile KHÔNG copy public nếu không có
```dockerfile
# ✅ Đúng - Chỉ copy những gì cần
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
```

---

## ✅ Checklist nhanh

- [ ] `npm run lint` pass
- [ ] `npm run build` exit code = 0  
- [ ] Dockerfile không copy folder không tồn tại
- [ ] Secrets đã có trên Cloud Run
- [ ] Deploy!

---

## 🆘 Lỗi hay gặp

| Lỗi | Fix |
|-----|-----|
| Build failed | Check logs: `gcloud builds log <ID>` |
| 502 Bad Gateway | Check logs: `gcloud run services logs read SERVICE_NAME` |
| useSearchParams error | Wrap trong `<Suspense>` |
| Public folder error | Xóa COPY public trong Dockerfile |

---

## 📜 Deployment Scripts

**2 scripts tự động**:

1. **`deploy.sh`** - Full deployment với all checks (khuyến nghị lần đầu)
   ```bash
   ./deploy.sh [service-name] [region]
   ```
   - Interactive mode
   - Full checks (lint, build, Docker test)
   - ~5-8 phút

2. **`quick-deploy.sh`** - Quick deploy không prompts (cho updates thường xuyên)
   ```bash
   ./quick-deploy.sh [service-name] [region]
   ```
   - No prompts - chạy thẳng
   - Basic checks only
   - ~3-5 phút

**Xem chi tiết**: `SCRIPTS_README.md`

---

## 📚 Tài liệu chi tiết

- 📜 **Scripts guide**: `SCRIPTS_README.md` ⭐ NEW
- 📖 Full checklist: `DEPLOYMENT_CHECKLIST.md`
- 🤖 Cursor AI rules: `.cursor/rules/deployment-rules.mdc`

---

**Services hiện tại**:
- `hoc-cung-songnhi` (NEW) - https://hoc-cung-songnhi-1057952160046.asia-southeast1.run.app
- `hhp-aiagent-prod` - https://hhp-aiagent-prod-1057952160046.asia-southeast1.run.app
- `hhp-aiagent-fb` - https://hhp-aiagent-fb-1057952160046.asia-southeast1.run.app

