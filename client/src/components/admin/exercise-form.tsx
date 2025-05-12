import React, { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { EXERCISE_TYPES } from '@/lib/constants';
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
import { Textarea } from '@/components/ui/textarea';

// Schema for the form
const exerciseFormSchema = z.object({
  question: z.string().min(1, 'Pergunta é obrigatória'),
  type: z.enum([EXERCISE_TYPES.MULTIPLE_CHOICE, EXERCISE_TYPES.FILL_BLANK, EXERCISE_TYPES.AUDIO]),
  options: z.array(
    z.object({
      text: z.string().min(1, 'Texto da opção é obrigatório'),
      isCorrect: z.boolean(),
    })
  ).min(2, 'Adicione pelo menos 2 opções'),
  levelId: z.number().int().positive('Nível é obrigatório'),
  correctAnswer: z.string().optional(),
  audioFile: z.any().optional(),
  audioUrl: z.string().optional(),
});

type ExerciseFormValues = z.infer<typeof exerciseFormSchema>;

interface ExerciseFormProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseId?: number;
}

const ExerciseForm: React.FC<ExerciseFormProps> = ({ isOpen, onClose, exerciseId }) => {
  const { toast } = useToast();
  const isEditMode = !!exerciseId;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { data: exerciseData, isLoading: isExerciseLoading } = useQuery({
    queryKey: ['/api/admin/exercises', exerciseId],
    enabled: isOpen && isEditMode,
  });
  
  const { data: levels = [] } = useQuery({
    queryKey: ['/api/admin/levels'],
    enabled: isOpen,
  });
  
  const form = useForm<ExerciseFormValues>({
    resolver: zodResolver(exerciseFormSchema),
    defaultValues: {
      question: '',
      type: EXERCISE_TYPES.MULTIPLE_CHOICE,
      options: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ],
      levelId: 0,
      correctAnswer: '',
      audioUrl: '',
    },
  });
  
  // Update form values when exercise data is loaded
  React.useEffect(() => {
    if (exerciseData) {
      form.reset({
        question: exerciseData.question,
        type: exerciseData.type,
        options: exerciseData.options || [
          { text: '', isCorrect: true },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
        ],
        levelId: exerciseData.levelId,
        correctAnswer: exerciseData.correctAnswer || '',
        audioUrl: exerciseData.audioUrl || '',
      });
    }
  }, [exerciseData, form]);
  
  const onSubmit = async (data: ExerciseFormValues) => {
    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('question', data.question);
      formData.append('type', data.type);
      formData.append('options', JSON.stringify(data.options));
      formData.append('levelId', data.levelId.toString());
      
      if (data.correctAnswer) {
        formData.append('correctAnswer', data.correctAnswer);
      }
      
      if (data.type === EXERCISE_TYPES.AUDIO && data.audioFile) {
        formData.append('audioFile', data.audioFile);
      } else if (data.audioUrl) {
        formData.append('audioUrl', data.audioUrl);
      }
      
      if (isEditMode) {
        await fetch(`/api/admin/exercises/${exerciseId}`, {
          method: 'PATCH',
          body: formData,
          credentials: 'include',
        });
        
        toast({
          title: 'Exercício atualizado',
          description: 'O exercício foi atualizado com sucesso',
        });
      } else {
        await fetch('/api/admin/exercises', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });
        
        toast({
          title: 'Exercício criado',
          description: 'O exercício foi criado com sucesso',
        });
      }
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['/api/admin/exercises'] });
      onClose();
      form.reset();
    } catch (error) {
      console.error('Erro ao salvar exercício:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao salvar o exercício',
        variant: 'destructive',
      });
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue('audioFile', file);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Editar Exercício' : 'Novo Exercício'}
          </DialogTitle>
        </DialogHeader>
        
        {isExerciseLoading && isEditMode ? (
          <div className="flex justify-center p-4">
            Carregando...
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pergunta</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Texto da pergunta" 
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={EXERCISE_TYPES.MULTIPLE_CHOICE}>Múltipla Escolha</SelectItem>
                        <SelectItem value={EXERCISE_TYPES.FILL_BLANK}>Preencher Lacuna</SelectItem>
                        <SelectItem value={EXERCISE_TYPES.AUDIO}>Áudio</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="levelId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nível</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um nível" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {levels.map((level: any) => (
                          <SelectItem key={level.id} value={level.id.toString()}>
                            {level.name} (Trilha: {level.trailName})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {form.watch('type') === EXERCISE_TYPES.FILL_BLANK && (
                <FormField
                  control={form.control}
                  name="correctAnswer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resposta Correta</FormLabel>
                      <FormControl>
                        <Input placeholder="Resposta correta" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {form.watch('type') === EXERCISE_TYPES.AUDIO && (
                <>
                  <FormField
                    control={form.control}
                    name="audioUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL do Áudio</FormLabel>
                        <FormControl>
                          <Input placeholder="audio-exemplo.mp3" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-2">
                    <FormLabel>Ou envie um arquivo de áudio</FormLabel>
                    <Input
                      type="file"
                      accept=".mp3,audio/*"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                    />
                  </div>
                </>
              )}
              
              {/* Options */}
              <div className="space-y-4">
                <h3 className="font-medium">Opções</h3>
                {form.watch('options').map((_, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="flex-1">
                      <FormField
                        control={form.control}
                        name={`options.${index}.text`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder={`Opção ${index + 1}`} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex items-center pt-2">
                      <FormField
                        control={form.control}
                        name={`options.${index}.isCorrect`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <input
                                type="radio"
                                checked={field.value}
                                onChange={() => {
                                  // Set all options to false
                                  const options = [...form.getValues('options')];
                                  options.forEach((_, i) => {
                                    form.setValue(`options.${i}.isCorrect`, i === index);
                                  });
                                }}
                                className="w-4 h-4"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <span className="ml-2 text-sm">Correta</span>
                    </div>
                  </div>
                ))}
              </div>
              
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

export default ExerciseForm;
