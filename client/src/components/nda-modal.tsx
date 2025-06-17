import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface NDAModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NDAModal({ isOpen, onClose }: NDAModalProps) {
  const { toast } = useToast();

  const handleAccept = () => {
    onClose();
    toast({
      title: "NDA Accepted",
      description: "Full access granted - quantum protocols activated",
    });
  };

  const handleDecline = () => {
    onClose();
    toast({
      title: "Access Restricted",
      description: "Some features may be limited without NDA acceptance",
      variant: "destructive",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">Non-Disclosure Agreement</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-slate-300">
            This Non-Disclosure Agreement ("Agreement") is entered into between RADOS Quantum Suite and the accessing party ("Recipient").
          </p>
          
          <div>
            <h3 className="text-white font-semibold mb-2">Confidential Information</h3>
            <p className="text-slate-300">
              All proprietary algorithms, AI models, quantum encryption methods, and source code accessed through this system are considered confidential and proprietary information.
            </p>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <i className="fas fa-exclamation-triangle text-yellow-400 mt-1"></i>
              <div className="text-sm text-slate-300">
                <strong>Warning:</strong> Unauthorized disclosure, copying, or distribution of any system components will result in immediate legal action and automatic system lockdown.
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-2">Terms & Conditions</h3>
            <ul className="text-slate-300 text-sm space-y-1 list-disc list-inside">
              <li>All accessed information must remain strictly confidential</li>
              <li>No screenshots, recordings, or copies permitted</li>
              <li>Biometric authentication required for sensitive operations</li>
              <li>Session logging and monitoring is active at all times</li>
              <li>Immediate termination upon any policy violation</li>
            </ul>
          </div>

          <div className="flex space-x-4 pt-4">
            <Button 
              onClick={handleAccept}
              className="flex-1 bg-accent hover:bg-accent/80 text-white"
            >
              Accept & Continue
            </Button>
            <Button 
              onClick={handleDecline}
              variant="destructive"
              className="flex-1"
            >
              Decline & Exit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
