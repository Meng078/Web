<template>
  <!-- #ifdef H5 -->
  <view class="h5-config-page">
    <!-- 顶部导航栏 64px 毛玻璃 -->
    <view class="h5-header">
      <view class="h5-header-inner">
        <text class="h5-back-btn" @click="goBack">← 返回</text>
        <text class="h5-title">纸质书信</text>
        <view class="h5-header-right"></view>
      </view>
    </view>

    <scroll-view scroll-y class="h5-scroll-content">
      <view class="h5-form-container">
        <!-- Section 1: 选纸张 -->
        <view class="h5-section">
          <text class="h5-section-title">请选择纸质信件</text>
          <scroll-view scroll-x class="h5-paper-scroll" :show-scrollbar="false">
            <view
              v-for="(item, index) in paperOptions"
              :key="index"
              class="h5-paper-item"
              :class="{ active: selectedPaper === index }"
              @click="selectedPaper = index"
            >
              <image class="h5-paper-img" :src="item" mode="aspectFill" />
            </view>
          </scroll-view>
        </view>

        <!-- Section 2: 地址信息 -->
        <view class="h5-section h5-address-section">
          <text class="h5-section-title">请填写地址</text>

          <view class="h5-form-row">
            <text class="h5-label">寄信人</text>
            <input class="h5-input-box h5-flex-1" placeholder="请填写寄信人姓名" v-model="senderName" />
          </view>
          <view class="h5-form-row">
            <text class="h5-label">寄信电话</text>
            <view class="h5-flex-1">
              <input class="h5-input-box" style="width:100%" type="number" maxlength="11" placeholder="请填写寄信人电话" v-model="senderPhone" />
              <text v-if="senderPhoneError" class="h5-input-error">{{ senderPhoneError }}</text>
            </view>
          </view>

          <view class="h5-form-row">
            <text class="h5-label">收信人</text>
            <input class="h5-input-box h5-flex-1" placeholder="请填写收信人姓名" v-model="receiverName" />
          </view>
          <view class="h5-form-row">
            <text class="h5-label">收信电话</text>
            <view class="h5-flex-1">
              <input class="h5-input-box" style="width:100%" type="number" maxlength="11" placeholder="请填写收信人电话" v-model="receiverPhone" />
              <text v-if="receiverPhoneError" class="h5-input-error">{{ receiverPhoneError }}</text>
            </view>
          </view>
          <view class="h5-form-row h5-full-width">
            <text class="h5-label">收信地址</text>
            <view class="h5-region-trigger h5-flex-1" @click="openRegionPicker">
              <text :class="['h5-region-text', { placeholder: !selectedProvince }]">{{ regionDisplayText }}</text>
              <text class="h5-dropdown-arrow">&#9662;</text>
            </view>
          </view>
          <view class="h5-form-row h5-full-width">
            <text class="h5-label"></text>
            <input class="h5-input-box h5-flex-1" placeholder="请输入详细地址" v-model="detailAddress" />
          </view>
        </view>

        <!-- Section 3: 时间选择 -->
        <view class="h5-section">
          <text class="h5-section-title">请选择寄出时间</text>
          <view class="h5-time-options">
            <view
              v-for="idx in (timeOptions.length - 1)"
              :key="idx"
              class="h5-time-chip"
              :class="{ active: selectedTime === idx - 1 }"
              @click="selectedTime = idx - 1"
            >
              {{ timeOptions[idx - 1] }}
            </view>
            <picker mode="date" :value="customTime || ''" :start="todayStr" @change="onCustomTimeChange">
              <view class="h5-time-chip h5-custom-time-chip" :class="{ active: selectedTime === timeOptions.length - 1 }">
                {{ customTime || '其他' }}
              </view>
            </picker>
          </view>
        </view>

        <!-- Section 4: 类型选择 -->
        <view class="h5-section">
          <text class="h5-section-title">信件类型</text>
          <view class="h5-type-grid">
            <view class="h5-type-card" :class="{ active: selectedType === 'basic' }" @click="selectedType='basic'">
              <image class="h5-type-img" :src="letter001" mode="aspectFill" />
              <text class="h5-type-name">基础版</text>
            </view>
            <view class="h5-type-card" :class="{ active: selectedType === 'gift' }" @click="selectedType='gift'">
              <image class="h5-type-img" :src="letter005" mode="aspectFill" />
              <text class="h5-type-name">礼盒版</text>
            </view>
          </view>
        </view>

        <view style="height: 120px;"></view>
      </view>
    </scroll-view>

    <!-- Region Picker Modal (H5 centered) -->
    <view class="h5-region-picker-mask" v-if="showRegionPicker" @click="closeRegionPicker"></view>
    <view class="h5-region-picker-popup" v-if="showRegionPicker">
      <view class="h5-picker-popup-header">
        <text class="h5-picker-popup-title" v-if="regionPickerStep === 'province'">选择省份</text>
        <text class="h5-picker-popup-title" v-else-if="regionPickerStep === 'city'">选择城市 - {{ selectedProvince }}</text>
        <text class="h5-picker-popup-title" v-else>{{ municipalities.has(selectedProvince) ? '选择区县 - ' + selectedProvince : '选择区县 - ' + selectedCity }}</text>
        <text class="h5-picker-popup-back" v-if="regionPickerStep === 'city'" @click="regionPickerStep = 'province'">&#10094; 返回</text>
        <text class="h5-picker-popup-back" v-else-if="regionPickerStep === 'district'" @click="regionPickerStep = municipalities.has(selectedProvince) ? 'province' : 'city'">&#10094; 返回</text>
        <text class="h5-picker-popup-close" @click="closeRegionPicker">&#10005;</text>
      </view>
      <view class="h5-picker-scroll">
        <view v-if="regionPickerStep === 'province'" :key="'step-province'">
          <view v-for="p in provinceList" :key="p" class="h5-picker-option" :class="{ active: selectedProvince === p }" @click="onProvinceSelect(p)">{{ p }}</view>
        </view>
        <view v-else-if="regionPickerStep === 'city'" :key="'step-city'">
          <view v-for="c in cityList" :key="c" class="h5-picker-option" :class="{ active: selectedCity === c }" @click="onCitySelect(c)">{{ c }}</view>
        </view>
        <view v-else :key="'step-district'">
          <view v-for="d in districtList" :key="d" class="h5-picker-option" :class="{ active: selectedDistrict === d }" @click="onDistrictSelect(d)">{{ d }}</view>
        </view>
      </view>
    </view>

    <!-- Footer Submit -->
    <view class="h5-fixed-footer">
      <view class="h5-footer-inner">
        <button class="h5-submit-btn" @click="handleSubmit">确认提交</button>
      </view>
    </view>
  </view>
  <!-- #endif -->

  <!-- #ifdef MP-WEIXIN -->
  <view class="mp-config-page">
    <!-- 简洁头部 标题栏 + 返回按钮 -->
    <view class="mp-header" :style="{ paddingTop: 'var(--status-bar-height)' }">
      <view class="mp-header-inner">
        <text class="mp-back-btn" @click="goBack">←</text>
        <text class="mp-title">纸质书信</text>
        <view class="mp-header-right"></view>
      </view>
    </view>

    <scroll-view scroll-y class="mp-scroll-content">
      <!-- Section 1: 选纸张 -->
      <view class="mp-section">
        <text class="mp-section-title">请选择纸质信件</text>
        <scroll-view scroll-x class="mp-paper-scroll" :show-scrollbar="false">
          <view
            v-for="(item, index) in paperOptions"
            :key="index"
            class="mp-paper-item"
            :class="{ active: selectedPaper === index }"
            @click="selectedPaper = index"
          >
            <image class="mp-paper-img" :src="item" mode="aspectFill" />
          </view>
        </scroll-view>
      </view>

      <!-- Section 2: 地址信息 -->
      <view class="mp-section mp-address-section">
        <text class="mp-section-title">请填写地址</text>

        <view class="mp-form-row">
          <text class="mp-label">寄信人</text>
          <input class="mp-input-box mp-flex-1" placeholder="请填写寄信人姓名" v-model="senderName" />
        </view>
        <view class="mp-form-row">
          <text class="mp-label">寄信电话</text>
          <view class="mp-flex-1">
            <input class="mp-input-box" style="width:100%" type="number" maxlength="11" placeholder="请填写寄信人电话" v-model="senderPhone" />
            <text v-if="senderPhoneError" class="mp-input-error">{{ senderPhoneError }}</text>
          </view>
        </view>

        <view class="mp-form-row">
          <text class="mp-label">收信人</text>
          <input class="mp-input-box mp-flex-1" placeholder="请填写收信人姓名" v-model="receiverName" />
        </view>
        <view class="mp-form-row">
          <text class="mp-label">收信电话</text>
          <view class="mp-flex-1">
            <input class="mp-input-box" style="width:100%" type="number" maxlength="11" placeholder="请填写收信人电话" v-model="receiverPhone" />
            <text v-if="receiverPhoneError" class="mp-input-error">{{ receiverPhoneError }}</text>
          </view>
        </view>
        <view class="mp-form-row mp-full-width">
          <text class="mp-label">收信地址</text>
          <view class="mp-region-trigger mp-flex-1" @click="openRegionPicker">
            <text :class="['mp-region-text', { placeholder: !selectedProvince }]">{{ regionDisplayText }}</text>
            <text class="mp-dropdown-arrow">&#9662;</text>
          </view>
        </view>
        <view class="mp-form-row mp-full-width">
          <text class="mp-label"></text>
          <input class="mp-input-box mp-flex-1" placeholder="请输入详细地址" v-model="detailAddress" />
        </view>
      </view>

      <!-- Section 3: 时间选择 -->
      <view class="mp-section">
        <text class="mp-section-title">请选择寄出时间</text>
        <view class="mp-time-options">
          <view
            v-for="idx in (timeOptions.length - 1)"
            :key="idx"
            class="mp-time-chip"
            :class="{ active: selectedTime === idx - 1 }"
            @click="selectedTime = idx - 1"
          >
            {{ timeOptions[idx - 1] }}
          </view>
          <picker mode="date" :value="customTime || ''" :start="todayStr" @change="onCustomTimeChange">
            <view class="mp-time-chip mp-custom-time-chip" :class="{ active: selectedTime === timeOptions.length - 1 }">
              {{ customTime || '其他' }}
            </view>
          </picker>
        </view>
      </view>

      <!-- Section 4: 类型选择 -->
      <view class="mp-section">
        <text class="mp-section-title">信件类型</text>
        <view class="mp-type-grid">
          <view class="mp-type-card" :class="{ active: selectedType === 'basic' }" @click="selectedType='basic'">
            <image class="mp-type-img" :src="letter001" mode="aspectFill" />
            <text class="mp-type-name">基础版</text>
          </view>
          <view class="mp-type-card" :class="{ active: selectedType === 'gift' }" @click="selectedType='gift'">
            <image class="mp-type-img" :src="letter005" mode="aspectFill" />
            <text class="mp-type-name">礼盒版</text>
          </view>
        </view>
      </view>

      <view style="height: 100px;"></view>
    </scroll-view>

    <!-- Region Picker Popup (MP bottom sheet) -->
    <view class="mp-region-picker-mask" v-if="showRegionPicker" @click="closeRegionPicker"></view>
    <view class="mp-region-picker-popup" v-if="showRegionPicker">
      <view class="mp-picker-popup-header">
        <text class="mp-picker-popup-title" v-if="regionPickerStep === 'province'">选择省份</text>
        <text class="mp-picker-popup-title" v-else-if="regionPickerStep === 'city'">选择城市 - {{ selectedProvince }}</text>
        <text class="mp-picker-popup-title" v-else>{{ municipalities.has(selectedProvince) ? '选择区县 - ' + selectedProvince : '选择区县 - ' + selectedCity }}</text>
        <text class="mp-picker-popup-back" v-if="regionPickerStep === 'city'" @click="regionPickerStep = 'province'">&#10094; 返回</text>
        <text class="mp-picker-popup-back" v-else-if="regionPickerStep === 'district'" @click="regionPickerStep = municipalities.has(selectedProvince) ? 'province' : 'city'">&#10094; 返回</text>
        <text class="mp-picker-popup-close" @click="closeRegionPicker">&#10005;</text>
      </view>
      <view class="mp-picker-scroll">
        <view v-if="regionPickerStep === 'province'" :key="'step-province'">
          <view v-for="p in provinceList" :key="p" class="mp-picker-option" :class="{ active: selectedProvince === p }" @click="onProvinceSelect(p)">{{ p }}</view>
        </view>
        <view v-else-if="regionPickerStep === 'city'" :key="'step-city'">
          <view v-for="c in cityList" :key="c" class="mp-picker-option" :class="{ active: selectedCity === c }" @click="onCitySelect(c)">{{ c }}</view>
        </view>
        <view v-else :key="'step-district'">
          <view v-for="d in districtList" :key="d" class="mp-picker-option" :class="{ active: selectedDistrict === d }" @click="onDistrictSelect(d)">{{ d }}</view>
        </view>
      </view>
    </view>

    <!-- Footer Submit -->
    <view class="mp-fixed-footer">
      <button class="mp-submit-btn" @click="handleSubmit">确认提交</button>
    </view>
  </view>
  <!-- #endif -->
</template>

<script setup>
import { ref, computed } from 'vue';
import { provinces, getCities, getDistricts, municipalities } from './region-data.js';

// 信件图片素材
import letter001 from '@/assets/letter/001.png';
import letter002 from '@/assets/letter/002.png';
import letter003 from '@/assets/letter/003.png';
import letter004 from '@/assets/letter/004.png';
import letter005 from '@/assets/letter/005.png';
import letter007 from '@/assets/letter/007.png';
import letter008 from '@/assets/letter/008.png';
// --- 状态变量 ---
const senderName = ref('');
const senderPhone = ref('');
const receiverName = ref('');
const receiverPhone = ref('');
const regionData = ref(['北京市', '市辖区', '朝阳区']);
const detailAddress = ref('');
const showRegionPicker = ref(false);
const regionPickerStep = ref('province');
const selectedProvince = ref('');
const selectedCity = ref('');
const selectedDistrict = ref('');
const provinceList = provinces;

// 状态控制
const selectedPaper = ref(0);
const selectedTime = ref(0); // Default to first option (半年)
const selectedType = ref('basic');
const customTime = ref(''); // 自定义寄出日期

// 今天日期字符串，用于日期选择器的最小可选日期
const today = new Date();
const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

// 数据配置
const paperOptions = [
  letter002,
  letter003,
  letter004,
  letter007,
  letter008,
];

const timeOptions = ['半年', '一年', '二年', '三年', '其他'];

// 自定义日期确认，同时将选中状态设为"其他"
const onCustomTimeChange = (e) => {
  customTime.value = e.detail.value;
  selectedTime.value = timeOptions.length - 1;
};

// 手机号格式正则
const phoneReg = /^1[3-9]\d{9}$/;

// 寄信人手机号实时校验
const senderPhoneError = computed(() => {
  const val = senderPhone.value;
  if (!val) return '';
  if (val.length < 11) return '请输入11位手机号';
  if (!phoneReg.test(val)) return '手机号格式不正确';
  return '';
});

// 收信人手机号实时校验
const receiverPhoneError = computed(() => {
  const val = receiverPhone.value;
  if (!val) return '';
  if (val.length < 11) return '请输入11位手机号';
  if (!phoneReg.test(val)) return '手机号格式不正确';
  return '';
});

const regionText = computed(() => regionData.value.join(' '));
const regionDisplayText = computed(() => {
  if (selectedProvince.value && selectedCity.value && selectedDistrict.value) {
    // 直辖市显示"省 区"（跳过冗余的"市辖区"）；普通省份显示"省 市 区"
    if (municipalities.has(selectedProvince.value)) {
      return selectedProvince.value + ' ' + selectedDistrict.value;
    }
    return selectedProvince.value + ' ' + selectedCity.value + ' ' + selectedDistrict.value;
  }
  return '请选择所在地址';
});
const cityList = computed(() => selectedProvince.value ? getCities(selectedProvince.value) : []);
const districtList = computed(() => (selectedProvince.value && selectedCity.value) ? getDistricts(selectedProvince.value, selectedCity.value) : []);

// --- 事件方法 ---
const onRegionChange = (e) => {
  regionData.value = e.detail.value;
};

const openRegionPicker = () => {
  showRegionPicker.value = true;
  regionPickerStep.value = 'province';
};
const closeRegionPicker = () => {
  showRegionPicker.value = false;
};
const onProvinceSelect = (p) => {
  selectedProvince.value = p;
  selectedDistrict.value = '';
  if (municipalities.has(p)) {
    // 直辖市自动填充唯一的城市（如"市辖区"），直接跳到区县选择
    const cities = getCities(p);
    selectedCity.value = cities.length > 0 ? cities[0] : '';
    regionPickerStep.value = 'district';
  } else {
    selectedCity.value = '';
    regionPickerStep.value = 'city';
  }
};
const onCitySelect = (c) => {
  selectedCity.value = c;
  selectedDistrict.value = '';
  regionPickerStep.value = 'district';
};
const onDistrictSelect = (d) => {
  selectedDistrict.value = d;
  showRegionPicker.value = false;
};

const handleSubmit = () => {
  // 简单的表单验证
  if (!senderName.value || !receiverName.value) {
    uni.showToast({ title: '请完善必要信息', icon: 'none' });
    return;
  }
  // 手机号校验（必填 + 格式校验）
  const phoneReg = /^1[3-9]\d{9}$/;
  if (!senderPhone.value) {
    uni.showToast({ title: '请填写寄信人电话', icon: 'none' });
    return;
  }
  if (!phoneReg.test(senderPhone.value)) {
    uni.showToast({ title: '寄信人手机号格式不正确', icon: 'none' });
    return;
  }
  if (!receiverPhone.value) {
    uni.showToast({ title: '请填写收信人电话', icon: 'none' });
    return;
  }
  if (!phoneReg.test(receiverPhone.value)) {
    uni.showToast({ title: '收信人手机号格式不正确', icon: 'none' });
    return;
  }
  if (!selectedProvince.value || !selectedCity.value || !selectedDistrict.value) {
    uni.showToast({ title: '请选择完整的省市区', icon: 'none' });
    return;
  }

  uni.showLoading({ title: '正在生成...' });
  setTimeout(() => {
    uni.hideLoading();
    uni.removeStorageSync('currentLetterContent');
    uni.removeStorageSync('letterDraft');
    uni.showModal({
      title: '提示',
      content: '订单已生成！我们将为您寄出这份心意。',
      showCancel: false,
      success: () => {
        uni.reLaunch({ url: '/pages/index/index' });
      }
    });
  }, 1000);
};

const goBack = () => {
  // 返回写信页，保留写信页页面栈状态
  uni.navigateBack();
};
</script>

<style scoped lang="scss">
/* #ifdef H5 */
.h5-config-page {
  background-color: #f8fafc;
  min-height: 100vh;
}

/* 顶部导航栏 64px 毛玻璃 */
.h5-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  z-index: 100;
  background: rgba(248, 250, 252, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid #e2e8f0;
}

.h5-header-inner {
  max-width: 700px;
  margin: 0 auto;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.h5-back-btn {
  font-size: 16px;
  color: #6366f1;
  cursor: pointer;
  font-weight: 500;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.7;
  }
}

.h5-title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.h5-header-right {
  width: 80px;
}

.h5-scroll-content {
  height: 100vh;
  box-sizing: border-box;
  padding-top: 64px;
}

.h5-form-container {
  max-width: 700px;
  margin: 0 auto;
  padding: 24px;
  box-sizing: border-box;
}

/* Section 卡片 */
.h5-section {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  margin-bottom: 24px;
  padding: 28px;
}

.h5-section-title {
  font-size: 16px;
  font-weight: 600;
  color: #6366f1;
  margin-bottom: 20px;
  display: block;
}

/* 纸张选择 */
.h5-paper-scroll {
  white-space: nowrap;
  height: 160px;
}

.h5-paper-item {
  width: 140px;
  height: 140px;
  border-radius: 12px;
  overflow: hidden;
  display: inline-block;
  margin-right: 16px;
  border: 3px solid transparent;
  cursor: pointer;
  transition: border-color 0.2s ease, transform 0.2s ease;

  &:hover {
    transform: scale(1.02);
  }

  &.active {
    border-color: #6366f1;
  }

  &:last-child {
    margin-right: 0;
  }
}

.h5-paper-img {
  width: 100%;
  height: 100%;
  display: block;
}

/* 地址表单 */
.h5-form-row {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  font-size: 15px;
}

.h5-label {
  width: 80px;
  color: #0f172a;
  text-align: right;
  margin-right: 16px;
  font-weight: 500;
  flex-shrink: 0;
}

.h5-input-box {
  height: 44px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0 14px;
  font-size: 15px;
  background: #f8fafc;
  color: #0f172a;
  transition: border-color 0.2s ease, background 0.2s ease;
  box-sizing: border-box;

  &::placeholder {
    color: #94a3b8;
  }

  &:focus {
    outline: none;
    border-color: #6366f1;
    background: #ffffff;
  }
}

.h5-input-error {
  display: block;
  font-size: 13px;
  color: #ef4444;
  margin-top: 6px;
  padding-left: 14px;
}

.h5-flex-1 {
  flex: 1;
}

.h5-full-width {
  flex-wrap: nowrap;
}

.h5-region-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0 14px;
  height: 44px;
  cursor: pointer;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: #6366f1;
  }
}

.h5-region-text {
  font-size: 15px;
  color: #0f172a;
  flex: 1;

  &.placeholder {
    color: #94a3b8;
  }
}

.h5-dropdown-arrow {
  font-size: 14px;
  color: #94a3b8;
  margin-left: 8px;
}

/* 时间选择 */
.h5-time-options {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.h5-time-chip {
  padding: 10px 24px;
  background: #f1f5f9;
  border-radius: 24px;
  font-size: 14px;
  color: #64748b;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s ease;

  &:hover {
    background: #e2e8f0;
  }

  &.active {
    background: #6366f1;
    color: #ffffff;
    border-color: #6366f1;
  }
}

.h5-custom-time-chip {
  background: rgba(99, 102, 241, 0.08);
  color: #6366f1;
  font-weight: 500;

  &.active {
    background: #6366f1;
    color: #ffffff;
  }
}

/* 类型选择 */
.h5-type-grid {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.h5-type-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  padding: 0;
  overflow: hidden;
  box-sizing: border-box;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
  }

  &.active {
    border-color: #6366f1;
  }
}

.h5-type-img {
  width: 100%;
  height: 200px;
  background-color: #f8fafc;
  display: block;
}

.h5-type-name {
  font-size: 15px;
  font-weight: 500;
  color: #0f172a;
  text-align: center;
  padding: 14px 0;
}

/* Region Picker Modal (H5 centered) */
.h5-region-picker-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 200;
}

.h5-region-picker-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 460px;
  max-width: 90%;
  max-height: 70vh;
  background: #ffffff;
  border-radius: 20px;
  z-index: 201;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.h5-picker-popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.h5-picker-popup-title {
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  flex: 1;
}

.h5-picker-popup-back {
  font-size: 14px;
  color: #6366f1;
  padding: 6px 12px;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(99, 102, 241, 0.08);
  }
}

.h5-picker-popup-close {
  font-size: 18px;
  color: #94a3b8;
  padding: 4px 0 0 12px;
  cursor: pointer;

  &:hover {
    color: #0f172a;
  }
}

.h5-picker-scroll {
  flex: 1;
  overflow-y: auto;
  max-height: 400px;
}

.h5-picker-option {
  padding: 14px 24px;
  font-size: 15px;
  color: #334155;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: #f8fafc;
  }

  &.active {
    color: #6366f1;
    font-weight: 600;
    background: rgba(99, 102, 241, 0.04);
  }
}

/* Footer */
.h5-fixed-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid #e2e8f0;
  padding: 16px 24px;
  box-sizing: border-box;
  z-index: 99;
}

.h5-footer-inner {
  max-width: 700px;
  margin: 0 auto;
}

.h5-submit-btn {
  width: 100%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #ffffff;
  border-radius: 24px;
  font-size: 16px;
  border: none;
  height: 48px;
  line-height: 48px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);

  &::after {
    border: none;
  }

  &:hover {
    opacity: 0.9;
  }
}
/* #endif */

/* #ifdef MP-WEIXIN */
.mp-config-page {
  background-color: #f8fafc;
  min-height: 100vh;
}

/* 简洁头部 */
.mp-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
}

.mp-header-inner {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}

.mp-back-btn {
  font-size: 20px;
  color: #0f172a;
  width: 44px;
  height: 44px;
  line-height: 44px;
  text-align: center;
}

.mp-title {
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
}

.mp-header-right {
  width: 44px;
}

.mp-scroll-content {
  height: 100vh;
  box-sizing: border-box;
  padding-top: calc(var(--status-bar-height) + 44px);
}

/* Section 卡片 */
.mp-section {
  background: #ffffff;
  margin-bottom: 12px;
  padding: 16px;
}

.mp-section-title {
  font-size: 14px;
  font-weight: 600;
  color: #6366f1;
  margin-bottom: 14px;
  display: block;
}

/* 纸张选择 */
.mp-paper-scroll {
  white-space: nowrap;
  height: 120px;
}

.mp-paper-item {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  display: inline-block;
  margin-right: 12px;
  border: 2px solid transparent;

  &.active {
    border-color: #6366f1;
  }

  &:last-child {
    margin-right: 0;
  }
}

.mp-paper-img {
  width: 100%;
  height: 100%;
  display: block;
}

/* 地址表单 */
.mp-form-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
}

.mp-label {
  width: 70px;
  color: #0f172a;
  text-align: right;
  margin-right: 10px;
  flex-shrink: 0;
}

.mp-input-box {
  height: 44px;
  border: none;
  border-bottom: 1px solid #e2e8f0;
  padding: 0 8px;
  font-size: 14px;
  background: transparent;
  color: #0f172a;
  transition: border-color 0.2s;
  box-sizing: border-box;

  &::placeholder {
    color: #94a3b8;
  }

  &:focus {
    border-bottom: 1px solid #6366f1;
  }
}

.mp-input-error {
  display: block;
  font-size: 12px;
  color: #ef4444;
  margin-top: 4px;
  padding-left: 8px;
}

.mp-flex-1 {
  flex: 1;
}

.mp-full-width {
  flex-wrap: nowrap;
}

.mp-region-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0 12px;
  height: 44px;
}

.mp-region-text {
  font-size: 14px;
  color: #0f172a;
  flex: 1;

  &.placeholder {
    color: #94a3b8;
  }
}

.mp-dropdown-arrow {
  font-size: 12px;
  color: #94a3b8;
  margin-left: 8px;
}

/* 时间选择 */
.mp-time-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.mp-time-chip {
  padding: 8px 18px;
  background: #f1f5f9;
  border-radius: 20px;
  font-size: 13px;
  color: #64748b;

  &.active {
    background: #6366f1;
    color: #ffffff;
  }
}

.mp-custom-time-chip {
  background: rgba(99, 102, 241, 0.08);
  color: #6366f1;
  font-weight: 500;

  &.active {
    background: #6366f1;
    color: #ffffff;
  }
}

/* 类型选择 */
.mp-type-grid {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.mp-type-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0;
  overflow: hidden;
  box-sizing: border-box;

  &.active {
    border-color: #6366f1;
  }
}

.mp-type-img {
  width: 100%;
  height: 160px;
  background-color: #f8fafc;
  display: block;
}

.mp-type-name {
  font-size: 14px;
  font-weight: 500;
  color: #0f172a;
  text-align: center;
  padding: 8px 0;
}

/* Region Picker Popup (MP bottom sheet) */
.mp-region-picker-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.45);
  z-index: 200;
}

.mp-region-picker-popup {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: #ffffff;
  border-radius: 16px 16px 0 0;
  z-index: 201;
  padding-bottom: env(safe-area-inset-bottom);
}

.mp-picker-popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid #f1f5f9;
}

.mp-picker-popup-title {
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
  flex: 1;
}

.mp-picker-popup-back {
  font-size: 13px;
  color: #6366f1;
  padding: 4px 8px;
}

.mp-picker-popup-close {
  font-size: 18px;
  color: #94a3b8;
  padding: 0 0 0 12px;
}

.mp-picker-scroll {
  height: 320px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.mp-picker-option {
  padding: 13px 20px;
  font-size: 14px;
  color: #334155;
  border-bottom: 1px solid #f1f5f9;
  min-height: 44px;

  &:active {
    background: #f8fafc;
  }

  &.active {
    color: #6366f1;
    font-weight: 600;
  }
}

/* Footer */
.mp-fixed-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
  padding: 12px 16px;
  box-sizing: border-box;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  z-index: 99;
}

.mp-submit-btn {
  width: 100%;
  background: #6366f1;
  color: #ffffff;
  border-radius: 24px;
  font-size: 16px;
  border: none;
  height: 44px;
  line-height: 44px;
  font-weight: 600;

  &::after {
    border: none;
  }
}
/* #endif */
</style>
