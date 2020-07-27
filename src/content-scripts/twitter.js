/* eslint-disable no-continue */
import createSuperheroTipAction, { isInContent } from './tipButton';

let timeout = null;

const getTweetId = tweet => {
  const status = tweet.querySelector("a[href*='/status/']");
  if (!status || !status.href) {
    return null;
  }

  return status.href.split('/retweets')[0];
};

const configureSuperheroTipAction = async () => {
  clearTimeout(timeout);
  const check = await browser.runtime.sendMessage({ method: 'checkHasAccount' });
  const tweets = document.querySelectorAll(
    '[data-testid="tweet"], [data-testid="tweetDetail"], [data-testid="tweet"] + div, [data-testid="tweetDetail"] + div',
  );

  let bigTweetSkipped = !document.querySelectorAll('div[aria-label="Timeline: Conversation"]')
    .length;
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < tweets.length; ++i) {
    const tweetId = getTweetId(tweets[i]);
    if (!tweetId) continue;
    const actions = tweets[i].querySelector('[role="group"]');
    if (!actions) continue;
    const lastActionNode = actions.querySelector(
      ':scope > div:not(.action-superhero-tip):last-child',
    );
    if (check && bigTweetSkipped && lastActionNode) {
      lastActionNode.style.flexBasis = '0px';
      lastActionNode.style.flexGrow = '1';
    }
    const superheroTipActions = actions.getElementsByClassName('action-superhero-tip');

    if (check && superheroTipActions.length === 0) {
      actions.appendChild(createSuperheroTipAction(tweetId));
    } else if (!check && superheroTipActions.length === 1) {
      actions.removeChild(superheroTipActions[0]);
    }
    bigTweetSkipped = true;
  }
  timeout = setTimeout(configureSuperheroTipAction, 3000);
};

if (isInContent) {
  document.addEventListener('visibilitychange', () => {
    clearTimeout(timeout);
    if (!document.hidden) {
      timeout = setTimeout(configureSuperheroTipAction, 3000);
    }
  });

  configureSuperheroTipAction();
}
