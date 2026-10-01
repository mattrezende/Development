<?php $active = 'modelos'; ?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Planos e Valores, Muay Thai Personal e Small Group em Brasília | Personal Fight</title>
<meta name="description" content="Planos de Muay Thai em Brasília: Personal Individual, Personal Group e Small Group (turmas em Águas Claras, Guará, Samambaia e Asa Sul). Calcule o valor por pessoa e agende.">
<link rel="icon" href="assets/favicon.png">
<meta name="theme-color" content="#0a0a0b">
<meta property="og:type" content="website">
<meta property="og:title" content="Planos e Valores | Personal Fight Muay Thai Brasília">
<meta property="og:description" content="Do treino exclusivo à turma em pequeno grupo no seu bairro. Veja os valores e agende sua aula experimental.">
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

  <!-- HERO -->
  <section style="position:relative;padding:88px clamp(24px,5vw,88px);background:radial-gradient(1000px 500px at 20% 0%,rgba(232,18,124,0.16),transparent 60%),#0a0a0b;text-align:center;border-bottom:1px solid rgba(255,255,255,0.05);">
    <div style="font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;font-size:15px;color:#E8127C;margin-bottom:18px;">Planos e valores</div>
    <h1 class="md-h1" style="font-family:'Anton',sans-serif;font-weight:400;font-size:clamp(46px,6.5vw,88px);line-height:0.92;text-transform:uppercase;margin:0;color:#fff;">Escolha o seu<br><span style="color:#E8127C;">plano de treino</span></h1>
    <p style="max-width:640px;margin:26px auto 0;font-size:19px;line-height:1.6;color:#b9b9bd;">Do treino totalmente exclusivo à turma em pequeno grupo. Todos personalizados, todos com atenção de verdade.</p>
    <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-top:32px;">
      <a href="#individual" class="hv-chip" style="font-family:'Barlow Condensed',sans-serif;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;font-size:15px;color:#e8e8ea;text-decoration:none;background:#141416;border:1px solid rgba(255,255,255,0.14);border-radius:999px;padding:9px 18px;">Individual</a>
      <a href="#group" class="hv-chip" style="font-family:'Barlow Condensed',sans-serif;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;font-size:15px;color:#e8e8ea;text-decoration:none;background:#141416;border:1px solid rgba(255,255,255,0.14);border-radius:999px;padding:9px 18px;">Personal Group</a>
      <a href="#small-group" class="hv-chip" style="font-family:'Barlow Condensed',sans-serif;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;font-size:15px;color:#e8e8ea;text-decoration:none;background:#141416;border:1px solid rgba(255,255,255,0.14);border-radius:999px;padding:9px 18px;">Small Group</a>
    </div>
  </section>

  <!-- INDIVIDUAL (calculadora) -->
  <section id="individual" style="padding:88px clamp(24px,5vw,88px);background:#0e0e10;">
    <div style="max-width:1240px;margin:0 auto;">
      <div style="text-align:center;max-width:720px;margin:0 auto 44px;">
        <div style="display:inline-block;font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;font-size:13px;color:#fff;background:linear-gradient(180deg,#E8127C,#A8095A);padding:6px 14px;border-radius:6px;margin-bottom:18px;">Mais exclusivo</div>
        <h2 style="font-family:'Anton',sans-serif;font-weight:400;font-size:clamp(34px,4.4vw,52px);line-height:1;text-transform:uppercase;margin:0 0 16px;color:#fff;">Personal Individual</h2>
        <p style="font-size:17px;line-height:1.7;color:#b9b9bd;margin:0;">Só você e o professor. A experiência mais premium: exclusividade total, com <strong style="color:#fff;">local e horário definidos por você.</strong> Todo o foco, cada correção e cada minuto dedicados ao seu resultado.</p>
      </div>
      <div class="md-calc reveal" data-ind-calc style="display:grid;grid-template-columns:1fr 1fr;gap:22px;align-items:stretch;background:#141416;border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:34px;">
        <div style="text-align:center;display:flex;flex-direction:column;justify-content:center;">
          <div style="font-family:'Barlow Condensed',sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;font-size:15px;color:#fff;margin-bottom:12px;">Frequência semanal</div>
          <div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;">
            <button type="button" data-ind-freq="1">1x/sem</button>
            <button type="button" data-ind-freq="2">2x/sem</button>
            <button type="button" data-ind-freq="3">3x/sem</button>
            <button type="button" data-ind-freq="4">4x/sem</button>
            <button type="button" data-ind-freq="5">5x/sem</button>
          </div>
          <p style="font-size:14px;color:#9f9fa4;margin:26px 0 0;line-height:1.5;">*Aulas de 1 hora, frequência semanal fixa. Aula avulsa: <strong style="color:#fff;">R$ 100</strong> a hora/aula.</p>
        </div>
        <div style="background:linear-gradient(160deg,#FFE3F0,#FFCCE4);border:1px solid rgba(232,18,124,0.35);border-radius:14px;padding:34px;display:flex;flex-direction:column;justify-content:center;text-align:center;">
          <div style="font-family:'Barlow Condensed',sans-serif;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;font-size:14px;color:#A8095A;">Valor por mês</div>
          <div data-ind-price style="font-family:'Anton',sans-serif;font-size:clamp(44px,6vw,66px);color:#1C0411;line-height:1;margin:10px 0 6px;"></div>
          <div data-ind-summary style="font-size:14px;color:#6E0438;"></div>
          <div style="height:1px;background:rgba(168,9,90,0.18);margin:22px 0;"></div>
          <div style="font-size:14px;color:#6E0438;">Valor da aula: <strong data-ind-per-class style="color:#1C0411;"></strong></div>
          <a href="https://wa.me/5561996085008?text=Ol%C3%A1%20Andr%C3%A9!%20Estava%20no%20seu%20site%20e%20me%20interessei%20pelas%20aulas%20de%20Personal%20Individual." target="_blank" rel="noopener" class="hv-brighten" style="display:inline-flex;align-items:center;justify-content:center;gap:10px;font-family:'Barlow Condensed',sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;font-size:17px;color:#fff;text-decoration:none;background:linear-gradient(180deg,#E8127C,#A8095A);padding:14px 26px;border-radius:8px;margin-top:24px;">Quero esse plano</a>
        </div>
      </div>
    </div>
  </section>

  <!-- PERSONAL GROUP (calculadora) -->
  <section id="group" style="padding:88px clamp(24px,5vw,88px);background:#0a0a0b;">
    <div style="max-width:1240px;margin:0 auto;">
      <div style="text-align:center;max-width:720px;margin:0 auto 44px;">
        <div style="display:inline-block;font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;font-size:13px;color:#E8127C;border:1px solid rgba(232,18,124,0.5);padding:6px 14px;border-radius:6px;margin-bottom:18px;">Premium compartilhado</div>
        <h2 style="font-family:'Anton',sans-serif;font-weight:400;font-size:clamp(34px,4.4vw,52px);line-height:1;text-transform:uppercase;margin:0 0 16px;color:#fff;">Personal Group</h2>
        <p style="font-size:17px;line-height:1.7;color:#b9b9bd;margin:0;">Treine com quem <strong style="color:#fff;">você convida</strong>, só os próprios alunos podem trazer novas pessoas. A mesma exclusividade do individual, com local e horário definidos pelo grupo, por um valor mais acessível.</p>
      </div>
      <div class="md-calc reveal" data-pg-calc style="display:grid;grid-template-columns:1fr 1fr;gap:22px;align-items:stretch;background:#141416;border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:34px;">
        <div style="text-align:center;display:flex;flex-direction:column;justify-content:center;">
          <div style="font-family:'Barlow Condensed',sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;font-size:15px;color:#fff;margin-bottom:12px;">Frequência semanal</div>
          <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:26px;justify-content:center;">
            <button type="button" data-freq="1">1x/sem</button>
            <button type="button" data-freq="2">2x/sem</button>
            <button type="button" data-freq="3">3x/sem</button>
            <button type="button" data-freq="4">4x/sem</button>
            <button type="button" data-freq="5">5x/sem</button>
          </div>
          <div style="font-family:'Barlow Condensed',sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;font-size:15px;color:#fff;margin-bottom:12px;">Nº de alunos</div>
          <div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;">
            <button type="button" data-students="2">2 alunos</button>
            <button type="button" data-students="3">3 alunos</button>
            <button type="button" data-students="4">4 alunos</button>
            <button type="button" data-students="5">5 alunos</button>
          </div>
        </div>
        <div style="background:linear-gradient(160deg,#FFE3F0,#FFCCE4);border:1px solid rgba(232,18,124,0.35);border-radius:14px;padding:34px;display:flex;flex-direction:column;justify-content:center;text-align:center;">
          <div style="font-family:'Barlow Condensed',sans-serif;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;font-size:14px;color:#A8095A;">Valor por pessoa, por mês</div>
          <div data-pg-per-person style="font-family:'Anton',sans-serif;font-size:clamp(44px,6vw,66px);color:#1C0411;line-height:1;margin:10px 0 6px;"></div>
          <div data-pg-summary style="font-size:14px;color:#6E0438;"></div>
          <div style="height:1px;background:rgba(168,9,90,0.18);margin:22px 0;"></div>
          <div style="font-size:14px;color:#6E0438;">Total do grupo: <strong data-pg-total style="color:#1C0411;"></strong></div>
          <a href="https://wa.me/5561996085008?text=Ol%C3%A1%20Andr%C3%A9!%20Estava%20no%20seu%20site%20e%20me%20interessei%20pelo%20Personal%20Group." target="_blank" rel="noopener" class="hv-brighten" style="display:inline-flex;align-items:center;justify-content:center;gap:10px;font-family:'Barlow Condensed',sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;font-size:17px;color:#fff;text-decoration:none;background:linear-gradient(180deg,#E8127C,#A8095A);padding:14px 26px;border-radius:8px;margin-top:24px;">Montar meu grupo</a>
        </div>
      </div>
    </div>
  </section>

  <!-- SMALL GROUP (calculadora) -->
  <section id="small-group" style="padding:88px clamp(24px,5vw,88px);background:#0e0e10;">
    <div style="max-width:1240px;margin:0 auto;">
      <div style="text-align:center;max-width:760px;margin:0 auto 44px;">
        <div style="display:inline-block;font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;font-size:13px;color:#E8127C;border:1px solid rgba(232,18,124,0.5);padding:6px 14px;border-radius:6px;margin-bottom:18px;">Mais acessível</div>
        <h2 style="font-family:'Anton',sans-serif;font-weight:400;font-size:clamp(34px,4.4vw,52px);line-height:1;text-transform:uppercase;margin:0 0 16px;color:#fff;">Small Group</h2>
        <p style="font-size:17px;line-height:1.7;color:#b9b9bd;margin:0;">Aulas coletivas de <strong style="color:#fff;">até 4 pessoas</strong>, com locais e horários definidos pelo professor. Treino personalizado para o nível da turma e o jeito mais acessível de começar. <strong style="color:#fff;">Quanto mais alunos, menor o valor por pessoa.</strong></p>
      </div>
      <div class="md-calc reveal" data-sg-calc style="display:grid;grid-template-columns:1fr 1fr;gap:22px;align-items:stretch;background:#141416;border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:34px;max-width:900px;margin:0 auto;">
        <div style="text-align:center;display:flex;flex-direction:column;justify-content:center;">
          <div style="font-family:'Barlow Condensed',sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;font-size:15px;color:#fff;margin-bottom:12px;">Frequência semanal</div>
          <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:26px;justify-content:center;">
            <button type="button" data-sg-freq="1">1x/sem</button>
            <button type="button" data-sg-freq="2">2x/sem</button>
            <button type="button" data-sg-freq="3">3x/sem</button>
            <button type="button" data-sg-freq="4">4x/sem</button>
            <button type="button" data-sg-freq="5">5x/sem</button>
          </div>
          <div style="font-family:'Barlow Condensed',sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;font-size:15px;color:#fff;margin-bottom:12px;">Nº de alunos</div>
          <div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;">
            <button type="button" data-sg-students="2">2 alunos</button>
            <button type="button" data-sg-students="3">3 alunos</button>
            <button type="button" data-sg-students="4">4 alunos</button>
          </div>
        </div>
        <div style="background:linear-gradient(160deg,#FFE3F0,#FFCCE4);border:1px solid rgba(232,18,124,0.35);border-radius:14px;padding:34px;display:flex;flex-direction:column;justify-content:center;text-align:center;">
          <div style="font-family:'Barlow Condensed',sans-serif;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;font-size:14px;color:#A8095A;">Valor por pessoa, por mês</div>
          <div data-sg-per-person style="font-family:'Anton',sans-serif;font-size:clamp(44px,6vw,66px);color:#1C0411;line-height:1;margin:10px 0 6px;"></div>
          <div data-sg-summary style="font-size:14px;color:#6E0438;"></div>
          <div style="height:1px;background:rgba(168,9,90,0.18);margin:22px 0;"></div>
          <div style="font-size:14px;color:#6E0438;">Total da turma: <strong data-sg-total style="color:#1C0411;"></strong></div>
          <a href="https://wa.me/5561996085008?text=Ol%C3%A1%20Andr%C3%A9!%20Estava%20no%20seu%20site%20e%20me%20interessei%20pelo%20Small%20Group." target="_blank" rel="noopener" data-cta="small-group" class="hv-brighten" style="display:inline-flex;align-items:center;justify-content:center;gap:10px;font-family:'Barlow Condensed',sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;font-size:17px;color:#fff;text-decoration:none;background:linear-gradient(180deg,#E8127C,#A8095A);padding:14px 26px;border-radius:8px;margin-top:24px;">Entrar em uma turma</a>
        </div>
      </div>
      <p style="font-size:14px;color:#9f9fa4;margin:18px 0 30px;text-align:center;">*Valor por pessoa, mensal. Limite de 4 alunos por turma.</p>

      <div style="text-align:center;margin-bottom:16px;">
        <div style="font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;font-size:14px;color:#E8127C;">Turmas abertas agora</div>
      </div>
      <div class="sg-open" style="display:grid;grid-template-columns:1fr 1fr;gap:18px;max-width:820px;margin:0 auto;">
        <div class="reveal card-neon" style="display:flex;flex-direction:column;background:#141416;border:1px solid rgba(232,18,124,0.35);border-radius:16px;padding:26px 26px 28px;">
          <span style="align-self:flex-start;font-family:'Barlow Condensed',sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;font-size:12px;color:#fff;background:rgba(232,18,124,0.92);padding:5px 11px;border-radius:999px;margin-bottom:14px;">Vaga aberta</span>
          <h3 style="font-family:'Anton',sans-serif;font-weight:400;font-size:28px;text-transform:uppercase;color:#fff;margin:0 0 8px;line-height:1;">Águas Claras</h3>
          <div style="display:flex;align-items:center;gap:9px;font-size:16px;color:#c7c7cc;margin-bottom:22px;">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#E8127C" stroke-width="2" style="flex-shrink:0;" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
            Seg e Qua · 21h30
          </div>
          <a href="https://wa.me/5561996085008?text=Ol%C3%A1%20Andr%C3%A9!%20Estava%20no%20seu%20site%20e%20quero%20entrar%20no%20Small%20Group%20de%20%C3%81guas%20Claras." target="_blank" rel="noopener" data-cta="turma-aguas-claras" class="hv-brighten" style="margin-top:auto;display:inline-flex;align-items:center;justify-content:center;gap:9px;font-family:'Barlow Condensed',sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;font-size:16px;color:#fff;text-decoration:none;background:linear-gradient(180deg,#E8127C,#A8095A);padding:13px 20px;border-radius:8px;">Entrar nesta turma</a>
        </div>
        <div class="reveal card-neon" style="display:flex;flex-direction:column;background:#141416;border:1px solid rgba(232,18,124,0.35);border-radius:16px;padding:26px 26px 28px;">
          <span style="align-self:flex-start;font-family:'Barlow Condensed',sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;font-size:12px;color:#fff;background:rgba(232,18,124,0.92);padding:5px 11px;border-radius:999px;margin-bottom:14px;">Vaga aberta</span>
          <h3 style="font-family:'Anton',sans-serif;font-weight:400;font-size:28px;text-transform:uppercase;color:#fff;margin:0 0 8px;line-height:1;">Guará</h3>
          <div style="display:flex;align-items:center;gap:9px;font-size:16px;color:#c7c7cc;margin-bottom:22px;">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#E8127C" stroke-width="2" style="flex-shrink:0;" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
            Terça · 22h
          </div>
          <a href="https://wa.me/5561996085008?text=Ol%C3%A1%20Andr%C3%A9!%20Estava%20no%20seu%20site%20e%20quero%20entrar%20no%20Small%20Group%20de%20Guar%C3%A1." target="_blank" rel="noopener" data-cta="turma-guara" class="hv-brighten" style="margin-top:auto;display:inline-flex;align-items:center;justify-content:center;gap:9px;font-family:'Barlow Condensed',sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;font-size:16px;color:#fff;text-decoration:none;background:linear-gradient(180deg,#E8127C,#A8095A);padding:13px 20px;border-radius:8px;">Entrar nesta turma</a>
        </div>
        <div class="reveal card-neon" style="display:flex;flex-direction:column;background:#141416;border:1px solid rgba(232,18,124,0.35);border-radius:16px;padding:26px 26px 28px;">
          <span style="align-self:flex-start;font-family:'Barlow Condensed',sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;font-size:12px;color:#fff;background:rgba(232,18,124,0.92);padding:5px 11px;border-radius:999px;margin-bottom:14px;">Vaga aberta</span>
          <h3 style="font-family:'Anton',sans-serif;font-weight:400;font-size:28px;text-transform:uppercase;color:#fff;margin:0 0 8px;line-height:1;">Samambaia</h3>
          <div style="display:flex;align-items:center;gap:9px;font-size:16px;color:#c7c7cc;margin-bottom:22px;">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#E8127C" stroke-width="2" style="flex-shrink:0;" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
            Quinta · 22h
          </div>
          <a href="https://wa.me/5561996085008?text=Ol%C3%A1%20Andr%C3%A9!%20Estava%20no%20seu%20site%20e%20quero%20entrar%20no%20Small%20Group%20de%20Samambaia." target="_blank" rel="noopener" data-cta="turma-samambaia" class="hv-brighten" style="margin-top:auto;display:inline-flex;align-items:center;justify-content:center;gap:9px;font-family:'Barlow Condensed',sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;font-size:16px;color:#fff;text-decoration:none;background:linear-gradient(180deg,#E8127C,#A8095A);padding:13px 20px;border-radius:8px;">Entrar nesta turma</a>
        </div>
        <div class="reveal card-neon" style="display:flex;flex-direction:column;background:#141416;border:1px solid rgba(232,18,124,0.35);border-radius:16px;padding:26px 26px 28px;">
          <span style="align-self:flex-start;font-family:'Barlow Condensed',sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;font-size:12px;color:#fff;background:rgba(232,18,124,0.92);padding:5px 11px;border-radius:999px;margin-bottom:14px;">Vaga aberta</span>
          <h3 style="font-family:'Anton',sans-serif;font-weight:400;font-size:28px;text-transform:uppercase;color:#fff;margin:0 0 8px;line-height:1;">Asa Sul</h3>
          <div style="display:flex;align-items:center;gap:9px;font-size:16px;color:#c7c7cc;margin-bottom:22px;">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#E8127C" stroke-width="2" style="flex-shrink:0;" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
            Sexta · 20h
          </div>
          <a href="https://wa.me/5561996085008?text=Ol%C3%A1%20Andr%C3%A9!%20Estava%20no%20seu%20site%20e%20quero%20entrar%20no%20Small%20Group%20de%20Asa%20Sul." target="_blank" rel="noopener" data-cta="turma-asa-sul" class="hv-brighten" style="margin-top:auto;display:inline-flex;align-items:center;justify-content:center;gap:9px;font-family:'Barlow Condensed',sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;font-size:16px;color:#fff;text-decoration:none;background:linear-gradient(180deg,#E8127C,#A8095A);padding:13px 20px;border-radius:8px;">Entrar nesta turma</a>
        </div>
      </div>

      <div class="reveal" style="max-width:820px;margin:34px auto 0;background:#141416;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px clamp(20px,4vw,36px);text-align:center;">
        <h3 style="font-family:'Anton',sans-serif;font-weight:400;font-size:clamp(24px,3vw,32px);text-transform:uppercase;color:#fff;margin:0 0 8px;line-height:1;">Quer um Small Group no seu bairro?</h3>
        <p style="font-size:16px;line-height:1.6;color:#b9b9bd;margin:0 0 22px;">Selecione a sua região e chame o professor para abrir uma turma nova perto de você.</p>
        <div data-bairro-picker style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-bottom:24px;">
          <button type="button" data-bairro="Asa Norte">Asa Norte</button>
          <button type="button" data-bairro="Noroeste">Noroeste</button>
          <button type="button" data-bairro="Sudoeste">Sudoeste</button>
          <button type="button" data-bairro="Taguatinga">Taguatinga</button>
          <button type="button" data-bairro="Vicente Pires">Vicente Pires</button>
        </div>
        <button type="button" data-abrir-btn disabled>Selecione um bairro acima</button>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section style="padding:80px clamp(24px,5vw,88px);background:linear-gradient(135deg,#A8095A,#6E0438);text-align:center;">
    <h2 style="font-family:'Anton',sans-serif;font-weight:400;font-size:clamp(32px,4.4vw,54px);line-height:1;text-transform:uppercase;color:#fff;margin:0 0 16px;">Ainda com dúvida no plano?</h2>
    <p style="font-size:18px;color:rgba(255,255,255,0.9);margin:0 auto 30px;max-width:560px;">Me chama no WhatsApp que eu te ajudo a escolher o melhor formato para você.</p>
    <a href="https://wa.me/5561996085008?text=Ol%C3%A1%20Andr%C3%A9!%20Estava%20no%20seu%20site%20e%20gostaria%20de%20ajuda%20para%20escolher%20o%20melhor%20plano%20de%20Muay%20Thai." target="_blank" rel="noopener" class="hv-lift" style="display:inline-flex;align-items:center;gap:10px;font-family:'Barlow Condensed',sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;font-size:19px;color:#A8095A;text-decoration:none;background:#fff;padding:16px 34px;border-radius:8px;">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M17.5 14.4c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35zM12 2C6.48 2 2 6.48 2 12c0 1.77.46 3.42 1.27 4.86L2 22l5.25-1.38A9.94 9.94 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/></svg>
      Falar no WhatsApp
    </a>
  </section>

  <?php include __DIR__ . '/partials/footer.php'; ?>
</div>
<script src="assets/main.js"></script>
</body>
</html>
