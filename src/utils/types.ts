export interface User {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  }
  
  export interface Folder {
    id: string;
    name: string;
    parentFolder: string | null;
    path: string[];
    createdAt: string;
  }
  
  export interface Image {
    id: string;
    name: string;
    folder: string | null;
    imageUrl: string;
    createdAt: string;
  }
  
  export interface FolderTree extends Folder {
    children: FolderTree[];
  }
  
  export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
  }
  
  export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    total: number;
    page: number;
    limit: number;
  }