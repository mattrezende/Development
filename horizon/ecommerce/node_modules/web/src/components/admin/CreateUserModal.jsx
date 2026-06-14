
import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, AlertCircle } from 'lucide-react';

const CreateUserModal = ({ isOpen, onClose, onSuccess }) => {
  const initialFormState = {
    name: '',
    email: '',
    password: '',
    role: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormState);
      setErrors({});
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleRoleChange = (value) => {
    setFormData(prev => ({ ...prev, role: value }));
    if (errors.role) {
      setErrors(prev => ({ ...prev, role: null }));
    }
  };

  const validateForm = async () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'O nome é obrigatório';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'O e-mail é obrigatório';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Formato de e-mail inválido';
    } else {
      // Check if email already exists
      try {
        await pb.collection('users').getFirstListItem(`email="${formData.email}"`, { $autoCancel: false });
        newErrors.email = 'Este e-mail já está em uso';
      } catch (error) {
        // 404 means email not found, which is what we want
        if (error.status !== 404) {
          console.error("Error checking email:", error);
        }
      }
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'A senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'A senha deve ter pelo menos 6 caracteres';
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = 'Selecione um papel para o usuário';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    const isValid = await validateForm();
    
    if (!isValid) {
      setIsSubmitting(false);
      return;
    }

    try {
      // PocketBase requires passwordConfirm when creating a user with password
      const userData = {
        ...formData,
        passwordConfirm: formData.password,
        emailVisibility: true,
      };

      await pb.collection('users').create(userData, { $autoCancel: false });
      onSuccess();
    } catch (error) {
      console.error("Error creating user:", error);
      setErrors({ 
        submit: error.response?.message || "Ocorreu um erro ao criar o usuário. Verifique se o papel selecionado é permitido pelo sistema." 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-[425px] rounded-xl shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">Novo Usuário</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para cadastrar um novo usuário no sistema.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {errors.submit && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{errors.submit}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name" className={errors.name ? "text-destructive" : ""}>Nome Completo *</Label>
            <Input
              id="name"
              name="name"
              placeholder="Ex: João da Silva"
              value={formData.name}
              onChange={handleInputChange}
              className={errors.name ? "border-destructive focus-visible:ring-destructive" : "bg-background"}
              disabled={isSubmitting}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className={errors.email ? "text-destructive" : ""}>E-mail *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="joao@exemplo.com"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? "border-destructive focus-visible:ring-destructive" : "bg-background"}
              disabled={isSubmitting}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className={errors.password ? "text-destructive" : ""}>Senha *</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              onChange={handleInputChange}
              className={errors.password ? "border-destructive focus-visible:ring-destructive" : "bg-background"}
              disabled={isSubmitting}
            />
            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className={errors.role ? "text-destructive" : ""}>Papel / Permissão *</Label>
            <Select 
              value={formData.role} 
              onValueChange={handleRoleChange}
              disabled={isSubmitting}
            >
              <SelectTrigger className={errors.role ? "border-destructive focus:ring-destructive" : "bg-background"}>
                <SelectValue placeholder="Selecione o papel do usuário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="gerente">Gerente</SelectItem>
                <SelectItem value="vendedor">Vendedor</SelectItem>
                <SelectItem value="client">Cliente</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && <p className="text-xs text-destructive">{errors.role}</p>}
            <p className="text-xs text-muted-foreground mt-1">
              Nota: O sistema atualmente suporta nativamente 'admin' e 'client'. Outros papéis podem requerer atualização do banco de dados.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Usuário'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserModal;
