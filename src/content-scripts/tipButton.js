/* eslint-disable no-continue */
import iconHover from '../icons/twitter-icon-tip-hover.svg';
import icon from '../icons/twitter-icon-tip.svg';

global.browser = require('webextension-polyfill');

export const isInContent = !window.location.href.includes(browser.extension.getURL('./'));

const buttonContentStyleCommon = `font-size: 12px;
font-weight: bold;
margin-left: 6px;
position: relative;`;
const buttonContentStyle = `${buttonContentStyleCommon} color: rgb(101, 119, 134);`;
const buttonContentStyleHover = `${buttonContentStyleCommon} color: #2a9cff;`;

const buttonStyleCommon = `background: transparent; 
border:none; cursor: pointer; padding: 0px;
outline:none;`;
const buttonStyle = `${buttonStyleCommon} color:rgb(101, 119, 134);`;
const buttonStyleHover = `${buttonStyleCommon} color: #2a9cff;`;

export default url => {
  // Create the tip action
  const superheroTipAction = document.createElement('div');
  superheroTipAction.className = 'action-superhero-tip';
  superheroTipAction.style.alignSelf = 'center';
  superheroTipAction.style.whiteSpace = 'nowrap';
  superheroTipAction.setAttribute('role', 'button');
  superheroTipAction.setAttribute('tabindex', '0');

  // Create the tip button icon
  const buttonIcon = document.createElement('img');
  buttonIcon.src = icon;
  buttonIcon.setAttribute('style', `height: 16px; vertical-align: middle;`);

  // Create the tip button content
  const buttonContent = document.createElement('span');
  buttonContent.innerHTML = 'Tip';
  buttonContent.setAttribute('style', buttonContentStyle);

  // Create the tip button
  const superheroTipButton = document.createElement('button');
  superheroTipButton.setAttribute('style', buttonStyle);
  superheroTipButton.appendChild(buttonIcon);
  superheroTipButton.appendChild(buttonContent);

  // Events
  // On click send postMessage for invoking tip with the tweetId
  superheroTipButton.onclick = e => {
    browser.runtime.sendMessage({ from: 'content', type: 'openTipPopup', url });
    e.stopPropagation();
  };

  const hoverEnter = () => {
    buttonIcon.src = iconHover;
    superheroTipButton.setAttribute('style', buttonStyleHover);
    buttonContent.setAttribute('style', buttonContentStyleHover);
  };

  const hoverLeave = () => {
    buttonIcon.src = icon;
    superheroTipButton.setAttribute('style', buttonStyle);
    buttonContent.setAttribute('style', buttonContentStyle);
  };

  // Change style on mouseenter and mouseleave
  superheroTipButton.onmouseenter = e => {
    hoverEnter();
    e.stopPropagation();
  };
  superheroTipButton.onmouseleave = e => {
    hoverLeave();
    e.stopPropagation();
  };

  buttonContent.onmouseenter = e => {
    hoverEnter();
    e.stopPropagation();
  };
  buttonContent.onmouseleave = e => {
    hoverLeave();
    e.stopPropagation();
  };

  const shadowRoot = superheroTipAction.attachShadow({ mode: 'open' });
  shadowRoot.appendChild(superheroTipButton);

  return superheroTipAction;
};
