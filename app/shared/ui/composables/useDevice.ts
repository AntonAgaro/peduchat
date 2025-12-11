export const useDevice = () => {
  const userAgent = computed(() => {
    return import.meta.server ? useRequestHeaders()['user-agent'] || '' : navigator.userAgent;
  });

  const isTablet = computed(() => {
    return /iPad|Android(?!.*Mobile)|Tablet/i.test(userAgent.value);
  });

  const isMobile = computed(() => {
    return /iPhone|iPod|Android.*Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent.value);
  });

  const isDesktop = computed(() => {
    return !isMobile.value && !isTablet.value;
  });

  const deviceType = computed(() => {
    if (isMobile.value) return 'mobile';
    if (isTablet.value) return 'tablet';
    return 'desktop';
  });

  return {
    isMobile,
    isTablet,
    isDesktop,
    deviceType,
  };
};
