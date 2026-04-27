// src/app/core/models/cloud-file.model.ts

export interface CloudFile {
  name: string;
  size: string;
  type: 'pdf' | 'doc' | 'xlsx' | 'jpg' | 'png';
  uploadDate: Date;
  /** Relative time label for display, e.g. "Hace 2 horas" */
  timeAgo?: string;
  owner?: string;
  tags?: string[];
  aiSummary?: string;
  aiTags?: string[];
}

export interface CloudFolder {
  name: string;
  fileCount: number;
  totalSize: string;
  icon: string;            // Material Symbols icon name
  iconBgClass: string;     // Tailwind bg color class for the icon container
  iconTextClass: string;   // Tailwind text color class for the icon
  avatars: string[];       // Avatar image URLs
  extraAvatars?: number;   // Number of additional avatars not shown (e.g. +3)
}

export interface StorageInfo {
  usedGB: number;
  totalGB: number;
  percentage: number;
}

export interface NavItem {
  label: string;
  icon: string;   // Material Symbols icon name
  active?: boolean;
  route?: string;
}

export interface UserProfile {
  fullName: string;
  role: string;
  avatarUrl: string;
}