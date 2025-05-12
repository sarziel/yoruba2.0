import React from 'react';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface GPayButtonProps {
  amount: number;
  buttonType?: 'buy' | 'checkout' | 'donate' | 'order' | 'pay' | 'plain' | 'subscribe';
  buttonText?: string;
  onSuccess?: () => void;
}

const GPayButton: React.FC<GPayButtonProps> = ({ 
  amount, 
  buttonType = 'buy', 
  buttonText = 'Pagar com Google Pay',
  onSuccess
}) => {
  const { toast } = useToast();
  
  const handlePaymentSuccess = async (paymentToken: string) => {
    try {
      await apiRequest('POST', '/api/shop/purchase', {
        paymentMethod: 'GOOGLE_PAY',
        amount,
        paymentToken
      });
      
      // Invalidate user data to update diamonds balance
      queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
      
      toast({
        title: 'Compra realizada',
        description: 'Sua compra foi processada com sucesso!',
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast({
        title: 'Erro no pagamento',
        description: 'Ocorreu um erro ao processar seu pagamento.',
        variant: 'destructive',
      });
    }
  };
  
  // In a real implementation, we would use the real @google-pay/button-react component
  // For the purposes of this mockup, we're using a styled button
  return (
    <button 
      className="w-full bg-black text-white py-3 px-4 rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors"
      onClick={() => {
        // Mock payment process
        // In a real implementation, this would be handled by Google Pay
        if (confirm('Simular uma transação com Google Pay?')) {
          handlePaymentSuccess('mock-payment-token');
        }
      }}
    >
      <span className="material-icons mr-2">payments</span>
      {buttonText}
    </button>
  );
};

export default GPayButton;
