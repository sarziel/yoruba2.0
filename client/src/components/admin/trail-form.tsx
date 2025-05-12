import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Schema for the form
const trailFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  theme: z.string().min(1, 'Tema é obrigatório'),
  order: z.number().int().positive('Ordem deve ser um número positivo'),
  isActive: z.boolean().default(true),
});

type TrailFormValues = z.infer<typeof trailFormSchema>;

interface TrailFormProps {
  isOpen: boolean;
  onClose: () => void;
  trailId?: number;
}

const TrailForm: React.FC<TrailFormProps> = ({ isOpen, onClose, trailId }) => {
  const { toast } = useToast();
  const isEditMode = !!trailId;
  
  const { data: trailData, isLoading } = useQuery({
    queryKey: ['/api/admin/trails', trailId],
    enabled: isOpen && isEditMode,
  });
  
  const form = useForm<TrailFormValues>({
    resolver: zodResolver(trailFormSchema),
    defaultValues: {
      name: '',
      theme: '',
      order: 1,
      isActive: true,
    },
  });
  
  // Update form values when trail data is loaded
  React.useEffect(() => {
    if (trailData) {
      form.reset({
        name: trailData.name,
        theme: trailData.theme,
        order: trailData.order,
        isActive: trailData.isActive,
      });
    }
  }, [trailData, form]);
  
  const onSubmit = async (data: TrailFormValues) => {
    try {
      if (isEditMode) {
        await apiRequest('PATCH', `/api/admin/trails/${trailId}`, data);
        toast({
          title: 'Trilha atualizada',
          description: 'A trilha foi atualizada com sucesso',
        });
      } else {
        await apiRequest('POST', '/api/admin/trails', data);
        toast({
          title: 'Trilha criada',
          description: 'A trilha foi criada com sucesso',
        });
      }
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['/api/admin/trails'] });
      onClose();
      form.reset();
    } catch (error) {
      console.error('Erro ao salvar trilha:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao salvar a trilha',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Editar Trilha' : 'Nova Trilha'}
          </DialogTitle>
        </DialogHeader>
        
        {isLoading && isEditMode ? (
          <div className="flex justify-center p-4">
            Carregando...
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da trilha" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="theme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tema</FormLabel>
                    <FormControl>
                      <Input placeholder="Tema da trilha" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ordem</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Ordem da trilha" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="w-4 h-4"
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">
                      Trilha ativa
                    </FormLabel>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {isEditMode ? 'Atualizar' : 'Criar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TrailForm;
