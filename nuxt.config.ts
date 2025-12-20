// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    process.env.APP_ENV === 'dev' ? '@nuxt/eslint' : '',
    '@nuxt/ui',
    '@vite-pwa/nuxt',
    process.env.APP_ENV === 'dev' ? '@nuxt/test-utils' : '',
  ],
  css: ['~/assets/css/main.css'],
  nitro: {
    experimental: {
      websocket: true,
    },
  },
  routeRules: {
    '/': { swr: 60 * 5 },
    '/room/**': { ssr: false },
  },
  pwa: {
    manifest: {
      name: 'PeduChat',
      short_name: 'PeduChat',
      description: 'Видеочат без регистрации',
      start_url: '/',
      display: 'standalone',
      background_color: '#000000',
      theme_color: '#667EEA',
      icons: [
        { src: '/icons/192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/512.png', sizes: '512x512', type: 'image/png' },
      ],
    },
    workbox: {
      // кеширование ассетов
      globPatterns: ['**/*.{js,css,html,png,svg}'],
    },
  },
  app: {
    head: {
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'PeduChat - бесплатный видеочат без регистрации',
            applicationCategory: 'CommunicationApplication',
            operatingSystem: 'Web',
            description: 'Бесплатный видеочат без регистрации для быстрых онлайн встреч',
          }),
        },
        {
          innerHTML: `
            
                (function(m,e,t,r,i,k,a){
                    m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                    m[i].l=1*new Date();
                    for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
                    k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
                })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=105568784', 'ym');
            
                ym(105568784, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", accurateTrackBounce:true, trackLinks:true});
            
            `,
          type: 'text/javascript',
        },
        {
          src: 'https://www.googletagmanager.com/gtag/js?id=G-1EXFQZ4D29',
          async: true,
        },
        {
          innerHTML: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-1EXFQZ4D29');
          `,
        },
      ],
      noscript: [
        {
          innerHTML: `<div><img src="https://mc.yandex.ru/watch/105568784" style="position:absolute; left:-9999px;" alt="" /></div>`,
        },
      ],
    },
  },
  //Для теста на локалхосте
  // devServer: {
  //   host: '0.0.0.0',
  //   https: true,
  // },
});
