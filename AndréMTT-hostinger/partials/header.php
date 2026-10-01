<?php
if (!isset($active)) { $active = 'home'; }
$navItems = [
  ['key' => 'home', 'label' => 'Home', 'href' => 'index.php'],
  ['key' => 'personal-fight', 'label' => 'Personal Fight', 'href' => 'personal-fight.php'],
  ['key' => 'modelos', 'label' => 'Planos', 'href' => 'modelos.php'],
  ['key' => 'depoimentos', 'label' => 'Depoimentos', 'href' => 'depoimentos.php'],
  ['key' => 'contato', 'label' => 'Contato', 'href' => 'contato.php'],
];
$navBase = "font-family:'Barlow Condensed',sans-serif;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;font-size:16px;text-decoration:none;padding:9px 14px;border-radius:6px;transition:all .15s;white-space:nowrap;";
$mobileBase = "font-family:'Barlow Condensed',sans-serif;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;font-size:19px;text-decoration:none;padding:12px 6px;border-bottom:1px solid rgba(255,255,255,0.06);";
?>
<header style="position:sticky;top:0;z-index:50;background:rgba(10,10,11,0.92);backdrop-filter:blur(10px);border-bottom:1px solid rgba(232,18,124,0.35);font-family:'Barlow',sans-serif;">
  <div style="max-width:1240px;margin:0 auto;padding:14px 24px;display:flex;align-items:center;justify-content:space-between;gap:20px;">
    <a href="index.php" style="display:flex;align-items:center;gap:12px;text-decoration:none;flex-shrink:0;">
      <img src="assets/logo-rosa.png" alt="André Luis Personal Fight, Muay Thai em Brasília" width="67" height="53" style="height:53px;width:auto;display:block;" />
    </a>
    <nav style="display:flex;align-items:center;gap:6px;" data-desktop-nav>
      <?php foreach ($navItems as $item): $isActive = $item['key'] === $active; ?>
      <a href="<?= $item['href'] ?>" class="hv-navlink" style="<?= $navBase ?><?= $isActive ? 'color:#fff;background:rgba(232,18,124,0.22);' : 'color:#c7c7cc;' ?>"><?= $item['label'] ?></a>
      <?php endforeach; ?>
    </nav>
    <div style="display:flex;align-items:center;gap:10px;flex-shrink:0;">
      <a href="https://wa.me/5561996085008?text=Ol%C3%A1%20Andr%C3%A9!%20Estava%20no%20seu%20site%20e%20quero%20saber%20mais%20sobre%20as%20aulas%20de%20Muay%20Thai." target="_blank" rel="noopener" data-cta="header" class="hv-brighten" style="display:inline-flex;align-items:center;gap:8px;font-family:'Barlow Condensed',sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;font-size:15px;color:#fff;text-decoration:none;background:linear-gradient(180deg,#E8127C,#A8095A);padding:11px 20px;border-radius:6px;box-shadow:0 6px 20px rgba(232,18,124,0.35);white-space:nowrap;">
        <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35zM12 2C6.48 2 2 6.48 2 12c0 1.77.46 3.42 1.27 4.86L2 22l5.25-1.38A9.94 9.94 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/></svg>
        WhatsApp
      </a>
      <button data-burger aria-label="Menu" style="display:none;background:none;border:1px solid rgba(255,255,255,0.2);border-radius:6px;padding:8px 10px;cursor:pointer;color:#fff;">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
    </div>
  </div>
  <nav class="mobile-nav" data-mobile-nav style="flex-direction:column;padding:8px 24px 18px;gap:2px;border-top:1px solid rgba(255,255,255,0.08);">
    <?php foreach ($navItems as $item): $isActive = $item['key'] === $active; ?>
    <a href="<?= $item['href'] ?>" style="<?= $mobileBase ?><?= $isActive ? 'color:#E8127C;' : 'color:#e8e8ea;' ?>"><?= $item['label'] ?></a>
    <?php endforeach; ?>
  </nav>
</header>
