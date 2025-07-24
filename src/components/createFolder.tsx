import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useEffect } from 'react';

const schema = z.object({
  name: z.string()
    .min(1, 'Folder name is required')
    .max(50, 'Folder name must be less than 50 characters')
    .regex(/^[^/\\:*?"<>|]+$/, 'Folder name contains invalid characters'),
  parentFolder: z.string().nullable().optional(),
});

type FormData = z.infer<typeof schema>;

interface CreateFolderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentFolderId: string | null;
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
}

const CreateFolderModal = ({
  open,
  onOpenChange,
  parentFolderId,
  onSubmit,
  isLoading,
}: CreateFolderModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      parentFolder: null,
    },
  });

  useEffect(() => {
    setValue('parentFolder', parentFolderId);
  }, [parentFolderId, setValue]);

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const handleFormSubmit = handleSubmit((data) => {
    onSubmit(data);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Create New Folder
            {parentFolderId && (
              <span className="text-sm font-normal text-gray-500 block mt-1">
                in selected folder
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Folder Name</Label>
            <Input
              id="name"
              placeholder="Enter folder name"
              {...register('name')}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Folder'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFolderModal;