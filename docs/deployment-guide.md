# Agent Builder Deployment Guide

## Bước 1: Tạo Agents trong OpenAI Dashboard

### 1.1 Truy cập OpenAI Dashboard
- URL: https://platform.openai.com/agents
- Đăng nhập với API key của bạn

### 1.2 Tạo Parent Learning Assistant
```
Name: Parent Learning Assistant
Description: AI assistant giúp phụ huynh hỗ trợ con học tập
Instructions: [Copy từ parent-agent-setup.md]
Tools: [Thêm 5 tools từ parent-agent-tools.md]
```

### 1.3 Tạo Teacher Assistant  
```
Name: Teacher Assistant
Description: AI assistant giúp giáo viên tạo bài học và quản lý lớp
Instructions: [Copy từ teacher-agent-setup.md]
Tools: [Thêm 5 tools từ teacher-agent-setup.md]
```

### 1.4 Tạo Admin Analytics
```
Name: Admin Analytics Assistant  
Description: AI assistant giúp quản trị viên phân tích dữ liệu
Instructions: [Copy từ admin-agent-setup.md]
Tools: [Thêm 5 tools từ admin-agent-setup.md]
```

## Bước 2: Lấy Agent IDs

Sau khi tạo xong, lấy Agent ID từ dashboard:
- Parent Agent ID: `asst_xxx`
- Teacher Agent ID: `asst_yyy` 
- Admin Agent ID: `asst_zzz`

## Bước 3: Cập nhật Code

### 3.1 Cập nhật Agent Builder Client
```typescript
// lib/agentBuilderClient.ts
export const agentBuilderClient = {
  getAgentByRole(role: string): string {
    const agentMap: Record<string, string> = {
      'parent': 'asst_xxx', // Parent Agent ID
      'teacher': 'asst_yyy', // Teacher Agent ID  
      'admin': 'asst_zzz',   // Admin Agent ID
    }
    return agentMap[role] || agentMap['parent']
  },
  // ... rest of the code
}
```

### 3.2 Cập nhật Environment Variables
```bash
# .env.local
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key

# Agent IDs
PARENT_AGENT_ID=asst_xxx
TEACHER_AGENT_ID=asst_yyy
ADMIN_AGENT_ID=asst_zzz
```

## Bước 4: Implement Tool Functions

### 4.1 Tạo Tool Handlers
```typescript
// lib/toolHandlers.ts
export const toolHandlers = {
  async get_student_progress(params: any) {
    // Implement logic to get student progress
  },
  async create_study_plan(params: any) {
    // Implement logic to create study plan
  },
  // ... other tool handlers
}
```

### 4.2 Cập nhật Chat Route
```typescript
// app/api/chat/route.ts
import { toolHandlers } from '@/lib/toolHandlers'

// Handle tool calls in the response
if (response.required_action?.type === 'submit_tool_outputs') {
  const toolCalls = response.required_action.submit_tool_outputs.tool_calls
  
  for (const toolCall of toolCalls) {
    const handler = toolHandlers[toolCall.function.name]
    if (handler) {
      const result = await handler(JSON.parse(toolCall.function.arguments))
      // Submit tool output back to OpenAI
    }
  }
}
```

## Bước 5: Test và Deploy

### 5.1 Test Local
```bash
pnpm dev
# Test chat với từng role
```

### 5.2 Deploy Production
```bash
# Build và deploy lên Cloud Run
pnpm build
gcloud run deploy hhp-ai-agent-prod --source .
```

## Bước 6: Monitoring và Optimization

### 6.1 Monitor Usage
- Theo dõi API calls trong OpenAI Dashboard
- Monitor performance trong Cloud Run
- Track user engagement

### 6.2 Optimize Costs
- Cache responses khi có thể
- Optimize tool calls
- Monitor token usage

## Troubleshooting

### Common Issues:
1. **Agent not found**: Kiểm tra Agent ID trong environment variables
2. **Tool call errors**: Implement đầy đủ tool handlers
3. **Permission errors**: Kiểm tra API key permissions
4. **Rate limiting**: Implement retry logic và rate limiting

### Debug Tips:
- Enable debug logging
- Check OpenAI API logs
- Monitor network requests
- Test individual tools
