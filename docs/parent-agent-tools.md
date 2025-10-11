# Parent Learning Assistant - Tools Configuration

## Tool 1: get_student_progress
```json
{
  "type": "function",
  "function": {
    "name": "get_student_progress",
    "description": "Lấy thông tin tiến độ học tập của học sinh theo ID",
    "parameters": {
      "type": "object",
      "properties": {
        "studentId": {
          "type": "string",
          "description": "ID của học sinh"
        },
        "subject": {
          "type": "string",
          "description": "Môn học cần kiểm tra (toán, tiếng việt, khoa học, etc.)",
          "enum": ["toán", "tiếng việt", "khoa học", "lịch sử", "địa lý", "tiếng anh"]
        },
        "timeframe": {
          "type": "string",
          "description": "Khoảng thời gian cần kiểm tra",
          "enum": ["tuần này", "tháng này", "học kỳ này", "cả năm"]
        }
      },
      "required": ["studentId"]
    }
  }
}
```

## Tool 2: create_study_plan
```json
{
  "type": "function",
  "function": {
    "name": "create_study_plan",
    "description": "Tạo kế hoạch học tập cá nhân cho học sinh",
    "parameters": {
      "type": "object",
      "properties": {
        "studentId": {
          "type": "string",
          "description": "ID của học sinh"
        },
        "grade": {
          "type": "string",
          "description": "Khối lớp của học sinh",
          "enum": ["lớp 1", "lớp 2", "lớp 3", "lớp 4", "lớp 5", "lớp 6", "lớp 7", "lớp 8", "lớp 9"]
        },
        "weakSubjects": {
          "type": "array",
          "items": {"type": "string"},
          "description": "Các môn học cần cải thiện"
        },
        "availableTime": {
          "type": "object",
          "properties": {
            "weekdays": {"type": "string", "description": "Thời gian học trong tuần (VD: 19:00-20:30)"},
            "weekends": {"type": "string", "description": "Thời gian học cuối tuần (VD: 09:00-11:00)"}
          }
        }
      },
      "required": ["studentId", "grade"]
    }
  }
}
```

## Tool 3: generate_practice_exercises
```json
{
  "type": "function",
  "function": {
    "name": "generate_practice_exercises",
    "description": "Tạo bài tập thực hành phù hợp với trình độ học sinh",
    "parameters": {
      "type": "object",
      "properties": {
        "subject": {
          "type": "string",
          "description": "Môn học",
          "enum": ["toán", "tiếng việt", "khoa học", "lịch sử", "địa lý", "tiếng anh"]
        },
        "grade": {
          "type": "string",
          "description": "Khối lớp",
          "enum": ["lớp 1", "lớp 2", "lớp 3", "lớp 4", "lớp 5", "lớp 6", "lớp 7", "lớp 8", "lớp 9"]
        },
        "topic": {
          "type": "string",
          "description": "Chủ đề cụ thể (VD: phép cộng, từ vựng, v.v.)"
        },
        "difficulty": {
          "type": "string",
          "description": "Mức độ khó",
          "enum": ["dễ", "trung bình", "khó"]
        },
        "numberOfQuestions": {
          "type": "integer",
          "description": "Số lượng câu hỏi",
          "minimum": 1,
          "maximum": 20
        }
      },
      "required": ["subject", "grade"]
    }
  }
}
```

## Tool 4: get_learning_resources
```json
{
  "type": "function",
  "function": {
    "name": "get_learning_resources",
    "description": "Lấy tài liệu học tập và video hướng dẫn",
    "parameters": {
      "type": "object",
      "properties": {
        "subject": {
          "type": "string",
          "description": "Môn học",
          "enum": ["toán", "tiếng việt", "khoa học", "lịch sử", "địa lý", "tiếng anh"]
        },
        "grade": {
          "type": "string",
          "description": "Khối lớp",
          "enum": ["lớp 1", "lớp 2", "lớp 3", "lớp 4", "lớp 5", "lớp 6", "lớp 7", "lớp 8", "lớp 9"]
        },
        "resourceType": {
          "type": "string",
          "description": "Loại tài liệu",
          "enum": ["video", "bài tập", "tài liệu lý thuyết", "trò chơi học tập"]
        },
        "topic": {
          "type": "string",
          "description": "Chủ đề cụ thể"
        }
      },
      "required": ["subject", "grade"]
    }
  }
}
```

## Tool 5: track_study_session
```json
{
  "type": "function",
  "function": {
    "name": "track_study_session",
    "description": "Theo dõi và ghi nhận phiên học tập",
    "parameters": {
      "type": "object",
      "properties": {
        "studentId": {
          "type": "string",
          "description": "ID của học sinh"
        },
        "subject": {
          "type": "string",
          "description": "Môn học đã học"
        },
        "duration": {
          "type": "integer",
          "description": "Thời gian học (phút)"
        },
        "topics": {
          "type": "array",
          "items": {"type": "string"},
          "description": "Các chủ đề đã học"
        },
        "performance": {
          "type": "string",
          "description": "Đánh giá hiệu suất học tập",
          "enum": ["rất tốt", "tốt", "trung bình", "cần cải thiện"]
        },
        "notes": {
          "type": "string",
          "description": "Ghi chú về phiên học"
        }
      },
      "required": ["studentId", "subject", "duration"]
    }
  }
}
```
