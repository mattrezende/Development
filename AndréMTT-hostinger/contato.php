<?php $active = 'contato'; ?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Agende sua Aula Experimental de Muay Thai em Brasília | Personal Fight</title>
<meta name="description" content="Fale com o professor André Luis e agende sua aula experimental de Muay Thai em Brasília. Preencha nome e WhatsApp, respondo pessoalmente.">
<link rel="icon" href="assets/favicon.png">
<meta name="theme-color" content="#0a0a0b">
<meta property="og:type" content="website">
<meta property="og:title" content="Agende sua Aula Experimental | Personal Fight Brasília">
<meta property="og:description" content="Preencha nome e WhatsApp e agende sua aula experimental de Muay Thai em Brasília.">
<meta property="og:image" content="assets/og-image.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Barlow+Condensed:wght@600;700&family=Barlow:wght@400;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/style.css">
<script src="assets/site.js"></script>
</head>
<body>
<div style="background:#0a0a0b;font-family:'Barlow',sans-serif;color:#e8e8ea;overflow-x:hidden;">
  <?php include __DIR__ . '/partials/header.php'; ?>

  <section style="position:relative;padding:80px clamp(24px,5vw,88px) 60px;background:radial-gradient(1000px 500px at 20% 0%,rgba(232,18,124,0.16),transparent 60%),#0a0a0b;text-align:center;border-bottom:1px solid rgba(255,255,255,0.05);">
    <div style="font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;font-size:15px;color:#E8127C;margin-bottom:18px;">Bora treinar</div>
    <h1 class="ct-h1" style="font-family:'Anton',sans-serif;font-weight:400;font-size:clamp(46px,6.5vw,84px);line-height:0.92;text-transform:uppercase;margin:0;color:#fff;">Agende sua<br><span style="color:#E8127C;">aula experimental</span></h1>
    <p style="max-width:620px;margin:24px auto 0;font-size:19px;line-height:1.6;color:#b9b9bd;">Preencha os dados e envie direto para o meu WhatsApp, respondo pessoalmente.</p>
  </section>

  <section style="padding:72px clamp(24px,5vw,88px);background:#0a0a0b;">
    <div class="ct-split" style="max-width:1180px;margin:0 auto;display:grid;grid-template-columns:1.1fr 0.9fr;gap:48px;align-items:start;">
      <form id="contato-form" class="reveal" style="background:#141416;border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:36px;">
        <div style="display:flex;flex-direction:column;gap:18px;">
          <div>
            <label style="display:block;font-family:'Barlow Condensed',sans-serif;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;font-size:14px;color:#c7c7cc;margin-bottom:8px;">Seu nome</label>
            <input class="ct-input" name="nome" type="text" placeholder="Como quer ser chamada(o)" required />
          </div>
          <div>
            <label style="display:block;font-family:'Barlow Condensed',sans-serif;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;font-size:14px;color:#c7c7cc;margin-bottom:8px;">WhatsApp / telefone</label>
            <input class="ct-input" name="telefone" type="tel" inputmode="tel" placeholder="(00) 00000-0000" required />
          </div>
          <div>
            <label style="display:block;font-family:'Barlow Condensed',sans-serif;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;font-size:14px;color:#c7c7cc;margin-bottom:8px;">Plano de interesse</label>
            <select class="ct-input" name="modelo">
              <option style="background:#141416;color:#fff;">Personal Individual</option>
              <option style="background:#141416;color:#fff;">Personal Group</option>
              <option style="background:#141416;color:#fff;">Small Group</option>
            </select>
          </div>
          <div>
            <label style="display:block;font-family:'Barlow Condensed',sans-serif;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;font-size:14px;color:#c7c7cc;margin-bottom:10px;">Seu objetivo <span style="text-transform:none;letter-spacing:0;color:#9f9fa4;">(opcional, marque quantos quiser)</span></label>
            <div style="display:flex;flex-wrap:wrap;gap:9px;">
              <label class="hv-border" style="display:inline-flex;align-items:center;gap:8px;background:#0e0e10;border:1px solid rgba(255,255,255,0.14);border-radius:999px;padding:9px 15px;cursor:pointer;font-size:14.5px;color:#e0e0e3;white-space:nowrap;">
                <input type="checkbox" name="objetivo" value="Emagrecimento" style="width:16px;height:16px;accent-color:#E8127C;flex-shrink:0;cursor:pointer;" />
                Emagrecimento
              </label>
              <label class="hv-border" style="display:inline-flex;align-items:center;gap:8px;background:#0e0e10;border:1px solid rgba(255,255,255,0.14);border-radius:999px;padding:9px 15px;cursor:pointer;font-size:14.5px;color:#e0e0e3;white-space:nowrap;">
                <input type="checkbox" name="objetivo" value="Condicionamento físico" style="width:16px;height:16px;accent-color:#E8127C;flex-shrink:0;cursor:pointer;" />
                Condicionamento físico
              </label>
              <label class="hv-border" style="display:inline-flex;align-items:center;gap:8px;background:#0e0e10;border:1px solid rgba(255,255,255,0.14);border-radius:999px;padding:9px 15px;cursor:pointer;font-size:14.5px;color:#e0e0e3;white-space:nowrap;">
                <input type="checkbox" name="objetivo" value="Defesa pessoal" style="width:16px;height:16px;accent-color:#E8127C;flex-shrink:0;cursor:pointer;" />
                Defesa pessoal
              </label>
              <label class="hv-border" style="display:inline-flex;align-items:center;gap:8px;background:#0e0e10;border:1px solid rgba(255,255,255,0.14);border-radius:999px;padding:9px 15px;cursor:pointer;font-size:14.5px;color:#e0e0e3;white-space:nowrap;">
                <input type="checkbox" name="objetivo" value="Aliviar o estresse" style="width:16px;height:16px;accent-color:#E8127C;flex-shrink:0;cursor:pointer;" />
                Aliviar o estresse
              </label>
              <label class="hv-border" style="display:inline-flex;align-items:center;gap:8px;background:#0e0e10;border:1px solid rgba(255,255,255,0.14);border-radius:999px;padding:9px 15px;cursor:pointer;font-size:14.5px;color:#e0e0e3;white-space:nowrap;">
                <input type="checkbox" name="objetivo" value="Aprender a arte marcial" style="width:16px;height:16px;accent-color:#E8127C;flex-shrink:0;cursor:pointer;" />
                Aprender a arte marcial
              </label>
              <label class="hv-border" style="display:inline-flex;align-items:center;gap:8px;background:#0e0e10;border:1px solid rgba(255,255,255,0.14);border-radius:999px;padding:9px 15px;cursor:pointer;font-size:14.5px;color:#e0e0e3;white-space:nowrap;">
                <input type="checkbox" name="objetivo" value="Outros" style="width:16px;height:16px;accent-color:#E8127C;flex-shrink:0;cursor:pointer;" />
                Outros
              </label>
            </div>
            <input class="ct-input" name="outros" type="text" placeholder='Se marcou &quot;Outros&quot;, conte qual é o seu objetivo' style="margin-top:10px;" />
          </div>
          <button type="submit" class="hv-brighten" style="display:inline-flex;align-items:center;justify-content:center;gap:10px;font-family:'Barlow Condensed',sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;font-size:19px;color:#fff;border:none;cursor:pointer;background:linear-gradient(180deg,#E8127C,#A8095A);padding:16px 30px;border-radius:10px;box-shadow:0 10px 30px rgba(232,18,124,0.4);">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M17.5 14.4c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35zM12 2C6.48 2 2 6.48 2 12c0 1.77.46 3.42 1.27 4.86L2 22l5.25-1.38A9.94 9.94 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/></svg>
            Enviar pelo WhatsApp
          </button>
          <p style="font-size:13px;color:#9f9fa4;margin:2px 0 0;text-align:center;">Ao enviar, abre uma conversa no WhatsApp com seus dados preenchidos.</p>
          <div data-sent-msg style="display:none;align-items:center;gap:10px;justify-content:center;background:rgba(232,18,124,0.12);border:1px solid rgba(232,18,124,0.4);border-radius:10px;padding:12px 16px;font-size:14.5px;color:#fff;">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#E8127C" stroke-width="2.4" aria-hidden="true"><path d="m5 13 4 4L19 7"/></svg>
            Abrimos o WhatsApp com seus dados. Se não abriu, toque em enviar novamente.
          </div>
        </div>
      </form>

      <div style="display:flex;flex-direction:column;gap:16px;">
        <a href="https://wa.me/5561996085008?text=Ol%C3%A1%20Andr%C3%A9!%20Estava%20no%20seu%20site%20e%20quero%20agendar%20minha%20aula%20experimental%20de%20Muay%20Thai." target="_blank" rel="noopener" class="reveal card-neon" style="text-decoration:none;display:flex;align-items:center;gap:16px;background:#141416;border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:22px 24px;">
          <div style="width:48px;height:48px;flex-shrink:0;border-radius:12px;background:rgba(232,18,124,0.14);color:#E8127C;display:flex;align-items:center;justify-content:center;">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M17.5 14.4c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35zM12 2C6.48 2 2 6.48 2 12c0 1.77.46 3.42 1.27 4.86L2 22l5.25-1.38A9.94 9.94 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/></svg>
          </div>
          <div>
            <div style="font-family:'Barlow Condensed',sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#fff;font-size:17px;">WhatsApp</div>
            <div style="color:#9a9a9e;font-size:15px;">(61) 99608-5008</div>
          </div>
        </a>
        <a href="mailto:andreluis.personalfight@gmail.com" class="reveal card-neon" style="text-decoration:none;display:flex;align-items:center;gap:16px;background:#141416;border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:22px 24px;">
          <div style="width:48px;height:48px;flex-shrink:0;border-radius:12px;background:rgba(232,18,124,0.14);color:#E8127C;display:flex;align-items:center;justify-content:center;">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
          </div>
          <div>
            <div style="font-family:'Barlow Condensed',sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#fff;font-size:17px;">E-mail</div>
            <div style="color:#9a9a9e;font-size:15px;word-break:break-all;">andreluis.personalfight@gmail.com</div>
          </div>
        </a>
        <a href="https://www.instagram.com/andre_personalfight/" target="_blank" rel="noopener" class="reveal card-neon" style="text-decoration:none;display:flex;align-items:center;gap:16px;background:#141416;border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:22px 24px;">
          <div style="width:48px;height:48px;flex-shrink:0;border-radius:12px;background:rgba(232,18,124,0.14);color:#E8127C;display:flex;align-items:center;justify-content:center;">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><line x1="17.5" y1="6.5" x2="17.5" y2="6.5"/></svg>
          </div>
          <div>
            <div style="font-family:'Barlow Condensed',sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#fff;font-size:17px;">Instagram</div>
            <div style="color:#9a9a9e;font-size:15px;">@andre_personalfight</div>
          </div>
        </a>
        <div class="reveal card-neon" style="display:flex;align-items:center;gap:16px;background:linear-gradient(160deg,#1C0411,#141416);border:1px solid rgba(232,18,124,0.3);border-radius:14px;padding:22px 24px;">
          <div style="width:48px;height:48px;flex-shrink:0;border-radius:12px;background:rgba(232,18,124,0.14);color:#E8127C;display:flex;align-items:center;justify-content:center;">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-5-7-11a7 7 0 0 1 14 0c0 6-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>
          </div>
          <div>
            <div style="font-family:'Barlow Condensed',sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#fff;font-size:17px;">Atendimento a domicílio</div>
            <div style="color:#9a9a9e;font-size:15px;">Aulas na sua casa ou condomínio</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <?php include __DIR__ . '/partials/footer.php'; ?>
</div>
<script src="assets/main.js"></script>
</body>
</html>
