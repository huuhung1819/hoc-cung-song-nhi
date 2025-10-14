# 📜 Deployment Scripts Documentation

## 🚀 Available Scripts

### 1. `deploy.sh` - Full Deployment Script (Recommended for first time)

**Tính năng đầy đủ với interactive mode**

```bash
./deploy.sh [service-name] [region]
```

**Ví dụ**:
```bash
./deploy.sh hoc-cung-songnhi asia-southeast1
```

**Script sẽ làm gì**:
- ✅ Phase 1: Pre-checks (Node, Docker, gcloud)
- ✅ Phase 2: Code quality checks (lint, TypeScript, build)
- ✅ Phase 3: Dockerfile verification
- ✅ Phase 4: Optional Docker test build & run
- ✅ Phase 5: Deploy to Cloud Run
- ✅ Phase 6: Post-deployment verification
- ✅ Show deployment summary

**Interactive prompts**:
- Test Docker build locally? [y/N]
- Test run container? [y/N]
- Proceed with deployment? [Y/n]

**Thời gian**: ~5-8 phút (với all checks)

---

### 2. `quick-deploy.sh` - Quick Deploy (Cho deploy thường xuyên)

**Deploy nhanh không có prompts**

```bash
./quick-deploy.sh [service-name] [region]
```

**Ví dụ**:
```bash
./quick-deploy.sh hoc-cung-songnhi asia-southeast1
```

**Script sẽ làm gì**:
- ✅ Lint check
- ✅ Build check  
- ✅ Deploy to Cloud Run
- ✅ Health check

**Không có prompts** - chạy thẳng đến hết!

**Thời gian**: ~3-5 phút

---

## 📖 Usage Guide

### Lần đầu deploy service mới

```bash
# Sử dụng deploy.sh để có full checks
./deploy.sh my-service asia-southeast1
```

### Deploy update thường xuyên

```bash
# Sử dụng quick-deploy.sh cho nhanh
./quick-deploy.sh my-service asia-southeast1
```

### Deploy với default values

```bash
# Không cần arguments, sẽ dùng defaults:
# Service: hoc-cung-songnhi
# Region: asia-southeast1
./quick-deploy.sh
```

---

## 🎯 Default Values

| Parameter | Default Value |
|-----------|--------------|
| Service Name | `hoc-cung-songnhi` |
| Region | `asia-southeast1` |

---

## ⚙️ Customization

### Thay đổi defaults

Sửa trong script:

```bash
# deploy.sh hoặc quick-deploy.sh
SERVICE_NAME="${1:-YOUR_DEFAULT_SERVICE}"
REGION="${2:-YOUR_DEFAULT_REGION}"
```

### Thêm deployment options

Modify gcloud command trong script:

```bash
gcloud run deploy ${SERVICE_NAME} \
  --source . \
  --region ${REGION} \
  --allow-unauthenticated \
  --memory=512Mi \           # Thêm memory limit
  --max-instances=10 \       # Thêm scaling limit
  --timeout=300s             # Thêm timeout
```

---

## 🔍 Script Details

### deploy.sh Features

**Pre-checks**:
- Node.js version
- Docker installed
- gcloud CLI installed
- gcloud authentication
- Project ID configured

**Quality checks**:
- ESLint (must pass)
- TypeScript compilation (warnings OK)
- Production build (must pass)

**Dockerfile checks**:
- File exists
- No `|| true` in build scripts
- Warning if tries to copy /app/public

**Optional local test**:
- Build Docker image
- Test run container on port 8080
- Health check localhost

**Deployment**:
- Confirm before deploy
- Track deployment time
- Show progress

**Verification**:
- Get service URL
- Health check (HTTP status)
- Response time measurement
- Show recent logs

**Summary**:
- Service details
- Next steps
- Useful commands

---

### quick-deploy.sh Features

**Minimal checks**:
- Lint (silent)
- Build (silent)

**Deploy**:
- No prompts
- Quiet mode
- Fast execution

**Verify**:
- Health check only
- Show URL

---

## 🆘 Troubleshooting

### Script not executable

```bash
chmod +x deploy.sh quick-deploy.sh
```

### "gcloud: command not found"

```bash
# Install Google Cloud SDK
# https://cloud.google.com/sdk/docs/install
```

### "Permission denied"

```bash
# Login to gcloud
gcloud auth login

# Set project
gcloud config set project YOUR_PROJECT_ID
```

### Build failed

```bash
# Run manually to see full error
npm run lint
npm run build
```

### Deploy failed

```bash
# Check build logs
gcloud builds list --limit=1

# View logs
gcloud builds log <BUILD_ID>
```

---

## 📊 Comparison

| Feature | deploy.sh | quick-deploy.sh |
|---------|-----------|-----------------|
| Pre-checks | ✅ Full | ❌ None |
| Quality checks | ✅ Full | ✅ Basic |
| Dockerfile check | ✅ Yes | ❌ No |
| Docker test | ✅ Optional | ❌ No |
| Interactive | ✅ Yes | ❌ No |
| Verification | ✅ Full | ✅ Basic |
| Time | ~5-8 min | ~3-5 min |
| Best for | First deploy | Regular updates |

---

## 🎨 Color Output

Scripts sử dụng colors để dễ đọc:

- 🔵 **Blue**: Information
- 🟢 **Green**: Success
- 🔴 **Red**: Error
- 🟡 **Yellow**: Warning

---

## 🔐 Security Notes

**Scripts KHÔNG chứa secrets**:
- ✅ Secrets được Google Cloud Secret Manager quản lý
- ✅ Không có env vars trong scripts
- ✅ An toàn commit vào Git

---

## 📚 Related Documentation

- 📖 [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Full deployment guide
- ⚡ [DEPLOY_QUICK_GUIDE.md](./DEPLOY_QUICK_GUIDE.md) - Quick reference
- 🤖 [.cursor/rules/deployment-rules.mdc](../.cursor/rules/deployment-rules.mdc) - AI rules

---

## 🔄 Updates

### Version History

**v1.0** (2025-10-12):
- Initial release
- Full deployment script with 6 phases
- Quick deploy script for fast updates
- Interactive prompts
- Color output
- Health checks
- Deployment summary

---

## 💡 Tips

### Make deployment faster

```bash
# Skip Docker test (in deploy.sh)
# Just press 'n' when prompted

# Or use quick-deploy.sh
./quick-deploy.sh
```

### Deploy to different region

```bash
./deploy.sh my-service us-central1
```

### Multiple services

```bash
# Deploy frontend
./quick-deploy.sh frontend-app asia-southeast1

# Deploy backend
./quick-deploy.sh backend-api asia-southeast1
```

---

## ✅ Best Practices

1. **First deploy**: Use `deploy.sh` with all checks
2. **Regular updates**: Use `quick-deploy.sh`
3. **Test local**: Use Docker test option in `deploy.sh`
4. **Monitor logs**: After each deploy
5. **Keep scripts updated**: When deployment process changes

---

**Happy Deploying! 🚀**




