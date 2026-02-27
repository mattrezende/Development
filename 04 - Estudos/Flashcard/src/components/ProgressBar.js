export default class ProgressBar {
  constructor(container, index, total) {
    const percent = ((index + 1) / total) * 100;

    container.innerHTML = `
      <div class="progress">
        <div class="progress-fill" style="width:${percent}%"></div>
      </div>
    `;
  }
}