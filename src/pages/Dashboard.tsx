/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteImage, getImages } from '../api/image';
import FolderTree from '../components/FolderTree';
import ImageUploadModal from '../components/ImageUploadModel';
import { useState } from 'react';
import { Input } from '../components/ui/input';
import { Folder, Trash2, X, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../components/UseAuth';
import toast, { Toaster } from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { deleteFolder } from '../api/folder';

const Dashboard = () => {
  const { logout } = useAuth();
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedFolderName, setSelectedFolderName] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [deleteImageModalOpen, setDeleteImageModalOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<{ id: string; name: string } | null>(null);

  const DeleteConfirmationModal = ({ open, onOpenChange, onConfirm, title, description, isLoading = false }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    title: string;
    description: string;
    isLoading?: boolean;
  }) => {
    const handleConfirm = () => {
      onConfirm();
      onOpenChange(false);
    };

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  {title}
                </DialogTitle>
              </div>
            </div>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              {description}
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  const deleteImageMutation = useMutation({
    mutationFn: deleteImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images'] });
      toast.success('Image deleted successfully');
    },
    onError: (error: any) => {
      let errorMessage = 'Failed to delete image';
      
      if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    }
  });

  const handleDeleteImageClick = (imageId: string, imageName: string) => {
    setImageToDelete({ id: imageId, name: imageName });
    setDeleteImageModalOpen(true);
  };

  const handleDeleteImageConfirm = () => {
    if (imageToDelete) {
      deleteImageMutation.mutate(imageToDelete.id);
      setImageToDelete(null);
    }
  };

  const ImageModal = () => (
    <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
      <DialogContent className="max-w-[90vw] max-h-[90vh]">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 z-10"
            onClick={() => setIsImageModalOpen(false)}
          >
            <X className="h-6 w-6" />
          </Button>
          <img
            src={selectedImage?.imageUrl}
            alt={selectedImage?.name}
            className="w-full h-full object-contain max-h-[80vh]"
          />
        </div>
      </DialogContent>
    </Dialog>
  );

  const handleSelectFolder = (folderId: string | null, folderName?: string) => {
    setSelectedFolder(folderId);
    setSelectedFolderName(folderName || '');
  };
  const { data: images, isLoading, error } = useQuery({
    queryKey: ['images', selectedFolder, searchQuery],
    queryFn: () => getImages(selectedFolder || undefined, searchQuery || undefined),
  });

  if (error) {
    toast.error('Failed to load images');
  }
  
  const deleteFolderMutation = useMutation({
    mutationFn: deleteFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folderTree'] });
      queryClient.invalidateQueries({ queryKey: ['images'] });
      toast.success('Folder deleted successfully');
    },
    onError: (error: any) => {
      let errorMessage = 'Failed to delete folder';
      
      if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    }
  });
  
  const handleDeleteFolder = async (folderId: string) => {
    deleteFolderMutation.mutate(folderId);
  };

  return (
    <div className="flex h-screen">
      {/* Toast Container */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: '#059669',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#DC2626',
            },
          },
        }}
      />

      {/* Sidebar */}
      <div className="w-64 border-r p-4">
        <h1 className="mb-4 text-xl font-bold">Image Storage</h1>
        <Button variant="outline" className="mb-4 w-full" onClick={logout}>
          Logout
        </Button>
        <FolderTree
          selectedFolder={selectedFolder}
          onSelect={handleSelectFolder}
          onDeleteFolder={handleDeleteFolder}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {selectedFolder ? 'Folder' : 'All Images'}
          </h2>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search images..."
              className="w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <ImageUploadModal
              folderId={selectedFolder}
              selectedFolder={selectedFolderName || (selectedFolder ? 'Root folder' : '')}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-64 flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-500">Loading images...</p>
          </div>
        ) : images?.data.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed">
            <Folder className="h-12 w-12 text-gray-400" />
            <p className="mt-2 text-gray-500">No images found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {(images?.data?.data || []).map((image: any) => (
                <div
                  key={image._id}
                  className="overflow-hidden rounded-lg border shadow-sm relative group"
                >
                  <div
                    className="relative h-48 overflow-hidden cursor-pointer"
                    onClick={() => {
                      setSelectedImage(image);
                      setIsImageModalOpen(true);
                    }}
                  >
                    <img
                      src={image.imageUrl}
                      alt={image.name}
                      className="h-full w-full object-cover"
                      onError={() => toast.error(`Failed to load image: ${image.name}`)}
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="truncate font-medium">{image.name}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(image.createdAt).toLocaleDateString()}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteImageClick(image._id, image.name);
                      }}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <ImageModal />
          </>
        )}
      </div>

      {/* Delete Image Confirmation Modal */}
      <DeleteConfirmationModal
        open={deleteImageModalOpen}
        onOpenChange={setDeleteImageModalOpen}
        onConfirm={handleDeleteImageConfirm}
        title="Delete Image"
        description={
          imageToDelete 
            ? `Are you sure you want to delete the image "${imageToDelete.name}"? This action cannot be undone.`
            : ''
        }
        isLoading={deleteImageMutation.isPending}
      />

    </div>
  );
};

export default Dashboard;