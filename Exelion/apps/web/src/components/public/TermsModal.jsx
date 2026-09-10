import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';

const TermsModal = ({ open, onOpenChange, terms }) => {
  if (!terms) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight">Termos e Condições</DialogTitle>
          </div>
        </DialogHeader>

        <div className="p-6 overflow-y-auto flex-1">
          {terms.content_text ? (
            <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-foreground/90 leading-relaxed whitespace-pre-wrap">
              {terms.content_text}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Nenhum texto de termos fornecido.
            </div>
          )}
        </div>

        {terms.document_url && (
          <div className="p-6 border-t border-border bg-muted/10 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-semibold text-sm">Documento Anexado</span>
              <span className="text-xs text-muted-foreground">Baixe o documento completo em PDF/DOCX</span>
            </div>
            <Button variant="outline" size="sm" asChild className="shadow-sm">
              <a
                href={pb.files.getUrl(terms, terms.document_url)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar Documento
              </a>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TermsModal;