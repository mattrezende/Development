
export const validateCPF = (cpf) => {
  if (!cpf) return { isValid: true, error: null };
  const clean = cpf.replace(/\D/g, '');
  if (clean.length > 0 && clean.length !== 11) {
    return { isValid: false, error: 'invalid_cpf' };
  }
  return { isValid: true, error: null };
};

export const validatePhone = (phone) => {
  if (!phone) return { isValid: true, error: null };
  const clean = phone.replace(/\D/g, '');
  if (clean.length > 0 && clean.length < 10) {
    return { isValid: false, error: 'invalid_phone' };
  }
  return { isValid: true, error: null };
};

export const validateCEP = (cep) => {
  if (!cep) return { isValid: true, error: null };
  const clean = cep.replace(/\D/g, '');
  if (clean.length > 0 && clean.length !== 8) {
    return { isValid: false, error: 'invalid_cep' };
  }
  return { isValid: true, error: null };
};

export const validateEmail = (email) => {
  if (!email) return { isValid: true, error: null };
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) {
    return { isValid: false, error: 'invalid_email' };
  }
  return { isValid: true, error: null };
};

export const validateBirthDate = (date) => {
  if (!date) return { isValid: true, error: null };
  const selectedDate = new Date(date);
  const today = new Date();
  if (selectedDate > today) {
    return { isValid: false, error: 'invalid_date' };
  }
  return { isValid: true, error: null };
};
