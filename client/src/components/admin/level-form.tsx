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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Schema for the form
const levelFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  color: z.enum(['AMARELO', 'AZUL', 'VERDE', 'DOURADO']),
  xp: z.number().int().positive('XP deve ser um número positivo'),
  trailId: z.number().int().positive('Trilha é obrigatória'),
  order: z.number().int().positive('Ordem deve ser um número positivo'),
});

type LevelFormValues = z.infer<typeof levelFormSchema>;

interface LevelFormProps {
  isOpen: boolean;
  onClose: () => void;
  levelId?: number;
}

const LevelForm: React.FC<LevelFormProps> = ({ isOpen, onClose, levelId }) => {
  const { toast } = useToast();
  const isEditMode = !!levelId;
  
  const { data: levelData, isLoading: isLevelLoading } = useQuery({
    queryKey: ['/api/admin/levels', levelId],
    enabled: isOpen && isEditMode,
  });
  
  const { data: trails = [] } = useQuery({
    queryKey: ['/api/admin/trails'],
    enabled: isOpen,
  });
  
  const form = useForm<LevelFormValues>({
    resolver: zodResolver(levelFormSchema),
    defaultValues: {
      name: '',
      color: 'AMARELO',
      xp: 10,
      trailId: 0,
      order: 1,
    },
  });
  
  // Update form values when level data is loaded
  React.useEffect(() => {
    if (levelData) {
      form.reset({
        name: levelData.name,
        color: levelData.color,
        xp: levelData.xp,
        trailId: levelData.trailId,
        order: levelData.order,
      });
    }
  }, [levelData, form]);
  
  const onSubmit = async (data: LevelFormValues) => {
    try {
      if (isEditMode) {
        await apiRequest('PATCH', `/api/admin/levels/${levelId}`, data);
        toast({
          title: 'Nível atualizado',
          description: 'O nível foi atualizado com sucesso',
        });
      } else {
        await apiRequest('POST', '/api/admin/levels', data);
        toast({
          title: 'Nível criado',
          description: 'O nível foi criado com sucesso',
        });
      }
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['/api/admin/levels'] });
      onClose();
      form.reset();
    } catch (error) {
      console.error('Erro ao salvar nível:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao salvar o nível',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Editar Nível' : 'Novo Nível'}
          </DialogTitle>
        </DialogHeader>
        
        {isLevelLoading && isEditMode ? (
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
                      <Input placeholder="Nome do nível" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma cor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="AMARELO">Amarelo</SelectItem>
                        <SelectItem value="AZUL">Azul</SelectItem>
                        <SelectItem value="VERDE">Verde</SelectItem>
                        <SelectItem value="DOURADO">Dourado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="xp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>XP</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="XP do nível" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 10)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="trailId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trilha</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma trilha" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {trails.map((trail: any) => (
                          <SelectItem key={trail.id} value={trail.id.toString()}>
                            {trail.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                        placeholder="Ordem do nível" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
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

export default LevelForm;
