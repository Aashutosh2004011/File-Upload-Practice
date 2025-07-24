/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { uploadImage } from '../api/image';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useState } from 'react';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  image: z.instanceof(FileList).refine((files) => files.length > 0, 'Image is required'),
});

type FormData = z.infer<typeof schema>;

const ImageUploadModal = ({ 
  folderId, 
  selectedFolder 
}: { 
  folderId: string | null;
  selectedFolder: string | null;
}) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const formData = new FormData();
      formData.append('name', data.name);
      if (folderId) formData.append('folder', folderId);
      formData.append('image', data.image[0]);
      return uploadImage(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images'] });
      reset();
      setOpen(false);
      toast.success('Image uploaded successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to upload image');
    },
  });

  const handleUploadClick = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    
    if (!selectedFolder && !folderId) {
      toast.error('Please select a folder first');
      return; 
    }
    setOpen(true);
  };

  const onSubmit = handleSubmit((data) => {
    if (!selectedFolder && !folderId) {
      toast.error('Please select a folder first');
      return;
    }
    
    const loadingToast = toast.loading('Uploading image...');
    
    mutation.mutate(data, {
      onSettled: () => {
        toast.dismiss(loadingToast);
      }
    });
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div>
          <Button 
            onClick={handleUploadClick}
            type="button"
          >
            Upload Image
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload New Image</DialogTitle>
          {selectedFolder && (
            <p className="text-sm text-gray-500">
              Uploading to: {selectedFolder}
            </p>
          )}
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Image Name</Label>
            <Input id="name" {...register('name')} />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="image">Image File</Label>
            <Input 
              id="image" 
              type="file" 
              accept="image/*" 
              {...register('image')}
              onChange={(e) => {
                // Show preview or file name
                const file = e.target.files?.[0];
                if (file) {
                  toast.success(`Selected: ${file.name}`);
                }
              }}
            />
            {errors.image && (
              <p className="text-sm text-red-500">{errors.image.message}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={mutation.isPending} className="flex-1">
              {mutation.isPending ? 'Uploading...' : 'Upload'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ImageUploadModal;