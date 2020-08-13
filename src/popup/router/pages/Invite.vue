<template>
  <div class="popup">
    <p class="section-title">
      <Invite class="invite-icon"/>
      {{ $t('pages.invite.generate-link') }}
    </p>
    <AmountSend v-model="amount" class="send-amount" :label="$t('pages.invite.tip-attached')"/>
    <div class="generate-action">
      <Button bold @click="generate" extend>{{ $t('pages.invite.generate') }}</Button>
    </div>
    <div class="generated-links">
      <p class="section-title">
        <Invite class="invite-icon"/>
        {{ $t('pages.invite.created-links') }}
      </p>
      <InviteItem
        v-for="link in invites"
        :key="link.secretKey"
        v-bind="link"
        @loading="val => (loading = val)"
      />
    </div>
    <Loader v-if="loading" />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { Crypto } from '@aeternity/aepp-sdk/es';
import { AE_AMOUNT_FORMATS } from '@aeternity/aepp-sdk/es/utils/amount-formatter';
import AmountSend from '../components/AmountSend';
import InviteItem from '../components/InviteItem';
import Invite from '../../../icons/invite.svg?vue-component';

export default {
  components: { AmountSend, InviteItem, Invite, },
  data: () => ({ amount: 0, loading: false }),
  computed: {
    ...mapState(['sdk']),
    ...mapState('invites', ['invites']),
  },
  methods: {
    async generate() {
      this.loading = true;
      const { publicKey, secretKey } = Crypto.generateKeyPair();

      try {
        if (this.amount > 0) {
          await this.$watchUntilTruly(() => this.sdk);
          await this.sdk.spend(this.amount, publicKey, {
            payload: 'referral',
            denomination: AE_AMOUNT_FORMATS.AE,
          });
        }
      } catch (error) {
        if (await this.$store.dispatch('invites/handleNotEnoughFoundsError', error)) return;
        throw error;
      } finally {
        this.loading = false;
      }

      this.$store.commit('invites/add', secretKey);
      this.amount = 0;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../../common/variables';

.section-title {
  font-size: 17px;
  text-align: left;
  margin-bottom: 0;
  color: $gray-1;
  font-weight: 400;
}

.invite-icon {
  vertical-align: sub;
  margin-right: 7px;
}

.popup {
  background-color: $black-1;
}

.generate-action {
  width: 270px;
  margin: 0 auto;
}

.generated-links {
  background-color: $transactions-bg;
  margin: 0 -20px;

  .section-title {
    padding: 15px 20px;
    border-bottom: 2px solid $black-1;
  }
}

.send-amount {
  margin: 10px 0 0 0;
}
</style>
