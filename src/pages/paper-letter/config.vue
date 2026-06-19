<template>
  <view class="config-page">
    <!-- Header (fixed) -->
    <view class="header">
      <text class="back-icon" @click="goBack">&#10094;</text>
      <text class="title">纸质书信</text>
      <view style="width: 24px;"></view>
    </view>
    <scroll-view scroll-y class="scroll-content">

      <!-- Section 1: 选纸张 -->
      <view class="section card-section">
        <text class="section-title">请选择纸质信件</text>
        <scroll-view scroll-x class="paper-scroll" :show-scrollbar="false">
          <view v-for="(item, index) in paperOptions" :key="index" class="paper-item" :class="{ active: selectedPaper === index }" @click="selectedPaper = index">
            <img class="paper-img" :src="item" />
          </view>
        </scroll-view>
      </view>

      <!-- Section 2: 地址信息 -->
      <view class="section address-section">
        <text class="section-title">请填写地址</text>

        <!-- Sender Info -->
        <view class="form-row">
          <text class="label">寄信人</text>
          <input class="input-box flex-1" placeholder="请填写寄信人姓名" v-model="senderName" />
        </view>
        <view class="form-row">
          <text class="label">寄信电话</text>
          <view class="flex-1">
            <input class="input-box" style="width:100%" type="number" maxlength="11" placeholder="请填写寄信人电话" v-model="senderPhone" />
            <text v-if="senderPhoneError" class="input-error">{{ senderPhoneError }}</text>
          </view>
        </view>

        <!-- Receiver Info -->
        <view class="form-row">
          <text class="label">收信人</text>
          <input class="input-box flex-1" placeholder="请填写收信人姓名" v-model="receiverName" />
        </view>
        <view class="form-row">
          <text class="label">收信电话</text>
          <view class="flex-1">
            <input class="input-box" style="width:100%" type="number" maxlength="11" placeholder="请填写收信人电话" v-model="receiverPhone" />
            <text v-if="receiverPhoneError" class="input-error">{{ receiverPhoneError }}</text>
          </view>
        </view>
        <view class="form-row full-width">
          <text class="label">收信地址</text>
          <view class="region-trigger flex-1" @click="openRegionPicker">
            <text :class="['region-text', { placeholder: !selectedProvince }]">{{ regionDisplayText }}</text>
            <text class="dropdown-arrow">&#9662;</text>
          </view>
        </view>
        <view class="form-row full-width">
          <text class="label"></text>
          <input class="input-box flex-1" placeholder="请输入详细地址" v-model="detailAddress" />
        </view>

        <!-- Region Picker Popup -->
        <view class="region-picker-mask" v-if="showRegionPicker" @click="closeRegionPicker"></view>
        <view class="region-picker-popup" v-if="showRegionPicker">
          <view class="picker-popup-header">
            <text class="picker-popup-title" v-if="regionPickerStep === 'province'">选择省份</text>
            <text class="picker-popup-title" v-else-if="regionPickerStep === 'city'">选择城市 - {{ selectedProvince }}</text>
            <text class="picker-popup-title" v-else>{{ municipalities.has(selectedProvince) ? '选择区县 - ' + selectedProvince : '选择区县 - ' + selectedCity }}</text>
            <text class="picker-popup-back" v-if="regionPickerStep === 'city'" @click="regionPickerStep = 'province'">&#10094; 返回</text>
            <text class="picker-popup-back" v-else-if="regionPickerStep === 'district'" @click="regionPickerStep = municipalities.has(selectedProvince) ? 'province' : 'city'">&#10094; 返回</text>
            <text class="picker-popup-close" @click="closeRegionPicker">&#10005;</text>
          </view>
          <view class="picker-scroll">
            <view v-if="regionPickerStep === 'province'" :key="'step-province'">
              <view v-for="p in provinceList" :key="p" class="picker-option" :class="{ active: selectedProvince === p }" @click="onProvinceSelect(p)">{{ p }}</view>
            </view>
            <view v-else-if="regionPickerStep === 'city'" :key="'step-city'">
              <view v-for="c in cityList" :key="c" class="picker-option" :class="{ active: selectedCity === c }" @click="onCitySelect(c)">{{ c }}</view>
            </view>
            <view v-else :key="'step-district'">
              <view v-for="d in districtList" :key="d" class="picker-option" :class="{ active: selectedDistrict === d }" @click="onDistrictSelect(d)">{{ d }}</view>
            </view>
          </view>
        </view>
      </view>

      <!-- Section 3: 时间选择 -->
      <view class="section card-section">
        <text class="section-title">请选择寄出时间</text>
        <view class="time-options">
          <view v-for="idx in (timeOptions.length - 1)" :key="idx"
            class="time-chip"
            :class="{ active: selectedTime === idx - 1 }"
            @click="selectedTime = idx - 1">
            {{ timeOptions[idx - 1] }}
          </view>
          <!-- 自定义日期芯片：包裹 picker，点击触发原生日期选择 -->
          <picker mode="date" :value="customTime || ''" :start="todayStr" @change="onCustomTimeChange">
            <view class="time-chip custom-time-chip" :class="{ active: selectedTime === timeOptions.length - 1 }">
              {{ customTime || '其他' }}
            </view>
          </picker>
        </view>
      </view>

      <!-- Section 4: 类型选择 -->
      <view class="section card-section type-section">
        <text class="section-title">信件类型</text>
        <view class="type-grid">
          <view class="type-card" :class="{ active: selectedType === 'basic' }" @click="selectedType='basic'">
            <img class="type-img" :src="letter001" />
            <text class="type-name">基础版</text>
          </view>
          <view class="type-card" :class="{ active: selectedType === 'gift' }" @click="selectedType='gift'">
            <img class="type-img" :src="letter005" />
            <text class="type-name">礼盒版</text>
          </view>
        </view>
      </view>

      <view style="height: 100px;"></view>
    </scroll-view>

    <!-- Footer Submit -->
    <view class="fixed-footer">
      <button class="submit-btn" @click="handleSubmit">确认提交</button>
    </view>
  </view>
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
    // 直辖市显示“省 区”（跳过冗余的“市辖区”）；普通省份显示“省 市 区”
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
    // 直辖市自动填充唯一的城市（如“市辖区”），直接跳到区县选择
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
  // 强制返回写信页，清除当前配置页栈帧，避免重复压栈
  uni.reLaunch({ url: '/pages/write-letter/index' });
};
</script>

<style scoped lang="scss">
.config-page {
  background-color: #f5f5f5; /* Slightly greyish background like screenshot */
  min-height: 100vh;
}

.safe-area-top {
  padding-top: 16px;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  height: 48px;
  background: #fff;
  z-index: 100;
  .title {
    font-size: 18px;
    font-weight: 600;
  }
  .back-icon {
    font-size: 24px;
    padding: 8px;
  }
}

.scroll-content {
  height: 100vh;
  box-sizing: border-box;
  padding-top: 60px;
}

/* Card Style for Sections */
.section {
  background: #fff;
  margin-bottom: 12px;
  padding: 16px;
  &.card-section {
    border-radius: 0; // Reset border radius to match full width cards or keep it small based on design system. Screenshot shows full white cards on light grey bg.
    margin-left: 0;
    margin-right: 0;
    box-shadow: none;
  }
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #4caf50;
  margin-bottom: 16px;
  display: block;
}

/* --- Paper Selection Styles --- */
.paper-scroll {
  white-space: nowrap;
  height: 140px;
  margin-top: -5px; // Adjust visually
}

.paper-item {
  width: 140px;
  height: 140px;
  border-radius: 8px;
  overflow: hidden;
  display: inline-block;
  margin-right: 12px;
  border: 2px solid transparent;
  &.active {
    border-color: #4caf50;
    transform: scale(0.98);
  }
  &:last-child {
    margin-right: 0;
  }
}

.paper-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* --- Address Form Styles --- */
.address-section {
  .form-row {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    font-size: 14px;
  }

  .label {
    width: 70px;
    color: #333;
    text-align: right;
    margin-right: 10px;
  }

  .input-box {
    height: 40px;
    border: none;
    border-bottom: 1px solid #eee;
    padding: 0 8px;
    font-size: 14px;
    background: transparent;
    transition: all 0.2s;

    &::placeholder {
      color: #999;
    }

    &:focus {
      border-bottom: 1px solid #4caf50;
    }
  }

  .input-error {
    display: block;
    font-size: 12px;
    color: #f44336;
    margin-top: 4px;
    padding-left: 8px;
  }

  .flex-1 {
    flex: 1;
  }

  .full-width {
    flex-wrap: nowrap;
  }

  .address-wrapper {
    position: relative;
  }
}

/* --- Time Options Styles --- */
.time-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.time-chip {
  padding: 6px 18px;
  background: #F0F0F0;
  border-radius: 20px;
  font-size: 13px;
  color: #666;
  &.active {
    background: #4caf50;
    color: #fff;
  }
}

.custom-time-chip {
  background: #e8f5e9;
  color: #4caf50;
  font-weight: 500;
  &.active {
    background: #4caf50;
    color: #fff;
  }
}

/* --- Letter Type Styles --- */

.type-grid {
  display: flex;
  justify-content: space-between;
}

.type-card {
  width: 48%;
  display: flex;
  flex-direction: column;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 0;
  overflow: hidden;
  box-sizing: border-box;
  &.active {
    border-color: #4caf50;
  }
}

.type-img {
  width: 100%;
  height: 180px;
  background-color: #f9f9f9;
  object-fit: cover;
  display: block;
}

.type-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  text-align: center;
  padding: 8px 0;
}

/* --- Footer --- */

/* --- Region Picker Dropdown --- */
.region-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 10px 12px;
  cursor: pointer;
}

.region-text {
  font-size: 14px;
  color: #333;
  flex: 1;
  &.placeholder {
    color: #999;
  }
}

.dropdown-arrow {
  font-size: 12px;
  color: #999;
  margin-left: 8px;
}

.region-picker-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.45);
  z-index: 200;
}

.region-picker-popup {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: #fff;
  border-radius: 16px 16px 0 0;
  z-index: 201;
  padding-bottom: env(safe-area-inset-bottom);
}

.picker-popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.picker-popup-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  flex: 1;
}

.picker-popup-back {
  font-size: 13px;
  color: #4caf50;
  padding: 4px 8px;
}

.picker-popup-close {
  font-size: 18px;
  color: #aaa;
  padding: 0 0 0 12px;
}

.picker-scroll {
  height: 320px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.picker-option {
  padding: 13px 20px;
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #f5f5f5;
  &:active {
    background: #f5f5f5;
  }
  &.active {
    color: #4caf50;
    font-weight: 600;
  }
}

/* --- Footer --- */
.fixed-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: #fff;
  padding: 12px 24px;
  box-sizing: border-box;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  z-index: 99;
}

.submit-btn {
  background: #4caf50;
  color: #fff;
  border-radius: 50px;
  font-size: 16px;
  border: none;
  height: 44px;
  line-height: 44px;
  font-weight: 600;
  &::after {
    border: none;
  }
}
</style>