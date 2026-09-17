export const statusToPtBR = {
  'Monday': 'Segunda-feira',
  'Tuesday': 'Terça-feira',
  'Wednesday': 'Quarta-feira',
  'Thursday': 'Quinta-feira',
  'Friday': 'Sexta-feira',
  'Saturday': 'Sábado',
  'Sunday': 'Domingo',
  'weekly': 'Semanal',
  'once': 'Única vez',
  'Disponível': 'Disponível',
  'Reservado': 'Reservado',
  'Ocupado': 'Ocupado'
};

export const useTranslation = () => {
  return {
    t: (key) => {
      const map = {
        'schedules.title': 'Horários',
        'schedules.subtitle': 'Gerencie seus horários disponíveis',
        'schedules.add': 'Adicionar Horário',
        'schedules.dayOfWeek': 'Dia da Semana',
        'schedules.startTime': 'Hora de Início',
        'schedules.endTime': 'Hora de Término',
        'schedules.recurrence': 'Recorrência',
        'schedules.status': 'Status',
        'schedules.classType': 'Tipo de Aula (Ex: Yoga, Musculação)',
        'schedules.availableSlots': 'Vagas Disponíveis',
        'schedules.price': 'Preço por Aula (R$)',
        'schedules.isActive': 'Horário Ativo',
        'schedules.empty': 'Nenhum horário cadastrado',
        'schedules.emptySub': 'Comece adicionando seus horários de disponibilidade',
        'schedules.viewGrid': 'Grade',
        'schedules.viewCalendar': 'Calendário',
        'action.edit': 'Editar',
        'action.delete': 'Excluir',
        'action.cancel': 'Cancelar',
        'action.create': 'Criar',
        'action.update': 'Atualizar',
        'action.confirmDelete': 'Tem certeza que deseja excluir?',
        'recurrence.weekly': 'Semanal',
        'recurrence.once': 'Única vez',
        'schedules.created': 'Horário criado com sucesso!',
        'schedules.updated': 'Horário atualizado com sucesso!',
        'schedules.deleted': 'Horário excluído com sucesso!',
        'schedules.errorLoad': 'Erro ao carregar horários',
      };
      return map[key] || statusToPtBR[key] || key;
    }
  };
};

export const formatTime = (timeString) => {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':');
  if (!hours || !minutes) return timeString;
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const formattedHours = h % 12 || 12;
  return `${formattedHours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
};

export const formatTimeRange = (startTime, endTime) => {
  if (!startTime || !endTime) return '';
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
};

export const getDayOfWeekName = (dayInput) => {
  if (typeof dayInput === 'string' && isNaN(Number(dayInput))) {
    return dayInput;
  }
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[Number(dayInput)] || '';
};

export const formatCurrency = (amount, currency = 'BRL') => {
  if (amount === null || amount === undefined || isNaN(Number(amount))) return '';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency,
  }).format(Number(amount));
};

export const formatDate = (date, format = 'DD/MM/YYYY') => {
  if (!date) return '';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    
    if (format === 'DD/MM/YYYY') {
      return `${day}/${month}/${year}`;
    }
    
    return `${day}/${month}/${year}`;
  } catch (e) {
    return '';
  }
};