// Tools for OpenAI Agent Builder
// Các tools mà agent có thể sử dụng

export const agentTools = {
  /**
   * Tool để lấy thông tin tiến độ học tập của học sinh
   */
  getStudentProgress: {
    type: "function",
    function: {
      name: "get_student_progress",
      description: "Lấy thông tin tiến độ học tập của học sinh theo ID",
      parameters: {
        type: "object",
        properties: {
          studentId: {
            type: "string",
            description: "ID của học sinh"
          }
        },
        required: ["studentId"]
      }
    }
  },

  /**
   * Tool để lấy nội dung bài học
   */
  getLessonContent: {
    type: "function",
    function: {
      name: "get_lesson_content",
      description: "Lấy nội dung bài học theo chủ đề và cấp độ",
      parameters: {
        type: "object",
        properties: {
          topic: {
            type: "string",
            description: "Chủ đề bài học"
          },
          level: {
            type: "string",
            description: "Cấp độ (ví dụ: lớp 1, lớp 2)"
          }
        },
        required: ["topic", "level"]
      }
    }
  },

  /**
   * Tool để tạo kế hoạch học tập
   */
  createStudyPlan: {
    type: "function",
    function: {
      name: "create_study_plan",
      description: "Tạo kế hoạch học tập cá nhân hóa cho học sinh",
      parameters: {
        type: "object",
        properties: {
          studentId: {
            type: "string",
            description: "ID của học sinh"
          },
          subject: {
            type: "string",
            description: "Môn học"
          },
          duration: {
            type: "number",
            description: "Thời lượng kế hoạch (ví dụ: số ngày, tuần)"
          },
          goals: {
            type: "array",
            items: {
              type: "string"
            },
            description: "Các mục tiêu học tập"
          }
        },
        required: ["studentId", "subject", "duration", "goals"]
      }
    }
  }
}

export function getToolsForRole(role: string): any[] {
  const tools: any[] = []
  switch (role) {
    case 'parent':
      tools.push(agentTools.getStudentProgress)
      tools.push(agentTools.createStudyPlan)
      tools.push(agentTools.getLessonContent)
      break
    case 'teacher':
      tools.push(agentTools.getStudentProgress)
      tools.push(agentTools.createStudyPlan)
      tools.push(agentTools.getLessonContent)
      break
    case 'admin':
      tools.push(agentTools.getStudentProgress)
      tools.push(agentTools.getLessonContent)
      break
    default:
      // Default to parent tools if role is not recognized
      tools.push(agentTools.getStudentProgress)
      tools.push(agentTools.createStudyPlan)
      tools.push(agentTools.getLessonContent)
      break
  }
  return tools
}
