/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFolderTree, createFolder } from '../api/folder';
import { Folder, ChevronRight, ChevronDown, Plus, FolderPlus, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';
import CreateFolderModal from './createFolder';
import DeleteConfirmationModal from './deleteConfirmationModal';
import toast from 'react-hot-toast';


interface FolderNode {
  _id: string;
  name: string;
  children: FolderNode[];
}

const FolderTree = ({
  selectedFolder,
  onSelect,
  onDeleteFolder,
}: {
  selectedFolder: string | null;
  onSelect: (folderId: string | null, folderName?: string) => void;
  onDeleteFolder: (folderId: string) => void;
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<{ id: string; name: string } | null>(null);
  const [parentFolderId, setParentFolderId] = useState<string | null>(null);
  
  const queryClient = useQueryClient();

  const { data: foldersResponse, isLoading, error } = useQuery({
    queryKey: ['folderTree'],
    queryFn: getFolderTree,
  });

  const createFolderMutation = useMutation({
    mutationFn: createFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folderTree'] });
      setCreateModalOpen(false);
      toast.success('Folder created successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create folder');
    },
  });

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleCreateFolder = (parentId: string | null = null) => {
    setParentFolderId(parentId);
    setCreateModalOpen(true);
  };

  const handleDeleteClick = (folderId: string, folderName: string) => {
    setFolderToDelete({ id: folderId, name: folderName });
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (folderToDelete) {
      onDeleteFolder(folderToDelete.id);
      setFolderToDelete(null);
    }
  };

  const renderTree = (nodes: FolderNode[], level = 0) => {
    if (!Array.isArray(nodes)) {
      console.warn('Expected nodes to be an array, got:', typeof nodes, nodes);
      return null;
    }

    return nodes.map((node) => {
      const isExpanded = expandedFolders.has(node._id);
      const hasChildren = node.children && node.children.length > 0;

      return (
        <div key={node._id} style={{ paddingLeft: `${level * 16}px` }}>
          <div className="flex items-center group">
            <Button
              variant="ghost"
              size="sm"
              className={`flex-1 justify-start ${
                selectedFolder === node._id ? 'bg-accent' : ''
              }`}
              onClick={() => onSelect(node._id, node.name)}
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (hasChildren) toggleFolder(node._id);
                  }}
                  className="flex-shrink-0 p-0.5"
                >
                  {hasChildren ? (
                    isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )
                  ) : (
                    <div className="h-4 w-4" />
                  )}
                </button>
                <Folder className="h-4 w-4" />
                <span className="truncate">{node.name}</span>
              </div>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleCreateFolder(node._id)}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(node._id, node.name);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          {hasChildren && isExpanded && (
            <div>{renderTree(node.children, level + 1)}</div>
          )}
        </div>
      );
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-1">
        <Button variant="ghost" className="w-full justify-start" disabled>
          <div className="flex items-center gap-2">
            <Folder className="h-4 w-4" />
            <span>Loading...</span>
          </div>
        </Button>
      </div>
    );
  }

  // Handle error state
  if (error) {
    toast.error('Failed to load folders');
    return (
      <div className="space-y-1">
        <Button variant="ghost" className="w-full justify-start" disabled>
          <div className="flex items-center gap-2">
            <Folder className="h-4 w-4" />
            <span>Error loading folders</span>
          </div>
        </Button>
      </div>
    );
  }

  let folderData = [];
  if (foldersResponse) {
    const responseData = foldersResponse.data;
    
    if (Array.isArray(responseData)) {
      folderData = responseData;
    } else if (responseData && Array.isArray(responseData.data)) {
      folderData = responseData.data;
    } else if (responseData && Array.isArray(responseData.folders)) {
      folderData = responseData.folders;
    } else {
      console.warn('Unexpected folder data structure:', responseData);
    }
  }

  // Show empty state if no folders exist
  if (folderData.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <FolderPlus className="h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-sm font-medium text-gray-900 mb-1">No folders found</h3>
          <p className="text-xs text-gray-500 mb-4">Create your first folder to organize your images</p>
          <Button
            onClick={() => handleCreateFolder(null)}
            size="sm"
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Folder
          </Button>
        </div>
        <CreateFolderModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          parentFolderId={parentFolderId}
          onSubmit={(data : any) => createFolderMutation.mutate(data)}
          isLoading={createFolderMutation.isPending}
        />
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          className={`flex-1 justify-start ${
            selectedFolder === null ? 'bg-accent' : ''
          }`}
          onClick={() => onSelect(null)}
        >
          <div className="flex items-center gap-2">
            <Folder className="h-4 w-4" />
            <span>Root</span>
          </div>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleCreateFolder(null)}
          title="Create folder in root"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {renderTree(folderData)}
      
      <CreateFolderModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        parentFolderId={parentFolderId}
        onSubmit={(data : any) => createFolderMutation.mutate(data)}
        isLoading={createFolderMutation.isPending}
      />

      <DeleteConfirmationModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Folder"
        description={
          folderToDelete 
            ? `Are you sure you want to delete the folder "${folderToDelete.name}"? This action cannot be undone.`
            : ''
        }
      />
    </div>
  );
};

export default FolderTree;