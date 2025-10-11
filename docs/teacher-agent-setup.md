# Teacher Assistant Agent - Setup Guide

## Agent Configuration

### Name: Teacher Assistant
### Description: AI assistant giúp giáo viên tạo bài học, đánh giá học sinh, và quản lý lớp học

### Instructions:
```
Bạn là một trợ lý giảng dạy chuyên nghiệp dành cho giáo viên. Nhiệm vụ của bạn:

1. TẠO NỘI DUNG BÀI HỌC:
   - Thiết kế giáo án phù hợp với chương trình học
   - Tạo bài tập và câu hỏi kiểm tra đa dạng
   - Phát triển hoạt động tương tác trong lớp

2. ĐÁNH GIÁ VÀ PHÂN TÍCH:
   - Phân tích kết quả học tập của học sinh
   - Đề xuất phương pháp cải thiện
   - Tạo báo cáo tiến độ chi tiết

3. QUẢN LÝ LỚP HỌC:
   - Tạo lịch học và kế hoạch giảng dạy
   - Quản lý danh sách học sinh
   - Theo dõi điểm danh và tham gia

4. HỖ TRỢ GIÁO DỤC:
   - Tư vấn phương pháp giảng dạy hiệu quả
   - Tạo tài liệu bổ trợ
   - Đề xuất hoạt động ngoại khóa

Luôn tuân thủ chương trình giáo dục Việt Nam, sử dụng tiếng Việt chuẩn.
```

## Tools Configuration

### Tool 1: create_lesson_plan
```json
{
  "type": "function",
  "function": {
    "name": "create_lesson_plan",
    "description": "Tạo giáo án chi tiết cho bài học",
    "parameters": {
      "type": "object",
      "properties": {
        "subject": {
          "type": "string",
          "description": "Môn học",
          "enum": ["toán", "tiếng việt", "khoa học", "lịch sử", "địa lý", "tiếng anh", "thể dục", "mỹ thuật"]
        },
        "grade": {
          "type": "string",
          "description": "Khối lớp",
          "enum": ["lớp 1", "lớp 2", "lớp 3", "lớp 4", "lớp 5", "lớp 6", "lớp 7", "lớp 8", "lớp 9"]
        },
        "topic": {
          "type": "string",
          "description": "Chủ đề bài học"
        },
        "duration": {
          "type": "integer",
          "description": "Thời lượng bài học (phút)",
          "minimum": 30,
          "maximum": 120
        },
        "objectives": {
          "type": "array",
          "items": {"type": "string"},
          "description": "Mục tiêu học tập"
        }
      },
      "required": ["subject", "grade", "topic", "duration"]
    }
  }
}
```

### Tool 2: generate_assessment
```json
{
  "type": "function",
  "function": {
    "name": "generate_assessment",
    "description": "Tạo bài kiểm tra và đánh giá",
    "parameters": {
      "type": "object",
      "properties": {
        "subject": {
          "type": "string",
          "description": "Môn học"
        },
        "grade": {
          "type": "string",
          "description": "Khối lớp"
        },
        "assessmentType": {
          "type": "string",
          "description": "Loại đánh giá",
          "enum": ["kiểm tra 15 phút", "kiểm tra 1 tiết", "thi giữa kỳ", "thi cuối kỳ"]
        },
        "topics": {
          "type": "array",
          "items": {"type": "string"},
          "description": "Các chủ đề cần kiểm tra"
        },
        "questionTypes": {
          "type": "array",
          "items": {"type": "string"},
          "description": "Loại câu hỏi",
          "enum": ["trắc nghiệm", "tự luận", "điền vào chỗ trống", "đúng/sai"]
        },
        "difficulty": {
          "type": "string",
          "description": "Mức độ khó",
          "enum": ["dễ", "trung bình", "khó", "hỗn hợp"]
        }
      },
      "required": ["subject", "grade", "assessmentType"]
    }
  }
}
```

### Tool 3: analyze_student_performance
```json
{
  "type": "function",
  "function": {
    "name": "analyze_student_performance",
    "description": "Phân tích hiệu suất học tập của học sinh",
    "parameters": {
      "type": "object",
      "properties": {
        "studentId": {
          "type": "string",
          "description": "ID của học sinh"
        },
        "subject": {
          "type": "string",
          "description": "Môn học cần phân tích"
        },
        "timeframe": {
          "type": "string",
          "description": "Khoảng thời gian phân tích",
          "enum": ["tuần", "tháng", "học kỳ", "cả năm"]
        },
        "includeRecommendations": {
          "type": "boolean",
          "description": "Bao gồm đề xuất cải thiện"
        }
      },
      "required": ["studentId", "subject"]
    }
  }
}
```

### Tool 4: create_class_schedule
```json
{
  "type": "function",
  "function": {
    "name": "create_class_schedule",
    "description": "Tạo lịch học và kế hoạch giảng dạy",
    "parameters": {
      "type": "object",
      "properties": {
        "grade": {
          "type": "string",
          "description": "Khối lớp"
        },
        "semester": {
          "type": "string",
          "description": "Học kỳ",
          "enum": ["học kỳ 1", "học kỳ 2", "cả năm"]
        },
        "subjects": {
          "type": "array",
          "items": {"type": "string"},
          "description": "Danh sách môn học"
        },
        "weeklyHours": {
          "type": "object",
          "description": "Số tiết học mỗi tuần cho từng môn",
          "additionalProperties": {"type": "integer"}
        }
      },
      "required": ["grade", "semester", "subjects"]
    }
  }
}
```

### Tool 5: track_class_attendance
```json
{
  "type": "function",
  "function": {
    "name": "track_class_attendance",
    "description": "Theo dõi điểm danh và tham gia lớp học",
    "parameters": {
      "type": "object",
      "properties": {
        "classId": {
          "type": "string",
          "description": "ID của lớp học"
        },
        "date": {
          "type": "string",
          "description": "Ngày điểm danh (YYYY-MM-DD)"
        },
        "attendanceData": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "studentId": {"type": "string"},
              "status": {
                "type": "string",
                "enum": ["có mặt", "vắng có phép", "vắng không phép", "đi muộn"]
              },
              "notes": {"type": "string"}
            },
            "required": ["studentId", "status"]
          }
        }
      },
      "required": ["classId", "date", "attendanceData"]
    }
  }
}
```
