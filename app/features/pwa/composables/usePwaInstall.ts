type Platform = 'ios' | 'android' | 'windows' | 'macos' | 'unknown';
type Browser = 'chrome' | 'safari' | 'firefox' | 'edge' | 'samsung' | 'unknown';

export interface InstallContext {
  platform: Platform;
  browser: Browser;
}
export function usePwaInstall() {
  const { $pwa } = useNuxtApp();

  const context = computed<InstallContext>(() => ({
    platform: detectPlatform(),
    browser: detectBrowser(),
  }));

  // Используем встроенные свойства из $pwa
  const isInstalled = computed(() => $pwa?.isPWAInstalled ?? false);
  const canInstallNatively = computed(() => $pwa?.showInstallPrompt ?? false);

  // Показывать кнопку: не установлено И (есть нативный промпт ИЛИ можно показать инструкции)
  const canInstall = computed(() => !isInstalled.value);

  function getInstructions(): string {
    const { platform, browser } = context.value;

    if (platform === 'ios') {
      return 'Нажмите кнопку "Поделиться" (□↑) внизу экрана, затем выберите "На экран Домой"';
    }

    if (platform === 'android') {
      if (browser === 'chrome' || browser === 'samsung') {
        return 'Откройте меню браузера (⋮) и выберите "Добавить на главный экран" или "Установить приложение"';
      }
      if (browser === 'firefox') {
        return 'Откройте меню браузера (⋮) и выберите "Установить"';
      }
    }

    if (platform === 'macos' || platform === 'windows') {
      if (browser === 'chrome') {
        return 'Нажмите на иконку установки (⊕) в адресной строке или откройте меню (⋮) → "Установить приложение"';
      }
      if (browser === 'edge') {
        return 'Нажмите на иконку установки в адресной строке или откройте меню (···) → "Приложения" → "Установить этот сайт как приложение"';
      }
      if (browser === 'safari') {
        return 'В Safari на macOS: Файл → "Добавить в Dock"';
      }
    }

    return 'Откройте меню браузера и найдите опцию "Установить" или "Добавить на главный экран"';
  }

  async function install(): Promise<{ installed: boolean; showInstructions: boolean }> {
    if (isInstalled.value) {
      return { installed: true, showInstructions: false };
    }

    // Если доступен нативный промпт — используем его
    if (canInstallNatively.value && $pwa?.install) {
      try {
        await $pwa.install();
        return { installed: true, showInstructions: false };
      } catch {
        // Пользователь отменил или ошибка — показываем инструкции
        return { installed: false, showInstructions: true };
      }
    }

    // Нативный промпт недоступен — показываем инструкции
    return { installed: false, showInstructions: true };
  }

  function cancelInstall(): void {
    $pwa?.cancelInstall?.();
  }

  return {
    context,
    isInstalled,
    canInstall,
    canInstallNatively,
    getInstructions,
    install,
    cancelInstall,
  };
}

function detectPlatform(): Platform {
  if (import.meta.server) return 'unknown';

  const ua = navigator.userAgent;

  if (!navigator) return 'unknown';

  if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
    return 'ios';
  }
  if (/Android/.test(ua)) return 'android';
  if (/Win/.test(ua)) return 'windows';
  if (/Mac/.test(ua)) return 'macos';

  return 'unknown';
}

function detectBrowser(): Browser {
  if (import.meta.server) return 'unknown';

  const ua = navigator.userAgent;

  if (/SamsungBrowser/.test(ua)) return 'samsung';
  if (/Edg/.test(ua)) return 'edge';
  if (/Chrome/.test(ua)) return 'chrome';
  if (/Safari/.test(ua)) return 'safari';
  if (/Firefox/.test(ua)) return 'firefox';

  return 'unknown';
}
