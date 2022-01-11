export const init = () => {
  let progressBar = document.getElementById('progress-bar-container');

  progressBar.style.background = 'white';
  progressBar = progressBar.children[0];

  if (progressBar) {
    window.addEventListener('scroll', () => {
      const winScroll =
        document.body.scrollTop || document.documentElement.scrollTop;
      const height =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;

      progressBar.style.width = `${(winScroll / height) * 100}%`;
    });
  }
};
