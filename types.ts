
export enum UserRole {
  ADMIN = 'ADMIN',
  AGENT = 'AGENT',
  FREELANCE = 'FREELANCE',
  HEAD = 'HEAD'
}

export enum TaskStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  ACCEPTED = 'ACCEPTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REJECTED_BY_AGENT = 'REJECTED_BY_AGENT',
  PENDING_EDIT = 'PENDING_EDIT',
  PENDING_DELETE = 'PENDING_DELETE'
}

export interface TaskDocument {
  id: string;
  name: string;
  type: string;
  data: string; // Base64
  uploadedAt: string;
  uploadedBy: string;
  category: string; // e.g., 'Surat Kuasa', 'BPKB', 'Lainnya 1'
}

export interface TaskProgressLog {
  id: string;
  timestamp: string;
  description: string;
  location: { lat: number; lng: number };
  photo: string;
  type: 'VISIT' | 'ACTION' | 'NOTE';
}

export interface FreelanceActivityLog {
  id: string;
  freelanceName: string;
  freelanceUserId?: string; // Penambahan field untuk tracking
  referralMemberId: string;
  referralMemberName: string;
  actionType: 'LOGIN_AUTH' | 'DOC_AUTH' | 'DOC_AUTH_SK' | 'DOC_DOWNLOAD';
  vehiclePlate?: string;
  freelanceLocation: { lat: number; lng: number };
  freelanceTime: string;
  approvalLocation?: { lat: number; lng: number };
  approvalTime?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface VehicleRecoveryTask {
  id: string;
  leasingName: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: string;
  vehicleColor: string;
  platePrefix: string;
  plateNumber: string;
  plateSuffix: string;
  chassisNumber: string;
  engineNumber: string;
  status: TaskStatus;
  assignedTo?: string;
  createdAt: string;
  documents: TaskDocument[];
  progressLogs?: TaskProgressLog[];
  debtorName?: string;
  resolutionType?: 'UNIT_HANDOVER' | 'SETTLEMENT';
  resolutionChronology?: string;
  resolutionPhoto?: string;
  approvedForFreelances?: string[];
  // Untuk alur persetujuan Direktur
  pendingEdit?: Partial<VehicleRecoveryTask>;
  pendingDelete?: boolean;
}

export interface DigitalAsset {
  id: string;
  name: string;
  category: string; // 'Logo Utama', 'Kop Surat', 'Stempel Kantor', 'Template Dokumen', 'Lainnya'
  data: string; // Base64
  type: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: UserRole;
  avatar?: string;
  address?: string;
  phone?: string;
  status?: 'active' | 'inactive' | 'waiting_auth' | 'pending_edit' | 'pending_delete';
  referralId?: string;
  ktpPhoto?: string;
  joinDate?: string;
  signature?: string; // Base64 Scan Tanda Tangan
  // Untuk alur persetujuan Direktur
  pendingEdit?: Partial<User>;
  pendingDelete?: boolean;
}

export interface AIAnalysisResult {
  leasingName: string;
  vehicleModel: string;
  plateNumber: string;
  debtorName: string;
  debtorAddress: string;
  contractNumber?: string;
  chassisNumber?: string;
  engineNumber?: string;
  vehicleYear?: string;
}

export interface KTPAnalysisResult {
  name: string;
  nik: string;
  address: string;
  confidence: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  timestamp: string;
  type: 'IN' | 'OUT';
  location: { lat: number; lng: number };
  photo: string;
}
