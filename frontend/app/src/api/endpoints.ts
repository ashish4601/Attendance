export const ENDPOINTS = {
  users: {
    register: '/users/register',
    login: '/users/login',
    logout: '/users/logout',
    me: '/users/me',
    refresh: '/users/refresh-token',
    changePassword: '/users/change-password',
    update: '/users/me',
    getById: (userId: string) => `/users/user/${userId}`,
    profileImage: '/users/me/profile-image',
  },
  admin: {
    createUser: '/admin/create-user',
  },
  students: {
    classes: '/students/classes',
    activeSession: (classId: string) => `/students/classes/${classId}/active-session`,
    attendance: '/students/attendance',
  },
  classes: {
    add: '/classes/add-class',
    addStudent: (classId: string) => `/classes/${classId}/students`,
    listMine: '/classes/getclassesbycreator',
  },
  sessions: {
    create: (classId: string) => `/sessions/${classId}`,
    end: (sessionId: string) => `/sessions/${sessionId}/end`,
    listMine: `/sessions/mine`,
    listByClass: (classId: string) => `/classes/${classId}/sessions`,
  },
  faceData: {
    enroll: '/face-data/enroll',
    status: '/face-data/status',
    reset: (studentId: string) => `/face-data/reset/${studentId}`,
  },
  attendance: {
    mark: '/attendance/mark-attendance',
    listBySession: (sessionId: string) => `/attendance/sessions/${sessionId}`,
  },
} as const;
