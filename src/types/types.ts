export interface CreatedBy {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  userName: string;
  password: string;
  role: string;
  isActive: boolean;
  mdId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Schedule {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  status: string;
  createdByRole: string;
  createdById: number;
  createdByHiwasId: number | null;
  createdByMDId: number | null;
  createdByWeredaId: number | null;
  createdByWanaId: number | null;
  createdAt: string;
  updatedAt: string;
  createdByHiwas?: CreatedBy | null;
  createdByMD?: CreatedBy | null;
  createdByWana?: CreatedBy | null;
  createdByWereda?: CreatedBy | null;
}
export interface Hiwas {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  userName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}export interface ReportImage {
  id: number;
  type: string;
  url: string;
  reportId: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReportPdf {
  id: number;
  title: string;
  url: string;
  reportId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Report {
  id: number;
  name: string;
  description: string;
  reportedBy: string;
  reportedByHiwasId: number | null;
  reportedByMDId: number | null;
  reportedByWeredaId: number | null;
  scheduleId: number | null;
  reportVideo: string | null;
  audio: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  reportImages: ReportImage[] | null;
  reportPdfs: ReportPdf[] | null;
  schedule: Schedule | null;
  reportByHiwas:  {
      id: number,
      mdId: number,
      firstName: string,
      lastName: string,
      email: string,
      phone: string
    } | null;
    reportedByWereda:  {
        id: number,
        firstName: string,
        lastName: string,
        email: string,
        phone: string
      } | null;
}


export interface Creator {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  userName: string;
  role: string;
  isActive: boolean;
  mdId: number;
  createdAt: string;
  updatedAt: string;
}


export interface HiwasNotification {
  id: number;
  message: string;
  recipientId: number;
  recipientType: string;
  scheduleId: number;
  reportId: number;
  isRead: boolean;
  createdAt: string;
  hiwasId: number,
  hiwas: {
    firstName: string;
      lastName: string;
      email: string,
    phone: string;
md: {
  id: number,
    firstName: string,
      lastName: string,
        email: string,
          phone: string
}
    },
    schedule: {
      id: number,
      status: string,
      startTime: string,
      endTime: string,
      title: string,
      description: string
     } | null,
     report: {
      id: number,
       name: string,
       description: string
       createdAt: string;
     } | null
  }

 export interface MeseretawiDirijet {
    id: number;
    firstName: string;
    lastName: string;
    email: string,
    phone: string;
  }
  export interface MeseretawiDirijetNotification {
    id: number| null;
    message: string| null;
    recipientId: number| null;
    recipientType: string| null;
    scheduleId: number| null,
    reportId: number| null,
    isRead: number| null,
    createdAt: string| null,
    hiwasId: number| null,
    meseretawiDirijetId: number| null,
   schedule: {
      description: string,
      title: string,
      createdByRole: string,
      id: number,
      startTime: string,
      endTime: string,
      status: string
    }| null,
    hiwas: {
      id: number,
      firstName:string,
      lastName: string,
      phone: string,
      email: string
    }| null,
    report: {
      name: string,
      reportedByHiwasId: number,
      description: string
      createdAt: string;
    } | null
  }
  export interface WeredaNotificationBody{
    id: number,
    message: string,
    recipientId: number | null,
    recipientType: string,
    scheduleId: number,
    reportId: null,
    isRead: false,
    createdAt: string,
    updatedAt: string,
    weredaId: number,
    schedule: {
       description: string,
       title: string,
       createdByRole: string,
       id: number,
       startTime: string,
       endTime: string,
       status: string
     }| null,
      report: {
        id: number,
        name: string,
        reportedByHiwasId: number,
        description: string
        createdAt: string;
      } | null
  }
  
  interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    userName: string;
    password: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    mdId?: number;
  }
  
  export interface WanaScheduleBody {
    id: number;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    status: string;
    createdByRole: string;
    createdById: number;
    createdByHiwasId: number | null;
    createdByMDId: number | null;
    createdByWeredaId: number | null;
    createdByWanaId: number | null;
    createdAt: string;
    updatedAt: string;
    createdByHiwas: User | null;
    createdByMD: User | null;
    createdByWana: User | null;
    createdByWereda: User | null;
    reports: Report
  }
  