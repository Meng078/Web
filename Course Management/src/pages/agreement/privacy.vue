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
            <view class="section-header"><text class="section-title">引言</text></view>
            <text class="section-content">本平台高度重视用户个人信息安全与隐私权益。本政策旨在透明地向您说明我们如何收集、使用、存储及保护您的个人信息。在使用本服务前，请仔细阅读本政策。</text>
          </view>

          <view class="agreement-section">
            <view class="section-header"><text class="section-title">一、信息的收集</text></view>
            <text class="section-content">1.1 我们仅遵循“合法、正当、必要”原则收集信息，包括：（1）账户信息：手机号、邮箱、昵称等；（2）设备信息：型号、系统版本、唯一设备标识符、IP地址；（3）日志信息：浏览记录、服务使用详情及崩溃记录。</text>
            <text class="section-content">1.2 我们承诺不以欺诈或误导方式收集信息，您可以随时在系统设置中管理非必要权限。</text>
          </view>

          <view class="agreement-section">
            <view class="section-header"><text class="section-title">二、信息的使用目的</text></view>
            <text class="section-content">2.1 信息将严格用于以下场景：（1）提供服务及优化体验；（2）身份验证与安全风控；（3）处理订单及履行法定义务；（4）发送服务通知及安全预警。</text>
            <text class="section-content">2.2 未经您另行同意，我们不会将信息用于本政策之外的用途。</text>
          </view>

          <view class="agreement-section">
            <view class="section-header"><text class="section-title">三、存储、保护与共享</text></view>
            <text class="section-content">3.1 数据存储：个人信息将存储于中华人民共和国境内服务器。原则上不进行跨境传输。</text>
            <text class="section-content">3.2 安全措施：我们采用行业标准技术手段（如加密传输、访问控制）保障信息安全。</text>
            <text class="section-content">3.3 第三方SDK：为实现特定功能（支付、推送等），我们可能接入经严格评估的第三方SDK，仅共享实现功能所必需的最小化数据。</text>
          </view>

          <view class="agreement-section">
            <view class="section-header"><text class="section-title">四、用户权利行使</text></view>
            <text class="section-content">您依法享有查阅、复制、更正、删除个人信息及撤回同意的权利。您也可通过平台功能申请注销账号。权利行使通道：我的-设置-隐私中心，或联系隐私专线。</text>
          </view>

          <view class="agreement-section">
            <view class="section-header"><text class="section-title">五、未成年人保护</text></view>
            <text class="section-content">若您是未满18周岁的未成年人，请在监护人同意及指导下使用本服务。我们将采取加密存储等措施优先保护未成年人数据。若发现违规收集，将立即删除。</text>
          </view>

          <view class="agreement-section">
            <view class="section-header"><text class="section-title">六、政策更新</text></view>
            <text class="section-content">本政策可能随业务发展或法规变更而适时修订。重大变更将通过公告或弹窗通知。更新生效后继续使用服务即视为接受修订。</text>
          </view>

          <view class="agreement-section">
            <view class="section-header"><text class="section-title">七、联系我们</text></view>
            <text class="section-content">如有疑问或需行使权利，请联系数据安全团队：<br/>专线：400-XXX-XXXX<br/>邮箱：privacy@example.com</text>
          </view>

        </view>
        <view class="scroll-bottom"></view>
      </scroll-view>
    </view>
  </view>
</template>

<style scoped lang="scss">
@import "@/styles/agreement.scss";
</style>