# Git Workflow - Học Cùng Sông Nhi

## 📋 Branch Strategy

### 🎯 Main Branches (3 branches)

#### `main`
- **Mục đích**: Production-ready code
- **Quy tắc**: Chỉ merge từ `develop` sau khi đã test kỹ
- **Deploy**: Tự động deploy lên production

#### `develop`
- **Mục đích**: Integration branch cho features
- **Quy tắc**: Merge từ feature branches
- **Deploy**: Tự động deploy lên staging environment

#### `hotfix`
- **Mục đích**: Fix khẩn cấp cho production
- **Quy tắc**: Tạo từ `main`, merge vào cả `main` và `develop`

### 🚀 Feature Branches (8 branches)

#### `feature/auth-system`
- Login/Register functionality
- Password reset flow
- Phone number verification
- User profile management

#### `feature/ai-chat`
- Chat interface components
- OpenAI integration
- Image upload & OCR
- Conversation management

#### `feature/dashboard-ui`
- Student dashboard
- Parent dashboard
- Teacher dashboard
- Admin panel

#### `feature/token-system`
- Token quota tracking
- Usage analytics
- Character-based counting
- Progress indicators

#### `feature/database-api`
- Supabase integration
- API routes
- Database schema
- Data management

#### `feature/security`
- CAPTCHA implementation
- Input validation
- Rate limiting
- Security headers

#### `feature/mobile-ui`
- Responsive design
- Mobile navigation
- Touch interactions
- Mobile-specific features

#### `feature/docs-setup`
- README updates
- Deployment guides
- Environment setup
- API documentation

### 🔧 Specialized Branches (4 branches)

#### `experimental/ai-enhancements`
- Testing new AI features
- Advanced prompt engineering
- AI model optimizations

#### `refactor/component-structure`
- Component refactoring
- Code optimization
- Performance improvements

#### `fix/database-schema`
- Database migration fixes
- Schema updates
- Data consistency issues

#### `feature/internationalization`
- Multi-language support
- Localization features
- Regional customization

## 🎯 Development Priority

### Phase 1: Core Foundation (Weeks 1-2)
1. `feature/auth-system` - Authentication cơ bản
2. `feature/database-api` - Database setup
3. `feature/security` - Security implementation

### Phase 2: Core Features (Weeks 3-4)
4. `feature/ai-chat` - Chat interface
5. `feature/dashboard-ui` - User dashboards
6. `feature/token-system` - Usage tracking

### Phase 3: Enhancement (Weeks 5-6)
7. `feature/mobile-ui` - Mobile optimization
8. `feature/docs-setup` - Documentation
9. `experimental/ai-enhancements` - AI improvements

## 🚀 Git Commands

### Tạo feature branch
```bash
git checkout -b feature/auth-system
git push -u origin feature/auth-system
```

### Merge feature vào develop
```bash
git checkout develop
git merge feature/auth-system
git push origin develop
```

### Tạo hotfix
```bash
git checkout -b hotfix/critical-bug main
git push -u origin hotfix/critical-bug
```

### Switch giữa các branches
```bash
git checkout develop
git checkout feature/auth-system
git checkout main
```

## 📊 Branch Protection Rules

### `main` branch
- Require pull request reviews (2 reviewers)
- Require status checks to pass
- Require branches to be up to date
- Restrict pushes to this branch

### `develop` branch
- Require pull request reviews (1 reviewer)
- Require status checks to pass
- Allow force pushes

### Feature branches
- No restrictions
- Allow direct pushes
- Auto-delete after merge

## 🔄 Workflow

1. **Feature Development**:
   ```
   main → develop → feature/auth-system
   ```

2. **Feature Completion**:
   ```
   feature/auth-system → develop (via PR)
   ```

3. **Release**:
   ```
   develop → main (via PR)
   ```

4. **Hotfix**:
   ```
   main → hotfix/critical-bug → main + develop
   ```

## 📝 Commit Message Convention

```
type(scope): description

Types:
- feat: new feature
- fix: bug fix
- docs: documentation
- style: formatting
- refactor: code refactoring
- test: adding tests
- chore: maintenance

Examples:
- feat(auth): add login functionality
- fix(dashboard): resolve token display issue
- docs(api): update API documentation
```

## 🏷️ Tagging Strategy

- **Major releases**: `v1.0.0`, `v2.0.0`
- **Minor releases**: `v1.1.0`, `v1.2.0`
- **Patch releases**: `v1.1.1`, `v1.1.2`
- **Pre-releases**: `v1.2.0-beta.1`, `v1.2.0-rc.1`

## 📋 Checklist

### Before merging to develop:
- [ ] Code reviewed
- [ ] Tests passing
- [ ] Documentation updated
- [ ] No breaking changes (or documented)

### Before merging to main:
- [ ] All features tested in staging
- [ ] Performance benchmarks met
- [ ] Security review completed
- [ ] Deployment plan ready

## 🆘 Emergency Procedures

### Rollback production:
```bash
git checkout main
git revert <commit-hash>
git push origin main
```

### Emergency hotfix:
```bash
git checkout -b hotfix/emergency-fix main
# Make changes
git commit -m "hotfix: emergency fix for critical issue"
git push origin hotfix/emergency-fix
# Create PR to main and develop
```
