# 🎉 TÍNH NĂNG MỚI: AI SINH BÀI TẬP & TÍCH HỢP CHAT

## 📌 TỔNG QUAN

Tính năng cho phép AI tự động sinh bài tập theo môn học và loại bài tập, sau đó học sinh có thể:
- Hỏi gia sư AI để được hướng dẫn
- Xem lời giải chi tiết (nếu đã mở khóa)
- Bài tập tự động được gửi lên chat, AI nhớ context và không hỏi lại

---

## 🔧 CÁC COMPONENT ĐÃ TẠO/CẬP NHẬT

### 1. **API Endpoint: `/api/generate-exercises`**
**File:** `app/api/generate-exercises/route.ts`

**Chức năng:**
- Nhận request với `subject`, `subSubject`, `grade`, `count`
- Gọi OpenAI GPT-4 để sinh bài tập
- Parse và trả về mảng bài tập

**Prompts hỗ trợ:**
- **Toán:** Trắc nghiệm, Có lời văn, Cộng trừ nhân chia
- **Văn:** Nghị luận, Phân tích, Cảm thụ, Viết đoạn
- **Tiếng Anh:** Ngữ pháp, Từ vựng, Đọc hiểu, Viết luận

**Example Request:**
```json
{
  "subject": "math",
  "subSubject": "Trắc nghiệm",
  "grade": "Lớp 5",
  "count": 5
}
```

**Example Response:**
```json
{
  "exercises": [
    "Câu 1: Kết quả của phép tính 15 + 27 là:\nA) 42\nB) 41\nC) 43\nD) 40",
    "Câu 2: ...",
    "..."
  ],
  "subject": "math",
  "subSubject": "Trắc nghiệm",
  "grade": "Lớp 5",
  "count": 5
}
```

---

### 2. **ExerciseGenerator Component**
**File:** `components/ExerciseGenerator.tsx`

**Chức năng:**
- Chọn môn học (Toán, Văn, Tiếng Anh)
- Chọn loại bài tập (button con)
- AI sinh 5 bài tập mỗi lần
- Mỗi bài có 2 buttons:
  - **💬 Hỏi gia sư AI** (coach mode)
  - **📖 Xem lời giải** (solve mode, cần unlock)

**State Management:**
```tsx
interface ExerciseState {
  exercise: string
  mode: 'coach' | 'solve' | null
  status: 'idle' | 'asking' | 'answered'
}
```

**Button States:**
- `idle` → "Hỏi gia sư AI" / "Xem lời giải"
- `asking` → "⏳ Đang hỏi..." / "⏳ Đang lấy lời giải..."
- `answered (coach)` → "✅ Đã hỏi gia sư AI"
- `answered (solve)` → "✅ Đã xem lời giải"

**Visual Feedback:**
- ⏳ Đang hỏi AI... (orange, animate-pulse)
- ✅ Đã hỏi (green)
- ✅ Đã xem lời giải (purple)

---

### 3. **ChatInterface Updates**
**File:** `components/ChatInterface.tsx`

**Thêm mới:**
- `onRegisterSendExercise` prop
- `sendExerciseToChat` function

**Flow:**
1. ExerciseGenerator gọi `onSendToChat(exercise, mode)`
2. Dashboard gọi `sendExerciseToChatRef.current(exercise, mode)`
3. ChatInterface nhận và xử lý:
   - Set currentMode (coach/solve)
   - Tạo user message
   - Gửi lên API `/api/chat`
   - Nhận response từ AI
   - Hiển thị assistant message

**Context Memory:**
- Bài tập được lưu trong `exerciseStates[index].exercise`
- Khi click "Xem lời giải", gửi lại CÙNG BÀI với mode 'solve'
- AI KHÔNG HỎI LẠI vì message đã có đầy đủ context

---

### 4. **Dashboard Integration**
**File:** `app/dashboard/page.tsx`

**Thêm mới:**
- `sendExerciseToChatRef` - Ref lưu function gửi bài lên chat
- `chatRef` - Ref để scroll lên chat

**Flow:**
1. ChatInterface register `sendExerciseToChat` vào ref
2. ExerciseGenerator click button → call `onSendToChat`
3. Dashboard:
   - Scroll lên chat
   - Call `sendExerciseToChatRef.current(exercise, mode)`
4. ChatInterface nhận và xử lý

---

## 🎯 FLOW HOÀN CHỈNH

### **Scenario 1: User hỏi AI → Xem lời giải**

```
1. User chọn: Toán → Trắc nghiệm
2. Click "🤖 AI tạo 5 bài tập"
   → API call → AI sinh 5 bài
3. Bài 1 hiển thị với 2 buttons:
   [💬 Hỏi gia sư AI] [🔒 Xem lời giải (cần mở khóa)]
4. User click "Hỏi gia sư AI"
   → State: { status: 'asking', mode: 'coach' }
   → Scroll lên chat
   → Gửi bài lên chat
   → Button: "⏳ Đang hỏi..."
5. AI trả lời hướng dẫn
   → State: { status: 'answered', mode: 'coach' }
   → Button: "✅ Đã hỏi gia sư AI"
   → Badge: "✅ Đã hỏi"
6. User mở khóa từ navbar
   → Button "Xem lời giải" ENABLED
7. User click "Xem lời giải"
   → State: { status: 'asking', mode: 'solve' }
   → Scroll lên chat
   → Gửi LẠI CÙNG BÀI với mode 'solve'
   → Button: "⏳ Đang lấy lời giải..."
8. AI trả lời lời giải chi tiết
   → State: { status: 'answered', mode: 'solve' }
   → Button: "✅ Đã xem lời giải"
   → Badge: "✅ Đã xem lời giải"
```

### **Scenario 2: User đã unlock → Xem lời giải trực tiếp**

```
1. User đã mở khóa trước
2. Bài 1 hiển thị:
   [💬 Hỏi gia sư AI] [📖 Xem lời giải]
3. User click "Xem lời giải" TRỰC TIẾP
   → Gửi bài lên chat với mode 'solve'
   → AI trả lời lời giải chi tiết ngay
```

---

## 🔐 UNLOCK LOGIC

### **Button "Xem lời giải" disabled khi:**
- `!isUnlockMode` → Chưa mở khóa
- `state.status === 'asking'` → Đang hỏi AI

### **Button "Xem lời giải" enabled khi:**
- `isUnlockMode === true` → Đã mở khóa
- `state.status !== 'asking'` → Không đang hỏi AI

### **Visual Feedback:**
- Locked: 🔒 Xem lời giải (cần mở khóa)
- Unlocked: 📖 Xem lời giải
- Asking: ⏳ Đang lấy lời giải...
- Answered: ✅ Đã xem lời giải

---

## 📊 STATE MANAGEMENT

### **ExerciseGenerator:**
```tsx
const [exerciseStates, setExerciseStates] = useState<Record<number, ExerciseState>>({
  0: {
    exercise: "Câu 1: ...",
    mode: 'coach',
    status: 'answered'
  },
  1: {
    exercise: "Câu 2: ...",
    mode: null,
    status: 'idle'
  }
})
```

### **ChatInterface:**
```tsx
const [currentMode, setCurrentMode] = useState<'coach' | 'solve'>('coach')
const [messages, setMessages] = useState<Message[]>([...])
```

### **Dashboard:**
```tsx
const sendExerciseToChatRef = useRef<((exercise: string, mode: 'coach' | 'solve') => void) | null>(null)
const chatRef = useRef<HTMLDivElement>(null)
```

---

## 🎨 UI/UX HIGHLIGHTS

### **1. Clear Visual States:**
- Idle: No badge
- Asking: ⏳ (orange, pulsing)
- Answered (coach): ✅ Đã hỏi (green)
- Answered (solve): ✅ Đã xem lời giải (purple)

### **2. Auto Scroll:**
- Khi click button → Auto scroll lên chat
- Smooth animation (300ms delay)

### **3. Context Preservation:**
- Bài tập được lưu trong state
- Không cần user copy/paste
- AI không hỏi lại

### **4. Responsive Buttons:**
- Locked: Gray, disabled
- Unlocked: Green, enabled
- Asking: Loading animation
- Answered: Checkmark

---

## 🧪 TESTING CHECKLIST

### **Test 1: AI sinh bài tập**
- [ ] Chọn môn học → Hiển thị loại bài tập
- [ ] Click "AI tạo 5 bài tập" → Loading animation
- [ ] Nhận 5 bài tập từ API
- [ ] Mỗi bài có 2 buttons

### **Test 2: Hỏi gia sư AI**
- [ ] Click "Hỏi gia sư AI"
- [ ] Auto scroll lên chat
- [ ] Bài tập gửi lên chat
- [ ] AI trả lời hướng dẫn (mode: coach)
- [ ] Button → "✅ Đã hỏi"

### **Test 3: Xem lời giải (chưa unlock)**
- [ ] Button "Xem lời giải" disabled
- [ ] Text: "🔒 Xem lời giải (cần mở khóa)"
- [ ] Hint: "💡 Mở khóa từ navbar..."

### **Test 4: Xem lời giải (đã unlock)**
- [ ] Mở khóa từ navbar
- [ ] Button "Xem lời giải" enabled
- [ ] Click button
- [ ] Auto scroll lên chat
- [ ] Gửi LẠI CÙNG BÀI với mode 'solve'
- [ ] AI trả lời lời giải (KHÔNG HỎI LẠI)
- [ ] Button → "✅ Đã xem lời giải"

### **Test 5: Context Memory**
- [ ] Hỏi AI → Nhận hướng dẫn
- [ ] Đóng khóa → Mở khóa lại
- [ ] Click "Xem lời giải"
- [ ] AI KHÔNG HỎI: "Bài toán nào?"
- [ ] AI TRẢ LỜI NGAY lời giải

### **Test 6: Multiple Exercises**
- [ ] Hỏi AI cho Bài 1
- [ ] Hỏi AI cho Bài 2
- [ ] Xem lời giải Bài 1
- [ ] Xem lời giải Bài 2
- [ ] Mỗi bài giữ state riêng

---

## 🚀 NEXT STEPS (TÙY CHỌN)

### **1. Database Storage:**
- Lưu bài tập đã sinh vào DB
- Tránh tốn token khi regenerate
- User có thể xem lại bài cũ

### **2. User Grade Integration:**
- Lấy lớp học từ user profile
- AI sinh bài phù hợp với lớp
- Điều chỉnh độ khó tự động

### **3. Exercise History:**
- Lưu lịch sử bài tập đã làm
- Tracking progress
- Analytics

### **4. Favorites:**
- User có thể lưu bài tập yêu thích
- Tag, categorize bài tập
- Share với bạn bè

### **5. Difficulty Levels:**
- Thêm chọn độ khó: Dễ, Trung bình, Khó
- AI adjust prompt theo độ khó
- Adaptive learning

---

## 📝 NOTES

### **AI Cost:**
- Mỗi lần sinh 5 bài: ~500-1000 tokens
- Model: gpt-4o-mini (rẻ hơn gpt-4)
- Cache bài tập để giảm cost

### **Performance:**
- Response time: 2-5 giây
- Loading animation để improve UX
- Có thể optimize với streaming

### **Security:**
- Unlock code check ở backend
- Mode 'solve' chỉ hoạt động khi unlocked
- Rate limiting API

---

## ✅ COMPLETED TASKS

1. ✅ Tạo API endpoint `/api/generate-exercises`
2. ✅ Cập nhật `ExerciseGenerator` với AI sinh bài
3. ✅ Thêm buttons "Hỏi gia sư AI" + "Xem lời giải"
4. ✅ Tích hợp với `ChatInterface`
5. ✅ Implement context memory (không hỏi lại)
6. ✅ Visual feedback (button states, badges)
7. ✅ Auto scroll lên chat
8. ✅ Unlock logic integration

---

**Tính năng đã HOÀN THÀNH và SẴN SÀNG để test!** 🎉



