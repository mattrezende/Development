import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const MandatoryCheckboxes = ({ agreements, setAgreements, onOpenTerms, termsExist, hasAttemptedSubmit }) => {
  
  const showError = hasAttemptedSubmit && (!agreements.noHealthIssues || !agreements.acceptedTerms);

  return (
    <div className="space-y-4 pt-6 border-t border-border">
      <h3 className="font-semibold text-lg">Acordos Obrigatórios</h3>
      
      <div className="space-y-3 bg-muted/30 p-5 rounded-xl border border-border/50">
        <div className="flex items-start space-x-3">
          <Checkbox 
            id="noHealthIssues" 
            checked={agreements.noHealthIssues}
            onCheckedChange={(checked) => setAgreements(prev => ({ ...prev, noHealthIssues: checked }))}
            className={`mt-1 ${hasAttemptedSubmit && !agreements.noHealthIssues ? 'border-destructive ring-1 ring-destructive' : ''}`}
          />
          <Label 
            htmlFor="noHealthIssues" 
            className="text-sm font-medium leading-tight cursor-pointer text-foreground/90"
          >
            Declaro que não conheço nenhum motivo que me impeça de executar as aulas contratadas.
          </Label>
        </div>

        <div className="flex items-start space-x-3">
          <Checkbox 
            id="acceptedTerms" 
            checked={agreements.acceptedTerms}
            onCheckedChange={(checked) => setAgreements(prev => ({ ...prev, acceptedTerms: checked }))}
            className={`mt-1 ${hasAttemptedSubmit && !agreements.acceptedTerms ? 'border-destructive ring-1 ring-destructive' : ''}`}
          />
          <div className="text-sm font-medium leading-tight text-foreground/90">
            <Label htmlFor="acceptedTerms" className="cursor-pointer inline">
              Declaro que estou ciente dos{' '}
            </Label>
            {termsExist ? (
              <button 
                type="button" 
                onClick={onOpenTerms}
                className="text-primary hover:underline font-semibold"
              >
                termos e condições
              </button>
            ) : (
              <span className="font-semibold">termos e condições</span>
            )}
            <Label htmlFor="acceptedTerms" className="cursor-pointer inline">
              {' '}estabelecidos pelo professor.
            </Label>
          </div>
        </div>
      </div>

      {showError && (
        <p className="text-sm text-destructive font-medium">
          Você deve aceitar todos os acordos para prosseguir.
        </p>
      )}
    </div>
  );
};

export default MandatoryCheckboxes;