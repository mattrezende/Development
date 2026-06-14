
import { useState } from 'react';

export const useCEPLookup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addressData, setAddressData] = useState(null);

  const fetchAddress = async (cep) => {
    if (!cep) return null;
    
    const cleanCEP = cep.replace(/[^\d]+/g, '');
    if (cleanCEP.length !== 8) {
      setError('CEP inválido. Deve conter 8 dígitos.');
      return null;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar CEP');
      }
      
      const data = await response.json();
      
      if (data.erro) {
        setError('CEP não encontrado.');
        setAddressData(null);
        return null;
      }
      
      const result = {
        address: data.logradouro,
        neighborhood: data.bairro,
        city: data.localidade,
        state: data.uf,
        complement: data.complemento
      };
      
      setAddressData(result);
      return result;
      
    } catch (err) {
      setError('Falha na conexão ao buscar o CEP. Tente novamente.');
      setAddressData(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { fetchAddress, addressData, loading, error };
};
