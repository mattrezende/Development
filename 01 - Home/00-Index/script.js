console.log ("chamou?")

document.addEventListener('DOMContentLoaded', () => {

  // Botão de scroll
  const botaoScroll = document.querySelector('.btn');
  const destino = document.querySelector('#projetos');

  if (botaoScroll && destino) {
    botaoScroll.addEventListener('click', () => {
      destino.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Botão WhatsApp
  const btnWhatsapp = document.getElementById('btnWhatsapp');

  if (btnWhatsapp) {
    btnWhatsapp.addEventListener('click', () => {
      window.open('https://wa.me/5561982332211', '_blank');
    });
  } else {
    console.error('Botão btnWhatsapp não encontrado');
  }

});

console.log ("chamou de novo?") 