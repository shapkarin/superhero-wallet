import createSuperheroTipAction, { isInContent } from './tipButton';

let timeout;

const configureSuperheroTipAction = async () => {
  clearTimeout(timeout);
  const buttons = document.querySelector(
    'ytd-menu-renderer.style-scope.ytd-video-primary-info-renderer #top-level-buttons',
  );
  const superheroTipActions = buttons.getElementsByClassName('action-superhero-tip');
  if (
    !(await browser.runtime.sendMessage({ method: 'checkHasAccount' })) ||
    !buttons ||
    superheroTipActions.length
  )
    return;
  const superheroTipButton = createSuperheroTipAction(window.location.href);
  superheroTipButton.style.marginLeft = '9px';
  superheroTipButton.style.height = '20px';
  buttons.append(superheroTipButton);
};

if (isInContent) {
  timeout = setTimeout(configureSuperheroTipAction, 5000);
}
