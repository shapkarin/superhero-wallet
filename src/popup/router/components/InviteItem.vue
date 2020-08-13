<template>
  <div class="invite-row">
    <div class="invite-info">
      <span class="primary">
        <span class="balance">{{ balance }}</span>
      </span>
      <!--eslint-disable-line vue-i18n/no-raw-text-->
      (
        {{ currencySigns[current.currency] }}
        {{ (balance * current.currencyRate).toFixed(2) }}
      )
      <!--eslint-disable-next-line vue-i18n/no-raw-text-->
      <span class="date">{{ createdAt | formatDate }}</span>
    </div>
    <div class="invite-link">
      <span>{{ link }}</span>
      <button class="invite-link-copy" v-clipboard:copy="link"><CopyIcon /></button>
    </div>
    <template v-if="!topUp">
      <div class="center">
        <Button bold minwidth inline dark @click="topUp = true">{{  $t('pages.invite.top-up') }}</Button>
        <Button bold minwidth inline @click="claim">{{  $t('pages.invite.claim')  }}</Button>
      </div>
    </template>
    <template v-else>
      <AmountSend v-model="topUpAmount" />
      <div class="center">
        <Button bold minwidth inline dark @click="topUp = false">{{ $t('pages.invite.close')  }}</Button>
        <Button bold minwidth inline @click="sendTopUp">{{ $t('pages.invite.top-up') }}</Button>
      </div>
    </template>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { AmountFormatter, Crypto } from '@aeternity/aepp-sdk/es';
import AmountSend from './AmountSend';
import Button from './Button';
import CopyIcon from '../../../icons/copy.svg?vue-component';
import { formatDate } from '../../utils';
import { currencySigns } from '../../utils/helper';

export default {
  props: {
    secretKey: { type: String, required: true },
    createdAt: { type: Number, required: true },
  },
  components: { Button, AmountSend, CopyIcon },
  filters: { formatDate },
  data: () => ({ topUp: false, topUpAmount: 0, balance: 0, currencySigns,}),
  computed: {
    ...mapState(['sdk', 'current']),
    link() {
      const secretKey = Crypto.encodeBase58Check(Buffer.from(this.secretKey, 'hex'));
      return new URL(
        this.$router
          .resolve({ name: 'invite-claim', params: { secretKey } })
          .href.replace(/^#/, ''),
        'https://wallet.superhero.com',
      );
    },
    address() {
      return Crypto.getAddressFromPriv(this.secretKey);
    },
  },
  watch: {
    secretKey: {
      async handler() {
        await this.updateBalance();
      },
      immediate: true,
    },
  },
  methods: {
    async updateBalance() {
      await this.$watchUntilTruly(() => this.sdk);
      this.balance = parseFloat(
        await this.sdk
          .balance(this.address, { format: AmountFormatter.AE_AMOUNT_FORMATS.AE })
          .catch(() => 0),
      ).toFixed(2);
    },
    async claim() {
      this.$emit('loading', true);
      try {
        await this.$store.dispatch('invites/claim', this.secretKey);
        await this.updateBalance();
      } catch (error) {
        if (await this.$store.dispatch('invites/handleNotEnoughFoundsError', error)) return;
        throw error;
      } finally {
        this.$emit('loading', false);
      }
    },
    async sendTopUp() {
      this.$emit('loading', true);
      try {
        if (this.topUpAmount > 0) {
          await this.sdk.spend(this.topUpAmount, this.address, {
            payload: 'referral',
            denomination: AmountFormatter.AE_AMOUNT_FORMATS.AE,
          });
          await this.updateBalance();
        }
      } catch (error) {
        if (await this.$store.dispatch('invites/handleNotEnoughFoundsError', error)) return;
        throw error;
      } finally {
        this.$emit('loading', false);
      }
      this.topUpAmount = 0;
      this.topUp = false;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../../common/variables';

.invite-row {
  padding: 1rem;
  width: 100%;
  border-bottom: 1px solid $tour-bg-color;
  text-align: left;
  color: $text-color;
  position: relative;
  border-bottom: 2px solid $black-1;

  .invite-link {
    margin-bottom: 5px;
    font-size: 11px;

    span {
      width: calc(100% - 23px);
      display: inline-block;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      color: $white-1;
    }
  }

  .invite-link-copy {
    padding: 0;
    color: $gray-2;
  }

  .invite-info {
    font-size: 13px;
    font-weight: 400;
    color: $white-color;
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    color: $gray-2;

    .primary {
      color: $secondary-color;
      margin-right: 5px;
      font-weight: 400;
    }

    .balance {
      font-family: Roboto;
      color: $white-1;
      font-weight: 400;

      &::after {
        color: $secondary-color;
      }
    }

    .date {
      font-size: 11px;
      margin-left: auto;
      color: $text-color;
    }
  }
}
</style>
