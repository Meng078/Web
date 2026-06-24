<script setup></script>
<template>
  <view class="agreement-page">
    <view class="agreement-container">

      <view class="page-header">
        <view class="header-content">
          <view class="date-group">
            <text class="agreement-date">更新日期：2026年6月16日</text>
            <text class="agreement-date">生效日期：2026年6月16日</text>
          </view>
        </view>
      </view>

      <scroll-view scroll-y class="agreement-scroll">
        <view class="agreement-body">

          <view class="agreement-section">
            <view class="section-header"><text class="section-title">一、协议接受</text></view>
            <text class="section-content">用户注册、登录或使用本平台服务，即视为已充分阅读并无条件接受本协议全部条款。平台有权适时修订协议，修订版一经公示即生效。</text>
          </view>

          <view class="agreement-section">
            <view class="section-header"><text class="section-title">二、服务内容与范围</text></view>
            <text class="section-content">本平台向用户提供信息浏览、互动交流、数字商品交易、在线充值等服务。具体服务形态可能随版本迭代调整。平台保留随时变更或中止部分服务的权利。</text>
          </view>

          <view class="agreement-section">
            <view class="section-header"><text class="section-title">三、账号管理与规范</text></view>
            <text class="section-content">3.1 真实性：用户须承诺注册信息真实、有效。如因虚假信息导致纠纷，由用户承担责任。</text>
            <text class="section-content">3.2 安全性：账号及密码是身份识别的唯一凭证。用户须妥善保管，不得出借或转让。因保管不善导致的损失由用户自行承担。</text>
            <text class="section-content">3.3 行为规范：严禁利用本平台从事违法活动，不得发布危害国家安全、淫秽色情、暴力恐吓等违规信息。</text>
          </view>

          <view class="agreement-section">
            <view class="section-header"><text class="section-title">四、知识产权声明</text></view>
            <text class="section-content">4.1 平台内容（图文、代码、商标等）知识产权归平台或权利人所有，未经许可严禁复制传播。</text>
            <text class="section-content">4.2 用户发布的内容须保证无权利瑕疵。用户同意授予平台在全球范围内免费展示及推广该内容的权利。</text>
          </view>

          <view class="agreement-section">
            <view class="section-header"><text class="section-title">五、免责声明</text></view>
            <text class="section-content">5.1 平台按“现状”提供服务，不保证服务的无中断性或绝对安全性。</text>
            <text class="section-content">5.2 因不可抗力、网络故障、第三方服务中断导致的服务异常或数据丢失，平台在法定范围内免责。</text>
          </view>

          <view class="agreement-section">
            <view class="section-header"><text class="section-title">六、违约与争议解决</text></view>
            <text class="section-content">用户违反本协议条款，平台有权立即终止服务并追究责任。本协议适用中华人民共和国法律。因本协议产生的争议，由平台所在地有管辖权的人民法院管辖。</text>
          </view>

          <view class="agreement-section">
            <view class="section-header"><text class="section-title">七、联系方式</text></view>
            <text class="section-content">如有疑问，请联系：<br/>客服热线：400-XXX-XXXX<br/>邮箱：service@example.com</text>
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