<script setup></script>
<template>
  <view class="agreement-page">
    <view class="agreement-container">

      <!-- 顶部日期区 -->
      <view class="page-header">
        <view class="header-content">
          <view class="date-group">
            <text class="agreement-date">更新日期：2026年6月16日</text>
            <text class="agreement-date">生效日期：2026年6月16日</text>
          </view>
        </view>
      </view>

      <!-- 滚动内容区 -->
      <scroll-view scroll-y class="agreement-scroll">
        <view class="agreement-body">

          <view class="agreement-section">
            <view class="section-header"><text class="section-title">一、总则</text></view>
            <text class="section-content">1.1 本协议系用户与本平台之间就平台充值服务所订立的契约。用户在实施任何充值操作前，应审慎阅读本协议。点击确认或实际使用服务即视为接受本协议全部内容。</text>
            <text class="section-content">1.2 本平台保留根据业务发展、法律法规变化对本协议进行修改的权利。修改后的协议一经公示即生效，如用户不同意修改，应停止使用服务。</text>
          </view>

          <view class="agreement-section">
            <view class="section-header"><text class="section-title">二、充值服务与资金说明</text></view>
            <text class="section-content">2.1 支付方式：支持微信支付、支付宝、银联、Apple Pay等第三方支付渠道。具体以页面展示为准，平台将适时调整支付通道。</text>
            <text class="section-content">2.2 到账时效：正常情况余额实时注入。因银行清算或网络异常导致的延迟，平台将积极协调推进。</text>
            <text class="section-content">2.3 余额属性：充值余额/虚拟货币仅用于本平台内部消费，不可兑换现金或转让。</text>
          </view>

          <view class="agreement-section">
            <view class="section-header"><text class="section-title">三、充值规则</text></view>
            <text class="section-content">3.1 资金来源合法：用户承诺资金来源合法合规，且享有完整处分权。</text>
            <text class="section-content">3.2 审慎操作：用户应仔细核对账号与金额。除本协议约定或系统故障外，充值成功原则上不予退回。</text>
            <text class="section-content">3.3 限制与风控：平台部署实时风控系统，若检测到异常交易，有权采取拦截或二次验证等措施。</text>
          </view>

          <view class="agreement-section">
            <view class="section-header"><text class="section-title">四、退款规则</text></view>
            <text class="section-content">4.1 可受理情形：（1）平台故障导致重复扣款；（2）支付成功但充值失败；（3）经核实的特殊情况。</text>
            <text class="section-content">4.2 申请流程：用户须在交易后7个工作日内申请，提供完整凭证。审核通过后5-15个工作日内原路退回。</text>
            <text class="section-content">4.3 不予受理情形：已消费金额、超出申请期限、涉嫌恶意刷单或套现等违规行为。</text>
          </view>

          <view class="agreement-section">
            <view class="section-header"><text class="section-title">五、账户安全</text></view>
            <text class="section-content">5.1 用户须妥善保管账号、密码及验证码。因保管不善导致的资金损失，由用户自行承担。</text>
            <text class="section-content">5.2 安全提示：平台工作人员不会索要密码或验证码，如遇此类情况请立即举报。</text>
          </view>

          <view class="agreement-section">
            <view class="section-header"><text class="section-title">六、费用、税务与发票</text></view>
            <text class="section-content">6.1 充值金额以人民币计价，已含法定税费。实际支付金额可能因第三方手续费产生微小差异。</text>
            <text class="section-content">6.2 发票开具：用户可在“我的-发票管理”申请开票，平台将在收到申请后15个工作日内处理。赠送金额不予开票。</text>
          </view>

          <view class="agreement-section">
            <view class="section-header"><text class="section-title">七、免责与争议解决</text></view>
            <text class="section-content">7.1 因自然灾害、通信网络中断、电力故障或第三方服务故障导致的服务中断，平台在合理范围内免责。</text>
            <text class="section-content">7.2 本协议适用中华人民共和国法律。因本协议产生的争议，双方应协商解决；协商不成的，向平台所在地有管辖权的人民法院提起诉讼。</text>
          </view>

          <view class="agreement-section">
            <view class="section-header"><text class="section-title">八、联系方式</text></view>
            <text class="section-content">如有疑问或建议，请联系：<br/>客服热线：400-XXX-XXXX（每日 9:00-21:00）<br/>邮箱：recharge@example.com</text>
          </view>

        </view>
        <view class="scroll-bottom"></view>
      </scroll-view>
    </view>
  </view>
</template>

<style scoped lang="scss">
@use "@/styles/agreement.scss";
</style>