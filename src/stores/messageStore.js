import { reactive } from 'vue';

// 模块级单例 — 页面销毁后模块依然存活，数据得以保留
const state = reactive({
  // 消息列表数据
  list: [],
  // 当前页码
  page: 1,
  // 是否已初始化（有缓存数据）
  hasCache: false,
  // 滚动位置（可选，方便后续还原滚动位置）
  scrollTop: 0
});

/**
 * 保存消息列表状态
 */
export function saveMessageState(list, page) {
  state.list = list.map(item => ({ ...item }));
  state.page = page;
  state.hasCache = true;
}

/**
 * 恢复消息列表状态（返回深拷贝副本，避免引用污染）
 */
export function restoreMessageState() {
  if (!state.hasCache) return null;
  return {
    list: state.list.map(item => ({
      ...item,
      replies: item.replies ? item.replies.map(r => ({ ...r })) : []
    })),
    page: state.page
  };
}

/**
 * 清空缓存（下拉刷新时调用）
 */
export function clearMessageCache() {
  state.list = [];
  state.page = 1;
  state.hasCache = false;
  state.scrollTop = 0;
}

/**
 * 是否有缓存数据
 */
export function hasMessageCache() {
  return state.hasCache;
}

export default state;
